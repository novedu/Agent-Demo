// TypeScript Minimal Agent Demo
// 包含：Tool 类型 / Tool Registry / Tool Executor / Mock LLM Response / Agent Loop / Tool Not Found / Tool Timeout

// ============================================================
// 1. Tool 类型定义
// ============================================================
type ToolArgs = Record<string, unknown>;

// 工具参数 schema：声明每个字段的类型和是否必填
interface FieldSchema {
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description?: string;
}

type ArgsSchema = Record<string, FieldSchema>;

interface Tool {
  name: string;
  description: string;
  // 参数 schema：用于参数校验
  argsSchema?: ArgsSchema;
  // 工具执行函数：接收参数，返回字符串结果
  execute: (args: ToolArgs) => Promise<string>;
}

// LLM 返回的消息结构
interface LLMMessage {
  content: string;
  // 工具调用请求（可选）
  tool_call?: {
    name: string;
    args: ToolArgs;
  };
  // 是否标记任务完成
  done?: boolean;
}

// ============================================================
// 2. Tool Registry - 工具注册中心
// ============================================================
class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  // 生成工具描述，供 LLM 了解可用工具
  describe(): string {
    return this.list()
      .map((t) => {
        const argsInfo = t.argsSchema
          ? ' | args: ' + Object.entries(t.argsSchema)
              .map(([k, v]) => `${k}(${v.type}${v.required ? ',required' : ',optional'})`)
              .join(', ')
          : '';
        return `- ${t.name}: ${t.description}${argsInfo}`;
      })
      .join('\n');
  }
}

// ============================================================
// 3. Tool Executor - 工具执行器（带超时控制 + 参数校验 + 状态日志）
// ============================================================
class ToolExecutor {
  constructor(private registry: ToolRegistry) {}

  async run(name: string, args: ToolArgs, timeoutMs = 2000): Promise<string> {
    const startedAt = Date.now();
    console.log(`  [Executor] 启动工具 "${name}"`);

    // 处理 Tool Not Found
    const tool = this.registry.get(name);
    if (!tool) {
      console.log(`  [Executor] ❌ Tool Not Found: ${name}`);
      throw new ToolNotFoundError(name);
    }

    // 参数校验
    this.validateArgs(name, args, tool.argsSchema);
    console.log(`  [Executor] ✅ 参数校验通过`);

    // 处理 Tool Timeout：用 Promise.race 实现超时
    console.log(`  [Executor] ⏳ 开始执行，超时阈值 ${timeoutMs}ms`);
    const execPromise = tool.execute(args);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new ToolTimeoutError(name, timeoutMs));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([execPromise, timeoutPromise]);
      const duration = Date.now() - startedAt;
      console.log(`  [Executor] 🎉 执行完成，耗时 ${duration}ms`);
      return result;
    } catch (err) {
      const duration = Date.now() - startedAt;
      console.log(`  [Executor] 💥 执行失败，耗时 ${duration}ms，错误: ${(err as Error).message}`);
      throw err;
    }
  }

  // 参数校验：检查必填字段 + 类型
  private validateArgs(toolName: string, args: ToolArgs, schema?: ArgsSchema): void {
    if (!schema) return;  // 没声明 schema 就跳过

    const missingFields: string[] = [];
    const typeErrors: string[] = [];

    for (const [field, rule] of Object.entries(schema)) {
      const value = args[field];

      // 检查必填
      if (rule.required && (value === undefined || value === null)) {
        missingFields.push(field);
        continue;
      }

      // 字段存在时检查类型
      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rule.type) {
          typeErrors.push(`${field} 期望 ${rule.type}，实际 ${actualType}`);
        }
      }
    }

    if (missingFields.length > 0) {
      throw new ToolArgumentError(toolName, missingFields);
    }

    if (typeErrors.length > 0) {
      throw new ToolArgumentError(toolName, typeErrors);
    }
  }
}

// ============================================================
// 自定义错误类型
// ============================================================
class ToolNotFoundError extends Error {
  constructor(toolName: string) {
    super(`Tool Not Found: "${toolName}" is not registered`);
    this.name = 'ToolNotFoundError';
  }
}

class ToolTimeoutError extends Error {
  constructor(toolName: string, timeoutMs: number) {
    super(`Tool Timeout: "${toolName}" exceeded ${timeoutMs}ms`);
    this.name = 'ToolTimeoutError';
  }
}

