import { motion } from 'framer-motion';
import { Badge, Card } from '../ui';
import { classNames } from '../ui/classNames';
import { ExecutionStatus } from './ExecutionStatus';
import {
  getKindLabel,
  getNodeIcon,
  getStatusTone,
  type ExecutionNodeRecord,
} from './execution-model';

interface ExecutionNodeProps {
  node: ExecutionNodeRecord;
  active?: boolean;
  onSelect: (node: ExecutionNodeRecord) => void;
}

export function ExecutionNode({ node, active, onSelect }: ExecutionNodeProps) {
  const isRunning = node.status === 'running';
  const tone = getNodeTone(node.status);

  return (
    <motion.button
      type="button"
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={() => onSelect(node)}
      className="w-full cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-accent/20"
    >
      <Card
        className={classNames(
          'relative min-h-[118px] p-3 transition-colors duration-200',
          tone.border,
          tone.bg,
          active
            ? 'shadow-[0_0_0_2px_rgba(29,78,216,0.18),0_18px_42px_rgba(29,78,216,0.2)] ring-2 ring-accent/20'
            : 'hover:border-lineStrong hover:bg-panel',
        )}
      >
        {isRunning && (
          <motion.span
            className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-500"
            animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.35, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <div className="flex items-start justify-between gap-3">
          <Badge tone={getStatusTone(node.status)} className="h-8 w-8 justify-center px-0 font-mono">
            {getNodeIcon(node.kind)}
          </Badge>
          <ExecutionStatus status={node.status} />
        </div>
        <div className="mt-3">
          <div className="truncate text-sm font-semibold text-ink">{node.component}</div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{node.summary}</p>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
          <span>{getKindLabel(node.kind)}</span>
          <span>{formatDuration(node.duration)}</span>
        </div>
      </Card>
    </motion.button>
  );
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return 'pending';
  return `${duration}ms`;
}

function getNodeTone(status: ExecutionNodeRecord['status']): {
  bg: string;
  border: string;
  badge: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
} {
  if (status === 'success') {
    return { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'success' };
  }
  if (status === 'running') {
    return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'info' };
  }
  if (status === 'failed') {
    return { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'danger' };
  }
  if (status === 'cancelled') {
    return { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'warning' };
  }
  return { bg: 'bg-white', border: 'border-line', badge: 'neutral' };
}
