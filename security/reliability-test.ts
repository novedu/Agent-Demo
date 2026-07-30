import assert from 'node:assert/strict';
import { ToolExecutor } from '../executor';
import { ToolRegistry } from '../registry';
import { registerTools } from '../tools';

async function runReliabilityCases(): Promise<void> {
  await caseViewerCannotQuerySalesData();
  await caseAnalystCanQuerySalesData();
  await caseHighRiskToolRequiresApproval();

  console.log('Day9-1 reliability guardrail cases passed.');
}

async function caseViewerCannotQuerySalesData(): Promise<void> {
  const executor = createExecutor('viewer');
  const result = await executor.run('querySalesData', {
    region: '华东',
    month: '2024-02',
  });

  assert.equal(result.success, false);
  assert.equal(result.security?.eventType, 'permission_denied');
  assert.match(result.error ?? '', /viewer/);
}

async function caseAnalystCanQuerySalesData(): Promise<void> {
  const executor = createExecutor('analyst');
  const result = await executor.run('querySalesData', {
    region: '华东',
    month: '2024-02',
  });

  assert.equal(result.success, true);
  assert.equal(result.security, undefined);
  assert.match(String(result.data), /华东 2024-02 销售数据/);
}

async function caseHighRiskToolRequiresApproval(): Promise<void> {
  const executor = createExecutor('admin');
  const result = await executor.run('slow_query', {});

  assert.equal(result.success, false);
  assert.equal(result.security?.eventType, 'approval_required');
  assert.equal(result.approvalStatus, 'pending_approval');
  assert.match(result.error ?? '', /approval/i);
}

function createExecutor(role: string): ToolExecutor {
  const registry = new ToolRegistry();
  registerTools(registry);

  return new ToolExecutor(registry, {
    userContext: {
      userId: `${role}_user`,
      role,
    },
  });
}

void runReliabilityCases().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
