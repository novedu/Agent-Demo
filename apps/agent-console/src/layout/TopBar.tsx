import { useEffect, useState } from 'react';
import { Button, Divider, StatusTag } from '@console/components/ui';
import { useAgentStore } from '@console/store/agentStore';

export function TopBar() {
  const status = useAgentStore((state) => state.status);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold text-white">
          AS
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">Agent Studio</div>
          <div className="text-xs text-muted">Enterprise AI Runtime Workspace</div>
        </div>
        <Divider orientation="vertical" className="mx-1 h-7" />
        <div className="hidden text-xs text-muted md:block">Environment: Local Dev</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 md:flex">
          <span className="text-xs text-muted">Runtime</span>
          <StatusTag status={status} />
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsDark((value) => !value)}>
          {isDark ? 'Light' : 'Dark'}
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel text-xs font-semibold text-ink">
          RW
        </div>
      </div>
    </header>
  );
}
