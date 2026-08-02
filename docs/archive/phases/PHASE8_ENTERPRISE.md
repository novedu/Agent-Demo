# Phase 8 Enterprise Platform

Status: implemented as enterprise readiness surface.

## Objective

Turn `/settings` from a placeholder into an Enterprise Platform readiness page.

This phase does not implement enterprise backend features. It documents and visualizes the current runtime configuration, API/SSE contract, operational signals, and honest gaps before a real enterprise deployment.

## User Questions

The Settings page answers:

```text
Which runtime server is the console connected to?
Which environment and model label are configured?
Which SSE events does the frontend understand?
Which platform capabilities exist today?
Which enterprise capabilities are partial or planned?
What cannot be claimed yet?
```

## Data Sources

Available now:

- `VITE_AGENT_SERVER_URL`
- `VITE_AGENT_ENVIRONMENT`
- `VITE_AGENT_MODEL` / `VITE_AGENT_MODEL_NAME` / `VITE_MODEL`
- Zustand runtime status
- Zustand events/tools/citations/memory/evaluation
- frontend API adapter contract

The page derives:

- runtime connection details
- model and environment labels
- supported SSE event list
- current session signal counts
- enterprise readiness matrix
- security boundary notes

## Page Structure

```text
Settings
├── Header
│   ├── enterprise readiness scope
│   ├── read-only configuration note
│   └── Agent Workspace link
│
├── Metric Strip
│   ├── Runtime Status
│   ├── Server URL
│   ├── Environment
│   └── Model
│
├── Main Column
│   ├── Runtime Connection
│   └── SSE Contract
│
├── Right Column
│   ├── Enterprise Readiness
│   └── Current Session Signals
│
└── Security Boundary
```

## Enterprise Capability Matrix

Available:

- Runtime task lifecycle
- SSE event contract
- Retry and cancel API
- Frontend observability surfaces

Partial:

- Observability
- Knowledge inspection
- Memory inspection
- Evaluation inspection
- Workflow inspection

Planned:

- Workspace model
- Team model
- RBAC
- SSO
- Audit log persistence
- API key management
- Secret management
- Deployment environments
- Model provider management
- Prompt versioning
- Experiment tracking
- Dataset management
- Production monitoring

## Non Goals

Not included in Phase 8:

- authentication backend
- role and permission policy engine
- SSO provider integration
- audit log storage
- API key issuance
- secret storage
- deployment pipeline
- production monitoring backend
- billing
- team workspace administration

These belong to a later Agent Studio 3.x backend-backed enterprise platform iteration.

## Acceptance

- `/settings` is no longer a placeholder.
- It shows real frontend runtime configuration.
- It shows the SSE contract supported by the console.
- It shows current session operational signals.
- It makes enterprise readiness visible without pretending RBAC, SSO, Audit, or Deployment already exist.
- It links back to `/agent`.
- `npm run lint`, `npm run test`, and `npm run build` pass.
