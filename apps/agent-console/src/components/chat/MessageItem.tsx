import ReactMarkdown from 'react-markdown';
import { useState, type ReactNode } from 'react';
import type { ConsoleMessage } from '../../types/agent';
import { Badge, Button } from '../ui';

interface MessageItemProps {
  message: ConsoleMessage;
  isStreaming?: boolean;
  highlighted?: boolean;
  onCitationFocus?: (citationId?: string) => void;
}

export function MessageItem({
  message,
  isStreaming = false,
  highlighted = false,
  onCitationFocus,
}: MessageItemProps) {
  const isUser = message.role === 'user';
  const isEmptyAssistant = !isUser && message.content.length === 0;
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  return (
    <article className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-xl border px-4 py-3 text-sm leading-6 transition-colors duration-200 ${isUser ? 'border-slate-900 bg-slate-900 text-white' : highlighted ? 'border-accent bg-blue-50' : 'border-line bg-white text-ink'}`}
      >
        <div className="mb-1 text-[11px] font-medium uppercase tracking-normal opacity-60">
          {message.role}
        </div>
        {!isUser && (
          <AssistantHeader
            evidenceOpen={evidenceOpen}
            onEvidenceToggle={() => {
              setEvidenceOpen((value) => !value);
              onCitationFocus?.();
            }}
          />
        )}
        {!isUser && evidenceOpen && (
          <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">Evidence</div>
            <p className="mt-1 leading-5">
              Citations and retrieved chunks are available in the Knowledge inspector. Hover or click a citation to focus the related evidence.
            </p>
          </div>
        )}
        {isEmptyAssistant ? (
          <p className="text-slate-500">
            正在分析
            <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-slate-400 align-[-1px]" />
          </p>
        ) : (
          <ReactMarkdown
            className={`prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 ${isUser ? 'prose-invert' : ''}`}
            components={{
              a: ({ href, children }) => (
                <a
                  href={href}
                  onMouseEnter={() => onCitationFocus?.(href?.replace('#', ''))}
                  onClick={(event) => {
                    if (href?.startsWith('#citation')) {
                      event.preventDefault();
                      onCitationFocus?.(href.replace('#', ''));
                    }
                  }}
                >
                  {children}
                </a>
              ),
              code: ({ className, children }) => (
                <CodeBlock className={className} isUser={isUser}>
                  {children}
                </CodeBlock>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        {isStreaming && !isEmptyAssistant && <StreamingCursor />}
      </div>
    </article>
  );
}

function AssistantHeader({
  evidenceOpen,
  onEvidenceToggle,
}: {
  evidenceOpen: boolean;
  onEvidenceToggle: () => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-panel p-2">
      {['Planner', 'Tool', 'RAG', 'Reflection', 'Memory', 'Evaluation'].map((item) => (
        <Badge key={item} tone={item === 'Tool' ? 'warning' : item === 'RAG' ? 'success' : 'info'}>
          {item}
        </Badge>
      ))}
      <Button
        size="sm"
        variant="ghost"
        className="ml-auto h-7 px-2 text-[11px]"
        onClick={onEvidenceToggle}
      >
        {evidenceOpen ? 'Hide Evidence' : 'Evidence'}
      </Button>
    </div>
  );
}

function StreamingCursor() {
  return <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-accent align-[-2px]" />;
}

function CodeBlock({
  className,
  children,
  isUser,
}: {
  className?: string;
  children: ReactNode;
  isUser: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');

  return (
    <span className="group relative block">
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
        className={`absolute right-2 top-2 z-10 rounded-md px-2 py-1 text-[10px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${isUser ? 'bg-white/15 text-white' : 'bg-white/10 text-slate-200'}`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <code className={className}>{children}</code>
    </span>
  );
}
