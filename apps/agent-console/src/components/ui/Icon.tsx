import type { ReactNode, SVGProps } from 'react';
import { classNames } from './classNames';

type IconProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

function BaseIcon({ children, className, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={classNames('h-5 w-5 shrink-0', className)}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function AgentIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3 4.5 7.5V16.5L12 21l7.5-4.5V7.5L12 3Z" />
      <path d="M12 7v10" />
      <path d="M8.5 9.2 12 11l3.5-1.8" />
    </BaseIcon>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="7" height="7" rx="1.5" />
      <rect x="14" y="4" width="7" height="4" rx="1.5" />
      <rect x="14" y="10" width="7" height="10" rx="1.5" />
      <rect x="3" y="13" width="7" height="7" rx="1.5" />
    </BaseIcon>
  );
}

export function WorkflowIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M8 6h8" />
      <path d="M12 8.5v7" />
      <path d="M11 16l-3-3" />
      <path d="M13 16l3-3" />
    </BaseIcon>
  );
}

export function KnowledgeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3H19v16H8.5A3.5 3.5 0 0 0 5 22V6.5Z" />
      <path d="M8 7h7" />
      <path d="M8 10h7" />
      <path d="M8 13h5" />
    </BaseIcon>
  );
}

export function MemoryIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="M8 5v14" />
      <path d="M16 5v14" />
      <path d="M4 9h16" />
      <path d="M4 15h16" />
    </BaseIcon>
  );
}

export function EvaluationIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 2.7 5.8 6.3.9-4.5 4.4 1.1 6.3L12 17.7 6.4 20.4l1.1-6.3L3 9.7l6.3-.9L12 3Z" />
    </BaseIcon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.8 7.8 0 0 0 .1-1.5 7.8 7.8 0 0 0-.1-1.5l2-1.5-2-3.5-2.4 1a8.6 8.6 0 0 0-2.6-1.5L14 2h-4l-.4 2.5a8.6 8.6 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5a7.8 7.8 0 0 0-.1 1.5 7.8 7.8 0 0 0 .1 1.5l-2 1.5 2 3.5 2.4-1a8.6 8.6 0 0 0 2.6 1.5L10 22h4l.4-2.5a8.6 8.6 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5Z" />
    </BaseIcon>
  );
}

export function RuntimeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 12h4l2-7 4 14 2-7h4" />
    </BaseIcon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m9 6 6 6-6 6" />
    </BaseIcon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="5" />
      <path d="M20 20l-3.5-3.5" />
    </BaseIcon>
  );
}

export function CenterIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
    </BaseIcon>
  );
}

export function ZoomInIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="5" />
      <path d="M20 20l-3.5-3.5" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </BaseIcon>
  );
}

export function ZoomOutIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="5" />
      <path d="M20 20l-3.5-3.5" />
      <path d="M8 11h6" />
    </BaseIcon>
  );
}

export function FitViewIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 9V4h5" />
      <path d="M20 9V4h-5" />
      <path d="M4 15v5h5" />
      <path d="M20 15v5h-5" />
      <path d="M8 8 4 4" />
      <path d="M16 8 20 4" />
      <path d="M8 16 4 20" />
      <path d="M16 16 20 20" />
    </BaseIcon>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M8 5v14l11-7-11-7Z" />
    </BaseIcon>
  );
}

export function StopIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
    </BaseIcon>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" />
    </BaseIcon>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3l1.6 4.8L18 9.4l-4.4 1.6L12 16l-1.6-4.9L6 9.4l4.4-1.6L12 3Z" />
    </BaseIcon>
  );
}
