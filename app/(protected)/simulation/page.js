'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function MonteCarloPage() {
  const [simulations, setSimulations] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic Inputs initialized from Supabase data
  const [initialCapital, setInitialCapital] = useState(100000);
  const [monthlyOutflow, setMonthlyOutflow] = useState(10000);
  const [volatility, setVolatility] = useState(20); // 20% variance

  useEffect(() => {
    fetchFinancialBaseline();
  }, []);

  async function fetchFinancialBaseline() {
    try {
      setLoading(true);
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*');

      if (error) throw error;

      if (transactions && transactions.length > 0) {
        // Calculate total net balance as initial capital representation
        const totalIncome = transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        const totalExpense = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        const netBalance = totalIncome - totalExpense;
        if (netBalance > 0) {
          setInitialCapital(Math.round(netBalance));
        }

        // Estimate average monthly outflow from expenses
        const expenseTransactions = transactions.filter((t) => t.type === 'expense');
        if (expenseTransactions.length > 0) {
          const monthMap = {};
          expenseTransactions.forEach((t) => {
            const dateStr = t.transaction_date || t.date || new Date().toISOString();
            const monthKey = dateStr.substring(0, 7);
            monthMap[monthKey] = (monthMap[monthKey] || 0) + parseFloat(t.amount || 0);
          });

          const monthlyTotals = Object.values(monthMap);
          if (monthlyTotals.length > 0) {
            const avgMonthly = monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length;
            setMonthlyOutflow(Math.round(avgMonthly));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching financial baseline for simulation:', err);
    } finally {
      setLoading(false);
    }
  }

  const runMonteCarlo = () => {
    setIsSimulating(true);

    setTimeout(() => {
      const numRuns = 1000;
      const months = 12;
      let survivedCount = 0;
      let totalEndingCapital = 0;

      for (let i = 0; i < numRuns; i++) {
        let currentBalance = initialCapital;
        for (let m = 0; m < months; m++) {
          // Normal distribution random variation around monthly outflow
          const randomFactor = 1 + (Math.random() * 2 - 1) * (volatility / 100);
          const simulatedOutflow = monthlyOutflow * randomFactor;
          currentBalance -= simulatedOutflow;
        }

        if (currentBalance > 0) survivedCount++;
        totalEndingCapital += Math.max(0, currentBalance);
      }

      setSimulations({
        survivalRate: ((survivedCount / numRuns) * 100).toFixed(1),
        avgEndingBalance: Math.round(totalEndingCapital / numRuns),
        runsExecuted: numRuns,
      });

      setIsSimulating(false);
    }, 400);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading financial baseline for simulation parameters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Stochastic Monte Carlo Engine
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Execute 1,000 randomized probabilistic trials modeling capital survival under spending volatility.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Liquid Capital: ₹{initialCapital.toLocaleString()}
            </label>
            <input
              type="range"
              min="10000"
              max="1000000"
              step="5000"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Base Monthly Outflow: ₹{monthlyOutflow.toLocaleString()}
            </label>
            <input
              type="range"
              min="1000"
              max="100000"
              step="500"
              value={monthlyOutflow}
              onChange={(e) => setMonthlyOutflow(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Expense Volatility Shock: ±{volatility}%
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={volatility}
              onChange={(e) => setVolatility(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={runMonteCarlo}
          disabled={isSimulating}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex justify-center items-center space-x-2"
        >
          {isSimulating ? (
            <span>Executing 1,000 Probabilistic Trials...</span>
          ) : (
            <span>🎲 Run 1,000 Monte Carlo Simulations</span>
          )}
        </button>
      </div>

      {simulations && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trials Executed</p>
            <p className="text-3xl font-black text-white mt-2">{simulations.runsExecuted}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">12-Month Survival Probability</p>
            <p className="text-3xl font-black text-emerald-400 mt-2">{simulations.survivalRate}%</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expected Ending Capital</p>
            <p className="text-3xl font-black text-indigo-400 mt-2">₹{simulations.avgEndingBalance.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}