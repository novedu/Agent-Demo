import type {
  ApprovalStatus,
  ToolRiskLevel,
  ToolSecurityDecision,
} from '@shared-types/security';

export class RiskChecker {
  check(risk: ToolRiskLevel, approvalStatus?: ApprovalStatus): ToolSecurityDecision {
    if (risk !== 'high') {
      return { allowed: true, risk };
    }

    if (approvalStatus === 'approved') {
      return { allowed: true, risk, approvalStatus };
    }

    return {
      allowed: false,
      eventType: 'approval_required',
      reason: 'High risk tool requires approval before execution',
      approvalStatus: 'pending_approval',
      risk,
    };
  }
}
