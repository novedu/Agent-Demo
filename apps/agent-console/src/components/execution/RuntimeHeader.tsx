import type { ReactNode } from 'react';
import { Badge, Button, Card, RuntimeIcon, StatusTag } from '../ui';
import { ExecutionProgress } from './ExecutionProgress';

interface RuntimeHeaderProps {
  status: string;
  progress: number;
  nodeCount: number;
  activeNode?: string;
  duration?: number;
  tokenCount?: number;
  estimatedCost?: number;
  currentStep?: string;
  currentTask?: string;
  environment?: string;
  hasTaskActivity?: boolean;
}

export function RuntimeHeader({
  status,
  progress,
  nodeCount,
  activeNode,
  duration,
  tokenCount,
  estimatedCost,
  currentStep,
  currentTask,
  environment = 'local',
  hasTaskActivity = false,
}: RuntimeHeaderProps) {
  if (!hasTaskActivity || status === 'idle') {
    return (
      <HeaderShell
        title="Workspace ready"
        subtitle="No running task. Choose Quick Start or describe a goal in Chat."
        status="ready"
        environment={environment}
      >
        <StateCard label="Current Task" value="No running task" />
        <StateCard label="Current Step" value="Ready" tone="info" />
        <StateCard label="Progress" value="Quick Start" />
        <StateCard label="Runtime" value="Connected" tone="success" />
      </HeaderShell>
    );
  }

  if (status === 'error') {
    return (
      <HeaderShell
        title="Runtime failed"
        subtitle={currentTask ?? 'Inspect logs, trace, and diagnostics.'}
        status={status}
        environment={environment}
      >
        <StateCard label="Current Step" value={currentStep ?? activeNode ?? 'Failure'} tone="danger" />
        <StateCard label="Duration" value={formatDuration(duration)} />
        <StateCard label="Trace" value={`${nodeCount} objects`} />
        <div className="flex min-w-0 gap-2">
          <Button variant="secondary" className="h-10 flex-1">Retry</Button>
          <Button variant="ghost" className="h-10 flex-1">Logs</Button>
        </div>
      </HeaderShell>
    );
  }

  if (status === 'success') {
    return (
      <HeaderShell
        title="Runtime completed"
        subtitle={currentTask ?? 'Final answer and evaluation are ready.'}
        status={status}
        environment={environment}
      >
        <StateCard label="Duration" value={formatDuration(duration)} />
        <StateCard label="Tokens" value={formatNumber(tokenCount)} />
        <StateCard label="Cost" value={formatCost(estimatedCost)} />
        <StateCard label="Evaluation" value={`${progress}%`} tone="success" />
      </HeaderShell>
    );
  }

  return (
    <HeaderShell
      title="Runtime running"
      subtitle={currentTask ?? 'Agent is executing the current task.'}
      status={status}
      environment={environment}
    >
      <StateCard label="Current Step" value={currentStep ?? activeNode ?? 'Planning'} tone="info" />
      <StateCard label="Duration" value={formatDuration(duration)} />
      <StateCard label="Tokens" value={formatNumber(tokenCount)} />
      <div className="hidden min-w-[220px] shrink-0 xl:block">
        <ExecutionProgress value={progress} currentStep={currentStep ?? activeNode} />
      </div>
    </HeaderShell>
  );
}

function HeaderShell({
  title,
  subtitle,
  status,
  environment,
  children,
}: {
  title: string;
  subtitle: string;
  status: string;
  environment: string;
  children: ReactNode;
}) {
  return (
    <header className="flex min-h-[88px] shrink-0 items-center gap-4 border-b border-line bg-white px-4">
      <div className="flex min-w-[280px] items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-panel text-accent">
          <RuntimeIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold leading-5 text-ink">{title}</h1>
            <StatusTag status={status} />
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="grid min-w-0 flex-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">{children}</div>
      <Badge tone="neutral" className="hidden shrink-0 font-mono uppercase 2xl:inline-flex">
        {environment}
      </Badge>
    </header>
  );
}

function StateCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'info' | 'success' | 'danger';
}) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-700'
      : tone === 'danger'
        ? 'text-rose-700'
        : tone === 'info'
          ? 'text-blue-700'
          : 'text-ink';

  return (
    <Card className="min-w-0 px-3 py-2">
      <div className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <div className={`mt-1 truncate font-mono text-sm font-semibold ${toneClass}`}>{value}</div>
    </Card>
  );
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return 'measuring';
  if (duration < 1000) return `${duration}ms`;
  return `${(duration / 1000).toFixed(1)}s`;
}

function formatNumber(value?: number): string {
  if (value === undefined) return 'collecting';
  return new Intl.NumberFormat('en-US').format(value);
}

function formatCost(value?: number): string {
  if (value === undefined) return 'pending';
  return `$${value.toFixed(4)}`;
}
