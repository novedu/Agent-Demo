import { useEffect, useMemo, useState } from 'react';
import { ChatPanel } from '../../components/chat/ChatPanel';
import {
  ExecutionEmptyState,
  ExecutionExplorer,
  ExecutionTimeline,
  RuntimeHeader,
  StepDrawer,
} from '../../components/execution';
import {
  buildExecutionNodes,
  getCurrentNodeId,
  getExecutionProgress,
  type FocusedRuntimeObject,
  type ExecutionNodeRecord,
} from '../../components/execution/execution-model';
import type { AgentEvent, CitationRecord, MemoryRecord } from '../../types/agent';
import { RuntimeInspector } from '../../components/inspector';
import { Badge, Card, SparkIcon } from '../../components/ui';
import { useAgentStream } from '../../hooks/useAgentStream';
import { useAgentStore } from '../../store/agentStore';

const defaultTask = '分析华东区域销售下降原因，并生成报告';

const quickStartTasks = [
  { label: '分析销售下降', value: '分析华东区域销售下降原因，并生成报告' },
  { label: '总结日报', value: '总结今天的业务日报，并提炼风险点' },
  { label: 'RAG QA', value: '公司的年假政策是什么' },
  { label: 'Travel Planner', value: '帮我规划一个三天的上海出差行程' },
];

