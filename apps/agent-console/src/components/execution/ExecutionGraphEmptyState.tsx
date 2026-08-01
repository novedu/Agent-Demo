import { Panel } from '../ui';

interface ExecutionGraphEmptyStateProps {
  onStart: () => void;
}

export function ExecutionGraphEmptyState({ onStart }: ExecutionGraphEmptyStateProps) {
  const nodes = [
    { label: 'Planner', color: 'border-blue-200 bg-blue-50 text-blue-600' },
    { label: 'Tool', color: 'border-emerald-200 bg-emerald-50 text-emerald-600' },
    { label: 'Knowledge', color: 'border-amber-200 bg-amber-50 text-amber-600' },
    { label: 'Reflection', color: 'border-blue-200 bg-blue-50 text-blue-600' },
    { label: 'Answer', color: 'border-emerald-200 bg-emerald-50 text-emerald-600' },
  ];

  return (
    <Panel
      title="Runtime Graph"
      description="Execution pipeline"
      className="h-full"
      bodyClassName="flex min-h-0 flex-col items-center justify-center p-0"
      actions={
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-5 items-center gap-1 rounded border border-accent bg-accent px-2 text-[10px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <svg viewBox="0 0 10 10" className="h-2 w-2" fill="currentColor">
              <path d="M2 1l6 4-6 4z" />
            </svg>
            Run
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-center gap-4 text-[9px] text-muted">
          <LegendItem color="bg-slate-400" label="Pending" />
          <LegendItem color="bg-blue-500" label="Running" />
          <LegendItem color="bg-emerald-500" label="Completed" />
          <LegendItem color="bg-rose-500" label="Failed" />
        </div>
      }
    >
      {/* Compact pipeline flow - not a giant whiteboard */}
      <div className="flex items-center gap-0 py-2">
        {nodes.map((node, i) => (
          <div key={node.label} className="flex items-center">
            <div className="flex flex-col items-center gap-0.5">
              <div className={`flex h-8 px-2.5 items-center rounded-md border text-[10px] font-semibold ${node.color}`}>
                {node.label}
              </div>
            </div>
            {i < nodes.length - 1 && (
              <svg viewBox="0 0 24 8" className="h-2 w-5 shrink-0 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M2 4h18M18 1l4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="4" r="1" fill="currentColor" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
