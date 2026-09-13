import { NextResponse } from 'next/server';
import { searchTransactions } from '../../../../lib/ai/retriever';
import { createRAGChain } from '../../../../lib/ai/chains';

export async function POST(req) {
  try {
    const { question, userId } = await req.json();
    
    const retrievedDocs = await searchTransactions(question, userId);
    const context = retrievedDocs.map(d => d.content).join('\n---\n');

    const chain = createRAGChain();
    const answer = await chain.invoke({ context: context || 'No relevant past transactions found.', question });

    return NextResponse.json({ answer, sources: retrievedDocs });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}