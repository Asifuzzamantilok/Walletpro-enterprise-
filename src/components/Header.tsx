import React, { useState, useEffect } from 'react';
import { Search, Clock, Keyboard, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSearchClick: () => void;
  userEmail: string;
  onMenuToggle?: () => void;
}

export function Header({ activeTab, onSearchClick, userEmail, onMenuToggle }: HeaderProps) {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBreadcrumb = () => {
    if (activeTab.startsWith('dev-')) {
      const sectionName = activeTab.replace('dev-', '')
        .split('-')
        .map(word => {
          if (word === 'mgmt') return 'Management';
          if (word === 'api') return 'API';
          if (word === 'oauth') return 'OAuth';
          if (word === 'sdks') return 'SDKs';
          if (word === 'bg') return 'Background';
          if (word === 'vars') return 'Variables';
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
      return (
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-400">Developer Portal</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">{sectionName}</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Executive Command Center</span>
          </div>
        );
      case 'audit':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Architectural Audit</span>
          </div>
        );
      case 'treasury':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Treasury Flow Ledger</span>
          </div>
        );
      case 'risk':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Risk &amp; Compliance Monitor</span>
          </div>
        );
      case 'customers':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Customer Ops Center</span>
          </div>
        );
      case 'wallets':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Wallets Registry</span>
          </div>
        );
      case 'transactions':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Payment Monitoring Center</span>
          </div>
        );
      case 'ledger':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Immutable Ledger Ledger</span>
          </div>
        );
      case 'settlements':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Merchant Settlements</span>
          </div>
        );
      case 'refunds':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Dispute Resolutions</span>
          </div>
        );
      case 'limits':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Limits &amp; Velocity Panel</span>
          </div>
        );
      case 'cards':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Issuing</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Enterprise Card Registry</span>
          </div>
        );
      case 'card-orders':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Issuing</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Card Orders Desk</span>
          </div>
        );
      case 'card-transactions':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Issuing</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Card Transactions Stream</span>
          </div>
        );
      case 'card-limits':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Issuing</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Card Velocity Controls</span>
          </div>
        );
      case 'card-controls':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Issuing</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Card Restrictions Panel</span>
          </div>
        );
      case 'card-security':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Issuing</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Card Security &amp; PIN Desk</span>
          </div>
        );
      case 'kyc-queue':
      case 'identity-verification':
      case 'aml-screening':
      case 'sanctions-screening':
      case 'pep-screening':
      case 'compliance-cases':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Compliance</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">
              {activeTab === 'kyc-queue' && 'KYC Review Queue'}
              {activeTab === 'identity-verification' && 'Identity Verification Desk'}
              {activeTab === 'aml-screening' && 'AML Screening Radar'}
              {activeTab === 'sanctions-screening' && 'Sanctions Blocklist Review'}
              {activeTab === 'pep-screening' && 'PEP Check Center'}
              {activeTab === 'compliance-cases' && 'Compliance SAR Cases'}
            </span>
          </div>
        );
      case 'fraud-dashboard':
      case 'fraud-alerts':
      case 'risk-monitoring':
      case 'investigations':
      case 'fraud-cases':
      case 'frozen-accounts':
      case 'velocity-rules':
      case 'aml-risk':
      case 'behavior-analytics':
      case 'watchlists':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Risk</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">
              {activeTab === 'fraud-dashboard' && 'Fraud Dashboard'}
              {activeTab === 'fraud-alerts' && 'Fraud Alert Matrix'}
              {activeTab === 'risk-monitoring' && 'Live Risk Monitor'}
              {activeTab === 'investigations' && 'Forensic Case Workspace'}
              {activeTab === 'fraud-cases' && 'Risk Cases Queue'}
              {activeTab === 'frozen-accounts' && 'Frozen Assets Hold Ledger'}
              {activeTab === 'velocity-rules' && 'Velocity Rule Engine'}
              {activeTab === 'aml-risk' && 'AML Compliance Risk Ledger'}
              {activeTab === 'behavior-analytics' && 'Behavioral Radar'}
              {activeTab === 'watchlists' && 'Security Watchlists'}
            </span>
          </div>
        );
      case 'treasury-dashboard':
      case 'treasury-liquidity':
      case 'treasury-settlements':
      case 'treasury-reconciliation':
      case 'treasury-revenue':
      case 'treasury-fees':
      case 'treasury-reserve-accounts':
      case 'treasury-bank-accounts':
      case 'treasury-accounting':
      case 'treasury-financial-reports':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <span className="text-slate-450 text-slate-400">Finance</span>
            <span className="text-slate-300">/</span>
            <span>
              {activeTab === 'treasury-dashboard' && 'Treasury Dashboard'}
              {activeTab === 'treasury-liquidity' && 'Liquidity'}
              {activeTab === 'treasury-settlements' && 'Settlements Queue'}
              {activeTab === 'treasury-reconciliation' && 'Ledger Reconciliation'}
              {activeTab === 'treasury-revenue' && 'Revenue Analytics'}
              {activeTab === 'treasury-fees' && 'Fee Management'}
              {activeTab === 'treasury-reserve-accounts' && 'Reserve Accounts'}
              {activeTab === 'treasury-bank-accounts' && 'Operational Bank Accounts'}
              {activeTab === 'treasury-accounting' && 'General Ledger Accounting'}
              {activeTab === 'treasury-financial-reports' && 'GAAP Financial Reports'}
            </span>
          </div>
        );
      case 'dev':
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">Developer Console</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">System</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800">WalletPro</span>
          </div>
        );
    }
  };

  // Get first letter of email for user badge
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'A';

  return (
    <header className="h-14 border-b border-slate-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all md:hidden cursor-pointer"
            aria-label="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        {/* Breadcrumb path */}
        {getBreadcrumb()}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-6">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono font-medium text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/40">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeString || '06:38:24'}</span>
          <span className="text-slate-300">|</span>
          <span>UTC-7</span>
        </div>

        {/* Clickable Search */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-3 px-3 py-1.5 bg-slate-100/80 border border-slate-200/40 hover:bg-slate-200/60 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 transition-all text-left w-60 group relative cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span className="flex-1 text-slate-400 select-none">Search operations...</span>
          <div className="flex items-center gap-0.5 text-[9px] text-slate-400 font-mono bg-slate-200/60 px-1 rounded border border-slate-200">
            <Keyboard className="w-2.5 h-2.5" />
            <span>⌘K</span>
          </div>
        </button>

        {/* Notifications */}
        <button className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 border border-slate-200 flex items-center justify-center text-white text-xs font-bold font-mono shadow-inner select-none cursor-pointer" title={userEmail}>
            {userInitial}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-[10px] font-bold text-slate-800 leading-tight">Ops Account</span>
            <span className="text-[9px] font-mono text-slate-400 truncate max-w-[120px]">{userEmail || 'admin@walletpro'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
