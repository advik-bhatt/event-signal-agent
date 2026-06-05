#!/usr/bin/env bash
set -euo pipefail

mkdir -p reports

echo "== Breathe demo: first run the fragile agent =="
breathe run examples/support-agent/breathe-buggy.yaml \
  --report reports/buggy-agent-report.md \
  --json-report reports/buggy-agent-report.json \
  --no-fail

echo ""
echo "== Breathe demo: now run the fixed agent =="
breathe run examples/support-agent/breathe-fixed.yaml \
  --report reports/fixed-agent-report.md \
  --json-report reports/fixed-agent-report.json

echo ""
echo "Reports written:"
echo "- reports/buggy-agent-report.md"
echo "- reports/fixed-agent-report.md"
