# Agent Studio Roadmap

This roadmap keeps the project aligned with the current goal:

```text
Build a portfolio-grade Agent Runtime Studio that demonstrates real backend capability through a polished /agent workspace.
```

The priority is not enterprise launch readiness yet. The priority is a credible product demo for job search and portfolio review.

## Roadmap Principles

- `/agent` is the product center.
- Chat is the primary surface.
- Runtime Graph explains dependencies.
- Timeline debugs execution.
- Inspector explains the selected runtime object.
- Backend features should be used when they already exist.
- Enterprise platform features are planned, but not allowed to distract from the portfolio demo.

## Current Backend Readiness

The current backend is sufficient for the portfolio demo.

Available runtime capabilities:

- Agent
- Planner
- WorkflowRunner
- ToolExecutor
- ToolRegistry
- RAG
- MemoryManager
- Reflection
- Evaluation
- Observability
- EventTrace
- TaskManager
- Retry
- Cancel
- Server-Sent Events

Demo task:

```text
分析华东销售下降原因，并生成报告
```

Expected demo flow:

```text
User Task
  -> Planner
  -> Tool
  -> Knowledge
  -> Memory
  -> Reflection
  -> Evaluation
  -> Answer
```

## Phase 1: Agent Workspace Industry Demo

Status: in progress

Goal:

Make `/agent` feel like an industry-level demo video, not just a working page.

Scope:

- RuntimeObject hardening for UI consumption
- Single selected runtime object across Chat, Graph, Timeline, Inspector, and Drawer
- Chat message runtime summary
- Real SSE task execution demo
- Runtime dependency graph
- Flow timeline
- Object-driven inspector
- Runtime drawer tabs
- Evidence navigation foundation
- Demo-ready empty state
- Stop and regenerate interactions
- Running, completed, failed, and cancelled states

Acceptance:

- User can enter `分析华东销售下降原因，并生成报告`.
- Chat streams the answer.
- Graph highlights runtime objects.
- Timeline appends spans.
- Inspector follows the focused object.
- Drawer opens object details.
- Knowledge, Memory, Reflection, Evaluation, and Answer are visible in one run.
- `npm run lint`, `npm run test`, and `npm run build` pass.

Deferred from Phase 1:

- RBAC
- SSO
- Billing
- Team workspace
- Deployment management
- Production monitoring
- Full Knowledge Center
- Full Memory Center
- Full Evaluation Center
- Full Workflow Builder

## Phase 2: Runtime Deepening

Goal:

Move `/agent` from a polished runtime console to a deeper Runtime Debugger.

Scope:

- Formal RuntimeObject schema in frontend documentation
- `traceId`, `parentId`, dependency, lifecycle, metadata, token, and cost fields
- Runtime dependency graph upgrade
- Trace timeline upgrade closer to Jaeger and LangSmith
- Timeline span tree
- Timeline search and filters
- Timeline expanded arguments, input, output, metadata, and logs
- Inspector templates by object type:
  - PlannerInspector
  - ToolInspector
  - KnowledgeInspector
  - MemoryInspector
  - ReflectionInspector
  - EvaluationInspector
  - AnswerInspector
  - TraceInspector
- Drawer JSON copy, collapse, expand, and raw view polish
- UI-level demo playback pacing for fast SSE events

Acceptance:

- Selecting any runtime object updates Graph, Timeline, Inspector, Drawer, and Chat evidence consistently.
- Timeline reads like a trace system, not an event list.
- Inspector content changes meaningfully by runtime object type.

## Phase 3: Dashboard Productization

Goal:

Turn Dashboard from placeholder into a runtime overview page.

Scope:

- Recent Tasks
- Recent Failures
- Average Evaluation
- Runtime Metrics
- Model Usage
- Latest Memory
- Recent Knowledge
- Cost
- Latency

Acceptance:

- Dashboard helps explain recent runtime activity.
- Dashboard does not compete with `/agent` as the primary product entry.

## Phase 4: Knowledge Platform

Goal:

Turn Knowledge from supporting evidence into a real Knowledge Center.

Scope:

- Knowledge Sources
- Document list
- Chunk viewer
- Retriever inspection
- Embedding status
- Citation records
- Search
- Source-to-answer navigation

Acceptance:

- A user can inspect why a retrieved chunk appeared in an answer.
- Citation navigation from `/agent` lands in the relevant Knowledge context.

## Phase 5: Memory Platform

Goal:

Make memory observable, explainable, and useful for debugging.

Scope:

- Working Memory
- Semantic Memory
- Episodic Memory
- Memory Timeline
- Memory Graph
- Importance score
- Related task links
- Message-to-memory evidence navigation

Acceptance:

- A user can understand what memory was written, why it matters, and which task created it.

## Phase 6: Evaluation Platform

Goal:

Make answer quality measurable across runs.

Scope:

- Evaluation History
- Score Trend
- Leaderboard
- Evaluation Dataset
- Failed Cases
- Regression Review
- Compare Runs

Acceptance:

- A user can compare run quality and identify regressions without reading every trace manually.

## Phase 7: Workflow Builder

Goal:

Move toward LangGraph Studio-style workflow authoring.

Scope:

- Planner Graph
- Workflow Graph
- Node
- Edge
- Agent
- Loop
- Branch
- Task Chain
- Execution Preview

Acceptance:

- A user can understand and preview workflow structure visually.
- Runtime execution remains separate from workflow authoring.

## Phase 8: Enterprise Platform

Goal:

Prepare Agent Studio for enterprise usage after the core runtime product is strong.

Scope:

- Workspace
- Team
- Permission
- RBAC
- SSO
- Audit
- API Key management
- Deployment
- Model Provider management
- Prompt versioning
- Experiment tracking
- Dataset management
- Production monitoring
- Observability documentation
- Security documentation

Acceptance:

- The platform can be evaluated for real enterprise deployment.

## Version Mapping

```text
Agent Studio 2.0
  Phase 1: Agent Workspace Industry Demo
  Phase 2: Runtime Deepening

Agent Studio 2.1
  Phase 4: Knowledge Platform

Agent Studio 2.2
  Phase 5: Memory Platform

Agent Studio 2.3
  Phase 6: Evaluation Platform

Agent Studio 2.4
  Phase 7: Workflow Builder

Agent Studio 3.0
  Phase 8: Enterprise Platform
```

Dashboard productization can ship between 2.0 and 2.1, but it must not replace `/agent` as the default product experience.

## Priority Buckets

### P0: Must Finish for Portfolio Demo

- `/agent` demo flow
- RuntimeObject synchronization
- Chat runtime summary
- Runtime dependency graph
- Debug timeline
- Object-driven inspector
- Drawer details
- Evidence navigation basics
- Real SSE validation
- Build, lint, and test pass

### P1: Must Finish Before Public Beta Demo

- Runtime deepening
- Timeline span tree
- Inspector templates
- Better failed and cancelled states
- Demo playback pacing
- Export/share run summary
- Dashboard productization

### P2: Must Finish Before Product Platform

- Knowledge Center
- Memory Center
- Evaluation Center
- Workflow Builder
- Cross-page evidence navigation
- Run comparison

### P3: Later Enterprise Readiness

- RBAC
- SSO
- Audit
- Team workspace
- Deployment
- Monitoring
- Billing
- Security documentation

## What Not To Do Now

Do not spend the next phase on:

- Enterprise security
- Billing
- Team management
- Marketing pages
- Broad dashboard widgets
- Low-code workflow authoring

These are important, but they do not improve the current job-search demo as much as making `/agent` exceptional.
