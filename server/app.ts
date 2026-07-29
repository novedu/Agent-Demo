import { agentRoutes, createAgentRouteHandlers, type AgentEventHub } from './routes/agent';
import type {
  AgentEventSink,
  AgentRuntimePort,
  AgentServerEvent,
  AgentTaskSnapshot,
  AgentTaskStore,
} from './types/api';

export interface AgentServerApp {
  routes: typeof agentRoutes;
  handlers: ReturnType<typeof createAgentRouteHandlers>;
  taskStore: AgentTaskStore;
  eventHub: AgentEventHub;
}

export interface CreateAgentServerAppOptions {
  runtime: AgentRuntimePort;
  taskStore?: AgentTaskStore;
  eventHub?: AgentEventHub;
}

export function createAgentServerApp(options: CreateAgentServerAppOptions): AgentServerApp {
  const taskStore = options.taskStore ?? createInMemoryTaskStore();
  const eventHub = options.eventHub ?? createInMemoryAgentEventHub();

  return {
    routes: agentRoutes,
    handlers: createAgentRouteHandlers({
      runtime: options.runtime,
      taskStore,
      eventHub,
    }),
    taskStore,
    eventHub,
  };
}

export function createInMemoryTaskStore(): AgentTaskStore {
  const tasks = new Map<string, AgentTaskSnapshot>();

  return {
    create: (input) => {
      const now = Date.now();
      const task: AgentTaskSnapshot = {
        taskId: createTaskId(),
        input,
        status: 'queued',
        progress: 0,
        createdAt: now,
        updatedAt: now,
      };

      tasks.set(task.taskId, task);
      return task;
    },

    update: (taskId, patch) => {
      const task = tasks.get(taskId);
      if (!task) return;

      tasks.set(taskId, {
        ...task,
        ...patch,
        updatedAt: Date.now(),
      });
    },

    findById: (taskId) => tasks.get(taskId),
    list: () => Array.from(tasks.values()).sort((a, b) => b.createdAt - a.createdAt),
  };
}

export function createInMemoryAgentEventHub(): AgentEventHub {
  const listeners = new Map<string, Set<AgentEventSink>>();
  const history = new Map<string, AgentServerEvent[]>();

  return {
    publish: (event: AgentServerEvent) => {
      const taskHistory = history.get(event.taskId) ?? [];
      taskHistory.push(event);
      history.set(event.taskId, taskHistory);

      const taskListeners = listeners.get(event.taskId);
      if (!taskListeners) return;

      taskListeners.forEach((listener) => listener(event));
    },

    subscribe: (taskId, listener) => {
      const taskListeners = listeners.get(taskId) ?? new Set<AgentEventSink>();
      taskListeners.add(listener);
      listeners.set(taskId, taskListeners);
      queueMicrotask(() => {
        history.get(taskId)?.forEach((event) => {
          if (listeners.get(taskId)?.has(listener)) {
            listener(event);
          }
        });
      });

      return () => {
        taskListeners.delete(listener);
        if (taskListeners.size === 0) {
          listeners.delete(taskId);
        }
      };
    },
  };
}

function createTaskId(): string {
  return `task_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}
