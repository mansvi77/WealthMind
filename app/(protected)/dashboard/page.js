'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ShieldAlert, 
  Repeat, 
  Sparkles, 
  ArrowRight, 
  SlidersHorizontal, 
  Dice5, 
  Flame,
  FileText
} from 'lucide-react';
import WealthLeakHeatmap from '@/components/WealthLeakHeatmap';
import WhatIfSimulator from '@/components/WhatIfSimulator';
import { detectRecurring } from '@/lib/recurringDetector';
import { calculateZScoreAnomalies } from '@/lib/stats/zscore';

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    savingsRate: 0,
  });
  const [categoryMap, setCategoryMap] = useState({});
  const [recurringCount, setRecurringCount] = useState(0);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: txs, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', session.user.id);

        if (error || !txs) {
          setLoading(false);
          return;
        }

        let totalIncome = 0;
        let totalExpenses = 0;
        const catMap = {};

        txs.forEach((t) => {
          const amt = Number(t.amount) || 0;
          const cat = t.category || 'General';
          if (t.type === 'income') {
            totalIncome += amt;
          } else {
            totalExpenses += amt;
            catMap[cat] = (catMap[cat] || 0) + amt;
          }
        });

        const netBalance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0;

        setMetrics({
          income: totalIncome,
          expenses: totalExpenses,
          balance: netBalance,
          savingsRate,
        });
        setCategoryMap(catMap);

        const recurring = detectRecurring(txs);
        setRecurringCount(recurring.length);

        const anomalies = calculateZScoreAnomalies(txs);
        setAnomalyCount(anomalies.length);

      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [supabase]);

  const handleAskCopilot = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    router.push(`/assistant?q=${encodeURIComponent(question)}`);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse text-slate-400">
        <div className="h-10 w-64 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 text-slate-100 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Command Center</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time intelligence, anomaly detection, and automated RAG insights.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Income</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-emerald-400">₹{metrics.income.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Total Expenses</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-rose-400">₹{metrics.expenses.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Net Balance</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${metrics.balance >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              ₹{metrics.balance.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Savings Rate</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-cyan-400">{metrics.savingsRate}%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200">Spending Overview & Leak Heatmap</h2>
            <Link href="/wealth-leaks" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View Full Leaks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <WealthLeakHeatmap categoryMap={categoryMap} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-200 mb-1">Financial Intelligence</h2>
            <p className="text-xs text-slate-400">Automated deterministic insights</p>
          </div>
          <div className="space-y-4">
            <Link href="/recurring" className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200">Recurring Spend</h4>
                  <p className="text-xs text-slate-400">{recurringCount} subscription patterns detected</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>

            <Link href="/anomalies" className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-rose-500/30 transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200">Anomaly Radar</h4>
                  <p className="text-xs text-slate-400">{anomalyCount} statistical outliers flagged</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>

            <Link href="/report" className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200">Financial Health Report</h4>
                  <p className="text-xs text-slate-400">Comprehensive AI narrative report</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">What-If Simulator</h2>
            <p className="text-xs text-slate-400">Illustrative projection based on discretionary spending adjustments</p>
          </div>
          <Link href="/what-if" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Full Simulator <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
          <WhatIfSimulator />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 mb-1">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-slate-200">Ask WealthMind</h2>
            </div>
            <p className="text-xs text-slate-400">Query your RAG vector knowledge base with natural language</p>
          </div>

          <form onSubmit={handleAskCopilot} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Where am I overspending this month?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all pr-24"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
              >
                Ask
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {[
              "Where am I spending the most?",
              "Find my recurring leaks",
              "Why is spending increasing?",
            ].map((suggested, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(suggested);
                  router.push(`/assistant?q=${encodeURIComponent(suggested)}`);
                }}
                className="text-xs bg-slate-950 hover:bg-slate-800/80 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-all"
              >
                {suggested}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Dice5 className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-slate-200">Monte Carlo Simulation</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-medium">1,000 Runs</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Probabilistic forward-looking cash flow and capital survival projections modeled under historical volatility parameters.
          </p>
          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-500 block">Horizon</span>
              <span className="text-sm font-semibold text-slate-200">12 Months</span>
            </div>
            <Link
              href="/simulation"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-cyan-600/20 flex items-center gap-1.5"
            >
              View Full Simulation <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}