import { normalizeDescription } from './categorizationEngine';

function calculateStandardDeviation(values, mean) {
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function detectRecurringPatterns(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const groups = {};

  expenses.forEach(t => {
    const key = normalizeDescription(t.description || t.merchant);
    if (!key) return;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  const patterns = [];

  for (const [merchant, txns] of Object.entries(groups)) {
    if (txns.length < 3) continue;

    const sortedTxns = [...txns].sort((a, b) => new Date(a.transaction_date || a.date) - new Date(b.transaction_date || b.date));
    const gaps = [];
    let totalAmount = 0;

    for (let i = 1; i < sortedTxns.length; i++) {
      const diffTime = Math.abs(new Date(sortedTxns[i].transaction_date || sortedTxns[i].date) - new Date(sortedTxns[i - 1].transaction_date || sortedTxns[i - 1].date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      gaps.push(diffDays);
      totalAmount += parseFloat(sortedTxns[i - 1].amount);
    }
    totalAmount += parseFloat(sortedTxns[sortedTxns.length - 1].amount);

    const avgAmount = totalAmount / sortedTxns.length;
    const avgGap = gaps.reduce((acc, g) => acc + g, 0) / gaps.length;
    const stdDev = calculateStandardDeviation(gaps, avgGap);

    if (stdDev > 3.5) continue;

    let intervalDays = Math.round(avgGap);
    if (Math.abs(intervalDays - 7) <= 2) intervalDays = 7;
    else if (Math.abs(intervalDays - 14) <= 2) intervalDays = 14;
    else if (Math.abs(intervalDays - 30) <= 4) intervalDays = 30;
    else if (Math.abs(intervalDays - 365) <= 10) intervalDays = 365;

    const confidenceScore = parseFloat((1 - (stdDev / (avgGap || 1))).toFixed(2));

    patterns.push({
      merchant_pattern: merchant,
      avg_amount: parseFloat(avgAmount.toFixed(2)),
      interval_days: intervalDays,
      last_seen: sortedTxns[sortedTxns.length - 1].transaction_date || sortedTxns[sortedTxns.length - 1].date,
      confidence_score: Math.min(Math.max(confidenceScore, 0), 1)
    });
  }

  return patterns;
}