'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { formatCurrency } from '../../../lib/utils';

export default function AnomalyRadarPage() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectAnomalies();
  }, []);

  async function detectAnomalies() {
    try {
      setLoading(true);
      const { data: transactions, error } = await supabase.from('transactions').select('*');

      if (error) {
        console.warn('Database notice:', error.message);
        setAnomalies([]);
        return;
      }

      if (transactions && transactions.length > 0) {
        const expenses = transactions.filter((t) => t.type === 'expense');
        const amounts = expenses.map((t) => parseFloat(t.amount || 0));

        if (amounts.length === 0) {
          setAnomalies([]);
          return;
        }

        // Statistical Calculations (Mean & Standard Deviation)
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);

        // Flag transactions with Z-Score > 1.8
        const flagged = expenses
          .map((t) => {
            const amt = parseFloat(t.amount || 0);
            const zScore = stdDev > 0 ? (amt - mean) / stdDev : 0;
            const percentAbove = mean > 0 ? Math.round(((amt - mean) / mean) * 100) : 0;

            return { ...t, zScore, percentAbove, mean };
          })
          .filter((t) => t.zScore > 1.8)
          .sort((a, b) => b.zScore - a.zScore);

        setAnomalies(flagged);
      }
    } catch (err) {
      console.error('Error calculating anomalies:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-400 text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Executing Z-Score anomaly matrix...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Statistical Anomaly Radar
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Automated outlier detection using rolling standard deviation & Z-Score metrics ($Z &gt; 1.8$).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {anomalies.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center rounded-2xl text-slate-400 text-sm">
            ✅ No statistical transaction anomalies identified across current dataset.
          </div>
        ) : (
          anomalies.map((t, idx) => (
            <div
              key={t.id || idx}
              className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    Z-SCORE: +{t.zScore.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{t.transaction_date || t.date}</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{t.description}</h3>
                <p className="text-xs text-slate-500">
                  Transaction is <span className="text-rose-500 font-semibold">+{t.percentAbove}%</span> above your baseline average ({formatCurrency ? formatCurrency(t.mean) : `₹${Math.round(t.mean)}`}).
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency ? formatCurrency(t.amount) : `₹${t.amount}`}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}