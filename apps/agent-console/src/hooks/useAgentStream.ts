import { useCallback, useEffect, useRef } from 'react';
import { createAgentTask, subscribeAgentEvents, type AgentEventSubscription } from '../services/agent';
import { useAgentStore } from '../store/agentStore';

export function useAgentStream() {
  const subscriptionRef = useRef<AgentEventSubscription | null>(null);
  const beginTask = useAgentStore((state) => state.beginTask);
  const updateFromEvent = useAgentStore((state) => state.updateFromEvent);
  const setStatus = useAgentStore((state) => state.setStatus);

  const start = useCallback(
    async (input: string) => {
      subscriptionRef.current?.close();
      subscriptionRef.current = null;
      beginTask(input);

      try {
        const task = await createAgentTask(input);
        subscriptionRef.current = subscribeAgentEvents(task.taskId, {
          onEvent: updateFromEvent,
          onError: () => {
            setStatus('error');
          },
          onClose: () => {
            subscriptionRef.current = null;
          },
        });
      } catch {
        setStatus('error');
      }
    },
    [beginTask, setStatus, updateFromEvent],
  );

  const stop = useCallback(() => {
    subscriptionRef.current?.close();
    subscriptionRef.current = null;
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
