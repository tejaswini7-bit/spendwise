import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, CATEGORY_LIST } from '../../engine/categories';
import { Category } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';
import { ClassificationBadge } from '../common/ClassificationBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  X, 
  Brain, 
  Calendar, 
  CreditCard, 
  History, 
  Edit3, 
  Check, 
  Sparkles,
  TrendingUp,
  Layers,
  ArrowRight
} from 'lucide-react';

export const TransactionDetailModal: React.FC = () => {
  const { 
    selectedTransaction, 
    closeTransactionDetail, 
    merchantMemory, 
    updateTransactionCategory 
  } = useApp();

  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);

  if (!selectedTransaction) return null;

  const memory = merchantMemory[selectedTransaction.recipient];
  const dateObj = new Date(selectedTransaction.date);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSelectNewCategory = (cat: Category) => {
    updateTransactionCategory(selectedTransaction.id, cat);
    setIsEditingCategory(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Transaction Details</h3>
              <p className="text-xs text-slate-400 font-mono">{selectedTransaction.id}</p>
            </div>
          </div>
          <button
            onClick={closeTransactionDetail}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Main Amount & Recipient */}
          <div className="text-center py-3 bg-slate-950/50 rounded-2xl border border-slate-800/80">
            <p className="text-3xl font-extrabold text-slate-100 tracking-tight">
              ₹{selectedTransaction.amount.toLocaleString('en-IN')}
            </p>
            <h4 className="text-base font-bold text-emerald-400 mt-1">
              {selectedTransaction.recipient}
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {selectedTransaction.upiId}
            </p>

            <div className="flex items-center justify-center gap-2 mt-3">
              <CategoryBadge category={selectedTransaction.category} size="md" />
              <ClassificationBadge type={selectedTransaction.classificationType} />
            </div>
          </div>

          {/* Classification Intelligence Card */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-emerald-400" />
                <span>SpendWise Memory Logic</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Confidence: {Math.round((selectedTransaction.confidence || 0.95) * 100)}%
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {selectedTransaction.classificationReason ||
                `Automatically classified based on previous interactions with ${selectedTransaction.recipient}.`}
            </p>

            {/* Change Category Action */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400">Incorrect Category?</span>
              <button
                type="button"
                onClick={() => setIsEditingCategory(!isEditingCategory)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingCategory ? 'Cancel' : 'Change Category'}</span>
              </button>
            </div>

            {/* Category selection palette if editing */}
            {isEditingCategory && (
              <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1.5 animate-slideDown">
                {CATEGORY_LIST.map((catKey) => {
                  const isCurrent = selectedTransaction.category === catKey;
                  const info = CATEGORIES[catKey];
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => handleSelectNewCategory(catKey)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-all ${
                        isCurrent
                          ? `${info.bgColor} ${info.borderColor} ${info.textColor} ring-1 ring-emerald-400 font-bold`
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CategoryIcon category={catKey} className="w-3 h-3" />
                      <span className="truncate">{catKey}</span>
                      {isCurrent && <Check className="w-3 h-3 ml-auto text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recipient Profile & Lifetime Memory Stats */}
          {memory && (
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Learned Recipient Profile</span>
              </h5>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] text-slate-400">Total Payments</p>
                  <p className="text-sm font-bold text-slate-100 mt-0.5">{memory.totalTransactions}</p>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] text-slate-400">Total Spent</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">₹{memory.totalSpent.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] text-slate-400">Typical Range</p>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">₹{memory.minAmount}–₹{memory.maxAmount}</p>
                </div>
              </div>

              {/* Multi-Purpose Distribution if applicable */}
              {memory.isMultiPurpose && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>Multi-Purpose Category Breakdown</span>
                  </p>
                  <div className="space-y-1">
                    {Object.entries(memory.categoryPercentages).map(([cat, pct]) => (
                      <div key={cat} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{cat}</span>
                        <div className="flex items-center gap-2 w-1/2">
                          <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-400 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata info */}
          <div className="space-y-2 text-xs text-slate-400 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Date & Time</span>
              </span>
              <span className="text-slate-200">{formattedDate}, {formattedTime}</span>
            </div>
            {selectedTransaction.note && (
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/50">
                <span>Note</span>
                <span className="text-slate-200 italic font-sans">{selectedTransaction.note}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/50">
              <span>Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Completed</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={closeTransactionDetail}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
