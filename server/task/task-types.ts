import type { AgentTrace } from '../../types';
import type { AgentServerEvent } from '../types/api';

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TaskRecord {
  taskId: string;
  input: string;
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
