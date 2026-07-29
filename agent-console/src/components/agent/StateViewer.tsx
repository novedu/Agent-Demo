import type { AgentStateSnapshot } from '../../types/agent';

interface StateViewerProps {
  state?: AgentStateSnapshot;
}

export function StateViewer({ state }: StateViewerProps) {
  return (
    <section className="rounded-md border border-line bg-white">
      <header className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">State</h2>
        <p className="text-xs text-slate-500">Current Agent runtime snapshot</p>
      </header>
      <div className="p-4">
        {!state ? (
          <p className="text-sm text-slate-500">No state snapshot yet.</p>
        ) : (
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md bg-panel p-3">
              <dt className="text-xs text-slate-500">status</dt>
              <dd className="mt-1 font-semibold text-ink">{state.status}</dd>
            </div>
            <div className="rounded-md bg-panel p-3">
              <dt className="text-xs text-slate-500">currentStep</dt>
              <dd className="mt-1 font-semibold text-ink">{state.currentStepId ?? '-'}</dd>
            </div>
            <div className="rounded-md bg-panel p-3">
              <dt className="text-xs text-slate-500">completed</dt>
              <dd className="mt-1 font-semibold text-ink">{state.completedStepIds.length}</dd>
            </div>
            <div className="col-span-3 rounded-md bg-panel p-3">
              <dt className="text-xs text-slate-500">goal</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{state.goal}</dd>
            </div>
            <div className="col-span-3 rounded-md bg-panel p-3">
              <dt className="text-xs text-slate-500">completedSteps</dt>
              <dd className="mt-1 font-semibold text-ink">
                {state.completedStepIds.join(', ') || '-'}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  );
}
