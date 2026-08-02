import { describe, expect, it } from 'vitest';
import { buildKnowledgeChunks, buildSourceSummaries, filterChunks } from './Knowledge';
import { buildGroupSummaries, buildMemoryEntries, filterEntries } from './Memory';
import type { AgentEvent, Message } from '../types/agent';

function event(type: AgentEvent['type'], payload: unknown): AgentEvent {
  return {
    id: `${type}_derived_1`,
    taskId: 'task_derived_1',
    type,
    timestamp: 100,
    payload,
  };
}

describe('Knowledge and Memory derived views', () => {
  it('derives searchable RAG chunks and source summaries from runtime events', () => {
    const chunks = buildKnowledgeChunks(
      [],
      [
        event('rag_retrieve', {
          query: 'sales decline',
          duration: 860,
          documents: [
            {
              id: 'doc_1',
              content: 'Demand softened in East China.',
              metadata: { title: 'Sales Brief', category: 'market' },
              score: 0.9,
              matchedKeywords: ['demand'],
            },
          ],
        }),
      ],
    );

    expect(chunks[0]).toMatchObject({
      id: 'doc_1',
      source: 'Sales Brief',
      score: 0.9,
      query: 'sales decline',
    });
    expect(filterChunks(chunks, 'demand', 'all')).toHaveLength(1);
    expect(buildSourceSummaries(chunks)).toEqual([
      expect.objectContaining({ source: 'Sales Brief', chunkCount: 1, maxScore: 0.9 }),
    ]);
  });

  it('derives grouped memory records and supports type/content filtering', () => {
    const messages: Message[] = [
      {
        id: 'message_1',
        role: 'user',
        content: 'sales decline',
        createdAt: 80,
      },
    ];
    const entries = buildMemoryEntries(
      [],
      [
        event('memory_update', {
          memoryType: 'episodic',
          items: [
            {
              id: 'memory_1',
              content: 'sales decline was concentrated in East China',
              importance: 0.8,
            },
          ],
        }),
      ],
      messages,
    );

    expect(entries[0]).toMatchObject({ id: 'memory_1', type: 'episodic', importance: 0.8 });
    expect(filterEntries(entries, 'East China', 'episodic')).toHaveLength(1);
    expect(buildGroupSummaries(entries).find((group) => group.type === 'episodic')).toMatchObject({
      count: 1,
      averageImportance: 0.8,
    });
  });
});
