import type { AgentPlan } from '../../types/agent';
import { Badge, Panel, Skeleton, StatusTag } from '../ui';

interface PlanViewerProps {
  plan?: AgentPlan;
  isLoading?: boolean;
}

export function PlanViewer({ plan, isLoading }: PlanViewerProps) {
  return (
    <Panel title="Plan" description="Planner generated execution steps">
      {isLoading && !plan ? (
        <Skeleton lines={5} />
      ) : !plan ? (
        <p className="text-sm text-muted">No plan generated yet.</p>
      ) : (
        <div className="space-y-3">
          <div className="rounded-md bg-panel px-3 py-2">
            <div className="text-xs text-muted">Task</div>
            <div className="mt-1 text-sm font-semibold text-ink">{plan.goal}</div>
          </div>
          <ol className="space-y-2">
            {plan.steps.map((step) => (
              <li key={step.id} className="rounded-md border border-line p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge tone={getStepTone(step.status)}>{getStepMark(step.status)}</Badge>
                    <span className="truncate text-sm font-medium text-ink">
                      {step.description}
                    </span>
                  </div>
                  <StatusTag status={step.status} />
                </div>
                <div className="mt-2 text-xs text-muted">
                  Tool: <span className="font-mono text-accent">{step.tool}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Panel>
  );
}

function getStepMark(status: string): string {
  if (status === 'success') return 'OK';
  if (status === 'running') return 'RUN';
  if (status === 'failed') return '!';
  return '--';
}

function getStepTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'success') return 'success';
  if (status === 'running') return 'warning';
  if (status === 'failed') return 'danger';
  return 'neutral';
}
