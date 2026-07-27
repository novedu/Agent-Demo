import { ToolRegistry } from './registry';
import { ToolExecutor } from './executor';
import { Agent, MockLLM } from './agent';
import { EventEmitter } from './event';
import { ConversationManager } from './conversation';
import { registerTools } from './tools';
import type { AgentEvent, LLMMessage } from './types';

async function main() {
  const registry = new ToolRegistry();
  registerTools(registry);

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
    console.log(`✅ [tool_success] ${e.toolName}: ${e.result.data}`);
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
        content: '好的，我先查一下华东 2024-01 的销售数据',
        tool_call: { name: 'querySalesData', args: { region: '华东', month: '2024-01' } },
      },
      {
        content: '让我先在知识库中检索"华东"相关文档',
        tool_call: { name: 'searchKnowledge', args: { keyword: '华东', limit: 2 } },
      },
      {
        content: '基于知识库的提示，再查一下华南 2024-01 的销售数据',
        tool_call: { name: 'querySalesData', args: { region: '华南', month: '2024-01' } },
      },
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
      {
        content: '试试调用一个不存在的工具',
        tool_call: { name: 'non_existent_tool', args: {} },
      },
      {
        content: '测试参数校验：querySalesData 不传 month',
        tool_call: { name: 'querySalesData', args: { region: '华东' } },
      },
      {
        content: '测试参数校验：calculateMetrics 的 current 传字符串',
        tool_call: {
          name: 'calculateMetrics',
          args: { current: '一百', previous: 100, metric: 'growth' },
        },
      },
      {
        content: '查一个不支持的区域的销售数据',
        tool_call: { name: 'querySalesData', args: { region: '东北', month: '2024-01' } },
      },
      {
        content: '调用一个会超时的工具',
        tool_call: { name: 'slow_query', args: {} },
      },
      {
        content: '查一下北京天气',
        tool_call: { name: 'getWeather', args: { city: '北京' } },
      },
      {
        content: '所有场景演示完毕，任务完成！',
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

  const trace = await agent.run('请帮我演示一下 Agent 的各种工具调用场景');

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