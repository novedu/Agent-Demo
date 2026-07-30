import { Badge, Panel } from '../ui';
import type { ExecutionNodeRecord } from './execution-model';
import type { ReactNode } from 'react';

interface StepDetailProps {
  node: ExecutionNodeRecord;
}

export function StepDetail({ node }: StepDetailProps) {
  return (
    <div className="space-y-3">
      <Panel title="Step Detail" description={`${node.component} / ${node.kind}`}>
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <Detail label="Component" value={node.component} />
          <Detail label="Status" value={<Badge>{node.status}</Badge>} />
          <Detail label="Duration" value={formatDuration(node.duration)} />
          <Detail label="Start" value={formatTime(node.startTime)} />
          <Detail label="End" value={formatTime(node.endTime)} />
          <Detail label="Summary" value={node.summary} wide />
        </dl>
      </Panel>

      <JsonBlock title="Input" value={node.input} />
      <JsonBlock title="Arguments" value={node.arguments} />
      <JsonBlock title="Output" value={node.output} />
      <JsonBlock title="Metadata" value={node.metadata} />
      <JsonBlock title="Trace" value={node.trace} />
    </div>
  );
}

function Detail({ label, value, wide }: { label: string; value: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'col-span-2 rounded-md bg-panel p-3' : 'rounded-md bg-panel p-3'}>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <Panel title={title} bodyClassName="p-0">
      <pre className="max-h-56 overflow-auto bg-slate-950 p-3 text-xs leading-5 text-slate-100">
        {formatJson(value)}
      </pre>
    </Panel>
  );
}

function formatJson(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

function formatDuration(duration?: number): string {
  return duration === undefined ? 'pending' : `${duration}ms`;
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleTimeString();
}
