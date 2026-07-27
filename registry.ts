import type { Tool, ArgsSchema } from './types';

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