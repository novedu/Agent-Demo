import { Agent } from '../../agent';
import { ConversationManager } from '../../conversation';
import { EventEmitter } from '../../event';
import { ToolExecutor } from '../../executor';
import { MemoryManager } from '../../memory/memory-manager';
import { Planner } from '../../planner';
import { ToolRegistry } from '../../registry';
import { ContextBuilder, KnowledgeBase, Retriever } from '../../src/knowledge';
import { MockLLMProvider, OpenAIProvider, type LLMProvider } from '../../src/llm';
import { registerTools } from '../../tools';
import type { AgentEvent, AgentTrace, LLMResponse, Plan, ToolResult } from '../../types';
import type {
  AgentRuntimePort,
  AgentServerEvent,
  FinalAnswerPayload,
  MemoryUpdatePayload,
  RagRetrievePayload,
  ReflectionPayload,
  RuntimeTaskContext,
  StateUpdatePayload,
} from '../types/api';

export interface AgentRuntimeAdapterConfig {
  llmProvider?: LLMProvider;
}

interface RuntimeBundle {
  agent: Agent;
  eventEmitter: EventEmitter;
  memoryManager: MemoryManager;
}

export class AgentRuntimeAdapter implements AgentRuntimePort {
  constructor(private config: AgentRuntimeAdapterConfig = {}) {}

  async runTask(context: RuntimeTaskContext): Promise<AgentTrace> {
    const eventFactory = createServerEventFactory(context.taskId);
    const bundle = this.createRuntimeBundle((plan) => {
      context.emit(eventFactory('plan_update', {
        plan,
        steps: plan.steps,
      }));
    });
    let finalAnswerStreamed = false;

    context.emit(eventFactory('plan_start', {
      input: context.input,
    }));

    this.bindRuntimeEvents(bundle.eventEmitter, context, eventFactory, {
      markFinalAnswerStreamed: () => {
        finalAnswerStreamed = true;
      },
    });

    const trace = await bundle.agent.run(context.input);

    trace.stateHistory?.forEach((snapshot) => {
      context.emit(eventFactory('state_update', {
        status: snapshot.status === 'completed'
          ? 'completed'
          : snapshot.status === 'failed'
            ? 'failed'
            : 'running',
        currentStep: snapshot.currentStepId,
        completedStepIds: snapshot.completedStepIds,
        progress: calculateProgress(snapshot.completedStepIds.length, snapshot.steps.length),
      } satisfies StateUpdatePayload));
    });

    context.emit(eventFactory('reflection', {
      status: trace.success ? 'passed' : 'failed',
      message: trace.success
        ? '检查完整性通过：计划、工具结果、RAG 证据和最终回答已生成。'
        : trace.error || '任务执行失败，需要人工检查。',
    } satisfies ReflectionPayload));

    const memoryItems = bundle.memoryManager.list();
    if (memoryItems.length > 0) {
      context.emit(eventFactory('memory_update', {
        memoryType: 'episodic',
        items: memoryItems.map((item) => ({
          id: item.id,
          type: item.type,
          content: item.content,
          importance: item.importance,
        })),
      } satisfies MemoryUpdatePayload));
    }

    if (trace.finalAnswer && !finalAnswerStreamed) {
      streamFinalAnswer(trace.finalAnswer, (payload) => {
        context.emit(eventFactory('final_answer', payload));
      });
    }

    context.emit(eventFactory('final_answer', {
      content: trace.finalAnswer,
      done: true,
    } satisfies FinalAnswerPayload));

    return trace;
  }

  private bindRuntimeEvents(
    eventEmitter: EventEmitter,
    context: RuntimeTaskContext,
    eventFactory: ReturnType<typeof createServerEventFactory>,
    options: { markFinalAnswerStreamed: () => void },
  ): void {
    eventEmitter.on('tool_start', (event) => {
      const runtimeEvent = event as Extract<AgentEvent, { type: 'tool_start' }>;
      context.emit(eventFactory('tool_start', {
        toolName: runtimeEvent.toolName,
        args: runtimeEvent.args,
      }));
    });

    eventEmitter.on('tool_success', (event) => {
      const runtimeEvent = event as Extract<AgentEvent, { type: 'tool_success' }>;
      context.emit(eventFactory('tool_success', {
        toolName: runtimeEvent.toolName,
        result: runtimeEvent.result,
      }));

      const ragPayload = toRagRetrievePayload(runtimeEvent.result);
      if (ragPayload) {
        context.emit(eventFactory('rag_retrieve', ragPayload));
      }
    });

    eventEmitter.on('tool_error', (event) => {
      const runtimeEvent = event as Extract<AgentEvent, { type: 'tool_error' }>;
      context.emit(eventFactory('tool_error', {
        toolName: runtimeEvent.toolName,
        error: runtimeEvent.error,
      }));
    });

    eventEmitter.on('llm_response', (event) => {
      const runtimeEvent = event as Extract<AgentEvent, { type: 'llm_response' }>;
      if (!runtimeEvent.response.done || !runtimeEvent.response.content) return;

      options.markFinalAnswerStreamed();
      streamFinalAnswer(runtimeEvent.response.content, (payload) => {
        context.emit(eventFactory('final_answer', payload));
      });
    });
  }