class ToolArgumentError extends Error {
  constructor(toolName: string, missingFields: string[]) {
    super(`Tool Argument Error: "${toolName}" missing required fields: ${missingFields.join(', ')}`);
    this.name = 'ToolArgumentError';
  }
}

// ============================================================
// 4. Mock LLM Response - 模拟大模型返回
// ============================================================
// 按顺序返回预设的消息序列，模拟多轮对话
class MockLLM {
  private queue: LLMMessage[];
  private index = 0;

  constructor(responses: LLMMessage[]) {
    this.queue = responses;
  }

  async chat(_history: string): Promise<LLMMessage> {
    // 模拟网络延迟
    await delay(200);

    if (this.index >= this.queue.length) {
      // 默认返回完成消息
      return { content: 'No more responses.', done: true };
    }
    return this.queue[this.index++];
  }
}

// ============================================================
// 5. Agent Loop - 智能体主循环
// ============================================================
class Agent {
  private llm: MockLLM;
  private executor: ToolExecutor;
  private maxSteps: number;
  private history: string[] = [];

  constructor(llm: MockLLM, executor: ToolExecutor, maxSteps = 10) {
    this.llm = llm;
    this.executor = executor;
    this.maxSteps = maxSteps;
  }

  async run(userInput: string): Promise<void> {
    console.log('\n========================================');
    console.log('🤖 Agent 启动');
    console.log('========================================');
    console.log(`👤 用户: ${userInput}\n`);

    this.history.push(`User: ${userInput}`);

    for (let step = 1; step <= this.maxSteps; step++) {
      console.log(`\n--- Step ${step} ---`);

      // 1. 获取 LLM 响应
      const message = await this.llm.chat(this.history.join('\n'));
      console.log(`💬 LLM: ${message.content}`);

      // 2. 检查是否完成
      if (message.done) {
        console.log('\n✅ Agent 任务完成');
        this.printHistory();
        return;
      }

      // 3. 如果有工具调用，执行工具
      if (message.tool_call) {
        const { name, args } = message.tool_call;
        console.log(`🔧 调用工具: ${name}`, args);

        try {
          const result = await this.executor.run(name, args);
          console.log(`📤 工具结果: ${result}`);
          this.history.push(`Tool ${name} result: ${result}`);
        } catch (err) {
          if (err instanceof ToolNotFoundError) {
            console.log(`⚠️  ${err.message}`);
            this.history.push(`Error: ${err.message}`);
          } else if (err instanceof ToolTimeoutError) {
            console.log(`⏰ ${err.message}`);
            this.history.push(`Error: ${err.message}`);
          } else if (err instanceof ToolArgumentError) {
            console.log(`📌 ${err.message}`);
            this.history.push(`Error: ${err.message}`);
          } else {
            console.log(`❌ 未知错误: ${(err as Error).message}`);
            this.history.push(`Error: ${(err as Error).message}`);
          }
        }
        continue;
      }

      // 4. 无工具调用且未完成，直接继续
      this.history.push(`LLM: ${message.content}`);
    }

    console.log(`\n⛔ Agent 达到最大步数 ${this.maxSteps}，停止运行`);
    this.printHistory();
  }

