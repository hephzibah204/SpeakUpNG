/** Composite 0-100 "Political DNA Score" from category rating averages (each 0-5). */
export function computeDnaScore(record: Record<string, any>, visibleKeys: string[]): number {
  const values = visibleKeys
    .map(key => parseFloat(record[`${key}_avg`]))
    .filter(v => !isNaN(v) && v > 0);

  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round((avg / 5) * 100);
}

export function dnaScoreBand(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: '#00b368' };
  if (score >= 60) return { label: 'Good', color: '#7bc96f' };
  if (score >= 40) return { label: 'Average', color: '#e8a020' };
  if (score >= 20) return { label: 'Weak', color: '#e87720' };
  return { label: 'Poor', color: '#e57368' };
}
