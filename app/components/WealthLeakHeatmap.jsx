'use client';

export default function WealthLeakHeatmap({ categoryMap = {} }) {
  const categories = Object.entries(categoryMap)
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  const maxAmount = categories.length > 0 ? categories[0][1] : 1;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
      <div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
          🔥 Wealth Leak Heatmap
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Identifies high-volume expenditure channels draining net capital.
        </p>
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No spend leaks identified.</p>
        ) : (
          categories.map(([category, amount]) => {
            const ratio = amount / maxAmount;
            
            // Color thresholds
            let barColor = 'bg-emerald-500';
            let badgeText = 'Healthy';
            let badgeColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50';

            if (ratio > 0.6) {
              barColor = 'bg-rose-500';
              badgeText = 'Dangerous';
              badgeColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/50';
            } else if (ratio > 0.3) {
              barColor = 'bg-amber-500';
              badgeText = 'Moderate';
              badgeColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/50';
            }

            return (
              <div key={category} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-500 dark:text-slate-400">₹{amount.toLocaleString()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.max(ratio * 100, 5)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}