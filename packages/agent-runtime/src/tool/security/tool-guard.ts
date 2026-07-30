import { PermissionManager } from './permission-manager';
import type {
  ToolSecurityCheckInput,
  ToolSecurityDecision,
} from '@shared-types/security';
import { RiskChecker } from './risk-checker';

export interface ToolGuardConfig {
  permissionManager?: PermissionManager;
  riskChecker?: RiskChecker;
}

export class ToolGuard {
  private permissionManager: PermissionManager;
  private riskChecker: RiskChecker;

  constructor(config: ToolGuardConfig = {}) {
    this.permissionManager = config.permissionManager ?? new PermissionManager();
    this.riskChecker = config.riskChecker ?? new RiskChecker();
  }

  check(input: ToolSecurityCheckInput): ToolSecurityDecision {
    if (!this.permissionManager.hasPermission(input.toolName)) {
      return {
        allowed: false,
        eventType: 'tool_blocked',
        reason: `Tool "${input.toolName}" is not allowed by security policy`,
        risk: input.risk,
      };
    }

    if (!this.permissionManager.canExecute(input.toolName, input.userContext)) {
      return {
        allowed: false,
        eventType: 'permission_denied',
        reason: `Role "${input.userContext.role}" cannot execute tool "${input.toolName}"`,
        risk: input.risk,
      };
    }

    const riskDecision = this.riskChecker.check(input.risk, input.approvalStatus);
    if (!riskDecision.allowed) {
      return riskDecision;
    }

    return {
      allowed: true,
      risk: input.risk,
    };
  }
}
