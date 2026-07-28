import type { AgentStateSnapshot, AgentStateStatus, Plan, PlanStepStatus, ToolResult } from './types';

export class AgentState {
  private goal: string;
  private steps: AgentStateSnapshot['steps'];
  private currentStepId?: string;
  private completedStepIds: string[] = [];
  private status: AgentStateStatus = 'idle';
  private toolResults: Record<string, ToolResult> = {};
  private error?: string;
  private history: AgentStateSnapshot[] = [];

  constructor(plan: Plan) {
    this.goal = plan.goal;
    this.steps = plan.steps.map(step => ({ ...step }));
    this.status = 'planning';
    this.capture();
  }

  getGoal(): string {
    return this.goal;
  }

  getSteps(): AgentStateSnapshot['steps'] {
    return this.steps.map(step => ({ ...step }));
  }

  getCurrentStepId(): string | undefined {
    return this.currentStepId;
  }

  getHistory(): AgentStateSnapshot[] {
    return this.history.map(snapshot => ({
      ...snapshot,
      completedStepIds: [...snapshot.completedStepIds],
      toolResults: { ...snapshot.toolResults },
      steps: snapshot.steps.map(step => ({ ...step })),
    }));
  }

  snapshot(): AgentStateSnapshot {
    return {
      goal: this.goal,
      currentStepId: this.currentStepId,
      completedStepIds: [...this.completedStepIds],
      status: this.status,
      toolResults: { ...this.toolResults },
      error: this.error,
      steps: this.getSteps(),
    };
  }

  updateStep(stepId: string, status: PlanStepStatus): void {
    const step = this.steps.find(item => item.id === stepId);
    if (!step) {
      throw new Error(`Plan step not found: ${stepId}`);
    }

    step.status = status;
    this.currentStepId = stepId;
    this.status = status === 'failed' ? 'failed' : 'running';

    if (status === 'completed' && !this.completedStepIds.includes(stepId)) {
      this.completedStepIds.push(stepId);
    }

    this.capture();
  }

  addToolResult(toolName: string, result: ToolResult): void {
    this.toolResults[toolName] = result;
    this.capture();
  }

  markCompleted(): void {
    this.status = 'completed';
    this.currentStepId = undefined;
    this.capture();
  }

  markFailed(error: string): void {
    this.status = 'failed';
    this.error = error;
    this.capture();
  }

  private capture(): void {
    this.history.push(this.snapshot());
  }
}

