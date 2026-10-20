import React from 'react';
import { EvidenceCategory, EvidenceDirection, ReviewStatus } from '../../types';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, FileText, Activity, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  type: 'category' | 'direction' | 'review' | 'clinical' | 'contradiction';
  value: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  if (type === 'clinical') {
    const isApproved = value === 'Approved';
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} ${
        isApproved
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
      }`}>
        <ShieldCheck className="w-3 h-3" />
        {value}
      </span>
    );
  }

  if (type === 'direction') {
    switch (value) {
      case 'supports':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} bg-emerald-500/15 text-emerald-400 border border-emerald-500/30`}>
            <CheckCircle2 className="w-3 h-3" />
            Supports
          </span>
        );
      case 'contradicts':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} bg-rose-500/15 text-rose-400 border border-rose-500/30`}>
            <AlertCircle className="w-3 h-3" />
            Contradicts
          </span>
        );
      case 'contextual':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} bg-amber-500/15 text-amber-400 border border-amber-500/30`}>
            <AlertTriangle className="w-3 h-3" />
            Contextual
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} bg-slate-500/15 text-slate-400 border border-slate-500/30`}>
            <HelpCircle className="w-3 h-3" />
            Unclear
          </span>
        );
    }
  }

  if (type === 'review') {
    switch (value) {
      case 'Reviewed / Source Confirmed':
        return (
          <span className={`inline-flex items-center gap-1 rounded font-medium ${padding} bg-teal-500/15 text-teal-300 border border-teal-500/30`}>
            <CheckCircle2 className="w-3 h-3 text-teal-400" />
            {value}
          </span>
        );
      case 'Contradictory Finding':
        return (
          <span className={`inline-flex items-center gap-1 rounded font-medium ${padding} bg-rose-500/20 text-rose-300 border border-rose-500/40`}>
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            {value}
          </span>
        );
      case 'Needs Review':
        return (
          <span className={`inline-flex items-center gap-1 rounded font-medium ${padding} bg-amber-500/15 text-amber-300 border border-amber-500/30`}>
            <Activity className="w-3 h-3 text-amber-400" />
            {value}
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1 rounded font-medium ${padding} bg-slate-500/15 text-slate-300 border border-slate-500/30`}>
            {value}
          </span>
        );
    }
  }

  if (type === 'category') {
    return (
      <span className={`inline-flex items-center gap-1 rounded font-mono font-medium ${padding} bg-cyan-500/10 text-cyan-300 border border-cyan-500/20`}>
        <FileText className="w-3 h-3" />
        {value}
      </span>
    );
  }

  if (type === 'contradiction') {
    return (
      <span className={`inline-flex items-center gap-1 rounded font-medium ${padding} bg-rose-500/15 text-rose-400 border border-rose-500/30`}>
        <AlertTriangle className="w-3 h-3" />
        {value}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded ${padding} bg-slate-700 text-slate-200`}>
      {value}
    </span>
  );
};
