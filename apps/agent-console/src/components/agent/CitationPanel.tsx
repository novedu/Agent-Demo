import type { CitationRecord } from '../../types/agent';
import { Panel } from '../ui';

interface CitationPanelProps {
  citations: CitationRecord[];
}

export function CitationPanel({ citations }: CitationPanelProps) {
  return (
    <Panel title="Citation" description="RAG source metadata">
      <div className="space-y-3">
        {citations.length === 0 ? (
          <p className="text-sm text-muted">No RAG citations yet.</p>
        ) : (
          citations.map((citation) => (
            <article key={citation.id} className="rounded-md border border-line p-3">
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">source</dt>
                  <dd className="text-right font-medium text-ink">{citation.source}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">chunk</dt>
                  <dd className="font-mono text-ink">{citation.chunk ?? '-'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">score</dt>
                  <dd className="font-mono text-ink">{citation.score ?? '-'}</dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}
