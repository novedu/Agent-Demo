export const shadow = {
  sm: '0 1px 2px rgb(15 23 42 / 0.05)',
  md: '0 8px 20px rgb(15 23 42 / 0.06)',
  lg: '0 14px 36px rgb(15 23 42 / 0.08)',
} as const;

export type ShadowToken = keyof typeof shadow;
