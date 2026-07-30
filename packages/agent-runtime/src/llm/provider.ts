import type { ChatMessage, LLMResponse, ToolDefinition } from '@shared-types/agent';

export interface LLMProvider {
  name: string;
  chat(messages: ChatMessage[], tools?: ToolDefinition[]): Promise<LLMResponse>;
}
