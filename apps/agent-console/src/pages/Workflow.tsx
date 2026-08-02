import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  ChevronRightIcon,
  JsonViewer,
  LinkIcon,
  Panel,
  SearchIcon,
  StatusTag,
  WorkflowIcon,
} from '@console/components/ui';
import { classNames } from '@console/components/ui/classNames';
import {
  buildExecutionNodes,
  getStatusTone,
  type ExecutionNodeStatus,
} from '@console/components/execution/execution-model';
import {
  buildRuntimeDependencyEdges,
  buildRuntimeObjects,
  type RuntimeDependencyEdge,
  type RuntimeObject,
} from '@console/features/agent-console/runtime-object-model';
import { useAgentStore } from '@console/store/agentStore';
import type { AgentEvent, PlanStep, WorkflowEvent } from '@console/types/agent';

interface WorkflowStepView {
  id: string;
  title: string;
  tool?: string;
  status: ExecutionNodeStatus;
  args?: Record<string, unknown>;
  runtimeObject?: RuntimeObject;
  events: AgentEvent[];
}

interface WorkflowSummary {
  stepCount: number;
  executableSteps: number;
  completedSteps: number;
  runtimeObjects: number;
  dependencyEdges: number;
  eventCount: number;
}

export function Workflow() {
  const plan = useAgentStore((state) => state.plan);
  const tools = useAgentStore((state) => state.tools);
  const events = useAgentStore((state) => state.events);
  const workflow = useAgentStore((state) => state.workflow);
  const citations = useAgentStore((state) => state.citations);
  const evaluation = useAgentStore((state) => state.evaluation);
  const messages = useAgentStore((state) => state.messages);
  const status = useAgentStore((state) => state.status);

  const executionNodes = useMemo(
    () =>
      buildExecutionNodes({
        plan,
        tools,
        events,
        workflow,
        citations,
        evaluation,
        messages,
        status,
      }),
    [citations, evaluation, events, messages, plan, status, tools, workflow],
  );
  const runtimeObjects = useMemo(() => buildRuntimeObjects(executionNodes), [executionNodes]);
  const dependencyEdges = useMemo(
    () => buildRuntimeDependencyEdges(runtimeObjects),
    [runtimeObjects],
  );
  const workflowSteps = useMemo(
    () => buildWorkflowSteps(plan?.steps ?? [], runtimeObjects, events),
    [events, plan?.steps, runtimeObjects],
  );
  const summary = useMemo(
    () => buildWorkflowSummary(workflowSteps, runtimeObjects, dependencyEdges, workflow),
    [dependencyEdges, runtimeObjects, workflow, workflowSteps],
  );
  const [selectedId, setSelectedId] = useState<string>();
  const [query, setQuery] = useState('');
  const filteredSteps = useMemo(
    () => filterWorkflowSteps(workflowSteps, query),
    [query, workflowSteps],
  );
  const selectedStep =
    filteredSteps.find((step) => step.id === selectedId) ??
    filteredSteps[0] ??
    workflowSteps[0];

  return (
    <section className="h-full overflow-y-auto bg-[var(--studio-bg)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 p-4 lg:p-6">
        <WorkflowHeader hasPlan={Boolean(plan)} status={status} />

        {!plan ? (
          <WorkflowEmptyState runtimeObjectCount={runtimeObjects.length} eventCount={events.length} />
        ) : (
          <>
            <WorkflowMetricStrip summary={summary} />

            <div className="grid min-h-[690px] min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
              <div className="grid min-h-0 gap-4 xl:grid-rows-[330px_minmax(0,1fr)]">
                <WorkflowGraphPanel
                  objects={runtimeObjects}
                  edges={dependencyEdges}
                  selectedObjectId={selectedStep?.runtimeObject?.id}
                />
                <StepExplorerPanel
                  steps={filteredSteps}
                  selectedId={selectedStep?.id}
                  query={query}
                  onQueryChange={setQuery}
                  onSelect={setSelectedId}
                />
              </div>

              <div className="grid min-h-0 gap-4 xl:grid-rows-[minmax(0,1fr)_310px]">
                <WorkflowDetailPanel step={selectedStep} planGoal={plan.goal} />
                <WorkflowEventsPanel workflow={workflow} events={events} />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function WorkflowHeader({ hasPlan, status }: { hasPlan: boolean; status: string }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Workflow Builder
          </div>
          <Badge tone={hasPlan ? 'info' : 'neutral'}>{hasPlan ? 'plan loaded' : 'read-only preview'}</Badge>
        </div>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">Workflow Center</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Inspect Planner output, executable steps, runtime dependencies, and workflow events from the current Agent run.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted">
          <span>current session only</span>
          <span className="text-lineStrong">·</span>
          <span>runtime {status}</span>
          <span className="text-lineStrong">·</span>
          <span>editing backend not implemented in this phase</span>
        </div>
      </div>
      <Link to="/agent">
        <Button size="sm" variant="primary">
          Open Agent Workspace
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </header>
  );
}

function WorkflowMetricStrip({ summary }: { summary: WorkflowSummary }) {
  const metrics = [
    { label: 'Plan steps', value: summary.stepCount, detail: 'planner output', tone: 'info' as const },
    { label: 'Executable', value: summary.executableSteps, detail: 'tool steps', tone: 'warning' as const },
    { label: 'Completed', value: summary.completedSteps, detail: 'runtime status', tone: 'success' as const },
    { label: 'Dependencies', value: summary.dependencyEdges, detail: `${summary.runtimeObjects} objects`, tone: 'neutral' as const },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              {metric.label}
            </div>
            <Badge tone={metric.tone}>{metric.detail}</Badge>
          </div>
          <div className="mt-3 font-mono text-2xl font-semibold tracking-tight text-ink">
            {metric.value}
          </div>
        </Card>
      ))}
    </div>
  );
}