  printHistory(): void {
    console.log('\n========== history 内容 ==========');
    console.log(`共 ${this.history.length} 项：`);
    this.history.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item}`);
    });
    console.log('===================================');
  }
}

// ============================================================
// 辅助函数
// ============================================================
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// 6. Demo：注册工具 & 运行 Agent
// ============================================================
async function main() {
  // 创建工具注册中心
  const registry = new ToolRegistry();

  // 注册几个工具
  registry.register({
    name: 'calculator',
    description: '执行简单数学计算，支持 add/sub/mul/div',
    async execute(args) {
      const { op, a, b } = args as { op: string; a: number; b: number };
      let result: number;
      switch (op) {
        case 'add': result = a + b; break;
        case 'sub': result = a - b; break;
        case 'mul': result = a * b; break;
        case 'div': result = b === 0 ? NaN : a / b; break;
        default: throw new Error(`Unknown op: ${op}`);
      }
      await delay(50);
      return `${a} ${op} ${b} = ${result}`;
    },
  });

  registry.register({
    name: 'getWeather',
    description: '查询指定城市的天气情况，需传入 city 字段（支持：北京/上海/广州/深圳）',
    async execute(args) {
      const { city } = args as { city: string };

      // 模拟天气数据库
      const weatherDB: Record<string, { condition: string; temp: number; humidity: number }> = {
        北京: { condition: '晴', temp: 28, humidity: 45 },
        上海: { condition: '多云', temp: 30, humidity: 70 },
        广州: { condition: '雷阵雨', temp: 32, humidity: 85 },
        深圳: { condition: '小雨', temp: 29, humidity: 80 },
      };

      // 模拟网络请求延迟
      await delay(100);

      const data = weatherDB[city];
      if (!data) {
        throw new Error(`暂不支持查询 "${city}" 的天气，当前仅支持：${Object.keys(weatherDB).join('、')}`);
      }

      return `${city}：${data.condition}，气温 ${data.temp}°C，湿度 ${data.humidity}%`;
    },
  });

  // 故意设计一个会超时的工具
  registry.register({
    name: 'slow_query',
    description: '模拟一个慢查询（会触发超时）',
    async execute(_args) {
      await delay(3000); // 3 秒
      return 'slow result';
    },
  });

  // ================== 新增工具 1：querySalesData ==================
  registry.register({
    name: 'querySalesData',
    description: '查询指定区域和月份的销售数据',
    argsSchema: {
      region: { type: 'string', required: true, description: '销售区域（华东/华北/华南/西部）' },
      month: { type: 'string', required: true, description: '月份，格式 YYYY-MM' },
    },
    async execute(args) {
      const { region, month } = args as { region: string; month: string };

      // 模拟销售数据库
      const salesDB: Record<string, Record<string, { revenue: number; orders: number; avgPrice: number }>> = {
        华东: {
          '2024-01': { revenue: 1250000, orders: 1250, avgPrice: 1000 },
          '2024-02': { revenue: 980000, orders: 980, avgPrice: 1000 },
        },
        华北: {
          '2024-01': { revenue: 880000, orders: 880, avgPrice: 1000 },
          '2024-02': { revenue: 1100000, orders: 1100, avgPrice: 1000 },
        },
        华南: {
          '2024-01': { revenue: 1500000, orders: 1500, avgPrice: 1000 },
        },
      };

      await delay(150);  // 模拟查询延迟

      const regionData = salesDB[region];
      if (!regionData) {
        throw new Error(`不支持的区域 "${region}"，当前仅支持：${Object.keys(salesDB).join('、')}`);
      }

      const monthData = regionData[month];
      if (!monthData) {
        throw new Error(`区域 "${region}" 暂无 ${month} 的销售数据`);
      }

      return `${region} ${month} 销售数据：营收 ¥${monthData.revenue}，订单 ${monthData.orders} 单，客单价 ¥${monthData.avgPrice}`;
    },
  });

  // ================== 新增工具 2：searchKnowledge ==================
  registry.register({
    name: 'searchKnowledge',
    description: '在知识库中检索相关文档',
    argsSchema: {
      keyword: { type: 'string', required: true, description: '搜索关键词' },
      limit: { type: 'number', required: false, description: '返回结果数量，默认 3' },
    },
    async execute(args) {
      const { keyword, limit = 3 } = args as { keyword: string; limit?: number };

      // 模拟知识库
      const knowledgeBase = [
        { id: 'KB001', title: 'Q1 销售策略复盘', content: '华东地区 Q1 通过组合营销实现营收增长 25%...' },
        { id: 'KB002', title: '华南大客户案例', content: '深圳某零售连锁客单价提升至 ¥1500...' },
        { id: 'KB003', title: '库存优化指南', content: '通过 ABC 分类法降低库存周转天数 30%...' },
        { id: 'KB004', title: '华东渠道拓展经验', content: '下沉市场开拓：三四线城市渠道合伙人模式...' },
        { id: 'KB005', title: '2024 春节营销报告', content: '春节期间华南地区订单量同比 +40%...' },
      ];

      await delay(120);

      const results = knowledgeBase
        .filter(doc => doc.title.includes(keyword) || doc.content.includes(keyword))
        .slice(0, limit);

      if (results.length === 0) {
        throw new Error(`知识库中未找到关键词 "${keyword}" 的相关文档`);
      }

      return results
        .map((r, i) => `${i + 1}. [${r.id}] ${r.title}\n   摘要：${r.content.slice(0, 30)}...`)
        .join('\n');
    },
  });

  // ================== 新增工具 3：calculateMetrics ==================
  registry.register({
    name: 'calculateMetrics',
    description: '根据销售数据计算指标（同比、环比、占比等）',
    argsSchema: {
      current: { type: 'number', required: true, description: '当前值' },
      previous: { type: 'number', required: true, description: '对比值' },
      metric: { type: 'string', required: true, description: '指标类型：growth（增长率）/ share（占比）' },
    },
    async execute(args) {
      const { current, previous, metric } = args as { current: number; previous: number; metric: string };

      await delay(80);

      switch (metric) {
        case 'growth':
          if (previous === 0) throw new Error('计算增长率时 previous 不能为 0');
          const growthRate = ((current - previous) / previous) * 100;
          return `增长率：${current} vs ${previous} = ${growthRate > 0 ? '+' : ''}${growthRate.toFixed(2)}%`;

        case 'share':
          if (current + previous === 0) throw new Error('current + previous 不能为 0');
          const share = (current / (current + previous)) * 100;
          return `占比：${current} / (${current}+${previous}) = ${share.toFixed(2)}%`;

        default:
          throw new Error(`不支持的指标类型 "${metric}"，当前支持：growth、share`);
      }
    },
  });

  console.log('📦 已注册工具:');
  console.log(registry.describe());

  // 创建执行器
  const executor = new ToolExecutor(registry);

  // 创建 Mock LLM：按顺序触发各种场景
  const mockLLM = new MockLLM([
    // ========== 场景 1：单工具调用 ==========
    {
      content: '好的，我先查一下华东 2024-01 的销售数据',
      tool_call: { name: 'querySalesData', args: { region: '华东', month: '2024-01' } },
    },

    // ========== 场景 2：工具串联调用（查知识库 → 再查销售数据）==========
    {
      content: '让我先在知识库中检索"华东"相关文档',
      tool_call: { name: 'searchKnowledge', args: { keyword: '华东', limit: 2 } },
    },
    {
      content: '基于知识库的提示，再查一下华南 2024-01 的销售数据',
      tool_call: { name: 'querySalesData', args: { region: '华南', month: '2024-01' } },
    },

    // ========== 场景 3：三步串联（查销售 → 查知识库 → 算指标）==========
    {
      content: '我要对比华东 1 月和 2 月的营收增长率，先查 1 月数据',
      tool_call: { name: 'querySalesData', args: { region: '华东', month: '2024-01' } },
    },
    {
      content: '1 月数据拿到了，再查 2 月的',
      tool_call: { name: 'querySalesData', args: { region: '华东', month: '2024-02' } },
    },
    {
      content: '两个月数据都拿到了，计算增长率',
      tool_call: {
        name: 'calculateMetrics',
        args: { current: 980000, previous: 1250000, metric: 'growth' },
      },
    },

    // ========== 场景 4：错误场景 - 工具不存在 ==========
    {
      content: '试试调用一个不存在的工具',
      tool_call: { name: 'non_existent_tool', args: {} },
    },

    // ========== 场景 5：错误场景 - 参数缺失 ==========
    {
      content: '测试参数校验：querySalesData 不传 month',
      tool_call: { name: 'querySalesData', args: { region: '华东' } },
    },

    // ========== 场景 6：错误场景 - 参数类型错误 ==========
    {
      content: '测试参数校验：calculateMetrics 的 current 传字符串',
      tool_call: {
        name: 'calculateMetrics',
        args: { current: '一百', previous: 100, metric: 'growth' },
      },
    },

    // ========== 场景 7：错误场景 - 业务错误（区域不支持）==========
    {
      content: '查一个不支持的区域的销售数据',
      tool_call: { name: 'querySalesData', args: { region: '东北', month: '2024-01' } },
    },

    // ========== 场景 8：错误场景 - 超时 ==========
    {
      content: '调用一个会超时的工具',
      tool_call: { name: 'slow_query', args: {} },
    },

    // ========== 场景 9：正常 getWeather 工具 ==========
    {
      content: '查一下北京天气',
      tool_call: { name: 'getWeather', args: { city: '北京' } },
    },

    // ========== 结束 ==========
    {
      content: '所有场景演示完毕，任务完成！',
      done: true,
    },
  ]);

  // 启动 Agent
  const agent = new Agent(mockLLM, executor, 20);
  await agent.run('请帮我演示一下 Agent 的各种工具调用场景');
}

// 入口
main().catch((err) => {
  console.error('Fatal:', err);
});
