import ReactMarkdown from 'react-markdown';
import { Accordion, Badge, Panel } from '../ui';
import type { ExecutionNodeRecord } from './execution-model';
import type { ReactNode } from 'react';

interface StepDetailProps {
  node: ExecutionNodeRecord;
}

export function StepDetail({ node }: StepDetailProps) {
  const sections = [
    {
      id: 'input',
      title: 'Input',
      meta: <Badge tone="neutral">JSON</Badge>,
      children: <JsonBlock value={node.input} />,
    },
    {
      id: 'arguments',
      title: 'Arguments',
      meta: <Badge tone="neutral">Tool</Badge>,
      children: <JsonBlock value={node.arguments} />,
    },
    {
      id: 'output',
      title: 'Output',
      meta: <Badge tone="success">Result</Badge>,
      children: <SmartBlock value={node.output} />,
    },
    {
      id: 'reasoning',
      title: 'Reasoning',
      meta: <Badge tone="info">LLM</Badge>,
      children: <SmartBlock value={getReasoning(node)} />,
    },
    {
      id: 'metadata',
      title: 'Metadata',
      meta: <Badge tone="neutral">JSON</Badge>,
      children: <JsonBlock value={node.metadata} />,
    },
    {
      id: 'trace',
      title: 'Trace',
      meta: <Badge tone="warning">Raw</Badge>,
      children: <JsonBlock value={node.trace} />,
    },
  ];

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
          <Detail label="Tool" value={getToolName(node)} />
        </dl>
      </Panel>

      <Accordion items={sections} defaultOpenId="output" />
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

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-72 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-100">
      {formatJson(value)}
    </pre>
  );
}

function SmartBlock({ value }: { value: unknown }) {
  if (typeof value === 'string' && value.trim()) {
    return (
      <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:rounded-md prose-pre:bg-slate-950 prose-pre:text-slate-100">
        <ReactMarkdown>{value}</ReactMarkdown>
      </div>
    );
  }

  return <JsonBlock value={value} />;
}

function getReasoning(node: ExecutionNodeRecord): unknown {
  if (node.metadata && 'reasoning' in node.metadata) return node.metadata.reasoning;
  if (node.kind === 'reflection') return node.output;
  if (node.kind === 'evaluation') return node.metadata;
  return 'No reasoning payload captured for this step.';
}

function getToolName(node: ExecutionNodeRecord): string {
  if (node.kind !== 'tool') return '-';
  const toolName = node.metadata?.toolName;
  return typeof toolName === 'string' ? toolName : node.component;
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
