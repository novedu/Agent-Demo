import type { ReactNode } from 'react';
import { Badge, Card } from '../ui';

interface InspectorSectionProps {
  title: string;
  eyebrow: string;
  badge?: ReactNode;
  children: ReactNode;
}

export function InspectorSection({ title, eyebrow, badge, children }: InspectorSectionProps) {
  return (
    <Card className="border-line bg-white">
      <header className="flex items-start justify-between gap-3 border-b border-line px-3 py-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            {eyebrow}
          </div>
          <h3 className="mt-1 truncate text-sm font-semibold text-ink">{title}</h3>
        </div>
        {badge ?? <Badge>Inspector</Badge>}
      </header>
      <div className="p-3">{children}</div>
    </Card>
  );
}
