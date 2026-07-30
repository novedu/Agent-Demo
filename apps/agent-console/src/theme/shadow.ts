export const shadow = {
  sm: '0 1px 2px rgb(15 23 42 / 0.06)',
  md: '0 10px 24px rgb(15 23 42 / 0.08)',
  lg: '0 18px 44px rgb(15 23 42 / 0.12)',
} as const;

export type ShadowToken = keyof typeof shadow;
