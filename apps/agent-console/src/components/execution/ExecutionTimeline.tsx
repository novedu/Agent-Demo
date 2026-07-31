import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Badge, ChevronRightIcon, JsonViewer, Panel } from '../ui';
import { classNames } from '../ui/classNames';
import { ExecutionStatus } from './ExecutionStatus';
import { getKindLabel, type ExecutionNodeRecord } from './execution-model';

interface ExecutionTimelineProps {
  nodes: ExecutionNodeRecord[];
  activeNodeId?: string;
  onSelectNode: (node: ExecutionNodeRecord) => void;
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

export function ExecutionTimeline({ nodes, activeNodeId, onSelectNode }: ExecutionTimelineProps) {
  const [selectedId, setSelectedId] = useState<string>(activeNodeId ?? nodes[0]?.id ?? '');
  const flowNodes = useMemo(() => nodes.filter((node) => flowKinds.has(node.kind)), [nodes]);
  const selectedNode = flowNodes.find((node) => node.id === selectedId) ?? flowNodes[0];

  useEffect(() => {
    if (activeNodeId && flowNodes.some((node) => node.id === activeNodeId)) {
      setSelectedId(activeNodeId);
      return;
    }
    if (flowNodes[0] && !flowNodes.some((node) => node.id === selectedId)) {
      setSelectedId(flowNodes[0].id);
    }
  }, [activeNodeId, flowNodes, selectedId]);

  return (
    <Panel
      title="Flow Timeline"
      description="Chrome DevTools and LangSmith style runtime flow."
      className="h-full"
      bodyClassName="flex min-h-0 flex-col gap-3 overflow-hidden p-3"
    >
      <div className="rounded-lg border border-line bg-panel px-3 py-2">
        <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          <span>Runtime Flow</span>
          <div className="flex items-center gap-2">
            <Badge tone="info">Time</Badge>
            <Badge tone="neutral">Level</Badge>
            <Badge tone="success">Jump</Badge>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
          {flowNodes.map((node, index) => {
            const isActive = node.id === activeNodeId;
            const isSelected = node.id === selectedId;
            return (
              <div key={node.id} className="flex items-center gap-2">
                <FlowNode
                  node={node}
                  active={isActive}
                  selected={isSelected}
                  onSelect={(next) => {
                    setSelectedId(next.id);
                    onSelectNode(next);
                  }}
                />
                {index < flowNodes.length - 1 && (
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-lineStrong" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-h-0 overflow-hidden rounded-lg border border-line bg-white">
          <header className="flex min-h-10 items-center justify-between border-b border-line px-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Selected Event
              </div>
              <div className="text-sm font-semibold text-ink">{selectedNode?.component ?? 'Idle'}</div>
            </div>
            {selectedNode && <ExecutionStatus status={selectedNode.status} />}
          </header>
          <div className="min-h-0 space-y-2 overflow-y-auto p-4">
            {selectedNode ? (
              <>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <MiniMetric label="Time" value={formatTime(selectedNode.startTime)} />
                  <MiniMetric label="Duration" value={formatDuration(selectedNode.duration)} />
                  <MiniMetric label="Level" value={getKindLabel(selectedNode.kind)} />
                  <MiniMetric label="Retry" value={readRetry(selectedNode)} />
                </div>
                <JsonViewer title="Input" value={selectedNode.input} collapsed />
                <JsonViewer title="Arguments" value={selectedNode.arguments} collapsed />
                <JsonViewer title="Output" value={selectedNode.output} collapsed />
                <JsonViewer title="Metadata" value={selectedNode.metadata} collapsed />
                <JsonViewer title="Trace" value={selectedNode.trace} collapsed />
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-lineStrong bg-panel p-4 text-sm text-muted">
                Select a runtime event to inspect the flow.
              </div>
            )}
          </div>
        </div>

        <div className="min-h-0 overflow-hidden rounded-lg border border-line bg-panel p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Flow Legend
          </div>
          <div className="mt-3 space-y-2 text-xs text-muted">
            <Legend label="Planner" tone="info" />
            <Legend label="Knowledge" tone="warning" />
            <Legend label="Tool" tone="success" />
            <Legend label="Memory" tone="neutral" />
            <Legend label="Reflection" tone="info" />
            <Legend label="Evaluation" tone="info" />
            <Legend label="Answer" tone="neutral" />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function FlowNode({
  node,
  active,
  selected,
  onSelect,
}: {
  node: ExecutionNodeRecord;
  active: boolean;
  selected: boolean;
  onSelect: (node: ExecutionNodeRecord) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(node)}
      whileHover={{ opacity: 1 }}
      className={classNames(
        'flex min-h-[92px] w-[176px] shrink-0 cursor-pointer flex-col justify-between rounded-lg border px-3 py-2 text-left transition-colors duration-200',
        active
          ? 'border-blue-300 bg-blue-50 shadow-[0_0_0_2px_rgba(29,78,216,0.16)]'
          : selected
            ? 'border-lineStrong bg-white'
            : 'border-line bg-white hover:border-blue-200 hover:bg-blue-50/40',
        active && 'ring-2 ring-blue-200',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">{node.component}</div>
          <div className="truncate text-[11px] text-muted">{getKindLabel(node.kind)}</div>
        </div>
        <Badge tone={getTone(node.kind)}>{node.status}</Badge>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
          <span>{formatTime(node.startTime)}</span>
          <span>{formatDuration(node.duration)}</span>
        </div>
        <div className="text-[11px] text-muted line-clamp-2">{node.summary}</div>
      </div>
    </motion.button>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</div>
      <div className="mt-1 truncate font-mono text-xs font-semibold text-ink">{value}</div>
    </div>
  );
}

function Legend({ label, tone }: { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-white px-2 py-1.5">
      <span className="text-ink">{label}</span>
      <Badge tone={tone}>{tone}</Badge>
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

function readRetry(node: ExecutionNodeRecord): string {
  const retry = node.metadata?.retryCount ?? node.metadata?.retry;
  return typeof retry === 'number' ? `${retry}` : '0';
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return '-';
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
