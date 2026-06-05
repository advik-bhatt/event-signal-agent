VENV      = .venv
PY        = $(VENV)/bin/python3
SPEC      = $(VENV)/bin/breathe
PYTEST    = $(VENV)/bin/pytest

.PHONY: demo install test clean

$(VENV)/bin/activate:
	python3 -m venv $(VENV) --without-pip
	$(PY) -m ensurepip --upgrade
	$(PY) -m pip install --upgrade pip -q
	$(PY) -m pip install -e ".[dev]" -q

install: $(VENV)/bin/activate

# ─── One command — works with or without an API key ────────────────────────
demo: install
	@mkdir -p reports
	@if [ -n "$$OPENROUTER_API_KEY" ] || [ -n "$$ANTHROPIC_API_KEY" ]; then \
		$(PY) -m pip install anthropic -q; \
	fi
	@echo ""
	@echo "══════════════════════════════════════════════════"
	@echo "  Breathe · contract testing for AI agents"
	@echo "══════════════════════════════════════════════════"
	@echo ""
	@echo "▶  1 / 3  — fragile agent (expect FAIL)"
	@echo ""
	@$(SPEC) run examples/support-agent/breathe-buggy.yaml \
		--report reports/buggy-report.md \
		--json-report reports/buggy-report.json \
		--no-fail
	@echo ""
	@echo "▶  2 / 3  — fixed agent (expect PASS)"
	@echo ""
	@$(SPEC) run examples/support-agent/breathe-fixed.yaml \
		--report reports/fixed-report.md \
		--json-report reports/fixed-report.json
	@echo ""
	@if [ -n "$$OPENROUTER_API_KEY" ] || [ -n "$$ANTHROPIC_API_KEY" ]; then \
		echo "▶  3 / 3  — NYTechWeek event scout — live Claude"; \
	else \
		echo "▶  3 / 3  — NYTechWeek event scout — demo mode"; \
	fi
	@echo ""
	@cd examples/event-scout && ../../$(SPEC) run agentspec.yaml \
		--report ../../reports/event-scout-report.md \
		--json-report ../../reports/event-scout-report.json
	@echo ""
	@echo "──────────────────────────────────────────────────"
	@if [ -n "$$OPENROUTER_API_KEY" ] || [ -n "$$ANTHROPIC_API_KEY" ]; then \
		echo "  Rank events for your interests (opens browser):"; \
		echo "  .venv/bin/breathe rank "AI agents, hiring engineers""; \
	else \
		echo "  To rank events with live Claude:"; \
		echo "  export OPENROUTER_API_KEY=sk-or-... && make demo"; \
		echo "  (or: ANTHROPIC_API_KEY=sk-ant-...)"; \
	fi
	@echo "──────────────────────────────────────────────────"
	@echo ""

test: install
	$(PYTEST) -q

clean:
	rm -rf $(VENV) reports/__pycache__
