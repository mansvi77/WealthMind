export function calculateAnomalies(transactions = []) {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  const amounts = transactions.map((t) => Number(t.amount) || 0);
  const mean = amounts.reduce((acc, val) => acc + val, 0) / amounts.length;
  
  const variance = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  const anomalies = [];
  transactions.forEach((t) => {
    const amt = Number(t.amount) || 0;
    const zScore = (amt - mean) / stdDev;
    if (Math.abs(zScore) > 2) {
      anomalies.push({
        ...t,
        zScore: Number(zScore.toFixed(2)),
      });
    }
  });

  return anomalies;
}

// Alias to satisfy any import expecting calculateZScoreAnomalies
export const calculateZScoreAnomalies = calculateAnomalies;