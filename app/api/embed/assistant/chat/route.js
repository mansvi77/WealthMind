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
      // 2. SEAMLESS SMART FALLBACK (Clean presentation, no error exposure)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      const txList = transactions || [];
      let filteredTx = txList;
      let heading = "Here is an overview of your financial records:";

      if (lowerMsg.includes('commute') || lowerMsg.includes('fuel') || lowerMsg.includes('travel') || lowerMsg.includes('uber')) {
        filteredTx = txList.filter(t => ['travel', 'transport', 'fuel', 'cab', 'uber'].some(k => t.category?.toLowerCase().includes(k) || t.description?.toLowerCase().includes(k)));
        heading = "Here are your commuting and travel-related records:";
      } else if (lowerMsg.includes('highest') || lowerMsg.includes('most') || lowerMsg.includes('max')) {
        filteredTx = [...txList].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 3);
        heading = "Here are your highest recorded financial transactions:";
      } else {
        filteredTx = txList.slice(0, 5);
        heading = "Here are your most recent financial entries:";
      }

      if (filteredTx.length === 0) {
        return NextResponse.json({ reply: "I couldn't find any matching transactions in your account records." });
      }

      const totalVolume = filteredTx.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      
      const formattedLines = filteredTx.map((t, index) => 
        `${index + 1}. **${t.description}** — ₹${Number(t.amount).toLocaleString()} (${t.category || 'General'}, ${t.date || 'Recent'})`
      ).join('\n');

      const cleanReply = `${heading}\n\n${formattedLines}\n\n---\n**Total Volume:** ₹${totalVolume.toLocaleString()}`;

      return NextResponse.json({ reply: cleanReply });
    }

  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}