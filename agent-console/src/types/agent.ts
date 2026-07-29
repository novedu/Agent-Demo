export type AgentEventType =
  | 'task_created'
  | 'plan_start'
  | 'plan_update'
  | 'workflow_start'
  | 'tool_start'
  | 'tool_success'
  | 'tool_error'
  | 'rag_retrieve'
  | 'reflection'
  | 'replanning'
  | 'memory_update'
  | 'evaluation_start'
  | 'evaluation_complete'
  | 'state_update'
  | 'final_answer'
  | 'task_cancelled'
  | 'task_retry'
  | 'task_failed'
  | 'task_complete';

export interface AgentEvent {
  id: string;
  taskId?: string;
  type: AgentEventType;
  timestamp: number;
  payload: unknown;
}

export type MessageRole = 'user' | 'assistant';
export type StepStatus = 'pending' | 'running' | 'success' | 'failed';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export type ConsoleMessage = Message;

export interface PlanStep {
  id: string;
  description: string;
  args?: Record<string, unknown>;
  status: StepStatus;
  tool?: string;
}

export interface Plan {
  goal: string;
  steps: PlanStep[];
}

export type AgentPlan = Plan;

export interface WorkflowEvent {
  id: string;
  type: AgentEventType;
  title: string;
  detail?: string;
  timestamp: number;
  status: StepStatus;
}

export interface ToolCallRecord {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: StepStatus;
  duration?: number;
}

export interface CitationRecord {
  id: string;
  source: string;
  content: string;
  chunk?: number | string;
  score?: number;
}

export interface MemoryRecord {
  id: string;
  type: 'working' | 'episodic' | 'semantic';
  content: string;
  importance: number;
  updatedAt: number;
}

export interface AgentStateSnapshot {
  goal: string;
  currentStepId?: string;
  completedStepIds: string[];
  status: 'idle' | 'planning' | 'running' | 'success' | 'failed';
  error?: string;
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

export interface AgentStreamEvent {
  kind:
    'message' | 'plan' | 'workflow' | 'tool' | 'citation' | 'memory' | 'state' | 'done' | 'error';
  payload: unknown;
}
