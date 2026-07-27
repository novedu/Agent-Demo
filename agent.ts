import type { ChatMessage, LLMResponse, Message, ToolCall, ToolResult, TraceStep, AgentTrace } from './types';
import { EventEmitter } from './event';
import { ConversationManager } from './conversation';
import { ToolExecutor } from './executor';
import type { LLMProvider } from './src/llm';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateToolCallId(): string {
  return `call_${generateId()}`;
}

export interface AgentConfig {
  llmProvider: LLMProvider;
  executor: ToolExecutor;
  conversationManager: ConversationManager;
  eventEmitter: EventEmitter;
  systemPrompt?: string;
  maxSteps?: number;
}

export class Agent {
  private llmProvider: LLMProvider;
  private executor: ToolExecutor;
  private conversationManager: ConversationManager;
  private eventEmitter: EventEmitter;
  private systemPrompt?: string;
  private maxSteps: number;

  constructor(config: AgentConfig) {
    this.llmProvider = config.llmProvider;
    this.executor = config.executor;
    this.conversationManager = config.conversationManager;
    this.eventEmitter = config.eventEmitter;
    this.systemPrompt = config.systemPrompt;
    this.maxSteps = config.maxSteps || 10;
  }

  async run(userInput: string): Promise<AgentTrace> {
    const taskId = generateId();
    const conversation = this.conversationManager.createConversation();
    const startTime = Date.now();
    const traceSteps: TraceStep[] = [];
    let success = true;
    let error: string | undefined;

    const userMessage = this.conversationManager.addMessage(conversation.id, {
      role: 'user',
      content: userInput,
      status: 'success',
    });

    for (let step = 1; step <= this.maxSteps; step++) {
      const messages = this.conversationManager.getMessages(conversation.id);
      const llmMessages = this.buildLLMMessages(messages);
      const toolDefinitions = this.executor.getToolDefinitions();

      this.eventEmitter.emit({
        type: 'llm_start',
        timestamp: Date.now(),
        conversationId: conversation.id,
        messageId: userMessage.id,
        input: userInput,
        provider: this.llmProvider.name,
        messages: llmMessages,
        tools: toolDefinitions,
      });

      const stepStartTime = Date.now();
      const traceStep: TraceStep = {
        stepId: generateId(),
        stepNumber: step,
        type: 'llm',
        status: 'running',
        llmInput: userInput,
        llmMessages,
        duration: 0,
      };

      let llmResponse: LLMResponse;
      try {
        llmResponse = await this.llmProvider.chat(llmMessages, toolDefinitions);
        traceStep.llmResponse = llmResponse.content;
        traceStep.status = 'success';
      } catch (err) {
        traceStep.status = 'error';
        traceStep.error = (err as Error).message;
        traceStep.duration = Date.now() - stepStartTime;
        traceSteps.push(traceStep);
        success = false;
        error = (err as Error).message;

        this.eventEmitter.emit({
          type: 'llm_error',
          timestamp: Date.now(),
          conversationId: conversation.id,
          messageId: userMessage.id,
          provider: this.llmProvider.name,
          error: {
            message: error,
          },
        });
        break;
      }

      this.eventEmitter.emit({
        type: 'llm_response',
        timestamp: Date.now(),
        conversationId: conversation.id,
        messageId: userMessage.id,
        response: {
          content: llmResponse.content,
          toolCalls: llmResponse.toolCalls,
          done: !!llmResponse.done,
        },
      });

      const toolCalls = this.normalizeToolCalls(llmResponse.toolCalls);

      if (toolCalls.length === 0) {
        this.conversationManager.addMessage(conversation.id, {
          role: 'assistant',
          content: llmResponse.content,
          status: 'success',
        });
        traceStep.duration = Date.now() - stepStartTime;
        traceSteps.push(traceStep);
        break;
      }

      this.conversationManager.addMessage(conversation.id, {
        role: 'assistant',
        content: llmResponse.content,
        status: 'success',
        toolCalls,
      });

      for (const toolCall of toolCalls) {
        const { id: toolCallId, name: toolName, args } = toolCall;

        this.eventEmitter.emit({
          type: 'tool_start',
          timestamp: Date.now(),
          conversationId: conversation.id,
          messageId: userMessage.id,
          toolName,
          args,
        });

        const toolTraceStep: TraceStep = {
          stepId: generateId(),
          stepNumber: step,
          type: 'tool',
          status: 'running',
          toolName,
          toolArgs: args,
          duration: 0,
        };

        const toolResult = await this.executor.run(toolName, args);
        toolTraceStep.toolResult = toolResult;
        toolTraceStep.duration = toolResult.duration;
        toolTraceStep.rag = this.extractRagTrace(toolResult);

        if (toolResult.success) {
          this.eventEmitter.emit({
            type: 'tool_success',
            timestamp: Date.now(),
            conversationId: conversation.id,
            messageId: userMessage.id,
            toolName,
            result: toolResult,
          });

          toolTraceStep.status = 'success';

          this.conversationManager.addMessage(conversation.id, {
            role: 'tool',
            content: typeof toolResult.data === 'string' ? toolResult.data : JSON.stringify(toolResult.data),
            status: 'success',
            toolCallId,
            toolResult,
          });

        } else {
          this.eventEmitter.emit({
            type: 'tool_error',
            timestamp: Date.now(),
            conversationId: conversation.id,
            messageId: userMessage.id,
            toolName,
            error: {
              type: this.getErrorType(toolResult.error!),
              message: toolResult.error!,
            },
          });

          toolTraceStep.status = 'error';
          toolTraceStep.error = toolResult.error;

          this.conversationManager.addMessage(conversation.id, {
            role: 'tool',
            content: toolResult.error!,
            status: 'error',
            toolCallId,
            toolResult,
          });
        }

        traceSteps.push(toolTraceStep);
      }

      traceStep.duration = Date.now() - stepStartTime;
      traceSteps.push(traceStep);
      continue;
    }

    const totalDuration = Date.now() - startTime;

    this.eventEmitter.emit({
      type: 'agent_finish',
      timestamp: Date.now(),
      conversationId: conversation.id,
      taskId,
      totalSteps: traceSteps.length,
      duration: totalDuration,
      success,
    });

    return {
      taskId,
      conversationId: conversation.id,
      steps: traceSteps,
      totalDuration,
      success,
      error,
    };
  }

