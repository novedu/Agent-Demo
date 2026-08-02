# Phase 4 Knowledge Platform

Status: implemented.

## Objective

Turn `/knowledge` from a placeholder into a RAG debugging center.

The first implementation focuses on current-session evidence produced by the Agent Runtime.

It does not implement document upload, embedding jobs, index management, or a full retrieval backend.

## User Questions

The Knowledge Center answers:

```text
What did the agent retrieve?
Which source did each chunk come from?
What query produced the evidence?
What was the retrieval score?
Does this citation support the final answer?
Where can I inspect the related runtime run?
```

## Data Sources

Available now:

- Zustand `citations`
- Zustand `events`
- `rag_retrieve` SSE payload
- `tool_success` payload for `searchKnowledge`

The page derives:

- retrieval runs
- source summaries
- chunk records
- score
- query
- retrieval duration
- matched keywords when available
- logs from `searchKnowledge`

## Page Structure

```text
Knowledge Center
├── Header
│   ├── current session scope
│   ├── chunk count
│   └── Agent Workspace link
│
├── Metric Strip
│   ├── Sources
│   ├── Chunks
│   ├── Retriever Runs
│   └── Average Score
│
├── Left Column
│   ├── Retriever Runs
│   └── Sources
│
├── Center Column
│   └── Chunk Explorer
│       ├── Search
│       ├── Source Filter
│       └── Chunk Rows
│
└── Right Column
    └── Citation Detail
        ├── Source
        ├── Chunk Content
        ├── Retrieval Metadata
        └── Agent Workspace Link
```

## Non Goals

Not included in Phase 4:

- document upload
- embedding pipeline
- retriever configuration editing
- vector database
- source deletion
- citation persistence
- historical task citation API

These belong to a later backend-backed Knowledge Platform iteration.

## Acceptance

- `/knowledge` is no longer a placeholder.
- It shows real citations from the current Agent run.
- It shows retrieval query, score, source, chunk, snippet, and metadata.
- It supports search and source filtering.
- It links back to `/agent`.
- It does not fabricate knowledge data when no run has produced citations.
- `npm run lint`, `npm run test`, and `npm run build` pass.
