import type { ChatMessage, LLMResponse, ToolDefinition } from '@shared-types/agent';
import type { LLMProvider } from './provider';

export interface MockLLMProviderConfig {
  responses: LLMResponse[];
  delayMs?: number;
}

export class MockLLMProvider implements LLMProvider {
  name = 'mock';
  private queue: LLMResponse[];
  private index = 0;
  private delayMs: number;

  constructor(config: MockLLMProviderConfig) {
    this.queue = config.responses;
    this.delayMs = config.delayMs ?? 200;
  }

  async chat(_messages: ChatMessage[], _tools?: ToolDefinition[]): Promise<LLMResponse> {
    await new Promise(resolve => setTimeout(resolve, this.delayMs));

    const plannerMessage = _messages.find(message => message.content.includes('你是一个任务规划器'));
    if (plannerMessage) {
      return this.createPlannerResponse(_messages);
    }

    if (this.index >= this.queue.length) {
      return { content: 'No more responses.', done: true };
    }

    return this.queue[this.index++];
  }

  private createPlannerResponse(messages: ChatMessage[]): LLMResponse {
    const userMessage = messages.find(message => message.role === 'user');
    const userPayload = this.parseUserPayload(userMessage?.content ?? '');
    const goal = userPayload.goal || '未命名任务';

    if (goal.includes('销售') && goal.includes('下降')) {
      return {
        content: JSON.stringify({
          goal,
          steps: [
            {
              id: '1',
              tool: 'querySalesData',
              description: '查询华东区域销售数据',
              args: { region: '华东', month: '2024-02' },
            },
            {
              id: '2',
              tool: 'calculateMetrics',
              description: '计算华东区域销售增长率',
              args: { current: 980000, previous: 1250000, metric: 'growth' },
            },
            {
              id: '3',
              tool: 'searchKnowledge',
              description: '检索华东销售下降的可能原因',
              args: { query: '华东 销售下降 渠道 原因', limit: 3 },
            },
            {
              id: '4',
              tool: 'llm',
              description: '根据销售数据、增长率和知识库结果生成分析报告',
            },
          ],
        }),
        done: true,
      };
    }

    return {
      content: JSON.stringify({
        goal,
        steps: [
          {
            id: '1',
            tool: 'llm',
            description: '理解用户目标并生成回答',
          },
        ],
      }),
      done: true,
    };
  }

  private parseUserPayload(content: string): { goal: string } {
    try {
      const payload = JSON.parse(content) as { goal?: unknown };
      return {
        goal: typeof payload.goal === 'string' ? payload.goal : content,
      };
    } catch {
      return { goal: content };
    }
  }
}
