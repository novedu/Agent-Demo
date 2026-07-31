import { motion } from 'framer-motion';
import { Accordion, Badge, Card, JsonViewer, Skeleton } from '../ui';
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
  const focusedNode = focusedObject?.type === 'node' ? focusedObject.node : currentNode;
  const defaultEvidence = getDefaultEvidenceSection(focusedObject?.type, focusSection, focusedNode?.kind);

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
      <header className="flex min-h-12 shrink-0 items-center justify-between gap-4 border-b border-line bg-white px-5">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Runtime Debugger
          </div>
          <h2 className="mt-1 truncate text-base font-semibold leading-5 text-ink">
            {focusedNode?.component ?? 'Inspector'}
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
        transition={{ duration: 0.18 }}
      >
        <div className="space-y-4">
          <FocusedContext
            node={focusedNode}
            nodeCount={nodes.length}
            eventCount={events.length}
            toolCount={tools.length}
            isLoading={isLoading}
          />

          <Accordion
            defaultOpenId={defaultEvidence}
            focusId={defaultEvidence}
            items={[
              {
                id: 'memory',
                title: 'Memory',
                meta: <Badge>{memory.length}</Badge>,
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
                id: 'knowledge',
                title: 'Knowledge',
                meta: <Badge>{citations.length} chunks</Badge>,
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
                id: 'evaluation',
                title: 'Evaluation',
                meta: <Badge tone={evaluation ? 'success' : 'neutral'}>{evaluation ? 'Ready' : 'Pending'}</Badge>,
                children: (
                  <EvaluationDashboard
                    evaluation={evaluation}
                    isLoading={isLoading}
                    onViewTrace={onEvaluationTrace}
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

function FocusedContext({
  node,
  nodeCount,
  eventCount,
  toolCount,
  isLoading,
}: {
  node: RuntimeInspectorProps['currentNode'];
  nodeCount: number;
  eventCount: number;
  toolCount: number;
  isLoading: boolean;
}) {
  if (isLoading && !node) return <Skeleton lines={8} />;
  if (!node) {
    return (
      <InspectorEmpty
        title="No focused runtime object"
        description="Click a graph node, timeline row, citation, memory or trace to focus the debugger."
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <header className="flex min-h-12 items-center justify-between gap-3 border-b border-line px-4">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Focused Runtime Object
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-ink">{node.component}</div>
        </div>
        <Badge tone={getStatusTone(node.status)}>{node.status}</Badge>
      </header>
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Component" value={getKindLabel(node.kind)} />
          <Metric label="Duration" value={formatDuration(node.duration)} />
          <Metric label="Retry" value={readMetric(node.metadata, 'retryCount') ?? '0'} />
          <Metric label="Token" value={readToken(node.metadata)} />
          <Metric label="Nodes" value={`${nodeCount}`} />
          <Metric label="Events" value={`${eventCount}`} />
        </div>

        <ModeSpecific node={node} toolCount={toolCount} />
      </div>
    </section>
  );
}

function ModeSpecific({
  node,
  toolCount,
}: {
  node: NonNullable<RuntimeInspectorProps['currentNode']>;
  toolCount: number;
}) {
  if (node.kind === 'tool') {
    return (
      <div className="space-y-3">
        <JsonViewer title="Arguments" value={node.arguments ?? node.input} collapsed />
        <JsonViewer title="Output" value={node.output} collapsed />
        <JsonViewer title="Metadata" value={{ ...node.metadata, toolCount }} collapsed />
      </div>
    );
  }

  if (node.kind === 'memory') {
    return <JsonViewer title="Memory Payload" value={node.output ?? node.trace} collapsed />;
  }

  if (node.kind === 'reflection') {
    return <JsonViewer title="Reflection Reasoning" value={node.output ?? node.trace} collapsed />;
  }

  if (node.kind === 'evaluation') {
    return <JsonViewer title="Evaluation Feedback" value={node.output ?? node.metadata} collapsed />;
  }

  if (node.kind === 'rag') {
    return <JsonViewer title="Retrieved Context" value={node.output ?? node.trace} collapsed />;
  }

  return <JsonViewer title="Runtime Payload" value={node.output ?? node.trace ?? node.input} collapsed />;
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

function getDefaultEvidenceSection(
  focusType?: string,
  focusSection?: string,
  nodeKind?: string,
): string {
  if (focusSection) return focusSection;
  if (focusType === 'citation' || nodeKind === 'rag') return 'knowledge';
  if (focusType === 'memory' || nodeKind === 'memory') return 'memory';
  if (focusType === 'evaluation' || nodeKind === 'evaluation') return 'evaluation';
  if (focusType === 'trace') return 'trace';
  return 'trace';
}

function readMetric(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'number' || typeof value === 'string' ? String(value) : undefined;
}

function readToken(metadata: Record<string, unknown> | undefined): string {
  const usage = metadata?.usage;
  const usageRecord = typeof usage === 'object' && usage !== null ? (usage as Record<string, unknown>) : {};
  const value = usageRecord.total_tokens ?? usageRecord.totalTokens ?? metadata?.tokenCount ?? metadata?.tokens;
  return typeof value === 'number' ? value.toLocaleString() : '-';
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return '-';
  return duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;
}
