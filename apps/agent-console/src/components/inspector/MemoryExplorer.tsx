import { motion } from 'framer-motion';
import { useState } from 'react';
import type { MemoryRecord } from '../../types/agent';
import { Badge, Skeleton } from '../ui';
import { InspectorEmpty } from './InspectorEmpty';

interface MemoryExplorerProps {
  memories: MemoryRecord[];
  isLoading: boolean;
}

const groups: Array<{ type: MemoryRecord['type']; label: string; description: string }> = [
  { type: 'working', label: 'Working', description: 'Current task context' },
  { type: 'episodic', label: 'Episodic', description: 'Past task summaries' },
  { type: 'semantic', label: 'Semantic', description: 'Stable user preferences' },
];

export function MemoryExplorer({ memories, isLoading }: MemoryExplorerProps) {
  const [openType, setOpenType] = useState<MemoryRecord['type'] | ''>('working');

  if (isLoading && memories.length === 0) return <Skeleton lines={7} />;
  if (memories.length === 0) {
    return <InspectorEmpty title="No memory records" description="Memory updates appear during a task." />;
  }

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const items = memories.filter((memory) => memory.type === group.type);
        const isOpen = openType === group.type;

        return (
          <div key={group.type} className="overflow-hidden rounded-md border border-line bg-panel">
            <button
              type="button"
              onClick={() => setOpenType(isOpen ? '' : group.type)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-white"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ink">{group.label}</div>
                <div className="truncate text-[11px] text-muted">{group.description}</div>
              </div>
              <Badge>{items.length}</Badge>
            </button>
            {isOpen && (
              <motion.div
                className="space-y-2 border-t border-line p-2"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.18 }}
              >
                {items.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-muted">No records in this category.</p>
                ) : (
                  items.map((memory) => (
                    <article key={memory.id} className="rounded-md border border-line bg-white p-2.5">
                      <p className="text-xs leading-5 text-muted">{memory.content}</p>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted">
                        <span>importance {memory.importance}</span>
                        <span>{formatDate(memory.updatedAt)}</span>
                      </div>
                    </article>
                  ))
                )}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
