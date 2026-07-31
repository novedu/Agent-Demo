import type { HTMLAttributes, ReactNode } from 'react';
import { Card } from './Card';
import { classNames } from './classNames';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  ...props
}: PanelProps) {
  return (
    <Card className={classNames('flex min-h-0 flex-col overflow-hidden', className)} {...props}>
      {(title || description || actions) && (
        <header className="flex min-h-12 shrink-0 items-center justify-between gap-4 border-b border-line px-5">
          <div className="min-w-0">
            {title && <h2 className="truncate text-lg font-semibold leading-5 text-ink">{title}</h2>}
            {description && <p className="mt-0.5 truncate text-xs text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={classNames('min-h-0 flex-1 p-5', bodyClassName)}>{children}</div>
    </Card>
  );
}
