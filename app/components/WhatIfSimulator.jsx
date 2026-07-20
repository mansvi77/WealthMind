'use client';
import { useState } from 'react';

export default function WhatIfSimulator() {
  const [monthlyExpense, setMonthlyExpense] = useState(7500);
  const [reductionPercent, setReductionPercent] = useState(50);
  const [years, setYears] = useState(20);
  const returnRate = 0.12; // 12% annual CAGR

  const monthlySavings = monthlyExpense * (reductionPercent / 100);
  const annualSavings = monthlySavings * 12;

  // Compound Interest Calculation (Future Value of Annuity)
  const monthlyRate = returnRate / 12;
  const totalMonths = years * 12;
  const futureValue = monthlySavings > 0
    ? monthlySavings * (((1 + monthlyRate) ** totalMonths - 1) / monthlyRate)
    : 0;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-500/30 space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xl">🚀</span>
          <h3 className="font-extrabold text-lg tracking-tight">Smart "What If" Simulator</h3>
        </div>
        <p className="text-xs text-indigo-200 mt-1">
          Simulate how curbing discretionary spend creates generational wealth via compound interest.
        </p>
      </div>

      {/* Interactive Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
        <div>
          <label className="text-xs text-indigo-300 font-semibold block mb-1">
            Monthly Discretionary Expense: ₹{monthlyExpense.toLocaleString()}
          </label>
          <input
            type="range"
            min="1000"
            max="30000"
            step="500"
            value={monthlyExpense}
            onChange={(e) => setMonthlyExpense(Number(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs text-indigo-300 font-semibold block mb-1">
            Cut Spend By: {reductionPercent}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={reductionPercent}
            onChange={(e) => setReductionPercent(Number(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Simulation Results Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-indigo-950/80 p-3.5 rounded-xl border border-indigo-800/50">
          <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Monthly Savings</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">₹{monthlySavings.toLocaleString()}</p>
        </div>

        <div className="bg-indigo-950/80 p-3.5 rounded-xl border border-indigo-800/50">
          <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Annual Capital Retained</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">₹{annualSavings.toLocaleString()}</p>
        </div>

        <div className="bg-indigo-950/80 p-3.5 rounded-xl border border-indigo-500/50">
          <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Invested @ 12% ({years} Yrs)</p>
          <p className="text-xl font-extrabold text-indigo-300 mt-1">
            ≈ ₹{(futureValue / 100000).toFixed(2)} Lakhs
          </p>
        </div>
      </div>
    </div>
  );
}