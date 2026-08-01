import ReactMarkdown from 'react-markdown';
import { useState, type ReactNode } from 'react';
import type { ConsoleMessage } from '../../types/agent';
import { AgentIcon, Badge, Button, CopyIcon } from '../ui';
import { classNames } from '../ui/classNames';
import type { RuntimeOverview } from '../../features/agent-console/runtime-overview';

interface MessageItemProps {
  message: ConsoleMessage;
  isStreaming?: boolean;
  highlighted?: boolean;
  onCitationFocus?: (citationId?: string) => void;
  runtimeOverview?: RuntimeOverview;
}

export function MessageItem({
  message,
  isStreaming = false,
  highlighted = false,
  onCitationFocus,
  runtimeOverview,
}: MessageItemProps) {
  const isUser = message.role === 'user';
  const isEmptyAssistant = !isUser && message.content.length === 0;
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  return (
    <article className={classNames('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={classNames(
          'max-w-[88%] rounded-xl border px-4 py-3 text-sm leading-6 transition-colors duration-200',
          isUser
            ? 'border-slate-900 bg-slate-950 text-white'
            : highlighted
              ? 'border-accent bg-blue-50'
              : 'border-line bg-white text-ink',
        )}
      >
        <MessageHeader message={message} isUser={isUser} />

        {!isUser && (
          <AssistantRuntimeSummary
            message={message}
            evidenceOpen={evidenceOpen}
            runtimeOverview={runtimeOverview}
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
              {formatEvidenceSummary(runtimeOverview)}
            </p>
          </div>
        )}

        {isEmptyAssistant ? (
          <p className="text-slate-500">
            Thinking through the runtime path
            <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-slate-400 align-[-1px]" />
          </p>
        ) : (
          <ReactMarkdown
            className={classNames(
              'prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-pre:rounded-lg prose-pre:bg-slate-950 prose-pre:text-slate-100',
              isUser ? 'prose-invert' : '',
            )}
            components={{
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="font-medium text-blue-700 underline-offset-2 hover:underline"
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

function MessageHeader({ message, isUser }: { message: ConsoleMessage; isUser: boolean }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={classNames(
            'flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold',
            isUser ? 'border-white/20 bg-white/10 text-white' : 'border-blue-200 bg-blue-50 text-blue-700',
          )}
        >
          {isUser ? 'U' : <AgentIcon className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold">{isUser ? 'User' : 'Runtime Assistant'}</div>
          <div className="truncate text-[11px] opacity-60">
            {isUser ? 'Goal' : 'Model'} · {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
      {!isUser && <Badge tone="neutral">Evaluation</Badge>}
    </div>
  );
}

function AssistantRuntimeSummary({
  message,
  evidenceOpen,
  runtimeOverview,
  onEvidenceToggle,
}: {
  message: ConsoleMessage;
  evidenceOpen: boolean;
  runtimeOverview?: RuntimeOverview;
  onEvidenceToggle: () => void;
}) {
  const signals = runtimeOverview?.availableSignals ?? [];

  return (
    <div className="mb-3 rounded-lg border border-line bg-panel p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          Runtime Summary
        </div>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={onEvidenceToggle}>
          {evidenceOpen ? 'Hide Evidence' : 'Evidence'}
        </Button>
      </div>
      <div className="mt-2 grid gap-2 text-xs text-muted md:grid-cols-2">
        <SummaryCell label="Current" value={runtimeOverview?.currentStep ?? 'Thinking'} />
        <SummaryCell label="Progress" value={`${runtimeOverview?.progress ?? 0}%`} />
        <SummaryCell label="Tool" value={runtimeOverview?.currentTool ?? 'None'} />
        <SummaryCell label="Latest Event" value={runtimeOverview?.latestEvent ?? 'Waiting'} />
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">{summarizeAssistant(message.content)}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {signals.map((signal) => (
          <Badge key={signal.label} tone={signal.tone}>
            {signal.label} · {signal.value}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-line bg-white px-2 py-1.5">
      <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</div>
      <div className="mt-0.5 truncate font-mono text-[11px] font-semibold text-ink">{value}</div>
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
        className={classNames(
          'absolute right-2 top-2 z-10 inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[10px] opacity-0 transition-opacity duration-200 group-hover:opacity-100',
          isUser
            ? 'border-white/20 bg-white/10 text-white'
            : 'border-slate-700 bg-slate-900 text-slate-100',
        )}
      >
        <CopyIcon className="h-3 w-3" />
        {copied ? 'Copied' : 'Copy'}
      </button>
      <code className={className}>{children}</code>
    </span>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function summarizeAssistant(content: string): string {
  if (!content.trim()) return 'Waiting for streamed answer content from the runtime.';
  return content.length > 160 ? `${content.slice(0, 160).trim()}...` : content;
}

function formatEvidenceSummary(runtimeOverview?: RuntimeOverview): string {
  if (!runtimeOverview) return 'Runtime evidence will appear in the inspector when events arrive.';
  return [
    `${runtimeOverview.citationCount} retrieved chunks`,
    `${runtimeOverview.toolCount} tool calls`,
    `${runtimeOverview.memoryCount} memory writes`,
    runtimeOverview.evaluationScore === undefined
      ? 'evaluation pending'
      : `evaluation ${Math.round(runtimeOverview.evaluationScore * 100)}%`,
  ].join(' · ');
}
