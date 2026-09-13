export function detectRecurringPatterns(transactions) {
  const recurringMap = {};

  transactions.forEach((t) => {
    if (t.type === 'expense') {
      const key = `${t.category}_${t.amount}`;
      if (!recurringMap[key]) {
        recurringMap[key] = [];
      }
      recurringMap[key].push(new Date(t.date));
    }
  });

  const patterns = [];
  Object.entries(recurringMap).forEach(([key, dates]) => {
    if (dates.length >= 2) {
      const [category, amount] = key.split('_');
      patterns.push({
        category,
        amount: Number(amount),
        frequency: 'Monthly',
        count: dates.length,
      });
    }
  });

  return patterns;
}

export const detectRecurring = detectRecurringPatterns;