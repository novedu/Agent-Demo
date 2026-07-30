import type { ToolPermission, UserContext } from '@shared-types/security';

const defaultPermissions: ToolPermission[] = [
  { tool: 'calculator', roles: ['viewer', 'analyst', 'admin'] },
  { tool: 'getWeather', roles: ['viewer', 'analyst', 'admin'] },
  { tool: 'searchKnowledge', roles: ['viewer', 'analyst', 'admin'] },
  { tool: 'calculateMetrics', roles: ['analyst', 'admin'] },
  { tool: 'querySalesData', roles: ['analyst', 'admin'] },
  { tool: 'slow_query', roles: ['admin'] },
];

export class PermissionManager {
  private permissions = new Map<string, ToolPermission>();

  constructor(permissions: ToolPermission[] = defaultPermissions) {
    permissions.forEach((permission) => this.setPermission(permission));
  }

  setPermission(permission: ToolPermission): void {
    this.permissions.set(permission.tool, permission);
  }

  canExecute(toolName: string, userContext: UserContext): boolean {
    const permission = this.permissions.get(toolName);
    if (!permission) return false;
    return permission.roles.includes(userContext.role);
  }

  hasPermission(toolName: string): boolean {
    return this.permissions.has(toolName);
  }

  getAllowedRoles(toolName: string): string[] {
    return this.permissions.get(toolName)?.roles ?? [];
  }
}
