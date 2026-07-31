export const radius = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1rem',
  full: '9999px',
} as const;

export type RadiusToken = keyof typeof radius;
