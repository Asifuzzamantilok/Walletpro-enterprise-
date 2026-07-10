import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { FindingDetailPanel } from './components/FindingDetailPanel';
import { CommandPalette } from './components/CommandPalette';
import { TreasuryTab } from './components/TreasuryTab';
import { RiskFraudTab } from './components/RiskFraudTab';
import { CustomerOpsCenter } from './components/CustomerOpsCenter';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { WalletsPage } from './components/operations/WalletsPage';
import { TransactionsPage } from './components/operations/TransactionsPage';
import { LedgerPage } from './components/operations/LedgerPage';
import { SettlementsPage } from './components/operations/SettlementsPage';
import { RefundsPage } from './components/operations/RefundsPage';
import { LimitsPage } from './components/operations/LimitsPage';
import { CardsPage } from './components/operations/CardsPage';
import { CompliancePage } from './components/compliance/CompliancePage';
import { RiskIntelligenceCenter } from './components/risk/RiskIntelligenceCenter';
import { FinanceOperationsCenter } from './components/finance/FinanceOperationsCenter';
import { SupportCenter } from './components/support/SupportCenter';
import { BusinessIntelligenceCenter } from './components/bi/BusinessIntelligenceCenter';
import IdentityAccessCenter from './components/iam/IdentityAccessCenter';
import { SecurityOperationsCenter } from './components/soc/SecurityOperationsCenter';
import { PlatformAdminCenter } from './components/admin/PlatformAdminCenter';
import { DeveloperPortal } from './components/developer/DeveloperPortal';
import { SandboxFallbackPage } from './components/operations/SandboxFallbackPage';
import { motion, AnimatePresence } from 'motion/react';
import { isAuthorizedForTab } from './utils/auth';
import { 
  initialFindings, 
  initialRoadmap, 
  treasuryBalances, 
  transactionLedger, 
  riskRules, 
  devFiles 
} from './data';
import { AuditFinding, Severity, FindingStatus, IssueType } from './types';
import { 
  Play, 
  Check, 
  AlertTriangle, 
  Layers, 
  FileCode, 
  Settings, 
  Terminal, 
  ShieldAlert, 
  X, 
  Maximize2,
  ListFilter,
  CheckCircle,
  HelpCircle,
  Cpu,
  RefreshCw,
  Clock
} from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

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

