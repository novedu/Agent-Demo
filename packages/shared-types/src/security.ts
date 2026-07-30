export type ToolRiskLevel = 'low' | 'medium' | 'high';

export type ApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export interface UserContext {
  userId: string;
  role: string;
}

export interface ToolPermission {
  tool: string;
  roles: string[];
}

export type ToolSecurityEventType =
  | 'permission_denied'
  | 'tool_blocked'
  | 'approval_required';

export interface ToolSecurityDecision {
  allowed: boolean;
  eventType?: ToolSecurityEventType;
  reason?: string;
  approvalStatus?: ApprovalStatus;
  risk?: ToolRiskLevel;
}

export interface ToolSecurityCheckInput {
  toolName: string;
  risk: ToolRiskLevel;
  userContext: UserContext;
  approvalStatus?: ApprovalStatus;
}

export const defaultUserContext: UserContext = {
  userId: 'anonymous',
  role: 'analyst',
};
