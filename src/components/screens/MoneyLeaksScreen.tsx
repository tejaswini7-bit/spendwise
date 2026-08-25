import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { detectMoneyLeaks } from '../../engine/leakDetector';
import { CATEGORIES } from '../../engine/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  Flame, 
  Sparkles, 
  TrendingDown, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert, 
  Zap, 
  Sliders,
  DollarSign,
  PiggyBank,
  CheckCircle
} from 'lucide-react';

export const MoneyLeaksScreen: React.FC = () => {
  const { transactions, selectedMonth, openPaymentModal } = useApp();

  const [savingTargetPct, setSavingTargetPct] = useState<number>(25);

  const leaks = detectMoneyLeaks(transactions, selectedMonth);

  const totalMonthlyLeaks = leaks.reduce((sum, l) => sum + l.totalMonthlyAmount, 0);
  const totalAnnualLeaks = totalMonthlyLeaks * 12;
  const potentialMonthlySavings = Math.round(totalMonthlyLeaks * (savingTargetPct / 100));
  const potentialAnnualSavings = potentialMonthlySavings * 12;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Micro-Drain Intelligence</span>
            </span>
            <span className="text-xs text-slate-400">Algorithmic Detection</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
            Money Leak Detector
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Surfacing hidden cumulative leaks from tiny, repeated UPI micro-transactions
          </p>
        </div>
      </div>

      {/* Main Impact Hero Card */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border border-rose-500/30 p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              Total Monthly Leak Detected
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-rose-400 tracking-tight mt-1">
              ₹{totalMonthlyLeaks.toLocaleString('en-IN')}
              <span className="text-xs text-slate-400 font-normal ml-2">/ month</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              These micro-payments are individually negligible (₹10–₹150), but silently accumulate into{' '}
              <strong className="text-rose-300">₹{totalAnnualLeaks.toLocaleString('en-IN')} / year</strong>.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-rose-500/20 text-center sm:text-right shrink-0">
            <span className="text-[11px] text-slate-400 font-medium">1-Year Projected Leak</span>
            <p className="text-xl sm:text-2xl font-black text-slate-100 mt-0.5 font-mono">
              ₹{totalAnnualLeaks.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
              {leaks.reduce((s, l) => s + l.transactionCount, 0)} micro-transactions
            </span>
          </div>
        </div>

        {/* Interactive Savings Simulator Slider */}
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">
                Leak Reduction Simulator
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Save {savingTargetPct}% (₹{potentialMonthlySavings.toLocaleString('en-IN')}/mo)
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="60"
            step="5"
            value={savingTargetPct}
            onChange={(e) => setSavingTargetPct(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Moderate (10%)</span>
            <span className="text-emerald-400 font-bold">
              Annual Potential Recovery: +₹{potentialAnnualSavings.toLocaleString('en-IN')}
            </span>
            <span>Aggressive (60%)</span>
          </div>
        </div>
      </div>

      {/* Leak Clusters List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Detected Leak Patterns ({leaks.length})</span>
          </h3>
          <span className="text-[11px] text-slate-500">Calculated from transaction data</span>
        </div>

        <div className="space-y-3">
          {leaks.map((leak) => {
            const catInfo = CATEGORIES[leak.category];

            return (
              <div
                key={leak.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg"
              >
                {/* Cluster Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${catInfo.bgColor} flex items-center justify-center border ${catInfo.borderColor} shrink-0`}>
                      <CategoryIcon category={leak.category} className={`w-5 h-5 ${catInfo.textColor}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm sm:text-base">
                        {leak.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {leak.transactionCount} transactions • Avg ₹{leak.avgPerTransaction} / transaction
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base sm:text-lg font-black text-rose-400">
                      ₹{leak.totalMonthlyAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ month</span>
                    <p className="text-[10px] text-slate-500">
                      ₹{leak.annualProjected.toLocaleString('en-IN')} / year
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                  {leak.description}
                </p>

                {/* Sample Recipients & Action Tip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Frequent Beneficiaries
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {leak.sampleRecipients.map((rec) => (
                        <span
                          key={rec}
                          className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium"
                        >
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-xs flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Actionable Fix
                      </span>
                      <p className="text-emerald-200/90 text-[11px] mt-0.5">
                        {leak.actionTip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
