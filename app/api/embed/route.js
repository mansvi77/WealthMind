import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { generateEmbedding } from '../../../../lib/ai/embeddings';

export async function POST(req) {
  try {
    const { transactionId, userId, description, amount, category, date } = await req.json();

    const content = `Transaction on ${date}: ${description}, Amount: ${amount}, Category: ${category}`;
    const embedding = await generateEmbedding(content);

    const { error } = await supabase.from('transaction_embeddings').insert({
      transaction_id: transactionId,
      user_id: userId,
      content,
      embedding,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}