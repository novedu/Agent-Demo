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

  return (
    <div className="flex h-screen min-w-0 flex-col bg-[var(--studio-bg)] text-ink">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <footer className="flex h-8 shrink-0 items-center justify-between border-t border-line bg-white px-4 text-xs text-muted">
        <span>Runtime status: {status}</span>
        <span>
          Events {events} | Tool calls {tools} | SSE ready
        </span>
      </footer>
    </div>
  );
}
