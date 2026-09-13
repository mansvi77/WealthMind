export function calculateDrift(transactions = []) {
  if (!transactions || transactions.length === 0) return [];

  const categoryMonthlyMap = {};

  transactions.forEach(t => {
    const amt = Number(t.amount);
    const dateStr = t.transaction_date || t.date;
    if (isNaN(amt) || amt <= 0 || !dateStr) return;

    const category = t.category || 'Uncategorized';
    const month = dateStr.slice(0, 7);

    if (!categoryMonthlyMap[category]) {
      categoryMonthlyMap[category] = {};
    }
    categoryMonthlyMap[category][month] = (categoryMonthlyMap[category][month] || 0) + amt;
  });

  const results = [];

  Object.entries(categoryMonthlyMap).forEach(([category, monthsMap]) => {
    const sortedMonths = Object.keys(monthsMap).sort();
    const monthlyValues = sortedMonths.map(m => monthsMap[m]);

    if (monthlyValues.length < 2) return;

    const n = monthlyValues.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = monthlyValues.reduce((a, b) => a + b, 0);
    const xySum = monthlyValues.reduce((sum, y, x) => sum + x * y, 0);
    const xSqSum = (n * (n - 1) * (2 * n - 1)) / 6;

    const denominator = n * xSqSum - xSum * xSum;
    const slope = denominator !== 0 ? (n * xySum - xSum * ySum) / denominator : 0;

    const baselineMean = ySum / n;
    const recentSpend = monthlyValues[monthlyValues.length - 1];
    const percentageChange = baselineMean !== 0 ? ((recentSpend - baselineMean) / baselineMean) * 100 : 0;

    results.push({
      category,
      monthsTracked: n,
      monthlyValues,
      baselineMean: parseFloat(baselineMean.toFixed(2)),
      recentSpend: parseFloat(recentSpend.toFixed(2)),
      slope: parseFloat(slope.toFixed(2)),
      percentageChange: parseFloat(percentageChange.toFixed(2)),
      isCreeping: slope > 0 && percentageChange > 15
    });
  });

  return results.sort((a, b) => b.slope - a.slope);
}