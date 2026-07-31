import type { ComponentType, SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AgentIcon,
  DashboardIcon,
  EvaluationIcon,
  KnowledgeIcon,
  MemoryIcon,
  SettingsIcon,
  WorkflowIcon,
} from '@console/components/ui';
import { classNames } from '@console/components/ui/classNames';

interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const navigation: NavItem[] = [
  { label: 'Agent', path: '/agent', icon: AgentIcon },
  { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { label: 'Knowledge', path: '/knowledge', icon: KnowledgeIcon },
  { label: 'Memory', path: '/memory', icon: MemoryIcon },
  { label: 'Evaluation', path: '/evaluation', icon: EvaluationIcon },
  { label: 'Workflow', path: '/workflow', icon: WorkflowIcon },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
];

export function Sidebar() {
  return (
    <aside className="flex min-h-0 w-[72px] shrink-0 flex-col overflow-hidden border-r border-line bg-white xl:w-[220px]">
      <div className="flex h-14 shrink-0 items-center border-b border-line px-4">
        <div className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-muted xl:block">
          Runtime
        </div>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} end={item.path === '/agent'}>
              {({ isActive }) => (
                <div
                  className={classNames(
                    'flex h-10 cursor-pointer items-center justify-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-200 xl:justify-start',
                    isActive
                      ? 'border border-blue-200 bg-blue-50 text-blue-700'
                      : 'border border-transparent text-muted hover:border-line hover:bg-panel hover:text-ink',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden truncate xl:inline">{item.label}</span>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="hidden border-t border-line p-4 xl:block">
        <div className="rounded-xl border border-line bg-panel p-3">
          <div className="text-xs font-semibold text-ink">Agent Studio 2.0</div>
          <p className="mt-1 text-xs leading-5 text-muted">Runtime-first debugging workspace.</p>
        </div>
      </div>
    </aside>
  );
}
