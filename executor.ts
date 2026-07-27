import type { ToolArgs, ArgsSchema, ToolResult } from './types';
import { ToolRegistry } from './registry';

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

export class ToolExecutor {
  constructor(private registry: ToolRegistry) {}

  async run(name: string, args: ToolArgs, timeoutMs = 2000): Promise<ToolResult> {
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