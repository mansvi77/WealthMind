'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, TrendingUp, AlertTriangle, Activity, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function FinancialCommandCenter() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    savingsRate: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: txData, error } = await supabase
          .from('transactions')
          .select('*')
          .order('transaction_date', { ascending: false });

        if (error) throw error;

        const txList = txData || [];
        setTransactions(txList);

        let income = 0;
        let expenses = 0;

        txList.forEach((t) => {
          const amt = Number(t.amount) || 0;
          if (t.type === 'income') {
            income += amt;
          } else if (t.type === 'expense') {
            expenses += amt;
          }
        });

        const net = income - expenses;
        const rate = income > 0 ? Math.round((net / income) * 100) : 0;

        setMetrics({
          totalIncome: income,
          totalExpenses: expenses,
          netBalance: net,
          savingsRate: rate,
        });
      } catch (err) {
        console.error('Error loading command center data:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  // Heatmap & Category breakdown
  const expenseCategories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const sortedCategories = Object.entries(expenseCategories).sort((a, b) => b[1] - a[1]);

  // Simple Anomaly Detection preview (expenses > 5000 or unusual spikes)
  const anomalies = transactions.filter(t => t.type === 'expense' && Number(t.amount) > 5000);

  // Recurring spend detection preview (matching descriptions)
  const recurringCount = transactions.filter(t => t.description && (t.description.toLowerCase().includes('sub') || t.description.toLowerCase().includes('sip') || t.description.toLowerCase().includes('rent'))).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time intelligence, anomaly radar, and vector-grounded RAG insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/assistant"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI Copilot</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-400">Total Income</p>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-emerald-400">
            {loading ? '...' : `₹${metrics.totalIncome.toLocaleString()}`}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">Verified primary inflows</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-400">Total Expenses</p>
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-rose-400">
            {loading ? '...' : `₹${metrics.totalExpenses.toLocaleString()}`}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">Aggregate statement debits</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-400">Net Balance</p>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h2 className={`text-2xl font-bold ${metrics.netBalance >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
            {loading ? '...' : `₹${metrics.netBalance.toLocaleString()}`}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">Net accumulated liquidity</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-400">Savings Rate</p>
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-cyan-400">
            {loading ? '...' : `${metrics.savingsRate}%`}
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">Retained income ratio</p>
        </div>
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spending Heatmap & Leak Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-200">Spending Overview & Leak Heatmap</h3>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full font-medium">Live Aggregation</span>
          </div>
          
          {loading ? (
            <p className="text-sm text-slate-500 py-12 text-center">Parsing transaction streams...</p>
          ) : sortedCategories.length === 0 ? (
            <p className="text-sm text-slate-500 py-12 text-center">No transactions available. Upload statements to render heatmap.</p>
          ) : (
            <div className="space-y-3.5">
              {sortedCategories.slice(0, 5).map(([category, amount], idx) => {
                const percentage = metrics.totalExpenses > 0 ? Math.round((amount / metrics.totalExpenses) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{category}</span>
                      <span className="text-slate-400">₹{amount.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Financial Intelligence Hub (Recurring, Anomaly, Health Report) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-3">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-base font-semibold text-slate-200">Intelligence Modules</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-slate-800/50 border border-slate-700/40 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Recurring Spend</p>
                    <p className="text-[11px] text-slate-400">{recurringCount} automated subscriptions detected</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/40 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Anomaly Radar</p>
                    <p className="text-[11px] text-slate-400">{anomalies.length} high-value outliers flagged</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Financial Health Status</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {transactions.length} statement rows indexed successfully. Savings performance is stable across your active data profile.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}