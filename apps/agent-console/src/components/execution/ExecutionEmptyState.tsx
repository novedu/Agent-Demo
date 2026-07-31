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
        className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <section className="flex min-h-0 flex-col justify-between rounded-xl border border-line bg-white p-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
                <AgentIcon />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-ink">Agent Studio</h2>
                <p className="truncate text-xs text-muted">Agent Idle · Runtime ready</p>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-5 text-muted">
              Start a task to observe planning, execution, evidence, memory, reflection, and evaluation in one runtime debugger.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={onStart}>
              Run default task
            </Button>
            <Badge tone="neutral">Recent Tasks: empty</Badge>
            <Badge tone="success">Quick Start</Badge>
          </div>
        </section>

        <aside className="grid min-h-0 gap-2">
          <QuickPanel
            icon={<SparkIcon className="h-4 w-4" />}
            title="Quick Start"
            detail="Use a prepared scenario to validate the complete runtime path."
          />
          <div className="grid min-h-0 gap-2 sm:grid-cols-2">
            <QuickPanel
              icon={<KnowledgeIcon className="h-4 w-4" />}
              title="Templates"
              detail={`${templates.length} ready`}
            />
            <QuickPanel
              icon={<MemoryIcon className="h-4 w-4" />}
              title="Recent Tasks"
              detail="No recent task"
            />
          </div>
        </aside>
      </motion.div>
    </Card>
  );
}

function QuickPanel({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-accent">{icon}</span>
        {title}
      </div>
      <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
    </div>
  );
}
