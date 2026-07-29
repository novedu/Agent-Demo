import { ToolRegistry } from './registry';
import { ToolExecutor } from './executor';
import { Agent } from './agent';
import { EventEmitter } from './event';
import { ConversationManager } from './conversation';
import { registerTools } from './tools';
import { ContextBuilder, KnowledgeBase, Retriever } from './src/knowledge';
import { MockLLMProvider, OpenAIProvider } from './src/llm';
import { MemoryManager } from './memory/memory-manager';
import type { AgentTrace, LLMResponse } from './types';

declare const process: {
  env: Record<string, string | undefined>;
};

async function main() {
  const knowledgeBase = new KnowledgeBase();
  knowledgeBase.addDocument({
    id: 'HR001',
    content: '公司年假政策：员工入职满一年后可享受 5 天带薪年假，满三年后为 10 天，满五年后为 15 天。年假需提前 3 个工作日在系统中提交申请，并由直属主管审批。',
    metadata: { title: '公司年假政策', category: 'HR', updatedAt: '2024-01-15' },
  });
  knowledgeBase.addDocument({
    id: 'HR002',
    content: '病假政策：员工请病假需上传医院证明或就诊记录。连续病假超过 3 天时，HR 会进行复核。',
    metadata: { title: '病假政策', category: 'HR', updatedAt: '2024-02-01' },
  });
  knowledgeBase.addDocument({
    id: 'FIN001',
    content: '差旅报销政策：员工需在出差结束后 7 个工作日内提交发票和行程单。超期提交需部门负责人补充说明。',
    metadata: { title: '差旅报销政策', category: 'Finance', updatedAt: '2024-03-10' },
  });
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
    metadata: { source: 'seed', domain: 'sales' },
  });

  eventEmitter.on('llm_start', (event) => {
    const e = event as { conversationId: string; provider: string; messages: unknown[]; tools: unknown[] };
    console.log(`\n📝 [llm_start] provider=${e.provider} conversation=${e.conversationId.slice(0, 8)} messages=${e.messages.length} tools=${e.tools.length}`);
  });

  eventEmitter.on('llm_response', (event) => {
    const e = event as { response: { content: string; toolCalls?: Array<{ id: string; name: string }> } };
    const callInfo = e.response.toolCalls && e.response.toolCalls.length > 0
      ? ` → 调用工具: ${e.response.toolCalls.map(toolCall => `${toolCall.name}(${toolCall.id})`).join(', ')}`
      : '';
    console.log(`💬 [llm_response] ${e.response.content}${callInfo}`);
  });

  eventEmitter.on('tool_start', (event) => {
    const e = event as { toolName: string; args: Record<string, unknown> };
    console.log(`🔧 [tool_start] ${e.toolName}`, e.args);
  });

  eventEmitter.on('tool_success', (event) => {
    const e = event as { toolName: string; result: { data?: unknown } };
    const data = e.result.data;
    if (e.toolName === 'searchKnowledge' && data && typeof data === 'object') {
      const ragData = data as { documentCount?: number; retrievalDuration?: number; logs?: string[] };
      console.log(`✅ [tool_success] ${e.toolName}: docs=${ragData.documentCount} retrieval=${ragData.retrievalDuration}ms`);
      ragData.logs?.forEach(log => console.log(`   - ${log}`));
      return;
    }
    console.log(`✅ [tool_success] ${e.toolName}: ${data}`);
  });

  eventEmitter.on('tool_error', (event) => {
    const e = event as { toolName: string; error: { type: string; message: string } };
    console.log(`❌ [tool_error] ${e.toolName}: ${e.error.type} - ${e.error.message}`);
  });

  eventEmitter.on('llm_error', (event) => {
    const e = event as { provider: string; error: { message: string } };
    console.log(`❌ [llm_error] provider=${e.provider}: ${e.error.message}`);
  });

  eventEmitter.on('agent_finish', (event) => {
    const e = event as { taskId: string; totalSteps: number; duration: number; success: boolean };
    console.log(`\n🏁 [agent_finish] task=${e.taskId.slice(0, 8)} steps=${e.totalSteps} duration=${e.duration}ms success=${e.success}`);
  });

  const mockResponses: LLMResponse[] = [
    {
      content: '已记录：你主要使用 Vue3 开发。后续我会优先按 Vue3 技术栈给出方案。',
      done: true,
    },
    {
      content: '可以设计一个基于 Vue3 的 AI 项目：前端使用 Vue3 + TypeScript 构建对话工作台，后端提供 Agent Runtime API，包含 Planner、Memory、RAG 和 Tool Calling，用于企业知识问答和自动报告生成。',
      done: true,
    },
    {
      content: '华东区域 2024-02 营收为 ¥980000，较 2024-01 的 ¥1250000 下降 21.60%。结合知识库，下降可能来自春节后需求回落、渠道补货节奏放缓、重点客户预算延后，以及竞品折扣加剧。建议下一步拆分订单量、客单价和渠道来源，优先回访重点客户并复盘低线城市渠道策略。',
      done: true,
    },
  ];

  const mockLLMProvider = new MockLLMProvider({ responses: mockResponses });

  const realLLMProvider = process.env.OPENAI_API_KEY
    ? new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      })
    : undefined;

  const llmProvider = realLLMProvider ?? mockLLMProvider;

  const agent = new Agent({
    llmProvider,
    toolRegistry: registry,
    executor,
    conversationManager,
    eventEmitter,
    memoryManager,
    systemPrompt: '你是一个企业 AI 助手。需要使用工具时先调用工具，拿到结果后再给用户清晰回答。',
    maxSteps: 20,
  });

  console.log('📦 已注册工具:');
  console.log(registry.describe());
  console.log(`\n🤖 当前 LLM Provider: ${llmProvider.name}`);

  console.log('\n🧪 Case1: 用户背景写入 semantic memory');
  const case1Trace = await agent.run('我主要使用Vue3开发');
  const vueSemanticAfterCase1 = memoryManager
    .list('semantic')
    .filter(memory => memory.content.includes('Vue3'));
  console.log(`  input: 我主要使用Vue3开发`);
  console.log(`  finalAnswer: ${case1Trace.finalAnswer}`);
  console.log(`  semantic memory 保存: ${vueSemanticAfterCase1.length > 0 ? 'PASS' : 'FAIL'}`);
  vueSemanticAfterCase1.forEach(memory => {
    console.log(`  - ${memory.content}`);
  });

  console.log('\n🧪 Case2: MemoryRetriever 找到 Vue3 背景');
  const case2Trace = await agent.run('帮我设计一个AI项目');
  const retrievedVueMemories = memoryManager
    .retrieve({ query: 'AI项目 技术栈 前端', types: ['semantic'], limit: 5 })
    .filter(memory => memory.content.includes('Vue3'));
  console.log(`  input: 帮我设计一个AI项目`);
  console.log(`  finalAnswer: ${case2Trace.finalAnswer}`);
  console.log(`  MemoryRetriever 找到 Vue3 背景: ${retrievedVueMemories.length > 0 ? 'PASS' : 'FAIL'}`);
  retrievedVueMemories.forEach(memory => {
    console.log(`  - score=${memory.score} ${memory.content}`);
  });

  console.log('\n🧪 Case3: 完成 Agent 任务并保存 episodic 摘要');
  const trace: AgentTrace = await agent.run('分析华东区域销售下降原因，并生成报告');
  const case3EpisodicSummaries = memoryManager
    .list('episodic')
    .filter(memory => memory.metadata?.source === 'final_answer' && memory.metadata?.conversationId === trace.conversationId);
  console.log(`  input: 分析华东区域销售下降原因，并生成报告`);
  console.log(`  finalAnswer: ${trace.finalAnswer}`);
  console.log(`  episodic memory 保存任务摘要: ${case3EpisodicSummaries.length > 0 ? 'PASS' : 'FAIL'}`);
  case3EpisodicSummaries.forEach(memory => {
    console.log(`  - ${memory.content.slice(0, 120)}...`);
  });

  console.log('\n🧭 Initial Plan:');
  console.log(`  goal: ${trace.plan?.goal}`);
  trace.plan?.steps.forEach(step => {
    console.log(`  ${step.id}. ${step.description} | tool=${step.tool} args=${JSON.stringify(step.args ?? {})} [${step.status}]`);
  });

  console.log('\n🔁 State 变化过程:');
  trace.stateHistory?.forEach((snapshot, i) => {
    console.log(`  ${i + 1}. status=${snapshot.status} current=${snapshot.currentStepId ?? '-'} completed=${snapshot.completedStepIds.join(',') || '-'}`);
  });

  console.log('\n🧩 Workflow Trace:');
  trace.workflowTrace?.forEach(step => {
    console.log(`  Step ${step.stepId}: ${step.description} [${step.status}] duration=${step.duration}ms traces=${step.traceSteps.length}`);
  });

  console.log('\n📊 Agent Trace:');
  console.log(`  taskId: ${trace.taskId}`);
  console.log(`  conversationId: ${trace.conversationId}`);
  console.log(`  totalSteps: ${trace.steps.length}`);
  console.log(`  totalDuration: ${trace.totalDuration}ms`);
  console.log(`  success: ${trace.success}`);

  if (trace.error) {
    console.log(`  error: ${trace.error}`);
  }

  console.log(`  finalAnswer: ${trace.finalAnswer}`);

  console.log('\n📋 步骤详情:');
  trace.steps.forEach((step, i) => {
    const typeIcon = step.type === 'llm' ? '💬' : '🔧';
    const statusIcon = step.status === 'success' ? '✅' : step.status === 'error' ? '❌' : '⏳';
    let detail = '';
    if (step.type === 'llm') {
      detail = step.llmResponse ? `响应: ${step.llmResponse.slice(0, 30)}...` : '无响应';
    } else {
      detail = step.toolName ? `${step.toolName} ${step.toolResult?.success ? '成功' : '失败'}` : '';
      if (step.rag) {
        detail += ` | query="${step.rag.query}" docs=${step.rag.documentCount} retrieval=${step.rag.retrievalDuration}ms`;
      }
    }
    console.log(`  ${i + 1}. ${typeIcon} ${statusIcon} Step ${step.stepNumber}: ${detail} (${step.duration}ms)`);
  });

  const messages = conversationManager.getMessages(trace.conversationId);
  console.log('\n💬 会话消息:');
  messages.forEach((msg, i) => {
    const roleIcon = msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '🔧';
    const statusIcon = msg.status === 'success' ? '✅' : msg.status === 'error' ? '❌' : '⏳';
    console.log(`  ${i + 1}. ${roleIcon} ${statusIcon} ${msg.role}: ${msg.content.slice(0, 50)}...`);
  });

  console.log('\n🧠 Memory:');
  memoryManager.list().forEach((memory, i) => {
    console.log(`  ${i + 1}. [${memory.type}] importance=${memory.importance} ${memory.content.slice(0, 70)}...`);
  });
}

main().catch((err) => {
  console.error('Fatal:', err);
});
