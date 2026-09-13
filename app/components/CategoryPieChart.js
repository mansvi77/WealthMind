'use client';

export default function CategoryPieChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + parseFloat(item.value || 0), 0);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-200 tracking-tight">Category Breakdown</h3>
      {data.length === 0 ? (
        <p className="text-xs text-slate-400">No category distribution data available.</p>
      ) : (
        <div className="space-y-3">
          {data.map((item, idx) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>{item.name || 'General'}</span>
                  <span>₹{item.value.toLocaleString()} ({percentage}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}