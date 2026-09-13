import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { generateEmbedding } from '@/lib/ai/embeddings';

export async function POST(req) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized authentication session.' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { transactionId, text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Valid text content is required for embedding generation.' }, { status: 400 });
    }

    // 1. Generate embedding vector via canonical provider
    const embedding = await generateEmbedding(text);

    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json({ error: 'Failed to generate valid embedding vector.' }, { status: 500 });
    }

    // 2. Upsert or store into transaction_embeddings table if transactionId is supplied
    if (transactionId) {
      const { error: upsertError } = await supabase
        .from('transaction_embeddings')
        .upsert({
          user_id: userId,
          transaction_id: transactionId,
          embedding: JSON.stringify(embedding),
        }, { onConflict: 'transaction_id' });

      if (upsertError) {
        console.error('Embedding database storage error:', upsertError);
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, dimension: embedding.length });
  } catch (err) {
    console.error('Embed API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error during embedding synchronization.' }, { status: 500 });
  }
}