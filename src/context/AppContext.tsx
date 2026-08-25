import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ActiveTab, Category, DemoStepNumber, MerchantMemoryRecord, Transaction } from '../types';
import { INITIAL_TRANSACTIONS } from '../engine/mockData';
import { buildMerchantMemoryFromTransactions, recordTransactionInMemory } from '../engine/merchantMemory';
import confetti from 'canvas-confetti';

interface AppContextType {
  transactions: Transaction[];
  merchantMemory: Record<string, MerchantMemoryRecord>;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  monthlyIncome: number;
  viewMode: 'mobile' | 'desktop';
  setViewMode: (mode: 'mobile' | 'desktop') => void;
  
  // Payment Modal
  isPaymentModalOpen: boolean;
  paymentModalData: {
    recipient?: string;
    amount?: number;
    upiId?: string;
    isDemoTriggered?: boolean;
    demoStepNumber?: DemoStepNumber;
  } | null;
  openPaymentModal: (data?: {
    recipient?: string;
    amount?: number;
    upiId?: string;
    isDemoTriggered?: boolean;
    demoStepNumber?: DemoStepNumber;
  }) => void;
  closePaymentModal: () => void;
  
  // Transaction Actions
  addPaymentTransaction: (
    recipient: string,
    amount: number,
    category: Category,
    classificationType: Transaction['classificationType'],
    reason?: string,
    note?: string
  ) => Transaction;
  updateTransactionCategory: (txId: string, newCategory: Category) => void;
  
  // Merchant Memory Actions
  updateMerchantMemoryRecord: (recipient: string, newCategory: Category) => void;
  
  // Detail Modal
  selectedTransaction: Transaction | null;
  openTransactionDetail: (tx: Transaction) => void;
  closeTransactionDetail: () => void;
  
  // Demo Mode
  demoStep: DemoStepNumber;
  isDemoActive: boolean;
  startDemoTour: () => void;
  setDemoStep: (step: DemoStepNumber) => void;
  nextDemoStep: () => void;
  endDemoTour: () => void;
  
