import React from 'react';
import { ClassificationType } from '../../types';
import { Brain, CheckCircle2, AlertTriangle, Layers, Zap, UserCheck } from 'lucide-react';

interface ClassificationBadgeProps {
  type: ClassificationType;
  confidence?: number;
  className?: string;
  short?: boolean;
}

export const ClassificationBadge: React.FC<ClassificationBadgeProps> = ({
  type,
  confidence,
  className = '',
  short = false,
}) => {
  switch (type) {
    case 'merchant_memory':
      return (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}
          title="Automatically classified using learned Merchant Memory"
        >
          <Brain className="w-3 h-3 text-emerald-400" />
          <span>{short ? 'Remembered' : '✓ Auto-categorized'}</span>
        </span>
      );

    case 'auto_merchant':
      return (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ${className}`}
          title="Verified commercial merchant catalog match"
        >
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>{short ? 'Merchant' : 'Merchant Match'}</span>
        </span>
      );

    case 'unusual_detected':
      return (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse ${className}`}
          title="Unusual transaction amount detected and verified"
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>{short ? 'Unusual' : '⚠ Unusual Payment'}</span>
        </span>
      );

    case 'multi_purpose_suggested':
      return (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 ${className}`}
          title="Suggested from historical category split"
        >
          <Layers className="w-3 h-3 text-indigo-400" />
          <span>{short ? 'Multi-Use' : '🔄 Multi-Purpose'}</span>
        </span>
      );

    case 'user_classified':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-500/15 text-slate-300 border border-slate-500/25 ${className}`}
          title="Manually tagged by user"
        >
          <UserCheck className="w-3 h-3 text-slate-400" />
          <span>{short ? 'Manual' : 'User Tagged'}</span>
        </span>
      );
  }
};
