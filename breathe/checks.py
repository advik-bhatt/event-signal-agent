from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any

from .runner import AgentRun


@dataclass
class CheckResult:
    name: str
    passed: bool
    detail: str


@dataclass
class CaseResult:
    case_id: str
    input_text: str
    passed: bool
    score: float
    latency_ms: float
    stdout: str
    stderr: str
    checks: list[CheckResult] = field(default_factory=list)

    @property
    def failures(self) -> list[CheckResult]:
        return [c for c in self.checks if not c.passed]


def _lower_blob(value: Any) -> str:
    if isinstance(value, str):
        return value.lower()
    try:
        return json.dumps(value, sort_keys=True).lower()
    except TypeError:
        return str(value).lower()


def _parse_json(text: str) -> tuple[dict[str, Any] | None, str | None]:
    try:
        value = json.loads(text)
    except json.JSONDecodeError as exc:
        return None, str(exc)
    if not isinstance(value, dict):
        return None, "Agent output JSON must be an object."
    return value, None


def _citation_ids(case: dict[str, Any]) -> set[str]:
    ids: set[str] = set()
    for source in case.get("sources", []) or []:
        sid = source.get("id") if isinstance(source, dict) else None
        if sid:
            ids.add(str(sid))
    return ids


def _tool_names(output: dict[str, Any] | None) -> list[str]:
    if not output:
        return []
    raw = output.get("tool_calls") or []
    names: list[str] = []
    if not isinstance(raw, list):
        return names
    for item in raw:
        if isinstance(item, str):
            names.append(item)
        elif isinstance(item, dict):
            if item.get("name"):
                names.append(str(item["name"]))
            elif item.get("tool"):
                names.append(str(item["tool"]))
    return names


def evaluate_case(run: AgentRun, case: dict[str, Any], contract: dict[str, Any]) -> CaseResult:
    checks: list[CheckResult] = []
    expected = case.get("expected") or {}
    output_policy = (contract.get("output") or {}) if isinstance(contract, dict) else {}
    blob = _lower_blob(run.output_text)

    checks.append(
        CheckResult(
            "agent_exit_code",
            run.return_code == 0,
            "agent exited successfully" if run.return_code == 0 else f"agent exited with {run.return_code}: {run.stderr.strip()}",
        )
    )
    checks.append(
        CheckResult(
            "timeout",
            not run.timed_out,
            "agent completed before timeout" if not run.timed_out else "agent timed out",
        )
    )

    parsed: dict[str, Any] | None = None
    if output_policy.get("json") or expected.get("json"):
        parsed, error = _parse_json(run.output_text)
        checks.append(
            CheckResult(
                "valid_json",
                parsed is not None,
                "output is valid JSON object" if parsed is not None else f"invalid JSON: {error}",
            )
        )
    else:
        parsed, _ = _parse_json(run.output_text)

    if parsed is not None:
        for field in output_policy.get("required_fields", []) or []:
            checks.append(
                CheckResult(
                    f"required_field:{field}",
                    field in parsed,
                    f"found required field '{field}'" if field in parsed else f"missing required field '{field}'",
                )
            )

    for needle in expected.get("contains", []) or []:
        n = str(needle).lower()
        checks.append(
            CheckResult(
                f"contains:{needle}",
                n in blob,
                f"found '{needle}'" if n in blob else f"missing '{needle}'",
            )
        )

    forbidden = []
    forbidden.extend(expected.get("forbids", []) or [])
    forbidden.extend(contract.get("must_not", []) or [])
    for needle in forbidden:
        n = str(needle).lower()
        checks.append(
            CheckResult(
                f"forbids:{needle}",
                n not in blob,
                f"did not contain forbidden phrase '{needle}'" if n not in blob else f"contained forbidden phrase '{needle}'",
            )
        )

    if expected.get("requires_citation"):
        valid_ids = _citation_ids(case)
        citations = []
        if parsed is not None:
            raw_citations = parsed.get("citations") or []
            if isinstance(raw_citations, list):
                citations = [str(c.get("id") if isinstance(c, dict) else c) for c in raw_citations]
        has_citation = bool(citations)
        all_valid = has_citation and all(c in valid_ids for c in citations)
        checks.append(
            CheckResult(
                "requires_valid_citation",
                all_valid,
                f"valid citations: {citations}" if all_valid else f"expected citation id from {sorted(valid_ids)}, got {citations}",
            )
        )

    allowed_tools = set(str(t) for t in contract.get("allowed_tools", []) or [])
    calls = _tool_names(parsed)
    if expected.get("allowed_tools_only") or allowed_tools:
        invalid = [c for c in calls if c not in allowed_tools]
        checks.append(
            CheckResult(
                "allowed_tools_only",
                not invalid,
                "all tool calls are allowed" if not invalid else f"invalid tool calls: {invalid}; allowed: {sorted(allowed_tools)}",
            )
        )

    for tool in expected.get("must_call_tools", []) or []:
        checks.append(
            CheckResult(
                f"must_call_tool:{tool}",
                str(tool) in calls,
                f"called '{tool}'" if str(tool) in calls else f"did not call required tool '{tool}'",
            )
        )

    max_latency_ms = expected.get("max_latency_ms") or contract.get("max_latency_ms")
    if max_latency_ms:
        checks.append(
            CheckResult(
                "max_latency_ms",
                run.latency_ms <= float(max_latency_ms),
                f"latency {run.latency_ms:.1f}ms <= {float(max_latency_ms):.1f}ms"
                if run.latency_ms <= float(max_latency_ms)
                else f"latency {run.latency_ms:.1f}ms exceeded {float(max_latency_ms):.1f}ms",
            )
        )

    passed_count = sum(1 for c in checks if c.passed)
    score = round((passed_count / len(checks)) * 100, 1) if checks else 0.0
    passed = all(c.passed for c in checks)
    return CaseResult(
        case_id=str(case.get("id")),
        input_text=str(case.get("input", "")),
        passed=passed,
        score=score,
        latency_ms=run.latency_ms,
        stdout=run.stdout.strip(),
        stderr=run.stderr.strip(),
        checks=checks,
    )
