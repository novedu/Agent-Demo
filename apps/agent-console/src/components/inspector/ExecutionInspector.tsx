import type { AgentEvent } from '../../types/agent';
import { Badge, Skeleton, StatusTag } from '../ui';
import type { ExecutionNodeRecord } from '../execution/execution-model';
import { InspectorEmpty } from './InspectorEmpty';

interface ExecutionInspectorProps {
  currentNode?: ExecutionNodeRecord;
  nodes: ExecutionNodeRecord[];
  events: AgentEvent[];
  status: string;
  isLoading: boolean;
}

export function ExecutionInspector({
  currentNode,
  nodes,
  events,
  status,
  isLoading,
}: ExecutionInspectorProps) {
  if (isLoading && !currentNode) return <Skeleton lines={6} />;
  if (!currentNode) {
    return <InspectorEmpty title="No active execution" description="Run a task to inspect runtime metrics." />;
  }

  const retryCount = readRetryCount(events);
  const tokenCount = readTokenCount(events);
  const estimatedCost = tokenCount > 0 ? (tokenCount / 1000) * 0.002 : undefined;
  const completedSteps = nodes.filter((node) => node.status === 'success').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-md bg-panel p-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Current Step
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-ink">{currentNode.component}</div>
        </div>
        <StatusTag status={status} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Duration" value={formatDuration(currentNode.duration)} />
        <Metric label="Retry" value={`${retryCount}`} />
        <Metric label="Token" value={tokenCount ? tokenCount.toLocaleString() : '-'} />
        <Metric label="Est. Cost" value={estimatedCost ? `$${estimatedCost.toFixed(4)}` : '-'} />
        <Metric label="Completed" value={`${completedSteps}/${nodes.length}`} />
        <Metric label="Status" value={currentNode.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone={currentNode.status === 'failed' ? 'danger' : 'info'}>
          {currentNode.kind}
        </Badge>
        <Badge tone="neutral">{currentNode.summary}</Badge>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-line bg-white p-2.5">
      <div className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-muted">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-xs font-semibold text-ink">{value}</div>
    </div>
  );
}

function readRetryCount(events: AgentEvent[]): number {
  return events.reduce((count, event) => {
    const payload = toRecord(event.payload);
    const retryCount = payload.retryCount;
    return typeof retryCount === 'number' ? Math.max(count, retryCount) : count;
  }, 0);
}

function readTokenCount(events: AgentEvent[]): number {
  return events.reduce((total, event) => {
    const payload = toRecord(event.payload);
    const usage = toRecord(payload.usage);
    const nestedTotal = usage.total_tokens ?? usage.totalTokens;
    const directTotal = payload.tokenCount ?? payload.tokens;
    if (typeof nestedTotal === 'number') return total + nestedTotal;
    return typeof directTotal === 'number' ? total + directTotal : total;
  }, 0);
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return '-';
  return duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;
}
