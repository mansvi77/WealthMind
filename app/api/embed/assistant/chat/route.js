import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { generateEmbedding } from '@/lib/ai/embeddings';
import { searchTransactions } from '@/lib/ai/retriever';
import { createRAGChain } from '@/lib/ai/chains';

export async function POST(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized authentication session.' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const question = body?.question;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Valid question parameter is required.' }, { status: 400 });
    }

    // 1. Generate query embedding using canonical provider
    let queryEmbedding = null;
    try {
      queryEmbedding = await generateEmbedding(question);
    } catch (embErr) {
      console.error('Embedding generation warning:', embErr);
    }

    // 2. Perform user-scoped vector similarity retrieval
    let retrievedTransactions = [];
    if (queryEmbedding) {
      try {
        retrievedTransactions = await searchTransactions(userId, queryEmbedding, 5);
      } catch (searchErr) {
        console.error('Vector search warning:', searchErr);
      }
    }

    // 3. Gather deterministic financial totals for grounded context
    const { data: allTxs } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    let totalIncome = 0;
    let totalExpenses = 0;
    const catTotals = {};

    if (allTxs) {
      allTxs.forEach((t) => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') totalIncome += amt;
        else {
          totalExpenses += amt;
          catTotals[t.category] = (catTotals[t.category] || 0) + amt;
        }
      });
    }

    const deterministicContext = {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryBreakdown: catTotals,
      recentTransactions: allTxs ? allTxs.slice(0, 15) : [],
    };

    // 4. Invoke RAG chain / LLM response
    const ragChain = createRAGChain();
    const answer = await ragChain.invoke({
      question,
      contextTransactions: retrievedTransactions,
      deterministicMetrics: deterministicContext,
    });

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('Assistant API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error in assistant.' }, { status: 500 });
  }
}