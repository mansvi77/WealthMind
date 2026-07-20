'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { formatCurrency } from '../../../lib/utils';
import { autoCategorize } from '../../../lib/categorizationEngine';
import CSVUploadZone from '../../components/CSVUploadZone';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('transactions')
        .select('*');

      if (error) {
        console.warn('Database query notice:', error.message);
        setTransactions([]);
        return;
      }

      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCSVDataLoaded = async (parsedRows) => {
    try {
      setUploading(true);

      // 1. Fetch current authenticated user ID
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || null;

      // 2. Process rows cleanly with auto-categorization and fallback mappings
      const processedRows = parsedRows.map((row) => {
        const description = row.description || row.Description || 'Unknown Transaction';
        const rawAmount = parseFloat(row.amount || row.Amount || 0);
        const amount = Math.abs(rawAmount);
        const type = rawAmount >= 0 ? 'income' : 'expense';
        const dateVal = row.date || row.Date || new Date().toISOString().split('T')[0];

        // Categorize description client-side
        const category = typeof autoCategorize === 'function' ? autoCategorize(description) : 'General';

        const payload = {
          description,
          amount,
          type,
          category,
          transaction_date: dateVal,
          date: dateVal,
        };

        if (currentUserId) {
          payload.user_id = currentUserId;
        }

        return payload;
      });

      // 3. Batch insert formatted rows into Supabase
      const { error } = await supabase.from('transactions').insert(processedRows);

      if (error) throw error;

      // 4. Refresh active ledger display
      await fetchTransactions();
    } catch (err) {
      alert(`Upload processing failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm font-medium text-slate-400">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Syncing transaction ledger indexes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Transaction Ledger
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Import, classify, and isolate capital flows.
        </p>
      </div>

      {/* Statement Ingestion Dropzone */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 tracking-tight">
          Statement Ingestion
        </h3>
        <CSVUploadZone onDataLoaded={handleCSVDataLoaded} />
        {uploading && (
          <p className="text-xs text-indigo-500 font-medium animate-pulse mt-3 text-center">
            Writing rows to cloud database...
          </p>
        )}
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="p-4">Date</th>
              <th className="p-4">Description</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-400 text-xs font-medium">
                  No active transaction entries populated in this vault ledger.
                </td>
              </tr>
            ) : (
              transactions.map((t, idx) => (
                <tr key={t.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                    {t.transaction_date || t.date || 'N/A'}
                  </td>
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                    {t.description}
                  </td>
                  <td className="p-4 text-xs font-semibold">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {t.category || 'General'}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency ? formatCurrency(t.amount) : `₹${t.amount}`}
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