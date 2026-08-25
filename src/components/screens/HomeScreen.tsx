import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../engine/categories';
import { CategoryBadge } from '../common/CategoryBadge';
import { ClassificationBadge } from '../common/ClassificationBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  ArrowUpRight, 
  QrCode, 
  Send, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  Brain, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Flame,
  Bot
} from 'lucide-react';
import { Category } from '../../types';

export const HomeScreen: React.FC = () => {
  const { 
    transactions, 
    monthlyIncome, 
    selectedMonth, 
    openPaymentModal, 
    setActiveTab, 
    openTransactionDetail 
  } = useApp();

  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const totalSpent = currentMonthTxs.reduce((sum, t) => sum + t.amount, 0);
  const remaining = Math.max(0, monthlyIncome - totalSpent);
  const budgetProgress = Math.min(100, Math.round((totalSpent / monthlyIncome) * 100));

  // Category totals
  const categoryTotals: Partial<Record<Category, number>> = {};
  currentMonthTxs.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const topCategories: Category[] = ['Food', 'Shopping', 'Transport', 'Entertainment'];
  const recentTxs = currentMonthTxs.slice(0, 6);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Banner: Core Pitch Tagline */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-indigo-950/90 border border-emerald-500/30 p-5 shadow-2xl">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                UPI Intelligence Engine
              </span>
              <span className="text-xs text-slate-400">Prototype Demo</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-100 mt-2 tracking-tight">
              &ldquo;UPI tells you <span className="text-emerald-400">WHO</span> received your money. SpendWise learns <span className="text-indigo-400">WHY</span> you paid them.&rdquo;
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Autonomous on-device memory for ambiguous personal UPI payments.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openPaymentModal()}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-2 shadow-glow-emerald transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Simulate UPI Pay</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main UPI Balance & Financial Summary Card */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Good morning 👋</p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mt-0.5">
              ₹{remaining.toLocaleString('en-IN')}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Remaining Balance for August</p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Active Budget: 77%
            </span>
          </div>
        </div>

        {/* Income vs Spent Stats Bar */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium">Monthly Income</span>
            <p className="text-base font-bold text-slate-100 mt-0.5">
              ₹{monthlyIncome.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium">Total Spent</span>
            <p className="text-base font-bold text-rose-400 mt-0.5">
              ₹{totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Monthly Outflow</span>
            <span>{budgetProgress}% of ₹{monthlyIncome.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${budgetProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Quick Pay Simulation Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Fast Interactive Simulations</span>
          </h3>
          <span className="text-[11px] text-slate-500">Tap to trigger</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => openPaymentModal({ recipient: 'Ramesh Kumar', amount: 20 })}
            className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all group hover:border-emerald-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 group-hover:text-emerald-400 px-1.5 py-0.5 rounded">
                1st Pay
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
            </div>
            <p className="font-bold text-slate-100 text-xs sm:text-sm mt-2 truncate">Ramesh Kumar</p>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">₹20 (Tea)</p>
            <p className="text-[10px] text-slate-500 mt-1">Tests category prompt</p>
          </button>

          <button
            onClick={() => openPaymentModal({ recipient: 'Ramesh Kumar', amount: 30 })}
            className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all group hover:border-emerald-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
                Remembered
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
            </div>
            <p className="font-bold text-slate-100 text-xs sm:text-sm mt-2 truncate">Ramesh Kumar</p>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">₹30 (Auto)</p>
            <p className="text-[10px] text-slate-500 mt-1">Tests auto-categorize</p>
          </button>

          <button
            onClick={() => openPaymentModal({ recipient: 'Ramesh Kumar', amount: 1500 })}
            className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all group hover:border-amber-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded">
                ⚠ Anomaly
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            </div>
            <p className="font-bold text-slate-100 text-xs sm:text-sm mt-2 truncate">Ramesh Kumar</p>
            <p className="text-xs text-amber-400 font-semibold mt-0.5">₹1,500 (Outlier)</p>
            <p className="text-[10px] text-slate-500 mt-1">Tests anomaly alert</p>
          </button>

          <button
            onClick={() => openPaymentModal({ recipient: 'Rohit Kumar', amount: 300 })}
            className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all group hover:border-indigo-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded">
                Multi-Use
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
            </div>
            <p className="font-bold text-slate-100 text-xs sm:text-sm mt-2 truncate">Rohit Kumar</p>
            <p className="text-xs text-indigo-400 font-semibold mt-0.5">₹300 (Probabilistic)</p>
            <p className="text-[10px] text-slate-500 mt-1">Tests 40% Food split</p>
          </button>
        </div>
      </div>

      {/* Spending Overview by Category */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Monthly Category Breakdown</h3>
            <p className="text-xs text-slate-400">Classified spending breakdown for August</p>
          </div>
          <button
            onClick={() => setActiveTab('analytics')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Full Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {topCategories.map((catKey) => {
            const catAmt = categoryTotals[catKey] || 0;
            const catInfo = CATEGORIES[catKey];
            const pct = totalSpent > 0 ? Math.round((catAmt / totalSpent) * 100) : 0;

            return (
              <div
                key={catKey}
                className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl ${catInfo.bgColor} flex items-center justify-center border ${catInfo.borderColor}`}>
                    <CategoryIcon category={catKey} className={`w-4 h-4 ${catInfo.textColor}`} />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{pct}%</span>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-medium">{catKey}</p>
                  <p className="text-sm font-extrabold text-slate-100 mt-0.5">
                    ₹{catAmt.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: catInfo.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic AI Insight Card Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                AI Spending Insight
              </span>
              <span className="text-xs text-slate-400">MoM Alert</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-100 mt-1">
              &ldquo;Your food spending is 28% higher than last month.&rdquo;
            </p>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              31 small micro-transactions (tea & snacks) account for ₹2,340 of this increase.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('leaks')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Money Leaks</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-indigo transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask SpendWise</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Recent UPI Transactions</h3>
            <p className="text-xs text-slate-400">Live categorized transaction feed</p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All ({transactions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentTxs.map((tx) => (
            <div
              key={tx.id}
              onClick={() => openTransactionDetail(tx)}
              className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${CATEGORIES[tx.category]?.bgColor || 'bg-slate-800'} flex items-center justify-center border ${CATEGORIES[tx.category]?.borderColor || 'border-slate-700'}`}>
                  <CategoryIcon category={tx.category} className={`w-5 h-5 ${CATEGORIES[tx.category]?.textColor || 'text-slate-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-100 text-xs sm:text-sm group-hover:text-emerald-400 transition-colors">
                      {tx.recipient}
                    </p>
                    <ClassificationBadge type={tx.classificationType} short />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(tx.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    • {new Date(tx.date).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-extrabold text-slate-100 text-xs sm:text-sm">
                  -₹{tx.amount.toLocaleString('en-IN')}
                </p>
                <CategoryBadge category={tx.category} size="sm" className="mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
