import type { HTMLAttributes } from 'react';
import { classNames } from './classNames';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function Skeleton({ className, lines = 3, ...props }: SkeletonProps) {
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