export default function App() {
  // Navigation & Shell State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // Real-time Data states
  const [findings, setFindings] = useState<AuditFinding[]>(initialFindings);
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  const [balances, setBalances] = useState(treasuryBalances);
  const [transactions, setTransactions] = useState(transactionLedger);
  const [rules, setRules] = useState(riskRules);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Filtering states for Audit findings
  const [selectedMetricFilter, setSelectedMetricFilter] = useState<'all' | 'debt' | 'drifts' | 'security'>('all');
  const [activeTableFilter, setActiveTableFilter] = useState<string>('All');
  const [searchText, setSearchText] = useState('');
  
  // Selected Finding for Side Detail view
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);

  // Roadmap Execution State
  const [isDeployingRoadmap, setIsDeployingRoadmap] = useState(false);
  const [roadmapProgress, setRoadmapProgress] = useState(0);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>('phase-1');

  // Treasury sweeping simulated state
  const [isProcessingSweep, setIsProcessingSweep] = useState(false);

  // Dynamic user email from metadata/props or default
  const userEmail = "tilok.mania@gmail.com";

  // Keyboard shortcut listener for Command Palette (⌘+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to add beautiful, styled frosted glass toasts
  const addToast = (title: string, message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const newToast: Toast = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Check if current tab is authorized for activeRole
  const isTabAuthorized = (tabId: string, role: string): boolean => {
    return isAuthorizedForTab(role, tabId);
  };

  // Permissions / RBAC Enforcement
  const [activeRole, setActiveRole] = useState<string>(() => {
    return localStorage.getItem('walletpro_active_role') || 'Super Administrator';
  });

  useEffect(() => {
    const checkRoleAndTab = () => {
      const currentRole = localStorage.getItem('walletpro_active_role') || 'Super Administrator';
      setActiveRole(currentRole);
    };

    checkRoleAndTab();
    
    // Periodically sync when role changes
    const interval = setInterval(checkRoleAndTab, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Callback to resolve / optimize a specific finding from Detail Panel or Developer Console
  const handleOptimizeFinding = (findingId: string) => {
    setFindings(prevFindings =>
      prevFindings.map(finding => {
        if (finding.id === findingId) {
          if (finding.status !== 'Optimized') {
            addToast(
              'Code Restructured',
              `Successfully updated ${getCleanModuleName(finding.filePath)} schema to secure enterprise standard.`,
              'success'
            );
            
            // Dynamically adjust rules and score based on what was fixed
            if (finding.id === 'find-2') { // Auth settings leak
              setRules(prev => prev.map(r => r.id === 'rule-2' ? { ...r, status: 'Compliant' } : r));
            } else if (finding.id === 'find-5') { // CVV / card logging leak
              setRules(prev => prev.map(r => r.id === 'rule-1' ? { ...r, status: 'Compliant' } : r));
            } else if (finding.id === 'find-3') { // N+1 Database issue
              setRules(prev => prev.map(r => r.id === 'rule-3' ? { ...r, status: 'Compliant' } : r));
            }
          }
          return { ...finding, status: 'Optimized' };
        }
        return finding;
      })
    );

    // Keep the selected finding synchronized with updated state
    setSelectedFinding(prev => prev && prev.id === findingId ? { ...prev, status: 'Optimized' } : prev);
  };

  // Toggle compliance rule directly from Risk & Fraud Checklist
  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => {
      if (rule.id === ruleId) {
        const nextStatus = rule.status === 'Compliant' ? 'Non-Compliant' : 'Compliant';
        addToast(
          'Security Safeguard Updated',
          `${rule.name} set to ${nextStatus === 'Compliant' ? 'Compliant & certified' : 'Non-compliant configuration'}.`,
          nextStatus === 'Compliant' ? 'success' : 'warning'
        );
        return { ...rule, status: nextStatus };
      }
      return rule;
    }));
  };

  // Simulated treasury funds settlement sweep
  const handleTriggerSweep = (amount: number, bankId: string, currency: string) => {
    setIsProcessingSweep(true);
    setTimeout(() => {
      setIsProcessingSweep(false);
      
      // Update bank balance
      setBalances(prevBalances => prevBalances.map(bal => {
        if (bal.id === bankId) {
          return { ...bal, amount: Math.max(0, bal.amount - amount) };
        }
        return bal;
      }));

      // Append new ledger transaction
      const newTx: any = {
        id: `tx-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        counterparty: 'Sweep Clearance Sweep',
        currency,
        amount: -amount,
        type: 'Outflow',
        status: 'Settled'
      };
      setTransactions(prev => [newTx, ...prev]);

      addToast(
        'Liquidity Swept Successfully',
        `Successfully settled ${currency} ${amount.toLocaleString()} through double-entry clearing systems.`,
        'success'
      );
    }, 1800);
  };

  // Simulated sequential modernization deployer
  const handleApproveRoadmapDeploy = () => {
    setIsDeployingRoadmap(true);
    setRoadmapProgress(0);
    
    // Simulate phases updating step-by-step
    let currentStep = 1;
    addToast('Pipeline Initiated', 'Booting Docker compiling environments for AST refactors.', 'info');

    const interval = setInterval(() => {
      if (currentStep <= 5) {
        const phaseId = `phase-${currentStep}`;
        
        // Update roadmap states
        setRoadmap(prev => prev.map(p => {
          if (p.id === phaseId) {
            return { ...p, status: 'completed' };
          }
          const nextIndex = currentStep + 1;
          if (p.id === `phase-${nextIndex}`) {
            return { ...p, status: 'active' };
          }
          return p;
        }));

        // Optimize relevant findings on each step
        if (currentStep === 1) { // Design System
          addToast('Design Primed', 'Standard visual tokens applied across active pages.', 'success');
        } else if (currentStep === 2) { // Sidebar / Shell
          addToast('Layout Active', 'Command system (⌘+K) and context sidebar resolved.', 'success');
        } else if (currentStep === 3) { // Treasury Flow
          addToast('Treasury Cleared', 'Liquid funds and sparklines trace to double-entry logs.', 'success');
        } else if (currentStep === 4) { // Risk & Security
          // Fix security findings
          setFindings(prev => prev.map(f => {
            if (f.id === 'find-2' || f.id === 'find-5') {
              return { ...f, status: 'Optimized' };
            }
            return f;
          }));
          setRules(prev => prev.map(r => (r.id === 'rule-1' || r.id === 'rule-2') ? { ...r, status: 'Compliant' } : r));
          addToast('Shield Operational', 'PCI-DSS and auth leaks fully patched.', 'success');
        } else if (currentStep === 5) { // Developer console
          setFindings(prev => prev.map(f => ({ ...f, status: 'Optimized' })));
          setRules(prev => prev.map(r => ({ ...r, status: 'Compliant' })));
          addToast('Console Integrated', 'Live refactoring debugger deployed successfully.', 'success');
        }

        setRoadmapProgress(prev => Math.min(100, prev + 20));
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDeployingRoadmap(false);
        addToast(
          'Platform Fully Modernized!',
          'WalletPro is now running at 100% compliance and zero known technical debt.',
          'success'
        );
      }
    }, 2500);
  };

  // Helper calculations for dynamic metrics
  const optimizedCount = findings.filter(f => f.status === 'Optimized').length;
  const totalFindingsCount = findings.length;

  const currentTechnicalDebtLevel = (() => {
    const pendingCount = findings.filter(f => f.status === 'Pending' && (f.severity === 'Critical' || f.severity === 'High')).length;
    if (pendingCount > 2) return 'High';
    if (pendingCount > 0) return 'Medium';
    return 'Resolved';
  })();

  const currentComponentDriftsCount = findings.filter(f => f.status === 'Pending').length * 85 + 2;

  const calculatedSecurityScore = (() => {
    const compliantCount = rules.filter(r => r.status === 'Compliant').length;
    const totalCount = rules.length;
    return Math.round((compliantCount / totalCount) * 100);
  })();

  // Filtered Findings list for Audit table
  const filteredFindings = findings.filter(finding => {
    // 1. Metric filter
    if (selectedMetricFilter === 'debt' && (finding.severity !== 'Critical' && finding.severity !== 'High')) {
      return false;
    }
    if (selectedMetricFilter === 'drifts' && finding.issueType !== 'Structure' && finding.issueType !== 'Logic Bleed') {
      return false;
    }
    if (selectedMetricFilter === 'security' && finding.category !== 'security') {
      return false;
    }

    // 2. Table status tabs
    if (activeTableFilter === 'Critical' && finding.severity !== 'Critical') return false;
    if (activeTableFilter === 'High' && finding.severity !== 'High') return false;
    if (activeTableFilter === 'Medium' && finding.severity !== 'Medium') return false;
    if (activeTableFilter === 'Optimized' && finding.status !== 'Optimized') return false;
    if (activeTableFilter === 'All' && finding.status === 'Optimized' && selectedMetricFilter === 'all') {
      // Show pending ones by default when All is chosen to keep action-focus
    }

    // 3. Search query
    const matchSearch = finding.filePath.toLowerCase().includes(searchText.toLowerCase()) || 
                        finding.issueType.toLowerCase().includes(searchText.toLowerCase()) ||
                        finding.recommendation.toLowerCase().includes(searchText.toLowerCase());
    
    return matchSearch;
  });

  const getSeverityBadgeColor = (sev: Severity) => {
    switch (sev) {
      case 'Critical': return 'bg-red-50 text-red-700 border border-red-100';
      case 'High': return 'bg-orange-50 text-orange-700 border border-orange-100';
      case 'Medium': return 'bg-yellow-50 text-yellow-800 border border-yellow-100';
      default: return 'bg-green-50 text-green-700 border border-green-100';
    }
  };

  const getStatusBadgeColor = (stat: FindingStatus) => {
    switch (stat) {
      case 'Optimized': return 'bg-emerald-100 text-emerald-800 font-bold';
      case 'Optimizing': return 'bg-blue-100 text-blue-800 font-bold animate-pulse';
      default: return 'bg-amber-50 text-amber-800 border border-amber-100 font-bold';
    }
  };

  return (
    <div id="application-container" className="flex h-screen w-screen bg-[#f0f2f5] font-sans text-slate-800 overflow-hidden select-none">
      {/* Toast Notification Container */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-2xl text-white flex items-start gap-3 w-80 relative overflow-hidden"
            >
              {/* Highlight bar */}
              <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />
              
              <div className="flex-1 space-y-0.5 text-left pl-1">
                <h4 className="text-xs font-bold font-display tracking-tight text-slate-100">{toast.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-normal">{toast.message}</p>
              </div>

              <button 
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-20 md:hidden"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar for Desktop */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileDrawerOpen(false);
          }} 
          optimizedCount={optimizedCount}
          totalCount={totalFindingsCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Sidebar Drawer for Mobile */}
      <div className={`fixed top-0 bottom-0 left-0 z-30 transform transition-transform duration-300 md:hidden flex h-full ${
        isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          activeTab={activeTab} 
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileDrawerOpen(false);
          }} 
          optimizedCount={optimizedCount}
          totalCount={totalFindingsCount}
          isMobile={true}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />
      </div>

      {/* Main workspace container */}
      <main className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden">
        <Header 
          activeTab={activeTab} 
          onSearchClick={() => setIsPaletteOpen(true)} 
          userEmail={userEmail}
          onMenuToggle={() => setIsMobileDrawerOpen(true)}
        />

        {/* Dynamic Inner Tab body */}
        <div className="flex-1 p-8 overflow-hidden">
          {!isAuthorizedForTab(activeRole, activeTab) ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner max-w-4xl mx-auto my-12 animate-fade-in">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-md shadow-red-200 mb-6">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold font-display text-slate-800 tracking-tight mb-2">403 - Enterprise Access Forbidden</h2>
              <p className="text-xs text-slate-500 max-w-md mb-8">
                Your currently active role (<b>{activeRole}</b>) does not possess the credentials or RBAC policy clearances to bind to this workspace context.
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-lg bg-white border border-slate-200 rounded-xl p-4 mb-8 text-left text-xs font-semibold shadow-sm font-mono text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Resource</span>
                  <span className="text-slate-800 font-bold">{activeTab.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Identity Role</span>
                  <span className="text-slate-800 font-bold">{activeRole}</span>
                </div>
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Access Policy Rule</span>
                  <span className="text-slate-800 font-bold">Unmapped Role Permissions</span>
                </div>
                <div className="mt-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Security Reference</span>
                  <span className="text-red-600 font-bold">SEC-403-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  Return to Executive Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab('iam-staff');
                    addToast('Identity Access Request', 'Opening staff directory. Use the active role switcher to emulate different authority tiers.', 'info');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Request Role Elevation
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <ExecutiveDashboard />
              )}

          {activeTab === 'audit' && (
            <div className="grid grid-cols-12 gap-6 h-full overflow-hidden">
              {/* Left Column (Main Metrics and Findings Log) */}
              <div className="col-span-12 xl:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
                {/* Metrics */}
                <MetricCards 
                  technicalDebtLevel={currentTechnicalDebtLevel}
                  componentDriftsCount={currentComponentDriftsCount}
                  securityScore={calculatedSecurityScore}
                  onMetricClick={(type) => {
                    setSelectedMetricFilter(prev => prev === type ? 'all' : type);
                  }}
                  selectedFilter={selectedMetricFilter}
                />

                {/* Findings Table */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50/50">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-sm text-slate-800 font-display flex items-center gap-2">
                        <span>Audit Findings Log</span>
                        {selectedMetricFilter !== 'all' && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                            Filter: {selectedMetricFilter === 'debt' ? 'Critical Debt' : selectedMetricFilter === 'drifts' ? 'Drifts' : 'Security'}
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium">Click on a row to explore details, view differential code schemas, and auto-refactor.</p>
                    </div>

                    {/* Inline Search and Table Filter tabs */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Filter log..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          className="bg-white border border-slate-200 text-[11px] font-medium rounded-lg py-1.5 px-3.5 w-36 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      {/* Status/Priority Tabs */}
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        {['All', 'Critical', 'High', 'Medium', 'Optimized'].map(filter => (
                          <button
                            key={filter}
                            onClick={() => setActiveTableFilter(filter)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                              activeTableFilter === filter
                                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Log Table Scroll wrapper */}
                  <div className="flex-1 overflow-auto custom-scrollbar">
                    {filteredFindings.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white border-b border-slate-100 shadow-xs z-10">
                          <tr className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                            <th className="px-6 py-3">File Path / Component</th>
                            <th className="px-6 py-3">Issue Type</th>
                            <th className="px-6 py-3">Complexity</th>
                            <th className="px-6 py-3">Severity</th>
                            <th className="px-6 py-3 text-right">Recommendation</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-50">
                          {filteredFindings.map((finding) => (
                            <tr
                              key={finding.id}
                              onClick={() => setSelectedFinding(finding)}
                              className="border-b border-slate-50 hover:bg-slate-50/70 transition-all cursor-pointer select-none group"
                            >
                              <td className="px-6 py-4 font-mono text-[11px] text-slate-900 group-hover:text-blue-600 transition-colors">
                                {getCleanModuleName(finding.filePath)}
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/40 text-[10px] font-mono">
                                  {finding.issueType}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-mono text-[10px]">
                                {finding.loc}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getSeverityBadgeColor(finding.severity)}`}>
                                  {finding.severity}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-blue-600 group-hover:underline">{finding.recommendation}</span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] ${getStatusBadgeColor(finding.status)}`}>
                                    {finding.status}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400 text-xs">
                        <FileCode className="w-12 h-12 stroke-1 opacity-20 mb-2 text-slate-500" />
                        <span>No unresolved architectural findings matched your filter parameters.</span>
                        <button
                          onClick={() => {
                            setSelectedMetricFilter('all');
                            setActiveTableFilter('All');
                            setSearchText('');
                          }}
                          className="mt-3 text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Clear active filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (Roadmap Phase tracker) */}
              <div className="col-span-12 xl:col-span-4 flex flex-col bg-slate-900 rounded-xl shadow-xl overflow-hidden h-full">
                {/* Roadmap Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-white font-bold text-sm font-display">Modernization Roadmap</h3>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider bg-blue-900/40 border border-blue-800/40 px-2 py-0.5 rounded">
                      PHASE 1 ACTIVE
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">Sequence controls for enterprise structural progression.</p>

                  {/* Progress bar for roadmap deploy */}
                  {isDeployingRoadmap && (
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-blue-400 font-bold">
                        <span>DEPLOYING ENTERPRISE CORE...</span>
                        <span>{roadmapProgress}%</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden p-[1.5px] border border-slate-700/50">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${roadmapProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline content list */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                  {roadmap.map((phase) => {
                    const isSelected = selectedRoadmapId === phase.id;
                    return (
                      <div
                        key={phase.id}
                        onClick={() => setSelectedRoadmapId(phase.id)}
                        className={`relative pl-8 border-l border-slate-800 transition-all cursor-pointer group ${
                          phase.status === 'completed' 
                            ? 'opacity-100' 
                            : phase.status === 'active'
                            ? 'opacity-100'
                            : 'opacity-50 hover:opacity-85'
                        }`}
                      >
                        {/* Bullet indicators */}
                        <div className={`absolute -left-[5px] top-0.5 w-2.5 h-2.5 rounded-full transition-all ${
                          phase.status === 'completed'
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                            : phase.status === 'active'
                            ? 'bg-blue-500 pulse-glow-blue'
                            : 'bg-slate-700'
                        }`} />

                        <div className="text-left space-y-0.5">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'} transition-colors`}>
                              Phase {phase.phaseNumber}: {phase.title}
                            </h4>
                            {phase.status === 'completed' && (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <span className="text-slate-400 text-[10px] block leading-snug">{phase.subtitle}</span>
                        </div>

                        {/* Expandable Selected Phase context block */}
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 bg-slate-850 rounded-lg p-3 border border-slate-800 space-y-2 text-left text-[11px] leading-relaxed text-slate-400"
                          >
                            <p>{phase.description}</p>
                            <div className="pt-1.5 border-t border-slate-800 space-y-1">
                              <div><strong className="text-slate-300">Business Value:</strong> {phase.businessValue}</div>
                              <div><strong className="text-slate-300">Complexity:</strong> {phase.estimatedComplexity} | <strong className="text-slate-300">Risk Level:</strong> {phase.riskLevel}</div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {phase.componentsAffected.map(c => (
                                  <span key={c} className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.2 rounded border border-slate-700">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer Action */}
                <div 
                  onClick={handleApproveRoadmapDeploy}
                  className={`p-6 text-center cursor-pointer transition-colors ${
                    isDeployingRoadmap 
                      ? 'bg-blue-500 cursor-not-allowed opacity-85'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <button 
                    disabled={isDeployingRoadmap}
                    className="text-white text-xs font-bold uppercase tracking-widest cursor-pointer"
                  >
                    {isDeployingRoadmap ? 'Executing pipeline...' : 'Approve for Execution'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'treasury' && (
            <TreasuryTab 
              balances={balances}
              transactions={transactions}
              onTriggerSweep={handleTriggerSweep}
              isProcessingSweep={isProcessingSweep}
            />
          )}

          {activeTab === 'risk' && (
            <RiskFraudTab 
              rules={rules}
              onToggleRule={handleToggleRule}
              securityScore={calculatedSecurityScore}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerOpsCenter onToast={addToast} />
          )}

          {activeTab === 'wallets' && (
            <WalletsPage onToast={addToast} onSelectTab={setActiveTab} />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage onToast={addToast} onSelectTab={setActiveTab} />
          )}

          {activeTab === 'ledger' && (
            <LedgerPage />
          )}

          {activeTab === 'settlements' && (
            <SettlementsPage onToast={addToast} />
          )}

          {activeTab === 'refunds' && (
            <RefundsPage onToast={addToast} />
          )}

          {activeTab === 'limits' && (
            <LimitsPage onToast={addToast} />
          )}

          {activeTab === 'cards' && (
            <CardsPage activeSubTab="cards" onToast={addToast} />
          )}

          {activeTab === 'card-orders' && (
            <CardsPage activeSubTab="card-orders" onToast={addToast} />
          )}

          {activeTab === 'card-transactions' && (
            <CardsPage activeSubTab="card-transactions" onToast={addToast} />
          )}

          {activeTab === 'card-limits' && (
            <CardsPage activeSubTab="card-limits" onToast={addToast} />
          )}

          {activeTab === 'card-controls' && (
            <CardsPage activeSubTab="card-controls" onToast={addToast} />
          )}

          {activeTab === 'card-security' && (
            <CardsPage activeSubTab="card-security" onToast={addToast} />
          )}

          {/* Compliance & KYC Operations Center */}
          {['kyc-queue', 'identity-verification', 'aml-screening', 'sanctions-screening', 'pep-screening', 'compliance-cases'].includes(activeTab) && (
            <CompliancePage activeSubTab={activeTab} onToast={addToast} onSelectTab={setActiveTab} />
          )}

          {/* Enterprise Fraud & Risk Intelligence Center */}
          {['fraud-dashboard', 'fraud-alerts', 'risk-monitoring', 'investigations', 'fraud-cases', 'frozen-accounts', 'velocity-rules', 'aml-risk', 'behavior-analytics', 'watchlists'].includes(activeTab) && (
            <RiskIntelligenceCenter 
              activeSubTab={activeTab} 
              onToast={(msg, type) => {
                const toastType = type === 'error' ? 'warning' : type;
                const title = type === 'success' ? 'Risk Safeguard Actioned' : type === 'warning' || type === 'error' ? 'Risk Alert Triggered' : 'Intelligence Center Notification';
                addToast(title, msg, toastType);
              }} 
              onSelectTab={setActiveTab} 
            />
          )}

          {/* Enterprise Treasury & Finance Operations Center */}
          {['treasury-dashboard', 'treasury-liquidity', 'treasury-settlements', 'treasury-reconciliation', 'treasury-revenue', 'treasury-fees', 'treasury-reserve-accounts', 'treasury-bank-accounts', 'treasury-accounting', 'treasury-financial-reports'].includes(activeTab) && (
            <FinanceOperationsCenter activeSubTab={activeTab} onToast={addToast} onSelectTab={setActiveTab} />
          )}

          {/* Enterprise Customer Support & Case Management Center */}
          {['support-dashboard', 'tickets', 'support-cases', 'live-chat', 'customer-communication', 'escalations', 'knowledge-base', 'macros', 'sla-management'].includes(activeTab) && (
            <SupportCenter 
              activeSubTab={activeTab} 
              onToast={addToast} 
              onSelectTab={setActiveTab} 
            />
          )}

          {/* Enterprise Business Intelligence & Executive Reporting Center */}
          {[
            'bi-executive-dashboard', 'bi-operational-analytics', 'bi-revenue-analytics', 
            'bi-customer-analytics', 'bi-transaction-analytics', 'bi-wallet-analytics', 
            'bi-card-analytics', 'bi-compliance-analytics', 'bi-fraud-analytics', 
            'bi-support-analytics', 'bi-treasury-analytics', 'bi-custom-reports', 'bi-scheduled-reports'
          ].includes(activeTab) && (
            <BusinessIntelligenceCenter 
              activeSubTab={activeTab} 
              onToast={addToast} 
              onSelectTab={setActiveTab} 
            />
          )}

          {/* Enterprise Identity & Access Management Platform */}
          {[
            'iam-dashboard', 'iam-staff', 'iam-admin-users', 'iam-invitations', 'iam-departments', 'iam-teams', 
            'iam-roles', 'iam-permission-groups', 'iam-permissions', 'iam-access-policies', 'iam-approval-workflows', 
            'iam-mfa-management', 'iam-sessions', 'iam-devices', 'iam-login-history', 'iam-password-policies', 
            'iam-access-reviews', 'iam-audit-logs'
          ].includes(activeTab) && (
            <IdentityAccessCenter 
              activeSubTab={activeTab} 
              onToast={addToast} 
              onSelectTab={setActiveTab} 
            />
          )}

          {/* Enterprise Security Operations Center */}
          {[
            'sec-dashboard', 'sec-events', 'sec-alerts', 'sec-threat', 'sec-logins', 
            'sec-sessions', 'sec-devices', 'sec-ips', 'sec-geo', 'sec-api', 
            'sec-incidents', 'sec-audit', 'sec-vuln', 'sec-policies', 'sec-reports'
          ].includes(activeTab) && (
            <SecurityOperationsCenter 
              activeSubTab={activeTab} 
              onToast={addToast} 
              onSelectTab={setActiveTab} 
            />
          )}

          {/* Enterprise Platform Administration & System Management Center */}
          {activeTab.startsWith('plat-') && (
            <PlatformAdminCenter
              activeSubTab={activeTab}
              onToast={addToast}
              onSelectTab={setActiveTab}
            />
          )}

          {/* Enterprise Developer Portal & Integration Center */}
          {activeTab.startsWith('dev-') && (
            <DeveloperPortal
              activeTab={activeTab}
              onToast={addToast}
              isDarkMode={true}
            />
          )}

          {/* Risk & Fraud mapping compatibility */}
          {activeTab === 'fraud-center' && (
            <RiskFraudTab 
              rules={rules}
              onToggleRule={handleToggleRule}
              securityScore={calculatedSecurityScore}
            />
          )}

          {/* Sandbox Fallback for unbuilt platform modules */}
          {!['dashboard', 'audit', 'customers', 'wallets', 'transactions', 'ledger', 'settlements', 
            'refunds', 'limits', 'cards', 'card-orders', 'card-transactions', 'card-limits', 
            'card-controls', 'card-security', 'treasury', 'risk', 'fraud-center',
            'kyc-queue', 'identity-verification', 'aml-screening', 'sanctions-screening', 'pep-screening', 'compliance-cases',
            'fraud-dashboard', 'fraud-alerts', 'risk-monitoring', 'investigations', 'fraud-cases', 'frozen-accounts', 'velocity-rules', 'aml-risk', 'behavior-analytics', 'watchlists',
            'treasury-dashboard', 'treasury-liquidity', 'treasury-settlements', 'treasury-reconciliation', 'treasury-revenue', 'treasury-fees', 'treasury-reserve-accounts', 'treasury-bank-accounts', 'treasury-accounting', 'treasury-financial-reports',
            'support-dashboard', 'tickets', 'support-cases', 'live-chat', 'customer-communication', 'escalations', 'knowledge-base', 'macros', 'sla-management',
            'bi-executive-dashboard', 'bi-operational-analytics', 'bi-revenue-analytics', 
            'bi-customer-analytics', 'bi-transaction-analytics', 'bi-wallet-analytics', 
            'bi-card-analytics', 'bi-compliance-analytics', 'bi-fraud-analytics', 
            'bi-support-analytics', 'bi-treasury-analytics', 'bi-custom-reports', 'bi-scheduled-reports',
            'iam-dashboard', 'iam-staff', 'iam-admin-users', 'iam-invitations', 'iam-departments', 'iam-teams', 
            'iam-roles', 'iam-permission-groups', 'iam-permissions', 'iam-access-policies', 'iam-approval-workflows', 
            'iam-mfa-management', 'iam-sessions', 'iam-devices', 'iam-login-history', 'iam-password-policies', 
            'iam-access-reviews', 'iam-audit-logs'
          ].includes(activeTab) && !activeTab.startsWith('sec-') && !activeTab.startsWith('plat-') && !activeTab.startsWith('dev-') && (
            <SandboxFallbackPage tabId={activeTab} />
          )}
          </>
          )}
        </div>
      </main>

      {/* Command Palette keyboard modal */}
      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectTab={setActiveTab}
        activeRole={activeRole}
        onExecuteAction={(id) => {
          if (id === 'modernize-all') {
            handleApproveRoadmapDeploy();
          } else if (id === 'run-risk-scan') {
            // Trigger can be simulated
            addToast('Scan Triggered', 'Searching files for PCI/auth leaks.', 'info');
          }
        }}
      />

      {/* Audit Detail sliding panel */}
      <FindingDetailPanel 
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onOptimize={handleOptimizeFinding}
      />
    </div>
  );
}
