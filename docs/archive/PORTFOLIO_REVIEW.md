# Portfolio Review

This document frames Agent Studio as a job-search portfolio project.

The goal is not to claim full enterprise production readiness. The goal is to show strong product judgment, frontend engineering, agent runtime understanding, and a credible path toward an enterprise platform.

## Current Portfolio Score

```text
Agent Workspace: 8.5 / 10
Supporting Pages: 8 / 10
Runtime Backend: 8 / 10 for portfolio demo
Enterprise Production Readiness: 4 / 10
Portfolio Value: 9 / 10
```

## Why It Is No Longer A Demo

Agent Studio now includes:

- real TypeScript Agent Runtime
- real Runtime Server API
- real SSE event stream
- real task lifecycle
- real Planner output
- real Tool execution
- real RAG retrieval
- real Memory writes
- real Reflection event
- real Evaluation result
- real React Runtime Console
- real page-to-page inspection surfaces

The project has moved from:

```text
AI chat page
```

to:

```text
Agent Runtime Studio MVP
```

## Strongest Interview Talking Points

### 1. RuntimeObject Projection

Raw runtime events are not directly rendered everywhere.

The frontend projects them into a RuntimeObject model:

```text
AgentEvent + Plan + Tools + RAG + Memory + Evaluation
    -> RuntimeObject
    -> Graph / Timeline / Inspector / Drawer / Chat Evidence
```

This is the key architecture idea in the console.

### 2. Runtime-First Product Thinking

The product is not organized as independent dashboard cards.

Each surface answers a runtime question:

- `/agent`: what is the agent doing?
- `/dashboard`: what has recently happened?
- `/knowledge`: what evidence was retrieved?
- `/memory`: what did the agent retain?
- `/evaluation`: was the answer good?
- `/workflow`: how did the plan map to execution?
- `/settings`: what can be claimed operationally?

### 3. Honest Enterprise Boundaries

The project does not fake:

- RBAC
- SSO
- audit logs
- vector DB
- persistent memory DB
- datasets
- workflow deployment
- billing

Instead, it shows what exists, what is partial, and what is planned.

That is stronger than pretending.

### 4. Full-Stack Agent Understanding

The backend includes:

- Agent
- Planner
- PlanValidator
- WorkflowRunner
- ToolExecutor
- ToolRegistry
- RAG
- MemoryManager
- Reflection
- Evaluation
- Observability
- TaskManager
- Runtime Server
- SSE

This gives the frontend real runtime semantics to visualize.

## Best Demo Path

```text
/agent
  Run: 分析华东区域销售下降原因，并生成报告

/dashboard
  Show task history and runtime signals

/knowledge
  Show retrieved chunks and sources

/memory
  Show working / episodic / semantic memory

/evaluation
  Show scorecard and feedback

/workflow
  Show Planner graph and runtime mapping

/settings
  Show enterprise readiness boundary
```

## What A Reviewer May Challenge

### "Is this production ready?"

Answer:

```text
Not fully. It is a portfolio-grade Runtime Studio MVP. The runtime flow, SSE, task lifecycle, and frontend debugger are real. Enterprise production features like RBAC, SSO, audit persistence, deployment environments, and long-term datasets are explicitly planned but not implemented yet.
```

### "Is Knowledge persistent?"

Answer:

```text
No. The current Knowledge Center inspects current-session RAG evidence. Document upload, embeddings, vector index management, and historical citation persistence are future platform work.
```

### "Is Workflow Builder editable?"

Answer:

```text
Not yet. Phase 7 implements the read-only foundation: Planner steps, dependency graph, step-to-runtime mapping, and workflow events. Editing, versioning, and deployment require backend workflow persistence.
```

### "Why build your own runtime instead of LangChain?"

Answer:

```text
The goal of this project is to understand and demonstrate runtime architecture directly: planning, workflow execution, tools, RAG, memory, reflection, evaluation, trace, and SSE. Avoiding LangChain makes the runtime-server-console relationship clearer for portfolio evaluation.
```

## P0 Before Recording A Demo Video

- Start Runtime Server and React Console.
- Run the sales decline task once.
- Navigate through all pages using SPA navigation, not full refresh.
- Show that Knowledge/Memory/Evaluation depend on current session state.
- Keep the demo focused on `/agent` first.
- Avoid spending too much time on Settings.

## P1 Next Polish

- Add screenshots or GIFs to README.
- Add a one-command dev script if desired.
- Add code-splitting to reduce Vite chunk warning.
- Add one or two frontend tests for Knowledge/Memory/Evaluation derived views.
- Add persisted task detail API if historical page reload support becomes important.

## P2 Future Product Work

- Persistent task run database
- Persistent traces
- Knowledge source ingestion
- Vector index management
- Memory graph
- Evaluation datasets
- Workflow editing and deployment
- RBAC / SSO / Audit
- Environment and deployment management

## Final Positioning

Agent Studio is currently best presented as:

```text
A portfolio-grade Enterprise Agent Runtime Studio MVP.
```

Not:

```text
A fully production-ready enterprise AI platform.
```

That distinction is important and credible.
