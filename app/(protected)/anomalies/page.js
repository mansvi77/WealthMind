'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calculateAnomalies } from '@/lib/stats/zscore';

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
        // Delegate calculation to our single source of truth in /lib/stats/zscore.js
        const flagged = calculateAnomalies(transactions, 1.8);
        
        // Enrich with percentage above mean for the UI view
        const enriched = flagged.map((t) => {
          const percentAbove = t.mean > 0 ? Math.round(((t.amount - t.mean) / t.mean) * 100) : 0;
          return { ...t, percentAbove };
        });

        setAnomalies(enriched);
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
          Automated outlier detection using rolling standard deviation &amp; Z-Score metrics ($Z &gt; 1.8$).
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
                    Z-SCORE: +{t.zScore}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{t.transaction_date || t.date}</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{t.description || t.merchant}</h3>
                <p className="text-xs text-slate-500">
                  Transaction is <span className="text-rose-500 font-semibold">+{t.percentAbove}%</span> above your baseline average (₹{Math.round(t.mean)}).
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  ₹{t.amount}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}