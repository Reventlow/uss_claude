/**
 * Calculate a TNG-era stardate from a JavaScript Date.
 *
 * TNG stardates are roughly: 41000 + (year - 2364) * 1000 + dayFraction * 1000
 * We adapt this for fun: base year 2026 maps to stardate 80000.
 */
export function calculateStardate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1).getTime();
  const endOfYear = new Date(year + 1, 0, 1).getTime();
  const yearProgress = (date.getTime() - startOfYear) / (endOfYear - startOfYear);

  const baseStardate = 80000 + (year - 2026) * 1000;
  const stardate = baseStardate + yearProgress * 1000;

  return stardate.toFixed(1);
}
