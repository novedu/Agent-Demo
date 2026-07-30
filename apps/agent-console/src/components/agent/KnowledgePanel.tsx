import type { CitationRecord } from '../../types/agent';

interface KnowledgePanelProps {
  citations: CitationRecord[];
}

export function KnowledgePanel({ citations }: KnowledgePanelProps) {
  return (
    <section className="rounded-md border border-line bg-white">
      <header className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Knowledge</h2>
        <p className="text-xs text-slate-500">Retrieved context chunks for this task</p>
      </header>
      <div className="space-y-3 p-4">
        {citations.length === 0 ? (
          <p className="text-sm text-slate-500">No knowledge retrieved yet.</p>
        ) : (
          citations.map((item) => (
            <article key={item.id} className="rounded-md border border-line bg-panel p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-xs font-semibold text-ink">{item.source}</span>
                <span className="shrink-0 rounded bg-white px-2 py-1 text-[11px] text-slate-500">
                  chunk {item.chunk ?? '-'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">{item.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
