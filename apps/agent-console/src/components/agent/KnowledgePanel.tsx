import type { CitationRecord } from '../../types/agent';
import { Badge, Panel } from '../ui';

interface KnowledgePanelProps {
  citations: CitationRecord[];
}

export function KnowledgePanel({ citations }: KnowledgePanelProps) {
  return (
    <Panel title="Knowledge" description="Retrieved context chunks for this task">
      <div className="space-y-3">
        {citations.length === 0 ? (
          <p className="text-sm text-muted">No knowledge retrieved yet.</p>
        ) : (
          citations.map((item) => (
            <article key={item.id} className="rounded-md border border-line bg-panel p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-xs font-semibold text-ink">{item.source}</span>
                <Badge>chunk {item.chunk ?? '-'}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">{item.content}</p>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}
