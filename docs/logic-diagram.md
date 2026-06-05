# AgentSpec logic diagram

```text
breathe.yaml
  ├─ agent command
  ├─ output contract
  ├─ allowed tools
  ├─ forbidden behaviors
  └─ eval cases
        ↓
AgentSpec CLI
        ↓
Run each case through the agent command via stdin JSON
        ↓
Capture stdout, stderr, exit code, timeout, latency
        ↓
Parse structured output
        ↓
Contract checks
  ├─ valid JSON
  ├─ required fields
  ├─ required phrases
  ├─ forbidden phrases
  ├─ valid citations from supplied sources
  ├─ allowed tool calls only
  ├─ required tool calls
  └─ latency budget
        ↓
Case scores + failures
        ↓
Markdown / JSON report
        ↓
CI-ready exit code
```

The important pattern is that the model/agent is treated as a component with a behavioral contract. AgentSpec does not ask the model whether it did well. It runs the same cases repeatedly and checks the output against explicit expectations.
