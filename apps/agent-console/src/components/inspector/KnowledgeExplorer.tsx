import type { CitationRecord } from '../../types/agent';
import { Badge, Skeleton } from '../ui';
import { InspectorEmpty } from './InspectorEmpty';

interface KnowledgeExplorerProps {
  citations: CitationRecord[];
  isLoading: boolean;
}

export function KnowledgeExplorer({ citations, isLoading }: KnowledgeExplorerProps) {
  if (isLoading && citations.length === 0) return <Skeleton lines={7} />;
  if (citations.length === 0) {
    return <InspectorEmpty title="No retrieved chunks" description="RAG sources appear after retrieval." />;
  }

  return (
    <div className="space-y-2">
      {citations.map((citation) => (
        <article
          key={citation.id}
          className="rounded-md border border-line bg-panel p-3 transition-colors duration-200 hover:border-lineStrong hover:bg-white"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                Source
              </div>
              <div className="mt-1 truncate text-xs font-semibold text-ink">{citation.source}</div>
            </div>
            <Badge tone="success">
              {citation.score === undefined ? 'score -' : `score ${citation.score.toFixed(2)}`}
            </Badge>
          </div>
          <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
            Chunk {citation.chunk ?? '-'}
          </div>
          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-[11px] leading-5 text-slate-100">
            {citation.content}
          </pre>
        </article>
      ))}
    </div>
  );
}
