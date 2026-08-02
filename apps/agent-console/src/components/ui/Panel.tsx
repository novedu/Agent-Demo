import type { HTMLAttributes, ReactNode } from 'react';
import { Card } from './Card';
import { classNames } from './classNames';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  footer?: ReactNode;
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  footer,
  ...props
}: PanelProps) {
  return (
    <Card className={classNames('flex min-h-0 flex-col overflow-hidden', className)} {...props}>
      {(title || description || actions) && (
        <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-4 lg:px-5">
          <div className="min-w-0">
            {title && <h2 className="truncate text-sm font-semibold leading-4 text-ink">{title}</h2>}
            {description && <p className="mt-0.5 truncate text-[10px] text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={classNames('min-h-0 flex-1 p-0', bodyClassName)}>{children}</div>
      {footer && (
        <div className="shrink-0 border-t border-line bg-white px-3 py-1.5">
          {footer}
        </div>
      )}
    </Card>
  );
}
