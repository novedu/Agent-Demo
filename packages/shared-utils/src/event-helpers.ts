export function createEventId(prefix: string, index: number): string {
  return `${prefix}_${String(index).padStart(4, '0')}`;
}
