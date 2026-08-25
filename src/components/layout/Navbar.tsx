import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home, 
  CreditCard, 
  PieChart, 
  Flame, 
  Brain, 
  Bot 
} from 'lucide-react';
import { ActiveTab } from '../../types';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: any; badge?: boolean }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'transactions', label: 'History', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'leaks', label: 'Leaks', icon: Flame, badge: true },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'ai', label: 'AI', icon: Bot },
  ];

  return (
    <nav className="bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around z-30 shrink-0">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
              isActive
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
