import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AgentEvent } from '../../types/agent';
import { Button, Skeleton } from '../ui';
import { classNames } from '../ui/classNames';
import { InspectorEmpty } from './InspectorEmpty';

interface RuntimeLogsProps {
  events: AgentEvent[];
  isLoading: boolean;
  highlightedLogId?: string;
  onSelectEvent?: (event: AgentEvent) => void;
}

type LogLevel = 'ALL' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

const levels: LogLevel[] = ['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'];

export function RuntimeLogs({
  events,
  isLoading,
  highlightedLogId,
  onSelectEvent,
}: RuntimeLogsProps) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<LogLevel>('ALL');
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...events]
      .sort((left, right) => right.timestamp - left.timestamp)
      .filter((event) => {
        const eventLevel = getLogLevel(event.type);
        const matchesLevel = level === 'ALL' || eventLevel === level;
        const matchesQuery =
          !normalizedQuery ||
          event.type.toLowerCase().includes(normalizedQuery) ||
          JSON.stringify(event.payload).toLowerCase().includes(normalizedQuery);
        return matchesLevel && matchesQuery;
      });
  }, [events, level, query]);

  useEffect(() => {
    if (paused) return;
    viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filteredEvents.length, paused]);

  if (isLoading && events.length === 0) return <Skeleton lines={8} />;
  if (events.length === 0) {
    return <InspectorEmpty title="No runtime logs" description="Event logs will appear like a terminal stream." />;
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      <header className="space-y-2 border-b border-slate-800 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-100">Runtime Logs</div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 border-slate-700 px-2 text-[11px] text-slate-300 hover:bg-slate-900 hover:text-white"
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? 'Resume' : 'Pause'}
          </Button>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search logs..."
          className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-sky-500"
        />
        <div className="flex flex-wrap gap-1.5">
          {levels.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLevel(item)}
              className={classNames(
                'h-7 cursor-pointer rounded-md border px-2 font-mono text-[10px] transition-colors duration-200',
                level === item
                  ? 'border-sky-500 bg-sky-500/15 text-sky-200'
                  : 'border-slate-700 text-slate-400 hover:text-slate-100',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </header>
      <div ref={viewportRef} className="max-h-80 overflow-y-auto overscroll-contain p-2">
        {filteredEvents.map((event, index) => {
          const eventLevel = getLogLevel(event.type);
          return (
            <motion.button
              key={`${event.id}_${index}`}
              type="button"
              onClick={() => onSelectEvent?.(event)}
              className={classNames(
                'grid w-full cursor-pointer grid-cols-[72px_64px_minmax(0,1fr)] items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-[11px] transition-colors duration-200 hover:bg-slate-900',
                event.id === highlightedLogId && 'bg-sky-500/10',
              )}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.16, delay: Math.min(index * 0.008, 0.12) }}
            >
              <span className="text-slate-500">{formatTime(event.timestamp)}</span>
              <span className={getLevelClass(eventLevel)}>{eventLevel}</span>
              <span className="truncate text-slate-200">{event.type}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function getLogLevel(type: string): LogLevel {
  if (type.includes('error') || type.includes('failed') || type.includes('denied')) return 'ERROR';
  if (type.includes('blocked') || type.includes('approval') || type.includes('retry')) return 'WARNING';
  if (type.includes('success') || type.includes('complete')) return 'SUCCESS';
  return 'INFO';
}

function getLevelClass(level: LogLevel): string {
  if (level === 'SUCCESS') return 'text-emerald-300';
  if (level === 'WARNING') return 'text-amber-300';
  if (level === 'ERROR') return 'text-rose-300';
  return 'text-sky-300';
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
