import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, CATEGORY_LIST } from '../../engine/categories';
import { Category } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export const AnalyticsScreen: React.FC = () => {
  const { 
    transactions, 
    selectedMonth, 
    setSelectedMonth, 
    monthlyIncome, 
    setActiveTab 
  } = useApp();

  const [activeChartTab, setActiveChartTab] = useState<'distribution' | 'comparison' | 'timeline'>('distribution');

  // Month transactions
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const totalSpent = currentMonthTxs.reduce((sum, t) => sum + t.amount, 0);
  const remaining = Math.max(0, monthlyIncome - totalSpent);

  // Category totals for current month
  const categoryTotals: Partial<Record<Category, number>> = {};
  const categoryCounts: Partial<Record<Category, number>> = {};

  currentMonthTxs.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  // Pie chart data
  const pieData = Object.entries(categoryTotals)
    .filter(([_, amt]) => (amt || 0) > 0)
    .map(([cat, amt]) => ({
      name: cat,
      value: amt || 0,
      color: CATEGORIES[cat as Category]?.color || '#94a3b8',
      percentage: totalSpent > 0 ? Math.round(((amt || 0) / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Month Comparison Bar Chart Data (Aug vs Jul vs Jun)
  const allMonths = ['2026-06', '2026-07', '2026-08'];
  const monthLabels: Record<string, string> = {
    '2026-06': 'June',
    '2026-07': 'July',
    '2026-08': 'August',
  };

  const comparisonData = allMonths.map((m) => {
    const mTxs = transactions.filter((t) => t.date.startsWith(m));
    const food = mTxs.filter((t) => t.category === 'Food').reduce((s, t) => s + t.amount, 0);
    const shopping = mTxs.filter((t) => t.category === 'Shopping').reduce((s, t) => s + t.amount, 0);
    const transport = mTxs.filter((t) => t.category === 'Transport').reduce((s, t) => s + t.amount, 0);
    const other = mTxs
      .filter((t) => !['Food', 'Shopping', 'Transport'].includes(t.category))
      .reduce((s, t) => s + t.amount, 0);

    return {
      month: monthLabels[m] || m,
      Food: food,
      Shopping: shopping,
      Transport: transport,
      Other: other,
      Total: food + shopping + transport + other,
    };
  });

  // Daily Spending timeline for selected month
  const dailyDataMap: Record<string, number> = {};
  currentMonthTxs.forEach((t) => {
    const day = new Date(t.date).getDate();
    const label = `Day ${day}`;
    dailyDataMap[label] = (dailyDataMap[label] || 0) + t.amount;
  });

  const timelineData = Object.entries(dailyDataMap)
    .map(([day, amount]) => ({ day, amount }))
    .sort((a, b) => parseInt(a.day.replace('Day ', '')) - parseInt(b.day.replace('Day ', '')));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span>Spending Analytics</span>
            <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              LEARNED PATTERNS
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial intelligence driven by SpendWise classification
          </p>
        </div>

        {/* Month Selector Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          {[
            { id: '2026-08', label: 'August' },
            { id: '2026-07', label: 'July' },
            { id: '2026-06', label: 'June' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMonth(m.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMonth === m.id
                  ? 'bg-emerald-600 text-white shadow-glow-emerald'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Spent</span>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              Outflow
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500">
            Across {currentMonthTxs.length} categorized UPI transactions
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Remaining Balance</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Safe
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            ₹{remaining.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500">
            {Math.round((remaining / monthlyIncome) * 100)}% of monthly allocation left
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Income</span>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Budget
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            ₹{monthlyIncome.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500">
            Monthly baseline earnings
          </p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl">
        {/* Chart Header & Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Visual Analytics Dashboard</h3>
            <p className="text-xs text-slate-400">Dynamic charts reflecting your learned memory</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab('distribution')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeChartTab === 'distribution'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Category Share</span>
            </button>
            <button
              onClick={() => setActiveChartTab('comparison')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeChartTab === 'comparison'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Month Trends</span>
            </button>
            <button
              onClick={() => setActiveChartTab('timeline')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeChartTab === 'timeline'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Daily Flow</span>
            </button>
          </div>
        </div>

        {/* Chart 1: Donut Distribution Chart */}
        {activeChartTab === 'distribution' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 h-64 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs">
                            <p className="font-bold text-slate-100">{data.name}</p>
                            <p className="text-emerald-400 font-mono font-bold mt-0.5">
                              ₹{data.value.toLocaleString('en-IN')} ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                </RechartsPie>
              </ResponsiveContainer>

              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                <p className="text-sm font-black text-slate-100">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Category Breakdown legend list */}
            <div className="md:col-span-6 space-y-2 max-h-64 overflow-y-auto pr-1">
              {pieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-200">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-100">
                      ₹{item.value.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5 font-mono font-semibold">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart 2: Monthly Comparison Bar Chart */}
        {activeChartTab === 'comparison' && (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" textAnchor="middle" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-slate-100">{label} Summary</p>
                          {payload.map((p: any) => (
                            <p key={p.name} style={{ color: p.color }}>
                              {p.name}: ₹{p.value?.toLocaleString('en-IN')}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Food" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Shopping" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Transport" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Other" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 3: Daily Timeline Area Chart */}
        {activeChartTab === 'timeline' && (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl text-xs">
                          <p className="font-bold text-slate-100">{label}</p>
                          <p className="text-emerald-400 font-mono font-bold">
                            ₹{payload[0].value?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Comprehensive Category Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Full Category Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORY_LIST.map((catKey) => {
            const catAmt = categoryTotals[catKey] || 0;
            const count = categoryCounts[catKey] || 0;
            const catInfo = CATEGORIES[catKey];
            const pct = totalSpent > 0 ? Math.round((catAmt / totalSpent) * 100) : 0;

            return (
              <div
                key={catKey}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${catInfo.bgColor} flex items-center justify-center border ${catInfo.borderColor}`}>
                      <CategoryIcon category={catKey} className={`w-4 h-4 ${catInfo.textColor}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 text-xs sm:text-sm">{catKey}</p>
                      <p className="text-[10px] text-slate-400">{count} payments</p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                    {pct}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Total Spent:</span>
                  <span className="text-base font-extrabold text-slate-100 font-mono">
                    ₹{catAmt.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
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
    </div>
  );
};
