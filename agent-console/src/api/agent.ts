import type {
  AgentEvent,
  CitationRecord,
  MemoryRecord,
  Plan,
  StepStatus,
  ToolCallRecord,
} from '../types/agent';

export interface StartAgentTaskOptions {
  taskId: string;
  input: string;
  onEvent: (event: AgentEvent) => void;
  onError?: (error: Error) => void;
}

export interface AgentTaskStream {
  close: () => void;
}

function createEventId(taskId: string, index: number): string {
  return `${taskId}_event_${String(index + 1).padStart(2, '0')}`;
}

function splitAnswer(text: string): string[] {
  const chunks: string[] = [];
  let buffer = '';

  for (const char of text) {
    buffer += char;
    if (buffer.length >= 4 || char === '\n' || char === '，' || char === '。') {
      chunks.push(buffer);
      buffer = '';
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks;
}

export function startAgentTask(options: StartAgentTaskOptions): AgentTaskStream {
  const { taskId, input, onEvent, onError } = options;
  const startedAt = Date.now();
  const timeouts: number[] = [];
  let closed = false;

  const createPlan = (statuses: Record<string, StepStatus>): Plan => ({
    goal: input,
    steps: [
      {
        id: '1',
        tool: 'querySalesData',
        description: '查询销售数据',
        status: statuses['1'],
        args: { region: '华东', period: '2024-Q2' },
      },
      {
        id: '2',
        tool: 'calculateMetrics',
        description: '计算指标',
        status: statuses['2'],
        args: { metric: 'revenue_growth' },
      },
      {
        id: '3',
        tool: 'searchKnowledge',
        description: '检索行业知识',
        status: statuses['3'],
        args: { query: input },
      },
      {
        id: '4',
        tool: 'llm',
        description: '汇总原因并生成报告',
        status: statuses['4'],
      },
    ],
  });

  const planStarted = createPlan({
    '1': 'running',
    '2': 'pending',
    '3': 'pending',
    '4': 'pending',
  });
  const planAfterTool = createPlan({
    '1': 'success',
    '2': 'success',
    '3': 'running',
    '4': 'pending',
  });
  const planAfterRag = createPlan({
    '1': 'success',
    '2': 'success',
    '3': 'success',
    '4': 'running',
  });
  const planFinished = createPlan({
    '1': 'success',
    '2': 'success',
    '3': 'success',
    '4': 'success',
  });

  const salesTool: ToolCallRecord = {
    id: `${taskId}_tool_sales`,
    name: 'querySalesData',
    args: { region: '华东', period: '2024-Q2' },
    status: 'running',
  };

  const salesToolSuccess: ToolCallRecord = {
    ...salesTool,
    status: 'success',
    duration: 148,
    result: {
      region: '华东',
      period: '2024-Q2',
      revenue: 980000,
      previousPeriodRevenue: 1180000,
      growthRate: '-16.9%',
      activeCustomers: 126,
      lostCustomers: 18,
      mainDropCategory: '企业订阅服务',
    },
  };

  const citations: CitationRecord[] = [
    {
      id: 'kb_sales_001',
      source: '行业趋势报告-2024Q2.pdf',
      chunk: 3,
      content:
        '2024Q2 华东企业软件采购节奏整体放缓，预算审批周期平均拉长 18%，新增采购更偏向刚需系统。',
      score: 0.92,
    },
    {
      id: 'kb_sales_002',
      source: '华东区域销售复盘.md',
      chunk: 7,
      content: '渠道侧反馈显示，华东区域重点客户续约推进慢于预期，部分客户将采购决策延后到下季度。',
      score: 0.87,
    },
  ];

  const memories: MemoryRecord[] = [
    {
      id: `${taskId}_working_goal`,
      type: 'working',
      content: '当前任务：分析华东区域销售下降原因，并生成报告。',
      importance: 0.66,
      updatedAt: startedAt + 3000,
    },
    {
      id: 'mem_semantic_vue3',
      type: 'semantic',
      content: '用户主要使用 Vue3 开发，后续项目设计应优先考虑 Vue3 技术背景。',
      importance: 0.9,
      updatedAt: startedAt + 3000,
    },
    {
      id: `${taskId}_episodic_summary`,
      type: 'episodic',
      content:
        '任务摘要：完成华东区域销售下降分析，使用 querySalesData 获取销售数据，结合行业知识检索生成 Markdown 报告。',
      importance: 0.72,
      updatedAt: startedAt + 3000,
    },
  ];

  const finalAnswer = [
    '# 华东区域销售下降分析报告',
    '',
    '## 结论摘要',
    '',
    '华东区域 2024-Q2 销售额为 **98 万**，较上一周期 **118 万** 下降 **16.9%**。下降主要来自企业订阅服务类目，伴随活跃客户减少和重点客户续约延后。',
    '',
    '## 关键发现',
    '',
    '- **销售数据下滑明显**：收入环比下降 20 万，流失客户 18 个。',
    '- **行业需求放缓**：企业软件采购审批周期拉长，新增采购更谨慎。',
    '- **渠道推进变慢**：重点客户采购决策延后到下季度，影响当期转化。',
    '',
    '## 原因判断',
    '',
    '1. 华东企业客户预算审批周期变长。',
    '2. 渠道补货和续约节奏低于预期。',
    '3. 企业订阅服务类目对大客户依赖较高，单点延迟会放大区域波动。',
    '',
    '## 建议动作',
    '',
    '- 优先梳理 TOP 客户续约状态，标记预算冻结和审批延迟客户。',
    '- 对企业订阅服务类目设计短周期促活方案。',
    '- 联合渠道团队建立下季度回补清单，按客户价值排序推进。',
  ].join('\n');

  const events: AgentEvent[] = [
    {
      id: createEventId(taskId, 0),
      type: 'plan_start',
      timestamp: startedAt,
      payload: {
        title: 'Planner started',
        detail: '分析华东区域销售下降原因，并生成报告',
        status: 'running',
        state: { goal: input, completedStepIds: [], status: 'planning' },
      },
    },
    {
      id: createEventId(taskId, 1),
      type: 'plan_update',
      timestamp: startedAt + 500,
      payload: {
        title: 'Plan generated',
        detail: '查询销售数据 → 计算指标 → 检索行业知识 → 生成报告',
        status: 'success',
        plan: planStarted,
        state: { goal: input, currentStepId: '1', completedStepIds: [], status: 'running' },
      },
    },
    {
      id: createEventId(taskId, 2),
      type: 'tool_start',
      timestamp: startedAt + 1000,
      payload: {
        title: 'querySalesData started',
        detail: 'region=华东, period=2024-Q2',
        status: 'running',
        tool: salesTool,
        state: { goal: input, currentStepId: '1', completedStepIds: [], status: 'running' },
      },
    },
    {
      id: createEventId(taskId, 3),
      type: 'tool_success',
      timestamp: startedAt + 1500,
      payload: {
        title: 'querySalesData success',
        detail: '销售额 98 万，环比下降 16.9%',
        status: 'success',
        tool: salesToolSuccess,
        plan: planAfterTool,
        state: { goal: input, currentStepId: '3', completedStepIds: ['1', '2'], status: 'running' },
      },
    },
    {
      id: createEventId(taskId, 4),
      type: 'rag_retrieve',
      timestamp: startedAt + 2000,
      payload: {
        title: 'searchKnowledge retrieved context',
        detail: '检索行业趋势与区域复盘知识，topK=2',
        status: 'success',
        query: input,
        citations,
        plan: planAfterRag,
        state: {
          goal: input,
          currentStepId: '4',
          completedStepIds: ['1', '2', '3'],
          status: 'running',
        },
      },
    },
    {
      id: createEventId(taskId, 5),
      type: 'reflection',
      timestamp: startedAt + 2500,
      payload: {
        title: 'Reflection completed',
        detail: '检查完整性：销售数据、指标、行业知识和建议动作均已覆盖。',
        status: 'success',
        state: {
          goal: input,
          currentStepId: '4',
          completedStepIds: ['1', '2', '3'],
          status: 'running',
        },
      },
    },
    {
      id: createEventId(taskId, 6),
      type: 'memory_update',
      timestamp: startedAt + 3000,
      payload: {
        title: 'Memory updated',
        detail: '保存任务摘要到 episodic memory',
        status: 'success',
        memory: memories,
        state: {
          goal: input,
          currentStepId: '4',
          completedStepIds: ['1', '2', '3'],
          status: 'running',
        },
      },
    },
  ];

  const answerChunks = splitAnswer(finalAnswer);
  const streamedAnswerEvents: AgentEvent[] = answerChunks.map((answerDelta, index) => ({
    id: `${taskId}_answer_delta_${String(index + 1).padStart(2, '0')}`,
    type: 'final_answer',
    timestamp: startedAt + 3500 + index * 70,
    payload: {
      status: 'streaming',
      answerDelta,
    },
  }));

  const doneEvent: AgentEvent = {
    id: createEventId(taskId, 7),
    type: 'final_answer',
    timestamp: startedAt + 3500 + answerChunks.length * 70,
    payload: {
      title: 'Final answer generated',
      status: 'success',
      done: true,
      plan: planFinished,
      state: { goal: input, completedStepIds: ['1', '2', '3', '4'], status: 'success' },
    },
  };

  const scheduledEvents = [...events, ...streamedAnswerEvents, doneEvent];

  scheduledEvents.forEach((event, index) => {
    const delay =
      event.type === 'final_answer' ? Math.max(0, event.timestamp - startedAt) : index * 500;

    const timeoutId = window.setTimeout(() => {
      if (closed) return;

      try {
        onEvent(event);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    }, delay);

    timeouts.push(timeoutId);
  });

  return {
    close: () => {
      closed = true;
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    },
  };
}
