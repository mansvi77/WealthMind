import { normalizeDescription } from './categorizationEngine';

function calculateStandardDeviation(values, mean) {
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function detectRecurringPatterns(transactions) {
  // Only look at expenses
  const expenses = transactions.filter(t => t.type === 'expense');

  // Step 1: Group transactions by their cleaned up description
  const groups = {};
  expenses.forEach(t => {
    const key = normalizeDescription(t.description);
    if (!key) return;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  const patterns = [];

  // Step 2: Analyze the days between transactions for each group
  for (const [merchant, txns] of Object.entries(groups)) {
    if (txns.length < 3) continue; // Needs at least 3 occurrences to find a pattern

    // Sort from oldest to newest
    const sortedTxns = [...txns].sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

    const gaps = [];
    let totalAmount = 0;
    
    for (let i = 1; i < sortedTxns.length; i++) {
      const diffTime = Math.abs(new Date(sortedTxns[i].transaction_date) - new Date(sortedTxns[i - 1].transaction_date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      gaps.push(diffDays);
      totalAmount += parseFloat(sortedTxns[i - 1].amount);
    }
    totalAmount += parseFloat(sortedTxns[sortedTxns.length - 1].amount);

    const avgAmount = totalAmount / sortedTxns.length;
    const avgGap = gaps.reduce((acc, g) => acc + g, 0) / gaps.length;
    const stdDev = calculateStandardDeviation(gaps, avgGap);

    // Consistency check: lower standard deviation means a more predictable schedule
    const threshold = 3.5; 
    let confidenceScore = 0;

    if (stdDev <= threshold) {
      confidenceScore = 1 - (stdDev / (avgGap || 1));
    } else {
      continue; // Gaps are too random to be a subscription
    }

    // Snap the average gap to standard billing cycles
    let intervalDays = Math.round(avgGap);
    if (Math.abs(intervalDays - 7) <= 2) intervalDays = 7;
    else if (Math.abs(intervalDays - 14) <= 2) intervalDays = 14;
    else if (Math.abs(intervalDays - 30) <= 4) intervalDays = 30;
    else if (Math.abs(intervalDays - 365) <= 10) intervalDays = 365;

    patterns.push({
      merchant_pattern: merchant,
      avg_amount: parseFloat(avgAmount.toFixed(2)),
      interval_days: intervalDays,
      last_seen: sortedTxns[sortedTxns.length - 1].transaction_date,
      confidence_score: parseFloat(Math.min(Math.max(confidenceScore, 0), 1).toFixed(2))
    });
  }

  return patterns;
}