import type { HTMLAttributes, ReactNode } from 'react';
import { classNames } from './classNames';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

const toneClass = {
  neutral: 'bg-slate-100 text-slate-600',
  info: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
};

export function Badge({ children, className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-md px-2 py-1 text-[11px] font-medium',
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
