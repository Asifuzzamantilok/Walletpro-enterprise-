import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle, ShieldAlert, Coins, CreditCard, ArrowUpRight, ArrowDownRight, 
  TrendingUp, Activity, Clock, Plus, X, Filter, Sparkles, Database, Server, Cpu, 
  Mail, Settings, ShieldCheck, Terminal, FileText, Check, DollarSign, BarChart3, 
  HelpCircle, Info, AlertTriangle, Calendar, ChevronRight, Download, LayoutDashboard, 
  ArrowRightLeft, Landmark, Share2, Copy, PlusCircle, Search, Play, ClipboardList,
  Eye, Save, Trash2, ListFilter, SlidersHorizontal, BarChart4, PieChart as PieIcon, LineChart as LineIcon,
  FileSpreadsheet
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// --- TS Type Definitions ---
interface GlobalFilters {
  dateRange: string;
  country: string;
  currency: string;
  product: string;
  department: string;
  riskLevel: string;
  customerSegment: string;
}

interface KPICard {
  id: string;
  name: string;
  value: string;
  numberVal: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'stable';
  comparison: string;
  category: string;
  icon: React.ComponentType<any>;
}

interface CustomReport {
  id: string;
  name: string;
  dataSource: string;
  fields: string[];
  filters: string;
  groupBy: string;
  aggregate: string;
  sortBy: string;
  createdTime: string;
  owner: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  recipients: string;
  format: string;
  lastRun: string;
  status: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  ip: string;
}

// --- Role Permission Mapping ---
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Super Administrator': [
    'bi-executive-dashboard', 'bi-operational-analytics', 'bi-revenue-analytics', 
    'bi-customer-analytics', 'bi-transaction-analytics', 'bi-wallet-analytics', 
    'bi-card-analytics', 'bi-compliance-analytics', 'bi-fraud-analytics', 
    'bi-support-analytics', 'bi-treasury-analytics', 'bi-custom-reports', 'bi-scheduled-reports'
  ],
  'CEO': [
    'bi-executive-dashboard', 'bi-operational-analytics', 'bi-revenue-analytics', 
    'bi-customer-analytics', 'bi-transaction-analytics', 'bi-wallet-analytics', 
    'bi-card-analytics', 'bi-compliance-analytics', 'bi-fraud-analytics', 
    'bi-support-analytics', 'bi-treasury-analytics', 'bi-custom-reports', 'bi-scheduled-reports'
  ],
  'Executive Team': [
    'bi-executive-dashboard', 'bi-operational-analytics', 'bi-revenue-analytics', 
    'bi-customer-analytics', 'bi-transaction-analytics', 'bi-wallet-analytics', 
    'bi-card-analytics', 'bi-compliance-analytics', 'bi-fraud-analytics', 
    'bi-support-analytics', 'bi-treasury-analytics', 'bi-custom-reports', 'bi-scheduled-reports'
  ],
  'Operations Manager': [
    'bi-executive-dashboard', 'bi-operational-analytics', 'bi-customer-analytics', 
    'bi-transaction-analytics', 'bi-wallet-analytics', 'bi-card-analytics', 
    'bi-support-analytics', 'bi-custom-reports', 'bi-scheduled-reports'
  ],
  'Finance Manager': [
    'bi-executive-dashboard', 'bi-revenue-analytics', 'bi-treasury-analytics', 
    'bi-wallet-analytics', 'bi-card-analytics', 'bi-custom-reports', 'bi-scheduled-reports'
  ],
  'Compliance Manager': [
    'bi-executive-dashboard', 'bi-customer-analytics', 'bi-compliance-analytics', 
    'bi-custom-reports', 'bi-scheduled-reports'
  ],
  'Fraud Manager': [
    'bi-executive-dashboard', 'bi-transaction-analytics', 'bi-fraud-analytics', 
    'bi-custom-reports', 'bi-scheduled-reports'
  ],
  'Support Manager': [
    'bi-executive-dashboard', 'bi-support-analytics', 'bi-customer-analytics', 
    'bi-custom-reports', 'bi-scheduled-reports'
  ],
  'Compliance Officer': [
    'bi-executive-dashboard', 'bi-customer-analytics', 'bi-compliance-analytics', 'bi-custom-reports'
  ],
  'Developer': [
    'bi-executive-dashboard', 'bi-operational-analytics', 'bi-custom-reports'
  ],
  'Operations Agent': [
    'bi-executive-dashboard', 'bi-customer-analytics', 'bi-support-analytics'
  ]
};

// --- Mock Data Generators ---
const SEED_CUSTOM_REPORTS: CustomReport[] = [
  { id: 'REP-001', name: 'High-Value Card Spend Analysis', dataSource: 'Card Transactions', fields: ['Card ID', 'Amount', 'Merchant Name', 'Status', 'Timestamp'], filters: 'Amount > 1000', groupBy: 'Merchant Category', aggregate: 'Sum (Amount)', sortBy: 'Timestamp DESC', createdTime: '2026-07-01 10:24', owner: 'tilok.mania@gmail.com' },
  { id: 'REP-002', name: 'Compliance KYC Bottlenecks', dataSource: 'KYC Submissions', fields: ['Reviewer ID', 'Status', 'Duration (min)', 'Country'], filters: 'Status = Rejected', groupBy: 'Country', aggregate: 'Count (Submissions)', sortBy: 'Duration DESC', createdTime: '2026-07-03 14:15', owner: 'tilok.mania@gmail.com' },
  { id: 'REP-003', name: 'Weekly Revenue by Product Pool', dataSource: 'Ledger Fees', fields: ['Product SKU', 'Gross Margin', 'Client Tier', 'Currency'], filters: 'Currency = USD', groupBy: 'Product SKU', aggregate: 'Sum (Gross Margin)', sortBy: 'Gross Margin DESC', createdTime: '2026-07-05 08:32', owner: 'tilok.mania@gmail.com' }
];

const SEED_SCHEDULED_REPORTS: ScheduledReport[] = [
  { id: 'SCH-001', name: 'Daily CFO Ledger & Balance Reconciliation', frequency: 'Daily', recipients: 'cfo-team@walletpro.com', format: 'Excel', lastRun: '2026-07-09 23:59', status: 'Active' },
  { id: 'SCH-002', name: 'Weekly Executive Operational Performance Hub', frequency: 'Weekly', recipients: 'executive-team@walletpro.com', format: 'PDF', lastRun: '2026-07-06 06:00', status: 'Active' },
  { id: 'SCH-003', name: 'Monthly Regulatory AML Compliance Filing', frequency: 'Monthly', recipients: 'compliance-audit@walletpro.com', format: 'CSV', lastRun: '2026-07-01 00:05', status: 'Active' }
];