  private getErrorType(errorMessage: string): 'not_found' | 'timeout' | 'argument' | 'execution' {
    if (errorMessage.includes('Not Found')) return 'not_found';
    if (errorMessage.includes('Timeout')) return 'timeout';
    if (errorMessage.includes('Argument')) return 'argument';
    return 'execution';
  }

  private extractRagTrace(toolResult: ToolResult) {
    if (toolResult.toolName !== 'searchKnowledge') return undefined;
    if (!toolResult.data || typeof toolResult.data !== 'object') return undefined;

    const data = toolResult.data as {
      query?: unknown;
      retrievalDuration?: unknown;
      documentCount?: unknown;
    };

    if (typeof data.query !== 'string') return undefined;

    return {
      query: data.query,
      retrievalDuration: typeof data.retrievalDuration === 'number' ? data.retrievalDuration : 0,
      documentCount: typeof data.documentCount === 'number' ? data.documentCount : 0,
    };
  }

  private normalizeToolCalls(toolCalls?: ToolCall[]): ToolCall[] {
    return (toolCalls ?? []).map(toolCall => ({
      ...toolCall,
      id: toolCall.id || generateToolCallId(),
    }));
  }

  private buildLLMMessages(messages: Message[]): ChatMessage[] {
    const chatMessages = messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      toolCalls: message.toolCalls,
      toolCallId: message.toolCallId,
      createdAt: message.createdAt,
    }));

    if (!this.systemPrompt) {
      return chatMessages;
    }

    return [
      { id: 'system', role: 'system', content: this.systemPrompt, createdAt: Date.now() },
      ...chatMessages,
    ];
  }
}
