import type { EvaluationResult, TraceRecord } from './trace-types';

export interface AgentMetricsSnapshot {
  taskCount: number;
  successCount: number;
  failedCount: number;
  avgDuration: number;
  toolErrorCount: number;
  evaluationScore: number;
}

export class AgentMetrics {
  private taskCount = 0;
  private successCount = 0;
  private failedCount = 0;
  private totalDuration = 0;
  private toolErrorCount = 0;
  private evaluationTotal = 0;
  private evaluationCount = 0;

  recordTrace(trace: TraceRecord): void {
    this.taskCount += 1;
    this.totalDuration += trace.duration;

    if (trace.status === 'success') {
      this.successCount += 1;
    } else if (trace.status === 'failed') {
      this.failedCount += 1;
    }

    this.toolErrorCount += trace.spans.filter((span) => (
      span.component === 'ToolExecutor' && span.status === 'failed'
    )).length;
  }

  recordEvaluation(result: EvaluationResult): void {
    this.evaluationTotal += result.score;
    this.evaluationCount += 1;
  }

  snapshot(): AgentMetricsSnapshot {
    return {
      taskCount: this.taskCount,
      successCount: this.successCount,
      failedCount: this.failedCount,
      avgDuration: this.taskCount === 0 ? 0 : Math.round(this.totalDuration / this.taskCount),
      toolErrorCount: this.toolErrorCount,
      evaluationScore: this.evaluationCount === 0
        ? 0
        : Number((this.evaluationTotal / this.evaluationCount).toFixed(2)),
    };
  }
}
