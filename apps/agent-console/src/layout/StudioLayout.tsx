import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { useAgentStore } from '@console/store/agentStore';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function StudioLayout() {
  const location = useLocation();
  const status = useAgentStore((state) => state.status);
  const events = useAgentStore((state) => state.events.length);
  const tools = useAgentStore((state) => state.tools.length);
  const plan = useAgentStore((state) => state.plan);

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-[var(--studio-bg)] text-ink">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar />
          <main className="min-h-0 min-w-0 flex-1 overflow-hidden p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="h-full min-h-0 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <footer className="flex h-9 shrink-0 items-center justify-between border-t border-line bg-white px-5 text-[11px] text-muted">
          <span className="font-medium text-ink">Runtime status: {status}</span>
          <span>
            Events {events} · Tool calls {tools} · Plan {plan?.steps.length ?? 0} · SSE ready
          </span>
        </footer>
      </div>
    </div>
  );
}
