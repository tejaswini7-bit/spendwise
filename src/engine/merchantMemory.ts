import { Category, ClassificationType, MerchantMemoryRecord, Transaction } from '../types';

// Known commercial merchants dictionary
export const KNOWN_MERCHANTS: Record<string, Category> = {
  'Swiggy': 'Food',
  'Zomato': 'Food',
  'Blinkit': 'Food',
  'Zepto': 'Food',
  'Starbucks': 'Food',
  'McDonalds': 'Food',
  'Domino\'s Pizza': 'Food',
  'Myntra': 'Shopping',
  'Amazon': 'Shopping',
  'Flipkart': 'Shopping',
  'Zara': 'Shopping',
  'Ajio': 'Shopping',
  'Uber': 'Transport',
  'Rapido': 'Transport',
  'Ola Cabs': 'Transport',
  'Indian Oil': 'Transport',
  'Metro Rail': 'Transport',
  'Netflix': 'Entertainment',
  'Spotify': 'Entertainment',
  'BookMyShow': 'Entertainment',
  'Prime Video': 'Entertainment',
  'Coursera': 'Education',
  'Udemy': 'Education',
  'IITB Bookstore': 'Education',
  'Airtel': 'Bills',
  'Jio Fiber': 'Bills',
  'Tata Power': 'Bills',
  'BESCOM': 'Bills',
  'Apollo Pharmacy': 'Healthcare',
  'Netmeds': 'Healthcare',
  'MedPlus': 'Healthcare',
  'Dr. Lal PathLabs': 'Healthcare',
  'Local Medical Store': 'Healthcare',
};

export interface PredictionResult {
  category: Category;
  classificationType: ClassificationType;
  confidence: number;
  reason: string;
  isUnusual: boolean;
  isMultiPurpose: boolean;
  requiresPrompt: boolean;
  suggestedCategories?: { category: Category; percentage: number }[];
  normalRange?: { min: number; max: number; avg: number };
}

/**
 * Predicts the category and checks for anomalies for a given recipient and amount
 * using the current merchant memory records and known merchant list.
 */
