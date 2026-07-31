import { useEffect, useState } from 'react';
import { Button, RuntimeIcon, SearchIcon, SparkIcon, StatusTag } from '@console/components/ui';
import { useAgentStore } from '@console/store/agentStore';

export function TopBar() {
  const status = useAgentStore((state) => state.status);
  const events = useAgentStore((state) => state.events.length);
  const currentStep = useAgentStore((state) => state.state?.currentStepId);
  const currentTask = useAgentStore(
    (state) => [...state.messages].reverse().find((message) => message.role === 'user')?.content,
  );
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-900 bg-slate-950 text-white">
          <RuntimeIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold leading-5 text-ink">Agent Studio</div>
          <div className="truncate text-xs text-muted">IDE-like Runtime Console</div>
        </div>
        <div className="hidden h-8 items-center gap-2 rounded-full border border-line bg-panel px-3 text-xs text-muted lg:flex">
          <SparkIcon className="h-4 w-4 text-accent" />
          <span className="font-medium text-ink">Runtime alive</span>
          <span className="text-muted">·</span>
          <span className="max-w-[280px] truncate">{currentStep ? `Step: ${currentStep}` : 'Waiting for task'}</span>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden h-9 min-w-[280px] items-center gap-2 rounded-lg border border-line bg-panel px-3 text-xs text-muted xl:flex">
          <SearchIcon className="h-4 w-4" />
          Jump to steps, traces, memory, evidence
        </div>
        <div className="hidden items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-muted md:flex">
          <span>Environment</span>
          <span className="font-mono font-medium text-ink">local</span>
        </div>
        <StatusTag status={status} />
        <span className="hidden font-mono text-xs text-muted lg:inline">{events} events</span>
        <span className="hidden max-w-[220px] truncate font-mono text-xs text-muted xl:inline">
          {currentTask ?? 'No running task'}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setIsDark((value) => !value)}>
          {isDark ? 'Light' : 'Dark'}
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel text-xs font-semibold text-ink">
          RJ
        </div>
      </div>
    </header>
  );
}
