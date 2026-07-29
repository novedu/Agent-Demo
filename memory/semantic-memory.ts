import type { CreateMemoryInput, MemoryItem, MemoryStore } from './memory-types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export class SemanticMemory implements MemoryStore {
  private items = new Map<string, MemoryItem>();

  add(input: CreateMemoryInput): MemoryItem {
    const now = Date.now();
    const existing = this.findSameContent(input.content);

    if (existing) {
      return this.update(existing.id, {
        importance: Math.max(existing.importance, input.importance ?? existing.importance),
        metadata: { ...existing.metadata, ...input.metadata },
      })!;
    }

    const item: MemoryItem = {
      id: generateId(),
      type: 'semantic',
      content: input.content,
      importance: input.importance ?? 0.8,
      createdAt: now,
      updatedAt: now,
      metadata: input.metadata,
    };
    this.items.set(item.id, item);
    return item;
  }

  update(id: string, updates: Partial<Omit<MemoryItem, 'id' | 'type' | 'createdAt'>>): MemoryItem | undefined {
    const item = this.items.get(id);
    if (!item) return undefined;

    const updated = {
      ...item,
      ...updates,
      updatedAt: Date.now(),
    };
    this.items.set(id, updated);
    return updated;
  }

  list(): MemoryItem[] {
    return Array.from(this.items.values()).sort((a, b) => b.importance - a.importance);
  }

  get(id: string): MemoryItem | undefined {
    return this.items.get(id);
  }

  clear(): void {
    this.items.clear();
  }

  private findSameContent(content: string): MemoryItem | undefined {
    return this.list().find(item => item.content === content);
  }
}