export function predictPaymentCategory(
  recipient: string,
  amount: number,
  merchantMemory: Record<string, MerchantMemoryRecord>
): PredictionResult {
  const cleanName = recipient.trim();

  // 1. Check known merchants first
  const knownMatchKey = Object.keys(KNOWN_MERCHANTS).find(
    (k) => k.toLowerCase() === cleanName.toLowerCase()
  );

  if (knownMatchKey) {
    const cat = KNOWN_MERCHANTS[knownMatchKey];
    return {
      category: cat,
      classificationType: 'auto_merchant',
      confidence: 0.99,
      reason: `Recognized merchant: ${knownMatchKey} (${cat})`,
      isUnusual: false,
      isMultiPurpose: false,
      requiresPrompt: false,
    };
  }

  // 2. Check Merchant Memory for personal/custom recipients
  const memory = merchantMemory[cleanName];

  if (!memory || memory.totalTransactions === 0) {
    // Brand new recipient -> Ask user
    return {
      category: 'Food', // Default fallback
      classificationType: 'user_classified',
      confidence: 0.1,
      reason: 'Unknown recipient (First payment)',
      isUnusual: false,
      isMultiPurpose: false,
      requiresPrompt: true,
    };
  }

  const normalMin = memory.minAmount;
  const normalMax = memory.maxAmount;
  const avg = memory.avgAmount;

  // 3. Check for Unusual Amount Anomaly
  // E.g. Ramesh Kumar normally ₹10-₹50, but someone sends ₹1,500
  const isAnomalouslyHigh =
    memory.totalTransactions >= 2 &&
    amount >= normalMax * 3.5 &&
    amount >= 500;

  const isAnomalouslyLow =
    memory.totalTransactions >= 3 &&
    normalMin >= 200 &&
    amount < normalMin * 0.2;

  const isUnusual = isAnomalouslyHigh || isAnomalouslyLow;

  if (isUnusual) {
    return {
      category: memory.primaryCategory,
      classificationType: 'unusual_detected',
      confidence: 0.5,
      reason: `Unusual payment: You normally pay ${cleanName} ₹${normalMin}–₹${normalMax}`,
      isUnusual: true,
      isMultiPurpose: memory.isMultiPurpose,
      requiresPrompt: true,
      normalRange: { min: normalMin, max: normalMax, avg },
    };
  }

  // 4. Multi-Purpose Recipient (e.g. Rohit Kumar)
  if (memory.isMultiPurpose) {
    const suggested = Object.entries(memory.categoryPercentages)
      .map(([cat, pct]) => ({ category: cat as Category, percentage: pct || 0 }))
      .sort((a, b) => b.percentage - a.percentage);

    const topCategory = suggested[0]?.category || memory.primaryCategory;
    const topPct = suggested[0]?.percentage || 0;

    return {
      category: topCategory,
      classificationType: 'multi_purpose_suggested',
      confidence: Math.min(0.85, topPct / 100),
      reason: `Likely ${topCategory} (${topPct}% of previous payments to ${cleanName})`,
      isUnusual: false,
      isMultiPurpose: true,
      requiresPrompt: false, // Pre-selected, but shows multi-chips
      suggestedCategories: suggested,
      normalRange: { min: normalMin, max: normalMax, avg },
    };
  }

  // 5. Standard Learned / Auto-categorized Recipient (e.g. Ramesh Kumar -> Food)
  return {
    category: memory.primaryCategory,
    classificationType: 'merchant_memory',
    confidence: memory.confidence || 0.95,
    reason: `Remembered: Auto-categorized based on ${memory.totalTransactions} previous payment${
      memory.totalTransactions > 1 ? 's' : ''
    }`,
    isUnusual: false,
    isMultiPurpose: false,
    requiresPrompt: false,
    normalRange: { min: normalMin, max: normalMax, avg },
  };
}

/**
 * Recomputes memory records from a list of transactions
 */
export function buildMerchantMemoryFromTransactions(
  transactions: Transaction[]
): Record<string, MerchantMemoryRecord> {
  const memoryMap: Record<string, MerchantMemoryRecord> = {};

  transactions.forEach((tx) => {
    const recipient = tx.recipient.trim();
    if (!recipient) return;

    if (!memoryMap[recipient]) {
      const isKnown = Boolean(
        Object.keys(KNOWN_MERCHANTS).some(
          (k) => k.toLowerCase() === recipient.toLowerCase()
        )
      );

      memoryMap[recipient] = {
        recipient,
        upiId: tx.upiId,
        isKnownMerchant: isKnown,
        totalTransactions: 0,
        totalSpent: 0,
        primaryCategory: tx.category,
        categoryBreakdown: {},
        categoryPercentages: {},
        minAmount: tx.amount,
        maxAmount: tx.amount,
        avgAmount: tx.amount,
        isMultiPurpose: false,
        lastTransactionDate: tx.date,
        confidence: isKnown ? 0.99 : 0.85,
        memorySource: isKnown ? 'hardcoded_merchant' : 'learned',
      };
    }

    const rec = memoryMap[recipient];
    rec.totalTransactions += 1;
    rec.totalSpent += tx.amount;
    rec.minAmount = Math.min(rec.minAmount, tx.amount);
    rec.maxAmount = Math.max(rec.maxAmount, tx.amount);
    rec.avgAmount = Math.round(rec.totalSpent / rec.totalTransactions);

    if (new Date(tx.date) > new Date(rec.lastTransactionDate)) {
      rec.lastTransactionDate = tx.date;
    }

    rec.categoryBreakdown[tx.category] =
      (rec.categoryBreakdown[tx.category] || 0) + 1;
  });

  // Calculate percentages and primary categories
  Object.values(memoryMap).forEach((rec) => {
    let maxCount = 0;
    let topCategory: Category = 'Other';
    let distinctCategoriesCount = 0;

    Object.entries(rec.categoryBreakdown).forEach(([cat, count]) => {
      const c = cat as Category;
      const cnt = count || 0;
      if (cnt > 0) {
        distinctCategoriesCount++;
        const pct = Math.round((cnt / rec.totalTransactions) * 100);
        rec.categoryPercentages[c] = pct;

        if (cnt > maxCount) {
          maxCount = cnt;
          topCategory = c;
        }
      }
    });

    rec.primaryCategory = topCategory;
    // Multi-purpose if user has used >= 2 distinct categories and top category is < 80%
    const topPct = rec.categoryPercentages[topCategory] || 0;
    rec.isMultiPurpose = distinctCategoriesCount >= 2 && topPct < 85;
    rec.confidence = rec.isKnownMerchant
      ? 0.99
      : Math.min(0.98, Math.max(0.7, topPct / 100));
  });

  return memoryMap;
}

