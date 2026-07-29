import { agentRoutes, createAgentRouteHandlers, type AgentEventHub } from './routes/agent';
import { TaskManager } from './task/task-manager';
import type { TaskRepository } from './task/task-repository';
import { InMemoryTaskRepository } from './task/task-store';
import type { AgentEventSink, AgentRuntimePort, AgentServerEvent } from './types/api';

export interface AgentServerApp {
  routes: typeof agentRoutes;
  handlers: ReturnType<typeof createAgentRouteHandlers>;
  taskManager: TaskManager;
  taskRepository: TaskRepository;
  eventHub: AgentEventHub;
}

export interface CreateAgentServerAppOptions {
  runtime: AgentRuntimePort;
  taskRepository?: TaskRepository;
  eventHub?: AgentEventHub;
}

export function createAgentServerApp(options: CreateAgentServerAppOptions): AgentServerApp {
  const eventHub = options.eventHub ?? createInMemoryAgentEventHub();
  const taskRepository = options.taskRepository ?? new InMemoryTaskRepository();
  const taskManager = new TaskManager({
    repository: taskRepository,
    runtime: options.runtime,
    publishEvent: eventHub.publish,
  });

  return {
    routes: agentRoutes,
    handlers: createAgentRouteHandlers({
      taskManager,
      eventHub,
    }),
    taskManager,
    taskRepository,
    eventHub,
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
