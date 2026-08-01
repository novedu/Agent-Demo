import { motion } from 'framer-motion';
import { Badge } from '../ui';
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

  return (
    <motion.button
      type="button"
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={() => onSelect(node)}
      className="w-full cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-accent/20"
    >
      <div
        className={classNames(
          'relative min-h-[88px] rounded-lg border bg-white p-2.5 transition-colors duration-200',
          active
            ? 'border-blue-300 bg-blue-50 shadow-[0_0_0_2px_rgba(29,78,216,0.12)]'
            : 'border-line hover:border-lineStrong hover:bg-slate-50/60',
        )}
      >
        {isRunning && (
          <motion.span
            className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-blue-500"
            animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.35, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <div className="flex items-start justify-between gap-2">
          <Badge tone={getStatusTone(node.status)} className="h-7 w-7 justify-center px-0 font-mono text-[10px]">
            {getNodeIcon(node.kind)}
          </Badge>
          <ExecutionStatus status={node.status} />
        </div>
        <div className="mt-1.5">
          <div className="truncate text-xs font-semibold text-ink">{node.component}</div>
          <div className="mt-0.5 truncate text-[10px] text-muted">{getKindLabel(node.kind)}</div>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted">
          <span>{formatDuration(node.duration)}</span>
          <span>{node.status === 'waiting' ? 'Pending' : ''}</span>
        </div>
      </div>
    </motion.button>
  );
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return 'pending';
  return duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;
}