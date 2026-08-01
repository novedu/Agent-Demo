import { useEffect, useRef, useState } from 'react';
import { AgentIcon, Badge, SparkIcon } from '../ui';
import { InputBox } from './InputBox';
import { MessageItem } from './MessageItem';
import type { ConsoleMessage } from '../../types/agent';

interface ChatPanelProps {
  messages: ConsoleMessage[];
  isStreaming: boolean;
  currentStep?: string;
  currentTool?: string;
  onSubmit: (value: string) => void;
  onStop?: () => void;
  onRegenerate?: () => void;
  onCitationFocus?: (citationId?: string) => void;
  highlightedMessageId?: string;
  hasTaskActivity?: boolean;
  onStartTask?: () => void;
}

export function ChatPanel({
  messages,
  isStreaming,
  currentStep,
  currentTool,
  onSubmit,
  onStop,
  onCitationFocus,
  highlightedMessageId,
  hasTaskActivity,
  onStartTask,
}: ChatPanelProps) {
  const messageViewportRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    const viewport = messageViewportRef.current;
    if (!viewport || !autoScroll) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [autoScroll, messages]);

  function handleScroll() {
    const viewport = messageViewportRef.current;
    if (!viewport) return;
    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    setAutoScroll(distanceFromBottom < 48);
  }

  const showRuntimePreview = !hasTaskActivity;

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col bg-white">
      {/* Header */}
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-line bg-white px-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700">
            <AgentIcon className="h-2.5 w-2.5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold leading-4 text-ink">Chat Workspace</h2>
          </div>
        </div>
        <Badge tone={isStreaming ? 'info' : 'neutral'} className="px-1.5 py-0.5 text-[10px]">
          {isStreaming ? 'Streaming' : 'Ready'}
        </Badge>
      </header>

      {/* Status chips - compact row */}
      <div className="shrink-0 border-b border-line bg-slate-50/60 px-3 py-1">
        <div className="flex flex-wrap items-center gap-1">
          <RuntimeChip tone={isStreaming ? 'info' : 'neutral'} label={isStreaming ? 'Agent alive' : 'Agent ready'} />
          <RuntimeChip tone="neutral" label={currentStep ? `Step · ${currentStep}` : 'Step · Waiting'} />
          <RuntimeChip tone="success" label={currentTool ? `Tool · ${currentTool}` : 'Tool · None yet'} />
          <RuntimeChip tone="warning" label="Knowledge" />
          <RuntimeChip tone="neutral" label="Memory" />
          <RuntimeChip tone="info" label="Reflection" />
          <RuntimeChip tone="success" label="Answer" />
        </div>
      </div>

      {/* Main content area - flex-1 with min-h-0 */}
      <div className="relative min-h-0 flex-1 overflow-y-auto">
        {showRuntimePreview ? (
          <RuntimePreview messages={messages} onStartTask={onStartTask} />
        ) : (
          <div
            ref={messageViewportRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto overscroll-contain p-3"
          >
            <div className="space-y-3">
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming && message.id === lastMessageId}
                  highlighted={message.id === highlightedMessageId}
                  onCitationFocus={onCitationFocus}
                />
              ))}
            </div>
          </div>
        )}

        {!autoScroll && !showRuntimePreview && (
          <button
            type="button"
            onClick={() => setAutoScroll(true)}
            className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-muted shadow-sm transition-colors duration-200 hover:text-ink"
          >
            Jump to latest
          </button>
        )}
      </div>

      {/* Input box - always at bottom */}
      <div className="shrink-0">
        <InputBox disabled={isStreaming} onSubmit={onSubmit} onStop={onStop} />
      </div>
    </section>
  );
}

const runtimePreview = [
  { label: 'Planner', detail: 'builds the task plan', tone: 'info' },
  { label: 'Tool', detail: 'executes querySalesData', tone: 'success' },
  { label: 'Knowledge', detail: 'retrieves related context', tone: 'warning' },
  { label: 'Memory', detail: 'updates user and task memory', tone: 'neutral' },
  { label: 'Reflection', detail: 'checks answer quality', tone: 'info' },
  { label: 'Answer', detail: 'streams the final response', tone: 'success' },
] as const;

const suggestions = [
  { title: 'Analyze sales decline', detail: 'Sales data + KPI + RAG + report' },
  { title: 'RAG QA', detail: 'Retrieve policy context and answer' },
  { title: 'Memory check', detail: 'Persist preference and task memory' },
] as const;

function RuntimePreview({
  messages,
  onStartTask,
}: {
  messages: ConsoleMessage[];
  onStartTask?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto p-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700">
              <SparkIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-ink">
                Agent Runtime is standing by
              </h2>
              <p className="mt-0.5 truncate text-xs text-muted">
                The next message starts planning, tool execution, retrieval, memory, reflection and answer streaming.
              </p>
            </div>
          </div>
          <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-[10px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Ready
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
        {runtimePreview.map((item) => (
          <div key={item.label} className="rounded-lg border border-line bg-white p-3">
            <Badge tone={item.tone} className="mb-2">
              {item.label}
            </Badge>
            <p className="text-xs leading-5 text-muted">{item.detail}</p>
          </div>
        ))}
      </div>

      {messages.length > 0 && (
        <div className="mt-4 space-y-3">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} onCitationFocus={undefined} />
          ))}
        </div>
      )}

      <div className="mt-auto pt-4">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          Run a complete runtime path
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.title}
              type="button"
              onClick={onStartTask}
              className="cursor-pointer rounded-lg border border-line bg-white p-3 text-left transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50/50"
            >
              <span className="block text-xs font-semibold text-ink">{suggestion.title}</span>
              <span className="mt-1 block text-[10px] leading-4 text-muted">
                {suggestion.detail}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RuntimeChip({
  label,
  tone,
}: {
  label: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'warning'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : tone === 'danger'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : tone === 'info'
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-line bg-white text-muted';

  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-full border px-2 text-[9px] font-medium transition-colors duration-200 ${toneClass}`}
    >
      {tone === 'info' && <span className="h-1 w-1 rounded-full bg-current animate-pulse" />}
      {label}
    </span>
  );
}
