import { useCallback, useEffect, useRef } from 'react';
import { startAgentTask, type AgentTaskStream } from '../api/agent';
import { useAgentStore } from '../store/agentStore';
import type {
  AgentEvent,
  AgentStateSnapshot,
  CitationRecord,
  MemoryRecord,
  Plan,
  ToolCallRecord,
} from '../types/agent';

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

interface EventPayload {
  answer?: string;
  answerDelta?: string;
  citations?: CitationRecord[];
  done?: boolean;
  memory?: MemoryRecord[];
  plan?: Plan;
  state?: AgentStateSnapshot;
  tool?: ToolCallRecord;
}

export function useAgentStream(taskId: string) {
  const streamRef = useRef<AgentTaskStream | null>(null);
  const answerMessageIdRef = useRef<string | null>(null);
  const answerTextRef = useRef('');
  const store = useAgentStore();

  const applyEvent = useCallback(
    (event: AgentEvent) => {
      const payload = event.payload as EventPayload;
      const isAnswerDelta =
        event.type === 'final_answer' && typeof payload.answerDelta === 'string';

      if (!isAnswerDelta) {
        store.addEvent(event);
      }

      if (payload.state) {
        store.setState(payload.state);
      }

      if (payload.plan) {
        store.updatePlan(payload.plan);
      }

      switch (event.type) {
        case 'plan_start':
          store.setStatus('running');
          break;
        case 'plan_update':
          break;
        case 'tool_start':
        case 'tool_success':
        case 'tool_error':
          if (payload.tool) {
            store.upsertTool(payload.tool);
          }
          if (event.type === 'tool_error') {
            store.setStatus('error');
            streamRef.current?.close();
          }
          break;
        case 'rag_retrieve':
          if (payload.citations) {
            store.setCitations(payload.citations);
          }
          break;
        case 'memory_update':
          if (payload.memory) {
            store.setMemory(payload.memory);
          }
          break;
        case 'final_answer':
          if (payload.answerDelta) {
            answerTextRef.current += payload.answerDelta;
            if (answerMessageIdRef.current) {
              store.updateMessage(answerMessageIdRef.current, { content: answerTextRef.current });
            }
            break;
          }
          if (payload.answer) {
            answerTextRef.current = payload.answer;
            if (answerMessageIdRef.current) {
              store.updateMessage(answerMessageIdRef.current, { content: payload.answer });
            }
          }
          if (payload.done || payload.answer) {
            store.setStatus('success');
            streamRef.current = null;
          }
          break;
        case 'workflow_start':
        case 'reflection':
        case 'replanning':
          break;
      }
    },
    [store],
  );

  const start = useCallback(
    (input: string) => {
      streamRef.current?.close();
      store.reset();
      store.setStreaming(true);
      answerTextRef.current = '';
      answerMessageIdRef.current = createId('msg');
      store.addMessage({
        id: createId('msg'),
        role: 'user',
        content: input,
        createdAt: Date.now(),
      });
      store.addMessage({
        id: answerMessageIdRef.current,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
      });

      streamRef.current = startAgentTask({
        taskId: `${taskId}_${Date.now()}`,
        input,
        onEvent: applyEvent,
        onError: () => {
          store.setStatus('error');
        },
      });
    },
    [applyEvent, store, taskId],
  );

  const stop = useCallback(() => {
    streamRef.current?.close();
    streamRef.current = null;
    answerMessageIdRef.current = null;
    answerTextRef.current = '';
    store.setStreaming(false);
  }, [store]);

  useEffect(
    () => () => {
      streamRef.current?.close();
    },
    [],
  );

  return { start, stop };
}
