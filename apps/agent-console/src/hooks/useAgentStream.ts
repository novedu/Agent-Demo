import { useCallback, useEffect, useRef } from 'react';
import {
  cancelAgentTask,
  createAgentTask,
  subscribeAgentEvents,
  type AgentEventSubscription,
} from '../services/agent';
import { useAgentStore } from '../store/agentStore';

export function useAgentStream() {
  const subscriptionRef = useRef<AgentEventSubscription | null>(null);
  const taskIdRef = useRef<string | null>(null);
  const beginTask = useAgentStore((state) => state.beginTask);
  const updateFromEvent = useAgentStore((state) => state.updateFromEvent);
  const setStatus = useAgentStore((state) => state.setStatus);

  const start = useCallback(
    async (input: string) => {
      subscriptionRef.current?.close();
      subscriptionRef.current = null;
      taskIdRef.current = null;
      beginTask(input);

      try {
        const task = await createAgentTask(input);
        taskIdRef.current = task.taskId;
        subscriptionRef.current = subscribeAgentEvents(task.taskId, {
          onEvent: updateFromEvent,
          onError: () => {
            setStatus('error');
            writeActiveAssistantMessage('Runtime server connection lost. Check the Agent Server and rerun the demo task.');
          },
          onClose: () => {
            subscriptionRef.current = null;
            taskIdRef.current = null;
          },
        });
      } catch {
        setStatus('error');
        writeActiveAssistantMessage('Unable to start the Agent Server task. Start the runtime server, then run the demo again.');
      }
    },
    [beginTask, setStatus, updateFromEvent],
  );

  const stop = useCallback(() => {
    const taskId = taskIdRef.current;
    subscriptionRef.current?.close();
    subscriptionRef.current = null;
    taskIdRef.current = null;
    if (taskId) {
      void cancelAgentTask(taskId).catch(() => undefined);
    }
    writeActiveAssistantMessage('Task cancelled by user.');
    setStatus('idle');
  }, [setStatus]);

  useEffect(
    () => () => {
      subscriptionRef.current?.close();
    },
    [],
  );

  return { start, stop };
}

function writeActiveAssistantMessage(content: string): void {
  const store = useAgentStore.getState();
  const messageId = store.activeAssistantMessageId;
  if (!messageId) return;
  store.updateMessage(messageId, {
    content,
  });
}
