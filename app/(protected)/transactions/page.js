'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { autoCategorize } from '@/lib/categorizationEngine';

export default function TransactionsPage() {
  const [uploading, setUploading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error.message);
      } else {
        setTransactions(data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCSVDataLoaded = async (parsedRows) => {
    try {
      setUploading(true);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      let currentUserId = sessionData?.session?.user?.id;
      if (sessionError || !currentUserId) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user?.id) {
          throw new Error('Auth session missing! Please log in again.');
        }
        currentUserId = userData.user.id;
      }

      const processedRows = parsedRows.map((row) => {
        const description = row.description || row.Description || 'Unknown Transaction';
        const rawAmount = parseFloat(row.amount || row.Amount || 0);
        const amount = Math.abs(rawAmount);
        const type = rawAmount >= 0 ? 'income' : 'expense';
        const dateVal = row.date || row.Date || new Date().toISOString().split('T')[0];
        const category = autoCategorize(description);

        return {
          description,
          amount,
          type,
          category,
          transaction_date: dateVal,
          user_id: currentUserId,
        };
      });

      const { data, error } = await supabase
        .from('transactions')
        .insert(processedRows)
        .select();

      if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
      }

      await fetchTransactions();
      alert(`Successfully imported ${processedRows.length} transactions!`);
    } catch (err) {
      console.error('CSV UPLOAD FAILED:', err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(Boolean);
      if (lines.length < 2) {
        alert('CSV file is empty or missing headers.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      const parsedRows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        let obj = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] || '';
        });
        return obj;
      });

      await handleCSVDataLoaded(parsedRows);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      <h1 className="text-3xl font-bold">Transaction Management</h1>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <label className="block text-sm font-medium text-slate-400 mb-2">Upload Bank Statement CSV</label>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
        />
        {uploading && <p className="text-xs text-indigo-400 mt-3 animate-pulse">Processing and securely uploading batch data...</p>}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        {loading ? (
          <div className="p-6 text-slate-400">Loading records...</div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-slate-400">No transactions recorded yet. Upload a CSV above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-sm">
                  <th className="p-4">Date</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="p-4 text-slate-300">{t.transaction_date}</td>
                    <td className="p-4 font-medium text-white">{t.description}</td>
                    <td className="p-4 text-slate-300">{t.category}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}