import { Badge } from './Badge';

interface StatusTagProps {
  status: string;
}

export function StatusTag({ status }: StatusTagProps) {
  return <Badge tone={getTone(status)}>{status}</Badge>;
}

function getTone(status: string): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (status === 'running' || status === 'queued' || status === 'planning') return 'warning';
  if (status === 'success' || status === 'completed') return 'success';
  if (status === 'error' || status === 'failed' || status === 'cancelled') return 'danger';
  if (status === 'streaming') return 'info';
  return 'neutral';
}
