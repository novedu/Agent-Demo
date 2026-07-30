import { motion } from 'framer-motion';
import type { AgentEvent } from '../../types/agent';
import { Badge, Skeleton } from '../ui';
import { InspectorEmpty } from './InspectorEmpty';

interface RuntimeLogsProps {
  events: AgentEvent[];
  isLoading: boolean;
}

export function RuntimeLogs({ events, isLoading }: RuntimeLogsProps) {
  if (isLoading && events.length === 0) return <Skeleton lines={8} />;
  if (events.length === 0) {
    return <InspectorEmpty title="No runtime logs" description="Event logs will be listed in reverse time order." />;
  }

  const sortedEvents = [...events].sort((left, right) => right.timestamp - left.timestamp);

  return (
    <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
      {sortedEvents.map((event, index) => (
        <motion.div
          key={`${event.id}_${index}`}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-2 transition-colors duration-200 hover:bg-panel"
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.16, delay: index * 0.01 }}
        >
          <span className="font-mono text-[10px] text-muted">{formatTime(event.timestamp)}</span>
          <span className="truncate text-xs text-ink">{event.type}</span>
          <Badge tone={getEventTone(event.type)}>event</Badge>
        </motion.div>
      ))}
    </div>
  );
}

function getEventTone(type: string): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (type.includes('error') || type.includes('failed')) return 'danger';
  if (type.includes('tool')) return 'warning';
  if (type.includes('complete') || type.includes('success')) return 'success';
  return 'info';
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
