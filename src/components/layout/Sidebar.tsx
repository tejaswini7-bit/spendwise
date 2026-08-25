import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  CreditCard, 
  PieChart, 
  Flame, 
  Brain, 
  Bot, 
  QrCode, 
  Sparkles, 
  RotateCcw,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { ActiveTab } from '../../types';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    openPaymentModal, 
    startDemoTour, 
    resetData, 
    merchantMemory, 
    transactions, 
    selectedMonth, 
    monthlyIncome 
  } = useApp();

  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const totalSpent = currentMonthTxs.reduce((sum, t) => sum + t.amount, 0);
  const memoryCount = Object.keys(merchantMemory).length;

  const navLinks: { id: ActiveTab; label: string; icon: any; badge?: string }[] = [
    { id: 'home', label: 'Overview Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions History', icon: CreditCard, badge: `${transactions.length}` },
    { id: 'analytics', label: 'Spending Analytics', icon: PieChart },
    { id: 'leaks', label: 'Money Leak Detector', icon: Flame, badge: 'ALERT' },
    { id: 'memory', label: 'Merchant Brain Store', icon: Brain, badge: `${memoryCount}` },
    { id: 'ai', label: 'AI Financial Assistant', icon: Bot },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-4 h-[calc(100vh-64px)] sticky top-16 shrink-0 overflow-y-auto">
      <div className="space-y-6">
        {/* Navigation Links */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;

            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-glow-emerald'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      link.badge === 'ALERT'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Pitch Demo Action */}
        <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 p-4 rounded-3xl border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2 text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider">
              Judge Demo Pitch
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Run the 7-step evaluation tour showing the complete learning loop in 2 minutes.
          </p>
          <button
            onClick={startDemoTour}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow-emerald transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Demo Pitch</span>
          </button>
        </div>

        {/* Quick Simulator Button */}
        <div>
          <button
            onClick={() => openPaymentModal()}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:border-emerald-500/50"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Simulate Scan & Pay</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Safe Demo Data</span>
          </span>
          <button
            onClick={resetData}
            title="Reset to fresh mock state"
            className="hover:text-slate-200 flex items-center gap-1 text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
