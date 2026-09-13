'use client';

import { useMemo } from 'react';
import { Flame } from 'lucide-react';

export default function WealthLeakHeatmap({ categoryMap = {} }) {
  const categories = useMemo(() => {
    const entries = Object.entries(categoryMap);
    if (entries.length === 0) return [];
    
    const maxAmount = Math.max(...entries.map(([_, amt]) => amt), 1);

    return entries
      .map(([name, amount]) => ({
        name,
        amount,
        intensity: amount / maxAmount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [categoryMap]);

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm">
        No expense category data available for intensity mapping.
      </div>
    );
  }

  const getIntensityColor = (intensity) => {
    if (intensity > 0.75) return 'bg-rose-600/20 border-rose-500/40 text-rose-300';
    if (intensity > 0.4) return 'bg-amber-600/20 border-amber-500/40 text-amber-300';
    if (intensity > 0.15) return 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300';
    return 'bg-slate-800/60 border-slate-700/50 text-slate-300';
  };

  const getBadgeColor = (intensity) => {
    if (intensity > 0.75) return 'bg-rose-500 text-white';
    if (intensity > 0.4) return 'bg-amber-500 text-slate-950';
    if (intensity > 0.15) return 'bg-indigo-500 text-white';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-rose-400">
          <Flame className="w-4 h-4" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Relative Spending Intensity</span>
        </div>
        <span className="text-[11px] text-slate-500">{categories.length} Categories Analyzed</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between shadow-sm ${getIntensityColor(
              cat.intensity
            )}`}
          >
            <div className="space-y-1">
              <span className="text-sm font-semibold tracking-tight text-slate-200 block">{cat.name}</span>
              <span className="text-xs font-bold text-slate-100">₹{cat.amount.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getBadgeColor(cat.intensity)}`}>
                {Math.round(cat.intensity * 100)}% Intensity
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}