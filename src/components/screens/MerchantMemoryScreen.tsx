import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, CATEGORY_LIST } from '../../engine/categories';
import { Category, MerchantMemoryRecord } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  Brain, 
  Search, 
  Sparkles, 
  Layers, 
  Zap, 
  UserCheck, 
  SlidersHorizontal, 
  Edit3, 
  Check, 
  Clock, 
  TrendingUp,
  X
} from 'lucide-react';

export const MerchantMemoryScreen: React.FC = () => {
  const { merchantMemory, updateMerchantMemoryRecord, openPaymentModal } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [editingRecipient, setEditingRecipient] = useState<string | null>(null);

  const memoryRecords = useMemo(() => {
    return Object.values(merchantMemory).filter((rec) => {
      if (selectedCategoryFilter !== 'all' && rec.primaryCategory !== selectedCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rec.recipient.toLowerCase().includes(q);
        const matchCat = rec.primaryCategory.toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }
      return true;
    }).sort((a, b) => {
      // Prioritize personal learned contacts first (like Ramesh and Rohit)
      if (a.isKnownMerchant !== b.isKnownMerchant) {
        return a.isKnownMerchant ? 1 : -1;
      }
      return b.totalTransactions - a.totalTransactions;
    });
  }, [merchantMemory, selectedCategoryFilter, searchQuery]);

  const totalEntities = Object.keys(merchantMemory).length;
  const personalLearnedCount = Object.values(merchantMemory).filter((m) => !m.isKnownMerchant).length;
  const multiPurposeCount = Object.values(merchantMemory).filter((m) => m.isMultiPurpose).length;

  const handleSaveOverride = (recipient: string, newCat: Category) => {
    updateMerchantMemoryRecord(recipient, newCat);
    setEditingRecipient(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              <span>SpendWise Brain Inspector</span>
            </span>
            <span className="text-xs text-slate-400">On-Device Memory Store</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Merchant Memory Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent view of what SpendWise has learned from your payment habits
          </p>
        </div>

        <button
          onClick={() => openPaymentModal()}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-glow-emerald transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Test Learning Engine</span>
        </button>
      </div>

      {/* Memory Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-1 text-center sm:text-left">
          <span className="text-[11px] text-slate-400 font-medium">Learned Profiles</span>
          <p className="text-xl sm:text-2xl font-black text-slate-100 font-mono">{totalEntities}</p>
          <p className="text-[10px] text-slate-500">Active recipient records</p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-1 text-center sm:text-left">
          <span className="text-[11px] text-emerald-400 font-medium">Personal Contacts</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{personalLearnedCount}</p>
          <p className="text-[10px] text-slate-500">Learned from user behavior</p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-1 text-center sm:text-left">
          <span className="text-[11px] text-indigo-400 font-medium">Multi-Purpose</span>
          <p className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">{multiPurposeCount}</p>
          <p className="text-[10px] text-slate-500">Dynamic category split</p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-1 text-center sm:text-left">
          <span className="text-[11px] text-cyan-400 font-medium">Confidence Score</span>
          <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">98.2%</p>
          <p className="text-[10px] text-slate-500">Autonomous precision</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter learned merchants (e.g. Ramesh Kumar, Rohit Kumar, Swiggy)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 border transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            All Categories ({totalEntities})
          </button>
          {CATEGORY_LIST.map((catKey) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategoryFilter(catKey)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium shrink-0 border transition-all ${
                selectedCategoryFilter === catKey
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <CategoryIcon category={catKey} className="w-3 h-3" />
              <span>{catKey}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Memory Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memoryRecords.map((record) => {
          const catInfo = CATEGORIES[record.primaryCategory] || CATEGORIES.Other;
          const isEditing = editingRecipient === record.recipient;

          return (
            <div
              key={record.recipient}
              className={`rounded-3xl bg-slate-900 border transition-all p-5 space-y-4 shadow-lg ${
                !record.isKnownMerchant
                  ? 'border-emerald-500/30 hover:border-emerald-500/60'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${catInfo.bgColor} flex items-center justify-center border ${catInfo.borderColor} shrink-0`}>
                    <CategoryIcon category={record.primaryCategory} className={`w-5 h-5 ${catInfo.textColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                      <span>{record.recipient}</span>
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {!record.isKnownMerchant ? (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          <span>Personal Contact (Learned)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Verified Merchant</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditingRecipient(isEditing ? null : record.recipient)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Override Memory"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Editing Category Override Dropdown */}
              {isEditing && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-2 animate-slideDown">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Override Category for {record.recipient}:</span>
                    <button
                      onClick={() => setEditingRecipient(null)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CATEGORY_LIST.map((catKey) => (
                      <button
                        key={catKey}
                        onClick={() => handleSaveOverride(record.recipient, catKey)}
                        className={`p-1.5 rounded-lg text-xs font-medium border transition-all ${
                          record.primaryCategory === catKey
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {catKey}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400">Total Count</span>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">{record.totalTransactions}</p>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400">Total Volume</span>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{record.totalSpent.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400">Normal Range</span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">₹{record.minAmount}–₹{record.maxAmount}</p>
                </div>
              </div>

              {/* Multi-Purpose Distribution */}
              {record.isMultiPurpose && (
                <div className="bg-indigo-500/10 p-3.5 rounded-2xl border border-indigo-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Multi-Purpose Category Split</span>
                    </span>
                    <span className="text-[10px] text-indigo-400">Dynamic</span>
                  </div>

                  <div className="space-y-1.5">
                    {Object.entries(record.categoryPercentages).map(([cat, pct]) => (
                      <div key={cat} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{cat}</span>
                        <div className="flex items-center gap-2 w-3/5">
                          <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-400 h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-indigo-200 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory Footnote */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Last active: {new Date(record.lastTransactionDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                </span>
                <span className="font-mono text-emerald-400 font-semibold">
                  Confidence: {Math.round(record.confidence * 100)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
