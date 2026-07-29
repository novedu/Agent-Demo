import type { CreateTaskInput, TaskRecord, UpdateTaskInput } from './task-types';

export interface TaskRepository {
  create: (input: CreateTaskInput) => TaskRecord;
  update: (taskId: string, patch: UpdateTaskInput) => TaskRecord | undefined;
  get: (taskId: string) => TaskRecord | undefined;
  list: () => TaskRecord[];
}
