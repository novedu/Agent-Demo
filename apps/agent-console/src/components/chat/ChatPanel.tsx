import { useEffect, useRef, useState } from 'react';
import { AgentIcon, Badge, Button } from '../ui';
import { InputBox } from './InputBox';
import { MessageItem } from './MessageItem';
import type { ConsoleMessage } from '../../types/agent';

interface ChatPanelProps {
  messages: ConsoleMessage[];
  isStreaming: boolean;
  onSubmit: (value: string) => void;
  onStop?: () => void;
  onRegenerate?: () => void;
  onCitationFocus?: (citationId?: string) => void;
  highlightedMessageId?: string;
}

export function ChatPanel({
  messages,
  isStreaming,
  onSubmit,
  onStop,
  onRegenerate,
  onCitationFocus,
  highlightedMessageId,
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

  return (
    <section className="relative flex h-full min-h-0 flex-col bg-white">
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-white px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
            <AgentIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-5 text-ink">Chat Workspace</h2>
            <p className="truncate text-xs text-muted">Goal input, streaming answer, citations and runtime summaries</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={isStreaming ? 'info' : 'neutral'}>{isStreaming ? 'Streaming' : 'Ready'}</Badge>
          {!isStreaming && onRegenerate && (
            <Button variant="ghost" size="sm" onClick={onRegenerate}>
              Regenerate
            </Button>
          )}
        </div>
      </header>
      <div
        ref={messageViewportRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5"
      >
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
      {!autoScroll && (
        <button
          type="button"
          onClick={() => setAutoScroll(true)}
          className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted shadow-sm transition-colors duration-200 hover:text-ink"
        >
          Jump to latest
        </button>
      )}
      <InputBox disabled={isStreaming} onSubmit={onSubmit} onStop={onStop} />
    </section>
  );
}
