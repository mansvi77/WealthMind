'use client';

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FinancialReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/report');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate report.');
        setReport(data.report);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 text-slate-100 pb-16">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial Health Report</h1>
            <p className="text-xs text-slate-400">Deterministic metrics synthesized with AI narrative analysis</p>
          </div>
        </div>
        <Link href="/dashboard" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Synthesizing deterministic metrics & generating AI health report...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-rose-300 text-sm">
          Error generating report: {error}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
          <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">
            {report}
          </div>
        </div>
      )}
    </div>
  );
}