import type { MemoryRecord } from '../../types/agent';

interface MemoryPanelProps {
  memories: MemoryRecord[];
}

export function MemoryPanel({ memories }: MemoryPanelProps) {
  const groups: Array<{ label: string; type: MemoryRecord['type']; description: string }> = [
    { label: 'Working', type: 'working', description: '当前任务' },
    { label: 'Episodic', type: 'episodic', description: '历史任务' },
    { label: 'Semantic', type: 'semantic', description: '用户偏好' },
  ];

  return (
    <section className="rounded-md border border-line bg-white">
      <header className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Memory</h2>
        <p className="text-xs text-slate-500">Working, episodic and semantic memory</p>
      </header>
      <div className="space-y-3 p-4">
        {groups.map((group) => {
          const items = memories.filter((memory) => memory.type === group.type);

          return (
            <div key={group.type} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-ink">{group.label}</h3>
                  <p className="text-[11px] text-slate-500">{group.description}</p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                  {items.length}
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400">No records.</p>
                ) : (
                  items.map((memory) => (
                    <article key={memory.id} className="rounded bg-panel p-2">
                      <p className="text-xs leading-5 text-slate-600">{memory.content}</p>
                      <div className="mt-1 text-[11px] text-slate-400">
                        importance {memory.importance}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
