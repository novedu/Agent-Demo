# Phase 3 Dashboard Productization

Status: spec ready, implementation pending approval.

## Objective

Turn `/dashboard` from an Admin-style entry page into a useful Runtime Overview.

The Dashboard is not the main product surface. `/agent` remains the default runtime workspace.

The Dashboard answers:

```text
What has recently run?
What is running now?
What failed?
How healthy is the runtime?
Where should I go next?
```

## Product Positioning

Dashboard is an operational overview for Agent Runtime.

It is not:

- a marketing landing page
- a BI dashboard
- a KPI wall
- a replacement for Agent Workspace
- a fake analytics page with invented historical data

It should feel like:

- a compact runtime control plane
- a launchpad into `/agent`
- a scan-friendly engineering surface

## Primary User Jobs

### Resume a Run

The user sees a recent task and opens it in Agent Workspace.

### Detect Runtime Health

The user sees task counts, current status, failures, retries, and server availability.

### Investigate a Failure

The user sees the latest failure reason and jumps to the runtime task.

### Start a Demo

The user can launch the default sales-decline task without navigating through a marketing-style CTA.

## Information Architecture

```text
Dashboard
├── Runtime Overview Header
│   ├── Runtime status
│   ├── Environment
│   ├── Last updated
│   └── Open Agent Workspace
│
├── Current Runtime Spotlight
│   ├── Active task
│   ├── Current step
│   ├── Progress
│   └── Continue / Inspect
│
├── Runtime Metrics
│   ├── Total tasks
│   ├── Completed
│   ├── Failed / Cancelled
│   └── Running
│
├── Recent Tasks
│   ├── Task input
│   ├── Status
│   ├── Progress
│   ├── Retry
│   └── Created time
│
├── Failure Review
│   ├── Failed tasks
│   ├── Last error
│   └── Retry action
│
└── Runtime Signals
    ├── Current session events
    ├── Tool calls
    ├── Knowledge sources
    ├── Memory writes
    └── Evaluation status
```

## Page Blueprint

```text
┌────────────────────────────────────────────────────────────┐
│ Runtime Overview                 [Open Agent Workspace]      │
│ Local dev · SSE endpoint · last updated                     │
├────────────────────────────────────────────────────────────┤
│ Current Runtime                                             │
│ [Running / Ready]  task input  current step  progress       │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Total Tasks  │ Completed    │ Failed       │ Running        │
├──────────────────────────────────────┬─────────────────────┤
│ Recent Tasks                         │ Failure Review      │
│ task / status / progress / retry     │ latest failures     │
│                                      │ error / retry       │
├──────────────────────────────────────┴─────────────────────┤
│ Runtime Signals                                             │
│ events · tools · knowledge · memory · evaluation             │
└────────────────────────────────────────────────────────────┘
```

## Visual Direction

- Use the existing Studio Layout.
- Keep a connected workspace background.
- Use cards only for repeated task rows, compact metrics, and the current spotlight.
- Avoid oversized charts and decorative gradients.
- Use border-first panels.
- Use `Inter` for UI and `JetBrains Mono` for ids, times, progress, and counts.
- Use green for completed, blue for running, amber for warning, red for failed.
- Keep the page dense but scannable.
- Every interactive task row must have a visible hover and focus state.

## Data Contract

### Available Now

The current runtime server exposes:

```text
GET /api/agent/tasks
```

Each task provides:

```ts
interface AgentTaskStatusResponse {
  taskId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  progress: number;
  createdAt: number;
  retryCount: number;
  maxRetry: number;
  lastError?: string;
}
```

The Dashboard can truthfully implement:

- task count
- completed count
- failed count
- cancelled count
- running count
- progress
- current step
- retry count
- last error
- task creation time

### Current Session Signals

The existing Zustand store can truthfully provide:

- event count
- tool call count
- citations count
- memory count
- evaluation status
- active task context

These signals must be labelled as current session signals, not historical aggregates.

### Not Available Yet

The current task list API does not provide historical:

- evaluation scores
- token usage
- cost
- latency duration
- per-task event summaries
- per-task citations
- per-task memory writes

The first Dashboard implementation must not fabricate these values.

Future API extension:

```text
GET /api/agent/tasks/:taskId/summary
GET /api/agent/metrics
```

Those endpoints belong to a later backend observability iteration, not the initial Dashboard UI.

## Components

```text
pages/dashboard/
├── DashboardPage
├── RuntimeOverviewHeader
├── CurrentRuntimeSpotlight
├── RuntimeMetricStrip
├── RecentTasksPanel
├── RecentTaskRow
├── FailureReviewPanel
├── RuntimeSignalsPanel
├── DashboardSkeleton
└── DashboardEmptyState
```

## Interaction Rules

### Recent Task Row

Clicking a task row:

```text
Dashboard task row
  -> /agent
  -> selected task context
```

If task replay is not yet supported by the frontend, the first version should navigate to `/agent` and clearly preserve the task id in URL state or a future-ready route parameter. It must not imply that an old task is being replayed when it is not.

### Active Runtime

When the current Store status is running:

- show current step
- show progress
- show running badge
- show `Continue in Agent Workspace`

When idle:

- show `Ready`
- show `No running task`
- show `Run the sales decline demo`

### Failures

Failed and cancelled tasks appear in Failure Review.

Retry should only be shown when the backend retry contract is wired. Until then, use `Inspect` or `Open Workspace` and do not render a fake retry button.

## Responsive Rules

### 1440+

- Two-column content area.
- Recent Tasks receives the larger column.
- Failure Review remains visible.

### 1024-1199

- One main task column.
- Failure Review moves below Recent Tasks.
- Runtime Signals remains a compact horizontal section.

### Below 1024

- Keep the page scrollable inside the content region.
- Preserve metric labels and values.
- Do not hide the Recent Tasks section.

## Loading and Empty States

### Loading

Use:

- metric skeletons
- task row skeletons
- failure row skeletons
- signal skeletons

Do not display repeated `Loading...` text.

### Empty

```text
No runtime tasks yet

Run the sales decline demo to create the first trace.

[Open Agent Workspace]
```

The empty state must remain compact and operational.

## Implementation Sequence

1. Add typed task history API adapter.
2. Add Dashboard view-model selectors.
3. Replace current metric cards with truthful runtime metrics.
4. Add Current Runtime Spotlight.
5. Add Recent Tasks panel.
6. Add Failure Review.
7. Add current-session Runtime Signals.
8. Add loading and empty states.
9. Add navigation to `/agent`.
10. Validate at 1024, 1200, 1440, and 1600 widths.

## Acceptance Criteria

- `/dashboard` is no longer a placeholder.
- All displayed historical task values come from the runtime server.
- No invented evaluation, token, cost, or latency values are shown as facts.
- Active runtime state is visible and links to `/agent`.
- Recent tasks are scannable and status-coded.
- Failures expose the real `lastError` when available.
- Empty, loading, running, completed, failed, and cancelled states are handled.
- Dashboard does not visually overpower `/agent`.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run build` passes.

## Out of Scope

- New Runtime capabilities
- New Agent tools
- Full analytics backend
- Historical evaluation aggregation
- Token and cost accounting
- Team dashboards
- RBAC
- Billing
- Deployment
- Marketing content
