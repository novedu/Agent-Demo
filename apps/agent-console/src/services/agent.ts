import type { AgentEvent, AgentEventType } from '../types/agent';

export interface CreateAgentTaskResponse {
  taskId: string;
  status: string;
}

export interface AgentEventSubscription {
  close: () => void;
}

export interface SubscribeAgentEventsOptions {
  onEvent: (event: AgentEvent) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
}

const agentServerURL = (import.meta.env.VITE_AGENT_SERVER_URL ?? '').replace(/\/$/, '');

const supportedEventTypes: AgentEventType[] = [
  'task_created',
  'plan_start',
  'plan_update',
  'tool_start',
  'tool_success',
  'tool_error',
  'permission_denied',
  'tool_blocked',
  'approval_required',
  'rag_retrieve',
  'reflection',
  'memory_update',
  'evaluation_start',
  'evaluation_complete',
  'state_update',
  'final_answer',
  'task_cancelled',
  'task_retry',
  'task_failed',
  'task_complete',
];

export async function createAgentTask(input: string): Promise<CreateAgentTaskResponse> {
  const response = await fetch(`${getAgentServerURL()}/api/agent/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    throw new Error(`Create Agent task failed: ${response.status} ${await response.text()}`);
  }

  return response.json() as Promise<CreateAgentTaskResponse>;
}

export async function cancelAgentTask(taskId: string): Promise<void> {
  const response = await fetch(`${getAgentServerURL()}/api/agent/tasks/${taskId}/cancel`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Cancel Agent task failed: ${response.status} ${await response.text()}`);
  }
}

export function subscribeAgentEvents(
  taskId: string,
  options: SubscribeAgentEventsOptions,
): AgentEventSubscription {
  const eventSource = new EventSource(`${getAgentServerURL()}/api/agent/tasks/${taskId}/events`);

  const handleMessage = (message: MessageEvent<string>) => {
    const event = parseAgentEvent(message.data);
    if (!event) return;

    options.onEvent(event);

    if (event.type === 'task_complete') {
      eventSource.close();
      options.onClose?.();
    }
  };

  supportedEventTypes.forEach((type) => {
    eventSource.addEventListener(type, handleMessage as EventListener);
  });

  eventSource.onerror = (error) => {
    options.onError?.(error);
  };

  return {
    close: () => {
      eventSource.close();
      options.onClose?.();
    },
  };
}

export function getAgentServerURL(): string {
  if (!agentServerURL) {
    throw new Error('VITE_AGENT_SERVER_URL is required');
  }

  return agentServerURL;
}

function parseAgentEvent(raw: string): AgentEvent | null {
  try {
    return JSON.parse(raw) as AgentEvent;
  } catch {
    return null;
  }
}
