'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { formatCurrency } from '../../../lib/utils';
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
        const normalizedTransactions = transactions.map((t) => ({
          ...t,
          amount: parseFloat(t.amount || 0),
          date: t.date || t.transaction_date || new Date().toISOString().slice(0, 10),
          merchant: t.merchant || t.description || 'Unknown Merchant',
        }));

        const detected = typeof detectRecurringPatterns === 'function' 
          ? detectRecurringPatterns(normalizedTransactions) 
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
              <th className="p-4">Estimated Amount</th>
              <th className="p-4 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {recurringSubscriptions.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-400 text-sm">
                  ✅ No recurring subscription patterns detected across current transaction logs.
                </td>
              </tr>
            ) : (
              recurringSubscriptions.map((sub, idx) => (
                <tr key={sub.merchant || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                    {sub.merchant}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 capitalize">
                    {sub.frequency || 'Monthly'}
                  </td>
                  <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency ? formatCurrency(sub.amount) : `₹${sub.amount}`}
                  </td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {Math.round((sub.confidence || 0.9) * 100)}% MATCH
                    </span>
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