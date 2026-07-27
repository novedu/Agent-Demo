import { ToolRegistry } from './registry';
import { ToolExecutor } from './executor';
import { Agent, MockLLM } from './agent';
import { EventEmitter } from './event';
import { ConversationManager } from './conversation';
import { registerTools } from './tools';
import type { AgentEvent, LLMMessage } from './types';
import { ContextBuilder, KnowledgeBase, Retriever } from './src/knowledge';

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

  const retriever = new Retriever(knowledgeBase);
  const contextBuilder = new ContextBuilder();

  const registry = new ToolRegistry();
  registerTools(registry, { retriever, contextBuilder });

  const executor = new ToolExecutor(registry);
  const conversationManager = new ConversationManager();
  const eventEmitter = new EventEmitter();

  eventEmitter.on('llm_start', (event) => {
    const e = event as { conversationId: string };
    console.log(`\n📝 [llm_start] conversation=${e.conversationId.slice(0, 8)}`);
  });

  eventEmitter.on('llm_response', (event) => {
    const e = event as { response: { content: string; toolCall?: { name: string } } };
    const callInfo = e.response.toolCall
      ? ` → 调用工具: ${e.response.toolCall.name}`
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

  eventEmitter.on('agent_finish', (event) => {
    const e = event as { taskId: string; totalSteps: number; duration: number; success: boolean };
    console.log(`\n🏁 [agent_finish] task=${e.taskId.slice(0, 8)} steps=${e.totalSteps} duration=${e.duration}ms success=${e.success}`);
  });

  const mockLLM = new MockLLM({
    responses: [
      {
        content: '我需要先检索公司制度知识库，再基于检索上下文回答。',
        tool_call: { name: 'searchKnowledge', args: { query: '公司的年假政策是什么', limit: 3 } },
      },
      {
        content: '根据知识库，公司年假政策是：员工入职满一年后可享受 5 天带薪年假，满三年后为 10 天，满五年后为 15 天。申请年假需要提前 3 个工作日在系统中提交，并由直属主管审批。',
        done: true,
      },
    ],
  });

  const agent = new Agent({
    llm: mockLLM,
    executor,
    conversationManager,
    eventEmitter,
    maxSteps: 20,
  });

  console.log('📦 已注册工具:');
  console.log(registry.describe());

  const trace = await agent.run('公司的年假政策是什么');

  console.log('\n📊 Agent Trace:');
  console.log(`  taskId: ${trace.taskId}`);
  console.log(`  conversationId: ${trace.conversationId}`);
  console.log(`  totalSteps: ${trace.steps.length}`);
  console.log(`  totalDuration: ${trace.totalDuration}ms`);
  console.log(`  success: ${trace.success}`);

  if (trace.error) {
    console.log(`  error: ${trace.error}`);
  }

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
}

main().catch((err) => {
  console.error('Fatal:', err);
});
