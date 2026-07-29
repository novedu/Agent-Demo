import type { RetrievedMemory } from './memory-types';

export class MemorySummary {
  buildContext(memories: RetrievedMemory[]): string {
    if (memories.length === 0) {
      return '';
    }

    const lines = memories.map((memory, index) => {
      const source = memory.metadata?.source ? ` source=${String(memory.metadata.source)}` : '';
      return `${index + 1}. [${memory.type}] importance=${memory.importance}${source}\n${memory.content}`;
    });

    return [
      '相关长期记忆：',
      ...lines,
      '使用这些记忆辅助判断，但不要编造记忆中不存在的事实。',
    ].join('\n');
  }
}

