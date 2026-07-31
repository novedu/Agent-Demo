import type { EvaluationResult } from '../../types/agent';
import { Badge, Button, Skeleton } from '../ui';
import { InspectorEmpty } from './InspectorEmpty';

interface EvaluationDashboardProps {
  evaluation?: EvaluationResult;
  isLoading: boolean;
  onViewTrace?: () => void;
}

const criteria = [
  ['accuracy', 'Accuracy'],
  ['groundedness', 'Groundedness'],
  ['completeness', 'Completeness'],
  ['taskCompletion', 'Task Completion'],
] as const;

export function EvaluationDashboard({ evaluation, isLoading, onViewTrace }: EvaluationDashboardProps) {
  if (isLoading && !evaluation) return <Skeleton lines={8} />;
  if (!evaluation) {
    return <InspectorEmpty title="No evaluation yet" description="Quality metrics appear after completion." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 rounded-md bg-panel p-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            Overall Score
          </div>
          <div className="mt-1 text-3xl font-semibold text-ink">
            {Math.round(evaluation.score * 100)}
          </div>
        </div>
        <Badge tone={evaluation.score >= 0.8 ? 'success' : 'warning'}>
          {evaluation.score >= 0.8 ? 'Strong' : 'Review'}
        </Badge>
      </div>
      <div className="grid gap-3">
        {criteria.map(([key, label]) => {
          const value = evaluation.criteria[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted">{label}</span>
                <span className="font-mono font-medium text-ink">{Math.round(value * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-700 transition-[width] duration-200"
                  style={{ width: `${value * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-md border border-dashed border-lineStrong bg-panel p-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          Chart Placeholder
        </div>
        <div className="mt-3 flex h-16 items-end gap-1">
          {criteria.map(([key]) => (
            <div key={key} className="flex-1 rounded-t bg-blue-200" style={{ height: `${evaluation.criteria[key] * 100}%` }} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {evaluation.feedback.map((item, index) => (
          <p key={`${item}_${index}`} className="rounded-md border border-line bg-panel p-2 text-xs text-muted">
            {item}
          </p>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={onViewTrace} className="w-full">
        View related trace
      </Button>
    </div>
  );
}
