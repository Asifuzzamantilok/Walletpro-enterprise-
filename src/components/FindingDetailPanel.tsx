import React, { useState } from 'react';
import { X, Check, ShieldAlert, Cpu, Lightbulb, Code, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditFinding } from '../types';

const getCleanModuleName = (path: string) => {
  const mapping: { [key: string]: string } = {
    '/src/components/WalletTable.tsx': 'Wallet Table Component',
    '/src/pages/Admin/Settings.tsx': 'Admin Settings Panel',
    '/src/api/transactions/index.ts': 'Transactions API Endpoint',
    '/src/lib/prisma/schema.prisma': 'Database Schema Model',
    '/src/context/AuthContext.tsx': 'Authentication Context Provider'
  };
  return mapping[path] || path.split('/').pop() || path;
};

interface FindingDetailPanelProps {
  finding: AuditFinding | null;
  onClose: () => void;
  onOptimize: (findingId: string) => void;
}

export function FindingDetailPanel({ finding, onClose, onOptimize }: FindingDetailPanelProps) {
  const [activeCodeTab, setActiveCodeTab] = useState<'bad' | 'good'>('bad');
  const [isRefactoring, setIsRefactoring] = useState(false);

  if (!finding) return null;

  const handleRefactorClick = () => {
    setIsRefactoring(true);
    // Simulate refactor steps
    setTimeout(() => {
      onOptimize(finding.id);
      setIsRefactoring(false);
      setActiveCodeTab('good');
    }, 2000);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded bg-red-100 border border-red-200 text-red-700 text-[10px] font-bold">Critical Threat</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded bg-orange-100 border border-orange-200 text-orange-700 text-[10px] font-bold">High Severity</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded bg-yellow-100 border border-yellow-200 text-yellow-700 text-[10px] font-bold">Medium Priority</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-green-100 border border-green-200 text-green-700 text-[10px] font-bold">Low Priority</span>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 flex justify-end">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs cursor-pointer"
        />

        {/* Panel Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border-l border-slate-200/80 shadow-2xl h-full flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                  {finding.issueType}
                </span>
                {getSeverityBadge(finding.severity)}
                {finding.status === 'Optimized' ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Optimized
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 animate-pulse">
                    Review Pending
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-800 font-display truncate max-w-[500px]">
                {getCleanModuleName(finding.filePath)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Finding Overview */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Impact Assessment</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {finding.description}
              </p>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                File Context: {finding.loc} complexity scope.
              </div>
            </div>

            {/* Recommendation block */}
            <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Target Resolution</span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                Recommendation: <strong className="font-bold">{finding.recommendation}</strong>. Remove logic leaking to client state or unsafe telemetry, wrap the entry point inside role protection, or apply indexing configurations.
              </p>
            </div>

            {/* Code Comparison Workspace */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-slate-500" />
                  Code Schema Diff
                </span>
                {/* Code tabs */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setActiveCodeTab('bad')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      activeCodeTab === 'bad'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Vulnerable Legacy
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('good')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      activeCodeTab === 'good'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Optimized Target
                  </button>
                </div>
              </div>

              {/* Code blocks */}
              <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-lg text-[11px] font-mono">
                {/* Simulated file path bar */}
                <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400">
                  <span>{getCleanModuleName(finding.filePath)}</span>
                  <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                    {activeCodeTab === 'bad' ? 'LEGACY' : 'COMPILED'}
                  </span>
                </div>

                {/* Preformatted code */}
                <div className="p-4 max-h-[300px] overflow-auto custom-scrollbar select-text text-left">
                  {activeCodeTab === 'bad' ? (
                    <pre className="text-red-300">
                      <code>{finding.codeBad}</code>
                    </pre>
                  ) : (
                    <pre className="text-emerald-300">
                      <code>{finding.codeGood}</code>
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-4">
            <div className="text-[10px] text-slate-500 max-w-[240px] leading-tight font-medium">
              * Resolving executes a safe AST compiler refactor and registers the change into the enterprise timeline.
            </div>

            {finding.status === 'Optimized' ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Optimized &amp; Verified</span>
              </div>
            ) : (
              <button
                disabled={isRefactoring}
                onClick={handleRefactorClick}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition-all duration-200 cursor-pointer ${
                  isRefactoring
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:translate-y-0.5 shadow-blue-500/15'
                }`}
              >
                {isRefactoring ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Parsing AST...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Auto-Refactor</span>
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
