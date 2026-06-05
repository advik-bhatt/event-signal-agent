from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path

from .checks import CaseResult
from .config import AgentSpec


@dataclass
class SpecRunReport:
    agent_name: str
    spec_path: str
    total_cases: int
    passed_cases: int
    failed_cases: int
    average_score: float
    status: str
    results: list[CaseResult]

    def to_jsonable(self) -> dict:
        data = asdict(self)
        return data


def build_report(spec: AgentSpec, results: list[CaseResult]) -> SpecRunReport:
    total = len(results)
    passed = sum(1 for r in results if r.passed)
    failed = total - passed
    avg = round(sum(r.score for r in results) / total, 1) if total else 0.0
    return SpecRunReport(
        agent_name=spec.agent.name,
        spec_path=str(spec.path),
        total_cases=total,
        passed_cases=passed,
        failed_cases=failed,
        average_score=avg,
        status="PASS" if failed == 0 else "FAIL",
        results=results,
    )


def write_json_report(report: SpecRunReport, path: str | Path) -> Path:
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report.to_jsonable(), indent=2), encoding="utf-8")
    return out


def write_markdown_report(report: SpecRunReport, path: str | Path) -> Path:
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    lines: list[str] = []
    lines.append("# AgentSpec Eval Report")
    lines.append("")
    lines.append(f"**Agent:** {report.agent_name}")
    lines.append(f"**Status:** `{report.status}`")
    lines.append(f"**Cases:** {report.total_cases}")
    lines.append(f"**Passed:** {report.passed_cases}")
    lines.append(f"**Failed:** {report.failed_cases}")
    lines.append(f"**Average score:** {report.average_score}/100")
    lines.append("")
    lines.append("## Case summary")
    lines.append("")
    lines.append("| Case | Status | Score | Latency |")
    lines.append("|---|---:|---:|---:|")
    for result in report.results:
        status = "PASS" if result.passed else "FAIL"
        lines.append(f"| `{result.case_id}` | {status} | {result.score}/100 | {result.latency_ms:.1f}ms |")
    lines.append("")

    failures = [r for r in report.results if not r.passed]
    if failures:
        lines.append("## Failures")
        lines.append("")
        for result in failures:
            lines.append(f"### `{result.case_id}`")
            lines.append("")
            lines.append(f"**Input:** {result.input_text}")
            lines.append("")
            for check in result.failures:
                lines.append(f"- **{check.name}:** {check.detail}")
            lines.append("")
            if result.stdout:
                lines.append("**Agent output:**")
                lines.append("")
                lines.append("```json")
                lines.append(result.stdout)
                lines.append("```")
                lines.append("")
    else:
        lines.append("## Failures")
        lines.append("")
        lines.append("No failures.")
        lines.append("")

    lines.append("## Why this matters")
    lines.append("")
    lines.append(
        "AgentSpec turns an AI agent prompt/tool contract into repeatable tests. "
        "A demo can work once; this report shows whether the behavior survives changes."
    )
    lines.append("")
    out.write_text("\n".join(lines), encoding="utf-8")
    return out
