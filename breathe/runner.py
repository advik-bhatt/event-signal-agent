from __future__ import annotations

import json
import shlex
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .config import AgentCommand


@dataclass
class AgentRun:
    case_id: str
    input_text: str
    return_code: int
    stdout: str
    stderr: str
    latency_ms: float
    timed_out: bool = False

    @property
    def output_text(self) -> str:
        return self.stdout.strip()


def run_agent(command: AgentCommand, case: dict[str, Any], cwd: Path) -> AgentRun:
    rendered = command.command.replace("{python}", sys.executable)
    args = shlex.split(rendered)
    payload = {
        "case_id": case.get("id"),
        "input": case.get("input", ""),
        "sources": case.get("sources", []),
        "metadata": case.get("metadata", {}),
    }

    start = time.perf_counter()
    try:
        proc = subprocess.run(
            args,
            input=json.dumps(payload),
            cwd=str(cwd),
            text=True,
            capture_output=True,
            timeout=command.timeout_seconds,
        )
        latency_ms = (time.perf_counter() - start) * 1000
        return AgentRun(
            case_id=str(case.get("id")),
            input_text=str(case.get("input", "")),
            return_code=proc.returncode,
            stdout=proc.stdout,
            stderr=proc.stderr,
            latency_ms=latency_ms,
            timed_out=False,
        )
    except subprocess.TimeoutExpired as exc:
        latency_ms = (time.perf_counter() - start) * 1000
        return AgentRun(
            case_id=str(case.get("id")),
            input_text=str(case.get("input", "")),
            return_code=124,
            stdout=exc.stdout or "",
            stderr=exc.stderr or f"Timed out after {command.timeout_seconds}s",
            latency_ms=latency_ms,
            timed_out=True,
        )
