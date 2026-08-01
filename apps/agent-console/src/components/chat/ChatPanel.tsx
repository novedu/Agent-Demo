import { useEffect, useRef, useState } from 'react';
import { AgentIcon, Badge } from '../ui';
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

  const showWelcome = !hasTaskActivity && messages.length === 0;

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
        {showWelcome ? (
          <WelcomeScreen onStartTask={onStartTask} />
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

        {!autoScroll && !showWelcome && (
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

const suggestions = [
  { title: 'Analyze sales decline', detail: 'Analyze sales data and generate report' },
  { title: 'Summarize today', detail: 'Summarize daily metrics and business progress' },
  { title: 'Travel Planner', detail: 'Plan multi-city travel itinerary' },
  { title: 'RAG QA', detail: 'Answer questions based on knowledge base' },
];

function WelcomeScreen({ onStartTask }: { onStartTask?: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
      <div className="flex items-center gap-1.5">
        <span className="text-base">👋</span>
        <h2 className="text-sm font-semibold text-ink">Welcome to Agent Studio</h2>
      </div>
      <p className="max-w-[200px] text-center text-[11px] leading-4 text-muted">
        Start a task from the suggestions below or describe a goal in natural language.
      </p>
      <div className="grid grid-cols-2 gap-1.5 w-full max-w-[260px]">
        {suggestions.map((s) => (
          <button
            key={s.title}
            type="button"
            onClick={onStartTask}
            className="flex flex-col items-start gap-0.5 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-left transition-colors hover:border-lineStrong hover:bg-white"
          >
            <span className="text-[11px] font-semibold text-ink">{s.title}</span>
            <span className="text-[9px] text-muted">{s.detail}</span>
          </button>
        ))}
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
