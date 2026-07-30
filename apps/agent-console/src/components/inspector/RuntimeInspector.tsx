import { motion } from 'framer-motion';
import { Accordion, Badge, Card } from '../ui';
import { ContextExplorer } from './ContextExplorer';
import { EvaluationDashboard } from './EvaluationDashboard';
import { ExecutionInspector } from './ExecutionInspector';
import { KnowledgeExplorer } from './KnowledgeExplorer';
import { MemoryExplorer } from './MemoryExplorer';
import { RuntimeLogs } from './RuntimeLogs';
import { TraceExplorer } from './TraceExplorer';
import type { RuntimeInspectorProps } from './inspector-types';

export function RuntimeInspector({
  currentNode,
  nodes,
  events,
  plan,
  state,
  memory,
  citations,
  evaluation,
  tools,
  status,
  isLoading,
}: RuntimeInspectorProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-4 py-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Runtime Console
          </div>
          <h2 className="mt-1 truncate text-sm font-semibold text-ink">Inspector</h2>
        </div>
        <Badge tone={status === 'error' ? 'danger' : status === 'running' ? 'info' : 'neutral'}>
          {status}
        </Badge>
      </header>
      <motion.div
        className="min-h-0 flex-1 overflow-y-auto p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
      >
        <Accordion
          defaultOpenId="execution"
          items={[
            {
              id: 'execution',
              title: 'Execution',
              meta: <Badge tone="info">{currentNode?.component ?? 'Idle'}</Badge>,
              children: (
                <ExecutionInspector
                  currentNode={currentNode}
                  nodes={nodes}
                  events={events}
                  status={status}
                  isLoading={isLoading}
                />
              ),
            },
            {
              id: 'context',
              title: 'Context',
              meta: <Badge>{plan ? `${plan.steps.length} steps` : 'Empty'}</Badge>,
              children: <ContextExplorer plan={plan} state={state} isLoading={isLoading} />,
            },
            {
              id: 'memory',
              title: 'Memory',
              meta: <Badge>{memory.length}</Badge>,
              children: <MemoryExplorer memories={memory} isLoading={isLoading} />,
            },
            {
              id: 'knowledge',
              title: 'Knowledge',
              meta: <Badge>{citations.length} chunks</Badge>,
              children: <KnowledgeExplorer citations={citations} isLoading={isLoading} />,
            },
            {
              id: 'evaluation',
              title: 'Evaluation',
              meta: <Badge tone={evaluation ? 'success' : 'neutral'}>{evaluation ? 'Ready' : 'Pending'}</Badge>,
              children: <EvaluationDashboard evaluation={evaluation} isLoading={isLoading} />,
            },
            {
              id: 'trace',
              title: 'Trace',
              meta: <Badge>{events.length} spans</Badge>,
              children: <TraceExplorer events={events} isLoading={isLoading} />,
            },
            {
              id: 'logs',
              title: 'Logs',
              meta: <Badge>{events.length} events</Badge>,
              children: <RuntimeLogs events={events} isLoading={isLoading} />,
            },
          ]}
        />
      </motion.div>
      <footer className="shrink-0 border-t border-line bg-white px-4 py-2 text-[10px] text-muted">
        {tools.length} tool calls · {events.length} runtime events
      </footer>
    </Card>
  );
}
