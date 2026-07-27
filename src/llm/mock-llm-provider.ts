import type { ChatMessage, LLMResponse, ToolDefinition } from '../../types';
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

    if (this.index >= this.queue.length) {
      return { content: 'No more responses.', done: true };
    }

    return this.queue[this.index++];
  }
}
