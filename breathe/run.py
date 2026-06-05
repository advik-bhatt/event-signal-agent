from __future__ import annotations

from .checks import CaseResult, evaluate_case
from .config import AgentSpec
from .report import SpecRunReport, build_report
from .runner import run_agent


def run_spec(spec: AgentSpec) -> SpecRunReport:
    results: list[CaseResult] = []
    for case in spec.cases:
        run = run_agent(spec.agent, case, spec.root)
        results.append(evaluate_case(run, case, spec.contract))
    return build_report(spec, results)
