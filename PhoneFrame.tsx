import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { DemoTourBanner } from '../demo/DemoTourBanner';
import { PaymentModal } from '../simulator/PaymentModal';
import { TransactionDetailModal } from '../transactions/TransactionDetailModal';
import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { MoneyLeaksScreen } from '../screens/MoneyLeaksScreen';
import { MerchantMemoryScreen } from '../screens/MerchantMemoryScreen';
import { AiAssistantScreen } from '../screens/AiAssistantScreen';
import { Wifi, BatteryMedium, Signal, Sparkles, Smartphone, Monitor } from 'lucide-react';

export const PhoneFrame: React.FC = () => {
  const { viewMode, setViewMode, activeTab } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'leaks':
        return <MoneyLeaksScreen />;
      case 'memory':
        return <MerchantMemoryScreen />;
      case 'ai':
        return <AiAssistantScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Demo Guidance Banner */}
      <DemoTourBanner />

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden">
        {viewMode === 'desktop' ? (
          // ==================== DESKTOP MODE ====================
          <div className="flex-1 flex max-w-7xl mx-auto w-full">
            <Sidebar />
            <div className="flex-1 overflow-y-auto min-h-[calc(100vh-64px)] pb-12">
              {renderActiveScreen()}
            </div>
          </div>
        ) : (
          // ==================== MOBILE PHONE SIMULATOR MODE ====================
          <div className="flex-1 py-4 sm:py-8 px-2 flex flex-col items-center justify-center relative overflow-y-auto">
            {/* Mode hint indicator */}
            <div className="hidden sm:flex items-center gap-2 mb-3 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs text-slate-400">
              <span>Mobile Phone Preview Mode</span>
              <button
                onClick={() => setViewMode('desktop')}
                className="text-emerald-400 font-bold hover:underline ml-1"
              >
                Switch to Full Desktop View
              </button>
            </div>

            {/* Smartphone Chassis */}
            <div className="w-full max-w-[420px] h-[844px] max-h-[92vh] bg-slate-950 border-[6px] border-slate-800 rounded-[44px] shadow-[0_0_50px_-10px_rgba(16,185,129,0.15)] flex flex-col overflow-hidden relative ring-1 ring-slate-700/50">
              {/* Dynamic Island / Notch */}
              <div className="bg-slate-950 pt-2 px-6 flex items-center justify-between z-20 shrink-0 select-none">
                <span className="text-xs font-semibold text-slate-200 font-mono tracking-tight">
                  {currentTime}
                </span>

                {/* Pill Notch */}
                <div className="w-24 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <BatteryMedium className="w-4 h-4" />
                </div>
              </div>

              {/* Scrollable Screen Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pb-4">
                {renderActiveScreen()}
              </div>

              {/* Bottom Mobile Tab Bar */}
              <Navbar />

              {/* Home Indicator Bar */}
              <div className="bg-slate-950 pb-1.5 pt-0.5 flex justify-center shrink-0">
                <div className="w-32 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <PaymentModal />
      <TransactionDetailModal />
    </div>
  );
};
