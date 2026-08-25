export type Category = 
  | 'Food'
  | 'Shopping'
  | 'Transport'
  | 'Entertainment'
  | 'Education'
  | 'Bills'
  | 'Healthcare'
  | 'Personal'
  | 'Other';

export interface CategoryInfo {
  id: Category;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}

export type ClassificationType = 
  | 'auto_merchant'          // Obvious merchant like Swiggy, Uber
  | 'merchant_memory'          // Auto-categorized from user's past selections
  | 'user_classified'          // First-time or manual selection by user
  | 'unusual_detected'        // Flagged as abnormal amount, confirmed by user
  | 'multi_purpose_suggested'; // Suggested based on weighted probability for multi-use recipient

export interface Transaction {
  id: string;
  recipient: string;
  upiId: string;
  amount: number;
  date: string; // ISO date string YYYY-MM-DDTHH:mm:ss
  category: Category;
  classificationType: ClassificationType;
  confidence: number; // 0 to 1
  classificationReason?: string;
  isUnusual?: boolean;
  previousTypicalRange?: { min: number; max: number };
  status: 'completed' | 'flagged' | 'pending';
  note?: string;
}

export interface MerchantMemoryRecord {
  recipient: string;
  upiId?: string;
  isKnownMerchant: boolean;
  totalTransactions: number;
  totalSpent: number;
  primaryCategory: Category;
  categoryBreakdown: Partial<Record<Category, number>>; // Category -> count
  categoryPercentages: Partial<Record<Category, number>>; // Category -> %
  minAmount: number;
  maxAmount: number;
  avgAmount: number;
  isMultiPurpose: boolean;
  lastTransactionDate: string;
  confidence: number;
  userOverridden?: boolean;
  memorySource: 'learned' | 'hardcoded_merchant' | 'user_manual';
}

export interface MoneyLeakCluster {
  id: string;
  title: string;
  category: Category;
  description: string;
  transactionCount: number;
  totalMonthlyAmount: number;
  annualProjected: number;
  avgPerTransaction: number;
  sampleRecipients: string[];
  actionTip: string;
  potentialMonthlySavings: number;
}

export interface SpendingInsight {
  id: string;
  title: string;
  type: 'trend' | 'anomaly' | 'saving' | 'pattern' | 'frequency';
  description: string;
  metric?: string;
  icon: string;
  severity: 'info' | 'warning' | 'positive';
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  dataVisual?: {
    type: 'metric' | 'category_breakdown' | 'recipient_history' | 'leak_summary' | 'savings_calculator';
    data: any;
  };
  suggestedFollowUps?: string[];
}

export type ActiveTab = 'home' | 'transactions' | 'analytics' | 'leaks' | 'ai' | 'memory';

export type DemoStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;

export interface DemoStepInfo {
  step: DemoStepNumber;
  title: string;
  subtitle: string;
  recipient: string;
  amount: number;
  targetTab: ActiveTab;
  explanation: string;
  badge: string;
}
