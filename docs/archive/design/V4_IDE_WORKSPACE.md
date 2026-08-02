# Agent Studio v4: IDE Workspace

## Positioning

Agent Studio v4 turns the Agent Workspace from a dashboard-like runtime console into an IDE-like runtime editor for AI agents.

The goal is not to add new runtime capabilities. The goal is to change the workspace feel:

```text
Dashboard panels -> Runtime IDE surfaces
Independent cards -> Connected workspace regions
Static empty states -> Agent runtime standing by
```

## Product Rule

The first screen must answer within three seconds:

- What is the agent doing?
- Which runtime object is active?
- What happened before this step?
- What evidence supports the answer?
- Where can I debug it?

If the screen cannot answer these questions, the design is not acceptable.

## Workspace Principle

Agent Workspace is not a dashboard.

Do not compose the workspace from multiple independent cards.

The workspace should feel like:

- VSCode
- Cursor
- Chrome DevTools
- LangSmith
- Linear Issue Viewer

Instead of:

- Admin Dashboard
- BI Dashboard
- CRM Dashboard

Cards are only allowed for:

- Empty state content
- Quick start choices
- Small metric widgets
- Dialogs and popovers

Core runtime regions are layout panels, docks, canvases, or inspectors.

## v4 Layout

```text
TopBar
────────────────────────────────────────
Sidebar │ Chat Workspace       │ Inspector
        │                      │
        │ Runtime Graph Strip  │
        │ Debug Timeline Dock  │
────────────────────────────────────────
Status Bar
```

Chat is the product.

Graph explains the runtime.

Timeline debugs the runtime.

Inspector explains the selected runtime object.

Everything else is secondary.

## Information Weight

Primary:

- Chat conversation
- Assistant runtime summary
- Current task and current step

Secondary:

- Runtime graph strip
- Debug timeline dock

Deep detail:

- Inspector
- Drawer
- Raw trace
- JSON metadata
- Logs

## Runtime Regions

### Chat Workspace

Chat is the largest surface and the main reading path.

Assistant messages should expose runtime progress:

```text
User Goal
↓
Planning
↓
Tool Call
↓
Knowledge Retrieval
↓
Memory Update
↓
Reflection
↓
Final Answer
```

### Runtime Graph

The graph is a compact dependency strip.

It should not look like a large flowchart editor.

Idle:

```text
Planner -> Knowledge -> Tool -> Memory -> Reflection -> Answer
```

Running:

```text
Completed nodes: green
Current node: blue glow
Failed node: red
Pending node: gray
```

### Debug Timeline

Timeline is a bottom dock, not a table card.

It should feel closer to Chrome DevTools or LangSmith trace spans:

```text
12:30:01 Planner     success   120ms
12:30:02 Tool        running   querySalesData
12:30:03 Knowledge   success   3 chunks
12:30:04 Reflection  success   quality check
```

### Runtime Inspector

Inspector is a continuous right-side object panel.

It should explain the selected runtime object:

- Execution
- Input
- Output
- Reasoning
- Evidence
- Memory
- Evaluation
- Trace
- Logs

Inspector should not become a wall of independent cards.

## De-Dashboard Rules

- Core regions should avoid rounded card containers.
- Avoid repeated panel shadows.
- Avoid equal visual weight between Chat, Graph, Timeline, and Inspector.
- Avoid empty white canvases.
- Avoid dashboard KPI rows in the workspace.
- Use borders and docks before shadows.
- Use continuous surfaces before nested cards.
- Keep hover states stable: color, border, background only.

## Implementation Scope

Allowed in v4:

- `apps/agent-console/src/**`
- `docs/**`

Not allowed in v4:

- Runtime changes
- Server changes
- API contract changes
- SSE changes
- Store data structure changes
- New Agent capabilities

## Acceptance Criteria

- Chat remains visually primary.
- Graph never dominates the first screen.
- Timeline reads as a debug dock.
- Inspector is focused on the selected runtime object.
- Idle state still communicates runtime readiness.
- Page no longer reads as a dashboard composed of cards.
- `npm run lint`, `npm run test`, and `npm run build` pass.
