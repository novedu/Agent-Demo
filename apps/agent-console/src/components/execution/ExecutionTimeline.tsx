import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Badge, ChevronRightIcon, JsonViewer, Panel } from '../ui';
import { classNames } from '../ui/classNames';
import { ExecutionStatus } from './ExecutionStatus';
import {
  getKindLabel,
  type ExecutionNodeRecord,
} from './execution-model';

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
  const [expandedId, setExpandedId] = useState<string>();
  const timelineNodes = nodes.filter((node) => timelineKinds.has(node.kind));

  return (
    <Panel
      title="Runtime Timeline"
      description="Chrome DevTools style runtime sequence."
      className="h-full"
      bodyClassName="overflow-y-auto overscroll-contain p-0"
    >
      <div className="min-w-[840px]">
        <TimelineHeader />
        <div className="divide-y divide-line">
          {timelineNodes.map((node, index) => {
            const isActive = node.id === activeNodeId;
            const isExpanded = expandedId === node.id;

            return (
              <motion.article
                key={node.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: index * 0.018 }}
                className={classNames(
                  'transition-colors duration-200',
                  isActive ? 'bg-blue-50' : 'bg-white hover:bg-panel',
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectNode(node);
                    setExpandedId(isExpanded ? undefined : node.id);
                  }}
                  className="grid min-h-12 w-full cursor-pointer grid-cols-[88px_92px_minmax(180px,1fr)_90px_78px_64px_72px_72px] items-center gap-3 px-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/20"
                >
                  <span className="font-mono text-[11px] text-muted">{formatTime(node.startTime)}</span>
                  <Badge tone={getLevelTone(node.kind)}>{getKindLabel(node.kind)}</Badge>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {node.component}
                    </span>
                    <span className="block truncate text-[11px] text-muted">{node.summary}</span>
                  </span>
                  <ExecutionStatus status={node.status} />
                  <span className="font-mono text-[11px] text-muted">{formatDuration(node.duration)}</span>
                  <span className="font-mono text-[11px] text-muted">{readRetry(node)}</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted">
                    <ChevronRightIcon
                      className={classNames('h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-90')}
                    />
                    Expand
                  </span>
                  <span className="text-right font-mono text-[11px] text-muted">
                    Jump
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden border-t border-line bg-slate-50"
                    >
                      <div className="grid gap-3 p-4 xl:grid-cols-2">
                        <JsonViewer title="Arguments" value={node.arguments ?? node.input} collapsed />
                        <JsonViewer title="Output" value={node.output} collapsed />
                        <JsonViewer title="Metadata" value={node.metadata} collapsed />
                        <JsonViewer title="Trace" value={node.trace} collapsed />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function TimelineHeader() {
  return (
    <div className="sticky top-0 z-10 grid min-h-10 grid-cols-[88px_92px_minmax(180px,1fr)_90px_78px_64px_72px_72px] items-center gap-3 border-b border-line bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
      <span>Time</span>
      <span>Level</span>
      <span>Component</span>
      <span>Status</span>
      <span>Duration</span>
      <span>Retry</span>
      <span>Expand</span>
      <span className="text-right">Jump</span>
    </div>
  );
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return '-';
  return duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;
}

function readRetry(node: ExecutionNodeRecord): string {
  const retry = node.metadata?.retryCount ?? node.metadata?.retry;
  return typeof retry === 'number' ? `${retry}` : '0';
}

function getLevelTone(
  kind: ExecutionNodeRecord['kind'],
): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (kind === 'tool') return 'success';
  if (kind === 'rag') return 'warning';
  if (kind === 'memory') return 'neutral';
  if (kind === 'evaluation' || kind === 'reflection') return 'info';
  if (kind === 'answer') return 'success';
  return 'info';
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return '--:--:--';
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
