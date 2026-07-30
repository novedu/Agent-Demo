import { Badge, Card, StatusTag } from '../ui';
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
  return (
    <div className="grid gap-4 rounded-lg border border-line bg-white p-4 shadow-sm 2xl:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-ink">Execution Explorer</h1>
          <StatusTag status={status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          Inspect the current Agent run as a graph, timeline and structured step details.
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard label="Duration" value={formatDuration(duration)} />
          <MetricCard label="Token" value={formatNumber(tokenCount)} />
          <MetricCard label="Est. Cost" value={formatCost(estimatedCost)} />
          <MetricCard label="Step Count" value={`${nodeCount}`} />
          <MetricCard label="Current Step" value={currentStep ?? activeNode ?? 'Waiting'} />
          <MetricCard label="Progress" value={`${progress}%`} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{nodeCount} nodes</Badge>
          <Badge>active {activeNode ?? 'waiting'}</Badge>
        </div>
      </div>
      <ExecutionProgress value={progress} currentStep={currentStep ?? activeNode} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="min-w-0 p-3">
      <div className="truncate text-[11px] font-medium uppercase tracking-normal text-muted">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-sm font-semibold text-ink">{value}</div>
    </Card>
  );
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return '-';
  if (duration < 1000) return `${duration}ms`;
  return `${(duration / 1000).toFixed(1)}s`;
}

function formatNumber(value?: number): string {
  if (value === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(value);
}

function formatCost(value?: number): string {
  if (value === undefined) return '-';
  return `$${value.toFixed(4)}`;
}
