import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { subscribeAgentEvents } from './agent';
import { useAgentStore } from '../store/agentStore';
import type { AgentEvent, AgentEventType } from '../types/agent';

class MockEventSource {
  static instances: MockEventSource[] = [];
  readonly url: string;
  onerror: ((event: Event) => void) | null = null;
  private listeners = new Map<string, EventListener[]>();

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: EventListener): void {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  close = vi.fn();

  emit(type: AgentEventType, event: AgentEvent): void {
    const message = new MessageEvent(type, {
      data: JSON.stringify(event),
    });
    this.listeners.get(type)?.forEach((listener) => listener(message));
  }
}

describe('subscribeAgentEvents', () => {
  beforeEach(() => {
    vi.stubGlobal('EventSource', MockEventSource);
    MockEventSource.instances = [];
    useAgentStore.setState({
      messages: [],
      events: [],
      workflow: [],
      plan: null,
      tools: [],
      citations: [],
      memory: [],
      memories: [],
      status: 'idle',
      isStreaming: false,
      activeAssistantMessageId: undefined,
      answerBuffer: '',
      state: undefined,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('updates the assistant message when final_answer deltas arrive', () => {
    useAgentStore.getState().beginTask('分析华东区域销售下降原因，并生成报告');

    subscribeAgentEvents('task_test', {
      onEvent: (event) => useAgentStore.getState().updateFromEvent(event),
    });

    const eventSource = MockEventSource.instances[0];
    expect(eventSource.url).toBe('http://127.0.0.1:3001/api/agent/tasks/task_test/events');

    eventSource.emit('final_answer', {
      id: 'event_1',
      taskId: 'task_test',
      type: 'final_answer',
      timestamp: Date.now(),
      payload: { delta: '# 华东区域' },
    });
    eventSource.emit('final_answer', {
      id: 'event_2',
      taskId: 'task_test',
      type: 'final_answer',
      timestamp: Date.now(),
      payload: { delta: '销售下降分析报告' },
    });
    eventSource.emit('task_complete', {
      id: 'event_3',
      taskId: 'task_test',
      type: 'task_complete',
      timestamp: Date.now(),
      payload: { status: 'completed', duration: 100 },
    });

    const state = useAgentStore.getState();
    const assistantMessage = state.messages.find((message) => message.role === 'assistant');

    expect(assistantMessage?.content).toBe('# 华东区域销售下降分析报告');
    expect(state.status).toBe('success');
  });
});
