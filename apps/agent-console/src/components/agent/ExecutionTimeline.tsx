import type { WorkflowEvent } from '../../types/agent';
import { Badge, Panel, StatusTag } from '../ui';

interface ExecutionTimelineProps {
  events: WorkflowEvent[];
}

export function ExecutionTimeline({ events }: ExecutionTimelineProps) {
  return (
    <Panel title="Timeline" description="Agent events emitted during execution">
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted">No workflow events yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="grid grid-cols-[32px_1fr] gap-3">
              <Badge tone={getTimelineTone(event.status)} className="h-8 w-8 justify-center px-0">
                {getTimelineIcon(event.type)}
              </Badge>
              <div className="rounded-md border border-line p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-normal text-muted">
                      {getTimelineLabel(event.type)}
                    </div>
                    <div className="mt-1 text-sm font-medium text-ink">{event.title}</div>
                  </div>
                  <StatusTag status={event.status} />
                </div>
                {event.detail && <p className="mt-1 text-xs text-muted">{event.detail}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

function getTimelineLabel(type: WorkflowEvent['type']): string {
  if (type === 'plan_start' || type === 'plan_update') return 'Planner';
  if (type === 'tool_start' || type === 'tool_success' || type === 'tool_error') return 'Tool';
  if (type === 'permission_denied' || type === 'tool_blocked' || type === 'approval_required') {
    return 'Guardrail';
  }
  if (type === 'rag_retrieve') return 'RAG';
  if (type === 'reflection') return 'Reflection';
  if (type === 'evaluation_start' || type === 'evaluation_complete') return 'Evaluation';
  if (type === 'memory_update') return 'Memory';
  if (type === 'final_answer') return 'Final Answer';
  if (type === 'replanning') return 'Replanning';
  return 'Workflow';
}

function getTimelineIcon(type: WorkflowEvent['type']): string {
  if (type === 'plan_start' || type === 'plan_update') return 'PL';
  if (type === 'tool_start' || type === 'tool_success' || type === 'tool_error') return 'FN';
  if (type === 'permission_denied' || type === 'tool_blocked' || type === 'approval_required') {
    return 'GR';
  }
  if (type === 'rag_retrieve') return 'KG';
  if (type === 'reflection') return 'RF';
  if (type === 'evaluation_start' || type === 'evaluation_complete') return 'EV';
  if (type === 'memory_update') return 'M';
  if (type === 'final_answer') return 'OK';
  return 'EV';
}

function getTimelineTone(
  status: WorkflowEvent['status'],
): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'success') return 'success';
  if (status === 'running') return 'warning';
  if (status === 'failed') return 'danger';
  return 'neutral';
}
