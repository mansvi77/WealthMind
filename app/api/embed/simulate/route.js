import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runMonteCarlo } from '@/lib/ai/montecarlo'; 
// Note: If montecarlo.js is nested deeper inside lib/ai/, adjust the relative path above accordingly (e.g., '../../lib/ai/montecarlo')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { userId } = await req.json();

    // 1. Fetch user transactions from Supabase
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*');

    if (error) throw error;

    const txList = transactions || [];

    // 2. Validate sufficient historical data
    if (txList.length === 0) {
      return NextResponse.json(
        { error: 'Insufficient transaction history to run stochastic projections. Please add transactions first.' },
        { status: 400 }
      );
    }

    // 3. Compute real parameters from user data
    const incomes = txList.filter(t => t.type === 'income' || Number(t.amount) > 0).map(t => Number(t.amount) || 0);
    const expenses = txList.filter(t => t.type === 'expense' || Number(t.amount) < 0).map(t => Math.abs(Number(t.amount)) || 0);

    const totalIncome = incomes.reduce((a, b) => a + b, 0);
    const totalExpense = expenses.reduce((a, b) => a + b, 0);

    const monthlyInflow = totalIncome > 0 ? totalIncome / 3 : 30000;
    const monthlyOutflow = totalExpense > 0 ? totalExpense / 3 : 20000;
    const currentSavings = Math.max(0, totalIncome - totalExpense);

    // 4. Execute the genuine Monte Carlo simulation engine
    const simulationResult = runMonteCarlo({
      currentSavings: currentSavings > 0 ? currentSavings : 50000,
      monthlyInflow,
      monthlyOutflow,
      volatility: 0.15,
      months: 12,
      runs: 1000,
    });

    const finalBalances = simulationResult.samplePaths.map(path => path[path.length - 1]);
    const avgFinalCorpus = finalBalances.reduce((a, b) => a + b, 0) / finalBalances.length;

    return NextResponse.json({
      successRate: `${simulationResult.survivalProbability}%`,
      projectedCorpus: `₹${Math.round(avgFinalCorpus).toLocaleString()}`,
      volatilityIndex: simulationResult.survivalProbability > 80 ? 'Stable (Low Variance)' : 'High Risk (Volatility Warning)',
      details: simulationResult
    });

  } catch (err) {
    console.error('Simulation API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}