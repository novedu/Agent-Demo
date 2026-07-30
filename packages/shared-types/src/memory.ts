export type MemoryType = 'working' | 'episodic' | 'semantic';

export interface MemoryItem {
  id: string;
  type: MemoryType;
  content: string;
  importance: number;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

export interface CreateMemoryInput {
  type: MemoryType;
  content: string;
  importance?: number;
  metadata?: Record<string, unknown>;
}

export interface MemoryQuery {
  query: string;
  types?: MemoryType[];
  limit?: number;
  minImportance?: number;
}

export interface RetrievedMemory extends MemoryItem {
  score: number;
  matchedKeywords: string[];
}

export interface MemoryStore {
  add(input: CreateMemoryInput): MemoryItem;
  update(id: string, updates: Partial<Omit<MemoryItem, 'id' | 'type' | 'createdAt'>>): MemoryItem | undefined;
  list(): MemoryItem[];
  get(id: string): MemoryItem | undefined;
  clear(): void;
}

