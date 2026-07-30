import type { AgentTrace } from '../../types';
import type { UserContext } from '../../security/permission-types';
import type { AgentServerEvent } from '../types/api';

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TaskRecord {
  taskId: string;
  input: string;
  userContext?: UserContext;
  status: TaskStatus;
  currentStep?: string;
  progress: number;
  retryCount: number;
  maxRetry: number;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  lastError?: string;
  trace?: AgentTrace;
}

export interface CreateTaskInput {
  input: string;
  userContext?: UserContext;
  maxRetry?: number;
}

export interface UpdateTaskInput {
  status?: TaskStatus;
  currentStep?: string;
  progress?: number;
  retryCount?: number;
  startedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  lastError?: string;
  trace?: AgentTrace;
}

export interface TaskRuntimeHandle {
  controller: AbortController;
  startedAt: number;
}

export type TaskEventPublisher = (event: AgentServerEvent) => void;
