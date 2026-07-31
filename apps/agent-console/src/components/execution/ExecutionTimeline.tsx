import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Badge, JsonViewer, Panel } from '../ui';
import { classNames } from '../ui/classNames';
import { ExecutionStatus } from './ExecutionStatus';
import {
  getKindLabel,
  getStatusTone,
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
      description="DevTools style event stream."
      className="h-full"
      bodyClassName="overflow-y-auto overscroll-contain p-0"
    >
      <div className="min-w-[420px]">
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
                  className="grid min-h-14 w-full cursor-pointer grid-cols-[76px_72px_minmax(120px,1fr)_64px_72px_54px_64px] items-center gap-3 px-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent/20"
                >
                  <span className="font-mono text-[11px] text-muted">{formatTime(node.startTime)}</span>
                  <Badge tone={getStatusTone(node.status)}>{getKindLabel(node.kind)}</Badge>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {node.component}
                    </span>
                    <span className="block truncate text-[11px] text-muted">{node.summary}</span>
                  </span>
                  <span className="font-mono text-[11px] text-muted">{formatDuration(node.duration)}</span>
                  <ExecutionStatus status={node.status} />
                  <span className="font-mono text-[11px] text-muted">{readRetry(node)}</span>
                  <span className="text-right font-mono text-[11px] text-muted">
                    {readToken(node)}
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
    <div className="sticky top-0 z-10 grid min-h-10 grid-cols-[76px_72px_minmax(120px,1fr)_64px_72px_54px_64px] items-center gap-3 border-b border-line bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
      <span>Time</span>
      <span>Badge</span>
      <span>Component</span>
      <span>Duration</span>
      <span>Status</span>
      <span>Retry</span>
      <span className="text-right">Token</span>
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

function readToken(node: ExecutionNodeRecord): string {
  const usage = toRecord(node.metadata?.usage);
  const token = usage.total_tokens ?? usage.totalTokens ?? node.metadata?.tokenCount ?? node.metadata?.tokens;
  return typeof token === 'number' ? token.toLocaleString() : '-';
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return '--:--:--';
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
