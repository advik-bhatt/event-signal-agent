from __future__ import annotations

from breathe.config import load_spec
from breathe.run import run_spec


def test_buggy_agent_fails_contract() -> None:
    spec = load_spec("examples/support-agent/breathe-buggy.yaml")
    report = run_spec(spec)
    assert report.status == "FAIL"
    assert report.failed_cases >= 1
    failure_names = [check.name for result in report.results for check in result.failures]
    assert "requires_valid_citation" in failure_names


def test_fixed_agent_passes_contract() -> None:
    spec = load_spec("examples/support-agent/breathe-fixed.yaml")
    report = run_spec(spec)
    assert report.status == "PASS"
    assert report.passed_cases == report.total_cases
    assert report.average_score == 100.0
