import ReactMarkdown from 'react-markdown';
import type { ConsoleMessage } from '../../types/agent';

interface MessageItemProps {
  message: ConsoleMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isEmptyAssistant = !isUser && message.content.length === 0;

  return (
    <article className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-md border px-3 py-2 text-sm leading-6 shadow-sm ${isUser ? 'border-slate-900 bg-slate-900 text-white' : 'border-line bg-white text-ink'}`}
      >
        <div className="mb-1 text-[11px] font-medium uppercase tracking-normal opacity-60">
          {message.role}
        </div>
        {isEmptyAssistant ? (
          <p className="text-slate-500">
            正在分析
            <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-slate-400 align-[-1px]" />
          </p>
        ) : (
          <ReactMarkdown
            className={`prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 ${isUser ? 'prose-invert' : ''}`}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </article>
  );
}
