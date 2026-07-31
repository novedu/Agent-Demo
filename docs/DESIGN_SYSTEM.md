# Agent Studio Design System

## Scope

This document defines how Agent Studio UI components should be implemented consistently.

It is the source of truth for buttons, panels, badges, metrics, cards, drawers, accordions, code blocks, JSON viewers, skeletons, and empty states.

## Core Token System

### Color Tokens

```text
Gray     Base UI / neutral
Blue     Planner / runtime primary
Green    Tool / success
Amber    Knowledge / warning
Red      Error / failure
Purple   Memory
Teal     Reflection / Evaluation
White    Final answer
```

### Typography Tokens

```text
UI Font     Inter
Code Font   JetBrains Mono
```

### Spacing Tokens

Allowed values:

```text
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48
```

### Radius Tokens

Allowed values:

```text
8 / 12 / 16
```

### Shadow Rules

- Border first
- Light shadow second
- No heavy depth effects
- No glass-heavy styling

## Component Library

### Primary Components

- Button
- Input
- Card
- Panel
- Badge
- Status
- Tooltip
- Drawer
- Accordion
- Table
- CodeBlock
- JsonViewer
- Skeleton
- EmptyState

### Runtime Components

- Runtime Header
- Runtime Graph
- Runtime Node
- Debug Timeline
- Runtime Inspector
- Evidence Panel
- Logs Console
- Metric Card

## Component Standards

### Button

- Must have visible focus state
- Must support primary / secondary / ghost
- Must not change layout on hover

### Card / Panel

- Must use shared radius and border styles
- Must not rely on decorative shadow for separation

### Badge / Status

- Must use semantic color mapping
- Must remain compact and readable

### Accordion

- Must animate consistently
- Must not reflow unrelated layout regions

### Drawer

- Must support fixed viewport-height content
- Must keep header pinned and content scrollable

### CodeBlock / JsonViewer

- Must support copy
- Must support collapse / expand
- Must use mono font
- Must be readable in dark code surface

### Skeleton / EmptyState

- Must follow shared loading and idle patterns
- Must never appear like placeholder garbage

## State Styling

Standard semantic states:

```text
pending
running
completed
failed
cancelled
skipped
```

Component styling must use these states consistently across Graph, Timeline, Inspector, and Logs.

## Implementation Rule

If a UI element is used in more than one place, it must be implemented once and reused.

Do not duplicate button, panel, badge, or JSON rendering logic across feature components.

