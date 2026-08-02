# Runtime Object Model

Runtime Object is the frontend projection layer for Agent Studio.

It does not change the Runtime, Server, API, SSE protocol, or Zustand store structure. It converts existing execution nodes and server events into a single debugger-friendly object model consumed by:

- Chat Runtime Summary
- Runtime Graph
- Debug Timeline
- Runtime Inspector
- Step Drawer
- Evidence navigation

## Goal

Every visible runtime surface should describe the same selected object.

```text
Selected Runtime Object
  -> Chat summary
  -> Graph focus
  -> Timeline span
  -> Inspector sections
  -> Drawer tabs
```

This prevents the workspace from becoming independent panels that each tell a different story.

## Schema

```ts
interface RuntimeObject {
  id: string;
  type: RuntimeObjectType;

  traceId: string;
  spanId: string;
  parentId?: string;
  dependencyIds: string[];
  childIds: string[];

  title: string;
  status: ExecutionNodeStatus;
  lifecycle: RuntimeLifecycle;
  summary: string;

  input?: unknown;
  arguments?: unknown;
  output?: unknown;
  reasoning?: unknown;
  metadata?: Record<string, unknown>;
  trace?: unknown;

  duration?: number;
  startTime?: number;
  endTime?: number;
  tokenCount?: number;
  retryCount?: number;
  cost?: number;

  span: RuntimeSpan;
  sourceNode: ExecutionNodeRecord;
}
```

## Runtime Types

```text
Planner
Workflow
Tool
Knowledge
Memory
Reflection
Evaluation
Answer
```

## Lifecycle

```text
pending
running
completed
failed
cancelled
```

Lifecycle is derived from the existing execution node status.

## Span Model

Each Runtime Object owns a span projection:

```ts
interface RuntimeSpan {
  spanId: string;
  traceId: string;
  parentId?: string;
  objectId: string;
  component: string;
  type: RuntimeObjectType;
  status: ExecutionNodeStatus;
  lifecycle: RuntimeLifecycle;
  depth: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
  eventCount: number;
  events: AgentEvent[];
}
```

The span model lets the Timeline behave like a trace debugger rather than an event list.

## Dependency Rules

The frontend derives dependencies from runtime object types:

```text
Planner
  -> Workflow
  -> Knowledge

Workflow
  -> Tool

Tool
  -> Memory
  -> Reflection

Knowledge
  -> Reflection

Memory
  -> Reflection

Reflection
  -> Evaluation

Evaluation
  -> Answer
```

These rules are a UI projection. They do not alter runtime execution.

## Debugger Surfaces

### Chat

Chat remains the primary product surface.

Assistant messages show runtime summary segments:

```text
Plan -> Tool -> Knowledge -> Memory -> Reflection -> Evaluation -> Answer
```

### Runtime Graph

Graph uses RuntimeObject dependencies to explain why each object exists.

### Timeline

Timeline uses RuntimeSpan to show:

- trace id
- root span
- span count
- event count
- duration
- parent
- dependencies
- input
- output
- metadata
- trace events

### Inspector

Inspector is object-driven.

Planner, Workflow, Tool, Knowledge, Memory, Reflection, Evaluation, and Answer each expose different sections.

### Drawer

Drawer shows:

- Overview
- Input
- Output
- Reasoning
- Trace
- Metadata
- Raw JSON

## Non Goals

RuntimeObject does not:

- change the backend API
- change SSE event formats
- change the Zustand store structure
- create new Agent Runtime capabilities
- replace EventTrace or Observability

It is a frontend debugger projection for the existing runtime.
