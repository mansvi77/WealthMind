import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { supabase } from '../supabase/client';

export async function createFinancialAgent(userId) {
  const model = new ChatOpenAI({ modelName: 'gpt-4o-mini', temperature: 0 });

  const fetchSummaryTool = new DynamicStructuredTool({
    name: 'get_financial_summary',
    description: 'Calculates total income, expenses, and net savings from the user database.',
    schema: z.object({}),
    func: async () => {
      const { data } = await supabase.from('transactions').select('*').eq('user_id', userId);
      if (!data) return JSON.stringify({ income: 0, expense: 0, net: 0 });
      
      const income = data.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const expense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      return JSON.stringify({ totalIncome: income, totalExpense: expense, netSavings: income - expense });
    },
  });

  const tools = [fetchSummaryTool];
  const prompt = await pull('hwchase17/openai-tools-agent');
  
  const agent = await createOpenAIToolsAgent({
    llm: model,
    tools,
    prompt,
  });

  return new AgentExecutor({ agent, tools, verbose: false });
}