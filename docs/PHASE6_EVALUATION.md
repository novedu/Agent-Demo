# Phase 6 Evaluation Platform

Status: implemented.

## Objective

Turn `/evaluation` from a placeholder into a quality review center for the current Agent run.

The first implementation focuses on the `EvaluationResult` produced by the existing Runtime evaluator.

It does not implement persistent evaluation history, datasets, leaderboards, compare-runs, or regression analytics.

## User Questions

The Evaluation Center answers:

```text
How good was the final answer?
Which criteria passed or failed?
What feedback did the evaluator produce?
Was the answer grounded in retrieved evidence?
Did tools or memory support the result?
Which runtime events produced the evaluation?
```

## Data Sources

Available now:

- Zustand `evaluation`
- Zustand `events`
- Zustand `messages`
- Zustand `tools`
- Zustand `citations`
- Zustand `memory`
- `evaluation_start` SSE payload
- `evaluation_complete` SSE payload

The page derives:

- overall score
- criteria breakdown
- feedback notes
- evaluation lifecycle trace
- evaluation duration
- answer length
- tool health
- evidence count
- memory count
- runtime event count

## Page Structure

```text
Evaluation Center
├── Header
│   ├── current session scope
│   ├── score or evaluator status
│   └── Agent Workspace link
│
├── Metric Strip
│   ├── Overall Score
│   ├── Duration
│   ├── Evidence
│   └── Tool Health
│
├── Main Column
│   ├── Quality Scorecard
│   │   ├── Overall
│   │   ├── Completeness
│   │   ├── Accuracy
│   │   ├── Groundedness
│   │   └── Task Completion
│   │
│   └── Feedback Review
│       ├── Evaluator feedback
│       └── Runtime context
│
└── Right Column
    ├── Evaluation Trace
    └── Regression Readiness
```

## Non Goals

Not included in Phase 6:

- evaluation dataset management
- historical score persistence
- leaderboard
- score trend from backend history
- compare-runs
- regression suite execution
- human annotation workflow
- evaluation prompt editor

These belong to a later backend-backed Evaluation Platform iteration.

## Acceptance

- `/evaluation` is no longer a placeholder.
- It shows the real current-run `EvaluationResult`.
- It displays overall score, criteria, feedback, and runtime context.
- It shows evaluator lifecycle events.
- It links back to `/agent`.
- It does not fabricate historical evaluation data when no history API exists.
- `npm run lint`, `npm run test`, and `npm run build` pass.
