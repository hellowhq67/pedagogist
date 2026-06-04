// Convert a raw 0-100 AI score into the PTE-style XX/90 scale shown in screenshots.
export function toPteScale(raw: number | null | undefined): number {
  if (!raw && raw !== 0) return 0;
  return Math.round((Math.max(0, Math.min(100, raw)) / 100) * 90);
}