/**
 * Updates memory when a new transaction is added or an existing one is edited
 */
export function recordTransactionInMemory(
  currentMemory: Record<string, MerchantMemoryRecord>,
  recipient: string,
  category: Category,
  amount: number,
  upiId?: string
): Record<string, MerchantMemoryRecord> {
  const cleanName = recipient.trim();
  const existing = currentMemory[cleanName];

  const isKnown = Boolean(
    Object.keys(KNOWN_MERCHANTS).some(
      (k) => k.toLowerCase() === cleanName.toLowerCase()
    )
  );

  const updated: MerchantMemoryRecord = existing
    ? {
        ...existing,
        totalTransactions: existing.totalTransactions + 1,
        totalSpent: existing.totalSpent + amount,
        minAmount: Math.min(existing.minAmount, amount),
        maxAmount: Math.max(existing.maxAmount, amount),
        avgAmount: Math.round(
          (existing.totalSpent + amount) / (existing.totalTransactions + 1)
        ),
        lastTransactionDate: new Date().toISOString(),
        categoryBreakdown: {
          ...existing.categoryBreakdown,
          [category]: (existing.categoryBreakdown[category] || 0) + 1,
        },
      }
    : {
        recipient: cleanName,
        upiId: upiId || `${cleanName.toLowerCase().replace(/\s+/g, '')}@okaxis`,
        isKnownMerchant: isKnown,
        totalTransactions: 1,
        totalSpent: amount,
        primaryCategory: category,
        categoryBreakdown: { [category]: 1 },
        categoryPercentages: { [category]: 100 },
        minAmount: amount,
        maxAmount: amount,
        avgAmount: amount,
        isMultiPurpose: false,
        lastTransactionDate: new Date().toISOString(),
        confidence: isKnown ? 0.99 : 0.9,
        memorySource: isKnown ? 'hardcoded_merchant' : 'learned',
      };

  // Re-calculate percentages for this record
  let maxCount = 0;
  let topCategory = category;
  let distinctCount = 0;
  const newPercentages: Partial<Record<Category, number>> = {};

  Object.entries(updated.categoryBreakdown).forEach(([cat, count]) => {
    const c = cat as Category;
    const cnt = count || 0;
    if (cnt > 0) {
      distinctCount++;
      const pct = Math.round((cnt / updated.totalTransactions) * 100);
      newPercentages[c] = pct;
      if (cnt > maxCount) {
        maxCount = cnt;
        topCategory = c;
      }
    }
  });

  updated.categoryPercentages = newPercentages;
  updated.primaryCategory = topCategory;
  const topPct = newPercentages[topCategory] || 0;
  updated.isMultiPurpose = distinctCount >= 2 && topPct < 85;

  return {
    ...currentMemory,
    [cleanName]: updated,
  };
}
