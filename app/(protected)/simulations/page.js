'use client';

import { useState } from 'react';
import { Sparkles, ShieldAlert } from 'lucide-react';

export default function MonteCarloPage() {
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runSimulation = async () => {
    setSimulating(true);
    setError(null);
    try {
      // Calls the exact nested endpoint matching your folder structure
      const response = await fetch('/api/embed/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute simulation');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monte Carlo Risk Simulator</h1>
        <p className="text-xs text-slate-400 mt-1">Stochastic financial modeling driven by your real transaction history.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-base font-semibold text-slate-200">Probability Engine (1,000 Iterations)</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          This module extracts your baseline savings and cash flow patterns to simulate 1,000 distinct financial futures using Gaussian random walks.
        </p>

        <button
          onClick={runSimulation}
          disabled={simulating}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg transition disabled:opacity-50"
        >
          {simulating ? 'Executing 1,000 Stochastic Iterations...' : 'Run Monte Carlo Simulation'}
        </button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs mt-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 animate-fadeIn">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[11px] text-slate-400">Success Probability (Survival Rate)</p>
              <h4 className="text-xl font-bold text-emerald-400 mt-1">{result.successRate}</h4>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[11px] text-slate-400">Projected 12M Corpus (Mean)</p>
              <h4 className="text-xl font-bold text-indigo-400 mt-1">{result.projectedCorpus}</h4>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[11px] text-slate-400">Risk & Volatility Index</p>
              <h4 className="text-xl font-bold text-cyan-400 mt-1">{result.volatilityIndex}</h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}