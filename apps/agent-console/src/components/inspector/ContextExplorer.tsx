import type { AgentStateSnapshot, Plan } from '../../types/agent';
import { Badge, Skeleton } from '../ui';
import { InspectorEmpty } from './InspectorEmpty';

interface ContextExplorerProps {
  plan: Plan | null;
  state?: AgentStateSnapshot;
  isLoading: boolean;
}

export function ContextExplorer({ plan, state, isLoading }: ContextExplorerProps) {
  if (isLoading && !plan && !state) return <Skeleton lines={6} />;
  if (!plan && !state) {
    return <InspectorEmpty title="Context is empty" description="Planner and state context appear here." />;
  }

  return (
    <div className="space-y-3">
      {plan && (
        <div className="rounded-md border border-line bg-panel p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Goal
            </span>
            <Badge tone="info">{plan.steps.length} steps</Badge>
          </div>
          <p className="mt-2 text-xs leading-5 text-ink">{plan.goal}</p>
          <div className="mt-3 space-y-1.5">
            {plan.steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-muted">{String(index + 1).padStart(2, '0')}</span>
                <span className="truncate text-ink">{step.description}</span>
                <span className="ml-auto text-[10px] text-muted">{step.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {state && (
        <div className="rounded-md border border-line bg-panel p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Agent State
            </span>
            <Badge tone={state.status === 'failed' ? 'danger' : 'neutral'}>{state.status}</Badge>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <Detail label="Current step" value={state.currentStepId ?? '-'} />
            <Detail label="Completed" value={`${state.completedStepIds.length}`} />
            <Detail label="Goal" value={state.goal} wide />
            {state.error && <Detail label="Error" value={state.error} wide />}
          </dl>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2 min-w-0' : 'min-w-0'}>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 truncate font-medium text-ink">{value}</dd>
    </div>
  );
}
