import type { WorkflowEvent } from '../../types/agent';

interface ExecutionTimelineProps {
  events: WorkflowEvent[];
}

export function ExecutionTimeline({ events }: ExecutionTimelineProps) {
  return (
    <section className="rounded-md border border-line bg-white">
      <header className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Timeline</h2>
        <p className="text-xs text-slate-500">Agent events emitted during execution</p>
      </header>
      <div className="space-y-3 p-4">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No workflow events yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="grid grid-cols-[32px_1fr] gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded ${getTimelineTone(event.status)}`}
              >
                <span className="text-[10px] font-semibold" aria-hidden="true">
                  {getTimelineIcon(event.type)}
                </span>
              </div>
              <div className="rounded-md border border-line p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-normal text-slate-500">
                      {getTimelineLabel(event.type)}
                    </div>
                    <div className="mt-1 text-sm font-medium text-ink">{event.title}</div>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{event.status}</span>
                </div>
                {event.detail && <p className="mt-1 text-xs text-slate-500">{event.detail}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function getTimelineLabel(type: WorkflowEvent['type']): string {
  if (type === 'plan_start' || type === 'plan_update') return 'Planner';
  if (type === 'tool_start' || type === 'tool_success' || type === 'tool_error') return 'Tool';
  if (type === 'rag_retrieve') return 'RAG';
  if (type === 'reflection') return 'Reflection';
  if (type === 'memory_update') return 'Memory';
  if (type === 'final_answer') return 'Final Answer';
  if (type === 'replanning') return 'Replanning';
  return 'Workflow';
}

function getTimelineIcon(type: WorkflowEvent['type']): string {
  if (type === 'plan_start' || type === 'plan_update') return 'PL';
  if (type === 'tool_start' || type === 'tool_success' || type === 'tool_error') return 'FN';
  if (type === 'rag_retrieve') return 'KG';
  if (type === 'reflection') return 'RF';
  if (type === 'memory_update') return 'M';
  if (type === 'final_answer') return 'OK';
  return 'EV';
}

function getTimelineTone(status: WorkflowEvent['status']): string {
  if (status === 'success') return 'bg-emerald-100 text-emerald-700';
  if (status === 'running') return 'bg-amber-100 text-amber-700';
  if (status === 'failed') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-500';
}
