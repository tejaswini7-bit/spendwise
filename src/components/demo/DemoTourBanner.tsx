import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Brain, 
  BarChart2, 
  Flame, 
  Bot,
  Play,
  RotateCcw
} from 'lucide-react';
import { DemoStepNumber } from '../../types';

export const DemoTourBanner: React.FC = () => {
  const { 
    isDemoActive, 
    demoStep, 
    setDemoStep, 
    nextDemoStep, 
    endDemoTour, 
    startDemoTour,
    resetData 
  } = useApp();

  if (!isDemoActive || !demoStep) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/80 via-indigo-950/80 to-slate-950/90 border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Interactive Judge Demo</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                2-MIN WALKTHROUGH
              </span>
            </p>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Experience the core learning loop: First Time Ask → Remember → Auto-Categorize → Anomaly Detection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetData}
            title="Reset to fresh demo data"
            className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={startDemoTour}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-emerald transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Launch Demo Pitch</span>
          </button>
        </div>
      </div>
    );
  }

  const stepsMeta: Record<number, { title: string; desc: string; icon: any; color: string }> = {
    1: {
      title: 'Step 1: First-Time Unknown Recipient',
      desc: 'Pay ₹20 to Ramesh Kumar. SpendWise does not know this recipient yet and prompts "What was this payment for?". Select Food.',
      icon: Brain,
      color: 'emerald',
    },
    2: {
      title: 'Step 2: Instant Auto-Categorization',
      desc: 'Pay ₹30 to Ramesh Kumar. SpendWise recognizes the recipient and automatically applies "✓ Food" without asking!',
      icon: CheckCircle2,
      color: 'emerald',
    },
    3: {
      title: 'Step 3: Repeat Payment Memory',
      desc: 'Pay ₹25 to Ramesh Kumar. Confirms learned behavior with badge "✓ Food (Remembered)".',
      icon: Brain,
      color: 'emerald',
    },
    4: {
      title: 'Step 4: Unusual Amount Anomaly',
      desc: 'Pay ₹1,500 to Ramesh Kumar. SpendWise detects this deviates from normal ₹10–₹50 ticket size and flags ⚠ Unusual Payment!',
      icon: AlertTriangle,
      color: 'amber',
    },
    5: {
      title: 'Step 5: Dynamic Spending Analytics',
      desc: 'View real-time spending charts. Food spending is automatically aggregated from your classified transactions.',
      icon: BarChart2,
      color: 'cyan',
    },
    6: {
      title: 'Step 6: Money Leak Detector',
      desc: 'SpendWise uncovers 31 small micro-chai payments totaling ₹2,340 and reveals hidden cumulative drains.',
      icon: Flame,
      color: 'rose',
    },
    7: {
      title: 'Step 7: AI Financial Assistant',
      desc: 'Ask data-backed questions like "Where did most of my money go?" or "How much did I spend at Ramesh Kumar?".',
      icon: Bot,
      color: 'indigo',
    },
  };

  const current = stepsMeta[demoStep] || stepsMeta[1];
  const StepIcon = current.icon;

  return (
    <div className="bg-slate-900 border-b border-indigo-500/30 p-3.5 sm:px-6 shadow-xl relative z-40">
      {/* Top indicator & step pills */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            <span>Judge Demo Pitch</span>
          </span>
          <span className="text-xs font-mono text-slate-400">Step {demoStep} of 7</span>
        </div>

        {/* Step jump buttons */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              onClick={() => setDemoStep(num as DemoStepNumber)}
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                demoStep === num
                  ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                  : num < demoStep
                  ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-600/40'
                  : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={endDemoTour}
            className="ml-2 w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center"
            title="Exit Demo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main step instruction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 rounded-2xl p-3 border border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <StepIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-100">
              {current.title}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {demoStep > 1 && (
            <button
              onClick={() => setDemoStep((demoStep - 1) as DemoStepNumber)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={nextDemoStep}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-emerald"
          >
            <span>{demoStep === 7 ? 'Finish Demo' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
