import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Clock, Keyboard, Bell, Menu, Sun, Moon, Laptop, Shield, User, 
  LogOut, CheckCircle, HelpCircle, Archive, Eye, Check, Globe, 
  ChevronRight, AlertTriangle, Cpu, Activity, DollarSign, ShieldAlert, X,
  Info, Keyboard as KeyboardIcon, CheckSquare, Settings, BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  onSearchClick: () => void;
  userEmail: string;
  onMenuToggle?: () => void;
  setActiveTab: (tabId: string) => void;
  activeRole: string;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (theme: 'light' | 'dark' | 'system') => void;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function Header({ 
  activeTab, 
  onSearchClick, 
  userEmail, 
  onMenuToggle,
  setActiveTab,
  activeRole,
  notifications,
  setNotifications,
  themePreference,
  setThemePreference,
  onToast
}: HeaderProps) {
  const [timeString, setTimeString] = useState('');
  
  // Header UI States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);
  const [notifFilter, setNotifFilter] = useState<'All' | 'System' | 'Compliance' | 'Fraud' | 'Security' | 'Operations' | 'Payments' | 'Support'>('All');

  // Refs for click outside
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (activeTab === 'profile') {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-400">Settings</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800">My Profile Preferences</span>
        </div>
      );
    }

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
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : 'T';

  // Notifications operations
  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
  const filteredNotifs = notifications.filter(n => {
    if (n.archived) return false;
    if (notifFilter === 'All') return true;
    return n.category.toLowerCase() === notifFilter.toLowerCase();
  });

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onToast('Notifications Marked Read', 'All unread telemetry messages have been cleared.', 'info');
  };

  const handleMarkOneRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleArchiveOne = (id: string, title: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true } : n));
    onToast('Notification Archived', `"${title}" has been archived.`, 'info');
  };

  return (
    <header className="h-14 border-b border-slate-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-20 shrink-0 select-none">
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
            <KeyboardIcon className="w-2.5 h-2.5" />
            <span>⌘K</span>
          </div>
        </button>

        {/* NOTIFICATION POPUP DRAWER (Requirement 3) */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className={`relative p-1.5 rounded-lg transition-all cursor-pointer ${
              isNotifOpen ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[500px]"
              >
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-slate-500" />
                    <span className="font-display font-bold text-xs text-slate-800">Notification Center</span>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Categories filtering bar */}
                <div className="flex gap-1 overflow-x-auto p-2 bg-slate-50/50 border-b border-slate-100 scrollbar-none shrink-0">
                  {['All', 'System', 'Compliance', 'Fraud', 'Security', 'Operations', 'Payments', 'Support'].map((cat: any) => (
                    <button
                      key={cat}
                      onClick={() => setNotifFilter(cat)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 transition-all cursor-pointer ${
                        notifFilter === cat
                          ? 'bg-slate-800 text-white'
                          : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Notifications list wrapper */}
                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 min-h-[250px]">
                  {filteredNotifs.length === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-slate-400 p-4">
                      <Bell className="w-6 h-6 stroke-1 mb-2 opacity-50" />
                      <p className="text-[10px] font-medium">No alerts in this category tab.</p>
                    </div>
                  ) : (
                    filteredNotifs.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleMarkOneRead(notif.id)}
                        className={`p-3.5 transition-all text-left flex gap-3 cursor-pointer ${
                          notif.read ? 'bg-white opacity-80' : 'bg-blue-50/20 hover:bg-blue-50/40'
                        }`}
                      >
                        {/* Priority Dot */}
                        <div className="mt-1.5 shrink-0">
                          <span className={`w-2.5 h-2.5 rounded-full block ${
                            notif.priority === 'High' ? 'bg-red-500' : notif.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                        </div>

                        {/* Content text */}
                        <div className="flex-1 space-y-0.5 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                              {notif.category}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium font-mono shrink-0">{notif.time}</span>
                          </div>
                          <span className={`text-[11px] font-bold text-slate-800 block truncate ${!notif.read && 'text-blue-900'}`}>
                            {notif.title}
                          </span>
                          <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                            {notif.description}
                          </p>
                          
                          {/* Actions buttons */}
                          <div className="pt-1.5 flex gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedNotif(notif)}
                              className="text-[9px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleArchiveOne(notif.id, notif.title)}
                              className="text-[9px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-0.5 cursor-pointer"
                            >
                              <Archive className="w-3 h-3" />
                              Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center shrink-0">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsNotifOpen(false);
                      onToast('Opening Notification Settings', 'Pointed profile to alert preferences rules.', 'info');
                    }}
                    className="text-[9px] font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                  >
                    Configure alerts preferences in My Profile
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AVATAR PROFILE DROPDOWN (Requirement 2) */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 border border-slate-200 flex items-center justify-center text-white text-xs font-bold font-mono shadow-inner select-none transition-transform group-hover:scale-105">
              {userInitial}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-800 leading-tight group-hover:text-slate-900">Tilok Mania</span>
              <span className="text-[9px] font-mono text-slate-400 truncate max-w-[120px]">{userEmail || 'tilok.mania@gmail.com'}</span>
            </div>
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col divide-y divide-slate-100"
              >
                {/* Header Profile Details */}
                <div className="p-4 bg-slate-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 border border-slate-200 flex items-center justify-center text-white text-sm font-bold font-mono">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">Tilok Mania</span>
                    <span className="text-[9px] font-mono text-slate-400 truncate block">{userEmail}</span>
                    <div className="flex gap-1.5 items-center mt-1">
                      <span className="text-[8px] bg-blue-100 text-blue-700 font-bold uppercase px-1.5 py-0.2 rounded-full truncate max-w-[100px]" title={activeRole}>
                        {activeRole}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono">Compliance</span>
                    </div>
                  </div>
                </div>

                {/* Stats / Audit metadata */}
                <div className="px-4 py-2 bg-slate-100/50 text-[9px] font-mono text-slate-400 flex justify-between items-center">
                  <span>Last Login: Today, 06:01 AM</span>
                  <span className="text-slate-300">|</span>
                  <span>IP: 82.165.91.12</span>
                </div>

                {/* Sub links */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile settings</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Sun className="w-3.5 h-3.5 text-slate-400" />
                      <span>Appearance</span>
                    </div>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
                      {(['light', 'dark', 'system'] as any[]).map(mode => (
                        <button
                          key={mode}
                          onClick={() => {
                            setThemePreference(mode);
                            onToast('Theme Set', `Selected ${mode} view mode.`, 'success');
                          }}
                          className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold transition-all cursor-pointer ${
                            themePreference === mode
                              ? 'bg-white text-slate-800 shadow-xs'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {mode === 'system' ? 'sys' : mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <BellRing className="w-3.5 h-3.5 text-slate-400" />
                      <span>Alert Configurations</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('sec-audit');
                      setIsProfileOpen(false);
                      onToast('Opening Activity Log', 'Pointed workspace context to audit histories logs.', 'info');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      <span>Immutable Activity Log</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      const win = window as any;
                      if (win.showCommandPalette) {
                        win.showCommandPalette();
                      } else {
                        onToast('Shortcuts Helper', 'Press ⌘K or Ctrl+K to open Command Search from any workspace panel.', 'info');
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <KeyboardIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Keyboard Shortcuts</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">⌘K</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onToast('Help Center Pop', 'Enterprise documentation centers can be reached on internal slack channel: #walletpro-wiki.', 'info');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Interactive Help Center</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>

                {/* Logout / De-authenticate action */}
                <div className="p-1.5 bg-slate-50/50">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onToast('Session De-authenticated', 'Cryptographic compliance session revoked cleanly. Refreshing interface.', 'warning');
                      setTimeout(() => {
                        localStorage.setItem('walletpro_active_role', 'Read Only Analyst');
                        window.location.reload();
                      }, 1000);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Terminate Secure Session</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NOTIFICATION DETAIL MODAL */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded">
                    {selectedNotif.category}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    selectedNotif.priority === 'High' ? 'bg-red-500' : selectedNotif.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-xs font-bold text-slate-700">Priority: {selectedNotif.priority}</span>
                </div>
                <button 
                  onClick={() => setSelectedNotif(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-slate-950 block">{selectedNotif.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-medium block">Timestamp: {selectedNotif.time}</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl">
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {selectedNotif.description}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 flex items-start gap-2.5 text-[10px] text-blue-700 font-semibold leading-normal">
                  <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                  <span>
                    Compliance and security guidelines mandate that any velocity warnings or account flags undergo comprehensive annual audits before clearance signoff.
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-right flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 bg-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  Close View
                </button>
                <button
                  onClick={() => {
                    handleArchiveOne(selectedNotif.id, selectedNotif.title);
                    setSelectedNotif(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-all"
                >
                  Archive Alert
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
