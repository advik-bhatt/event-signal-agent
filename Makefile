VENV     = .venv
PYTHON   = $(VENV)/bin/python
PIP      = $(VENV)/bin/pip
SPEC     = $(VENV)/bin/agentspec
PYTEST   = $(VENV)/bin/pytest

.PHONY: demo install test clean

$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(PIP) install -e ".[dev]" -q

install: $(VENV)/bin/activate

demo: install
	@mkdir -p reports
	@echo ""
	@echo "══════════════════════════════════════════"
	@echo "  AgentSpec — contract testing for agents"
	@echo "══════════════════════════════════════════"
	@echo ""
	@echo "▶  Step 1: run the FRAGILE agent (expect FAIL)"
	@echo ""
	@$(SPEC) run examples/support-agent/agentspec-buggy.yaml \
		--report reports/buggy-report.md \
		--json-report reports/buggy-report.json \
		--no-fail
	@echo ""
	@echo "▶  Step 2: run the FIXED agent (expect PASS)"
	@echo ""
	@$(SPEC) run examples/support-agent/agentspec-fixed.yaml \
		--report reports/fixed-report.md \
		--json-report reports/fixed-report.json
	@echo ""
	@echo "Reports → reports/buggy-report.md"
	@echo "         reports/fixed-report.md"

test: install
	$(PYTEST) -q

clean:
	rm -rf $(VENV) reports/__pycache__
