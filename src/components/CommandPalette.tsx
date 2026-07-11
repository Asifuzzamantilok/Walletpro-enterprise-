import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, ArrowRight, ShieldAlert, DollarSign, Cpu, Play, Activity, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isAuthorizedForTab, hasActionPermission } from '../utils/auth';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onExecuteAction: (actionId: string) => void;
  activeRole: string;
}

export function CommandPalette({ isOpen, onClose, onSelectTab, onExecuteAction, activeRole }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const commands = [
    {
      id: 'tab-dashboard',
      title: 'Navigate to Executive Command',
      subtitle: 'Analyze 19 KPIs, Recharts widgets, and live operations',
      icon: Activity,
      category: 'Navigation',
      action: () => onSelectTab('dashboard')
    },
    {
      id: 'tab-audit',
      title: 'Navigate to Audit Dashboard',
      subtitle: 'View architectural technical debt and logs',
      icon: Cpu,
      category: 'Navigation',
      action: () => onSelectTab('audit')
    },
    {
      id: 'tab-treasury',
      title: 'Navigate to Treasury Flow',
      subtitle: 'Analyze liquidity pools and global ledger',
      icon: DollarSign,
      category: 'Navigation',
      action: () => onSelectTab('treasury')
    },
    {
      id: 'tab-risk',
      title: 'Navigate to Risk & Fraud',
      subtitle: 'Check compliance rules and scan secrets',
      icon: ShieldAlert,
      category: 'Navigation',
      action: () => onSelectTab('risk')
    },
    {
      id: 'tab-customers',
      title: 'Navigate to Customer Ops Center',
      subtitle: 'Manage fintech users, card requests, KYC validation, and security triggers',
      icon: Users,
      category: 'Navigation',
      action: () => onSelectTab('customers')
    },
    {
      id: 'action-refactor-all',
      title: 'Trigger Core Modernization Roadmap',
      subtitle: 'Sequentially deploy all approved phases',
      icon: Play,
      category: 'Operations',
      action: () => {
        onExecuteAction('modernize-all');
        onClose();
      }
    },
    {
      id: 'action-scan-secrets',
      title: 'Scan Workspace for PCI Leaks',
      subtitle: 'Run security parser against active context',
      icon: ShieldAlert,
      category: 'Security',
      action: () => {
        onSelectTab('risk');
        onExecuteAction('run-risk-scan');
        onClose();
      }
    },
    // HIGH-FIDELITY FINTECH ENTITY SEARCH SYSTEM
    {
      id: 'search-customer',
      title: 'Customer: Tilok Mania (ID: usr_92a81f)',
      subtitle: 'Active AML status • Verified PEP profile • Regional UK resident',
      icon: Users,
      category: 'Customer',
      action: () => {
        onSelectTab('customers');
        onClose();
      }
    },
    {
      id: 'search-wallet',
      title: 'Wallet: Core EUR Reserve (ID: wal_88a29b)',
      subtitle: 'Balance: €4,291,080.00 • Connected Node: FedWire Gateway',
      icon: DollarSign,
      category: 'Wallet',
      action: () => {
        onSelectTab('wallets');
        onClose();
      }
    },
    {
      id: 'search-card',
      title: 'Card: Virtual Visa Classic (ID: crd_110a)',
      subtitle: 'Owner: Jane Doe • Status: Active Token • Monthly limit $5,000',
      icon: DollarSign,
      category: 'Card',
      action: () => {
        onSelectTab('cards');
        onClose();
      }
    },
    {
      id: 'search-transaction',
      title: 'Transaction: Settlement FX Clear (ID: tx_88291)',
      subtitle: 'Value: $250,000.00 • Swapped EUR/USD • Settled',
      icon: DollarSign,
      category: 'Transaction',
      action: () => {
        onSelectTab('transactions');
        onClose();
      }
    },
    {
      id: 'search-ticket',
      title: 'Ticket: L2 Webhook Delay Mismatch (#88219)',
      subtitle: 'Status: Pending Assignment • Severity: Medium Priority',
      icon: Cpu,
      category: 'Ticket',
      action: () => {
        onSelectTab('dashboard');
        onClose();
      }
    },
    {
      id: 'search-staff',
      title: 'Staff: Chief Auditor (Tilok compliance officer)',
      subtitle: 'Active Credentials: Super Administrator • Multi-factor Active',
      icon: Users,
      category: 'Staff',
      action: () => {
        onSelectTab('dashboard');
        onClose();
      }
    },
    {
      id: 'search-merchant',
      title: 'Merchant: Global Acme Commerce (ID: mer_acme_82)',
      subtitle: 'Gross Settled Today: $1,250,000.00 • Active Webhook Routing',
      icon: Activity,
      category: 'Merchant',
      action: () => {
        onSelectTab('settlements');
        onClose();
      }
    },
    {
      id: 'search-case',
      title: 'Case: suspicious velocity flow override (#case_902)',
      subtitle: 'Status: Open Compliance Review • Level 3 Compliance Audit Required',
      icon: ShieldAlert,
      category: 'Case',
      action: () => {
        onSelectTab('risk');
        onClose();
      }
    }
  ];

  const isCommandAuthorized = (cmd: typeof commands[0]): boolean => {
    if (cmd.id === 'tab-dashboard') return isAuthorizedForTab(activeRole, 'dashboard');
    if (cmd.id === 'tab-audit') return isAuthorizedForTab(activeRole, 'audit');
    if (cmd.id === 'tab-treasury') return isAuthorizedForTab(activeRole, 'treasury');
    if (cmd.id === 'tab-risk') return isAuthorizedForTab(activeRole, 'risk');
    if (cmd.id === 'tab-customers') return isAuthorizedForTab(activeRole, 'customers');
    if (cmd.id === 'action-refactor-all') return hasActionPermission(activeRole, 'settings.modify');
    if (cmd.id === 'action-scan-secrets') return isAuthorizedForTab(activeRole, 'risk');
    return true;
  };

  const filteredCommands = commands
    .filter(isCommandAuthorized)
    .filter(cmd =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="command-palette-container" className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-lg glass-panel-dark text-slate-100 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/50 bg-slate-900/30">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search operations, screens, or code actions..."
                className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-400 outline-none focus:ring-0"
              />
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 font-mono">ESC</span>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {filteredCommands.length > 0 ? (
                <div className="space-y-1">
                  {/* Categorize results */}
                  {Array.from(new Set(filteredCommands.map(c => c.category))).map(category => (
                    <div key={category}>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5">{category}</div>
                      <div className="space-y-0.5">
                        {filteredCommands.filter(c => c.category === category).map(cmd => {
                          const Icon = cmd.icon;
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => {
                                cmd.action();
                                onClose();
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800/80 rounded-lg text-left transition-colors group"
                            >
                              <div className="p-1.5 rounded bg-slate-800 border border-slate-700/50 text-slate-300 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{cmd.title}</div>
                                <div className="text-[10px] text-slate-400 truncate">{cmd.subtitle}</div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No matching operations or actions found. Try searching for <span className="text-blue-400 font-semibold">Audit</span>, <span className="text-blue-400 font-semibold">Treasury</span>, or <span className="text-blue-400 font-semibold">Refactor</span>.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 text-[10px] text-slate-500 flex justify-between items-center font-mono">
              <span>Use ↑↓ keys to select</span>
              <span>⏎ to trigger operation</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
