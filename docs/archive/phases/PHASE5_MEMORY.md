# Phase 5 Memory Platform

Status: implemented.

## Objective

Turn `/memory` from a placeholder into a Memory debugging center.

The first implementation focuses on memory records emitted by the current Agent Runtime session.

It does not implement a persistent memory database, memory graph storage, similarity search, or cross-task memory history API.

## User Questions

The Memory Center answers:

```text
What memory did the agent write?
Which category was written?
When did the write happen?
How important was the memory?
Which task or runtime event produced it?
Can I inspect the related Agent run?
```

## Data Sources

Available now:

- Zustand `memory`
- Zustand `events`
- Zustand `messages`
- `memory_update` SSE payload

The page derives:

- memory records
- memory write timeline
- working / episodic / semantic groups
- importance score
- update time
- task id
- event id
- related message when detectable

## Page Structure

```text
Memory Center
├── Header
│   ├── current session scope
│   ├── memory record count
│   └── Agent Workspace link
│
├── Metric Strip
│   ├── Memory Records
│   ├── Write Events
│   ├── Average Importance
│   └── Latest Update
│
├── Left Column
│   ├── Memory Timeline
│   └── Memory Map
│
├── Center Column
│   └── Memory Explorer
│       ├── Search
│       ├── Type Filter
│       └── Memory Rows
│
└── Right Column
    └── Memory Detail
        ├── Type
        ├── Content
        ├── Write Metadata
        ├── Related Message
        └── Agent Workspace Link
```

## Non Goals

Not included in Phase 5:

- persistent memory database
- vector similarity search
- memory editing
- memory deletion
- cross-task memory history
- user preference management
- memory graph backend
- memory replay

These belong to a later backend-backed Memory Platform iteration.

## Acceptance

- `/memory` is no longer a placeholder.
- It shows real memory writes from the current Agent run.
- It separates Working, Episodic, and Semantic memory.
- It shows importance, update time, task id, event id, and content.
- It supports search and memory type filtering.
- It links back to `/agent`.
- It does not fabricate persistent memory data when no run has produced memory.
- `npm run lint`, `npm run test`, and `npm run build` pass.
