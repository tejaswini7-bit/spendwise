import { MoneyLeakCluster, Transaction } from '../types';

export function detectMoneyLeaks(transactions: Transaction[], targetMonth: string = '2026-08'): MoneyLeakCluster[] {
  // Filter for target month
  const monthTxs = transactions.filter((t) => t.date.startsWith(targetMonth));

  const leaks: MoneyLeakCluster[] = [];

  // 1. Small Food & Chai Payments (< ₹100)
  const smallFood = monthTxs.filter(
    (t) => t.category === 'Food' && t.amount <= 100
  );
  if (smallFood.length >= 3) {
    const total = smallFood.reduce((sum, t) => sum + t.amount, 0);
    const avg = Math.round(total / smallFood.length);
    const uniqueRecipients = Array.from(new Set(smallFood.map((t) => t.recipient)));

    leaks.push({
      id: 'leak-small-food',
      title: 'Micro Food & Daily Chai Payments',
      category: 'Food',
      description: `You made ${smallFood.length} small food payments under ₹100 this month. These individually negligible amounts secretly drain your wallet.`,
      transactionCount: smallFood.length,
      totalMonthlyAmount: total,
      annualProjected: total * 12,
      avgPerTransaction: avg,
      sampleRecipients: uniqueRecipients,
      actionTip: `Limiting daily chai/snack runs by just 25% would save you approx. ₹${Math.round(total * 0.25)}/month (₹${Math.round(total * 0.25 * 12)}/year).`,
      potentialMonthlySavings: Math.round(total * 0.25),
    });
  }

  // 2. Short Quick Rides (< ₹150)
  const shortRides = monthTxs.filter(
    (t) => t.category === 'Transport' && t.amount <= 150
  );
  if (shortRides.length >= 2) {
    const total = shortRides.reduce((sum, t) => sum + t.amount, 0);
    const avg = Math.round(total / shortRides.length);
    const uniqueRecipients = Array.from(new Set(shortRides.map((t) => t.recipient)));

    leaks.push({
      id: 'leak-short-rides',
      title: 'Frequent Short Auto & Cab Rides',
      category: 'Transport',
      description: `${shortRides.length} micro-trips under ₹150 on short commutes where metro, bus, or walking could substitute.`,
      transactionCount: shortRides.length,
      totalMonthlyAmount: total,
      annualProjected: total * 12,
      avgPerTransaction: avg,
      sampleRecipients: uniqueRecipients,
      actionTip: `Consolidating or switching 3 short rides to public transit could save ~₹${Math.round(total * 0.35)}/month.`,
      potentialMonthlySavings: Math.round(total * 0.35),
    });
  }

  // 3. Multi-OTT & Digital Subscriptions
  const subs = monthTxs.filter((t) =>
    ['Netflix', 'Spotify', 'Prime Video', 'Steam Games'].includes(t.recipient)
  );
  if (subs.length >= 2) {
    const total = subs.reduce((sum, t) => sum + t.amount, 0);
    const avg = Math.round(total / subs.length);
    const uniqueRecipients = Array.from(new Set(subs.map((t) => t.recipient)));

    leaks.push({
      id: 'leak-subs',
      title: 'Stacked Entertainment Subscriptions',
      category: 'Entertainment',
      description: `Active recurring subscriptions to ${subs.length} entertainment platforms simultaneously.`,
      transactionCount: subs.length,
      totalMonthlyAmount: total,
      annualProjected: total * 12,
      avgPerTransaction: avg,
      sampleRecipients: uniqueRecipients,
      actionTip: `Rotating between services or sharing a family plan could recover ~₹${Math.round(total * 0.4)}/month.`,
      potentialMonthlySavings: Math.round(total * 0.4),
    });
  }

  // 4. Late-Night Food Deliveries (between 9:00 PM and 4:00 AM)
  const lateNightOrders = monthTxs.filter((t) => {
    if (t.category !== 'Food') return false;
    const hour = new Date(t.date).getHours();
    return hour >= 21 || hour < 4;
  });
  if (lateNightOrders.length >= 1) {
    const total = lateNightOrders.reduce((sum, t) => sum + t.amount, 0);
    const avg = Math.round(total / lateNightOrders.length);
    const uniqueRecipients = Array.from(new Set(lateNightOrders.map((t) => t.recipient)));

    leaks.push({
      id: 'leak-late-night',
      title: 'Late-Night Food Delivery Spikes',
      category: 'Food',
      description: `${lateNightOrders.length} food orders placed post 9:00 PM with surge delivery & packaging surcharges.`,
      transactionCount: lateNightOrders.length,
      totalMonthlyAmount: total,
      annualProjected: total * 12,
      avgPerTransaction: avg,
      sampleRecipients: uniqueRecipients,
      actionTip: `Preparing quick hostel snacks ahead of late-night study sessions can save ₹${Math.round(total * 0.5)}/month.`,
      potentialMonthlySavings: Math.round(total * 0.5),
    });
  }

  return leaks;
}
