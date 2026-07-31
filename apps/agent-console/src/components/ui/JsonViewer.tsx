import { useMemo, useState } from 'react';
import { Button } from './Button';
import { classNames } from './classNames';

interface JsonViewerProps {
  value: unknown;
  title?: string;
  collapsed?: boolean;
  className?: string;
}

export function JsonViewer({ value, title, collapsed = false, className }: JsonViewerProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [copied, setCopied] = useState(false);
  const json = useMemo(() => formatJson(value), [value]);

  function handleCopy() {
    void navigator.clipboard?.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <section className={classNames('overflow-hidden rounded-lg border border-slate-800 bg-slate-950', className)}>
      <header className="flex min-h-10 items-center justify-between gap-3 border-b border-slate-800 px-3">
        <div className="min-w-0 truncate text-xs font-semibold text-slate-200">
          {title ?? 'JSON'}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 border-slate-700 px-2 text-[11px] text-slate-300 hover:bg-slate-900 hover:text-white"
            onClick={() => setIsCollapsed((value) => !value)}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 border-slate-700 px-2 text-[11px] text-slate-300 hover:bg-slate-900 hover:text-white"
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </header>
      {!isCollapsed && (
        <pre className="max-h-80 overflow-auto p-3 text-xs leading-5 text-slate-100">
          <code dangerouslySetInnerHTML={{ __html: highlightJson(json) }} />
        </pre>
      )}
    </section>
  );
}

function formatJson(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function highlightJson(value: string): string {
  return escapeHtml(value).replace(
    /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let className = 'text-amber-200';
      if (match.endsWith(':')) className = 'text-sky-300';
      else if (/^"/.test(match)) className = 'text-emerald-200';
      else if (/true|false/.test(match)) className = 'text-violet-300';
      else if (/null/.test(match)) className = 'text-slate-400';
      else if (/^-?\d/.test(match)) className = 'text-orange-200';
      return `<span class="${className}">${match}</span>`;
    },
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
