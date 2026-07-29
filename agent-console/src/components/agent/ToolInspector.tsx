import type { ToolCallRecord } from '../../types/agent';

interface ToolInspectorProps {
  tools: ToolCallRecord[];
}

export function ToolInspector({ tools }: ToolInspectorProps) {
  return (
    <section className="rounded-md border border-line bg-white">
      <header className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Tool</h2>
        <p className="text-xs text-slate-500">Function calls, inputs and outputs</p>
      </header>
      <div className="space-y-3 p-4">
        {tools.length === 0 ? (
          <p className="text-sm text-slate-500">No tool calls yet.</p>
        ) : (
          tools.map((tool) => (
            <article key={tool.id} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Tool</div>
                  <span className="text-sm font-semibold text-ink">{tool.name}</span>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  {tool.status}
                </span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-medium text-slate-500">Input</div>
                  <pre className="max-h-40 overflow-auto rounded bg-slate-950 p-2 text-xs text-slate-100">
                    {JSON.stringify(tool.args, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
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
    </section>
  );
}

function formatValue(value: unknown): string {
  if (value === undefined) return 'waiting...';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}
