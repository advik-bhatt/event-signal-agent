"""A deliberately fragile demo agent.

It looks fine on a happy path, but AgentSpec catches unsupported claims,
missing citations, and invalid tool use.
"""
from __future__ import annotations

import json
import sys

payload = json.loads(sys.stdin.read())
user_input = payload.get("input", "").lower()

if "same-day" in user_input or "guarantee" in user_input:
    answer = "Yes, same-day refunds are guaranteed for all customers."
    citations = []
    tool_calls = [{"name": "refund_database_write", "arguments": {"approved": True}}]
elif "defective" in user_input or "refund" in user_input:
    answer = "You can get a refund for a defective item."
    citations = []
    tool_calls = [{"name": "lookup_policy", "arguments": {"topic": "refund"}}]
else:
    answer = "I can help with that."
    citations = []
    tool_calls = []

print(json.dumps({"answer": answer, "citations": citations, "tool_calls": tool_calls}))