function WorkflowGraphPanel({
  objects,
  edges,
  selectedObjectId,
}: {
  objects: RuntimeObject[];
  edges: RuntimeDependencyEdge[];
  selectedObjectId?: string;
}) {
  const graph = useMemo(() => buildGraphLayout(objects, edges), [edges, objects]);

  return (
    <Panel
      title="Planner Dependency Graph"
      description="Read-only runtime dependency preview"
      actions={<Badge>{edges.length} edges</Badge>}
      bodyClassName="relative min-h-0 overflow-auto p-0"
    >
      <div className="relative min-h-full min-w-[940px] bg-[radial-gradient(circle_at_1px_1px,#e2e8f0_1px,transparent_0)] bg-[length:24px_24px]">
        <svg
          className="pointer-events-none absolute inset-0"
          width={graph.width}
          height={graph.height}
          viewBox={`0 0 ${graph.width} ${graph.height}`}
          aria-hidden="true"
        >
          {graph.edges.map((edge) => {
            const from = graph.pointsById.get(edge.from);
            const to = graph.pointsById.get(edge.to);
            if (!from || !to) return null;
            return (
              <g key={edge.id}>
                <path
                  d={getEdgePath(from, to)}
                  fill="none"
                  stroke={getEdgeColor(edge.status)}
                  strokeWidth={edge.status === 'running' ? 2.4 : 1.5}
                  strokeLinecap="round"
                  strokeDasharray={edge.status === 'waiting' ? '4 6' : undefined}
                />
                <text
                  x={(from.x + to.x) / 2 + 76}
                  y={(from.y + to.y) / 2 - 8}
                  className="fill-slate-500 text-[9px] font-semibold uppercase tracking-[0.12em]"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}
        </svg>

        {graph.points.map((point) => (
          <div
            key={point.object.id}
            className={classNames(
              'absolute w-[158px] rounded-xl border bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors duration-200',
              point.object.id === selectedObjectId
                ? 'border-blue-300 bg-blue-50 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                : 'border-line',
            )}
            style={{ left: point.x, top: point.y }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-ink">{point.object.title}</div>
                <div className="mt-1 truncate text-[10px] text-muted">{point.object.type}</div>
              </div>
              <span
                className={classNames(
                  'mt-1 h-2 w-2 rounded-full',
                  point.object.status === 'success' && 'bg-emerald-500',
                  point.object.status === 'running' && 'animate-pulse bg-blue-500',
                  point.object.status === 'failed' && 'bg-rose-500',
                  point.object.status === 'waiting' && 'bg-slate-300',
                )}
              />
            </div>
            <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-muted">{point.object.summary}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <Badge tone={getStatusTone(point.object.status)}>{point.object.status}</Badge>
              <span className="font-mono text-[10px] text-muted">{formatDuration(point.object.duration)}</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function StepExplorerPanel({
  steps,
  selectedId,
  query,
  onQueryChange,
  onSelect,
}: {
  steps: WorkflowStepView[];
  selectedId?: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <Panel
      title="Step Explorer"
      description="Planner steps mapped to runtime objects"
      actions={<Badge>{steps.length} visible</Badge>}
      bodyClassName="min-h-0 overflow-hidden p-0"
    >
      <div className="border-b border-line bg-white p-3">
        <label className="flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10">
          <SearchIcon className="h-3.5 w-3.5 text-muted" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search step, tool, status..."
            className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-muted"
          />
        </label>
      </div>
      <div className="h-full min-h-0 overflow-y-auto">
        {steps.length === 0 ? (
          <SmallEmpty title="No matching steps" description="Adjust the step search query." />
        ) : (
          <div className="divide-y divide-line">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelect(step.id)}
                className={classNames(
                  'block w-full cursor-pointer p-4 text-left transition-colors duration-200 hover:bg-blue-50/50',
                  step.id === selectedId ? 'bg-blue-50/70' : 'bg-white',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-muted">#{index + 1}</span>
                      <span className="truncate text-xs font-semibold text-ink">{step.title}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted">
                      <span>{step.tool ?? 'no tool'}</span>
                      <span>{step.events.length} events</span>
                    </div>
                  </div>
                  <StatusTag status={step.status} />
                </div>
                <p className="mt-3 line-clamp-2 rounded-lg border border-line bg-panel p-3 text-xs leading-5 text-muted">
                  {step.runtimeObject?.summary ?? 'Waiting for runtime mapping.'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

function WorkflowDetailPanel({
  step,
  planGoal,
}: {
  step?: WorkflowStepView;
  planGoal: string;
}) {
  return (
    <Panel
      title="Workflow Detail"
      description="Selected step definition and runtime mapping"
      actions={step ? <Badge tone={getStatusTone(step.status)}>{step.status}</Badge> : <Badge>empty</Badge>}
      bodyClassName="min-h-0 overflow-y-auto p-0"
    >
      {!step ? (
        <SmallEmpty title="No step selected" description="Select a planner step to inspect its workflow mapping." />
      ) : (
        <div className="space-y-4 p-4">
          <section className="rounded-xl border border-line bg-white p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Planner Goal
            </div>
            <p className="mt-2 text-sm leading-6 text-ink">{planGoal}</p>
          </section>

          <section className="rounded-xl border border-line bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Selected Step
                </div>
                <h2 className="mt-1 text-sm font-semibold text-ink">{step.title}</h2>
                <p className="mt-1 font-mono text-[10px] text-muted">{step.id}</p>
              </div>
              <StatusTag status={step.status} />
            </div>
          </section>

          <JsonViewer
            title="Step Definition"
            value={{
              id: step.id,
              title: step.title,
              tool: step.tool,
              status: step.status,
              args: step.args,
            }}
          />

          <JsonViewer
            title="Runtime Mapping"
            value={{
              runtimeObject: step.runtimeObject
                ? {
                    id: step.runtimeObject.id,
                    type: step.runtimeObject.type,
                    traceId: step.runtimeObject.traceId,
                    spanId: step.runtimeObject.spanId,
                    parentId: step.runtimeObject.parentId,
                    dependencyIds: step.runtimeObject.dependencyIds,
                    childIds: step.runtimeObject.childIds,
                    duration: step.runtimeObject.duration,
                    metadata: step.runtimeObject.metadata,
                  }
                : null,
              events: step.events.map((event) => ({
                id: event.id,
                type: event.type,
                timestamp: event.timestamp,
              })),
            }}
            collapsed
          />

          <Link to="/agent" className="inline-flex">
            <Button size="sm" variant="secondary">
              <LinkIcon className="h-3.5 w-3.5" />
              Inspect in Agent Workspace
            </Button>
          </Link>
        </div>
      )}
    </Panel>
  );
}

function WorkflowEventsPanel({
  workflow,
  events,
}: {
  workflow: WorkflowEvent[];
  events: AgentEvent[];
}) {
  const relevantEvents = events.filter((event) =>
    ['plan_start', 'plan_update', 'workflow_start', 'state_update', 'tool_start', 'tool_success', 'tool_error', 'task_complete'].includes(event.type),
  );

  return (
    <Panel
      title="Workflow Events"
      description="Runtime events related to plan execution"
      actions={<Badge>{relevantEvents.length}</Badge>}
      bodyClassName="min-h-0 overflow-y-auto p-0"
    >
      {relevantEvents.length === 0 ? (
        <SmallEmpty title="No workflow events" description="Run a task to populate workflow execution events." />
      ) : (
        <div className="divide-y divide-line">
          {relevantEvents.map((event) => {
            const workflowEvent = workflow.find((item) => item.id === event.id);
            return (
              <article key={event.id} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-ink">
                      {workflowEvent?.title ?? formatEventType(event.type)}
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-muted">
                      {formatTime(event.timestamp)} · {event.id}
                    </div>
                  </div>
                  <Badge tone={getStatusTone(normalizeExecutionStatus(workflowEvent?.status))}>
                    {workflowEvent?.status ?? event.type}
                  </Badge>
                </div>
                {workflowEvent?.detail && (
                  <p className="mt-2 rounded-lg border border-line bg-panel px-3 py-2 text-[11px] leading-5 text-muted">
                    {workflowEvent.detail}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function WorkflowEmptyState({
  runtimeObjectCount,
  eventCount,
}: {
  runtimeObjectCount: number;
  eventCount: number;
}) {
  return (
    <Card className="border-dashed border-lineStrong p-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
          <WorkflowIcon className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-ink">No planner workflow yet</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Run the sales decline demo in Agent Workspace. When Planner generates a plan,
          workflow steps, dependencies, and runtime mappings will appear here.
        </p>
        <div className="mx-auto mt-5 grid max-w-lg gap-3 text-left sm:grid-cols-2">
          <MiniMetric label="Runtime objects" value={String(runtimeObjectCount)} />
          <MiniMetric label="Events observed" value={String(eventCount)} />
        </div>
        <Link to="/agent" className="mt-5 inline-flex">
          <Button variant="primary" size="sm">
            Open Agent Workspace
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</div>
      <div className="mt-1 truncate font-mono text-xs font-semibold text-ink">{value}</div>
    </div>
  );
}

function SmallEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center p-6 text-center">
      <div>
        <div className="text-sm font-semibold text-ink">{title}</div>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
    </div>
  );
}

function buildWorkflowSteps(
  steps: PlanStep[],
  runtimeObjects: RuntimeObject[],
  events: AgentEvent[],
): WorkflowStepView[] {
  return steps.map((step) => {
    const runtimeObject = findRuntimeObjectForStep(step, runtimeObjects);
    return {
      id: step.id,
      title: step.description,
      tool: step.tool,
      status: runtimeObject?.status ?? normalizeExecutionStatus(step.status),
      args: step.args,
      runtimeObject,
      events: runtimeObject ? getRuntimeEvents(runtimeObject) : getEventsForStep(step, events),
    };
  });
}

function buildWorkflowSummary(
  steps: WorkflowStepView[],
  objects: RuntimeObject[],
  edges: RuntimeDependencyEdge[],
  workflow: WorkflowEvent[],
): WorkflowSummary {
  return {
    stepCount: steps.length,
    executableSteps: steps.filter((step) => Boolean(step.tool)).length,
    completedSteps: steps.filter((step) => step.status === 'success').length,
    runtimeObjects: objects.length,
    dependencyEdges: edges.length,
    eventCount: workflow.length,
  };
}

function filterWorkflowSteps(steps: WorkflowStepView[], query: string): WorkflowStepView[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return steps;
  return steps.filter((step) =>
    [
      step.id,
      step.title,
      step.tool ?? '',
      step.status,
      step.runtimeObject?.title ?? '',
      step.runtimeObject?.summary ?? '',
    ].some((value) => value.toLowerCase().includes(normalizedQuery)),
  );
}

function findRuntimeObjectForStep(
  step: PlanStep,
  objects: RuntimeObject[],
): RuntimeObject | undefined {
  if (step.tool) {
    return objects.find(
      (object) =>
        object.type === 'tool' &&
        (object.title === step.tool || object.id === `tool:${step.id}` || object.id === `tool:${step.tool}`),
    );
  }
  if (step.description.toLowerCase().includes('检索') || step.description.toLowerCase().includes('knowledge')) {
    return objects.find((object) => object.type === 'knowledge');
  }
  if (step.description.toLowerCase().includes('报告') || step.description.toLowerCase().includes('answer')) {
    return objects.find((object) => object.type === 'answer');
  }
  return objects.find((object) => object.id === step.id);
}

function getRuntimeEvents(object: RuntimeObject): AgentEvent[] {
  const events = object.span.events;
  return Array.isArray(events) ? events : [];
}

function getEventsForStep(step: PlanStep, events: AgentEvent[]): AgentEvent[] {
  if (!step.tool) return [];
  return events.filter((event) => {
    const payload = event.payload as { toolName?: unknown };
    return typeof payload.toolName === 'string' && payload.toolName === step.tool;
  });
}

function buildGraphLayout(objects: RuntimeObject[], edges: RuntimeDependencyEdge[]) {
  const points = objects.map((object, index) => ({
    object,
    x: 24 + getColumn(object.type) * 178,
    y: getRowY(object, index, objects),
  }));
  return {
    points,
    pointsById: new Map(points.map((point) => [point.object.id, point])),
    edges,
    width: Math.max(980, 24 + 6 * 178),
    height: 310,
  };
}

function getColumn(type: RuntimeObject['type']): number {
  if (type === 'planner') return 0;
  if (type === 'workflow' || type === 'knowledge') return 1;
  if (type === 'tool') return 2;
  if (type === 'memory' || type === 'reflection') return 3;
  if (type === 'evaluation') return 4;
  return 5;
}

function getRowY(object: RuntimeObject, index: number, objects: RuntimeObject[]): number {
  if (object.type === 'tool') {
    const tools = objects.filter((item) => item.type === 'tool');
    const toolIndex = tools.findIndex((item) => item.id === object.id);
    return 28 + Math.max(toolIndex, 0) * (tools.length > 2 ? 68 : 82);
  }
  if (object.type === 'workflow' || object.type === 'memory') return 26;
  if (object.type === 'knowledge' || object.type === 'reflection') return 152;
  if (object.type === 'planner') return 88;
  if (object.type === 'evaluation' || object.type === 'answer') return 88;
  return 88 + (index % 2) * 8;
}

function getEdgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const startX = from.x + 158;
  const startY = from.y + 54;
  const endX = to.x;
  const endY = to.y + 54;
  const midX = startX + (endX - startX) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

function getEdgeColor(status: string): string {
  if (status === 'success') return '#059669';
  if (status === 'running') return '#2563eb';
  if (status === 'failed') return '#dc2626';
  if (status === 'cancelled') return '#d97706';
  return '#cbd5e1';
}

function normalizeExecutionStatus(status: unknown): ExecutionNodeStatus {
  if (
    status === 'waiting' ||
    status === 'running' ||
    status === 'success' ||
    status === 'failed' ||
    status === 'skipped' ||
    status === 'cancelled'
  ) {
    return status;
  }
  if (status === 'pending') return 'waiting';
  return 'waiting';
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return '-';
  return duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;
}

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp));
}

function formatEventType(type: string): string {
  return type
    .split('_')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
