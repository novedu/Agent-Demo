import type { ToolArgs, ArgsSchema, ToolResult, ToolDefinition } from '@shared-types/agent';
import { ToolRegistry } from './registry';
import { defaultUserContext, type ApprovalStatus, type UserContext } from '@shared-types/security';
import { ToolGuard } from './security/tool-guard';

export class ToolNotFoundError extends Error {
  constructor(toolName: string) {
    super(`Tool Not Found: "${toolName}" is not registered`);
    this.name = 'ToolNotFoundError';
  }
}

export class ToolTimeoutError extends Error {
  constructor(toolName: string, timeoutMs: number) {
    super(`Tool Timeout: "${toolName}" exceeded ${timeoutMs}ms`);
    this.name = 'ToolTimeoutError';
  }
}

export class ToolArgumentError extends Error {
  constructor(toolName: string, missingFields: string[]) {
    super(`Tool Argument Error: "${toolName}" missing required fields: ${missingFields.join(', ')}`);
    this.name = 'ToolArgumentError';
  }
}

export interface ToolExecutorConfig {
  toolGuard?: ToolGuard;
  userContext?: UserContext;
}

export interface ToolRunOptions {
  timeoutMs?: number;
  userContext?: UserContext;
  approvalStatus?: ApprovalStatus;
}

export class ToolExecutor {
  private toolGuard: ToolGuard;
  private userContext: UserContext;

  constructor(private registry: ToolRegistry, config: ToolExecutorConfig = {}) {
    this.toolGuard = config.toolGuard ?? new ToolGuard();
    this.userContext = config.userContext ?? defaultUserContext;
  }

  getToolDefinitions(): ToolDefinition[] {
    return this.registry.getToolDefinitions();
  }

  async run(name: string, args: ToolArgs, optionsOrTimeout: ToolRunOptions | number = 2000): Promise<ToolResult> {
    const options = normalizeRunOptions(optionsOrTimeout);
    const timeoutMs = options.timeoutMs ?? 2000;
    const userContext = options.userContext ?? this.userContext;
    const startedAt = Date.now();

    const tool = this.registry.get(name);
    if (!tool) {
      return {
        success: false,
        toolName: name,
        error: `Tool Not Found: "${name}" is not registered`,
        duration: Date.now() - startedAt,
      };
    }

    const securityDecision = this.toolGuard.check({
      toolName: name,
      risk: tool.risk ?? 'low',
      userContext,
      approvalStatus: options.approvalStatus,
    });

    if (!securityDecision.allowed) {
      return {
        success: false,
        toolName: name,
        error: securityDecision.reason ?? `Tool "${name}" was blocked by guardrails`,
        duration: Date.now() - startedAt,
        approvalStatus: securityDecision.approvalStatus,
        security: {
          eventType: securityDecision.eventType ?? 'tool_blocked',
          reason: securityDecision.reason ?? `Tool "${name}" was blocked by guardrails`,
          risk: securityDecision.risk ?? tool.risk ?? 'low',
          userContext,
        },
      };
    }

    try {
      this.validateArgs(name, args, tool.argsSchema);

      const execPromise = tool.execute(args);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new ToolTimeoutError(name, timeoutMs));
        }, timeoutMs);
      });

      const result = await Promise.race([execPromise, timeoutPromise]);
      result.duration = Date.now() - startedAt;
      return result;

    } catch (err) {
      const duration = Date.now() - startedAt;
      if (err instanceof ToolTimeoutError) {
        return {
          success: false,
          toolName: name,
          error: err.message,
          duration,
        };
      } else if (err instanceof ToolArgumentError) {
        return {
          success: false,
          toolName: name,
          error: err.message,
          duration,
        };
      } else {
        return {
          success: false,
          toolName: name,
          error: (err as Error).message,
          duration,
        };
      }
    }
  }

  private validateArgs(toolName: string, args: ToolArgs, schema?: ArgsSchema): void {
    if (!schema) return;

    const missingFields: string[] = [];
    const typeErrors: string[] = [];

    for (const [field, rule] of Object.entries(schema)) {
      const value = args[field];

      if (rule.required && (value === undefined || value === null)) {
        missingFields.push(field);
        continue;
      }

      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rule.type) {
          typeErrors.push(`${field} expected ${rule.type}, got ${actualType}`);
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

function normalizeRunOptions(optionsOrTimeout: ToolRunOptions | number): ToolRunOptions {
  return typeof optionsOrTimeout === 'number'
    ? { timeoutMs: optionsOrTimeout }
    : optionsOrTimeout;
}
