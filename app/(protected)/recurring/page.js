'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '@/lib/utils';
import { detectRecurringPatterns } from '@/lib/recurringDetector';

export default function RecurringPage() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyzeSubscriptions() {
      try {
        setLoading(true);
        const { data: txns, error } = await supabase.from('transactions').select('*');
        if (error) throw error;

        // Pass transactions through our custom standard deviation interval matcher
        const detected = detectRecurringPatterns(txns || []);
        setPatterns(detected);
      } catch (err) {
        console.error('Error analyzing subscription clusters:', err);
      } finally {
        setLoading(false);
      }
    }
    analyzeSubscriptions();
  }, []);

  if (loading) {
    return <div className="text-center text-slate-500 mt-20 animate-pulse">Running interval clustering calculations...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Subscription Tracker</h1>
        <p className="text-sm text-slate-500 mt-1">Algorithmic billing cycles detected via mathematical date-interval clustering variance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patterns.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 p-8 rounded-xl text-center text-slate-400 text-sm">
            No regular subscription loops identified yet. Upload a recurring statement string pattern (e.g., Netflix) inside the ledger view to check analysis parameters.
          </div>
        ) : (
          patterns.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 capitalize">{item.merchant_pattern}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Every {item.interval_days} days</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {Math.round(item.confidence_score * 100)}% Match
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Avg. Bill:</span>
                <span className="text-lg font-bold text-slate-900">{formatCurrency(item.avg_amount)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}