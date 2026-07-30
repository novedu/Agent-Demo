import type { Tool, ToolDefinition } from '@shared-types/agent';

export class ToolRegistry {
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

  getToolDefinitions(): ToolDefinition[] {
    return this.list().map(tool => {
      const properties: ToolDefinition['function']['parameters']['properties'] = {};
      const required: string[] = [];

      for (const [name, field] of Object.entries(tool.argsSchema ?? {})) {
        properties[name] = {
          type: field.type,
          ...(field.description ? { description: field.description } : {}),
        };

        if (field.required) {
          required.push(name);
        }
      }

      return {
        type: 'function',
        risk: tool.risk ?? 'low',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: 'object',
            properties,
            required,
          },
        },
      };
    });
  }

  describe(): string {
    return this.list()
      .map((t) => {
        const argsInfo = t.argsSchema
          ? ' | args: ' + Object.entries(t.argsSchema)
              .map(([k, v]) => `${k}(${v.type}${v.required ? ',required' : ',optional'})`)
              .join(', ')
          : '';
        return `- ${t.name}: ${t.description} | risk: ${t.risk ?? 'low'}${argsInfo}`;
      })
      .join('\n');
  }
}
