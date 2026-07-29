import type { CitationRecord } from '../../types/agent';

interface CitationPanelProps {
  citations: CitationRecord[];
}

export function CitationPanel({ citations }: CitationPanelProps) {
  return (
    <section className="rounded-md border border-line bg-white">
      <header className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Citation</h2>
        <p className="text-xs text-slate-500">RAG source metadata</p>
      </header>
      <div className="space-y-3 p-4">
        {citations.length === 0 ? (
          <p className="text-sm text-slate-500">No RAG citations yet.</p>
        ) : (
          citations.map((citation) => (
            <article key={citation.id} className="rounded-md border border-line p-3">
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">来源</dt>
                  <dd className="text-right font-medium text-ink">{citation.source}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">chunk</dt>
                  <dd className="font-mono text-ink">{citation.chunk ?? '-'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">score</dt>
                  <dd className="font-mono text-ink">{citation.score ?? '-'}</dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
