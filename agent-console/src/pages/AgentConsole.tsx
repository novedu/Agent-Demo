import { useMemo } from 'react';
import { ChatPanel } from '../components/chat/ChatPanel';
import { CitationPanel } from '../components/agent/CitationPanel';
import { ExecutionTimeline } from '../components/agent/ExecutionTimeline';
import { KnowledgePanel } from '../components/agent/KnowledgePanel';
import { MemoryPanel } from '../components/agent/MemoryPanel';
import { PlanViewer } from '../components/agent/PlanViewer';
import { StateViewer } from '../components/agent/StateViewer';
import { ToolInspector } from '../components/agent/ToolInspector';
import { useAgentStream } from '../hooks/useAgentStream';
import { useAgentStore } from '../store/agentStore';

export function AgentConsole() {
  const taskId = useMemo(() => `console_${Math.random().toString(36).slice(2, 10)}`, []);
  const { start } = useAgentStream(taskId);
  const { messages, plan, workflow, tools, citations, memories, state, status, isStreaming } =
    useAgentStore();

  return (
    <main className="grid h-screen grid-cols-[360px_minmax(560px,1fr)_380px] bg-slate-100 text-ink">
      <ChatPanel messages={messages} isStreaming={isStreaming} onSubmit={start} />

      <section className="min-h-0 overflow-y-auto p-4">
        <div className="mb-4 flex items-center justify-between border-b border-line bg-white px-4 py-3">
          <div>
            <h1 className="text-base font-semibold text-ink">Agent Execution</h1>
            <p className="text-xs text-slate-500">Plan, timeline, tool calls and runtime state</p>
          </div>
          <span className={`rounded px-2 py-1 text-xs font-medium ${getStatusTone(status)}`}>
            {status}
          </span>
        </div>

        <div className="space-y-4">
          <PlanViewer plan={plan ?? undefined} />
          <ExecutionTimeline events={workflow} />
          <ToolInspector tools={tools} />
          <StateViewer state={state} />
        </div>
      </section>

      <aside className="min-h-0 space-y-4 overflow-y-auto border-l border-line bg-panel p-4">
        <KnowledgePanel citations={citations} />
        <MemoryPanel memories={memories} />
        <CitationPanel citations={citations} />
      </aside>
    </main>
  );
}

function getStatusTone(status: string): string {
  if (status === 'running') return 'bg-amber-100 text-amber-700';
  if (status === 'success') return 'bg-emerald-100 text-emerald-700';
  if (status === 'error') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-600';
}
