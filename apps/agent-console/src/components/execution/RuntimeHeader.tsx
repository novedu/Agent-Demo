import type { ReactNode } from 'react';
import { Badge, Button, Card, StatusTag } from '../ui';
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
}: RuntimeHeaderProps) {
  if (status === 'idle' && nodeCount === 0) {
    return (
      <div className="flex min-h-[76px] shrink-0 items-center justify-between gap-4 rounded-xl border border-line bg-white px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold leading-5 text-ink">Welcome to Agent Studio</h1>
            <StatusTag status="idle" />
          </div>
          <p className="mt-1 truncate text-sm text-muted">
            Start a task from Chat or Quick Start to debug planner, tools, RAG, memory and evaluation.
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <Badge tone="neutral">Quick Start ready</Badge>
          <Badge tone="neutral">Recent Tasks empty</Badge>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <HeaderShell title="Runtime Failed" status={status} subtitle={currentStep ?? activeNode ?? 'Diagnostics required'}>
        <MetricCard label="Duration" value={formatDuration(duration)} />
        <MetricCard label="Trace" value={`${nodeCount} nodes`} />
        <MetricCard label="Logs" value="Open" tone="danger" />
        <div className="flex min-w-0 gap-2">
          <Button variant="secondary" className="h-10 flex-1">Retry</Button>
          <Button variant="ghost" className="h-10 flex-1">Diagnostics</Button>
        </div>
      </HeaderShell>
    );
  }

  if (status === 'success') {
    return (
      <HeaderShell title="Runtime Completed" status={status} subtitle={currentStep ?? activeNode ?? 'Final answer ready'}>
        <MetricCard label="Evaluation" value={`${progress}%`} tone="success" />
        <MetricCard label="Duration" value={formatDuration(duration)} />
        <MetricCard label="Cost" value={formatCost(estimatedCost)} />
        <Button variant="secondary" className="h-10">Export</Button>
      </HeaderShell>
    );
  }

  return (
    <HeaderShell title="Runtime Running" status={status} subtitle={currentStep ?? activeNode ?? 'Preparing runtime'}>
      <MetricCard label="Current Step" value={currentStep ?? activeNode ?? 'Planning'} />
      <MetricCard label="Running Time" value={formatDuration(duration)} />
      <MetricCard label="Token" value={formatNumber(tokenCount)} />
      <div className="hidden min-w-[220px] shrink-0 xl:block">
        <ExecutionProgress value={progress} currentStep={currentStep ?? activeNode} />
      </div>
    </HeaderShell>
  );
}

function HeaderShell({
  title,
  status,
  subtitle,
  children,
}: {
  title: string;
  status: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[76px] shrink-0 items-center gap-4 rounded-xl border border-line bg-white px-5 py-2">
      <div className="min-w-[190px]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold leading-5 text-ink">{title}</h1>
          <StatusTag status={status} />
        </div>
        <p className="mt-1 truncate text-xs text-muted">{subtitle}</p>
      </div>
      <div className="grid min-w-0 flex-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'success' | 'danger';
}) {
  const toneClass =
    tone === 'success' ? 'text-emerald-700' : tone === 'danger' ? 'text-rose-700' : 'text-ink';
  return (
    <Card className="min-w-0 px-3 py-1.5">
      <div className="truncate text-[11px] font-medium uppercase tracking-normal text-muted">
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
