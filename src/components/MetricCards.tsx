import React from 'react';
import { AlertTriangle, Layers, ShieldCheck, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricCardsProps {
  technicalDebtLevel: string;
  componentDriftsCount: number;
  securityScore: number;
  onMetricClick: (type: 'debt' | 'drifts' | 'security') => void;
  selectedFilter: string;
}

export function MetricCards({
  technicalDebtLevel,
  componentDriftsCount,
  securityScore,
  onMetricClick,
  selectedFilter
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Technical Debt Card */}
      <motion.button
        whileHover={{ y: -2 }}
        onClick={() => onMetricClick('debt')}
        className={`text-left p-5 rounded-xl border transition-all duration-200 shadow-sm relative overflow-hidden group cursor-pointer ${
          selectedFilter === 'debt'
            ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20'
            : 'bg-white hover:bg-slate-50/50 border-slate-200'
        }`}
      >
        <div className="absolute top-0 right-0 p-3 text-slate-100 group-hover:text-slate-200 transition-colors pointer-events-none">
          <AlertTriangle className={`w-12 h-12 stroke-1 opacity-5 ${
            technicalDebtLevel === 'High' ? 'text-red-500' : 'text-emerald-500'
          }`} />
        </div>
        
        <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1.5">
          <span>Technical Debt</span>
          {technicalDebtLevel === 'High' && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>
        
        <div className="text-2xl font-bold font-display tracking-tight text-slate-800 flex items-baseline gap-2">
          {technicalDebtLevel}
          <span className="text-[10px] text-slate-400 font-normal">limit threshold</span>
        </div>
        
        <div className="text-[10px] text-red-500 font-semibold mt-2 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Requires rapid mitigation checks</span>
        </div>
      </motion.button>

      {/* Component Drifts Card */}
      <motion.button
        whileHover={{ y: -2 }}
        onClick={() => onMetricClick('drifts')}
        className={`text-left p-5 rounded-xl border transition-all duration-200 shadow-sm relative overflow-hidden group cursor-pointer ${
          selectedFilter === 'drifts'
            ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20'
            : 'bg-white hover:bg-slate-50/50 border-slate-200'
        }`}
      >
        <div className="absolute top-0 right-0 p-3 text-slate-100 group-hover:text-slate-200 transition-colors pointer-events-none">
          <Layers className="w-12 h-12 stroke-1 opacity-5 text-blue-500" />
        </div>
        
        <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1.5">
          <span>Component Drifts</span>
          <Sparkles className="w-3 h-3 text-blue-500" />
        </div>
        
        <div className="text-2xl font-bold font-display tracking-tight text-slate-800 flex items-baseline gap-2">
          {componentDriftsCount}
          <span className="text-[10px] text-slate-400 font-normal">styles matched</span>
        </div>
        
        <div className="text-[10px] text-orange-500 font-semibold mt-2 flex items-center gap-1">
          <span>Inconsistent files remaining</span>
        </div>
      </motion.button>

      {/* Security Score Card */}
      <motion.button
        whileHover={{ y: -2 }}
        onClick={() => onMetricClick('security')}
        className={`text-left p-5 rounded-xl border transition-all duration-200 shadow-sm relative overflow-hidden group cursor-pointer ${
          selectedFilter === 'security'
            ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20'
            : 'bg-white hover:bg-slate-50/50 border-slate-200'
        }`}
      >
        <div className="absolute top-0 right-0 p-3 text-slate-100 group-hover:text-slate-200 transition-colors pointer-events-none">
          <ShieldCheck className="w-12 h-12 stroke-1 opacity-5 text-emerald-500" />
        </div>
        
        <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1.5">
          <span>Security Score</span>
          <CheckCircle className="w-3 h-3 text-emerald-500" />
        </div>
        
        <div className="text-2xl font-bold font-display tracking-tight text-slate-800 flex items-baseline gap-2">
          {securityScore}/100
          <span className="text-[10px] text-slate-400 font-normal">compliance check</span>
        </div>
        
        <div className="text-[10px] text-green-600 font-semibold mt-2 flex items-center gap-1">
          <span>PCI-DSS Core Compliant</span>
        </div>
      </motion.button>
    </div>
  );
}
