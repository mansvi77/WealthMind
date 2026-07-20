'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { formatCurrency } from '../../../lib/utils';
import CategoryPieChart from '../../components/CategoryPieChart';

export default function StorytellingDashboard() {
  const [metrics, setMetrics] = useState({ inflow: 0, outflow: 0, runway: 0 });
  const [categoryMap, setCategoryMap] = useState({});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // What-If Simulator State
  const [discretionarySpend, setDiscretionarySpend] = useState(7500);
  const [reductionPercent, setReductionPercent] = useState(50);
  const [investmentYears, setInvestmentYears] = useState(20);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*');

      if (error) throw error;

      if (transactions) {
        let inflow = 0;
        let outflow = 0;
        const catMap = {};

        transactions.forEach((t) => {
          const amt = parseFloat(t.amount || 0);
          if (t.type === 'income') {
            inflow += amt;
          } else {
            outflow += amt;
            let cat = t.category || t.category_id;
            if (!cat || cat === 'Uncategorized') {
              const desc = (t.description || '').toLowerCase();
              if (desc.includes('netflix') || desc.includes('spotify')) cat = 'Entertainment';
              else if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('starbucks')) cat = 'Food & Dining';
              else if (desc.includes('uber')) cat = 'Travel';
              else if (desc.includes('aws') || desc.includes('amazon')) cat = 'Cloud & Shopping';
              else cat = 'Subscriptions';
            }
            catMap[cat] = (catMap[cat] || 0) + amt;
          }
        });

        const formattedPie = Object.keys(catMap).map((cat) => ({
          name: cat,
          value: catMap[cat],
        }));

        setMetrics({ inflow, outflow, runway: inflow - outflow });
        setCategoryMap(catMap);
        setChartData(formattedPie);
      }
    } catch (err) {
      console.error('Failed to load metric data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate What-If Simulation
  const monthlySavings = discretionarySpend * (reductionPercent / 100);
  const annualSavings = monthlySavings * 12;
  const monthlyRate = 0.12 / 12; // 12% CAGR
  const totalMonths = investmentYears * 12;
  const futureValue = monthlySavings > 0
    ? monthlySavings * (((1 + monthlyRate) ** totalMonths - 1) / monthlyRate)
    : 0;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium tracking-wide">Syncing Storytelling Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white space-y-24 py-10 px-4 md:px-8 selection:bg-emerald-500 selection:text-black">
      
      {/* SECTION 1 — HERO METRICS */}
      <section className="min-h-[85vh] flex flex-col justify-center space-y-12 backdrop-blur-3xl relative">
        {/* Soft Background Radial Light */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center space-y-3 z-10">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            Overview Narrative
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
            Financial Command Center
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto font-light">
            A quiet, deterministic audit of capital flows and net runway capacity.
          </p>
        </div>

        {/* 3 Glassmorphism Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
          {/* Card 1: Total Inflow */}
          <div className="group relative bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/50 p-8 rounded-3xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-emerald-500/10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Inflow</span>
              <span className="text-2xl group-hover:scale-125 transition-transform duration-300">💰</span>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 tracking-tight">
              {formatCurrency ? formatCurrency(metrics.inflow) : `₹${metrics.inflow.toLocaleString()}`}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-medium">Verified capital deposits</p>
          </div>

          {/* Card 2: Total Outflow */}
          <div className="group relative bg-slate-900/40 border border-slate-800/80 hover:border-rose-500/50 p-8 rounded-3xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-rose-500/10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Outflow</span>
              <span className="text-2xl group-hover:scale-125 transition-transform duration-300">💸</span>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-rose-500 tracking-tight">
              {formatCurrency ? formatCurrency(metrics.outflow) : `₹${metrics.outflow.toLocaleString()}`}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-medium">Accumulated expenses</p>
          </div>

          {/* Card 3: Net Runway */}
          <div className="group relative bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/50 p-8 rounded-3xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 shadow-2xl hover:shadow-indigo-500/10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Financial Runway</span>
              <span className="text-2xl group-hover:scale-125 transition-transform duration-300">🚀</span>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-indigo-400 tracking-tight">
              {formatCurrency ? formatCurrency(metrics.runway) : `₹${metrics.runway.toLocaleString()}`}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 font-medium">Liquid surplus capacity</p>
          </div>
        </div>
      </section>

      {/* SECTION 2 — SPENDING INSIGHTS & WEALTH LEAK HEATMAP */}
      <section className="min-h-screen flex flex-col justify-center space-y-10">
        <div className="border-b border-slate-800/80 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Chapter 02</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Spending Behavior & Heatmap</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Pie Chart Distribution */}
          <div className="lg:col-span-7 bg-slate-900/30 border border-slate-800/80 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
            <h3 className="font-bold text-lg text-slate-200 mb-6">Allocated Expenditure Distribution</h3>
            {chartData.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">No spend data detected.</div>
            ) : (
              <div className="h-80">
                <CategoryPieChart data={chartData} />
              </div>
            )}
          </div>

          {/* Right: Wealth Leak Heatmap */}
          <div className="lg:col-span-5 bg-slate-900/30 border border-slate-800/80 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                🔥 Wealth Leak Heatmap
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Pulsing indicator of discretionary money drains.
              </p>
            </div>

            <div className="space-y-5">
              {Object.keys(categoryMap).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No active leaks detected.</p>
              ) : (
                Object.entries(categoryMap)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => {
                    const max = Math.max(...Object.values(categoryMap));
                    const ratio = amount / max;

                    let barColor = 'bg-emerald-500';
                    let badge = 'Healthy';
                    let badgeStyle = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50';

                    if (ratio > 0.6) {
                      barColor = 'bg-rose-500 animate-pulse';
                      badge = 'Dangerous';
                      badgeStyle = 'text-rose-400 bg-rose-950/60 border-rose-800/50';
                    } else if (ratio > 0.3) {
                      barColor = 'bg-amber-500';
                      badge = 'Moderate';
                      badgeStyle = 'text-amber-400 bg-amber-950/60 border-amber-800/50';
                    }

                    return (
                      <div key={cat} className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-300">{cat}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-slate-400">₹{amount.toLocaleString()}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                              {badge}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                            style={{ width: `${Math.max(ratio * 100, 8)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — SMART WHAT-IF SIMULATOR */}
      <section className="min-h-screen flex flex-col justify-center space-y-10">
        <div className="border-b border-slate-800/80 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Chapter 03</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Smart "What-If" Wealth Simulator</h2>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 via-slate-950 to-slate-900 border border-slate-800/80 p-8 md:p-12 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/60">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-2">
                Discretionary Spend: ₹{discretionarySpend.toLocaleString()}/mo
              </label>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={discretionarySpend}
                onChange={(e) => setDiscretionarySpend(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-2">
                Cut Spend By: {reductionPercent}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={reductionPercent}
                onChange={(e) => setReductionPercent(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-2">
                Investment Horizon: {investmentYears} Years
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={investmentYears}
                onChange={(e) => setInvestmentYears(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Calculated Output Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Monthly Savings</span>
              <p className="text-2xl font-black text-emerald-400 mt-2">₹{monthlySavings.toLocaleString()}</p>
            </div>

            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Annual Retained</span>
              <p className="text-2xl font-black text-emerald-400 mt-2">₹{annualSavings.toLocaleString()}</p>
            </div>

            <div className="bg-slate-950/80 p-6 rounded-2xl border border-emerald-500/30">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400">Invested @ 12% CAGR</span>
              <p className="text-2xl font-black text-indigo-400 mt-2">
                ≈ ₹{(futureValue / 100000).toFixed(2)} Lakhs
              </p>
            </div>
          </div>

          {/* Prediction Card Narrative */}
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Predictive Outcome</p>
              <p className="text-sm font-medium text-slate-200 mt-1">
                "By cutting <span className="text-emerald-400 font-bold">{reductionPercent}%</span> of discretionary spend, you retain <span className="text-emerald-400 font-bold">₹{annualSavings.toLocaleString()}</span> per year, creating an estimated <span className="text-indigo-400 font-bold">₹{(futureValue / 100000).toFixed(2)} Lakhs</span> corpus in {investmentYears} years."
              </p>
            </div>
            <span className="text-3xl">✨</span>
          </div>
        </div>
      </section>

    </div>
  );
}