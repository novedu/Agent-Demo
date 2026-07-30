import type { MemoryRecord } from '../../types/agent';
import { Badge, Panel } from '../ui';

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
    <Panel title="Memory" description="Working, episodic and semantic memory">
      <div className="space-y-3">
        {groups.map((group) => {
          const items = memories.filter((memory) => memory.type === group.type);

          return (
            <div key={group.type} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-ink">{group.label}</h3>
                  <p className="text-[11px] text-muted">{group.description}</p>
                </div>
                <Badge>{items.length}</Badge>
              </div>
              <div className="mt-2 space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-muted">No records.</p>
                ) : (
                  items.map((memory) => (
                    <article key={memory.id} className="rounded bg-panel p-2">
                      <p className="text-xs leading-5 text-muted">{memory.content}</p>
                      <div className="mt-1 text-[11px] text-muted">
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
    </Panel>
  );
}
