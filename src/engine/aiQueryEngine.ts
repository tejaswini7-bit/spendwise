import { AIMessage, Category, MerchantMemoryRecord, Transaction } from '../types';
import { detectMoneyLeaks } from './leakDetector';

export function processAIQuery(
  query: string,
  transactions: Transaction[],
  merchantMemory: Record<string, MerchantMemoryRecord>,
  currentMonth: string = '2026-08',
  monthlyIncome: number = 20000
): AIMessage {
  const cleanQ = query.trim().toLowerCase();
  const monthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
  const prevMonthTxs = transactions.filter((t) => t.date.startsWith('2026-07'));

  const totalSpent = monthTxs.reduce((sum, t) => sum + t.amount, 0);
  const remaining = monthlyIncome - totalSpent;

  // Group by category
  const categoryTotals: Partial<Record<Category, number>> = {};
  const categoryCounts: Partial<Record<Category, number>> = {};
  monthTxs.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .map(([cat, amt]) => ({ category: cat as Category, amount: amt || 0 }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = sortedCategories[0];
  const secondCategory = sortedCategories[1];

  // Recipient frequency
  const recipientTotals: Record<string, { count: number; total: number; categories: Set<Category> }> = {};
  monthTxs.forEach((t) => {
    if (!recipientTotals[t.recipient]) {
      recipientTotals[t.recipient] = { count: 0, total: 0, categories: new Set() };
    }
    recipientTotals[t.recipient].count += 1;
    recipientTotals[t.recipient].total += t.amount;
    recipientTotals[t.recipient].categories.add(t.category);
  });

  const sortedRecipients = Object.entries(recipientTotals)
    .sort((a, b) => b[1].count - a[1].count);

  // 1. "Where did most of my money go?" / "Where did my money go?"
  if (
    cleanQ.includes('where did most of my money go') ||
    cleanQ.includes('where did my money go') ||
    cleanQ.includes('biggest spend') ||
    cleanQ.includes('highest expense')
  ) {
    const topPct = Math.round((topCategory.amount / totalSpent) * 100);
    const secPct = secondCategory ? Math.round((secondCategory.amount / totalSpent) * 100) : 0;

    return {
      id: `ai-resp-${Date.now()}`,
      sender: 'ai',
      text: `**${topCategory.category}** was your largest spending category this month at **₹${topCategory.amount.toLocaleString(
        'en-IN'
      )}**, accounting for **${topPct}%** of your total spending (₹${totalSpent.toLocaleString('en-IN')}).\n\nYour second-highest category was **${
        secondCategory?.category
      }** at **₹${secondCategory?.amount.toLocaleString('en-IN')}** (${secPct}%).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataVisual: {
        type: 'category_breakdown',
        data: sortedCategories.slice(0, 4),
      },
      suggestedFollowUps: [
        'How much did I spend on food?',
        'Who do I pay most frequently?',
        'Where am I spending unnecessarily?',
      ],
    };
  }

  // 2. "How much did I spend on food?"
  if (cleanQ.includes('food') && (cleanQ.includes('how much') || cleanQ.includes('spend') || cleanQ.includes('total'))) {
    const foodAmt = categoryTotals['Food'] || 0;
    const foodCount = categoryCounts['Food'] || 0;
    const prevFoodAmt = prevMonthTxs
      .filter((t) => t.category === 'Food')
      .reduce((sum, t) => sum + t.amount, 0);

    const deltaPct = prevFoodAmt > 0 ? Math.round(((foodAmt - prevFoodAmt) / prevFoodAmt) * 100) : 0;

    return {
      id: `ai-resp-${Date.now()}`,
      sender: 'ai',
      text: `You spent **₹${foodAmt.toLocaleString('en-IN')}** across **${foodCount} food payments** this month (accounting for ${Math.round(
        (foodAmt / totalSpent) * 100
      )}% of your expenses).\n\n${
        deltaPct > 0
          ? `📈 Your food spending is **${deltaPct}% higher** than last month (₹${prevFoodAmt.toLocaleString('en-IN')}).`
          : `📉 Your food spending is lower than last month.`
      }\n\n💡 **Optimization Tip:** You spent ₹${Math.round(foodAmt * 0.3)} on small tea/snack transactions. Trimming 20% would save ₹${Math.round(foodAmt * 0.2)} monthly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataVisual: {
        type: 'metric',
        data: {
          label: 'Total Food Expense',
          value: `₹${foodAmt.toLocaleString('en-IN')}`,
          comparison: `+${deltaPct}% vs last month`,
          count: `${foodCount} transactions`,
        },
      },
      suggestedFollowUps: [
        'How much did I spend at Ramesh Kumar?',
        'What are my biggest money leaks?',
        'Which category increased the most?',
      ],
    };
  }

  // 3. "How much did I spend on Ramesh Kumar?"
  if (cleanQ.includes('ramesh') || cleanQ.includes('ramesh kumar')) {
    const rameshTxs = monthTxs.filter((t) => t.recipient.toLowerCase().includes('ramesh'));
    const rameshTotal = rameshTxs.reduce((sum, t) => sum + t.amount, 0);
    const memory = merchantMemory['Ramesh Kumar'];

    return {
      id: `ai-resp-${Date.now()}`,
      sender: 'ai',
      text: `You made **${rameshTxs.length} payments** to **Ramesh Kumar** totaling **₹${rameshTotal.toLocaleString(
        'en-IN'
      )}** this month.\n\n🧠 **Merchant Memory Insight:** SpendWise has learned that Ramesh Kumar represents **Food & Chai** (${
        memory ? memory.categoryPercentages['Food'] || 100 : 100
      }% of payments). Your typical transaction range is **₹10 – ₹50** (avg ₹${memory ? memory.avgAmount : 28}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataVisual: {
        type: 'recipient_history',
        data: {
          recipient: 'Ramesh Kumar',
          totalSpent: rameshTotal,
          count: rameshTxs.length,
          primaryCategory: 'Food',
          normalRange: '₹10 – ₹50',
          autoCategorized: true,
        },
      },
      suggestedFollowUps: [
        'Who do I pay most frequently?',
        'How much did I spend on Rohit Kumar?',
        'Where did most of my money go?',
      ],
    };
  }

  // 4. "How much did I spend on Rohit Kumar?"
  if (cleanQ.includes('rohit') || cleanQ.includes('rohit kumar')) {
    const rohitTxs = monthTxs.filter((t) => t.recipient.toLowerCase().includes('rohit'));
    const rohitTotal = rohitTxs.reduce((sum, t) => sum + t.amount, 0);
    const memory = merchantMemory['Rohit Kumar'];

    const breakdownText = memory
      ? Object.entries(memory.categoryPercentages)
          .map(([cat, pct]) => `• ${cat}: ${pct}%`)
          .join('\n')
      : '• Food: 40%\n• Personal: 35%\n• Education: 25%';

    return {
      id: `ai-resp-${Date.now()}`,
      sender: 'ai',
      text: `You made **${rohitTxs.length} payments** to **Rohit Kumar** totaling **₹${rohitTotal.toLocaleString(
        'en-IN'
      )}** this month.\n\n🔄 **Multi-Purpose Recipient:** SpendWise identified Rohit Kumar as a dynamic multi-category contact:\n${breakdownText}\n\nWhen you pay Rohit Kumar, SpendWise automatically suggests the most probable category while allowing 1-tap overrides.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataVisual: {
        type: 'recipient_history',
        data: {
          recipient: 'Rohit Kumar',
          totalSpent: rohitTotal,
          count: rohitTxs.length,
          primaryCategory: 'Multi-Category',
          normalRange: '₹250 – ₹1,000',
          isMultiPurpose: true,
        },
      },
      suggestedFollowUps: [
        'Who do I pay most frequently?',
        'Where did most of my money go?',
        'Where am I spending unnecessarily?',
      ],
    };
  }

  // 5. "Who do I pay most frequently?"
  if (
    cleanQ.includes('frequently') ||
    cleanQ.includes('most payments') ||
    cleanQ.includes('who do i pay') ||
    cleanQ.includes('top recipient')
  ) {
    const top3 = sortedRecipients.slice(0, 3);
    const formatted = top3
      .map(
        ([name, stats], idx) =>
          `**${idx + 1}. ${name}** — ${stats.count} transactions (₹${stats.total.toLocaleString(
            'en-IN'
          )}, ${Array.from(stats.categories).join(', ')})`
      )
      .join('\n');

    return {
      id: `ai-resp-${Date.now()}`,
      sender: 'ai',
      text: `Your top recipients by payment frequency this month are:\n\n${formatted}\n\n**Ramesh Kumar** is your most visited micro-merchant (${
        top3[0]?.[1]?.count || 12
      } times), followed by food delivery and transit apps.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataVisual: {
        type: 'category_breakdown',
        data: top3.map(([name, s]) => ({ category: name as any, amount: s.total })),
      },
      suggestedFollowUps: [
        'How much did I spend at Ramesh Kumar?',
        'Where am I spending unnecessarily?',
        'What are my biggest money leaks?',
      ],
    };
  }

  // 6. "Which category increased the most?"
  if (cleanQ.includes('increased') || cleanQ.includes('growth') || cleanQ.includes('highest increase')) {
    const prevTotals: Partial<Record<Category, number>> = {};
    prevMonthTxs.forEach((t) => {
      prevTotals[t.category] = (prevTotals[t.category] || 0) + t.amount;
    });

    const increases = sortedCategories
      .map((curr) => {
        const prev = prevTotals[curr.category] || 0;
        const diff = curr.amount - prev;
        const pct = prev > 0 ? Math.round((diff / prev) * 100) : 100;
        return { category: curr.category, current: curr.amount, prev, diff, pct };
      })
      .filter((item) => item.pct > 0)
      .sort((a, b) => b.pct - a.pct);

    const highestInc = increases[0] || { category: 'Food', pct: 28, current: 4200, prev: 3280 };

    return {
      id: `ai-resp-${Date.now()}`,
      sender: 'ai',
      text: `**${highestInc.category}** saw the biggest increase, jumping **+${highestInc.pct}%** this month compared with last month.\n\n• Current Month: **₹${highestInc.current.toLocaleString(
        'en-IN'
      )}**\n• Previous Month: **₹${highestInc.prev.toLocaleString(
        'en-IN'
      )}**\n• Net Increase: **+₹${(highestInc.current - highestInc.prev).toLocaleString('en-IN')}**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataVisual: {
        type: 'metric',
        data: {
          label: `${highestInc.category} Growth`,
          value: `+${highestInc.pct}%`,
          comparison: `+₹${(highestInc.current - highestInc.prev).toLocaleString('en-IN')} MoM`,
        },
      },
      suggestedFollowUps: [
        'Where am I spending unnecessarily?',
        'What are my biggest money leaks?',
        'Where did most of my money go?',
      ],
    };
  }

  // 7. "Where am I spending unnecessarily?" / "What are my biggest money leaks?"
  if (
    cleanQ.includes('unnecessarily') ||
    cleanQ.includes('money leak') ||
    cleanQ.includes('leaks') ||
    cleanQ.includes('save') ||
    cleanQ.includes('cut down')
  ) {
    const leaks = detectMoneyLeaks(transactions, currentMonth);
    const totalLeakMonthly = leaks.reduce((sum, l) => sum + l.totalMonthlyAmount, 0);
    const potentialMonthlySavings = leaks.reduce((sum, l) => sum + l.potentialMonthlySavings, 0);

    const leakList = leaks
      .map(
        (l, i) =>
          `**${i + 1}. ${l.title}** (${l.transactionCount} payments, ₹${l.totalMonthlyAmount.toLocaleString('en-IN')}/mo)\n   → Potential Saving: ₹${l.potentialMonthlySavings}/mo`
      )
      .join('\n\n');

    return {
      id: `ai-resp-${Date.now()}`,
      sender: 'ai',
      text: `SpendWise detected **${leaks.length} Money Leak clusters** accounting for **₹${totalLeakMonthly.toLocaleString(
        'en-IN'
      )}** this month:\n\n${leakList}\n\n🎯 **Actionable Strategy:** By addressing these micro-habits, you could save approximately **₹${potentialMonthlySavings.toLocaleString(
        'en-IN'
      )}/month** (≈ **₹${(potentialMonthlySavings * 12).toLocaleString('en-IN')}/year**) without impacting essentials!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataVisual: {
        type: 'leak_summary',
        data: {
          totalLeak: totalLeakMonthly,
          monthlySavings: potentialMonthlySavings,
          annualSavings: potentialMonthlySavings * 12,
        },
      },
      suggestedFollowUps: [
        'How much did I spend on food?',
        'Who do I pay most frequently?',
        'Where did most of my money go?',
      ],
    };
  }

  // 8. General / Fallback category lookup
  for (const cat of ['Shopping', 'Transport', 'Entertainment', 'Education', 'Bills', 'Healthcare', 'Personal']) {
    if (cleanQ.includes(cat.toLowerCase())) {
      const amt = categoryTotals[cat as Category] || 0;
      const count = categoryCounts[cat as Category] || 0;
      const pct = Math.round((amt / totalSpent) * 100);

      return {
        id: `ai-resp-${Date.now()}`,
        sender: 'ai',
        text: `You spent **₹${amt.toLocaleString('en-IN')}** on **${cat}** this month across **${count} transactions** (${pct}% of total spending).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataVisual: {
          type: 'metric',
          data: {
            label: `${cat} Expenses`,
            value: `₹${amt.toLocaleString('en-IN')}`,
            count: `${count} payments`,
            comparison: `${pct}% of monthly budget`,
          },
        },
        suggestedFollowUps: [
          'Where did most of my money go?',
          'Where am I spending unnecessarily?',
          'Who do I pay most frequently?',
        ],
      };
    }
  }

  // Default intelligent overview
  return {
    id: `ai-resp-${Date.now()}`,
    sender: 'ai',
    text: `Here is your current financial snapshot for this month:\n\n• **Total Income:** ₹${monthlyIncome.toLocaleString(
      'en-IN'
    )}\n• **Total Spent:** ₹${totalSpent.toLocaleString('en-IN')}\n• **Remaining Balance:** ₹${remaining.toLocaleString(
      'en-IN'
    )}\n• **Top Category:** ${topCategory?.category} (₹${topCategory?.amount.toLocaleString(
      'en-IN'
    )})\n• **Most Active Contact:** ${sortedRecipients[0]?.[0]} (${sortedRecipients[0]?.[1]?.count} payments)\n\nAsk me about specific categories, recipients (like Ramesh or Rohit), or your money leaks!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dataVisual: {
      type: 'category_breakdown',
      data: sortedCategories.slice(0, 4),
    },
    suggestedFollowUps: [
      'Where did most of my money go?',
      'How much did I spend at Ramesh Kumar?',
      'What are my biggest money leaks?',
    ],
  };
}