export function AgentConsole() {
  const { start, stop } = useAgentStream();
  const {
    messages,
    plan,
    events,
    workflow,
    tools,
    citations,
    memory,
    evaluation,
    state,
    status,
    isStreaming,
  } = useAgentStore();

  const nodes = useMemo(
    () =>
      buildExecutionNodes({
        plan,
        tools,
        events,
        workflow,
        citations,
        evaluation,
        messages,
        status,
      }),
    [citations, evaluation, events, messages, plan, status, tools, workflow],
  );
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  const hasTaskActivity = status !== 'idle' || events.length > 0 || Boolean(latestUserMessage);
  const displayNodes = hasTaskActivity ? nodes : [];
  const currentNodeId = hasTaskActivity ? getCurrentNodeId(displayNodes) : undefined;
  const progress = hasTaskActivity ? getExecutionProgress(displayNodes) : 0;
  const [selectedNode, setSelectedNode] = useState<ExecutionNodeRecord | undefined>();
  const [focusedRuntimeObject, setFocusedRuntimeObject] = useState<FocusedRuntimeObject>();
  const [focusedNodeId, setFocusedNodeId] = useState<string | undefined>(currentNodeId);
  const [focusedInspectorSection, setFocusedInspectorSection] = useState<string>();
  const [highlightedMessageId, setHighlightedMessageId] = useState<string>();
  const [highlightedCitationId, setHighlightedCitationId] = useState<string>();
  const [highlightedMemoryId, setHighlightedMemoryId] = useState<string>();
  const [highlightedTraceId, setHighlightedTraceId] = useState<string>();
  const activeNodeId = focusedNodeId ?? currentNodeId;
  const currentNode = displayNodes.find((node) => node.id === currentNodeId);
  const activeNode = displayNodes.find((node) => node.id === activeNodeId) ?? currentNode;
  const isLoading = status === 'running';
  const runtimeMetrics = getRuntimeMetrics(displayNodes, events);

  useEffect(() => {
    if (!hasTaskActivity) {
      setFocusedRuntimeObject(undefined);
      setFocusedNodeId(undefined);
      setSelectedNode(undefined);
      return;
    }

    if (!focusedRuntimeObject && currentNode) {
      setFocusedRuntimeObject({ type: 'node', id: currentNode.id, node: currentNode });
      setFocusedNodeId(currentNode.id);
    }
  }, [currentNode, focusedRuntimeObject, hasTaskActivity]);

  function handleTimelineSelect(node: ExecutionNodeRecord) {
    setFocusedNodeId(node.id);
    setFocusedRuntimeObject({ type: 'node', id: node.id, node });
    setSelectedNode(undefined);
    setFocusedInspectorSection('trace');
  }

  function handleGraphSelect(node: ExecutionNodeRecord) {
    setFocusedNodeId(node.id);
    setFocusedRuntimeObject({ type: 'node', id: node.id, node });
    setSelectedNode(node);
    setFocusedInspectorSection('trace');
  }

  function handleCitationFocus(citationId?: string) {
    const citation = findCitation(citations, citationId);
    setFocusedInspectorSection('knowledge');
    if (!citation) return;
    setFocusedRuntimeObject({ type: 'citation', id: citation.id });
    setTimedHighlight(setHighlightedCitationId, citation.id);
  }

  function handleCitationSelect(citation: CitationRecord) {
    setFocusedRuntimeObject({ type: 'citation', id: citation.id });
    setFocusedInspectorSection('knowledge');
    setTimedHighlight(setHighlightedCitationId, citation.id);
  }

  function handleMemorySelect(memoryItem?: MemoryRecord) {
    if (memoryItem) {
      setFocusedRuntimeObject({ type: 'memory', id: memoryItem.id });
      setTimedHighlight(setHighlightedMemoryId, memoryItem.id);
    }
    setFocusedInspectorSection('memory');
    setHighlightedMessageId(latestUserMessage?.id);
    window.setTimeout(() => setHighlightedMessageId(undefined), 2000);
  }

  function handleEvaluationTrace() {
    setFocusedRuntimeObject({ type: 'evaluation', id: 'evaluation' });
    setFocusedInspectorSection('trace');
    const event = [...events].reverse().find((item) => item.type === 'evaluation_complete');
    if (event) handleTraceSelect(event);
  }

  function handleTraceSelect(event: AgentEvent) {
    const relatedNode = findNodeForEvent(displayNodes, event);
    setFocusedRuntimeObject({ type: 'trace', id: event.id, eventType: event.type });
    setFocusedInspectorSection('trace');
    setTimedHighlight(setHighlightedTraceId, event.id);

    if (relatedNode) {
      setFocusedNodeId(relatedNode.id);
      setFocusedRuntimeObject({ type: 'node', id: relatedNode.id, node: relatedNode });
      setSelectedNode(relatedNode);
    }
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-panel text-ink">
      <RuntimeHeader
        status={status}
        progress={progress}
        nodeCount={displayNodes.length}
        activeNode={activeNode?.component}
        currentStep={currentNode?.component}
        currentTask={latestUserMessage?.content}
        environment="local"
        hasTaskActivity={hasTaskActivity}
        duration={runtimeMetrics.duration}
        tokenCount={runtimeMetrics.tokenCount}
        estimatedCost={runtimeMetrics.estimatedCost}
      />

      <section className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-h-0 min-w-0 flex-col gap-4 overflow-hidden">
          <div className="min-h-0 flex-[0_1_62%] overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <ChatPanel
              messages={messages}
              isStreaming={isStreaming}
              onSubmit={start}
              onStop={stop}
              onRegenerate={latestUserMessage ? () => start(latestUserMessage.content) : undefined}
              onCitationFocus={handleCitationFocus}
              highlightedMessageId={highlightedMessageId}
            />
          </div>

          <div className="min-h-0 flex-[1_1_38%] overflow-hidden">
            {hasTaskActivity ? (
              <ExecutionExplorer
                nodes={displayNodes}
                activeNodeId={activeNodeId}
                onSelectNode={handleGraphSelect}
              />
            ) : (
              <ExecutionEmptyState onStart={() => start(defaultTask)} />
            )}
          </div>
        </div>

        <div className="hidden min-h-0 overflow-hidden lg:block">
          <RuntimeInspector
            currentNode={activeNode}
            nodes={displayNodes}
            events={events}
            plan={plan}
            state={state}
            memory={memory}
            citations={citations}
            evaluation={evaluation}
            tools={tools}
            status={status}
            isLoading={isLoading}
            focusedObject={focusedRuntimeObject}
            focusSection={focusedInspectorSection}
            highlightedCitationId={highlightedCitationId}
            highlightedMemoryId={highlightedMemoryId}
            highlightedTraceId={highlightedTraceId}
            onMemorySelect={handleMemorySelect}
            onEvaluationTrace={handleEvaluationTrace}
            onCitationSelect={handleCitationSelect}
            onTraceSelect={handleTraceSelect}
          />
        </div>
      </section>

      <section className="h-[248px] shrink-0 border-t border-line bg-white p-4">
        {hasTaskActivity ? (
          <ExecutionTimeline
            nodes={displayNodes}
            activeNodeId={activeNodeId}
            onSelectNode={handleTimelineSelect}
          />
        ) : (
          <TimelineIdleState onStart={start} />
        )}
      </section>

      <StepDrawer node={selectedNode} onClose={() => setSelectedNode(undefined)} />
    </main>
  );
}

