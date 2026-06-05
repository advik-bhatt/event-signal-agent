from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


class ConfigError(ValueError):
    pass


@dataclass(frozen=True)
class AgentCommand:
    name: str
    command: str
    timeout_seconds: int


@dataclass(frozen=True)
class AgentSpec:
    path: Path
    root: Path
    raw: dict[str, Any]
    agent: AgentCommand
    contract: dict[str, Any]
    cases: list[dict[str, Any]]


def load_spec(path: str | Path) -> AgentSpec:
    spec_path = Path(path).expanduser().resolve()
    if not spec_path.exists():
        raise ConfigError(f"Spec file not found: {spec_path}")
    with spec_path.open("r", encoding="utf-8") as f:
        raw = yaml.safe_load(f) or {}

    if not isinstance(raw, dict):
        raise ConfigError("Spec file must contain a YAML mapping at the root.")

    agent_raw = raw.get("agent")
    if not isinstance(agent_raw, dict):
        raise ConfigError("Spec is missing required 'agent' mapping.")

    name = str(agent_raw.get("name") or "unnamed-agent")
    command = agent_raw.get("command")
    if not command:
        raise ConfigError("Spec is missing agent.command.")

    timeout = int(agent_raw.get("timeout_seconds", 20))
    cases = raw.get("cases")
    if not isinstance(cases, list) or not cases:
        raise ConfigError("Spec must include at least one case under 'cases'.")

    for case in cases:
        if not isinstance(case, dict) or not case.get("id") or "input" not in case:
            raise ConfigError("Every case must be a mapping with id and input.")

    return AgentSpec(
        path=spec_path,
        root=spec_path.parent,
        raw=raw,
        agent=AgentCommand(name=name, command=str(command), timeout_seconds=timeout),
        contract=raw.get("contract") or {},
        cases=cases,
    )
