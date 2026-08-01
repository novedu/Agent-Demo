import { useEffect, useMemo, useState } from 'react';
import { ChatPanel } from '../../components/chat/ChatPanel';
import {
  ExecutionExplorer,
  ExecutionGraphEmptyState,
  ExecutionTimeline,
  StepDrawer,
} from '../../components/execution';
import {
  buildExecutionNodes,
  getCurrentNodeId,
  type FocusedRuntimeObject,
  type ExecutionNodeRecord,
} from '../../components/execution/execution-model';
import type { AgentEvent, CitationRecord, MemoryRecord } from '../../types/agent';
import { RuntimeInspector } from '../../components/inspector';
import { useAgentStream } from '../../hooks/useAgentStream';
import { useAgentStore } from '../../store/agentStore';
import { buildRuntimeOverview } from './runtime-overview';
import {
  buildRuntimeDependencyEdges,
  buildRuntimeObjects,
  type RuntimeObject,
} from './runtime-object-model';

const defaultTask = '分析华东销售下降原因，并生成报告';

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
  const latestUserMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'user'),
    [messages],
  );
  const hasTaskActivity = status !== 'idle' || events.length > 0 || Boolean(latestUserMessage);
  const displayNodes = useMemo(() => (hasTaskActivity ? nodes : []), [hasTaskActivity, nodes]);
  const runtimeObjects = useMemo(() => buildRuntimeObjects(displayNodes), [displayNodes]);
  const dependencyEdges = useMemo(
    () => buildRuntimeDependencyEdges(runtimeObjects),
    [runtimeObjects],
  );
  const currentNodeId = hasTaskActivity ? getCurrentNodeId(displayNodes) : undefined;
  const [selectedRuntimeObject, setSelectedRuntimeObject] = useState<RuntimeObject | undefined>();
  const [focusedRuntimeObject, setFocusedRuntimeObject] = useState<FocusedRuntimeObject>();
  const [focusedNodeId, setFocusedNodeId] = useState<string | undefined>(currentNodeId);
  const [focusedInspectorSection, setFocusedInspectorSection] = useState<string>();
  const [autoFollowRuntime, setAutoFollowRuntime] = useState(true);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string>();
  const [highlightedCitationId, setHighlightedCitationId] = useState<string>();
  const [highlightedMemoryId, setHighlightedMemoryId] = useState<string>();
  const [highlightedTraceId, setHighlightedTraceId] = useState<string>();
  const activeNodeId = focusedNodeId ?? currentNodeId;
  const currentNode = displayNodes.find((node) => node.id === currentNodeId);
  const activeNode = displayNodes.find((node) => node.id === activeNodeId) ?? currentNode;
  const currentTool =
    currentNode?.kind === 'tool'
      ? currentNode.component
      : activeNode?.kind === 'tool'
        ? activeNode.component
        : undefined;
  const isLoading = status === 'running';
  const runtimeOverview = useMemo(
    () =>
      buildRuntimeOverview({
        messages,
        events,
        plan,
        tools,
        citations,
        memory,
        evaluation,
        state,
        status,
        currentNodeComponent: currentNode?.component,
        currentTool,
      }),
    [
      citations,
      currentNode?.component,
      currentTool,
      evaluation,
      events,
      memory,
      messages,
      plan,
      state,
      status,
      tools,
    ],
  );

  useEffect(() => {
    if (!hasTaskActivity) {
      setFocusedRuntimeObject(undefined);
      setFocusedNodeId(undefined);
      setSelectedRuntimeObject(undefined);
      setAutoFollowRuntime(true);
      return;
    }

    if ((autoFollowRuntime || !focusedRuntimeObject) && currentNode) {
      setFocusedRuntimeObject({ type: 'node', id: currentNode.id, node: currentNode });
      setFocusedNodeId(currentNode.id);
    }
  }, [autoFollowRuntime, currentNode, focusedRuntimeObject, hasTaskActivity]);

  function handleTimelineSelect(node: ExecutionNodeRecord) {
    setAutoFollowRuntime(false);
    setFocusedNodeId(node.id);
    setFocusedRuntimeObject({ type: 'node', id: node.id, node });
    setSelectedRuntimeObject(undefined);
    setFocusedInspectorSection('trace');
  }

  function handleGraphSelect(node: ExecutionNodeRecord) {
    setAutoFollowRuntime(false);
    setFocusedNodeId(node.id);
    setFocusedRuntimeObject({ type: 'node', id: node.id, node });
    setSelectedRuntimeObject(runtimeObjects.find((object) => object.id === node.id));
    setFocusedInspectorSection('trace');
  }

  function handleCitationFocus(citationId?: string) {
    setAutoFollowRuntime(false);
    const citation = findCitation(citations, citationId);
    setFocusedInspectorSection('knowledge');
    if (!citation) return;
    setFocusedRuntimeObject({ type: 'citation', id: citation.id });
    setTimedHighlight(setHighlightedCitationId, citation.id);
  }

  function handleCitationSelect(citation: CitationRecord) {
    setAutoFollowRuntime(false);
    setFocusedRuntimeObject({ type: 'citation', id: citation.id });
    setFocusedInspectorSection('knowledge');
    setTimedHighlight(setHighlightedCitationId, citation.id);
  }

  function handleMemorySelect(memoryItem?: MemoryRecord) {
    setAutoFollowRuntime(false);
    if (memoryItem) {
      setFocusedRuntimeObject({ type: 'memory', id: memoryItem.id });
      setTimedHighlight(setHighlightedMemoryId, memoryItem.id);
    }
    setFocusedInspectorSection('memory');
    setHighlightedMessageId(latestUserMessage?.id);
    window.setTimeout(() => setHighlightedMessageId(undefined), 2000);
  }

  function handleEvaluationTrace() {
    setAutoFollowRuntime(false);
    setFocusedRuntimeObject({ type: 'evaluation', id: 'evaluation' });
    setFocusedInspectorSection('trace');
    const event = [...events].reverse().find((item) => item.type === 'evaluation_complete');
    if (event) handleTraceSelect(event);
  }

  function handleTraceSelect(event: AgentEvent) {
    setAutoFollowRuntime(false);
    const relatedNode = findNodeForEvent(displayNodes, event);
    setFocusedRuntimeObject({ type: 'trace', id: event.id, eventType: event.type });
    setFocusedInspectorSection('trace');
    setTimedHighlight(setHighlightedTraceId, event.id);

    if (relatedNode) {
      setFocusedNodeId(relatedNode.id);
      setFocusedRuntimeObject({ type: 'node', id: relatedNode.id, node: relatedNode });
      setSelectedRuntimeObject(runtimeObjects.find((object) => object.id === relatedNode.id));
    }
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-white text-ink">
      <section className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div
          className="grid min-h-0 min-w-0 overflow-hidden"
          style={{ gridTemplateRows: 'minmax(0, 1fr) clamp(240px, 34vh, 320px)' }}
        >
          <div className="min-h-0 min-w-0 overflow-hidden bg-white">
            <ChatPanel
              messages={messages}
              isStreaming={isStreaming}
              currentStep={currentNode?.component}
              currentTool={currentTool}
              onSubmit={start}
              onStop={stop}
              onRegenerate={latestUserMessage ? () => start(latestUserMessage.content) : undefined}
              onCitationFocus={handleCitationFocus}
              highlightedMessageId={highlightedMessageId}
              hasTaskActivity={hasTaskActivity}
              onStartTask={(input = defaultTask) => {
                setAutoFollowRuntime(true);
                start(input);
              }}
              runtimeOverview={runtimeOverview}
              runtimeObjects={runtimeObjects}
            />
          </div>

          <div className="grid min-h-0 min-w-0 overflow-hidden border-t border-line bg-white lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] 2xl:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)]">
            <div className="min-h-0 min-w-0 overflow-hidden border-b border-line lg:border-b-0 lg:border-r">
              {hasTaskActivity ? (
                <ExecutionExplorer
                  nodes={displayNodes}
                  runtimeObjects={runtimeObjects}
                  dependencyEdges={dependencyEdges}
                  activeNodeId={activeNodeId}
                  onSelectNode={handleGraphSelect}
                />
              ) : (
                <ExecutionGraphEmptyState onStart={() => start(defaultTask)} />
              )}
            </div>

            <div className="min-h-0 min-w-0 overflow-hidden">
              <ExecutionTimeline
                nodes={displayNodes}
                runtimeObjects={runtimeObjects}
                activeNodeId={activeNodeId}
                onSelectNode={handleTimelineSelect}
                onStart={() => start(defaultTask)}
              />
            </div>
          </div>
        </div>

        <div className="min-h-0 min-w-0 overflow-hidden border-l border-line">
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
            runtimeOverview={runtimeOverview}
            runtimeObjects={runtimeObjects}
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

      <StepDrawer
        object={selectedRuntimeObject}
        onClose={() => setSelectedRuntimeObject(undefined)}
      />
    </main>
  );
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function setTimedHighlight(
  setter: (value: string | undefined) => void,
  id: string,
  duration = 2000,
) {
  setter(id);
  window.setTimeout(() => setter(undefined), duration);
}
