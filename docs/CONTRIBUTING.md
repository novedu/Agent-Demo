# Contributing to Agent Studio

## Development Flow

Every meaningful version follows this process:

```text
Product Spec
↓
Information Architecture
↓
Wireframe
↓
High Fidelity Design
↓
Implementation Plan
↓
Coding
↓
Review
↓
Iteration
```

Do not jump directly from prompt to code for product-level changes.

## Versioning

Use product versions instead of endless sprint labels:

```text
Agent Studio 2.0
Agent Studio 2.1
Agent Studio 2.2
Agent Studio 2.3
Agent Studio 2.4
Agent Studio 3.0
```

## Code Boundaries

For Agent Studio 2.0 UI work, allowed paths are:

```text
apps/agent-console/src/**
docs/**
```

Do not modify these without explicit scope approval:

```text
packages/agent-runtime
apps/runtime-server
API
SSE
TaskManager
Memory
Evaluation
Planner
Workflow
Store business structure
```

## Documentation Source of Truth

- `docs/PRODUCT.md` defines product positioning, target users, information architecture, screen blueprint, and product principles.
- `docs/DESIGN.md` defines the high-level design philosophy.
- `docs/UX.md` defines navigation, interaction, state flow, and runtime behavior.
- `docs/DESIGN_SYSTEM.md` defines shared implementation standards for UI components and tokens.

If code conflicts with the documentation, change the code. Do not casually change the documentation hierarchy.

## Required Verification

Before completing frontend changes:

```bash
cd apps/agent-console
npm run lint
npm run test
npm run build
```

Before completing repo-level TypeScript changes:

```bash
npx tsc --noEmit
```

## UI Review Checklist

- Can the user understand what the agent is doing within 3 seconds?
- Is Chat still the primary workspace surface?
- Does the selected runtime object synchronize Graph, Timeline, Inspector, Drawer, and Evidence?
- Are loading, empty, running, completed, failed states present?
- Is there any admin-template styling left?
- Is motion calm and consistent?
- Are keyboard focus states visible?
- Are scroll areas intentional?
