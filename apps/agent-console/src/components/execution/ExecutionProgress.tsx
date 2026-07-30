import { motion } from 'framer-motion';

interface ExecutionProgressProps {
  value: number;
}

export function ExecutionProgress({ value }: ExecutionProgressProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>Execution Progress</span>
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
    </div>
  );
}
