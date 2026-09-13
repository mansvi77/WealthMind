import { supabase } from '../supabaseClient';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function searchTransactions(queryText, userId, matchThreshold = 0.7, matchCount = 5) {
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: queryText.replace(/\n/g, ' '),
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  const { data, error } = await supabase.rpc('match_transactions', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: matchThreshold,
    match_count: matchCount,
    p_user_id: userId,
  });

  if (error) {
    console.error('Vector search error:', error.message);
    throw new Error(error.message);
  }

  return data || [];
}