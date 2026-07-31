import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui';
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
    <section className="relative flex h-full min-h-0 flex-col bg-panel">
      <header className="flex min-h-12 shrink-0 items-center border-b border-line bg-white px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-5 text-ink">Chat</h2>
          <p className="text-xs text-slate-500">User goals and Markdown responses</p>
        </div>
        {!isStreaming && onRegenerate && (
          <Button variant="ghost" size="sm" onClick={onRegenerate} className="ml-auto">
            Regenerate
          </Button>
        )}
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
