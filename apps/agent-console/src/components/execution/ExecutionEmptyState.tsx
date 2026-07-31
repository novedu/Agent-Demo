import { motion } from 'framer-motion';
import { Button, Card } from '../ui';

interface ExecutionEmptyStateProps {
  onStart: () => void;
}

export function ExecutionEmptyState({ onStart }: ExecutionEmptyStateProps) {
  return (
    <Card className="flex h-full min-h-0 items-center justify-center overflow-hidden p-4 lg:p-6">
      <motion.div
        className="max-w-sm text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <svg
          className="mx-auto h-16 w-16 text-slate-200 lg:h-20 lg:w-20"
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden="true"
        >
          <rect x="18" y="22" width="84" height="64" rx="8" stroke="currentColor" strokeWidth="4" />
          <path d="M36 46H84" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M36 62H66" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <circle cx="40" cy="96" r="5" fill="currentColor" />
          <circle cx="60" cy="96" r="5" fill="currentColor" />
          <circle cx="80" cy="96" r="5" fill="currentColor" />
        </svg>
        <h2 className="mt-3 text-base font-semibold text-ink lg:text-lg">Agent Welcome</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Start a new task.</p>
        <Button className="mt-4" onClick={onStart}>
          Run Default Task
        </Button>
      </motion.div>
    </Card>
  );
}
