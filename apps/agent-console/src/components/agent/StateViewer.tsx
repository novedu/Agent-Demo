import type { AgentStateSnapshot } from '../../types/agent';
import { Panel, StatusTag } from '../ui';

interface StateViewerProps {
  state?: AgentStateSnapshot;
}

export function StateViewer({ state }: StateViewerProps) {
  return (
    <Panel title="State" description="Current Agent runtime snapshot">
      {!state ? (
        <p className="text-sm text-muted">No state snapshot yet.</p>
      ) : (
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-md bg-panel p-3">
            <dt className="text-xs text-muted">status</dt>
            <dd className="mt-1">
              <StatusTag status={state.status} />
            </dd>
          </div>
          <div className="rounded-md bg-panel p-3">
            <dt className="text-xs text-muted">currentStep</dt>
            <dd className="mt-1 font-semibold text-ink">{state.currentStepId ?? '-'}</dd>
          </div>
          <div className="rounded-md bg-panel p-3">
            <dt className="text-xs text-muted">completed</dt>
            <dd className="mt-1 font-semibold text-ink">{state.completedStepIds.length}</dd>
          </div>
          <div className="col-span-3 rounded-md bg-panel p-3">
            <dt className="text-xs text-muted">goal</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{state.goal}</dd>
          </div>
          <div className="col-span-3 rounded-md bg-panel p-3">
            <dt className="text-xs text-muted">completedSteps</dt>
            <dd className="mt-1 font-semibold text-ink">
              {state.completedStepIds.join(', ') || '-'}
            </dd>
          </div>
        </dl>
      )}
    </Panel>
  );
}
