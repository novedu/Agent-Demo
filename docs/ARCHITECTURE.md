# Agent Studio Architecture

## System Overview

Agent Studio is composed of three major layers:

```text
React Agent Console
↓
Runtime Server
↓
TypeScript Agent Runtime
```

The console is the product experience. The server exposes HTTP and SSE contracts. The runtime owns planning, workflow execution, tools, RAG, memory, reflection, trace, and evaluation.

## Frontend

Path:

```text
apps/agent-console
```

Responsibilities:

- Render Agent Studio UI.
- Create tasks through the Runtime Server API.
- Subscribe to SSE events.
- Maintain console state through Zustand.
- Visualize chat, graph, timeline, inspector, evidence, logs, memory, and evaluation.

The frontend must not contain Agent Runtime business logic.

## Runtime Server

Path:

```text
apps/runtime-server
```

Responsibilities:

- Expose task APIs.
- Manage task lifecycle.
- Stream Agent events through SSE.
- Adapt runtime events into server event contracts.

The server must not own UI-specific state.

## Agent Runtime

Path:

```text
packages/agent-runtime
```

Responsibilities:

- Agent orchestration
- Planner
- Plan validation
- Workflow runner
- Tool registry
- Tool executor
- RAG
- Memory
- Reflection
- Evaluation
- Trace

The runtime should remain framework-agnostic and UI-agnostic.

## Event Flow

```text
User submits task
↓
Console POST /api/agent/tasks
↓
Runtime Server creates task
↓
Runtime Adapter starts Agent Runtime
↓
Runtime emits events
↓
Server streams SSE
↓
Console store updates
↓
UI renders Runtime Objects
```

## UI Runtime Object Projection

The frontend projects raw events and task state into runtime objects:

```text
AgentEvent + Plan + Tool + Memory + Evaluation
↓
RuntimeObject
↓
Graph / Timeline / Inspector / Drawer
```

This keeps the UI coherent without changing runtime business logic.

## Existing Architecture Notes

Detailed architecture notes live under:

```text
docs/architecture/
├── architecture.md
├── frontend.md
├── runtime.md
└── server.md
```
