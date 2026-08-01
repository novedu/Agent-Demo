import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Badge, JsonViewer, Panel } from '../ui';
import { classNames } from '../ui/classNames';
import { ExecutionStatus } from './ExecutionStatus';
import {
  getKindLabel,
  getStatusColor,
  type ExecutionNodeRecord,
} from './execution-model';

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

export function ExecutionTimeline({
  nodes,
  activeNodeId,
  onSelectNode,
  onStart,
}: ExecutionTimelineProps) {
  const flowNodes = useMemo(() => nodes.filter((node) => flowKinds.has(node.kind)), [nodes]);
  const [expandedId, setExpandedId] = useState<string | undefined>(activeNodeId);

  useEffect(() => {
    if (activeNodeId) setExpandedId(activeNodeId);
  }, [activeNodeId]);

  return (
    <Panel
      title="Debug Timeline"
      description={flowNodes.length ? 'Runtime flow trace' : 'Runtime flow preview'}
      className="h-full rounded-none border-0 shadow-none"
      bodyClassName="min-h-0 overflow-hidden p-0"
      actions={
        <div className="flex shrink-0 items-center gap-1">
          <TimelineAction>Live</TimelineAction>
          <TimelineAction>Filter</TimelineAction>
          <TimelineAction>Search</TimelineAction>
        </div>
      }
    >
      {flowNodes.length ? (
        <div className="h-full min-h-0 overflow-y-auto px-3 py-2">
          <div className="relative">
            <div className="absolute bottom-4 left-[82px] top-4 w-px bg-line" />
            {flowNodes.map((node, index) => (
              <TimelineSpan
                key={node.id}
                node={node}
                index={index}
                active={node.id === activeNodeId}
                expanded={node.id === expandedId}
                onSelect={() => {
                  onSelectNode(node);
                  setExpandedId((value) => (value === node.id ? undefined : node.id));
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyFlow onStart={onStart} />
      )}
    </Panel>
  );
}

function TimelineAction({ children }: { children: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-6 cursor-pointer items-center rounded-md border border-line bg-white px-2 text-[10px] font-medium text-muted transition-colors duration-200 hover:bg-panel hover:text-ink"
    >
      {children}
    </button>
  );
}

function TimelineSpan({
  node,
  index,
  active,
  expanded,
  onSelect,
}: {
  node: ExecutionNodeRecord;
  index: number;
  active: boolean;
  expanded: boolean;
  onSelect: () => void;
}) {
  const color = getStatusColor(node.status);

  return (
    <motion.article
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, delay: index * 0.015 }}
      className="relative"
    >
      <button
        type="button"
        onClick={onSelect}
        className={classNames(
          'grid w-full cursor-pointer grid-cols-[68px_22px_minmax(0,1fr)] items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors duration-200',
          active ? 'bg-blue-50/70' : 'hover:bg-panel',
        )}
      >
        <div className="pt-0.5 font-mono text-[10px] text-muted">
          {formatTime(node.startTime)}
        </div>
        <div className="relative flex h-full justify-center pt-1.5">
          <span
            className="relative z-10 h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: color }}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge tone={getTone(node.kind)} className="px-1.5 py-0.5 text-[9px]">
              {getKindLabel(node.kind)}
            </Badge>
            <span className="truncate text-xs font-semibold text-ink">{node.component}</span>
            <ExecutionStatus status={node.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted">
            <span>{formatDuration(node.duration)}</span>
            <span>tokens {readMetric(node.metadata, 'tokenCount') ?? '0'}</span>
            <span>retry {readMetric(node.metadata, 'retryCount') ?? '0'}</span>
          </div>
          <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-muted">{node.summary}</p>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden pl-[100px] pr-2"
          >
            <div className="mb-2 grid gap-2 rounded-lg border border-line bg-white p-2 lg:grid-cols-2">
              <JsonViewer title="Input" value={node.input ?? node.arguments} collapsed />
              <JsonViewer title="Output" value={node.output} collapsed />
              <JsonViewer title="Metadata" value={node.metadata} collapsed />
              <JsonViewer title="Trace" value={node.trace} collapsed />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function EmptyFlow({ onStart }: { onStart?: () => void }) {
  const preview = [
    { label: 'Planner', status: 'pending' },
    { label: 'Tool', status: 'pending' },
    { label: 'Knowledge', status: 'pending' },
    { label: 'Memory', status: 'pending' },
    { label: 'Reflection', status: 'pending' },
    { label: 'Answer', status: 'pending' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Flow Trace
          </div>
          <p className="mt-0.5 text-[10px] text-muted">
            Start a task to stream runtime spans into this rail.
          </p>
        </div>
        {onStart && (
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-7 cursor-pointer items-center rounded-md border border-accent bg-accent px-3 text-[10px] font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            Start
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {preview.map((item, index) => (
          <div
            key={item.label}
            className="grid grid-cols-[58px_18px_minmax(0,1fr)] items-center gap-2 px-2 py-1.5"
          >
            <span className="font-mono text-[10px] text-muted">--:--</span>
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <div className="flex items-center justify-between gap-2 rounded-md border border-line bg-panel px-2 py-1.5">
              <span className="text-xs font-semibold text-ink">{item.label}</span>
              <span className="font-mono text-[10px] text-muted">{item.status}</span>
            </div>
            {index < preview.length - 1 && <div className="col-start-2 h-3 w-px bg-line" />}
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
  if (duration === undefined) return 'pending';
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
