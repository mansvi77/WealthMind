'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type');

      if (error) {
        console.error('Error fetching transactions:', error.message);
        setLoading(false);
        return;
      }

      const income = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const expense = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      setSummary({ income, expense, net: income - expense });
      setLoading(false);
    }
    fetchSummary();
  }, []);

  if (loading) return <div className="p-6 text-slate-400">Loading ledger metrics...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">Financial Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-sm text-slate-400">Total Income</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">₹{summary.income.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-sm text-slate-400">Total Expenses</p>
          <p className="text-2xl font-bold text-rose-400 mt-2">₹{summary.expense.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <p className="text-sm text-slate-400">Net Balance</p>
          <p className="text-2xl font-bold text-indigo-400 mt-2">₹{summary.net.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}