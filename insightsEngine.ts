import { Category, SpendingInsight, Transaction } from '../types';

export function generateSpendingInsights(
  transactions: Transaction[],
  currentMonth: string = '2026-08',
  previousMonth: string = '2026-07'
): SpendingInsight[] {
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
  const prevMonthTxs = transactions.filter((t) => t.date.startsWith(previousMonth));

  const totalCurrentSpent = currentMonthTxs.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryTotals: Partial<Record<Category, number>> = {};
  const categoryCounts: Partial<Record<Category, number>> = {};

  currentMonthTxs.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const prevCategoryTotals: Partial<Record<Category, number>> = {};
  prevMonthTxs.forEach((t) => {
    prevCategoryTotals[t.category] = (prevCategoryTotals[t.category] || 0) + t.amount;
  });

  // Sort categories by spend
  const sortedCategories = Object.entries(categoryTotals)
    .map(([cat, amt]) => ({ category: cat as Category, amount: amt || 0 }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = sortedCategories[0];
  const secondCategory = sortedCategories[1];

  const insights: SpendingInsight[] = [];

  // 1. Top Spending Category Insight
  if (topCategory && totalCurrentSpent > 0) {
    const topPct = Math.round((topCategory.amount / totalCurrentSpent) * 100);
    insights.push({
      id: 'ins-top-cat',
      title: `${topCategory.category} is your highest spending area`,
      type: 'trend',
      description: `${topCategory.category} is your largest spending category at ₹${topCategory.amount.toLocaleString(
        'en-IN'
      )}, accounting for ${topPct}% of your total outflow this month.`,
      metric: `₹${topCategory.amount.toLocaleString('en-IN')} (${topPct}%)`,
      icon: 'PieChart',
      severity: 'info',
    });
  }

  // 2. Month-over-Month increase in Food / Top category
  if (topCategory) {
    const prevAmt = prevCategoryTotals[topCategory.category] || 0;
    if (prevAmt > 0) {
      const deltaPct = Math.round(((topCategory.amount - prevAmt) / prevAmt) * 100);
      if (deltaPct > 0) {
        insights.push({
          id: 'ins-cat-increase',
          title: `${topCategory.category} spending increased by ${deltaPct}%`,
          type: 'anomaly',
          description: `Your ${topCategory.category.toLowerCase()} spending increased by ${deltaPct}% compared with last month (₹${topCategory.amount.toLocaleString(
            'en-IN'
          )} vs ₹${prevAmt.toLocaleString('en-IN')}).`,
          metric: `+${deltaPct}% MoM`,
          icon: 'TrendingUp',
          severity: deltaPct > 20 ? 'warning' : 'info',
        });
      }
    }
  }

  // 3. Most frequent recipient (e.g. Ramesh Kumar)
  const recipientCounts: Record<string, { count: number; total: number; category: Category }> = {};
  currentMonthTxs.forEach((t) => {
    if (!recipientCounts[t.recipient]) {
      recipientCounts[t.recipient] = { count: 0, total: 0, category: t.category };
    }
    recipientCounts[t.recipient].count += 1;
    recipientCounts[t.recipient].total += t.amount;
  });

  const sortedRecipients = Object.entries(recipientCounts)
    .sort((a, b) => b[1].count - a[1].count);

  const topRecipient = sortedRecipients[0];
  if (topRecipient && topRecipient[1].count >= 3) {
    insights.push({
      id: 'ins-freq-recipient',
      title: `${topRecipient[0]} is your most frequent recipient`,
      type: 'frequency',
      description: `You made ${topRecipient[1].count} payments to ${topRecipient[0]} totaling ₹${topRecipient[1].total.toLocaleString(
        'en-IN'
      )} this month. Most were categorized as ${topRecipient[1].category}.`,
      metric: `${topRecipient[1].count} payments`,
      icon: 'Users',
      severity: 'positive',
    });
  }

  // 4. Micro-transactions count under ₹300
  const smallTxs = currentMonthTxs.filter((t) => t.amount <= 300);
  if (smallTxs.length >= 5) {
    const smallTotal = smallTxs.reduce((sum, t) => sum + t.amount, 0);
    insights.push({
      id: 'ins-small-txs',
      title: `${smallTxs.length} micro-payments under ₹300`,
      type: 'pattern',
      description: `You made ${smallTxs.length} small transactions under ₹300 this month, totaling ₹${smallTotal.toLocaleString(
        'en-IN'
      )}.`,
      metric: `₹${smallTotal.toLocaleString('en-IN')} total`,
      icon: 'Zap',
      severity: 'info',
    });
  }

  // 5. Second highest category
  if (secondCategory) {
    const secPct = Math.round((secondCategory.amount / totalCurrentSpent) * 100);
    insights.push({
      id: 'ins-sec-cat',
      title: `${secondCategory.category} is your second-largest category`,
      type: 'pattern',
      description: `${secondCategory.category} accounted for ₹${secondCategory.amount.toLocaleString(
        'en-IN'
      )} (${secPct}% of your budget) across ${categoryCounts[secondCategory.category] || 0} purchases.`,
      metric: `₹${secondCategory.amount.toLocaleString('en-IN')}`,
      icon: 'ShoppingBag',
      severity: 'info',
    });
  }

  // 6. Food transactions count
  const foodCount = categoryCounts['Food'] || 0;
  if (foodCount >= 5) {
    insights.push({
      id: 'ins-food-count',
      title: `${foodCount} food & dining payments logged`,
      type: 'pattern',
      description: `You made ${foodCount} food-related payments this month across tea stalls, canteens, and food apps.`,
      metric: `${foodCount} transactions`,
      icon: 'Utensils',
      severity: 'info',
    });
  }

  return insights;
}
