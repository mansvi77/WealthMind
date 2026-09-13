export function runMonteCarlo({
  currentSavings = 0,
  monthlyInflow = 0,
  monthlyOutflow = 0,
  volatility = 0.15,
  months = 12,
  runs = 1000,
}) {
  let survivalCount = 0;
  const simulationPaths = [];

  const randomNormal = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  for (let r = 0; r < runs; r++) {
    let balance = currentSavings;
    const path = [balance];
    let survived = true;

    for (let m = 1; m <= months; m++) {
      const noise = randomNormal() * (monthlyOutflow * volatility);
      const simulatedOutflow = Math.max(0, monthlyOutflow + noise);

      balance += monthlyInflow - simulatedOutflow;
      path.push(parseFloat(balance.toFixed(2)));

      if (balance <= 0 && survived) {
        survived = false;
      }
    }

    if (survived) survivalCount++;
    if (r < 10) simulationPaths.push(path);
  }

  const survivalProbability = (survivalCount / runs) * 100;

  return {
    runs,
    months,
    survivalProbability: parseFloat(survivalProbability.toFixed(1)),
    failedRuns: runs - survivalCount,
    samplePaths: simulationPaths,
  };
}