import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from './classNames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

const variantClass = {
  primary: 'border-accent bg-accent text-white hover:bg-blue-700 focus:ring-accent/20',
  secondary: 'border-line bg-white text-ink hover:border-lineStrong hover:bg-panel focus:ring-slate-200',
  ghost:
    'border-transparent bg-transparent text-muted hover:bg-slate-100 hover:text-ink focus:ring-slate-200',
};

const sizeClass = {
  sm: 'h-10 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
};

export function Button({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:border-line disabled:bg-slate-100 disabled:text-slate-400',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