function TimelineIdleState({ onStart }: { onStart: (task: string) => void }) {
  return (
    <Card className="flex h-full min-h-0 overflow-hidden">
      <div className="flex min-w-[260px] shrink-0 flex-col justify-between border-r border-line bg-panel p-4">
        <div>
          <div className="flex items-center gap-2">
            <SparkIcon className="h-4 w-4 text-accent" />
            <h2 className="text-base font-semibold text-ink">Runtime Timeline</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            No running task. Start from a template to stream timeline events here.
          </p>
        </div>
        <Badge tone="neutral">Ready</Badge>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickStartTasks.map((task) => (
            <button
              key={task.label}
              type="button"
              onClick={() => onStart(task.value)}
              className="min-h-20 cursor-pointer rounded-xl border border-line bg-white p-4 text-left transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="text-sm font-semibold text-ink">{task.label}</div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{task.value}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <EmptyMetric label="Recent Tasks" value="No active run" />
          <EmptyMetric label="Templates" value="4 examples" />
          <EmptyMetric label="Runtime" value="Connected" />
        </div>
      </div>
    </Card>
  );
}

function EmptyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function getRuntimeMetrics(
  nodes: ExecutionNodeRecord[],
  events: { timestamp: number; payload: unknown }[],
) {
  const timestamps = events.map((event) => event.timestamp).filter((timestamp) => timestamp > 0);
  const duration =
    timestamps.length >= 2 ? Math.max(...timestamps) - Math.min(...timestamps) : undefined;
  const tokenCount = events.reduce((sum, event) => sum + readTokenCount(event.payload), 0);
  const estimatedCost = tokenCount > 0 ? (tokenCount / 1000) * 0.002 : undefined;

  return {
    duration,
    tokenCount: tokenCount > 0 ? tokenCount : undefined,
    estimatedCost,
    stepCount: nodes.length,
  };
}

function readTokenCount(payload: unknown): number {
  if (!isRecord(payload)) return 0;
  const usage = payload.usage;
  if (isRecord(usage)) {
    const total = usage.total_tokens ?? usage.totalTokens;
    return typeof total === 'number' ? total : 0;
  }
  const tokenCount = payload.tokenCount ?? payload.tokens;
  return typeof tokenCount === 'number' ? tokenCount : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function findCitation(citations: CitationRecord[], citationId?: string): CitationRecord | undefined {
  if (!citationId) return citations[0];
  return (
    citations.find((citation) => citation.id === citationId) ??
    citations.find((citation) => `citation-${citation.chunk}` === citationId) ??
    citations[0]
  );
}

function findNodeForEvent(
  nodes: ExecutionNodeRecord[],
  event: AgentEvent,
): ExecutionNodeRecord | undefined {
  if (event.type.startsWith('plan')) return nodes.find((node) => node.kind === 'planner');
  if (event.type.startsWith('tool')) {
    const toolName = readString(event.payload, 'toolName');
    return (
      nodes.find((node) => node.kind === 'tool' && node.component === toolName) ??
      nodes.find((node) => node.kind === 'tool')
    );
  }
  if (event.type === 'rag_retrieve') return nodes.find((node) => node.kind === 'rag');
  if (event.type === 'memory_update') return nodes.find((node) => node.kind === 'memory');
  if (event.type === 'reflection') return nodes.find((node) => node.kind === 'reflection');
  if (event.type.startsWith('evaluation')) return nodes.find((node) => node.kind === 'evaluation');
  if (event.type === 'final_answer' || event.type === 'task_complete') {
    return nodes.find((node) => node.kind === 'answer');
  }
  return nodes.find((node) => node.trace === event || node.id === event.id);
}

function readString(payload: unknown, key: string): string | undefined {
  if (!isRecord(payload)) return undefined;
  const value = payload[key];
  return typeof value === 'string' ? value : undefined;
}

function setTimedHighlight(
  setter: (value: string | undefined) => void,
  id: string,
  duration = 2000,
) {
  setter(id);
  window.setTimeout(() => setter(undefined), duration);
}
