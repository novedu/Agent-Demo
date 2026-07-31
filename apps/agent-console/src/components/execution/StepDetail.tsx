import ReactMarkdown from 'react-markdown';
import { useMemo, useState, type ReactNode } from 'react';
import { Badge, JsonViewer } from '../ui';
import { classNames } from '../ui/classNames';
import type { ExecutionNodeRecord } from './execution-model';

interface StepDetailProps {
  node: ExecutionNodeRecord;
}

type StepTab = 'overview' | 'input' | 'output' | 'reasoning' | 'trace' | 'metadata' | 'raw';

const tabs: Array<{ id: StepTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'input', label: 'Input' },
  { id: 'output', label: 'Output' },
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'trace', label: 'Trace' },
  { id: 'metadata', label: 'Metadata' },
  { id: 'raw', label: 'Raw JSON' },
];

export function StepDetail({ node }: StepDetailProps) {
  const [activeTab, setActiveTab] = useState<StepTab>('overview');
  const raw = useMemo(
    () => ({
      id: node.id,
      kind: node.kind,
      component: node.component,
      summary: node.summary,
      status: node.status,
      duration: node.duration,
      startTime: node.startTime,
      endTime: node.endTime,
      input: node.input,
      arguments: node.arguments,
      output: node.output,
      metadata: node.metadata,
      trace: node.trace,
    }),
    [node],
  );

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={classNames(
              'h-9 cursor-pointer rounded-lg border px-3 text-xs font-semibold transition-colors duration-200',
              activeTab === tab.id
                ? 'border-accent bg-blue-50 text-accent'
                : 'border-line bg-white text-muted hover:border-lineStrong hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <Overview node={node} />}
      {activeTab === 'input' && (
        <JsonViewer title="Input" value={{ input: node.input, arguments: node.arguments }} />
      )}
      {activeTab === 'output' && <SmartBlock title="Output" value={node.output} />}
      {activeTab === 'reasoning' && <SmartBlock title="Reasoning Summary" value={getReasoning(node)} />}
      {activeTab === 'trace' && <JsonViewer title="Trace" value={node.trace} />}
      {activeTab === 'metadata' && <JsonViewer title="Metadata" value={node.metadata} />}
      {activeTab === 'raw' && <JsonViewer title="Raw Runtime Object" value={raw} />}
    </div>
  );
}

function Overview({ node }: { node: ExecutionNodeRecord }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Focused Runtime Object
            </div>
            <h3 className="mt-2 truncate text-lg font-semibold text-ink">{node.component}</h3>
            <p className="mt-1 text-sm leading-6 text-muted">{node.summary}</p>
          </div>
          <Badge tone={node.status === 'failed' ? 'danger' : node.status === 'success' ? 'success' : 'info'}>
            {node.status}
          </Badge>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-xs">
        <Detail label="Component" value={node.component} />
        <Detail label="Kind" value={node.kind} />
        <Detail label="Duration" value={formatDuration(node.duration)} />
        <Detail label="Tool" value={getToolName(node)} />
        <Detail label="Start" value={formatTime(node.startTime)} />
        <Detail label="End" value={formatTime(node.endTime)} />
      </dl>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-white p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</dt>
      <dd className="mt-1 truncate font-medium text-ink">{value}</dd>
    </div>
  );
}

function SmartBlock({ title, value }: { title: string; value: unknown }) {
  if (typeof value === 'string' && value.trim()) {
    return (
      <section className="overflow-hidden rounded-lg border border-line bg-white">
        <header className="flex min-h-10 items-center border-b border-line px-3 text-xs font-semibold text-ink">
          {title}
        </header>
        <div className="prose prose-sm max-w-none p-4 prose-p:my-2 prose-pre:rounded-md prose-pre:bg-slate-950 prose-pre:text-slate-100">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      </section>
    );
  }

  return <JsonViewer title={title} value={value} />;
}

function getReasoning(node: ExecutionNodeRecord): unknown {
  if (node.metadata && 'reasoning' in node.metadata) return node.metadata.reasoning;
  if (node.kind === 'reflection') return node.output;
  if (node.kind === 'evaluation') return node.metadata;
  if (node.kind === 'tool') return node.trace;
  return 'No reasoning payload captured for this runtime object.';
}

function getToolName(node: ExecutionNodeRecord): string {
  if (node.kind !== 'tool') return '-';
  const toolName = node.metadata?.toolName;
  return typeof toolName === 'string' ? toolName : node.component;
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return 'pending';
  return duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`;
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleTimeString();
}
