'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { formatCurrency } from '../../../lib/utils';

export default function ExpenseDriftPage() {
  const [driftData, setDriftData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateExpenseDrift();
  }, []);

  async function calculateExpenseDrift() {
    try {
      setLoading(true);
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*');

      if (error) throw error;

      if (transactions && transactions.length > 0) {
        // Group expenses by category
        const categoryMonthlyMap = {};

        transactions
          .filter((t) => t.type === 'expense')
          .forEach((t) => {
            const cat = t.category || 'General';
            const dateStr = t.transaction_date || t.date || new Date().toISOString();
            const monthKey = dateStr.substring(0, 7); // e.g. "2026-06"
            const amt = parseFloat(t.amount || 0);

            if (!categoryMonthlyMap[cat]) categoryMonthlyMap[cat] = {};
            categoryMonthlyMap[cat][monthKey] = (categoryMonthlyMap[cat][monthKey] || 0) + amt;
          });

        // Compute linear drift (slope analysis) for each category
        const calculatedDrift = Object.keys(categoryMonthlyMap).map((cat) => {
          const months = Object.keys(categoryMonthlyMap[cat]).sort();
          const values = months.map((m) => categoryMonthlyMap[cat][m]);

          let slope = 0;
          let percentChange = 0;

          if (values.length > 1) {
            const first = values[0];
            const last = values[values.length - 1];
            slope = (last - first) / (values.length - 1);
            percentChange = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
          }

          const totalSpend = values.reduce((a, b) => a + b, 0);

          return {
            category: cat,
            monthsCount: values.length,
            latestSpend: values[values.length - 1] || totalSpend,
            totalSpend,
            slope,
            percentChange,
          };
        });

        // Sort by highest accelerating spending drift
        calculatedDrift.sort((a, b) => b.slope - a.slope);
        setDriftData(calculatedDrift);
      }
    } catch (err) {
      console.error('Error calculating expense drift:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Calculating linear regression drift vectors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Expense Drift & Lifestyle Creep Engine
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Detect Month-over-Month expenditure velocity ($\beta$ slope trajectory) before capital depletion.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {driftData.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center rounded-2xl text-slate-400 text-sm">
            ✅ No month-over-month expense drift trajectories detected across current dataset.
          </div>
        ) : (
          driftData.map((item, idx) => {
            let statusBadge = 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            let statusText = 'STABLE SPEND';

            if (item.slope > 500 || item.percentChange > 20) {
              statusBadge = 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse';
              statusText = 'ESCALATING DRIFT';
            } else if (item.slope > 0) {
              statusBadge = 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
              statusText = 'MODERATE DRIFT';
            }

            return (
              <div
                key={item.category || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                      {statusText}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {item.monthsCount} Cycle{item.monthsCount > 1 ? 's' : ''} Analyzed
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">{item.category}</h3>
                  <p className="text-xs text-slate-500">
                    Expenditure slope trajectory is drifting by{' '}
                    <span className={item.slope > 0 ? 'text-rose-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                      {item.slope > 0 ? '+' : ''}₹{Math.round(item.slope)}/cycle ({item.percentChange > 0 ? '+' : ''}{item.percentChange}%)
                    </span>.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Recent Spend</p>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {formatCurrency ? formatCurrency(item.latestSpend) : `₹${item.latestSpend}`}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}