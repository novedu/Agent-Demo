import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startAgentTask } from './agent';
import type { AgentEvent } from '../types/agent';

describe('startAgentTask', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('streams the default sales-analysis agent scenario', async () => {
    const events: AgentEvent[] = [];

    startAgentTask({
      taskId: 'task_test',
      input: '分析华东区域销售下降原因，并生成报告',
      onEvent: (event) => events.push(event),
    });

    await vi.runAllTimersAsync();

    expect(events.slice(0, 7).map((event) => event.type)).toEqual([
      'plan_start',
      'plan_update',
      'tool_start',
      'tool_success',
      'rag_retrieve',
      'reflection',
      'memory_update',
    ]);

    expect(
      events.some((event) => {
        const payload = event.payload as { answerDelta?: string };
        return event.type === 'final_answer' && typeof payload.answerDelta === 'string';
      }),
    ).toBe(true);

    const doneEvent = events[events.length - 1];
    expect(doneEvent?.type).toBe('final_answer');
    expect((doneEvent?.payload as { done?: boolean }).done).toBe(true);
  });
});
