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
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching data arrays:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCSVDataLoaded = async (parsedRows) => {
    try {
      setUploading(true);
      // Run deterministic cleaning engine matches client-side
      const processedRows = parsedRows.map(row => {
        const description = row.description || row.Description || 'Unknown Transaction';
        const amount = parseFloat(row.amount || row.Amount || 0);
        const type = amount >= 0 ? 'income' : 'expense';
        
        return {
          description,
          amount: Math.abs(amount),
          type,
          date: row.date || row.Date || new Date().toISOString().split('T')[0],
          category_id: autoCategorize(description)
        };
      });

      const { error } = await supabase.from('transactions').insert(processedRows);
      if (error) throw error;
      
      await fetchTransactions();
    } catch (err) {
      alert(`Upload processing failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm font-medium text-slate-500">
        Syncing transaction ledger indexes...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Transaction Ledger</h1>
        <p className="text-sm text-slate-500 mt-1">Import, classify, and isolate capital flows.</p>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 tracking-tight">Statement Ingestion</h3>
        <CSVUploadZone onDataLoaded={handleCSVDataLoaded} />
        {uploading && <p className="text-xs text-indigo-600 font-medium animate-pulse mt-2">Writing rows to cloud database...</p>}
      </div>

      {/* Ledger Records Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="p-4">Date</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-400 text-xs font-medium">
                  No active transaction entries populated in this vault ledger.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-500 font-mono text-xs">{t.date}</td>
                  <td className="p-4 font-medium text-slate-800">{t.description}</td>
                  <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
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