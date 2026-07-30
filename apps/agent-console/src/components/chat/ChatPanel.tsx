import { InputBox } from './InputBox';
import { MessageItem } from './MessageItem';
import type { ConsoleMessage } from '../../types/agent';

interface ChatPanelProps {
  messages: ConsoleMessage[];
  isStreaming: boolean;
  onSubmit: (value: string) => void;
}

export function ChatPanel({ messages, isStreaming, onSubmit }: ChatPanelProps) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-panel">
      <header className="border-b border-line bg-white px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Chat</h2>
        <p className="text-xs text-slate-500">User goals and Markdown responses</p>
      </header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
      <InputBox disabled={isStreaming} onSubmit={onSubmit} />
    </section>
  );
}
