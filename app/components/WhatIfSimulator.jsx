'use client';

import { useState } from 'react';
import { SlidersHorizontal, ArrowUpRight } from 'lucide-react';

export default function WhatIfSimulator() {
  const [monthlyDiscretionary, setMonthlyDiscretionary] = useState(15000);
  const [reductionPercent, setReductionPercent] = useState(20);
  const [years, setYears] = useState(5);
  const [assumedReturnRate, setAssumedReturnRate] = useState(8);

  const monthlySavings = (monthlyDiscretionary * (reductionPercent / 100));
  const annualSavings = monthlySavings * 12;

  // Future value of a monthly annuity formula: FV = P * [((1 + r/12)^(n*12) - 1) / (r/12)]
  const calculateFutureValue = () => {
    const r = assumedReturnRate / 100;
    const months = years * 12;
    const monthlyRate = r / 12;
    let fv = 0;
    for (let i = 0; i < months; i++) {
      fv = (fv + monthlySavings) * (1 + monthlyRate);
    }
    return Math.round(fv);
  };

  const projectedTotal = calculateFutureValue();
  const totalContributed = Math.round(annualSavings * years);
  const estimatedInterest = Math.max(0, projectedTotal - totalContributed);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">
              Current Monthly Discretionary Spend (₹): <span className="text-slate-100 font-semibold">{monthlyDiscretionary.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="2000"
              max="100000"
              step="1000"
              value={monthlyDiscretionary}
              onChange={(e) => setMonthlyDiscretionary(Number(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">
              Target Reduction Percentage: <span className="text-indigo-400 font-semibold">{reductionPercent}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={reductionPercent}
              onChange={(e) => setReductionPercent(Number(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">
              Investment Horizon: <span className="text-slate-100 font-semibold">{years} Years</span>
            </label>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-600 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">
              Illustrative Annual Return Rate: <span className="text-cyan-400 font-semibold">{assumedReturnRate}%</span>
            </label>
            <input
              type="range"
              min="4"
              max="18"
              step="1"
              value={assumedReturnRate}
              onChange={(e) => setAssumedReturnRate(Number(e.target.value))}
              className="w-full accent-cyan-600 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Illustrative Projection</span>
            <div className="mt-2">
              <h3 className="text-3xl font-bold text-emerald-400">₹{projectedTotal.toLocaleString()}</h3>
              <p className="text-xs text-slate-400 mt-1">
                By cutting discretionary spending by <span className="text-indigo-400 font-semibold">{reductionPercent}%</span> (₹{Math.round(monthlySavings).toLocaleString()}/month) over {years} years.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Total Capital Contributed:</span>
              <span className="font-semibold">₹{totalContributed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Estimated Compounded Returns:</span>
              <span className="font-semibold text-cyan-400">₹{estimatedInterest.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
            * Note: Return rates are illustrative projections and not guaranteed financial returns.
          </div>
        </div>
      </div>
    </div>
  );
}