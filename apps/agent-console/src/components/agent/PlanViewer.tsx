import type { AgentPlan } from '../../types/agent';

interface PlanViewerProps {
  plan?: AgentPlan;
}

export function PlanViewer({ plan }: PlanViewerProps) {
  return (
    <section className="rounded-md border border-line bg-white">
      <header className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Plan</h2>
        <p className="text-xs text-slate-500">Planner generated execution steps</p>
      </header>
      <div className="p-4">
        {!plan ? (
          <p className="text-sm text-slate-500">No plan generated yet.</p>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md bg-panel px-3 py-2">
              <div className="text-xs text-slate-500">任务</div>
              <div className="mt-1 text-sm font-semibold text-ink">{plan.goal}</div>
            </div>
            <ol className="space-y-2">
              {plan.steps.map((step) => (
                <li key={step.id} className="rounded-md border border-line p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold ${getStepTone(step.status)}`}
                      >
                        {getStepMark(step.status)}
                      </span>
                      <span className="truncate text-sm font-medium text-ink">
                        {step.description}
                      </span>
                    </div>
                    <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {step.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Tool: <span className="font-mono text-accent">{step.tool}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

function getStepMark(status: string): string {
  if (status === 'success') return '✓';
  if (status === 'running') return '⏳';
  if (status === 'failed') return '!';
  return '○';
}

function getStepTone(status: string): string {
  if (status === 'success') return 'bg-emerald-100 text-emerald-700';
  if (status === 'running') return 'bg-amber-100 text-amber-700';
  if (status === 'failed') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-500';
}
