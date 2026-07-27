import type { ChatMessage, LLMResponse, ToolDefinition } from '../../types';

export interface LLMProvider {
  name: string;
  chat(messages: ChatMessage[], tools?: ToolDefinition[]): Promise<LLMResponse>;
}
