import type { ArgsSchema, Plan, PlanStep } from './types';
import { ToolRegistry } from './registry';

export interface PlanValidationResult {
  valid: boolean;
  errors: string[];
}

export class PlanValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Plan validation failed: ${errors.join('; ')}`);
    this.name = 'PlanValidationError';
  }
}

export class PlanValidator {
  constructor(private toolRegistry: ToolRegistry) {}

  validate(plan: Plan): PlanValidationResult {
    const errors: string[] = [];

    if (!plan.goal || typeof plan.goal !== 'string') {
      errors.push('goal must be a non-empty string');
    }

    if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
      errors.push('steps must be a non-empty array');
      return { valid: false, errors };
    }

    plan.steps.forEach((step, index) => {
      errors.push(...this.validateStep(step, index));
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  assertValid(plan: Plan): void {
    const result = this.validate(plan);
    if (!result.valid) {
      throw new PlanValidationError(result.errors);
    }
  }

  private validateStep(step: PlanStep, index: number): string[] {
    const errors: string[] = [];
    const path = `steps[${index}]`;

    if (!step.id || typeof step.id !== 'string') {
      errors.push(`${path}.id must be a non-empty string`);
    }

    if (!step.description || typeof step.description !== 'string') {
      errors.push(`${path}.description must be a non-empty string`);
    }

    if (!step.tool || typeof step.tool !== 'string') {
      errors.push(`${path}.tool must be a non-empty string`);
      return errors;
    }

    if (step.tool === 'llm') {
      return errors;
    }

    const tool = this.toolRegistry.get(step.tool);
    if (!tool) {
      errors.push(`${path}.tool "${step.tool}" is not registered`);
      return errors;
    }

    errors.push(...this.validateArgs(path, step.args ?? {}, tool.argsSchema));

    return errors;
  }

  private validateArgs(path: string, args: Record<string, unknown>, schema?: ArgsSchema): string[] {
    const errors: string[] = [];
    if (!schema) return errors;

    for (const [field, rule] of Object.entries(schema)) {
      const value = args[field];

      if (rule.required && (value === undefined || value === null)) {
        errors.push(`${path}.args.${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rule.type) {
          errors.push(`${path}.args.${field} expected ${rule.type}, got ${actualType}`);
        }
      }
    }

    return errors;
  }
}

