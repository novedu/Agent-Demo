import { motion } from 'framer-motion';

interface ExecutionProgressProps {
  value: number;
  currentStep?: string;
}

export function ExecutionProgress({ value, currentStep }: ExecutionProgressProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted">
        <span className="font-medium text-ink">Execution Progress</span>
        <span className="font-mono text-ink">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-2 truncate text-xs text-muted">
        Current: <span className="font-medium text-ink">{currentStep ?? 'Waiting'}</span>
      </div>
    </div>
  );
}
