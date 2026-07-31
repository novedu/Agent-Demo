import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { AgentIcon, Badge, Button, Card, KnowledgeIcon, MemoryIcon, SparkIcon } from '../ui';

interface ExecutionEmptyStateProps {
  onStart: () => void;
}

const templates = [
  { title: 'Runtime Debug', detail: 'Run a full planning and tool execution trace.' },
  { title: 'RAG QA', detail: 'Inspect retrieved chunks, citations, and final answer grounding.' },
  { title: 'Memory Check', detail: 'Verify working, semantic, and episodic memory updates.' },
];

export function ExecutionEmptyState({ onStart }: ExecutionEmptyStateProps) {
  return (
    <Card className="flex h-full min-h-0 overflow-hidden">
      <motion.div
        className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[minmax(0,1fr)_300px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <section className="flex min-h-0 flex-col justify-between rounded-xl border border-line bg-white p-5">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
              <AgentIcon />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-ink">Agent Studio</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Start a task to observe planning, execution, tool calls, retrieved evidence,
              memory updates, reflection, and evaluation in one runtime debugger.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button onClick={onStart}>Run default task</Button>
            <Badge tone="neutral">Recent Tasks: empty</Badge>
            <Badge tone="success">Runtime ready</Badge>
          </div>
        </section>

        <aside className="grid gap-3">
          <QuickPanel
            icon={<SparkIcon className="h-4 w-4" />}
            title="Quick Start"
            detail="Use a prepared scenario to validate the complete runtime path."
          />
          <QuickPanel
            icon={<KnowledgeIcon className="h-4 w-4" />}
            title="Templates"
            detail={`${templates.length} runtime templates ready for inspection.`}
          />
          <QuickPanel
            icon={<MemoryIcon className="h-4 w-4" />}
            title="Recent Tasks"
            detail="No recent task in this session."
          />
        </aside>
      </motion.div>
    </Card>
  );
}

function QuickPanel({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-accent">{icon}</span>
        {title}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">{detail}</p>
    </div>
  );
}
