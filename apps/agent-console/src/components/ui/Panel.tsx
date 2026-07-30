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
    <Card className={classNames('overflow-hidden', className)} {...props}>
      {(title || description || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={classNames('p-4', bodyClassName)}>{children}</div>
    </Card>
  );
}
