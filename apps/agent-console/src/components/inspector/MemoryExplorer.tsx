import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { MemoryRecord } from '../../types/agent';
import { Badge, Skeleton } from '../ui';
import { classNames } from '../ui/classNames';
import { InspectorEmpty } from './InspectorEmpty';

interface MemoryExplorerProps {
  memories: MemoryRecord[];
  isLoading: boolean;
  highlightedMemoryId?: string;
  onSelectMemory?: (memory: MemoryRecord) => void;
}

const groups: Array<{ type: MemoryRecord['type']; label: string; description: string }> = [
  { type: 'working', label: 'Working', description: 'Current task context' },
  { type: 'episodic', label: 'Episodic', description: 'Past task summaries' },
  { type: 'semantic', label: 'Semantic', description: 'Stable user preferences' },
];

export function MemoryExplorer({
  memories,
  isLoading,
  highlightedMemoryId,
  onSelectMemory,
}: MemoryExplorerProps) {
  const [openType, setOpenType] = useState<MemoryRecord['type'] | ''>('working');
  const highlightedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const highlighted = memories.find((memory) => memory.id === highlightedMemoryId);
    if (highlighted) setOpenType(highlighted.type);
    window.setTimeout(() => {
      highlightedRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 80);
  }, [highlightedMemoryId, memories]);

  if (isLoading && memories.length === 0) return <Skeleton lines={7} />;
  if (memories.length === 0) {
    return <InspectorEmpty title="No memory records" description="Memory updates appear during a task." />;
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const items = memories.filter((memory) => memory.type === group.type);
        const isOpen = openType === group.type;

        return (
          <div key={group.type} className="overflow-hidden rounded-xl border border-line bg-white">
            <button
              type="button"
              onClick={() => setOpenType(isOpen ? '' : group.type)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-panel"
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
                    <button
                      key={memory.id}
                      ref={memory.id === highlightedMemoryId ? highlightedRef : undefined}
                      type="button"
                      onClick={() => onSelectMemory?.(memory)}
                      className={classNames(
                        'w-full rounded-lg border bg-panel p-2.5 text-left transition-colors duration-200 hover:border-purple-200 hover:bg-purple-50',
                        memory.id === highlightedMemoryId
                          ? 'border-purple-300 bg-purple-50 shadow-[0_0_0_2px_rgba(124,58,237,0.12)]'
                          : 'border-line',
                      )}
                    >
                      <p className="text-xs leading-5 text-muted">{memory.content}</p>
                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted">
                        <span>importance {memory.importance}</span>
                        <span>related message · {formatDate(memory.updatedAt)}</span>
                      </div>
                    </button>
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
