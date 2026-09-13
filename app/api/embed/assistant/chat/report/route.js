import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabaseClient';
import { createRAGChain } from '../../../../../lib/ai/chains';

export async function POST(req) {
  try {
    const { userId } = await req.json();

    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(100);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: transactions, error } = await query;
    if (error) throw error;

    const context = transactions && transactions.length > 0
      ? transactions.map(t => `${t.date || t.transaction_date}: ${t.description} - ₹${t.amount} (${t.type}, ${t.category})`).join('\n')
      : 'No transaction ledger history available.';

    const chain = createRAGChain();
    const prompt = 'Generate a comprehensive executive financial health report analyzing cash flow trends, spending distribution across categories, anomaly patterns, and actionable wealth optimization strategies based on the provided transaction ledger.';
    
    const report = await chain.invoke({ context, question: prompt });

    return NextResponse.json({ success: true, report });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}