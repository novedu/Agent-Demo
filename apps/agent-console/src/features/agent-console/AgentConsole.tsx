import { useMemo, useState } from 'react';
import { ChatPanel } from '../../components/chat/ChatPanel';
import {
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
import { useAgentStream } from '../../hooks/useAgentStream';
import { useAgentStore } from '../../store/agentStore';

export function AgentConsole() {
  const { start } = useAgentStream();
  const { messages, plan, events, workflow, tools, citations, evaluation, status, isStreaming } =
    useAgentStore();

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

  return (
    <main className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 bg-[var(--studio-bg)] p-4 text-ink">
      <RuntimeHeader
        status={status}
        progress={progress}
        nodeCount={nodes.length}
        activeNode={nodes.find((node) => node.id === currentNodeId)?.component}
      />

      <section className="grid min-h-0 gap-4 xl:grid-cols-[minmax(420px,0.95fr)_minmax(520px,1.15fr)]">
        <div className="min-h-0 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
          <ChatPanel messages={messages} isStreaming={isStreaming} onSubmit={start} />
        </div>
        <div className="min-h-0">
          <ExecutionExplorer
            nodes={nodes}
            activeNodeId={activeNodeId}
            onSelectNode={setSelectedNode}
          />
        </div>
      </section>

      <ExecutionTimeline nodes={nodes} activeNodeId={activeNodeId} onSelectNode={setSelectedNode} />
      <StepDrawer node={selectedNode} onClose={() => setSelectedNode(undefined)} />
    </main>
  );
}