  private createRuntimeBundle(onPlanCreated: (plan: Plan) => void): RuntimeBundle {
    const knowledgeBase = createKnowledgeBase();
    const retriever = new Retriever(knowledgeBase);
    const contextBuilder = new ContextBuilder();

    const registry = new ToolRegistry();
    registerTools(registry, { retriever, contextBuilder });

    const executor = new ToolExecutor(registry);
    const conversationManager = new ConversationManager();
    const eventEmitter = new EventEmitter();
    const memoryManager = new MemoryManager();

    memoryManager.remember({
      type: 'semantic',
      content: '历史经验：华东区域销售分析通常需要同时关注营收、订单量、客单价、渠道补货和重点客户预算变化。',
      importance: 0.85,
      metadata: { source: 'server_seed', domain: 'sales' },
    });

    const llmProvider = this.config.llmProvider ?? createDefaultLLMProvider();
    const planner = new ServerEventPlanner({ llmProvider, toolRegistry: registry }, onPlanCreated);

    const agent = new Agent({
      llmProvider,
      toolRegistry: registry,
      executor,
      conversationManager,
      eventEmitter,
      memoryManager,
      planner,
      systemPrompt: '你是一个企业 AI 助手。需要使用工具时先调用工具，拿到结果后再给用户清晰回答。',
      maxSteps: 20,
    });

    return {
      agent,
      eventEmitter,
      memoryManager,
    };
  }
}

class ServerEventPlanner extends Planner {
  constructor(
    config: ConstructorParameters<typeof Planner>[0],
    private onPlanCreated: (plan: Plan) => void,
  ) {
    super(config);
  }

  override async createPlan(userInput: string): Promise<Plan> {
    const plan = await super.createPlan(userInput);
    this.onPlanCreated(plan);
    return plan;
  }
}

function createKnowledgeBase(): KnowledgeBase {
  const knowledgeBase = new KnowledgeBase();

  knowledgeBase.addDocument({
    id: 'KB001',
    content: '华东地区 Q1 通过组合营销实现营收增长 25%，渠道合伙人计划贡献明显。',
    metadata: { title: 'Q1 销售策略复盘', category: 'Sales', updatedAt: '2024-04-20' },
  });
  knowledgeBase.addDocument({
    id: 'KB002',
    content: '华东区域销售下降常见原因：春节后需求回落、渠道补货节奏放缓、重点客户预算延后，以及竞品在低线城市加大折扣。建议结合订单量、客单价和渠道反馈共同判断。',
    metadata: { title: '华东销售下降原因分析', category: 'Sales', updatedAt: '2024-05-08' },
  });
  knowledgeBase.addDocument({
    id: 'KB003',
    content: '企业软件行业 Q2 采购审批周期延长，预算释放更偏向刚需项目，非核心系统采购容易被延后。',
    metadata: { title: '行业趋势报告-2024Q2', category: 'Industry', updatedAt: '2024-06-12' },
  });

  return knowledgeBase;
}

function createDefaultLLMProvider(): LLMProvider {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    });
  }

  const mockResponses: LLMResponse[] = [
    {
      content: [
        '# 华东区域销售下降分析报告',
        '',
        '## 结论摘要',
        '',
        '华东区域 2024-02 营收为 **¥980000**，较 2024-01 的 **¥1250000** 下降 **21.60%**。',
        '',
        '## 关键原因',
        '',
        '- 春节后需求回落，订单量从 1250 单下降到 980 单。',
        '- 渠道补货节奏放缓，重点客户预算延后。',
        '- 竞品在低线城市加大折扣，影响部分客户转化。',
        '',
        '## 建议动作',
        '',
        '1. 拆分订单量、客单价和渠道来源，定位主要下滑来源。',
        '2. 优先回访重点客户，确认预算延期和竞品替换风险。',
        '3. 对低线城市渠道制定短周期促销和补货计划。',
      ].join('\n'),
      done: true,
    },
  ];

  return new MockLLMProvider({ responses: mockResponses, delayMs: 200 });
}

function createServerEventFactory(taskId: string) {
  let index = 0;

  return <TPayload>(type: AgentServerEvent<TPayload>['type'], payload: TPayload): AgentServerEvent<TPayload> => {
    index += 1;
    return {
      id: `${taskId}_event_${String(index).padStart(4, '0')}`,
      taskId,
      type,
      timestamp: Date.now(),
      payload,
    };
  };
}

function streamFinalAnswer(answer: string, emit: (payload: FinalAnswerPayload) => void): void {
  splitAnswer(answer).forEach((delta) => emit({ delta }));
}

function splitAnswer(answer: string): string[] {
  const chunks: string[] = [];
  let buffer = '';

  for (const char of answer) {
    buffer += char;
    if (buffer.length >= 8 || char === '\n' || char === '。' || char === '，') {
      chunks.push(buffer);
      buffer = '';
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks;
}

function toRagRetrievePayload(result: ToolResult): RagRetrievePayload | undefined {
  if (result.toolName !== 'searchKnowledge' || !result.data || typeof result.data !== 'object') {
    return undefined;
  }

  const data = result.data as {
    query?: unknown;
    documents?: unknown;
    retrievalDuration?: unknown;
  };

  if (typeof data.query !== 'string' || !Array.isArray(data.documents)) {
    return undefined;
  }

  return {
    query: data.query,
    documents: data.documents.map((document) => {
      const item = document as {
        id?: unknown;
        content?: unknown;
        metadata?: unknown;
        score?: unknown;
      };

      return {
        id: typeof item.id === 'string' ? item.id : 'unknown',
        content: typeof item.content === 'string' ? item.content : '',
        metadata: item.metadata && typeof item.metadata === 'object'
          ? item.metadata as Record<string, unknown>
          : undefined,
        score: typeof item.score === 'number' ? item.score : undefined,
      };
    }),
    duration: typeof data.retrievalDuration === 'number' ? data.retrievalDuration : result.duration,
  };
}

function calculateProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}
