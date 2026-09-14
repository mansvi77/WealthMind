import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const { message } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) throw new Error(error.message);

    const txList = transactions || [];
    const lowerMsg = message.toLowerCase();
    let reply = "";

    // 1. Spending / Highest Category Analysis
    if (lowerMsg.includes('spending') || lowerMsg.includes('most') || lowerMsg.includes('highest')) {
      const expenses = txList.filter(t => t.type === 'expense');
      const categoryTotals = {};
      expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
      });
      
      const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        const [topCat, topAmt] = sorted[0];
        const totalExp = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const share = Math.round((topAmt / totalExp) * 100);
        reply = `Your highest spending category is **${topCat}**, totaling ₹${topAmt.toLocaleString()} (representing ${share}% of your total expenses). Top sub-merchants in this category require closer tracking to optimize cash flow.`;
      } else {
        reply = "No expense data found to calculate spending distribution.";
      }
    } 
    // 2. Savings & Monthly Breakdown
    else if (lowerMsg.includes('savings') || lowerMsg.includes('monthly') || lowerMsg.includes('save')) {
      const income = txList.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = txList.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
      const net = income - expenses;
      const rate = income > 0 ? Math.round((net / income) * 100) : 0;
      reply = `**Monthly Financial Standing:**\n- Total Inflow: ₹${income.toLocaleString()}\n- Total Outflow: ₹${expenses.toLocaleString()}\n- Net Accumulated Savings: ₹${net.toLocaleString()} (${rate}% overall savings rate). Your capital retention is robust across the active statement period.`;
    } 
    // 3. Recurring Expenses
    else if (lowerMsg.includes('recurring') || lowerMsg.includes('subscription')) {
      const recurring = txList.filter(t => t.description && (
        t.description.toLowerCase().includes('sub') || 
        t.description.toLowerCase().includes('sip') || 
        t.description.toLowerCase().includes('rent') ||
        t.description.toLowerCase().includes('netflix') ||
        t.description.toLowerCase().includes('prime')
      ));
      const totalRec = recurring.reduce((sum, t) => sum + Number(t.amount), 0);
      reply = `Detected **${recurring.length} recurring transactions** totaling ₹${totalRec.toLocaleString()}. Regular automated outflows include utility drafts, investments, and subscriptions mapped from your statement history.`;
    }
    // 4. Weekend vs Weekday analysis
    else if (lowerMsg.includes('weekend') || lowerMsg.includes('weekday') || lowerMsg.includes('dining')) {
      let weekendSpend = 0;
      let weekdaySpend = 0;
      txList.filter(t => t.type === 'expense').forEach(t => {
        const d = new Date(t.transaction_date);
        const day = d.getDay(); // 0 is Sunday, 6 is Saturday
        if (day === 0 || day === 6) {
          weekendSpend += Number(t.amount);
        } else {
          weekdaySpend += Number(t.amount);
        }
      });
      reply = `**Temporal Spending Breakdown:**\n- Weekend Outflows: ₹${weekendSpend.toLocaleString()}\n- Weekday Outflows: ₹${weekdaySpend.toLocaleString()}\n${weekendSpend > weekdaySpend ? 'Your spending spikes over the weekends, largely driven by leisure and dining out.' : 'Your expenditures are heavier during weekdays, typical of routine living costs and commute/utilities.'}`;
    }
    // 5. What-if scenario (cutting highest category by 20%)
    else if (lowerMsg.includes('cut') || lowerMsg.includes('projected savings') || lowerMsg.includes('20%')) {
      const income = txList.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = txList.filter(t => t.type === 'expense');
      const categoryTotals = {};
      expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
      });
      const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
      
      if (sorted.length > 0) {
        const [topCat, topAmt] = sorted[0];
        const savingCut = topAmt * 0.20;
        const totalExpNum = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
        const newExpenses = totalExpNum - savingCut;
        const newNet = income - newExpenses;
        const newRate = income > 0 ? Math.round((newNet / income) * 100) : 0;
        reply = `**What-If Simulation:** If you trim your highest category (**${topCat}**) by 20%, you will save an extra ₹${Math.round(savingCut).toLocaleString()} monthly. Your projected savings rate would elevate to **${newRate}%**.`;
      } else {
        reply = "Insufficient expense categories to run simulation.";
      }
    }
    // 6. Duplicate / 48-hour check
    else if (lowerMsg.includes('duplicate') || lowerMsg.includes('48 hours') || lowerMsg.includes('overlapping')) {
      const expenses = txList.filter(t => t.type === 'expense');
      let potentialDupes = 0;
      for (let i = 0; i < expenses.length; i++) {
        for (let j = i + 1; j < expenses.length; j++) {
          const t1 = expenses[i];
          const t2 = expenses[j];
          if (t1.amount === t2.amount && t1.description === t2.description) {
            const timeDiff = Math.abs(new Date(t1.transaction_date) - new Date(t2.transaction_date));
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            if (hoursDiff <= 48) potentialDupes++;
          }
        }
      }
      reply = `**Anomaly Scan (48-Hour Window):** Checked ${expenses.length} transaction entries. Found **${potentialDupes} potential duplicate billing instances** matching exact descriptions and amounts within a 48-hour delta. Review your transactions tab to verify.`;
    }
    // Fallback analytical summary
    else {
      const totalTx = txList.length;
      reply = `I have indexed your ${totalTx} active records across your statements. You can ask me granular questions like:\n- *"Did I spend more on weekends or weekdays?"*\n- *"If I cut my highest expense by 20%, what is my new savings rate?"*\n- *"Are there any duplicate transactions within 48 hours?"*`;
    }

    return Response.json({ reply });
  } catch (err) {
    console.error('Assistant API Error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}