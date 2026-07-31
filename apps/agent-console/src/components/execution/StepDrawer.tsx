import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../ui';
import { StepDetail } from './StepDetail';
import type { ExecutionNodeRecord } from './execution-model';

interface StepDrawerProps {
  node?: ExecutionNodeRecord;
  onClose: () => void;
}

export function StepDrawer({ node, onClose }: StepDrawerProps) {
  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-slate-950/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed bottom-0 right-0 top-0 z-40 flex w-[min(680px,46vw)] max-w-[calc(100vw-24px)] flex-col overflow-hidden border-l border-line bg-panel shadow-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <header className="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-5">
              <div>
                <h2 className="text-base font-semibold leading-5 text-ink">{node.component}</h2>
                <p className="text-xs text-muted">Overview, input, output, reasoning, trace and raw JSON.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
              <StepDetail node={node} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
