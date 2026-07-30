import { motion } from 'framer-motion';
import { Badge, Card } from '../ui';
import { classNames } from '../ui/classNames';
import { ExecutionStatus } from './ExecutionStatus';
import { getNodeIcon, type ExecutionNodeRecord } from './execution-model';

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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      onClick={() => onSelect(node)}
      className="w-full cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-accent/20"
    >
      <Card
        className={classNames(
          'relative min-h-[132px] p-3 transition-colors duration-200',
          active ? 'border-accent bg-blue-50' : 'hover:border-lineStrong hover:bg-panel',
        )}
      >
        {isRunning && (
          <motion.span
            className="absolute right-3 top-3 h-2 w-2 rounded-full bg-amber-500"
            animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.35, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <div className="flex items-start justify-between gap-3">
          <Badge tone={active ? 'info' : 'neutral'} className="h-8 w-8 justify-center px-0">
            {getNodeIcon(node.kind)}
          </Badge>
          <ExecutionStatus status={node.status} />
        </div>
        <div className="mt-3">
          <div className="truncate text-sm font-semibold text-ink">{node.component}</div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{node.summary}</p>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
          <span>{node.kind}</span>
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
