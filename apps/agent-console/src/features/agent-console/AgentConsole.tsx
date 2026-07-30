import { useMemo, useState } from 'react';
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
  type ExecutionNodeRecord,
} from '../../components/execution/execution-model';
import { RuntimeInspector } from '../../components/inspector';
import { useAgentStream } from '../../hooks/useAgentStream';
import { useAgentStore } from '../../store/agentStore';

const defaultTask = '分析华东区域销售下降原因，并生成报告';

export function AgentConsole() {
  const { start } = useAgentStream();
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
  const currentNodeId = getCurrentNodeId(nodes);
  const progress = getExecutionProgress(nodes);
  const [selectedNode, setSelectedNode] = useState<ExecutionNodeRecord | undefined>();
  const activeNodeId = selectedNode?.id ?? currentNodeId;
  const currentNode = nodes.find((node) => node.id === currentNodeId);
  const hasTaskActivity = status !== 'idle' || events.length > 0 || messages.length > 1;
  const isLoading = status === 'running';
  const runtimeMetrics = getRuntimeMetrics(nodes, events);

  return (
    <main className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_minmax(220px,auto)] gap-4 bg-[var(--studio-bg)] p-4 text-ink">
      <RuntimeHeader
        status={status}
        progress={progress}
        nodeCount={nodes.length}
        activeNode={currentNode?.component}
        currentStep={currentNode?.component}
        duration={runtimeMetrics.duration}
        tokenCount={runtimeMetrics.tokenCount}
        estimatedCost={runtimeMetrics.estimatedCost}
      />

      <section className="grid min-h-0 gap-4 lg:grid-cols-[minmax(360px,0.9fr)_minmax(460px,1.1fr)] 2xl:grid-cols-[minmax(420px,0.85fr)_minmax(680px,1.15fr)]">
        <div className="min-h-0 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
          <ChatPanel messages={messages} isStreaming={isStreaming} onSubmit={start} />
        </div>
        <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(360px,1fr)_minmax(320px,0.72fr)]">
          <div className="min-h-0">
            {hasTaskActivity ? (
              <ExecutionExplorer
                nodes={nodes}
                activeNodeId={activeNodeId}
                onSelectNode={setSelectedNode}
              />
            ) : (
              <ExecutionEmptyState onStart={() => start(defaultTask)} />
            )}
          </div>
          <RuntimeInspector
            currentNode={currentNode}
            nodes={nodes}
            events={events}
            plan={plan}
            state={state}
            memory={memory}
            citations={citations}
            evaluation={evaluation}
            tools={tools}
            status={status}
            isLoading={isLoading}
          />
        </div>
      </section>

      <ExecutionTimeline nodes={nodes} activeNodeId={activeNodeId} onSelectNode={setSelectedNode} />
      <StepDrawer node={selectedNode} onClose={() => setSelectedNode(undefined)} />
    </main>
  );
}

function getRuntimeMetrics(nodes: ExecutionNodeRecord[], events: { timestamp: number; payload: unknown }[]) {
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
