import type { CreateMemoryInput, MemoryItem, MemoryQuery, MemoryType, RetrievedMemory } from '@shared-types/memory';
import { EpisodicMemory } from './episodic-memory';
import { MemoryRetriever } from './memory-retriever';
import { MemorySummary } from './memory-summary';
import { MemoryUpdater } from './memory-updater';
import { SemanticMemory } from './semantic-memory';
import { WorkingMemory } from './working-memory';
import type { ToolResult } from '@shared-types/agent';

export interface MemoryManagerConfig {
  workingMemory?: WorkingMemory;
  episodicMemory?: EpisodicMemory;
  semanticMemory?: SemanticMemory;
  retriever?: MemoryRetriever;
  updater?: MemoryUpdater;
  summary?: MemorySummary;
}

export class MemoryManager {
  private workingMemory: WorkingMemory;
  private episodicMemory: EpisodicMemory;
  private semanticMemory: SemanticMemory;
  private retriever: MemoryRetriever;
  private updater: MemoryUpdater;
  private summary: MemorySummary;

  constructor(config: MemoryManagerConfig = {}) {
    this.workingMemory = config.workingMemory ?? new WorkingMemory();
    this.episodicMemory = config.episodicMemory ?? new EpisodicMemory();
    this.semanticMemory = config.semanticMemory ?? new SemanticMemory();
    this.retriever = config.retriever ?? new MemoryRetriever();
    this.updater = config.updater ?? new MemoryUpdater();
    this.summary = config.summary ?? new MemorySummary();
  }

  remember(input: CreateMemoryInput): MemoryItem {
    return this.getStore(input.type).add(input);
  }

  rememberMany(inputs: CreateMemoryInput[]): MemoryItem[] {
    return inputs.map(input => this.remember(input));
  }

  retrieve(query: MemoryQuery): RetrievedMemory[] {
    return this.retriever.retrieve(this.listAll(), query);
  }

  buildContext(query: string, limit = 5): string {
    const memories = this.retrieve({ query, limit, minImportance: 0.4 });
    return this.summary.buildContext(memories);
  }

  recordUserInput(userInput: string, metadata?: Record<string, unknown>): MemoryItem[] {
    this.workingMemory.clear();
    return this.rememberMany(this.updater.fromUserInput(userInput, metadata));
  }

  recordToolResult(toolName: string, result: ToolResult, metadata?: Record<string, unknown>): MemoryItem[] {
    return this.rememberMany(this.updater.fromToolResult(toolName, result, metadata));
  }

  recordFinalAnswer(answer: string, metadata?: Record<string, unknown>): MemoryItem[] {
    return this.rememberMany(this.updater.fromFinalAnswer(answer, metadata));
  }

  list(type?: MemoryType): MemoryItem[] {
    if (type) {
      return this.getStore(type).list();
    }

    return this.listAll();
  }

  clearWorkingMemory(): void {
    this.workingMemory.clear();
  }

  private listAll(): MemoryItem[] {
    return [
      ...this.workingMemory.list(),
      ...this.episodicMemory.list(),
      ...this.semanticMemory.list(),
    ];
  }

  private getStore(type: MemoryType) {
    switch (type) {
      case 'working':
        return this.workingMemory;
      case 'episodic':
        return this.episodicMemory;
      case 'semantic':
        return this.semanticMemory;
    }
  }
}

