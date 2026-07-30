import { StatusTag } from '../ui';
import type { ExecutionNodeStatus } from './execution-model';

interface ExecutionStatusProps {
  status: ExecutionNodeStatus;
}

export function ExecutionStatus({ status }: ExecutionStatusProps) {
  return <StatusTag status={status} />;
}