const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'AUD-9021', timestamp: '2026-07-10 00:15:32', user: 'tilok.mania@gmail.com', role: 'CEO', action: 'EXPORT_REPORT', details: 'Exported Executive Dashboard Summary to PDF format. Filters: country=all, period=30d', ip: '102.164.88.10' },
  { id: 'AUD-8910', timestamp: '2026-07-09 22:42:19', user: 'finance-lead@walletpro.com', role: 'Finance Manager', action: 'CREATE_CUSTOM_REPORT', details: 'Created custom report "Q3 Settled Volumes Projections"', ip: '102.164.88.11' },
  { id: 'AUD-8804', timestamp: '2026-07-09 18:14:02', user: 'compliance-dir@walletpro.com', role: 'Compliance Manager', action: 'SAVE_VIEW', details: 'Saved compliance SLA audit bookmark as default view', ip: '102.164.88.15' }
];

export function BusinessIntelligenceCenter({ 
  activeSubTab, 
  onToast, 
  onSelectTab 
}: { 
  activeSubTab: string; 
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info' | 'error') => void;
  onSelectTab: (tab: string) => void;
}) {
  // Global Filters State
  const [filters, setFilters] = useState<GlobalFilters>({
    dateRange: '30D',
    country: 'All',
    currency: 'All',
    product: 'All',
    department: 'All',
    riskLevel: 'All',
    customerSegment: 'All'
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(['bi-executive-dashboard', 'bi-custom-reports']);
  const [activeRole, setActiveRole] = useState<string>('Super Administrator');

  // Load active role from localStorage
  useEffect(() => {
    const role = localStorage.getItem('walletpro_active_role') || 'Super Administrator';
    setActiveRole(role);
  }, []);

  // Sync role updates automatically when user changes it in the layout
  useEffect(() => {
    const handleRoleChangedEvent = () => {
      const role = localStorage.getItem('walletpro_active_role') || 'Super Administrator';
      setActiveRole(role);
    };
    window.addEventListener('storage', handleRoleChangedEvent);
    // Periodically poll role to guarantee sync
    const interval = setInterval(handleRoleChangedEvent, 1000);
    return () => {
      window.removeEventListener('storage', handleRoleChangedEvent);
      clearInterval(interval);
    };
  }, []);

  // Trigger slight loading simulation when filters change to signify data calculation
  const handleFilterChange = (key: keyof GlobalFilters, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  // Custom Report state
  const [customReports, setCustomReports] = useState<CustomReport[]>(() => {
    const saved = localStorage.getItem('walletpro_bi_custom_reports');
    return saved ? JSON.parse(saved) : SEED_CUSTOM_REPORTS;
  });

  // Scheduled Report state
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(() => {
    const saved = localStorage.getItem('walletpro_bi_scheduled_reports');
    return saved ? JSON.parse(saved) : SEED_SCHEDULED_REPORTS;
  });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('walletpro_bi_audit_logs');
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  const saveReportsToStorage = (updated: CustomReport[]) => {
    setCustomReports(updated);
    localStorage.setItem('walletpro_bi_custom_reports', JSON.stringify(updated));
  };

  const saveSchedulesToStorage = (updated: ScheduledReport[]) => {
    setScheduledReports(updated);
    localStorage.setItem('walletpro_bi_scheduled_reports', JSON.stringify(updated));
  };

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'tilok.mania@gmail.com',
      role: activeRole,
      action,
      details,
      ip: '102.164.88.10'
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('walletpro_bi_audit_logs', JSON.stringify(updated));
  };

  const isTabAuthorized = (tabId: string) => {
    const allowed = ROLE_PERMISSIONS[activeRole] || [];
    return allowed.includes(tabId);
  };

  // KPI Dynamic multipliers based on filters
  const multipliers = useMemo(() => {
    let countryMult = 1.0;
    if (filters.country === 'US') countryMult = 0.42;
    else if (filters.country === 'GB') countryMult = 0.18;
    else if (filters.country === 'DE') countryMult = 0.14;
    else if (filters.country === 'SG') countryMult = 0.10;
    else if (filters.country === 'BR') countryMult = 0.08;

    let segmentMult = 1.0;
    if (filters.customerSegment === 'Retail') segmentMult = 0.70;
    else if (filters.customerSegment === 'SMB') segmentMult = 0.20;
    else if (filters.customerSegment === 'Enterprise') segmentMult = 0.08;
    else if (filters.customerSegment === 'VIP') segmentMult = 0.02;

    let periodMult = 1.0;
    if (filters.dateRange === 'Today') periodMult = 0.03;
    else if (filters.dateRange === '7D') periodMult = 0.23;
    else if (filters.dateRange === '30D') periodMult = 1.0;
    else if (filters.dateRange === '90D') periodMult = 2.9;
    else if (filters.dateRange === '1Y') periodMult = 11.4;

    return {
      total: countryMult * segmentMult,
      periodic: countryMult * segmentMult * periodMult
    };
  }, [filters]);

  // KPI Values calculated on multipliers
  const kpis: KPICard[] = useMemo(() => [
    { id: 'kpi-total-cust', name: 'Total Customers', value: Math.round(1420891 * multipliers.total).toLocaleString(), numberVal: Math.round(1420891 * multipliers.total), trend: 14.2, trendDirection: 'up', comparison: 'vs last period', category: 'customers', icon: Users },
    { id: 'kpi-active-cust', name: 'Active Customers', value: Math.round(1180240 * multipliers.total).toLocaleString(), numberVal: Math.round(1180240 * multipliers.total), trend: 12.8, trendDirection: 'up', comparison: 'vs last period', category: 'customers', icon: Users },
    { id: 'kpi-new-cust', name: 'New Customers', value: `+${Math.round(24502 * multipliers.periodic).toLocaleString()}`, numberVal: Math.round(24502 * multipliers.periodic), trend: 8.5, trendDirection: 'up', comparison: 'vs last period', category: 'customers', icon: Users },
    { id: 'kpi-total-wallets', name: 'Total Wallets', value: Math.round(1842501 * multipliers.total).toLocaleString(), numberVal: Math.round(1842501 * multipliers.total), trend: 15.6, trendDirection: 'up', comparison: 'vs last period', category: 'wallets', icon: Coins },
    { id: 'kpi-active-wallets', name: 'Active Wallets', value: Math.round(1510402 * multipliers.total).toLocaleString(), numberVal: Math.round(1510402 * multipliers.total), trend: 11.9, trendDirection: 'up', comparison: 'vs last period', category: 'wallets', icon: Coins },
    { id: 'kpi-cards-issued', name: 'Cards Issued', value: Math.round(340912 * multipliers.total).toLocaleString(), numberVal: Math.round(340912 * multipliers.total), trend: 19.3, trendDirection: 'up', comparison: 'vs last period', category: 'wallets', icon: CreditCard },
    { id: 'kpi-daily-tx', name: 'Daily Transactions', value: Math.round(182490 * multipliers.total).toLocaleString(), numberVal: Math.round(182490 * multipliers.total), trend: 6.2, trendDirection: 'up', comparison: 'vs yesterday', category: 'operations', icon: Activity },
    { id: 'kpi-monthly-tx', name: 'Monthly Transactions', value: Math.round(5291048 * multipliers.periodic).toLocaleString(), numberVal: Math.round(5291048 * multipliers.periodic), trend: 10.4, trendDirection: 'up', comparison: 'vs last period', category: 'operations', icon: Activity },
    { id: 'kpi-tx-success', name: 'Transaction Success Rate', value: '99.82%', numberVal: 99.82, trend: 0.04, trendDirection: 'up', comparison: 'vs last period', category: 'operations', icon: CheckCircle },
    { id: 'kpi-failed-tx', name: 'Failed Transactions', value: '0.18%', numberVal: 0.18, trend: -3.2, trendDirection: 'down', comparison: 'vs last period', category: 'operations', icon: AlertTriangle },
    { id: 'kpi-chargebacks', name: 'Chargebacks', value: '0.04%', numberVal: 0.04, trend: -12.4, trendDirection: 'down', comparison: 'vs last period', category: 'operations', icon: ShieldAlert },
    { id: 'kpi-rev-today', name: 'Revenue Today', value: `$${Math.round(142091 * multipliers.total).toLocaleString()}`, numberVal: Math.round(142091 * multipliers.total), trend: 11.5, trendDirection: 'up', comparison: 'vs yesterday', category: 'financial', icon: DollarSign },
    { id: 'kpi-rev-month', name: 'Revenue This Month', value: `$${Math.round(4291500 * multipliers.periodic).toLocaleString()}`, numberVal: Math.round(4291500 * multipliers.periodic), trend: 18.2, trendDirection: 'up', comparison: 'vs last month', category: 'financial', icon: DollarSign },
    { id: 'kpi-fees', name: 'Platform Fees', value: `$${Math.round(241800 * multipliers.periodic).toLocaleString()}`, numberVal: Math.round(241800 * multipliers.periodic), trend: 15.1, trendDirection: 'up', comparison: 'vs last month', category: 'financial', icon: TrendingUp },
    { id: 'kpi-net-rev', name: 'Net Revenue', value: `$${Math.round(4049700 * multipliers.periodic).toLocaleString()}`, numberVal: Math.round(4049700 * multipliers.periodic), trend: 18.4, trendDirection: 'up', comparison: 'vs last period', category: 'financial', icon: DollarSign },
    { id: 'kpi-settlements', name: 'Settlement Volume', value: `$${Math.round(24192000 * multipliers.periodic).toLocaleString()}`, numberVal: Math.round(24192000 * multipliers.periodic), trend: 21.0, trendDirection: 'up', comparison: 'vs last period', category: 'financial', icon: Landmark },
    { id: 'kpi-reserve', name: 'Reserve Balance', value: `$${(12500000).toLocaleString()}`, numberVal: 12500000, trend: 2.1, trendDirection: 'up', comparison: 'vs last week', category: 'financial', icon: ShieldCheck },
    { id: 'kpi-kyc', name: 'Pending KYC', value: Math.max(1, Math.round(124 * multipliers.total)).toString(), numberVal: Math.max(1, Math.round(124 * multipliers.total)), trend: -14.5, trendDirection: 'down', comparison: 'vs last week', category: 'operations', icon: Clock },
    { id: 'kpi-fraud', name: 'Fraud Alerts', value: Math.max(0, Math.round(8 * multipliers.total)).toString(), numberVal: Math.max(0, Math.round(8 * multipliers.total)), trend: -20.0, trendDirection: 'down', comparison: 'vs yesterday', category: 'operations', icon: ShieldAlert },
    { id: 'kpi-tickets', name: 'Open Support Tickets', value: Math.max(1, Math.round(43 * multipliers.total)).toString(), numberVal: Math.max(1, Math.round(43 * multipliers.total)), trend: 5.4, trendDirection: 'up', comparison: 'vs last period', category: 'operations', icon: Mail },
    { id: 'kpi-uptime', name: 'Platform Availability', value: '99.999%', numberVal: 99.999, trend: 0.001, trendDirection: 'stable', comparison: 'vs last period', category: 'operations', icon: Cpu }
  ], [multipliers, activeRole]);

  // Export functions (CSV, PDF, Excel)
  const handleExport = (format: 'CSV' | 'Excel' | 'PDF' | 'Print') => {
    addAuditLog('EXPORT_REPORT', `Generated and downloaded report in ${format} format for sub-tab: "${activeSubTab}" with global filters applied.`);
    onToast(
      'Export Initiated', 
      `Successfully compiled and downloaded ${format} file for ${activeSubTab} analytics.`, 
      'success'
    );
  };

  const toggleFavorite = (tabId: string) => {
    const updated = favorites.includes(tabId)
      ? favorites.filter(id => id !== tabId)
      : [...favorites, tabId];
    setFavorites(updated);
    onToast(
      updated.includes(tabId) ? 'Added to Bookmarks' : 'Removed Bookmark',
      `Modified dashboard quick-access favorites list.`,
      'info'
    );
  };

  // Filter list of KPIs displayed in Executive Section depending on active filter or subtab
  const filteredKpis = useMemo(() => {
    return kpis;
  }, [kpis]);

  if (!isTabAuthorized(activeSubTab)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center h-[500px]">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Permission Restrained</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-md">
          Your active role <strong className="text-slate-700 font-mono">({activeRole})</strong> is not authorized to access the requested reporting module: 
          <span className="text-blue-600 ml-1 font-semibold">{activeSubTab}</span>.
        </p>
        <p className="text-[11px] text-slate-400 mt-1">Please use the sidebar's role dropdown to toggle administrative permissions.</p>
        <button 
          onClick={() => onSelectTab('bi-executive-dashboard')}
          className="mt-6 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-all"
        >
          Return to Executive Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Visual Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
              Enterprise Analytics Suite
            </span>
            <button 
              onClick={() => toggleFavorite(activeSubTab)}
              className="p-1 hover:bg-slate-100 rounded text-amber-500 transition-colors"
              title="Bookmark view"
            >
              <Sparkles className={`w-4 h-4 ${favorites.includes(activeSubTab) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
            </button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 font-display mt-1">
            {activeSubTab === 'bi-executive-dashboard' && 'Executive BI Dashboard'}
            {activeSubTab === 'bi-operational-analytics' && 'Operational Infrastructure Analytics'}
            {activeSubTab === 'bi-revenue-analytics' && 'Revenue & Fees Analytics'}
            {activeSubTab === 'bi-customer-analytics' && 'Customer Onboarding & Growth Analytics'}
            {activeSubTab === 'bi-transaction-analytics' && 'Transaction Success & Processing Analytics'}
            {activeSubTab === 'bi-wallet-analytics' && 'Wallet Flows & Balance Analytics'}
            {activeSubTab === 'bi-card-analytics' && 'Enterprise Card Spend Analytics'}
            {activeSubTab === 'bi-compliance-analytics' && 'Compliance & KYC SLA Analytics'}
            {activeSubTab === 'bi-fraud-analytics' && 'Risk & Fraud Shield Analytics'}
            {activeSubTab === 'bi-support-analytics' && 'Support SLA & CSAT Analytics'}
            {activeSubTab === 'bi-treasury-analytics' && 'Treasury Pool & Settlement Analytics'}
            {activeSubTab === 'bi-custom-reports' && 'Custom Business Intelligence Report Builder'}
            {activeSubTab === 'bi-scheduled-reports' && 'Scheduled Auto-Delivery Center'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-dimensional executive ledger reporting. Active Auditor role: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-700">{activeRole}</span>
          </p>
        </div>

        {/* Global Export Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 mr-1 font-mono">EXPORTS:</span>
          <button 
            onClick={() => handleExport('CSV')}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button 
            onClick={() => handleExport('Excel')}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button 
            onClick={() => handleExport('PDF')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* GLOBAL BI FILTERS PANEL */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 pointer-events-none opacity-5">
          <SlidersHorizontal className="w-32 h-32" />
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-xs text-slate-700 font-display">Global Dimensions & Segment Filters</h3>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="text-[10px] text-blue-500 font-mono animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" /> Calculating cross-filters...
              </span>
            )}
            <button 
              onClick={() => {
                setFilters({
                  dateRange: '30D',
                  country: 'All',
                  currency: 'All',
                  product: 'All',
                  department: 'All',
                  riskLevel: 'All',
                  customerSegment: 'All'
                });
                onToast('Filters Cleared', 'Reset cross-filtering dimensions to defaults.', 'info');
              }}
              className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Period */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Period</label>
            <select 
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-blue-500"
            >
              <option value="Today">Today</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
              <option value="1Y">Last Fiscal Year</option>
            </select>
          </div>

          {/* Country */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Country</label>
            <select 
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2"
            >
              <option value="All">All Countries</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="SG">Singapore</option>
              <option value="BR">Brazil</option>
            </select>
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Currency</label>
            <select 
              value={filters.currency}
              onChange={(e) => handleFilterChange('currency', e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2"
            >
              <option value="All">All Currencies</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="SGD">SGD (S$)</option>
              <option value="BRL">BRL (R$)</option>
            </select>
          </div>

          {/* Product Pool */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Product Line</label>
            <select 
              value={filters.product}
              onChange={(e) => handleFilterChange('product', e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2"
            >
              <option value="All">All Product Pools</option>
              <option value="Ledger">Core Ledger Engine</option>
              <option value="Cards">Card Issuing Hub</option>
              <option value="Treasury">Treasury Liquidity</option>
              <option value="Gateways">Merchant Gateways</option>
            </select>
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Department</label>
            <select 
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2"
            >
              <option value="All">All Departments</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="Risk">Risk Center</option>
              <option value="Compliance">Compliance</option>
              <option value="Support">Customer Support</option>
            </select>
          </div>

          {/* Risk Level */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Risk SLA Tier</label>
            <select 
              value={filters.riskLevel}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2"
            >
              <option value="All">All Risk Profiles</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
              <option value="Critical">Critical Threats</option>
            </select>
          </div>

          {/* Customer Segment */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">User Tier Segment</label>
            <select 
              value={filters.customerSegment}
              onChange={(e) => handleFilterChange('customerSegment', e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2"
            >
              <option value="All">All Client Tiers</option>
              <option value="Retail">Retail Accounts</option>
              <option value="SMB">SMB Merchants</option>
              <option value="Enterprise">Enterprise Corpos</option>
              <option value="VIP">VIP / Ultra-High Wealth</option>
            </select>
          </div>
        </div>
      </div>

      {/* EXECUTIVE KPI CARD SCROLLABLE DECK */}
      {activeSubTab === 'bi-executive-dashboard' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Executive Core Key Performance Indicators (KPIs)</h4>
            <span className="text-[10px] font-mono text-blue-500 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
              Showing {filteredKpis.length} real-time dimensions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredKpis.slice(0, 8).map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div 
                  key={kpi.id} 
                  className="bg-white border border-slate-200/80 rounded-xl p-5 hover:shadow-md transition-all group hover:border-slate-300 relative overflow-hidden cursor-pointer"
                  onClick={() => {
                    addAuditLog('KPI_DRILLDOWN', `Drilled down into metric "${kpi.name}" resulting in active detailed calculation.`);
                    onToast('Drill-down Triggered', `Displaying deep transactional records contributing to: ${kpi.name}.`, 'info');
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-slate-500">{kpi.name}</span>
                    <div className="p-2 bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-500 rounded-lg transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-2 flex items-baseline gap-2">
                    {isLoading ? (
                      <div className="h-7 w-28 bg-slate-100 rounded animate-pulse" />
                    ) : (
                      <span className="text-xl font-bold text-slate-800 font-mono tracking-tight">{kpi.value}</span>
                    )}
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                      kpi.trendDirection === 'up' ? 'text-emerald-700 bg-emerald-50' : 
                      kpi.trendDirection === 'down' ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-50'
                    }`}>
                      {kpi.trendDirection === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(kpi.trend)}%
                    </span>
                  </div>

                  <div className="mt-1 text-[9px] text-slate-400 font-medium">
                    {kpi.comparison}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRIMARY ACTIVE TAB DISPLAY */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* EXECUTIVE DASHBOARD VIEW */}
          {activeSubTab === 'bi-executive-dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart 1: Revenue vs Settlements (Span 8) */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">C-Suite Platform Performance Forecast</h3>
                    <p className="text-[10px] text-slate-400">Total gross settlements mapped against aggregate operational platform billing fees.</p>
                  </div>
                  <div className="flex gap-2 text-[10px] font-mono">
                    <span className="flex items-center gap-1 font-bold text-slate-500">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" /> Gross Volume
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-500">
                      <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm" /> Net Margin
                    </span>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { day: 'Jul 04', volume: 1420000 * multipliers.periodic, fees: 89000 * multipliers.periodic },
                      { day: 'Jul 05', volume: 1590000 * multipliers.periodic, fees: 94000 * multipliers.periodic },
                      { day: 'Jul 06', volume: 1480000 * multipliers.periodic, fees: 88000 * multipliers.periodic },
                      { day: 'Jul 07', volume: 1820000 * multipliers.periodic, fees: 112000 * multipliers.periodic },
                      { day: 'Jul 08', volume: 2100000 * multipliers.periodic, fees: 134000 * multipliers.periodic },
                      { day: 'Jul 09', volume: 2419200 * multipliers.periodic, fees: 241800 * multipliers.periodic },
                      { day: 'Jul 10', volume: 2280000 * multipliers.periodic, fees: 220000 * multipliers.periodic }
                    ]}>
                      <defs>
                        <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`]} />
                      <Area type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#volGrad)" name="Gross Settlement" />
                      <Line type="monotone" dataKey="fees" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} name="Accrued Fees" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Regional Performance (Span 4) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">Global Market Density</h3>
                <p className="text-[10px] text-slate-400 mb-4">Onboarding density sorted by authorized international operating licenses.</p>
                <div className="h-60 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'North America', value: 45 },
                          { name: 'Europe (EEA)', value: 25 },
                          { name: 'APAC & Singapore', value: 15 },
                          { name: 'Latin America', value: 10 },
                          { name: 'Middle East (UAE)', value: 5 }
                        ]}
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {[
                          { name: 'NA', color: '#2563eb' },
                          { name: 'EU', color: '#4f46e5' },
                          { name: 'APAC', color: '#0d9488' },
                          { name: 'LATAM', color: '#d97706' },
                          { name: 'ME', color: '#7c3aed' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-[10px] flex items-center gap-1 text-slate-500 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> NA: 45%
                  </div>
                  <div className="text-[10px] flex items-center gap-1 text-slate-500 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> EU: 25%
                  </div>
                  <div className="text-[10px] flex items-center gap-1 text-slate-500 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" /> APAC: 15%
                  </div>
                  <div className="text-[10px] flex items-center gap-1 text-slate-500 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-600" /> LATAM: 10%
                  </div>
                </div>
              </div>

              {/* Row 2: Customer vs Wallet Growth & Ledger Product Split */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">Customer & Account Velocity</h3>
                <p className="text-[10px] text-slate-400 mb-4">Total registered customer entries charted against live digital asset wallets.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Feb', users: 1100000 * multipliers.total, wallets: 1400000 * multipliers.total },
                      { month: 'Mar', users: 1180000 * multipliers.total, wallets: 1480000 * multipliers.total },
                      { month: 'Apr', users: 1250000 * multipliers.total, wallets: 1560000 * multipliers.total },
                      { month: 'May', users: 1310000 * multipliers.total, wallets: 1690000 * multipliers.total },
                      { month: 'Jun', users: 1380000 * multipliers.total, wallets: 1780000 * multipliers.total },
                      { month: 'Jul', users: 1420891 * multipliers.total, wallets: 1842501 * multipliers.total }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                      <Tooltip formatter={(value) => [Number(value).toLocaleString()]} />
                      <Line type="monotone" dataKey="users" stroke="#0d9488" strokeWidth={2} name="Verified Customers" />
                      <Line type="monotone" dataKey="wallets" stroke="#d97706" strokeWidth={2} name="Issued Wallets" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Product Splitting Revenue Bar chart */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">Fee Income by Ledger Product</h3>
                <p className="text-[10px] text-slate-400 mb-4">Breakdown of gross billing streams processed by product segment groups.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { product: 'Ledger Engine', revenue: 95000 * multipliers.periodic },
                      { product: 'Card Issuing', revenue: 64000 * multipliers.periodic },
                      { product: 'Treasury Pools', revenue: 42000 * multipliers.periodic },
                      { product: 'Gateways', revenue: 38000 * multipliers.periodic }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="product" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                      <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`]} />
                      <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#4f46e5" />
                        <Cell fill="#0d9488" />
                        <Cell fill="#d97706" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* OPERATIONAL ANALYTICS */}
          {activeSubTab === 'bi-operational-analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">API Node Infrastructure & Node Availability</h3>
                <p className="text-xs text-slate-400 mb-4">Historical 24-hour trace representing system response times and API uptime SLA.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Average API Latency</span>
                    <div className="text-xl font-bold font-mono text-slate-800 mt-1">42.8 ms</div>
                    <span className="text-[9px] text-emerald-600 font-semibold">99.98% target compliant</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Memory Allocation</span>
                    <div className="text-xl font-bold font-mono text-slate-800 mt-1">12.4 GB / 32 GB</div>
                    <span className="text-[9px] text-slate-400">Stable cluster footprint</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Active Threads</span>
                    <div className="text-xl font-bold font-mono text-slate-800 mt-1">14,290 / sec</div>
                    <span className="text-[9px] text-blue-600 font-semibold">Dynamic Auto-scale active</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { hr: '00:00', ms: 45 }, { hr: '04:00', ms: 40 }, { hr: '08:00', ms: 52 },
                      { hr: '12:00', ms: 60 }, { hr: '16:00', ms: 48 }, { hr: '20:00', ms: 42 }, { hr: '24:00', ms: 41 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="hr" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="ms" stroke="#0ea5e9" fill="#e0f2fe" name="Node Latency (ms)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* REVENUE ANALYTICS */}
          {activeSubTab === 'bi-revenue-analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">Direct Billing Fees vs Indirect Product Margins</h3>
                <p className="text-xs text-slate-400 mb-6">Breakdown of gross fee performance aggregated against general payment operations costs.</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { day: 'Jul 04', Interchange: 45000, PlatformFees: 89000, Margin: 35000 },
                      { day: 'Jul 05', Interchange: 48000, PlatformFees: 94000, Margin: 41000 },
                      { day: 'Jul 06', Interchange: 46000, PlatformFees: 88000, Margin: 32000 },
                      { day: 'Jul 07', Interchange: 55000, PlatformFees: 112000, Margin: 48000 },
                      { day: 'Jul 08', Interchange: 62000, PlatformFees: 134000, Margin: 60000 },
                      { day: 'Jul 09', Interchange: 120000, PlatformFees: 241800, Margin: 110000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Interchange" fill="#3b82f6" name="Interchange Fees ($)" stackId="a" />
                      <Bar dataKey="PlatformFees" fill="#10b981" name="Platform Processing ($)" stackId="a" />
                      <Bar dataKey="Margin" fill="#f59e0b" name="Retained Net Margin ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMER ANALYTICS */}
          {activeSubTab === 'bi-customer-analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">User Onboarding Cohorts, Churn, and Growth Metrics</h3>
                <p className="text-xs text-slate-400 mb-4">Visual correlation of verified user retention vs. dormant/inactive balances.</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Retention Rate</span>
                    <span className="text-xl font-bold font-mono text-slate-800">92.4%</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Dormancy Index</span>
                    <span className="text-xl font-bold font-mono text-slate-800">4.1%</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">User Churn Rate</span>
                    <span className="text-xl font-bold font-mono text-slate-800">0.82%</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">KYC Pass Index</span>
                    <span className="text-xl font-bold font-mono text-slate-800">98.92%</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { week: 'W1', signups: 1500, active: 1350, dormant: 150 },
                      { week: 'W2', signups: 1900, active: 1720, dormant: 180 },
                      { week: 'W3', signups: 2200, active: 2010, dormant: 190 },
                      { week: 'W4', signups: 2502, active: 2320, dormant: 182 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="signups" stroke="#4f46e5" strokeWidth={2} name="Weekly Signups" />
                      <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} name="Weekly Active Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTION ANALYTICS */}
          {activeSubTab === 'bi-transaction-analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">Transaction Success Rate & Error Code Analytics</h3>
                <p className="text-xs text-slate-400 mb-6">Historical evaluation of clearing success rates and reason matrices for card transactions.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { hr: '00:00', Success: 99.8, Failed: 0.2 },
                        { hr: '06:00', Success: 99.9, Failed: 0.1 },
                        { hr: '12:00', Success: 99.82, Failed: 0.18 },
                        { hr: '18:00', Success: 99.78, Failed: 0.22 },
                        { hr: '24:00', Success: 99.85, Failed: 0.15 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="hr" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[99.5, 100]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="Success" stroke="#10b981" fill="#ecfdf5" name="Success %" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-600 uppercase">Top Settlement Rejections Reason</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="font-semibold text-slate-700">Insufficient Customer Balances (R-51)</span>
                        <span className="font-mono text-slate-500 font-bold">58% of fails</span>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="font-semibold text-slate-700">3DS Cryptogram Validation Timeout (R-65)</span>
                        <span className="font-mono text-slate-500 font-bold">24% of fails</span>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="font-semibold text-slate-700">Card Status Suspended (R-04)</span>
                        <span className="font-mono text-slate-500 font-bold">12% of fails</span>
                      </div>
                      <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="font-semibold text-slate-700">Cross-Border Compliance Check (AML-09)</span>
                        <span className="font-mono text-slate-500 font-bold">6% of fails</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WALLET ANALYTICS */}
          {activeSubTab === 'bi-wallet-analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">Inflow, Outflow, and Transfer Liquidity Pools</h3>
                <p className="text-xs text-slate-400 mb-4">Consolidated ledger showing aggregate daily wallet funding sources.</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { day: 'Jul 04', BankWire: 400000, CardInflow: 350000, Outflows: -200000 },
                      { day: 'Jul 05', BankWire: 420000, CardInflow: 380000, Outflows: -240000 },
                      { day: 'Jul 06', BankWire: 380000, CardInflow: 320000, Outflows: -180000 },
                      { day: 'Jul 07', BankWire: 520000, CardInflow: 480000, Outflows: -300000 },
                      { day: 'Jul 08', BankWire: 610000, CardInflow: 580000, Outflows: -350000 },
                      { day: 'Jul 09', BankWire: 840000, CardInflow: 780000, Outflows: -520000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="BankWire" fill="#3b82f6" name="Bank Wires (+$)" />
                      <Bar dataKey="CardInflow" fill="#0d9488" name="Card Funding (+$)" />
                      <Bar dataKey="Outflows" fill="#f43f5e" name="Withdrawals (-$)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* CARD ANALYTICS */}
          {activeSubTab === 'bi-card-analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">Corporate Card Issuance & MCC Code Spend Velocity</h3>
                <p className="text-xs text-slate-400 mb-6">Historical trends and category distributions for all physical and virtual cards issued globally.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { mo: 'Mar', Virtual: 180000, Physical: 80000 },
                        { mo: 'Apr', Virtual: 210000, Physical: 85000 },
                        { mo: 'May', Virtual: 250000, Physical: 92000 },
                        { mo: 'Jun', Virtual: 310000, Physical: 98000 },
                        { mo: 'Jul', Virtual: 340912, Physical: 102000 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="mo" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => [Number(value).toLocaleString()]} />
                        <Area type="monotone" dataKey="Virtual" stackId="1" stroke="#3b82f6" fill="#eff6ff" name="Virtual Cards" />
                        <Area type="monotone" dataKey="Physical" stackId="1" stroke="#4f46e5" fill="#e0e7ff" name="Physical Cards" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-3">Merchant Category Code (MCC) Distribution</h4>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span>SaaS & Cloud Computing (MCC-7372)</span>
                          <span>42% ($5.2M)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span>Professional Business Services (MCC-7399)</span>
                          <span>28% ($3.5M)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: '28%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-semibold mb-1">
                          <span>Advertising Services (MCC-7311)</span>
                          <span>18% ($2.2M)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-600 h-full rounded-full" style={{ width: '18%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMPLIANCE ANALYTICS */}
          {activeSubTab === 'bi-compliance-analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">KYC Pipeline SLA & Onboarding Approval Index</h3>
                <p className="text-xs text-slate-400 mb-6">Aggregate evaluation of average KYC manual processing times mapped against regulatory rejections.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">KYC Pass Rate</span>
                    <span className="text-xl font-bold font-mono text-slate-800">92.4%</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Average Review SLA</span>
                    <span className="text-xl font-bold font-mono text-slate-800">4.2 hours</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Manual Audits (Monthly)</span>
                    <span className="text-xl font-bold font-mono text-slate-800">14,290 cases</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { day: 'Jul 04', Pending: 140, Approved: 850, Rejected: 12 },
                      { day: 'Jul 05', Pending: 130, Approved: 920, Rejected: 15 },
                      { day: 'Jul 06', Pending: 124, Approved: 880, Rejected: 8 },
                      { day: 'Jul 07', Pending: 115, Approved: 1040, Rejected: 19 },
                      { day: 'Jul 08', Pending: 120, Approved: 1150, Rejected: 22 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Approved" fill="#10b981" name="KYC Approved" />
                      <Bar dataKey="Rejected" fill="#f43f5e" name="KYC Rejected" />
                      <Bar dataKey="Pending" fill="#f59e0b" name="KYC Awaiting SLA" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* FRAUD ANALYTICS */}
          {activeSubTab === 'bi-fraud-analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">Blocked High-Risk Transfers & False Positive Indices</h3>
                <p className="text-xs text-slate-400 mb-6">Visual tracking of active fraud protection rates, false-positive rules matching, and overall fraud losses saved.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { wk: 'W1', BlockedVolume: 124000, TrueFraud: 110000, FalsePositives: 14000 },
                        { wk: 'W2', BlockedVolume: 148000, TrueFraud: 132000, FalsePositives: 16000 },
                        { wk: 'W3', BlockedVolume: 115000, TrueFraud: 105000, FalsePositives: 10000 },
                        { wk: 'W4', BlockedVolume: 184000, TrueFraud: 172000, FalsePositives: 12000 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="wk" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`]} />
                        <Legend />
                        <Area type="monotone" dataKey="TrueFraud" stroke="#dc2626" fill="#fef2f2" name="True Fraud Blocked ($)" />
                        <Area type="monotone" dataKey="FalsePositives" stroke="#d97706" fill="#fffbeb" name="False Positives ($)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-600 uppercase">Fraud Losses Prevented Summary</h4>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase">Estimated Prevented Fraud</span>
                        <div className="text-2xl font-black font-mono text-emerald-950 mt-1">$1.48M</div>
                        <span className="text-[9px] text-emerald-700">Calculated via rule-matching velocity shields</span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-rose-800 uppercase">Net Settled Fraud Losses</span>
                        <div className="text-2xl font-black font-mono text-rose-950 mt-1">$14,290</div>
                        <span className="text-[9px] text-rose-700">0.003% of total gross volume</span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUPPORT ANALYTICS */}
          {activeSubTab === 'bi-support-analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">Support Resolution Milestones, CSAT, & Leaderboard</h3>
                <p className="text-xs text-slate-400 mb-6">Historical trace mapping aggregate support ticket volume against customer satisfaction scores.</p>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Leaderboard */}
                  <div className="md:col-span-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-600 uppercase">Support Agent SLA Leaderboard</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">1</span>
                          <span className="font-semibold text-slate-700">Sophia Lin</span>
                        </div>
                        <span className="font-mono text-slate-500 font-bold">98.4% SLA | CSAT 4.95</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">2</span>
                          <span className="font-semibold text-slate-700">Marcus Vance</span>
                        </div>
                        <span className="font-mono text-slate-500 font-bold">95.2% SLA | CSAT 4.81</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">3</span>
                          <span className="font-semibold text-slate-700">Elena Rostova</span>
                        </div>
                        <span className="font-mono text-slate-500 font-bold">91.8% SLA | CSAT 4.78</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="md:col-span-7 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { category: 'Lost Card', tickets: 420 },
                        { category: 'Verification', tickets: 280 },
                        { category: 'Limits', tickets: 190 },
                        { category: 'API Keys', tickets: 110 },
                        { category: 'Chargeback', tickets: 45 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="category" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="tickets" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TREASURY ANALYTICS */}
          {activeSubTab === 'bi-treasury-analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">Liquidity Pools, Reserve Accounts adequacy, and Bank Deposits</h3>
                <p className="text-xs text-slate-400 mb-6">Historical ratio representing cash reserves matching active customer liabilities.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { wk: 'W1', AdequacyRatio: 100.8 },
                        { wk: 'W2', AdequacyRatio: 101.4 },
                        { wk: 'W3', AdequacyRatio: 100.9 },
                        { wk: 'W4', AdequacyRatio: 102.5 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="wk" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[98, 105]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="AdequacyRatio" stroke="#0ea5e9" strokeWidth={3} name="Reserve Adequacy Ratio (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 text-xs">
                    <h4 className="text-xs font-bold text-slate-600 uppercase">Active Bank Account Allocations</h4>
                    <div className="flex justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div>
                        <span className="font-bold block text-slate-700">JPMorgan Chase Operational</span>
                        <span className="text-[10px] text-slate-400 font-mono">Account ending in *8920</span>
                      </div>
                      <span className="font-mono text-slate-800 font-black">$5,241,800</span>
                    </div>

                    <div className="flex justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div>
                        <span className="font-bold block text-slate-700">Barclays Settlement Escrow</span>
                        <span className="text-[10px] text-slate-400 font-mono">Account ending in *4011</span>
                      </div>
                      <span className="font-mono text-slate-800 font-black">$4,810,400</span>
                    </div>

                    <div className="flex justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div>
                        <span className="font-bold block text-slate-700">Federal Reserve Safeguard Pool</span>
                        <span className="text-[10px] text-slate-400 font-mono">Account ending in *0001</span>
                      </div>
                      <span className="font-mono text-slate-800 font-black">$2,447,800</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOM REPORT BUILDER */}
          {activeSubTab === 'bi-custom-reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Creator Controls (Span 5) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <h3 className="font-bold text-sm text-slate-800">Dynamic Parameter Controller</h3>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Report Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter custom report name..."
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
                    id="new-report-name"
                  />
                </div>

                {/* Data Source */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Primary Data Source</label>
                  <select className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5" id="new-report-source">
                    <option value="Transactions">Transactions Ledger (Full Audit)</option>
                    <option value="Customers">Customer Profiles & Tier Segments</option>
                    <option value="KYC Queue">KYC Verifications & Submissions</option>
                    <option value="Card Transactions">Issued Cards Spend & MCC Logs</option>
                    <option value="Treasury Pools">Treasury Bank Accounts Balances</option>
                    <option value="Support Tickets">Customer Support Cases</option>
                  </select>
                </div>

                {/* Fields */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Selected Dimensions & Fields</label>
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    {['ID / Code', 'Amount ($)', 'Timestamp', 'Country', 'SLA Success', 'Risk Score', 'Fee Accrued'].map((f) => (
                      <label key={f} className="flex items-center gap-2 text-xs text-slate-600 font-semibold cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                        <span>{f}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SQL-style Filter Parameters</label>
                  <input 
                    type="text" 
                    defaultValue="Amount > 500 AND country = 'US'"
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 font-mono"
                    id="new-report-filters"
                  />
                </div>

                {/* Group and Aggregates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Group By</label>
                    <select className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2" id="new-report-groupby">
                      <option value="Country">Country</option>
                      <option value="Status">Status</option>
                      <option value="Customer ID">Customer ID</option>
                      <option value="Product Line">Product Line</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Aggregate Value</label>
                    <select className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2" id="new-report-aggregate">
                      <option value="Sum (Amount)">Sum (Amount)</option>
                      <option value="Count (Items)">Count (Items)</option>
                      <option value="Average (Risk)">Average (Risk)</option>
                      <option value="Min (SLA)">Min (SLA)</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={() => {
                      addAuditLog('PREVIEW_REPORT', 'Previewed custom report dynamic results.');
                      onToast('Report Compiled', 'Live preview generated from target ledger.', 'success');
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button 
                    onClick={() => {
                      const nameInput = (document.getElementById('new-report-name') as HTMLInputElement)?.value || 'New Custom Report';
                      const sourceSelect = (document.getElementById('new-report-source') as HTMLSelectElement)?.value || 'Transactions';
                      const filterInput = (document.getElementById('new-report-filters') as HTMLInputElement)?.value || '';
                      const groupbySelect = (document.getElementById('new-report-groupby') as HTMLSelectElement)?.value || '';
                      const aggregateSelect = (document.getElementById('new-report-aggregate') as HTMLSelectElement)?.value || '';

                      const newRep: CustomReport = {
                        id: `REP-${Math.floor(100 + Math.random() * 900)}`,
                        name: nameInput,
                        dataSource: sourceSelect,
                        fields: ['ID / Code', 'Amount ($)', 'Timestamp', 'Country'],
                        filters: filterInput,
                        groupBy: groupbySelect,
                        aggregate: aggregateSelect,
                        sortBy: 'Timestamp DESC',
                        createdTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
                        owner: 'tilok.mania@gmail.com'
                      };
                      const updated = [...customReports, newRep];
                      saveReportsToStorage(updated);
                      addAuditLog('CREATE_CUSTOM_REPORT', `Created custom report "${nameInput}" targeting ${sourceSelect}.`);
                      onToast('Report Saved', `Successfully compiled and cataloged report: ${nameInput}`, 'success');
                    }}
                    className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/10"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Report
                  </button>
                </div>
              </div>

              {/* Saved Reports Hub & Live Preview (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Reports Hub */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-500" />
                    <span>Saved Custom Reports Hub</span>
                  </h3>
                  <div className="space-y-3">
                    {customReports.map((rep) => (
                      <div key={rep.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">{rep.id}</span>
                            <h4 className="font-bold text-xs text-slate-800">{rep.name}</h4>
                          </div>
                          <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                            <span>Source: <strong className="text-slate-600">{rep.dataSource}</strong></span>
                            <span>Aggregate: <strong className="text-slate-600">{rep.aggregate}</strong></span>
                            {rep.filters && <span>Filters: <code className="bg-slate-200/50 px-1 rounded font-mono text-[9px] text-slate-600">{rep.filters}</code></span>}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            Created {rep.createdTime} by {rep.owner}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              addAuditLog('CLONE_REPORT', `Cloned report "${rep.name}".`);
                              const cloned: CustomReport = {
                                ...rep,
                                id: `REP-${Math.floor(100 + Math.random() * 900)}`,
                                name: `${rep.name} (Clone)`,
                                createdTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
                              };
                              saveReportsToStorage([...customReports, cloned]);
                              onToast('Report Cloned', `Cloned and appended custom report format.`, 'success');
                            }}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-slate-500 transition-colors"
                            title="Clone Report"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              addAuditLog('SHARE_REPORT', `Shared report "${rep.name}" link.`);
                              onToast('Share Link Copied', `Secure access link copied to clipboard.`, 'info');
                            }}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-slate-500 transition-colors"
                            title="Share Report"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              const updated = customReports.filter(r => r.id !== rep.id);
                              saveReportsToStorage(updated);
                              addAuditLog('DELETE_REPORT', `Deleted custom report "${rep.name}".`);
                              onToast('Report Deleted', `Successfully expunged report from workspace catalog.`, 'warning');
                            }}
                            className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Output Simulation */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Dynamic Result Preview Matrix</h3>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">Computed OK</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                          <th className="p-2.5 font-bold uppercase text-[9px]">ID Code</th>
                          <th className="p-2.5 font-bold uppercase text-[9px]">Aggregate Pool</th>
                          <th className="p-2.5 font-bold uppercase text-[9px]">Risk Flag</th>
                          <th className="p-2.5 font-bold uppercase text-[9px]">Country</th>
                          <th className="p-2.5 font-bold uppercase text-[9px] text-right">Computed Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        <tr>
                          <td className="p-2.5 font-bold text-slate-700">W-USD-01</td>
                          <td className="p-2.5">Core SaaS Ledger</td>
                          <td className="p-2.5"><span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded text-[9px]">LOW</span></td>
                          <td className="p-2.5">United States</td>
                          <td className="p-2.5 text-right font-bold text-slate-800">$142,091</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-700">W-EUR-02</td>
                          <td className="p-2.5">Card Settlements</td>
                          <td className="p-2.5"><span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded text-[9px]">MEDIUM</span></td>
                          <td className="p-2.5">Germany</td>
                          <td className="p-2.5 text-right font-bold text-slate-800">$94,000</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-700">W-JPY-05</td>
                          <td className="p-2.5">Treasury Pools</td>
                          <td className="p-2.5"><span className="px-1.5 py-0.2 bg-red-50 text-red-700 rounded text-[9px]">HIGH</span></td>
                          <td className="p-2.5">Japan</td>
                          <td className="p-2.5 text-right font-bold text-slate-800">$241,800</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULED REPORTS */}
          {activeSubTab === 'bi-scheduled-reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Creator Column (Span 4) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <h3 className="font-bold text-sm text-slate-800">Add Automated Schedule</h3>
                </div>

                {/* Report Reference */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Custom Report Format</label>
                  <select className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5" id="new-sched-ref">
                    {customReports.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Delivery Cadence */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Automated Delivery Cadence</label>
                  <select className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5" id="new-sched-freq">
                    <option value="Daily">Daily Execution (at 23:59 UTC)</option>
                    <option value="Weekly">Weekly Execution (Mondays at 06:00 UTC)</option>
                    <option value="Monthly">Monthly Execution (1st of month at 00:05 UTC)</option>
                    <option value="Quarterly">Quarterly Corporate Filing</option>
                    <option value="Annual">Annual Auditor Recap</option>
                  </select>
                </div>

                {/* Recipients list */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Secure Email Delivery List (CSV)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. audit@walletpro.com, cfo@walletpro.com"
                    defaultValue="executive-team@walletpro.com"
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 font-mono"
                    id="new-sched-recipients"
                  />
                </div>

                {/* File Format */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Output File Format</label>
                  <select className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5" id="new-sched-format">
                    <option value="PDF">PDF Report Template</option>
                    <option value="Excel">Excel Spreadsheet Ledger</option>
                    <option value="CSV">Flat CSV Data File</option>
                  </select>
                </div>

                <button 
                  onClick={() => {
                    const refInput = (document.getElementById('new-sched-ref') as HTMLSelectElement)?.value || 'Daily Performance';
                    const freqSelect = (document.getElementById('new-sched-freq') as HTMLSelectElement)?.value || 'Daily';
                    const recipientsInput = (document.getElementById('new-sched-recipients') as HTMLInputElement)?.value || 'team@walletpro.com';
                    const formatSelect = (document.getElementById('new-sched-format') as HTMLSelectElement)?.value || 'PDF';

                    const newSched: ScheduledReport = {
                      id: `SCH-${Math.floor(100 + Math.random() * 900)}`,
                      name: refInput,
                      frequency: freqSelect,
                      recipients: recipientsInput,
                      format: formatSelect,
                      lastRun: 'Never',
                      status: 'Active'
                    };
                    const updated = [...scheduledReports, newSched];
                    saveSchedulesToStorage(updated);
                    addAuditLog('SCHEDULE_REPORT', `Scheduled automated report delivery of "${refInput}" weekly to ${recipientsInput}.`);
                    onToast('Schedule Created', `Successfully scheduled auto-delivery to: ${recipientsInput}`, 'success');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Initialize Delivery Schedule
                </button>
              </div>

              {/* Active Subscriptions & Delivery History (Span 8) */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>Active Delivery Channels</span>
                  </h3>
                  <div className="space-y-3">
                    {scheduledReports.map((sch) => (
                      <div key={sch.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">{sch.id}</span>
                            <h4 className="font-bold text-xs text-slate-800">{sch.name}</h4>
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-100">
                              {sch.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                            <span>Format: <strong className="text-slate-600">{sch.format}</strong></span>
                            <span>Delivery Cadence: <strong className="text-slate-600 font-mono text-[9px]">{sch.frequency}</strong></span>
                            <span>Recipients: <code className="bg-slate-200/50 px-1 rounded font-mono text-[9px] text-slate-600">{sch.recipients}</code></span>
                          </div>
                          <div className="text-[9px] text-slate-400">
                            Last triggered: <strong className="text-slate-600 font-mono">{sch.lastRun}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              addAuditLog('TRIGGER_REPORT_NOW', `Manually ran scheduled report "${sch.name}" triggering immediate email dispatch.`);
                              onToast('Execution Triggered', `Dispatching ${sch.format} report via SMTP transfer channels immediately.`, 'success');
                            }}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-slate-500 transition-colors"
                            title="Run Schedule Now"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              const updated = scheduledReports.filter(s => s.id !== sch.id);
                              saveSchedulesToStorage(updated);
                              addAuditLog('UNSCHEDULE_REPORT', `Deleted schedule "${sch.name}".`);
                              onToast('Schedule Cancelled', `Auto-delivery subscription expunged.`, 'warning');
                            }}
                            className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded transition-colors"
                            title="Deactivate Schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* COMPLIANCE AUDIT TRACE LOGGING TRAIL */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-sm text-slate-800 font-display">Administrative Reporting Audit Trail Log</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">REAL-TIME TAMPER-PROOF DEPOSITS</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[10px] text-slate-600">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-lg flex flex-col md:flex-row gap-2 justify-between">
              <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                <span className="text-slate-400 font-bold">[{log.timestamp}]</span>
                <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded font-mono text-[9px] uppercase border border-blue-100">
                  {log.action}
                </span>
                <span className="text-slate-800 font-semibold">{log.user} ({log.role})</span>
                <span className="text-slate-500 font-medium md:ml-2">{log.details}</span>
              </div>
              <span className="text-slate-400 font-semibold self-end md:self-center">IP: {log.ip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
