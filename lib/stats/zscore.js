export function calculateAnomalies(transactions = [], threshold = 1.8) {
  if (!transactions || transactions.length === 0) return [];

  const amounts = transactions
    .map(t => Number(t.amount))
    .filter(amt => !isNaN(amt) && amt > 0);

  if (amounts.length < 2) return [];

  const sum = amounts.reduce((acc, val) => acc + val, 0);
  const mean = sum / amounts.length;

  const variance = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (amounts.length - 1);
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  return transactions
    .filter(t => Number(t.amount) > 0)
    .map(t => {
      const amt = Number(t.amount);
      const zScore = (amt - mean) / stdDev;
      return {
        ...t,
        zScore: parseFloat(zScore.toFixed(2)),
        mean: parseFloat(mean.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2))
      };
    })
    .filter(t => t.zScore >= threshold)
    .sort((a, b) => b.zScore - a.zScore);
}