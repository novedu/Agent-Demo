import type { Message, MessageRole, AgentEvent, LLMMessage, ToolResult, TraceStep, AgentTrace, ToolCall } from './types';
import { EventEmitter } from './event';
import { ConversationManager } from './conversation';
import { ToolExecutor, ToolNotFoundError, ToolTimeoutError, ToolArgumentError } from './executor';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export interface MockLLMConfig {
  responses: LLMMessage[];
}

export class MockLLM {
  private queue: LLMMessage[];
  private index = 0;

  constructor(config: MockLLMConfig) {
    this.queue = config.responses;
  }

  async chat(_history: Message[]): Promise<LLMMessage> {
    await new Promise(resolve => setTimeout(resolve, 200));

    if (this.index >= this.queue.length) {
      return { content: 'No more responses.', done: true };
    }
    return this.queue[this.index++];
  }
}

export interface AgentConfig {
  llm: MockLLM;
  executor: ToolExecutor;
  conversationManager: ConversationManager;
  eventEmitter: EventEmitter;
  maxSteps?: number;
}

export class Agent {
  private llm: MockLLM;
  private executor: ToolExecutor;
  private conversationManager: ConversationManager;
  private eventEmitter: EventEmitter;
  private maxSteps: number;

  constructor(config: AgentConfig) {
    this.llm = config.llm;
    this.executor = config.executor;
    this.conversationManager = config.conversationManager;
    this.eventEmitter = config.eventEmitter;
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

      this.eventEmitter.emit({
        type: 'llm_start',
        timestamp: Date.now(),
        conversationId: conversation.id,
        messageId: userMessage.id,
        input: userInput,
      });

      const stepStartTime = Date.now();
      const traceStep: TraceStep = {
        stepId: generateId(),
        stepNumber: step,
        type: 'llm',
        status: 'running',
        llmInput: userInput,
        duration: 0,
      };

      let llmResponse: LLMMessage;
      try {
        llmResponse = await this.llm.chat(messages);
        traceStep.llmResponse = llmResponse.content;
        traceStep.status = 'success';
      } catch (err) {
        traceStep.status = 'error';
        traceStep.error = (err as Error).message;
        success = false;
        error = (err as Error).message;
        break;
      }

      this.eventEmitter.emit({
        type: 'llm_response',
        timestamp: Date.now(),
        conversationId: conversation.id,
        messageId: userMessage.id,
        response: {
          content: llmResponse.content,
          toolCall: llmResponse.tool_call,
          done: !!llmResponse.done,
        },
      });

      if (llmResponse.done) {
        this.conversationManager.addMessage(conversation.id, {
          role: 'assistant',
          content: llmResponse.content,
          status: 'success',
        });
        traceStep.duration = Date.now() - stepStartTime;
        traceSteps.push(traceStep);
        break;
      }

      if (llmResponse.tool_call) {
        const { name: toolName, args } = llmResponse.tool_call;

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
            role: 'assistant',
            content: llmResponse.content,
            status: 'success',
            toolCall: { name: toolName, args },
          });

          this.conversationManager.addMessage(conversation.id, {
            role: 'tool',
            content: typeof toolResult.data === 'string' ? toolResult.data : JSON.stringify(toolResult.data),
            status: 'success',
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
            role: 'assistant',
            content: llmResponse.content,
            status: 'success',
            toolCall: { name: toolName, args },
          });

          this.conversationManager.addMessage(conversation.id, {
            role: 'tool',
            content: toolResult.error!,
            status: 'error',
            toolResult,
          });
        }

        traceSteps.push(toolTraceStep);
        traceStep.duration = Date.now() - stepStartTime;
        traceSteps.push(traceStep);
        continue;
      }

      this.conversationManager.addMessage(conversation.id, {
        role: 'assistant',
        content: llmResponse.content,
        status: 'success',
      });

      traceStep.duration = Date.now() - stepStartTime;
      traceSteps.push(traceStep);
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
}
