import type { EvaluationCriteria, EvaluationResult } from '../../types/agent';
import { Panel } from '../ui';

interface EvaluationPanelProps {
  evaluation?: EvaluationResult;
}

const criteriaLabels: Record<keyof EvaluationCriteria, string> = {
  completeness: 'Completeness',
  accuracy: 'Accuracy',
  groundedness: 'Groundedness',
  taskCompletion: 'Task Completion',
};

export function EvaluationPanel({ evaluation }: EvaluationPanelProps) {
  return (
    <Panel title="Evaluation" description="Quality score and review feedback">
      <div className="space-y-4">
        {!evaluation ? (
          <p className="text-sm text-muted">No evaluation result yet.</p>
        ) : (
          <>
            <div>
              <div className="flex items-end justify-between">
                <span className="text-xs font-semibold uppercase tracking-normal text-muted">
                  Score
                </span>
                <span className="text-2xl font-semibold text-ink">
                  {Math.round(evaluation.score * 100)}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded bg-slate-100">
                <div
                  className={`h-full ${getScoreTone(evaluation.score)}`}
                  style={{ width: `${Math.round(evaluation.score * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(evaluation.criteria).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted">
                      {criteriaLabels[key as keyof EvaluationCriteria]}
                    </span>
                    <span className="font-medium text-ink">{Math.round(value * 100)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded bg-slate-100">
                    <div className="h-full bg-slate-700" style={{ width: `${value * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-normal text-muted">
                Feedback
              </div>
              {evaluation.feedback.map((item, index) => (
                <p
                  key={`${item}_${index}`}
                  className="rounded border border-line bg-panel p-2 text-xs text-muted"
                >
                  {item}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

function getScoreTone(score: number): string {
  if (score >= 0.8) return 'bg-emerald-500';
  if (score >= 0.6) return 'bg-amber-500';
  return 'bg-rose-500';
}
