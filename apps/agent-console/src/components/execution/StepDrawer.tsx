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
            className="fixed bottom-0 right-0 top-0 z-40 w-[480px] max-w-[calc(100vw-24px)] overflow-y-auto border-l border-line bg-panel p-4 shadow-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">{node.component}</h2>
                <p className="text-xs text-muted">Execution node detail drawer</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
            <StepDetail node={node} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