  // Reset
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'spendwise_txs_v2',
  MEMORY: 'spendwise_memory_v2',
  VIEW_MODE: 'spendwise_view_mode_v2',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved transactions', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // Merchant Memory
  const [merchantMemory, setMerchantMemory] = useState<Record<string, MerchantMemoryRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved memory', e);
    }
    return buildMerchantMemoryFromTransactions(INITIAL_TRANSACTIONS);
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [monthlyIncome] = useState<number>(20000);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Modals & Sheets
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentModalData, setPaymentModalData] = useState<{
    recipient?: string;
    amount?: number;
    upiId?: string;
    isDemoTriggered?: boolean;
    demoStepNumber?: DemoStepNumber;
  } | null>(null);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Demo Tour State
  const [demoStep, setDemoStepState] = useState<DemoStepNumber>(null);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);

  // Persist transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions', e);
    }
  }, [transactions]);

  // Persist memory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(merchantMemory));
    } catch (e) {
      console.error('Error saving memory', e);
    }
  }, [merchantMemory]);

  const openPaymentModal = (data?: {
    recipient?: string;
    amount?: number;
    upiId?: string;
    isDemoTriggered?: boolean;
    demoStepNumber?: DemoStepNumber;
  }) => {
    setPaymentModalData(data || null);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentModalData(null);
  };

  const openTransactionDetail = (tx: Transaction) => {
    setSelectedTransaction(tx);
  };

  const closeTransactionDetail = () => {
    setSelectedTransaction(null);
  };

  // Add a new payment
  const addPaymentTransaction = (
    recipient: string,
    amount: number,
    category: Category,
    classificationType: Transaction['classificationType'],
    reason?: string,
    note?: string
  ): Transaction => {
    const cleanName = recipient.trim();
    const upiId = `${cleanName.toLowerCase().replace(/\s+/g, '')}@okaxis`;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      recipient: cleanName,
      upiId,
      amount,
      date: new Date().toISOString(),
      category,
      classificationType,
      confidence: classificationType === 'user_classified' ? 0.9 : 0.98,
      classificationReason: reason || (classificationType === 'merchant_memory' ? 'Remembered from previous payments' : 'Categorized by user'),
      status: 'completed',
      note: note || undefined,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update memory
    setMerchantMemory((prevMemory) =>
      recordTransactionInMemory(prevMemory, cleanName, category, amount, upiId)
    );

    // Trigger subtle celebratory confetti for successful payment
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    } catch {
      // ignore
    }

    return newTx;
  };

  // Reclassify category of existing transaction
  const updateTransactionCategory = (txId: string, newCategory: Category) => {
    setTransactions((prev) => {
      const updated = prev.map((t) => {
        if (t.id === txId) {
          return {
            ...t,
            category: newCategory,
            classificationType: 'user_classified' as const,
            classificationReason: `Manually reclassified to ${newCategory}`,
          };
        }
        return t;
      });

      // Rebuild memory from updated dataset
      setMerchantMemory(buildMerchantMemoryFromTransactions(updated));
      return updated;
    });

    if (selectedTransaction && selectedTransaction.id === txId) {
      setSelectedTransaction((prev) =>
        prev
          ? {
              ...prev,
              category: newCategory,
              classificationType: 'user_classified',
              classificationReason: `Manually reclassified to ${newCategory}`,
            }
          : null
      );
    }
  };

  // Override primary category in memory
  const updateMerchantMemoryRecord = (recipient: string, newCategory: Category) => {
    setMerchantMemory((prev) => {
      const rec = prev[recipient];
      if (!rec) return prev;
      return {
        ...prev,
        [recipient]: {
          ...rec,
          primaryCategory: newCategory,
          userOverridden: true,
          confidence: 0.99,
          memorySource: 'user_manual',
        },
      };
    });
  };

  // Reset demo / state to default
  const resetData = () => {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.MEMORY);
    setTransactions(INITIAL_TRANSACTIONS);
    setMerchantMemory(buildMerchantMemoryFromTransactions(INITIAL_TRANSACTIONS));
    setDemoStepState(null);
    setIsDemoActive(false);
    setActiveTab('home');
  };

  // Demo Tour controls
  const startDemoTour = () => {
    setIsDemoActive(true);
    setDemoStepState(1);
    setActiveTab('home');
    openPaymentModal({
      recipient: 'Ramesh Kumar',
      amount: 20,
      isDemoTriggered: true,
      demoStepNumber: 1,
    });
  };

  const setDemoStep = (step: DemoStepNumber) => {
    setDemoStepState(step);
    if (step === null) {
      setIsDemoActive(false);
      return;
    }
    setIsDemoActive(true);

    if (step === 1) {
      setActiveTab('home');
      openPaymentModal({
        recipient: 'Ramesh Kumar',
        amount: 20,
        isDemoTriggered: true,
        demoStepNumber: 1,
      });
    } else if (step === 2) {
      setActiveTab('home');
      openPaymentModal({
        recipient: 'Ramesh Kumar',
        amount: 30,
        isDemoTriggered: true,
        demoStepNumber: 2,
      });
    } else if (step === 3) {
      setActiveTab('home');
      openPaymentModal({
        recipient: 'Ramesh Kumar',
        amount: 25,
        isDemoTriggered: true,
        demoStepNumber: 3,
      });
    } else if (step === 4) {
      setActiveTab('home');
      openPaymentModal({
        recipient: 'Ramesh Kumar',
        amount: 1500,
        isDemoTriggered: true,
        demoStepNumber: 4,
      });
    } else if (step === 5) {
      setActiveTab('analytics');
    } else if (step === 6) {
      setActiveTab('leaks');
    } else if (step === 7) {
      setActiveTab('ai');
    }
  };

  const nextDemoStep = () => {
    if (demoStep === null || demoStep >= 7) {
      endDemoTour();
    } else {
      setDemoStep((demoStep + 1) as DemoStepNumber);
    }
  };

  const endDemoTour = () => {
    setIsDemoActive(false);
    setDemoStepState(null);
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        merchantMemory,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        monthlyIncome,
        viewMode,
        setViewMode,
        isPaymentModalOpen,
        paymentModalData,
        openPaymentModal,
        closePaymentModal,
        addPaymentTransaction,
        updateTransactionCategory,
        updateMerchantMemoryRecord,
        selectedTransaction,
        openTransactionDetail,
        closeTransactionDetail,
        demoStep,
        isDemoActive,
        startDemoTour,
        setDemoStep,
        nextDemoStep,
        endDemoTour,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
