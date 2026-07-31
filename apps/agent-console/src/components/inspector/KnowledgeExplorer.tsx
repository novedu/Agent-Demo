import type { CitationRecord } from '../../types/agent';
import { Badge, Skeleton } from '../ui';
import { classNames } from '../ui/classNames';
import { InspectorEmpty } from './InspectorEmpty';
import { useEffect, useRef } from 'react';

interface KnowledgeExplorerProps {
  citations: CitationRecord[];
  isLoading: boolean;
  highlightedCitationId?: string;
  onSelectCitation?: (citation: CitationRecord) => void;
}

export function KnowledgeExplorer({
  citations,
  isLoading,
  highlightedCitationId,
  onSelectCitation,
}: KnowledgeExplorerProps) {
  const highlightedRef = useRef<HTMLElement>(null);

  useEffect(() => {
    highlightedRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [highlightedCitationId]);

  if (isLoading && citations.length === 0) return <Skeleton lines={7} />;
  if (citations.length === 0) {
    return <InspectorEmpty title="No retrieved chunks" description="RAG sources appear after retrieval." />;
  }

  return (
    <div className="space-y-2">
      {citations.map((citation) => (
        <article
          key={citation.id}
          ref={citation.id === highlightedCitationId ? highlightedRef : undefined}
          onClick={() => onSelectCitation?.(citation)}
          className={classNames(
            'cursor-pointer rounded-xl border bg-white p-3 transition-colors duration-200 hover:border-amber-200 hover:bg-amber-50/50',
            citation.id === highlightedCitationId
              ? 'border-amber-300 bg-amber-50 shadow-[0_0_0_2px_rgba(217,119,6,0.12)]'
              : 'border-line',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                Knowledge Reference
              </div>
              <div className="mt-1 truncate text-xs font-semibold text-ink">{citation.source}</div>
            </div>
            <Badge tone="success">
              {citation.score === undefined ? 'score -' : `score ${citation.score.toFixed(2)}`}
            </Badge>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
            <span>Chunk {citation.chunk ?? '-'}</span>
            <span>Jump</span>
          </div>
          <p className="mt-2 line-clamp-4 rounded-lg border border-line bg-panel p-3 text-xs leading-5 text-muted">
            {citation.content}
          </p>
        </article>
      ))}
    </div>
  );
}
