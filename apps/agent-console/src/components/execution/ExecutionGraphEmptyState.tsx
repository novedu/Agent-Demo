import { Panel } from '../ui';

interface ExecutionGraphEmptyStateProps {
  onStart: () => void;
}

export function ExecutionGraphEmptyState({ onStart }: ExecutionGraphEmptyStateProps) {
  const nodes = [
    { label: 'Planner', color: 'text-blue-700' },
    { label: 'Knowledge', color: 'text-amber-700' },
    { label: 'Tool', color: 'text-emerald-700' },
    { label: 'Memory', color: 'text-purple-700' },
    { label: 'Reflection', color: 'text-blue-700' },
    { label: 'Answer', color: 'text-emerald-700' },
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
          Run
        </button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-2">
        <div className="flex items-center justify-between gap-3 text-[10px] text-muted">
          <span>Planner</span>
          <span className="font-mono">waiting</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {nodes.map((node, index) => (
            <div key={node.label} className="flex items-center gap-1">
              <div className="flex h-7 items-center rounded-md border border-line bg-panel px-2 text-[10px] font-semibold text-ink">
                <span className={node.color}>{node.label}</span>
              </div>
              {index < nodes.length - 1 && (
                <svg
                  viewBox="0 0 20 8"
                  className="h-2 w-4 shrink-0 text-lineStrong"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M2 4h14M13 1l4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
        <div className="text-[10px] leading-4 text-muted">
          When a task starts, this strip becomes the runtime dependency explanation.
        </div>
      </div>
    </Panel>
  );
}
