import type { HTMLAttributes, ReactNode } from 'react';
import { classNames } from './classNames';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({ children, className, interactive, ...props }: CardProps) {
  return (
    <div
      className={classNames(
        'rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        interactive &&
          'cursor-pointer transition-colors duration-200 hover:border-lineStrong hover:bg-panel',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
