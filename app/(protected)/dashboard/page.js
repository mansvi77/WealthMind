'use client';
import { useState, useEffect } from 'react';
// Step back 3 levels to reach lib/
import { supabase } from '../../../lib/supabaseClient';
import { formatCurrency } from '../../../lib/utils';

// Step back 2 levels to reach components/
import CategoryPieChart from '../../components/CategoryPieChart';  

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ income: 0, expenses: 0, balance: 0 });
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardMetrics() {
      try {
        const { data: txns, error: txError } = await supabase
          .from('transactions')
          .select('*, categories(name, color)');
        
        if (txError) throw txError;

        let totalIncome = 0;
        let totalExpenses = 0;
        const catMap = {};

        txns.forEach(t => {
          const amt = parseFloat(t.amount);
          if (t.type === 'income') {
            totalIncome += amt;
          } else {
            totalExpenses += amt;
            const catName = t.categories?.name || 'Uncategorized';
            const catColor = t.categories?.color || '#94a3b8';
            
            if (!catMap[catName]) {
              catMap[catName] = { name: catName, value: 0, color: catColor };
            }
            catMap[catName].value += amt;
          }
        });

        setMetrics({
          income: totalIncome,
          expenses: totalExpenses,
          balance: totalIncome - totalExpenses
        });
        setPieData(Object.values(catMap));
      } catch (err) {
        console.error('Error hydrating dashboard UI indexes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-3 animate-pulse">
          <div className="text-lg font-semibold text-slate-700">Assembling Financial Metrics...</div>
          <p className="text-xs text-slate-400">Querying secure isolation tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial Command Center</h1>
        <p className="text-sm text-slate-500 mt-1">Deterministic analytics engine processed completely client-side.</p>
      </div>

      {/* Metrics Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Capital Inflow</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{formatCurrency(metrics.income)}</div>
        </div>
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Capital Outflow</div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">{formatCurrency(metrics.expenses)}</div>
        </div>
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Runway Capital</div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-2">{formatCurrency(metrics.balance)}</div>
        </div>
      </div>

      {/* Analytical Layout Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-4 tracking-tight">Allocated Expenditure Distribution</h3>
          <CategoryPieChart data={pieData} />
        </div>
        
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between border border-slate-800">
          <div>
            <h3 className="font-bold text-white mb-2 tracking-tight text-lg flex items-center gap-2">
              <span>🚀</span> Interview Architecture
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">Be ready to explain these architectural principles to technical interviewers:</p>
            <ul className="text-xs text-slate-300 space-y-4 list-none">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5">✔</span>
                <span><b className="text-white font-medium">Zero-Cost Matching:</b> Linear $O(N)$ regex cleaning instead of costly, high-latency LLM context tokens.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5">✔</span>
                <span><b className="text-white font-medium">Row-Level Security:</b> Postgres storage isolation policies matching user session context identities directly.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5">✔</span>
                <span><b className="text-white font-medium">Interval Clustering:</b> Algorithmic subscription identification via low standard-deviation sequence loops.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}