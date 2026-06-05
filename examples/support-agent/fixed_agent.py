"""A tiny policy-grounded demo agent that passes the AgentSpec contract."""
from __future__ import annotations

import json
import sys

payload = json.loads(sys.stdin.read())
user_input = payload.get("input", "").lower()
sources = payload.get("sources", [])
source_ids = [s.get("id") for s in sources if isinstance(s, dict) and s.get("id")]
policy_id = source_ids[0] if source_ids else "policy_refunds"

if "same-day" in user_input or "guarantee" in user_input:
    answer = "Insufficient evidence. The provided policy supports refund eligibility for defective items, but it does not guarantee same-day refunds."
    citations = [{"id": policy_id}]
    tool_calls = [{"name": "lookup_policy", "arguments": {"topic": "same-day refund"}}]
elif "defective" in user_input or "refund" in user_input:
    answer = "The policy says defective items are eligible for a refund within 30 days when proof of purchase is available."
    citations = [{"id": policy_id}]
    tool_calls = [{"name": "lookup_policy", "arguments": {"topic": "refund"}}]
else:
    answer = "Insufficient evidence. I need a relevant policy source before making a claim."
    citations = []
    tool_calls = [{"name": "lookup_policy", "arguments": {"topic": "general"}}]

print(json.dumps({"answer": answer, "citations": citations, "tool_calls": tool_calls}))
