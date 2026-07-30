import type { ObservabilityComponent, SpanRecord, SpanStatus } from '@shared-types/trace';

export interface SpanInput {
  traceId: string;
  taskId: string;
  stepId?: string;
  component: ObservabilityComponent;
  metadata?: Record<string, unknown>;
}

export class Span {
  private record: SpanRecord;

  constructor(input: SpanInput) {
    this.record = {
      traceId: input.traceId,
      spanId: createSpanId(),
      taskId: input.taskId,
      stepId: input.stepId,
      component: input.component,
      startTime: Date.now(),
      duration: 0,
      status: 'running',
      metadata: input.metadata,
    };
  }

  end(status: Exclude<SpanStatus, 'running'> = 'success', metadata?: Record<string, unknown>): SpanRecord {
    const endTime = Date.now();
    this.record = {
      ...this.record,
      status,
      endTime,
      duration: endTime - this.record.startTime,
      metadata: {
        ...this.record.metadata,
        ...metadata,
      },
    };
    return this.snapshot();
  }

  snapshot(): SpanRecord {
    return {
      ...this.record,
      metadata: this.record.metadata ? { ...this.record.metadata } : undefined,
    };
  }
}

function createSpanId(): string {
  return `span_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}
