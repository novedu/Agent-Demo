import { motion } from 'framer-motion';
import { Panel } from '../ui';
import { ExecutionStatus } from './ExecutionStatus';
import type { ExecutionNodeRecord } from './execution-model';

interface ExecutionTimelineProps {
  nodes: ExecutionNodeRecord[];
  activeNodeId?: string;
  onSelectNode: (node: ExecutionNodeRecord) => void;
}

const timelineKinds = new Set(['planner', 'tool', 'memory', 'reflection', 'evaluation']);

export function ExecutionTimeline({ nodes, activeNodeId, onSelectNode }: ExecutionTimelineProps) {
  const timelineNodes = nodes.filter((node) => timelineKinds.has(node.kind));

  return (
    <Panel
      title="Timeline"
      description="Horizontal runtime sequence with inferred start, end and duration."
      bodyClassName="overflow-x-auto"
    >
      <div className="flex min-w-max items-stretch gap-3">
        {timelineNodes.map((node, index) => (
          <motion.button
            key={node.id}
            type="button"
            onClick={() => onSelectNode(node)}
            className="group flex cursor-pointer items-stretch gap-3 text-left focus:outline-none focus:ring-2 focus:ring-accent/20"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, delay: index * 0.025 }}
          >
            <div
              className={`w-56 rounded-lg border p-3 transition-colors duration-200 ${
                activeNodeId === node.id
                  ? 'border-accent bg-blue-50'
                  : 'border-line bg-white group-hover:border-lineStrong group-hover:bg-panel'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-normal text-muted">
                    {node.kind}
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-ink">
                    {node.component}
                  </div>
                </div>
                <ExecutionStatus status={node.status} />
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <Metric label="duration" value={formatDuration(node.duration)} />
                <Metric label="start" value={formatTime(node.startTime)} />
                <Metric label="end" value={formatTime(node.endTime)} />
              </dl>
            </div>
            {index < timelineNodes.length - 1 && (
              <motion.div
                className="mt-10 h-px w-8 bg-lineStrong"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-panel p-2">
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-ink">{value}</dd>
    </div>
  );
}

function formatDuration(duration?: number): string {
  return duration === undefined ? '-' : `${duration}ms`;
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleTimeString();
}
