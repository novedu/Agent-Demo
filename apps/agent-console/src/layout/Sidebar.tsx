import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { classNames } from '@console/components/ui/classNames';

const navigation = [
  { label: 'Dashboard', path: '/', mark: 'DA' },
  { label: 'Agent Workspace', path: '/agent', mark: 'AG' },
  { label: 'Workflow', path: '/workflow', mark: 'WF' },
  { label: 'Knowledge', path: '/knowledge', mark: 'KG' },
  { label: 'Memory', path: '/memory', mark: 'MM' },
  { label: 'Evaluation', path: '/evaluation', mark: 'EV' },
  { label: 'Settings', path: '/settings', mark: 'ST' },
];

export function Sidebar() {
  return (
    <aside className="flex min-h-0 w-64 shrink-0 flex-col border-r border-line bg-slate-950 text-slate-200">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Studio Menu
        </div>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={classNames(
                  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200',
                  isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
                )}
              >
                <span
                  className={classNames(
                    'flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold',
                    isActive ? 'bg-slate-950 text-white' : 'bg-white/10 text-slate-300',
                  )}
                >
                  {item.mark}
                </span>
                <span>{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3 text-xs text-slate-400">
        Agent Runtime connected through SSE
      </div>
    </aside>
  );
}
