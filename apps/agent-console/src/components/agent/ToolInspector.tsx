import type { ToolCallRecord } from '../../types/agent';
import { Panel, Skeleton, StatusTag } from '../ui';

interface ToolInspectorProps {
  tools: ToolCallRecord[];
  isLoading?: boolean;
}

export function ToolInspector({ tools, isLoading }: ToolInspectorProps) {
  return (
    <Panel title="Tool" description="Function calls, inputs and outputs">
      <div className="space-y-3">
        {isLoading && tools.length === 0 ? (
          <Skeleton lines={5} />
        ) : tools.length === 0 ? (
          <p className="text-sm text-muted">No tool calls yet.</p>
        ) : (
          tools.map((tool) => (
            <article key={tool.id} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted">Tool</div>
                  <span className="text-sm font-semibold text-ink">{tool.name}</span>
                </div>
                <StatusTag status={tool.status} />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-medium text-muted">Input</div>
                  <pre className="max-h-40 overflow-auto rounded bg-slate-950 p-2 text-xs text-slate-100">
                    {JSON.stringify(tool.args, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted">
                    <span>Output</span>
                    {tool.duration !== undefined && <span>{tool.duration}ms</span>}
                  </div>
                  <pre className="max-h-40 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700">
                    {formatValue(tool.result)}
                  </pre>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}

function formatValue(value: unknown): string {
  if (value === undefined) return 'waiting...';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}
