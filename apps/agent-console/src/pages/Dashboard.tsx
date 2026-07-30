import { Link } from 'react-router-dom';
import { Button, Card, Panel, StatusTag } from '@console/components/ui';
import { useAgentStore } from '@console/store/agentStore';

const metrics = [
  {
    label: 'Messages',
    select: (state: ReturnType<typeof useAgentStore.getState>) => state.messages.length,
  },
  {
    label: 'Events',
    select: (state: ReturnType<typeof useAgentStore.getState>) => state.events.length,
  },
  {
    label: 'Tool Calls',
    select: (state: ReturnType<typeof useAgentStore.getState>) => state.tools.length,
  },
  {
    label: 'Memories',
    select: (state: ReturnType<typeof useAgentStore.getState>) => state.memories.length,
  },
];

export function Dashboard() {
  const status = useAgentStore((state) => state.status);
  const snapshot = useAgentStore((state) => state);

  return (
    <section className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
            <p className="mt-1 text-sm text-muted">
              Agent Studio runtime overview and entry points.
            </p>
          </div>
          <StatusTag status={status} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                {metric.label}
              </div>
              <div className="mt-3 text-2xl font-semibold text-ink">{metric.select(snapshot)}</div>
            </Card>
          ))}
        </div>

        <Panel
          title="Agent Workspace"
          description="Run a task and inspect planning, workflow, tools, memory, knowledge and evaluation."
          actions={
            <Link to="/agent">
              <Button variant="primary" size="sm">
                Open Workspace
              </Button>
            </Link>
          }
        >
          <div className="grid gap-3 text-sm text-muted md:grid-cols-3">
            <div className="rounded-md bg-panel p-3">Chat-driven task execution</div>
            <div className="rounded-md bg-panel p-3">Live SSE timeline</div>
            <div className="rounded-md bg-panel p-3">Inspector-first observability</div>
          </div>
        </Panel>
      </div>
    </section>
  );
}
