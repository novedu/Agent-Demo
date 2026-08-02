import { beforeEach, describe, expect, it } from 'vitest';
import { useAgentStore } from './agentStore';
import type { AgentEvent } from '../types/agent';

function event(type: AgentEvent['type'], payload: unknown): AgentEvent {
  return {
    id: `${type}_1`,
    taskId: 'task_projection_1',
    type,
    timestamp: 100,
    payload,
  };
}

describe('Agent event projection', () => {
  beforeEach(() => {
    useAgentStore.getState().reset();
    useAgentStore.setState({
      messages: [],
      status: 'idle',
      isStreaming: false,
      activeAssistantMessageId: undefined,
      answerBuffer: '',
    });
  });

  it('projects RAG evidence and memory updates into inspectable store records', () => {
    useAgentStore.getState().beginTask('Analyze East China sales decline');
    useAgentStore.getState().updateFromEvent(
      event('rag_retrieve', {
        query: 'East China sales decline',
        documents: [
          {
            id: 'doc_1',
            content: 'Regional demand softened in Q2.',
            metadata: { title: 'Sales Brief', chunk: 3 },
            score: 0.92,
          },
        ],
        duration: 860,
      }),
    );
    useAgentStore.getState().updateFromEvent(
      event('memory_update', {
        memoryType: 'episodic',
        items: [
          {
            id: 'memory_1',
            type: 'episodic',
            content: 'East China demand softened in Q2.',
            importance: 0.8,
          },
        ],
      }),
    );

    const state = useAgentStore.getState();
    expect(state.citations).toEqual([
      {
        id: 'doc_1',
        source: 'Sales Brief',
        content: 'Regional demand softened in Q2.',
        chunk: 3,
        score: 0.92,
      },
    ]);
    expect(state.memory).toEqual([
      {
        id: 'memory_1',
        type: 'episodic',
        content: 'East China demand softened in Q2.',
        importance: 0.8,
        updatedAt: 100,
      },
    ]);
    expect(state.workflow.map((item) => item.type)).toEqual(['rag_retrieve', 'memory_update']);
  });

  it('keeps failure and retry state visible to the runtime console', () => {
    useAgentStore.getState().beginTask('Retry a tool');
    useAgentStore.getState().updateFromEvent(
      event('tool_error', {
        toolName: 'querySalesData',
        args: { region: 'East China' },
        error: { message: 'Temporary timeout' },
      }),
    );
    expect(useAgentStore.getState().status).toBe('error');
    expect(useAgentStore.getState().tools[0]?.status).toBe('failed');

    useAgentStore.getState().updateFromEvent(event('task_retry', { retryCount: 1 }));
    expect(useAgentStore.getState().status).toBe('running');
    expect(useAgentStore.getState().isStreaming).toBe(true);
  });
});
