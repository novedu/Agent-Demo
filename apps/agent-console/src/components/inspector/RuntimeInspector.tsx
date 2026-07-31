import { motion } from 'framer-motion';
import { Accordion, Badge, Card, JsonViewer } from '../ui';
import { getKindLabel, getStatusTone } from '../execution/execution-model';
import { EvaluationDashboard } from './EvaluationDashboard';
import { InspectorEmpty } from './InspectorEmpty';
import { KnowledgeExplorer } from './KnowledgeExplorer';
import { MemoryExplorer } from './MemoryExplorer';
import { RuntimeLogs } from './RuntimeLogs';
import { TraceExplorer } from './TraceExplorer';
import type { RuntimeInspectorProps } from './inspector-types';

export function RuntimeInspector({
  currentNode,
  nodes,
  events,
  memory,
  citations,
  evaluation,
  tools,
  status,
  isLoading,
  focusedObject,
  focusSection,
  highlightedCitationId,
  highlightedMemoryId,
  highlightedTraceId,
  onMemorySelect,
  onEvaluationTrace,
  onCitationSelect,
  onTraceSelect,
}: RuntimeInspectorProps) {
  const runtimeObject = focusedObject?.type === 'node' ? focusedObject.node : currentNode;
  const focusType = focusedObject?.type ?? runtimeObject?.kind;
  const defaultOpen = getDefaultOpenSection(focusType, focusSection);
  const runtimeMetrics = readRuntimeMetrics(events);

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-white px-4">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Runtime Inspector
          </div>
          <h2 className="mt-1 truncate text-base font-semibold leading-5 text-ink">
            {runtimeObject ? runtimeObject.component : 'Current Runtime Object'}
          </h2>
        </div>
        <Badge tone={status === 'error' ? 'danger' : status === 'running' ? 'info' : 'neutral'}>
          {status}
        </Badge>
      </header>

      <motion.div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="space-y-4">
          {runtimeObject ? (
            <section className="rounded-xl border border-line bg-white">
              <header className="flex min-h-12 items-center justify-between gap-3 border-b border-line px-4">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Current Runtime Object
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-ink">
                    {runtimeObject.component}
                  </div>
                </div>
                <Badge tone={getStatusTone(runtimeObject.status)}>{runtimeObject.status}</Badge>
              </header>
              <div className="grid gap-2 p-4 md:grid-cols-2">
                <Metric label="Type" value={getKindLabel(runtimeObject.kind)} />
                <Metric label="Duration" value={formatDuration(runtimeObject.duration)} />
                <Metric label="Retry" value={readMetric(runtimeObject.metadata, 'retryCount') ?? '0'} />
                <Metric label="Token" value={readMetric(runtimeObject.metadata, 'tokenCount') ?? '0'} />
                <Metric label="Cost" value={formatCost(runtimeMetrics.cost)} />
                <Metric label="Step" value={`${nodes.length}`} />
              </div>
            </section>
          ) : (
            <InspectorEmpty
              title="No focused runtime object"
              description="Select a graph node, timeline row, citation, memory record or trace span to inspect it here."
            />
          )}

          <Accordion
            defaultOpenId={defaultOpen}
            focusId={defaultOpen}
            items={[
              {
                id: 'execution',
                title: 'Execution',
                meta: <Badge>{runtimeObject?.component ?? 'Idle'}</Badge>,
                children: runtimeObject ? (
                  <JsonViewer title="Execution Snapshot" value={runtimeObject} collapsed />
                ) : (
                  <InspectorEmpty title="No execution selected" description="Inspect current runtime execution here." />
                ),
              },
              {
                id: 'input',
                title: 'Input',
                meta: <Badge tone="info">JSON</Badge>,
                children: <JsonViewer title="Input" value={runtimeObject?.input} collapsed />,
              },
              {
                id: 'output',
                title: 'Output',
                meta: <Badge tone="success">Result</Badge>,
                children: <JsonViewer title="Output" value={runtimeObject?.output} collapsed />,
              },
              {
                id: 'reasoning',
                title: 'Reasoning',
                meta: <Badge tone="info">LLM</Badge>,
                children: (
                  <JsonViewer
                    title="Reasoning"
                    value={getReasoning(runtimeObject, evaluation)}
                    collapsed
                  />
                ),
              },
              {
                id: 'trace',
                title: 'Trace',
                meta: <Badge>{events.length} spans</Badge>,
                children: (
                  <TraceExplorer
                    events={events}
                    isLoading={isLoading}
                    highlightedTraceId={highlightedTraceId}
                    onSelectEvent={onTraceSelect}
                  />
                ),
              },
              {
                id: 'evidence',
                title: 'Evidence',
                meta: <Badge tone="warning">{citations.length} refs</Badge>,
                children: (
                  <KnowledgeExplorer
                    citations={citations}
                    isLoading={isLoading}
                    highlightedCitationId={highlightedCitationId}
                    onSelectCitation={onCitationSelect}
                  />
                ),
              },
              {
                id: 'memory',
                title: 'Memory',
                meta: <Badge tone="neutral">{memory.length}</Badge>,
                children: (
                  <MemoryExplorer
                    memories={memory}
                    isLoading={isLoading}
                    highlightedMemoryId={highlightedMemoryId}
                    onSelectMemory={onMemorySelect}
                  />
                ),
              },
              {
                id: 'evaluation',
                title: 'Evaluation',
                meta: <Badge tone={evaluation ? 'success' : 'neutral'}>{evaluation ? 'Ready' : 'Pending'}</Badge>,
                children: (
                  <EvaluationDashboard
                    evaluation={evaluation}
                    isLoading={isLoading}
                    runtimeDuration={runtimeObject?.duration}
                    runtimeTokens={runtimeMetrics.tokens}
                    runtimeCost={runtimeMetrics.cost}
                    onViewTrace={onEvaluationTrace}
                  />
                ),
              },
              {
                id: 'logs',
                title: 'Logs',
                meta: <Badge>{events.length} events</Badge>,
                children: (
                  <RuntimeLogs
                    events={events}
                    isLoading={isLoading}
                    highlightedLogId={highlightedTraceId}
                    onSelectEvent={onTraceSelect}
                  />
                ),
              },
            ]}
          />
        </div>
      </motion.div>
      <footer className="shrink-0 border-t border-line bg-white px-4 py-2 text-[10px] text-muted">
        Focus mode · {tools.length} tool calls · {events.length} runtime events
      </footer>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-panel p-2.5">
      <div className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-xs font-semibold text-ink">{value}</div>
    </div>
  );
}

