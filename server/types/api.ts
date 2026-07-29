import type { AgentTrace, Plan, PlanStep, ToolResult } from '../../types';

export type AgentTaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type AgentServerEventType =
  | 'plan_start'
  | 'plan_update'
  | 'tool_start'
  | 'tool_success'
  | 'tool_error'
  | 'rag_retrieve'
  | 'reflection'
  | 'memory_update'
  | 'state_update'
  | 'final_answer'
  | 'task_complete';

export interface AgentServerEvent<TPayload = unknown> {
  id: string;
  taskId: string;
  type: AgentServerEventType;
  timestamp: number;
  payload: TPayload;
}

export interface CreateAgentTaskRequest {
  input: string;
}

export interface CreateAgentTaskResponse {
  taskId: string;
  status: Extract<AgentTaskStatus, 'running'>;
}

export interface AgentTaskSnapshot {
  taskId: string;
  input: string;
  status: AgentTaskStatus;
  currentStep?: string;
  progress: number;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  error?: string;
}

export interface AgentTaskStatusResponse {
  taskId: string;
  status: AgentTaskStatus;
  currentStep?: string;
  progress: number;
  createdAt: number;
}

export interface AgentTaskListResponse {
  tasks: AgentTaskStatusResponse[];
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface PlanStartPayload {
  input: string;
}

export interface PlanUpdatePayload {
  plan: Plan;
  steps: PlanStep[];
}

export interface ToolStartPayload {
  toolCallId?: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolSuccessPayload {
  toolCallId?: string;
  toolName: string;
  result: ToolResult;
}

export interface ToolErrorPayload {
  toolCallId?: string;
  toolName: string;
  error: {
    type: 'not_found' | 'timeout' | 'argument' | 'execution';
    message: string;
  };
}

export interface RagRetrievePayload {
  query: string;
  documents: Array<{
    id: string;
    content: string;
    metadata?: Record<string, unknown>;
    score?: number;
  }>;
  duration: number;
}

export interface ReflectionPayload {
  status: 'passed' | 'needs_replanning' | 'failed';
  message: string;
}

export interface MemoryUpdatePayload {
  memoryType: 'working' | 'episodic' | 'semantic';
  items: Array<{
    id: string;
    type?: 'working' | 'episodic' | 'semantic';
    content: string;
    importance: number;
  }>;
}

export interface StateUpdatePayload {
  status: AgentTaskStatus;
  currentStep?: string;
  completedStepIds: string[];
  progress: number;
}

export interface FinalAnswerPayload {
  delta?: string;
  content?: string;
  done?: boolean;
}

export interface TaskCompletePayload {
  status: Extract<AgentTaskStatus, 'completed' | 'failed' | 'cancelled'>;
  duration: number;
  trace?: AgentTrace;
  error?: string;
}

export type AgentEventSink = (event: AgentServerEvent) => void;

export interface RuntimeTaskContext {
  taskId: string;
  input: string;
  emit: AgentEventSink;
}

export interface AgentRuntimePort {
  runTask: (context: RuntimeTaskContext) => Promise<AgentTrace>;
}

export interface AgentTaskStore {
  create: (input: string) => AgentTaskSnapshot;
  update: (taskId: string, patch: Partial<Omit<AgentTaskSnapshot, 'taskId' | 'createdAt'>>) => void;
  findById: (taskId: string) => AgentTaskSnapshot | undefined;
  list: () => AgentTaskSnapshot[];
}
