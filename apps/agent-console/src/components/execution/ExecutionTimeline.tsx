import { motion } from 'framer-motion';
import { Badge, Panel } from '../ui';
import { classNames } from '../ui/classNames';
import { ExecutionStatus } from './ExecutionStatus';
import { getKindLabel, type ExecutionNodeRecord } from './execution-model';

interface ExecutionTimelineProps {
  nodes: ExecutionNodeRecord[];
  activeNodeId?: string;
  onSelectNode: (node: ExecutionNodeRecord) => void;
}

const timelineKinds = new Set([
  'planner',
  'workflow',
  'tool',
  'rag',
  'memory',
  'reflection',
  'evaluation',
  'answer',
]);

export function ExecutionTimeline({ nodes, activeNodeId, onSelectNode }: ExecutionTimelineProps) {
  const timelineNodes = nodes.filter((node) => timelineKinds.has(node.kind));

  return (
    <Panel
      title="Timeline Pro"
      description="Runtime sequence with status, duration and progress by step."
      bodyClassName="max-h-[360px] overflow-y-auto"
    >
      <div className="space-y-0">
        {timelineNodes.map((node, index) => (
          <motion.button
            key={node.id}
            type="button"
            onClick={() => onSelectNode(node)}
            className="group grid w-full cursor-pointer grid-cols-[28px_minmax(0,1fr)] text-left focus:outline-none focus:ring-2 focus:ring-accent/20"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.025 }}
          >
            <div className="relative flex justify-center">
              <span
                className={classNames(
                  'relative z-10 mt-4 h-3 w-3 rounded-full border-2 bg-white transition-colors duration-200',
                  getDotClass(node.status),
                )}
              />
              {index < timelineNodes.length - 1 && (
                <span className="absolute bottom-0 top-7 w-px bg-lineStrong" />
              )}
            </div>

            <div
              className={classNames(
                'mb-2 rounded-lg border p-3 transition-colors duration-200',
                activeNodeId === node.id
                  ? 'border-accent bg-blue-50'
                  : 'border-line bg-white group-hover:border-lineStrong group-hover:bg-panel',
              )}
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <EventBadge kind={node.kind} />
                    <div className="truncate text-sm font-semibold text-ink">{node.component}</div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{node.summary}</p>
                </div>
                <div className="flex items-start gap-2 lg:justify-end">
                  <ExecutionStatus status={node.status} />
                  <Badge tone="neutral" className="font-mono">
                    {formatDuration(node.duration, node.status)}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
                <span>{getKindLabel(node.kind)}</span>
                <span>Start {formatTime(node.startTime)}</span>
                <span>End {formatTime(node.endTime)}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </Panel>
  );
}

function EventBadge({ kind }: { kind: ExecutionNodeRecord['kind'] }) {
  const label = getKindLabel(kind);
  const tone = getBadgeTone(kind);
  return <Badge tone={tone}>{label}</Badge>;
}

function getBadgeTone(
  kind: ExecutionNodeRecord['kind'],
): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (kind === 'planner' || kind === 'llm') return 'info';
  if (kind === 'tool') return 'warning';
  if (kind === 'rag') return 'success';
  if (kind === 'memory') return 'neutral';
  if (kind === 'reflection' || kind === 'evaluation') return 'info';
  return 'success';
}

function getDotClass(status: ExecutionNodeRecord['status']): string {
  if (status === 'success') return 'border-emerald-500';
  if (status === 'running') return 'border-blue-500 ring-4 ring-blue-100';
  if (status === 'failed') return 'border-rose-500';
  if (status === 'cancelled') return 'border-amber-500';
  return 'border-slate-300';
}

function formatDuration(duration: number | undefined, status: ExecutionNodeRecord['status']): string {
  if (status === 'running') return duration === undefined ? 'Streaming...' : `${duration}ms`;
  return duration === undefined ? '-' : `${duration}ms`;
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleTimeString();
}
