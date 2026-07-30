import type { MemoryItem, MemoryQuery, RetrievedMemory } from '@shared-types/memory';

export class MemoryRetriever {
  retrieve(memories: MemoryItem[], query: MemoryQuery): RetrievedMemory[] {
    const keywords = this.tokenize(query.query);
    const limit = query.limit ?? 5;
    const minImportance = query.minImportance ?? 0;
    const allowedTypes = new Set(query.types ?? ['working', 'episodic', 'semantic']);

    return memories
      .filter(memory => allowedTypes.has(memory.type))
      .filter(memory => memory.importance >= minImportance)
      .map(memory => {
        const searchable = `${memory.content} ${Object.values(memory.metadata ?? {}).join(' ')}`.toLowerCase();
        const matchedKeywords = keywords.filter(keyword => searchable.includes(keyword));
        const score = matchedKeywords.length + memory.importance;

        return {
          ...memory,
          score,
          matchedKeywords,
        };
      })
      .filter(memory =>
        memory.score > memory.importance ||
        keywords.length === 0 ||
        (memory.type === 'semantic' && memory.importance >= 0.8)
      )
      .sort((a, b) => b.score - a.score || b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }

  private tokenize(query: string): string[] {
    const rawTokens = query
      .toLowerCase()
      .split(/[\s,，。！？?;；:：、]+/)
      .map(token => token.trim())
      .filter(Boolean);

    const tokens = new Set<string>();
    for (const token of rawTokens) {
      tokens.add(token);
      const chineseText = token.replace(/[的是什么多少如何怎么请问一下并生成报告分析]/g, '');
      if (chineseText) tokens.add(chineseText);

      if (/^[\u4e00-\u9fa5]+$/.test(chineseText) && chineseText.length >= 2) {
        for (let i = 0; i < chineseText.length - 1; i++) {
          tokens.add(chineseText.slice(i, i + 2));
        }
      }
    }

    return Array.from(tokens).filter(Boolean);
  }
}
