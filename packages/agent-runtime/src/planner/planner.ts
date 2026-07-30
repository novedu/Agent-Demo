import type { ChatMessage, Plan, PlanStep } from '@shared-types/agent';
import { ToolRegistry } from '@runtime/tool/registry';
import type { LLMProvider } from '@runtime/llm';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export interface PlannerConfig {
  llmProvider: LLMProvider;
  toolRegistry: ToolRegistry;
}

export class Planner {
  private llmProvider: LLMProvider;
  private toolRegistry: ToolRegistry;

  constructor(config: PlannerConfig) {
    this.llmProvider = config.llmProvider;
    this.toolRegistry = config.toolRegistry;
  }

  async createPlan(userInput: string): Promise<Plan> {
    const toolDefinitions = this.toolRegistry.getToolDefinitions();
    const messages: ChatMessage[] = [
      {
        id: `planner_system_${generateId()}`,
        role: 'system',
        content: [
          '你是一个任务规划器。',
          '根据用户目标和可用工具生成 JSON 计划。',
          '只返回 JSON，不要返回 Markdown。',
          '格式：{"goal":"...","steps":[{"id":"1","tool":"工具名或llm","description":"...","args":{}}]}',
          '如果某一步只需要模型总结，tool 使用 "llm"。',
        ].join('\n'),
        createdAt: Date.now(),
      },
      {
        id: `planner_user_${generateId()}`,
        role: 'user',
        content: JSON.stringify({
          goal: userInput,
          tools: toolDefinitions,
        }),
        createdAt: Date.now(),
      },
    ];

    const response = await this.llmProvider.chat(messages);
    const rawPlan = this.parsePlanJson(response.content);

    return {
      goal: typeof rawPlan.goal === 'string' && rawPlan.goal.trim()
        ? rawPlan.goal
        : userInput,
      steps: this.normalizeSteps(rawPlan.steps),
    };
  }

  private parsePlanJson(content: string): { goal?: unknown; steps?: unknown } {
    try {
      return JSON.parse(this.stripCodeFence(content));
    } catch (err) {
      throw new Error(`Planner failed to parse LLM plan JSON: ${(err as Error).message}`);
    }
  }

  private stripCodeFence(content: string): string {
    return content
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');
  }

  private normalizeSteps(steps: unknown): PlanStep[] {
    if (!Array.isArray(steps)) {
      throw new Error('Planner response must include steps array');
    }

    return steps.map((step, index) => {
      const item = step as {
        id?: unknown;
        tool?: unknown;
        description?: unknown;
        args?: unknown;
      };

      return {
        id: typeof item.id === 'string' && item.id.trim() ? item.id : String(index + 1),
        tool: typeof item.tool === 'string' && item.tool.trim() ? item.tool : 'llm',
        description: typeof item.description === 'string' ? item.description : `执行步骤 ${index + 1}`,
        args: item.args && typeof item.args === 'object' && !Array.isArray(item.args)
          ? item.args as Record<string, unknown>
          : undefined,
        status: 'pending',
      };
    });
  }
}
