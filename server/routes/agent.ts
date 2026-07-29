import type {
  AgentEventSink,
  AgentRuntimePort,
  AgentServerEvent,
  AgentTaskListResponse,
  AgentTaskStatusResponse,
  AgentTaskStore,
  ApiErrorResponse,
  CreateAgentTaskRequest,
  CreateAgentTaskResponse,
  TaskCompletePayload,
} from '../types/api';

export const agentRoutes = [
  {
    method: 'POST',
    path: '/api/agent/tasks',
    description: 'Create an Agent task and start runtime execution.',
  },
  {
    method: 'GET',
    path: '/api/agent/tasks/:taskId/events',
    description: 'Subscribe to Agent task events through SSE.',
  },
  {
    method: 'GET',
    path: '/api/agent/tasks/:taskId',
    description: 'Query one Agent task snapshot.',
  },
  {
    method: 'GET',
    path: '/api/agent/tasks',
    description: 'List Agent task history.',
  },
] as const;

export interface AgentEventHub {
  publish: (event: AgentServerEvent) => void;
  subscribe: (taskId: string, listener: AgentEventSink) => () => void;
}

export interface AgentRouteDependencies {
  runtime: AgentRuntimePort;
  taskStore: AgentTaskStore;
  eventHub: AgentEventHub;
}

export interface AgentRouteHandlers {
  createTask: (
    request: CreateAgentTaskRequest,
  ) => Promise<CreateAgentTaskResponse | ApiErrorResponse>;
  getTask: (taskId: string) => Promise<AgentTaskStatusResponse | ApiErrorResponse>;
  listTasks: () => Promise<AgentTaskListResponse>;
  subscribeTaskEvents: (taskId: string, listener: AgentEventSink) => (() => void) | ApiErrorResponse;
}

export function createAgentRouteHandlers(deps: AgentRouteDependencies): AgentRouteHandlers {
  return {
    createTask: async (request) => {
      const input = request.input.trim();

      if (!input) {
        return {
          error: {
            code: 'INVALID_INPUT',
            message: 'input is required',
          },
        };
      }

      const task = deps.taskStore.create(input);
      deps.taskStore.update(task.taskId, {
        status: 'running',
        progress: 0,
        currentStep: 'planning',
      });

      runRuntimeTask(deps, task.taskId, input);

      return {
        taskId: task.taskId,
        status: 'running',
      };
    },

    getTask: async (taskId) => {
      const task = deps.taskStore.findById(taskId);

      if (!task) {
        return {
          error: {
            code: 'TASK_NOT_FOUND',
            message: `Task ${taskId} was not found`,
          },
        };
      }

      return {
        taskId: task.taskId,
        status: task.status,
        currentStep: task.currentStep,
        progress: task.progress,
        createdAt: task.createdAt,
      };
    },

    listTasks: async () => ({
      tasks: deps.taskStore.list().map((task) => ({
        taskId: task.taskId,
        status: task.status,
        currentStep: task.currentStep,
        progress: task.progress,
        createdAt: task.createdAt,
      })),
    }),

    subscribeTaskEvents: (taskId, listener) => {
      const task = deps.taskStore.findById(taskId);

      if (!task) {
        return {
          error: {
            code: 'TASK_NOT_FOUND',
            message: `Task ${taskId} was not found`,
          },
        };
      }

      return deps.eventHub.subscribe(taskId, listener);
    },
  };
}

function runRuntimeTask(deps: AgentRouteDependencies, taskId: string, input: string): void {
  void deps.runtime
    .runTask({
      taskId,
      input,
      emit: (event) => publishRuntimeEvent(deps, event),
    })
    .then((trace) => {
      deps.taskStore.update(taskId, {
        status: trace.success ? 'completed' : 'failed',
        progress: 100,
        currentStep: undefined,
        completedAt: Date.now(),
        error: trace.error,
      });

      deps.eventHub.publish({
        id: `${taskId}_task_complete`,
        taskId,
        type: 'task_complete',
        timestamp: Date.now(),
        payload: {
          status: trace.success ? 'completed' : 'failed',
          duration: trace.totalDuration,
          trace,
          error: trace.error,
        } satisfies TaskCompletePayload,
      });
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);

      deps.taskStore.update(taskId, {
        status: 'failed',
        progress: 100,
        currentStep: undefined,
        completedAt: Date.now(),
        error: message,
      });

      deps.eventHub.publish({
        id: `${taskId}_task_complete`,
        taskId,
        type: 'task_complete',
        timestamp: Date.now(),
        payload: {
          status: 'failed',
          duration: 0,
          error: message,
        } satisfies TaskCompletePayload,
      });
    });
}

function publishRuntimeEvent(deps: AgentRouteDependencies, event: AgentServerEvent): void {
  switch (event.type) {
    case 'plan_start':
      deps.taskStore.update(event.taskId, {
        status: 'running',
        currentStep: 'planning',
        progress: 5,
      });
      break;
    case 'plan_update':
      deps.taskStore.update(event.taskId, {
        currentStep: 'workflow',
        progress: 15,
      });
      break;
    case 'tool_start': {
      const payload = event.payload as { toolName?: string };
      deps.taskStore.update(event.taskId, {
        currentStep: payload.toolName ?? 'tool',
      });
      break;
    }
    case 'tool_success':
      deps.taskStore.update(event.taskId, {
        progress: Math.max(deps.taskStore.findById(event.taskId)?.progress ?? 0, 35),
      });
      break;
    case 'rag_retrieve':
      deps.taskStore.update(event.taskId, {
        currentStep: 'searchKnowledge',
        progress: Math.max(deps.taskStore.findById(event.taskId)?.progress ?? 0, 65),
      });
      break;
    case 'reflection':
      deps.taskStore.update(event.taskId, {
        currentStep: 'reflection',
        progress: Math.max(deps.taskStore.findById(event.taskId)?.progress ?? 0, 80),
      });
      break;
    case 'memory_update':
      deps.taskStore.update(event.taskId, {
        currentStep: 'memory_update',
        progress: Math.max(deps.taskStore.findById(event.taskId)?.progress ?? 0, 90),
      });
      break;
    case 'state_update': {
      const payload = event.payload as { currentStep?: string; progress?: number };
      deps.taskStore.update(event.taskId, {
        currentStep: payload.currentStep,
        progress: payload.progress ?? deps.taskStore.findById(event.taskId)?.progress ?? 0,
      });
      break;
    }
    case 'final_answer':
      deps.taskStore.update(event.taskId, {
        currentStep: 'final_answer',
        progress: Math.max(deps.taskStore.findById(event.taskId)?.progress ?? 0, 95),
      });
      break;
    case 'tool_error':
      deps.taskStore.update(event.taskId, {
        status: 'failed',
        progress: 100,
      });
      break;
    case 'task_complete':
      break;
  }

  deps.eventHub.publish(event);
}
