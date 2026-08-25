import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Smartphone, 
  Monitor, 
  QrCode, 
  RotateCcw, 
  Brain,
  Zap,
  Flame,
  Bot,
  CreditCard,
  PieChart,
  Home
} from 'lucide-react';
import { ActiveTab } from '../../types';

export const Header: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    activeTab, 
    setActiveTab, 
    openPaymentModal, 
    resetData,
    startDemoTour,
    isDemoActive 
  } = useApp();

  const navLinks: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'leaks', label: 'Money Leaks', icon: Flame },
    { id: 'memory', label: 'Merchant Brain', icon: Brain },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <header className="bg-slate-950/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('home')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-glow-emerald group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-100 text-lg tracking-tight group-hover:text-emerald-400 transition-colors">
                  SpendWise
                </span>
                <span className="text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">
                  UPI v2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden lg:block">
                UPI tells you <span className="text-emerald-400 font-semibold">WHO</span>. We learn <span className="text-indigo-400 font-semibold">WHY</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Navbar Tabs */}
        {viewMode === 'desktop' && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-glow-emerald'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Phone vs Desktop */}
          <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'mobile'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile UPI App Simulator"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px]">Phone</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'desktop'
                  ? 'bg-slate-800 text-emerald-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Desktop SaaS Dashboard"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[11px]">Desktop</span>
            </button>
          </div>

          {/* Quick Pay CTA */}
          <button
            onClick={() => openPaymentModal()}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-emerald transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Pay Recipient</span>
          </button>
        </div>
      </div>
    </header>
  );
};
