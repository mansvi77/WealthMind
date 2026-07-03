'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/utils';
import { autoCategorize } from '@/lib/categorizationEngine';
import CSVUploadZone from '@/components/CSVUploadZone';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Load transactions and categories from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories first for reference mapping
      const { data: catData } = await supabase.from('categories').select('*');
      setCategories(catData || []);

      // Fetch transactions ordered by date
      const { data: txData, error } = await supabase
        .from('transactions')
        .select('*, categories(name, color)')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions(txData || []);
    } catch (err) {
      console.error('Error fetching data ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Process and upload parsed CSV data arrays
  const handleCSVDataLoaded = async (parsedData) => {
    try {
      setUploading(true);
      
      // Get current authenticating user info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user instance identified.');

      // Map rows into our Postgres schema format
      const formattedTransactions = parsedData.map(row => {
        const description = row.description || row.Description || '';
        const amount = parseFloat(row.amount || row.Amount || 0);
        const type = (row.type || row.Type || 'expense').toLowerCase().trim();
        const rawDate = row.date || row.Date;
        
        // Format date cleanly into YYYY-MM-DD
        const transaction_date = new Date(rawDate).toISOString().split('T')[0];

        // Run client-side rule engine to auto-assign a category ID
        const category_id = type === 'expense' ? autoCategorize(description, categories) : null;

        return {
          user_id: user.id,
          description,
          amount: Math.abs(amount),
          type: type === 'income' ? 'income' : 'expense',
          transaction_date,
          category_id,
          source: 'csv_import'
        };
      });

      // Filter out invalid transactions
      const validPayload = formattedTransactions.filter(t => t.description && t.amount !== 0);

      if (validPayload.length === 0) return;

      // Bulk insert array directly into Supabase via a single networking handshake
      const { error } = await supabase.from('transactions').insert(validPayload);
      if (error) throw error;

      // Refresh data layers
      await fetchData();
    } catch (err) {
      alert(`CSV Processing Exception: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-500 mt-20 animate-pulse">Hydrating relational data records...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between justify-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transactions Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Review ledger histories or upload structural CSV exports directly.</p>
        </div>
      </div>

      {/* CSV Handlers Drag Drop Zone */}
      <div className="max-w-xl">
        <CSVUploadZone onDataLoaded={handleCSVDataLoaded} />
        {uploading && <p className="text-xs text-indigo-600 font-medium animate-pulse mt-2">Executing bulk SQL transaction inserts...</p>}
      </div>

      {/* Tabular Data View */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Date</th>
              <th className="p-4">Description</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-400 text-xs font-medium">
                  No records stored inside current user context table. Upload a test CSV to start tracking.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 whitespace-nowrap text-xs text-slate-500">{tx.transaction_date}</td>
                  <td className="p-4 font-medium text-slate-800">{tx.description}</td>
                  <td className="p-4">
                    {tx.type === 'income' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                        Inflow Income
                      </span>
                    ) : (
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: tx.categories?.color || '#94a3b8' }}
                      >
                        {tx.categories?.name || 'Uncategorized'}
                      </span>
                    )}
                  </td>
                  <td className={`p-4 text-right font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
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