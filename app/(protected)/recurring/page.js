'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { formatCurrency } from '../../../lib/utils';
// Use exact named import match
import { detectRecurringPatterns } from '../../../lib/recurringDetector';

export default function RecurringPage() {
  const [recurringSubscriptions, setRecurringSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAndAnalyzeRecurring();
  }, []);

  async function fetchAndAnalyzeRecurring() {
    try {
      setLoading(true);
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.warn('Database warning:', error.message);
        setRecurringSubscriptions([]);
        return;
      }

      if (transactions && transactions.length > 0) {
        const detected = typeof detectRecurringPatterns === 'function' 
          ? detectRecurringPatterns(transactions) 
          : [];
        setRecurringSubscriptions(detected || []);
      } else {
        setRecurringSubscriptions([]);
      }
    } catch (err) {
      console.warn('Error evaluating patterns:', err?.message || err);
      setRecurringSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Analyzing transaction interval loops...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Recurring Spend Detector
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Algorithmic subscription identification via sequence clustering algorithms.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">Active Detected Subscriptions</h3>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="p-4">Subscription Merchant</th>
              <th className="p-4">Frequency</th>
              <th className="p-4 text-right">Est. Monthly Cost</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
            {recurringSubscriptions.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-400 text-xs font-medium">
                  No repeating transaction loops identified across current dataset.
                </td>
              </tr>
            ) : (
              recurringSubscriptions.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{item.merchant || item.description}</td>
                  <td className="p-4 text-slate-500 text-xs font-medium">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {item.frequency || 'Monthly'}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}