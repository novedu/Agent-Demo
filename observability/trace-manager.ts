import { Span, type SpanInput } from './span';
import type { SpanRecord, SpanStatus, TraceRecord } from './trace-types';

export class TraceManager {
  private traces = new Map<string, TraceRecord>();

  startTrace(taskId: string, metadata?: Record<string, unknown>): TraceRecord {
    const trace: TraceRecord = {
      traceId: createTraceId(),
      taskId,
      startTime: Date.now(),
      duration: 0,
      status: 'running',
      spans: [],
      metadata,
    };

    this.traces.set(trace.traceId, trace);
    return this.cloneTrace(trace);
  }

  startSpan(input: Omit<SpanInput, 'traceId'> & { traceId: string }): Span {
    return new Span(input);
  }

  recordSpan(span: SpanRecord): void {
    const trace = this.traces.get(span.traceId);
    if (!trace) return;

    trace.spans.push(span);
    trace.duration = Date.now() - trace.startTime;
  }

  endTrace(traceId: string, status: Exclude<SpanStatus, 'running'>, metadata?: Record<string, unknown>): TraceRecord | undefined {
    const trace = this.traces.get(traceId);
    if (!trace) return undefined;

    const endTime = Date.now();
    const nextTrace: TraceRecord = {
      ...trace,
      status,
      endTime,
      duration: endTime - trace.startTime,
      metadata: {
        ...trace.metadata,
        ...metadata,
      },
    };

    this.traces.set(traceId, nextTrace);
    return this.cloneTrace(nextTrace);
  }

  getTrace(traceId: string): TraceRecord | undefined {
    const trace = this.traces.get(traceId);
    return trace ? this.cloneTrace(trace) : undefined;
  }

  listTraces(): TraceRecord[] {
    return Array.from(this.traces.values()).map((trace) => this.cloneTrace(trace));
  }

  private cloneTrace(trace: TraceRecord): TraceRecord {
    return {
      ...trace,
      spans: trace.spans.map((span) => ({
        ...span,
        metadata: span.metadata ? { ...span.metadata } : undefined,
      })),
      metadata: trace.metadata ? { ...trace.metadata } : undefined,
    };
  }
}

function createTraceId(): string {
  return `trace_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}
