'use client';
import { useState, useEffect } from 'react';

import { supabase } from '../../../lib/supabaseClient';
import { formatCurrency } from '@/lib/utils';
import CategoryPieChart from '@/components/CategoryPieChart';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ income: 0, expenses: 0, balance: 0 });
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardMetrics() {
      try {
        // Fetch all transactions along with their joined categories
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
        <div className="text-center space-y-2 animate-pulse">
          <div className="text-2xl font-semibold text-slate-700">Assembling Financial Metrics...</div>
          <p className="text-sm text-slate-400">Querying localized isolation tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financial Command Center</h1>
        <p className="text-sm text-slate-500 mt-1">Deterministic metrics processed client-side without runtime execution fees.</p>
      </div>

      {/* Numerical Metrics Summary Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Capital Inflow</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(metrics.income)}</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Capital Outflow</div>
          <div className="text-2xl font-bold text-rose-600 mt-2">{formatCurrency(metrics.expenses)}</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Runway Capital</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{formatCurrency(metrics.balance)}</div>
        </div>
      </div>

      {/* Charts & Operational Blueprint Information Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm lg:col-span-2 flex flex-col justify-between">
          <h3 className="font-semibold text-slate-800 mb-4">Allocated Expenditure Distribution</h3>
          <CategoryPieChart data={pieData} />
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Interview Architecture Talking Points</h3>
            <p className="text-xs text-slate-400 mb-4">Be ready to explain these production principles to technical interviewers:</p>
            <ul className="text-xs text-slate-600 space-y-3 list-disc list-inside">
              <li><b className="text-slate-800">Zero-Cost Classification:</b> Built on a rule-based engine mapping array matches, skipping fragile and costly LLM context tokens.</li>
              <li><b className="text-slate-800">Row-Level Security:</b> The DB itself filters data isolation via application claims ($auth.uid() = user_id$).</li>
              <li><b className="text-slate-800">Interval Clustering:</b> Uses statistical standard deviation algorithms to identify billing loops automatically.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}  