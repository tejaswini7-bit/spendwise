import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, CATEGORY_LIST } from '../../engine/categories';
import { Category, ClassificationType } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';
import { ClassificationBadge } from '../common/ClassificationBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  Search, 
  Filter, 
  Calendar, 
  Brain, 
  CreditCard, 
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Plus
} from 'lucide-react';

export const TransactionsScreen: React.FC = () => {
  const { 
    transactions, 
    selectedMonth, 
    setSelectedMonth, 
    openTransactionDetail, 
    openPaymentModal 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFilterType, setSelectedFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Month filter
      if (selectedMonth !== 'all' && !tx.date.startsWith(selectedMonth)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // Classification type filter
      if (selectedFilterType !== 'all') {
        if (selectedFilterType === 'auto_memory' && tx.classificationType !== 'merchant_memory') {
          return false;
        }
        if (selectedFilterType === 'auto_merchant' && tx.classificationType !== 'auto_merchant') {
          return false;
        }
        if (selectedFilterType === 'unusual' && tx.classificationType !== 'unusual_detected') {
          return false;
        }
        if (selectedFilterType === 'multipurpose' && tx.classificationType !== 'multi_purpose_suggested') {
          return false;
        }
        if (selectedFilterType === 'manual' && tx.classificationType !== 'user_classified') {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRecipient = tx.recipient.toLowerCase().includes(q);
        const matchCategory = tx.category.toLowerCase().includes(q);
        const matchNote = tx.note?.toLowerCase().includes(q);
        const matchReason = tx.classificationReason?.toLowerCase().includes(q);
        const matchAmount = String(tx.amount).includes(q);
        if (!matchRecipient && !matchCategory && !matchNote && !matchReason && !matchAmount) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, selectedMonth, selectedCategory, selectedFilterType, searchQuery, sortBy]);

  const totalFilteredAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span>Transaction History</span>
            <span className="text-xs font-mono font-bold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full border border-slate-700">
              {filteredTransactions.length} items
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Classified UPI payment ledger with live memory indicators
          </p>
        </div>

        <button
          onClick={() => openPaymentModal()}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-glow-emerald transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New UPI Payment</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
        {/* Search Bar & Month selector */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by recipient (e.g. Ramesh, Swiggy, Rohit) or category..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="2026-08">August 2026 (Current)</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="all">All Months</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="date_desc">Latest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Classification Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Type:
          </span>
          {[
            { id: 'all', label: 'All Types' },
            { id: 'auto_memory', label: '🧠 Auto-Categorized', count: transactions.filter(t => t.classificationType === 'merchant_memory').length },
            { id: 'auto_merchant', label: '⚡ Merchant Match', count: transactions.filter(t => t.classificationType === 'auto_merchant').length },
            { id: 'unusual', label: '⚠ Unusual Payments', count: transactions.filter(t => t.classificationType === 'unusual_detected').length },
            { id: 'multipurpose', label: '🔄 Multi-Purpose', count: transactions.filter(t => t.classificationType === 'multi_purpose_suggested').length },
            { id: 'manual', label: '👤 User Tagged', count: transactions.filter(t => t.classificationType === 'user_classified').length },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilterType(f.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 border transition-all ${
                selectedFilterType === f.id
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{f.label}</span>
              {f.count !== undefined && f.count > 0 && (
                <span className="ml-1.5 text-[10px] font-mono opacity-70">({f.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-800/60">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium shrink-0 border transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-bold'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({transactions.length})
          </button>
          {CATEGORY_LIST.map((catKey) => {
            const isSelected = selectedCategory === catKey;
            const catInfo = CATEGORIES[catKey];
            const count = transactions.filter(t => t.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium shrink-0 border transition-all ${
                  isSelected
                    ? `${catInfo.bgColor} ${catInfo.borderColor} ${catInfo.textColor} font-bold`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CategoryIcon category={catKey} className="w-3 h-3" />
                <span>{catKey}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary of current filter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {filteredTransactions.length} transactions</span>
        <span className="font-semibold text-slate-200">
          Total: <strong className="text-emerald-400 font-mono">₹{totalFilteredAmount.toLocaleString('en-IN')}</strong>
        </span>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-2.5">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => openTransactionDetail(tx)}
              className="p-4 rounded-3xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-lg group"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl ${CATEGORIES[tx.category]?.bgColor || 'bg-slate-800'} flex items-center justify-center border ${CATEGORIES[tx.category]?.borderColor || 'border-slate-700'} shrink-0`}>
                  <CategoryIcon category={tx.category} className={`w-5 h-5 ${CATEGORIES[tx.category]?.textColor || 'text-slate-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-100 text-sm group-hover:text-emerald-400 transition-colors">
                      {tx.recipient}
                    </p>
                    <ClassificationBadge type={tx.classificationType} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(tx.date).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {tx.note && (
                      <>
                        <span>•</span>
                        <span className="text-slate-300 italic truncate max-w-[140px]">
                          {tx.note}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                <p className="text-base font-black text-slate-100 tracking-tight">
                  -₹{tx.amount.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CategoryBadge category={tx.category} size="sm" />
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-200">No transactions match your search</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your category filter, classification type, or search keywords.
          </p>
        </div>
      )}
    </div>
  );
};
