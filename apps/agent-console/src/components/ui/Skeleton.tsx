import type { HTMLAttributes } from 'react';
import { classNames } from './classNames';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
  variant?: 'text' | 'card' | 'timeline';
}

export function Skeleton({ className, lines = 3, variant = 'text', ...props }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={classNames('space-y-3 rounded-xl border border-line bg-white p-4', className)} {...props}>
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-slate-100" />
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={classNames(
              'h-10 animate-pulse rounded-lg bg-slate-100',
              index === lines - 1 ? 'w-3/4' : 'w-full',
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className={classNames('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="grid grid-cols-[80px_1fr_90px] gap-3 rounded-lg border border-line bg-white p-3">
            <div className="h-3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={classNames('space-y-3', className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={classNames(
            'h-3 animate-pulse rounded-md bg-slate-100',
            index === lines - 1 ? 'w-2/3' : 'w-full',
          )}
        />
      ))}
    </div>
  );
}
