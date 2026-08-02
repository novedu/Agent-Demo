import { Panel } from '../ui';

interface ExecutionGraphEmptyStateProps {
  onStart: () => void;
  onStartRetryDemo?: () => void;
}

export function ExecutionGraphEmptyState({ onStart, onStartRetryDemo }: ExecutionGraphEmptyStateProps) {
  const nodes = [
    { label: 'Planner', detail: 'plan', color: 'border-blue-200 bg-blue-50 text-blue-700' },
    { label: 'Tool', detail: 'execute', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    { label: 'Knowledge', detail: 'retrieve', color: 'border-amber-200 bg-amber-50 text-amber-700' },
    { label: 'Memory', detail: 'write', color: 'border-purple-200 bg-purple-50 text-purple-700' },
    { label: 'Reflection', detail: 'check', color: 'border-blue-200 bg-blue-50 text-blue-700' },
    { label: 'Evaluation', detail: 'score', color: 'border-slate-300 bg-white text-slate-700' },
    { label: 'Answer', detail: 'stream', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  ];

  return (
    <Panel
      title="Runtime Graph"
      description="Compact dependency strip"
      className="h-full rounded-none border-0 shadow-none"
      bodyClassName="flex min-h-0 flex-col gap-3 p-3"
      actions={
        <button
          type="button"
          onClick={onStart}
          className="inline-flex h-6 cursor-pointer items-center gap-1 rounded-md border border-accent bg-accent px-2.5 text-[10px] font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
        >
          <svg viewBox="0 0 10 10" className="h-2 w-2" fill="currentColor">
            <path d="M2 1l6 4-6 4z" />
          </svg>
          Run full demo
        </button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-ink">Agent idle, runtime path armed</div>
            <div className="mt-0.5 text-[10px] text-muted">
              Run the sales decline task to watch every object become live.
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-line bg-white px-2 py-1 font-mono text-[10px] text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
            ready
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-line bg-white p-2">
          {nodes.map((node, index) => (
            <div key={node.label} className="flex items-center gap-1">
              <div className={`flex h-11 min-w-[86px] flex-col justify-center rounded-md border px-2 ${node.color}`}>
                <span className="truncate text-[10px] font-semibold">{node.label}</span>
                <span className="font-mono text-[9px] opacity-70">{node.detail}</span>
              </div>
              {index < nodes.length - 1 && (
                <svg
                  viewBox="0 0 26 8"
                  className="h-2 w-5 shrink-0 text-lineStrong"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M2 4h20M19 1l4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-2 text-[10px] leading-4 text-muted md:grid-cols-3">
          <div className="rounded-md border border-line bg-panel px-2 py-1.5">
            Chat streams the answer and runtime evidence.
          </div>
          <div className="rounded-md border border-line bg-panel px-2 py-1.5">
            Timeline appends spans as runtime events arrive.
          </div>
          <div className="rounded-md border border-line bg-panel px-2 py-1.5">
            Drawer, Inspector, Graph and Chat share selection.
          </div>
        </div>

        {onStartRetryDemo && (
          <button
            type="button"
            onClick={onStartRetryDemo}
            className="inline-flex h-8 w-fit cursor-pointer items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 text-[10px] font-semibold text-amber-700 transition-colors duration-200 hover:bg-amber-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {'Run Tool Error -> Retry -> Success'}
          </button>
        )}
      </div>
    </Panel>
  );
}
