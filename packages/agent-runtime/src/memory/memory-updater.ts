import type { CreateMemoryInput, MemoryItem } from '@shared-types/memory';
import type { ToolResult } from '@shared-types/agent';

export class MemoryUpdater {
  fromUserInput(userInput: string, metadata?: Record<string, unknown>): CreateMemoryInput[] {
    const memories: CreateMemoryInput[] = [
      {
        type: 'working',
        content: `用户当前目标：${userInput}`,
        importance: 0.6,
        metadata: { source: 'user_input', ...metadata },
      },
      {
        type: 'episodic',
        content: `用户发起任务：${userInput}`,
        importance: 0.5,
        metadata: { source: 'user_input', ...metadata },
      },
    ];

    if (this.isUserProfile(userInput)) {
      memories.push({
        type: 'semantic',
        content: `用户背景偏好：${userInput}`,
        importance: 0.9,
        metadata: { source: 'user_profile', ...metadata },
      });
    }

    return memories;
  }

  fromToolResult(toolName: string, result: ToolResult, metadata?: Record<string, unknown>): CreateMemoryInput[] {
    const content = result.success
      ? `工具 ${toolName} 执行成功：${this.stringify(result.data)}`
      : `工具 ${toolName} 执行失败：${result.error}`;

    return [
      {
        type: 'working',
        content,
        importance: result.success ? 0.7 : 0.8,
        metadata: { source: 'tool_result', toolName, ...metadata },
      },
      {
        type: 'episodic',
        content,
        importance: result.success ? 0.55 : 0.75,
        metadata: { source: 'tool_result', toolName, ...metadata },
      },
    ];
  }

  fromFinalAnswer(answer: string, metadata?: Record<string, unknown>): CreateMemoryInput[] {
    if (!answer.trim()) return [];

    return [
      {
        type: 'episodic',
        content: `任务最终回答：${answer}`,
        importance: 0.7,
        metadata: { source: 'final_answer', ...metadata },
      },
      {
        type: 'semantic',
        content: answer,
        importance: 0.8,
        metadata: { source: 'final_answer', ...metadata },
      },
    ];
  }

  mergeExisting(memory: MemoryItem, extraImportance = 0.05): Partial<MemoryItem> {
    return {
      importance: Math.min(1, memory.importance + extraImportance),
      metadata: {
        ...memory.metadata,
        reinforcedAt: Date.now(),
      },
    };
  }

  private stringify(data: unknown): string {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  private isUserProfile(userInput: string): boolean {
    return [
      '我主要使用',
      '我常用',
      '我喜欢用',
      '我是',
      '我的技术栈',
    ].some(pattern => userInput.includes(pattern));
  }
}
