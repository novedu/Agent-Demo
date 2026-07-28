import type { AgentTrace, Plan } from './types';
import { EventEmitter } from './event';
import { ConversationManager } from './conversation';
import { ToolExecutor } from './executor';
import { Planner } from './planner';
import { PlanValidator } from './plan-validator';
import { AgentState } from './state';
import { WorkflowRunner } from './workflow';
import { ToolRegistry } from './registry';
import type { LLMProvider } from './src/llm';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export interface AgentConfig {
  llmProvider: LLMProvider;
  toolRegistry: ToolRegistry;
  executor: ToolExecutor;
  conversationManager: ConversationManager;
  eventEmitter: EventEmitter;
  planner?: Planner;
  planValidator?: PlanValidator;
  systemPrompt?: string;
  maxSteps?: number;
}

export class Agent {
  private conversationManager: ConversationManager;
  private eventEmitter: EventEmitter;
  private planner: Planner;
  private planValidator: PlanValidator;
  private workflow: WorkflowRunner;

  constructor(config: AgentConfig) {
    this.conversationManager = config.conversationManager;
    this.eventEmitter = config.eventEmitter;
    this.planner = config.planner ?? new Planner({
      llmProvider: config.llmProvider,
      toolRegistry: config.toolRegistry,
    });
    this.planValidator = config.planValidator ?? new PlanValidator(config.toolRegistry);
    this.workflow = new WorkflowRunner({
      llmProvider: config.llmProvider,
      executor: config.executor,
      conversationManager: config.conversationManager,
      eventEmitter: config.eventEmitter,
      systemPrompt: config.systemPrompt,
      maxSteps: config.maxSteps,
    });
  }

  async run(userInput: string): Promise<AgentTrace> {
    const taskId = generateId();
    const startTime = Date.now();
    const conversation = this.conversationManager.createConversation(userInput.slice(0, 20));

    const userMessage = this.conversationManager.addMessage(conversation.id, {
      role: 'user',
      content: userInput,
      status: 'success',
    });

    let plan: Plan;
    try {
      plan = await this.planner.createPlan(userInput);
      this.planValidator.assertValid(plan);
    } catch (err) {
      const totalDuration = Date.now() - startTime;
      const error = (err as Error).message;

      this.eventEmitter.emit({
        type: 'agent_finish',
        timestamp: Date.now(),
        conversationId: conversation.id,
        taskId,
        totalSteps: 0,
        duration: totalDuration,
        success: false,
      });

      return {
        taskId,
        conversationId: conversation.id,
        steps: [],
        totalDuration,
        success: false,
        error,
      };
    }

    const state = new AgentState(plan);

    const workflowResult = await this.workflow.run({
      taskId,
      conversationId: conversation.id,
      userMessageId: userMessage.id,
      userInput,
      state,
    });

    const totalDuration = Date.now() - startTime;

    this.eventEmitter.emit({
      type: 'agent_finish',
      timestamp: Date.now(),
      conversationId: conversation.id,
      taskId,
      totalSteps: workflowResult.traceSteps.length,
      duration: totalDuration,
      success: workflowResult.success,
    });

    return {
      taskId,
      conversationId: conversation.id,
      steps: workflowResult.traceSteps,
      plan,
      stateHistory: state.getHistory(),
      workflowTrace: workflowResult.workflowTrace,
      totalDuration,
      success: workflowResult.success,
      error: workflowResult.error,
      finalAnswer: workflowResult.finalAnswer,
    };
  }
}
