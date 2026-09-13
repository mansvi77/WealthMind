import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export function createRAGChain() {
  const model = new ChatOpenAI({ modelName: 'gpt-4o-mini', temperature: 0.2 });
  
  const prompt = PromptTemplate.fromTemplate(`
You are WealthMind AI, an expert personal financial co-pilot. Answer the user's question using only the provided context retrieved from their transaction history.

Context Transactions:
{context}

User Question: {question}

Financial Analysis Guidelines:
- Be precise, actionable, and transparent about amounts.
- If the context lacks enough details to answer, state what is missing clearly.
- Maintain a professional, supportive, and data-driven tone.

Answer:
  `);

  return prompt.pipe(model).pipe(new StringOutputParser());
}