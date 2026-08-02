# Agent Studio

Enterprise Runtime Studio for building, running, observing, debugging, and evaluating AI agents.

This project is positioned as an engineering tool, not a chat demo and not an admin dashboard. The core demo shows an Agent task moving through:

```text
Planner -> Tool -> Knowledge -> Memory -> Reflection -> Evaluation -> Answer
```

The most important surface is `/agent`: Chat is the primary workspace, while Graph, Timeline, Inspector, Drawer, Evidence, Memory, and Evaluation explain the runtime.

## Why This Project Exists

Modern agent systems need more than a prompt box. Engineers need to know:

- what the agent planned
- which tools executed
- what knowledge was retrieved
- what memory was written
- how reflection judged the result
- how evaluation scored the answer
- where the runtime failed or needs review

Agent Studio turns those runtime signals into a portfolio-grade developer console inspired by Cursor, LangSmith, Chrome DevTools, OpenAI Platform, Linear, and GitHub.

## Current Product Surfaces

| Route | Status | Purpose |
| --- | --- | --- |
| `/agent` | Core | Runtime workspace for chat, graph, timeline, inspector, drawer, logs, and evidence |
| `/dashboard` | Implemented | Runtime overview from real task history and current-session signals |
| `/knowledge` | Implemented | Current-session RAG evidence, source, chunk, score, and retrieval inspection |
| `/memory` | Implemented | Current-session Working / Episodic / Semantic memory debugger |
| `/evaluation` | Implemented | Current-run scorecard, criteria, feedback, and evaluation trace |
| `/workflow` | Implemented | Read-only Planner / Workflow visualization and step-to-runtime mapping |
| `/settings` | Implemented | Runtime configuration and enterprise readiness boundary |

## Architecture

```text
React Agent Console
  -> Runtime Server API + SSE
  -> TypeScript Agent Runtime
```

Main packages:

```text
apps/
├── agent-console      React + Vite + Zustand + Tailwind + Framer Motion
└── runtime-server     Node HTTP server + SSE + task management

packages/
├── agent-runtime      Agent, Planner, Workflow, Tools, RAG, Memory, Reflection, Evaluation
├── shared-types       API, task, memory, trace, evaluation types
└── shared-utils       shared helpers
```

Runtime server APIs:

```text
POST /api/agent/tasks
GET  /api/agent/tasks/:taskId/events
GET  /api/agent/tasks/:taskId
GET  /api/agent/tasks
POST /api/agent/tasks/:taskId/cancel
POST /api/agent/tasks/:taskId/retry
```

## Demo Scenario

Use this input:

```text
分析华东区域销售下降原因，并生成报告
```

Expected demo flow:

```text
1. Chat receives the user goal
2. Planner generates steps
3. Tool execution queries sales data
4. RAG retrieves sales/market context
5. Memory stores task summary
6. Reflection checks completeness
7. Evaluation scores the answer
8. Final answer streams as Markdown
9. Knowledge / Memory / Evaluation / Workflow pages inspect the same run
```

See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the full walkthrough.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the Runtime Server:

```bash
npm run server
```

Start the React Console in another terminal:

```bash
npm --prefix apps/agent-console run dev
```

Open:

```text
http://127.0.0.1:5173/agent
```

Frontend environment:

```text
apps/agent-console/.env
VITE_AGENT_SERVER_URL=http://127.0.0.1:3001
```

## Verification

```bash
npm run lint
npm run build
npm run test
```

Note: in some sandboxed environments, `npm run test` can fail with `tsx` IPC pipe permission errors such as `listen EPERM ... tsx-501/*.pipe`. Running the same command in a normal local terminal succeeds.

## What Is Real Today

Implemented:

- TypeScript Agent Runtime
- Planner and PlanValidator
- WorkflowRunner
- ToolRegistry and ToolExecutor
- RAG retrieval over local knowledge
- Working / Episodic / Semantic memory model
- Reflection
- Evaluation
- Observability primitives
- Runtime Server with task lifecycle
- SSE event streaming
- Task cancel and retry
- React Runtime Studio
- RuntimeObject projection for Graph / Timeline / Inspector / Drawer
- Productized Dashboard, Knowledge, Memory, Evaluation, Workflow, and Settings pages

Not implemented yet:

- persistent vector database
- document upload pipeline
- persistent memory database
- historical evaluation datasets
- editable workflow deployment
- RBAC / SSO / audit logs
- secret management
- deployment environments
- billing or team administration

The project intentionally avoids fake enterprise features. Missing capabilities are shown as planned or partial in the product UI and docs.

## Documentation

```text
docs/
├── PRODUCT.md
├── DESIGN.md
├── UX.md
├── DESIGN_SYSTEM.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── DEMO_SCRIPT.md
├── PORTFOLIO_REVIEW.md
├── PHASE3_DASHBOARD.md
├── PHASE4_KNOWLEDGE.md
├── PHASE5_MEMORY.md
├── PHASE6_EVALUATION.md
├── PHASE7_WORKFLOW.md
├── PHASE8_ENTERPRISE.md
└── architecture/
```

## Portfolio Narrative

This project demonstrates:

- product thinking: runtime-first IA, clear roadmap, honest capability boundaries
- frontend engineering: React, TypeScript, Router, Zustand, Tailwind, Framer Motion
- agent infrastructure: task lifecycle, SSE, runtime events, tool execution, RAG, memory, evaluation
- observability design: RuntimeObject, dependency graph, timeline, inspector, trace, logs
- enterprise judgment: separating demo-ready features from production platform requirements
