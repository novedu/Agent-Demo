import { motion } from 'framer-motion';
import { Badge, Panel } from '../ui';
import { ExecutionStatus } from './ExecutionStatus';
import { getKindLabel, type ExecutionNodeRecord } from './execution-model';

interface ExecutionTimelineProps {
  nodes: ExecutionNodeRecord[];
  activeNodeId?: string;
  onSelectNode: (node: ExecutionNodeRecord) => void;
  onStart?: () => void;
}

const flowKinds = new Set([
  'planner',
  'workflow',
  'tool',
  'rag',
  'memory',
  'reflection',
  'evaluation',
  'answer',
]);

export function ExecutionTimeline({ nodes, activeNodeId, onSelectNode, onStart }: ExecutionTimelineProps) {
  const hasEvents = nodes.length > 0;

  return (
    <Panel
      title="Runtime Timeline"
      description={hasEvents ? 'Chronological events of the runtime' : undefined}
      className="h-full"
      bodyClassName="flex min-h-0 flex-col p-0"
      actions={
        <div className="flex shrink-0 items-center gap-1">
          <TimelineActionBtn>Live</TimelineActionBtn>
          <TimelineActionBtn>
            <svg viewBox="0 0 10 10" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M1 2h8M2 5h6M4 8h2" strokeLinecap="round" />
            </svg>
            Filter
          </TimelineActionBtn>
          <TimelineActionBtn>
            <svg viewBox="0 0 10 10" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="4.5" cy="4.5" r="2.5" />
              <path d="M6.5 6.5L8 8" strokeLinecap="round" />
            </svg>
            Search
          </TimelineActionBtn>
        </div>
      }
    >
      {hasEvents ? (
        <TimelineTable nodes={nodes} activeNodeId={activeNodeId} onSelectNode={onSelectNode} />
      ) : (
        <EmptyTimeline onStart={onStart} />
      )}
    </Panel>
  );
}

function TimelineActionBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-6 items-center gap-1 rounded-md border border-line bg-white px-2 text-[10px] font-medium text-muted transition-colors hover:bg-panel hover:text-ink"
    >
      {children}
    </button>
  );
}

function TimelineTable({
  nodes,
  activeNodeId,
  onSelectNode,
}: {
  nodes: ExecutionNodeRecord[];
  activeNodeId?: string;
  onSelectNode: (node: ExecutionNodeRecord) => void;
}) {
  const flowNodes = nodes.filter((node) => flowKinds.has(node.kind));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Table header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-slate-50/80 px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
        <div className="w-[72px] shrink-0">TIME</div>
        <div className="flex-1 truncate">COMPONENT</div>
        <div className="w-[68px] shrink-0">STATUS</div>
        <div className="w-[60px] shrink-0">DURATION</div>
        <div className="w-[60px] shrink-0">LEVEL</div>
        <div className="w-[52px] shrink-0 text-right">TOKENS</div>
        <div className="w-[52px] shrink-0 text-right">RETRY</div>
      </div>

      {/* Table body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {flowNodes.map((node) => (
          <TimelineRow
            key={node.id}
            node={node}
            active={node.id === activeNodeId}
            onSelect={() => onSelectNode(node)}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineRow({
  node,
  active,
  onSelect,
}: {
  node: ExecutionNodeRecord;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={`flex w-full items-center gap-2 border-b border-line px-4 py-1.5 text-left text-xs transition-colors ${
        active ? 'bg-blue-50/60' : 'hover:bg-panel'
      }`}
    >
      <div className="w-[72px] shrink-0 font-mono text-[10px] text-muted">
        {formatTime(node.startTime)}
      </div>
      <div className="flex-1 truncate">
        <div className="truncate font-semibold text-ink text-[11px]">{node.component}</div>
      </div>
      <div className="w-[68px] shrink-0">
        <ExecutionStatus status={node.status} />
      </div>
      <div className="w-[60px] shrink-0 font-mono text-[10px] text-muted">
        {formatDuration(node.duration)}
      </div>
      <div className="w-[60px] shrink-0">
        <Badge tone={getTone(node.kind)} className="text-[9px] px-1.5 py-0.5">
          {getKindLabel(node.kind)}
        </Badge>
      </div>
      <div className="w-[52px] shrink-0 text-right font-mono text-[10px] text-muted">
        {readMetric(node.metadata, 'tokenCount') ?? '—'}
      </div>
      <div className="w-[52px] shrink-0 text-right font-mono text-[10px] text-muted">
        {readMetric(node.metadata, 'retryCount') ?? '0'}
      </div>
    </motion.button>
  );
}

function EmptyTimeline({ onStart }: { onStart?: () => void }) {
  const pipeline = [
    { label: 'Planner', icon: 'P', color: 'text-blue-500' },
    { label: 'Tool', icon: 'T', color: 'text-emerald-500' },
    { label: 'Knowledge', icon: 'K', color: 'text-amber-500' },
    { label: 'Memory', icon: 'M', color: 'text-slate-400' },
    { label: 'Reflection', icon: 'R', color: 'text-blue-500' },
    { label: 'Answer', icon: 'A', color: 'text-emerald-500' },
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Pipeline Preview</span>
        {onStart && (
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-5 items-center gap-1 rounded border border-accent bg-accent px-2 text-[10px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <svg viewBox="0 0 10 10" className="h-2 w-2" fill="currentColor">
              <path d="M2 1l6 4-6 4z" />
            </svg>
            Start
          </button>
        )}
      </div>
      <div className="flex flex-1 items-center gap-0 overflow-x-auto">
        {pipeline.map((step, i) => (
          <div key={step.label} className="flex items-center gap-0">
            <div className="flex flex-col items-center gap-0.5 px-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md border border-line bg-slate-50 text-[10px] font-bold ${step.color}`}>
                {step.icon}
              </div>
              <span className="text-[9px] text-muted whitespace-nowrap">{step.label}</span>
            </div>
            {i < pipeline.length - 1 && (
              <svg viewBox="0 0 20 8" className="h-2 w-4 shrink-0 text-line" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2 4h14M13 1l4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getTone(kind: ExecutionNodeRecord['kind']): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (kind === 'tool') return 'success';
  if (kind === 'rag') return 'warning';
  if (kind === 'memory') return 'neutral';
  if (kind === 'evaluation' || kind === 'reflection' || kind === 'planner') return 'info';
  return 'neutral';
}

function readMetric(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'number' || typeof value === 'string' ? String(value) : undefined;
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return '—';
  return duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return '--:--:--';
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}