function getDefaultOpenSection(focusType?: string, focusSection?: string): string {
  if (focusSection) return focusSection;
  if (focusType === 'citation' || focusType === 'rag') return 'evidence';
  if (focusType === 'memory') return 'memory';
  if (focusType === 'evaluation') return 'evaluation';
  if (focusType === 'trace') return 'trace';
  if (focusType === 'log') return 'logs';
  return 'execution';
}

function getReasoning(runtimeObject: RuntimeInspectorProps['currentNode'], evaluation?: RuntimeInspectorProps['evaluation']) {
  if (!runtimeObject) return 'No focused runtime object.';
  if (runtimeObject.kind === 'reflection') return runtimeObject.output ?? runtimeObject.trace;
  if (runtimeObject.kind === 'evaluation') return evaluation?.feedback ?? runtimeObject.metadata;
  if (runtimeObject.kind === 'tool') return runtimeObject.metadata?.reasoning ?? runtimeObject.trace;
  return runtimeObject.metadata?.reasoning ?? runtimeObject.trace ?? runtimeObject.output;
}

function readMetric(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'number' || typeof value === 'string' ? String(value) : undefined;
}

function readRuntimeMetrics(events: RuntimeInspectorProps['events']) {
  const tokens = events.reduce((sum, event) => sum + readTokenCount(event.payload), 0);
  const timestamps = events.map((event) => event.timestamp).filter(Boolean);
  const duration = timestamps.length >= 2 ? Math.max(...timestamps) - Math.min(...timestamps) : undefined;
  const cost = tokens > 0 ? (tokens / 1000) * 0.002 : undefined;
  return { tokens, duration, cost };
}

function readTokenCount(payload: unknown): number {
  if (!payload || typeof payload !== 'object') return 0;
  const record = payload as Record<string, unknown>;
  const usage = record.usage;
  if (usage && typeof usage === 'object') {
    const usageRecord = usage as Record<string, unknown>;
    const total = usageRecord.total_tokens ?? usageRecord.totalTokens;
    return typeof total === 'number' ? total : 0;
  }
  const tokenCount = record.tokenCount ?? record.tokens;
  return typeof tokenCount === 'number' ? tokenCount : 0;
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return '-';
  return duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;
}

function formatCost(value?: number): string {
  if (value === undefined) return '-';
  return `$${value.toFixed(4)}`;
}
