import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { message, userId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const lowerMsg = message.toLowerCase();

    // 1. ATTEMPT OPENAI RAG FIRST
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: message.replace(/\n/g, ' '),
      });
      const queryVector = embeddingResponse.data[0].embedding;

      const { data: matchedTx } = await supabase.rpc('match_transactions', {
        query_embedding: queryVector,
        match_threshold: 0.1,
        match_count: 5,
        p_user_id: userId || '00000000-0000-0000-0000-000000000000'
      });

      const contextText = matchedTx && matchedTx.length > 0
        ? matchedTx.map(t => `- Date: ${t.date} | Description: ${t.description} | Category: ${t.category} | Amount: ₹${t.amount}`).join('\n')
        : "No direct transaction matches found.";

      const systemPrompt = `You are WealthMind, a professional financial intelligence assistant. Provide clear, direct, and well-structured answers using the provided transaction data without mentioning technical implementation details.\n\nTransaction Data:\n${contextText}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
      });

      return NextResponse.json({ reply: completion.choices[0].message.content });

    } catch (openaiErr) {
      // 2. INTELLIGENT DETERMINISTIC FALLBACK (Prioritized specific intent checks)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      const txList = transactions || [];
      
      if (txList.length === 0) {
        return NextResponse.json({ reply: "I couldn't find any transaction records in your database to analyze." });
      }

      let cleanReply = "";

      // INTENT 1: SAVINGS / MONTHLY SAVINGS SUMMARY
      if (lowerMsg.includes('saving') || lowerMsg.includes('save') || lowerMsg.includes('surplus')) {
        const totalIncome = txList
          .filter(t => t.type === 'income' || Number(t.amount) > 0)
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const totalExpense = txList
          .filter(t => t.type === 'expense' || Number(t.amount) < 0)
          .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

        const netSavings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

        cleanReply = `Here is your financial savings breakdown:\n\n` +
          `- **Total Inflows:** ₹${totalIncome.toLocaleString()}\n` +
          `- **Total Outflows:** ₹${totalExpense.toLocaleString()}\n` +
          `- **Net Accumulated Savings:** ₹${netSavings.toLocaleString()}\n` +
          `- **Savings Efficiency Rate:** ${savingsRate}%\n\n` +
          `---\n**Summary:** Your financial profile shows a solid net retained liquidity across your recorded history.`;
      } 
      
      // INTENT 2: RECURRING EXPENSES / SUBSCRIPTIONS
      else if (lowerMsg.includes('recurring') || lowerMsg.includes('subscription') || lowerMsg.includes('fixed') || lowerMsg.includes('monthly spend')) {
        const recurringItems = txList.filter(t => 
          t.is_recurring || 
          (t.category && ['subscription', 'utilities', 'rent', 'wifi', 'ott'].some(c => t.category.toLowerCase().includes(c))) ||
          Number(t.amount) < 0
        ).slice(0, 4);

        if (recurringItems.length === 0) {
          cleanReply = "No specific recurring subscriptions or fixed expenses were flagged in your transaction logs.";
        } else {
          const totalRecurring = recurringItems.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
          const formatted = recurringItems.map((t, idx) => 
            `${idx + 1}. **${t.description || t.category || 'Subscription'}** — ₹${Math.abs(Number(t.amount)).toLocaleString()} (${t.category || 'General'})`
          ).join('\n');

          cleanReply = `Here are your detected recurring and fixed expenses:\n\n${formatted}\n\n---\n**Estimated Monthly Recurring Volume:** ₹${totalRecurring.toLocaleString()}`;
        }
      } 
      
      // INTENT 3: HIGHEST SPENDING / WHERE AM I SPENDING THE MOST
      else if (lowerMsg.includes('spend') || lowerMsg.includes('where') || lowerMsg.includes('expense') || lowerMsg.includes('highest') || lowerMsg.includes('most') || lowerMsg.includes('max')) {
        const topExpenses = txList
          .filter(t => t.type === 'expense' || Number(t.amount) < 0 || (t.type !== 'income' && Number(t.amount) < 50000))
          .map(t => ({ ...t, absAmount: Math.abs(Number(t.amount) || 0) }))
          .sort((a, b) => b.absAmount - a.absAmount)
          .slice(0, 3);

        if (topExpenses.length === 0) {
          cleanReply = "No significant spending records found to analyze.";
        } else {
          const totalSpent = topExpenses.reduce((sum, t) => sum + t.absAmount, 0);
          const formatted = topExpenses.map((t, idx) => 
            `${idx + 1}. **${t.description || t.category || 'Expense'}** — ₹${t.absAmount.toLocaleString()} (${t.category || 'General'}, ${t.date || 'Recent'})`
          ).join('\n');

          cleanReply = `Here are your highest recorded spending items:\n\n${formatted}\n\n---\n**Top Outflows Volume:** ₹${totalSpent.toLocaleString()}`;
        }
      } 
      
      // INTENT 4: COMMUTE / TRAVEL
      else if (lowerMsg.includes('commute') || lowerMsg.includes('fuel') || lowerMsg.includes('travel') || lowerMsg.includes('uber')) {
        const travelTx = txList.filter(t => ['travel', 'transport', 'fuel', 'cab', 'uber'].some(k => t.category?.toLowerCase().includes(k) || t.description?.toLowerCase().includes(k)));
        
        if (travelTx.length === 0) {
          cleanReply = "No commuting or travel-related transactions found in your records.";
        } else {
          const totalTravel = travelTx.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
          const formatted = travelTx.slice(0, 3).map((t, idx) => 
            `${idx + 1}. **${t.description}** — ₹${Math.abs(Number(t.amount)).toLocaleString()} (${t.date || 'Recent'})`
          ).join('\n');

          cleanReply = `Here are your commuting and travel records:\n\n${formatted}\n\n---\n**Total Travel Outflow:** ₹${totalTravel.toLocaleString()}`;
        }
      } 
      
      // DEFAULT FALLBACK: GENERAL RECENT SNAPSHOT
      else {
        const recent = txList.slice(0, 4);
        const totalVol = recent.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
        const formatted = recent.map((t, idx) => 
          `${idx + 1}. **${t.description}** — ₹${Math.abs(Number(t.amount)).toLocaleString()} (${t.category || 'General'})`
        ).join('\n');

        cleanReply = `Here is a summary of your most recent financial entries:\n\n${formatted}\n\n---\n**Recent Volume:** ₹${totalVol.toLocaleString()}`;
      }

      return NextResponse.json({ reply: cleanReply });
    }

  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}