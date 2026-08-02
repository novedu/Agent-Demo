# Agent Studio Demo Script

Use this script for portfolio demos, interviews, screen recordings, and project walkthroughs.

## Demo Goal

Show that Agent Studio is not an AI chat demo. It is an Agent Runtime Debugger.

The viewer should understand in 3 minutes:

```text
The user asks a business question.
The Agent plans.
The Agent executes tools.
The Agent retrieves knowledge.
The Agent writes memory.
The Agent reflects.
The Agent evaluates.
The Studio explains every step.
```

## Setup

Start Runtime Server:

```bash
npm run server
```

Start React Console:

```bash
npm --prefix apps/agent-console run dev
```

Open:

```text
http://127.0.0.1:5173/agent
```

## Primary Demo Input

```text
分析华东区域销售下降原因，并生成报告
```

## 5-Minute Walkthrough

### 1. Open Agent Workspace

Route:

```text
/agent
```

Say:

```text
This is the core product surface. Chat is the primary workspace. Graph, Timeline, and Inspector explain the runtime instead of competing with the conversation.
```

Show:

- Chat input
- Runtime banner
- Compact runtime graph
- Debug timeline
- Right-side inspector

### 2. Run The Sales Decline Task

Submit:

```text
分析华东区域销售下降原因，并生成报告
```

Say:

```text
The frontend creates a task through the Runtime Server and subscribes to SSE. The page is not playing a static animation. It is reacting to Agent events.
```

Watch for:

- Assistant streaming
- Planner event
- Tool call
- RAG retrieval
- Memory update
- Reflection
- Evaluation
- Final answer

### 3. Explain RuntimeObject

Click graph or timeline items.

Say:

```text
Raw SSE events are projected into a frontend RuntimeObject model. Chat, Graph, Timeline, Inspector, and Drawer all point to the same selected runtime object.
```

Show:

- Selected graph node
- Timeline highlight
- Inspector context
- Drawer details

### 4. Open Dashboard

Route:

```text
/dashboard
```

Say:

```text
Dashboard is not the main product. It is an operational overview. It reads real task history from the Runtime Server and current-session signals from the console store.
```

Show:

- Current runtime
- Recent tasks
- Failures and retry
- Runtime signals

### 5. Open Knowledge

Route:

```text
/knowledge
```

Say:

```text
This page explains why the answer is grounded. It shows retrieved chunks, sources, scores, query metadata, and citation detail from the current run.
```

Show:

- Retriever runs
- Sources
- Chunk Explorer
- Citation Detail

Important:

```text
Knowledge is current-session evidence only. Refreshing the page clears Zustand session state unless persistence is added later.
```

### 6. Open Memory

Route:

```text
/memory
```

Say:

```text
This page shows what the Agent wrote into memory. It separates Working, Episodic, and Semantic memory so developers can inspect what context the runtime retained.
```

Show:

- Memory Timeline
- Working / Episodic / Semantic map
- Memory Explorer
- Memory Detail

### 7. Open Evaluation

Route:

```text
/evaluation
```

Say:

```text
This page reviews answer quality. The evaluator scores completeness, accuracy, groundedness, and task completion, then gives feedback.
```

Show:

- Overall score
- Criteria breakdown
- Feedback review
- Evaluation trace
- Regression readiness boundary

### 8. Open Workflow

Route:

```text
/workflow
```

Say:

```text
This is the foundation for a future Workflow Builder. Today it is read-only and maps Planner steps to runtime objects and workflow events.
```

Show:

- Planner dependency graph
- Step Explorer
- Step definition JSON
- Runtime mapping JSON

### 9. Open Settings

Route:

```text
/settings
```

Say:

```text
Settings makes enterprise readiness explicit. It shows what exists today and what is planned, without pretending RBAC, SSO, Audit, or Deployment are already implemented.
```

Show:

- Runtime connection
- SSE contract
- Enterprise readiness matrix
- Security boundary

## 60-Second Pitch

```text
Agent Studio is an enterprise runtime debugger for AI agents.

The backend includes a TypeScript Agent Runtime with Planner, WorkflowRunner, Tools, RAG, Memory, Reflection, Evaluation, Observability, and a Node Runtime Server with task lifecycle and SSE.

The frontend is a React Runtime Studio. It turns raw Agent events into RuntimeObjects, then synchronizes Chat, Graph, Timeline, Inspector, Drawer, Knowledge, Memory, Evaluation, Workflow, and Settings around the same runtime context.

The key demo is a sales decline analysis task. You can watch the Agent plan, call tools, retrieve knowledge, write memory, reflect, evaluate, and generate a Markdown answer.

The project is honest about its boundaries: current-session evidence is real, but persistent vector DB, RBAC, SSO, audit, deployment, and datasets are planned future enterprise features.
```

## What To Emphasize In Interviews

- This is not only UI. The runtime server and SSE flow are real.
- The console does not directly call runtime classes. It goes through API contracts.
- RuntimeObject projection is the frontend architecture bridge between raw events and professional debugging UI.
- The product avoids fake enterprise claims.
- The roadmap shows how the product can evolve from portfolio demo to enterprise platform.

## Known Demo Limits

- Session state is stored in Zustand only.
- Knowledge, Memory, and Evaluation pages inspect the current run.
- Historical trends require backend persistence.
- Workflow Builder is currently read-only.
- Settings is a readiness surface, not a configuration writer.
