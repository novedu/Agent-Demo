import { motion } from 'framer-motion';
import { Accordion, Badge, Card, JsonViewer } from '../ui';
import { getKindLabel, getStatusTone } from '../execution/execution-model';
import { EvaluationDashboard } from './EvaluationDashboard';
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
  runtimeOverview,
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
    <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 bg-white shadow-none">
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-3">
        <div className="min-w-0">
          <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
            {runtimeObject ? 'Runtime Inspector' : 'Runtime Overview'}
          </div>
          <h2 className="mt-0.5 truncate text-sm font-semibold leading-4 text-ink">
            {runtimeObject ? runtimeObject.component : 'System Status'}
          </h2>
        </div>
        <Badge tone={status === 'error' ? 'danger' : status === 'running' ? 'info' : 'neutral'} className="text-[10px] px-1.5 py-0.5">
          {status}
        </Badge>
      </header>

      <motion.div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {runtimeObject ? (
          <div className="p-4">
            <section className="border-b border-line pb-4">
              <header className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">{runtimeObject.component}</div>
                  <div className="mt-0.5 text-[10px] text-muted">
                    {getKindLabel(runtimeObject.kind)}
                  </div>
                </div>
                <Badge tone={getStatusTone(runtimeObject.status)}>{runtimeObject.status}</Badge>
              </header>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Metric label="Duration" value={formatDuration(runtimeObject.duration)} />
                <Metric label="Token" value={readMetric(runtimeObject.metadata, 'tokenCount') ?? '0'} />
                <Metric label="Cost" value={formatCost(runtimeMetrics.cost)} />
                <Metric label="Step" value={`${nodes.length}`} />
              </div>
            </section>

            <div className="mt-4">
            <Accordion
              defaultOpenId={defaultOpen}
              focusId={defaultOpen}
              variant="flush"
              items={[
                {
                  id: 'execution',
                  title: 'Execution',
                  meta: <Badge>{runtimeObject.component}</Badge>,
                  children: (
                    <JsonViewer title="Execution Snapshot" value={runtimeObject} collapsed />
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
          </div>
        ) : (
          <EmptyInspector runtimeOverview={runtimeOverview} />
        )}
      </motion.div>

      <footer className="shrink-0 border-t border-line bg-white px-3 py-1.5 text-[9px] text-muted">
        Focus mode · {tools.length} tool calls · {events.length} runtime events
      </footer>
    </Card>
  );
}

function EmptyInspector({
  runtimeOverview,
}: {
  runtimeOverview: RuntimeInspectorProps['runtimeOverview'];
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <section className="border-b border-line bg-blue-50/60 p-3">
        <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-blue-700">
          Selected Runtime Object
        </div>
        <h3 className="mt-1 text-sm font-semibold text-ink">No object selected</h3>
        <p className="mt-2 text-xs leading-5 text-muted">
          Select a graph node or timeline span to inspect the runtime object that produced it.
        </p>
      </section>

      <section className="border-b border-line bg-white p-3">
        <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
          Runtime Context
        </div>
        <div className="space-y-2">
          <RuntimeContextRow label="Model" value={runtimeOverview.model} />
          <RuntimeContextRow label="Environment" value={runtimeOverview.environment} />
          <RuntimeContextRow label="Task" value={truncate(runtimeOverview.taskLabel, 28)} />
          <RuntimeContextRow label="Current step" value={runtimeOverview.currentStep} />
          <RuntimeContextRow label="Progress" value={`${runtimeOverview.progress}%`} />
        </div>
      </section>

      <section className="border-b border-line bg-slate-50/60 p-3">
        <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
          Live Runtime Signals
        </div>
        <div className="grid grid-cols-2 gap-2">
          <RuntimeContextRow label="Events" value={String(runtimeOverview.eventCount)} />
          <RuntimeContextRow label="Tools" value={String(runtimeOverview.toolCount)} />
          <RuntimeContextRow label="Knowledge" value={String(runtimeOverview.citationCount)} />
          <RuntimeContextRow label="Memory" value={String(runtimeOverview.memoryCount)} />
          <RuntimeContextRow
            label="Evaluation"
            value={
              runtimeOverview.evaluationScore === undefined
                ? 'Pending'
                : `${Math.round(runtimeOverview.evaluationScore * 100)}%`
            }
          />
          <RuntimeContextRow label="Last event" value={runtimeOverview.latestEvent ?? 'None'} />
        </div>
      </section>

      <section className="bg-white p-3">
        <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
          Runtime Path
        </div>
        <div className="space-y-2">
          {runtimeOverview.availableSignals.map((signal) => (
            <RuntimeObjectPreview key={signal.label} label={signal.label} detail={signal.value} />
          ))}
        </div>
      </section>
    </div>
  );
}

function RuntimeContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[11px] text-muted">{label}</span>
      <span className="font-mono text-[11px] font-semibold text-ink">{value}</span>
    </div>
  );
}

function RuntimeObjectPreview({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="border-t border-line py-2 first:border-t-0">
      <div className="text-xs font-semibold text-ink">{label}</div>
      <div className="mt-0.5 text-[10px] leading-4 text-muted">{detail}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-2">
      <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</div>
      <div className="mt-0.5 truncate font-mono text-xs font-semibold text-ink">{value}</div>
    </div>
  );
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
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
