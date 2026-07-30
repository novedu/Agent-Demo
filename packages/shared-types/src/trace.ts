export type SpanStatus = 'running' | 'success' | 'failed';

export type ObservabilityComponent =
  | 'Planner'
  | 'WorkflowRunner'
  | 'ToolExecutor'
  | 'LLMProvider'
  | 'RAG'
  | 'Memory'
  | 'Reflection'
  | 'Evaluator';

export interface SpanRecord {
  traceId: string;
  spanId: string;
  taskId: string;
  stepId?: string;
  component: ObservabilityComponent;
  startTime: number;
  endTime?: number;
  duration: number;
  status: SpanStatus;
  metadata?: Record<string, unknown>;
}

export interface TraceRecord {
  traceId: string;
  taskId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  status: SpanStatus;
  spans: SpanRecord[];
  metadata?: Record<string, unknown>;
}

export interface EvaluationCriteria {
  completeness: number;
  accuracy: number;
  groundedness: number;
  taskCompletion: number;
}

export interface EvaluationResult {
  score: number;
  criteria: EvaluationCriteria;
  feedback: string[];
}

export interface EvaluationContext {
  taskId: string;
  input: string;
  finalAnswer?: string;
  toolResults: Array<{
    toolName?: string;
    success?: boolean;
    data?: unknown;
    error?: string;
  }>;
  ragDocuments: Array<{
    id: string;
    content: string;
    score?: number;
  }>;
  trace?: TraceRecord;
}
