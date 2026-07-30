import type { ChatMessage, LLMResponse, ToolCall, ToolDefinition } from '../../types';
import type { LLMProvider } from './provider';

interface OpenAIProviderConfig {
  apiKey: string;
  baseURL?: string;
  model: string;
  temperature?: number;
}

interface OpenAIToolCall {
  id?: string;
  type?: 'function';
  function?: {
    name?: string;
    arguments?: string;
  };
}

interface OpenAIRequestMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: OpenAIToolCall[];
  tool_call_id?: string;
}

interface OpenAIChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: OpenAIToolCall[];
    };
  }>;
}

export class OpenAIProvider implements LLMProvider {
  name = 'openai-compatible';
  private apiKey: string;
  private baseURL: string;
  private model: string;
  private temperature?: number;

  constructor(config: OpenAIProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = (config.baseURL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
    this.model = config.model;
    this.temperature = config.temperature;
  }

  async chat(messages: ChatMessage[], tools: ToolDefinition[] = []): Promise<LLMResponse> {
    const requestMessages = this.normalizeMessages(messages);

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: requestMessages,
        ...(tools.length > 0 ? { tools: tools.map(toOpenAIToolDefinition), tool_choice: 'auto' } : {}),
        ...(this.temperature !== undefined ? { temperature: this.temperature } : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Compatible API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as OpenAIChatCompletionResponse;
    const message = data.choices?.[0]?.message;
    if (!message) {
      throw new Error('OpenAI Compatible API Error: response.choices[0].message is empty');
    }

    const toolCalls = (message.tool_calls ?? []).map(toolCall => this.parseToolCall(toolCall));

    return {
      content: message.content ?? '',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      done: toolCalls.length === 0,
      raw: data,
    };
  }

  private parseToolCall(toolCall: OpenAIToolCall): ToolCall {
    const fn = toolCall.function;
    if (!toolCall.id || !fn?.name) {
      throw new Error('OpenAI tool call is missing id or function.name');
    }

    try {
      return {
        id: toolCall.id,
        name: fn.name,
        args: fn.arguments ? JSON.parse(fn.arguments) as Record<string, unknown> : {},
      };
    } catch (err) {
      throw new Error(`OpenAI tool arguments parse failed for "${fn.name}": ${(err as Error).message}`);
    }
  }

  private normalizeMessages(messages: ChatMessage[]): OpenAIRequestMessage[] {
    return messages.map((message) => {
      if (message.role === 'tool') {
        return {
          role: 'tool',
          content: message.content,
          tool_call_id: message.toolCallId || message.id,
        };
      }

      if (message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0) {
        return {
          role: 'assistant',
          content: message.content || null,
          tool_calls: message.toolCalls.map(toolCall => ({
            id: toolCall.id,
            type: 'function',
            function: {
              name: toolCall.name,
              arguments: JSON.stringify(toolCall.args),
            },
          })),
        };
      }

      return {
        role: message.role,
        content: message.content,
      };
    });
  }
}

function toOpenAIToolDefinition(tool: ToolDefinition): Omit<ToolDefinition, 'risk'> {
  return {
    type: tool.type,
    function: tool.function,
  };
}
