import React, { useState, useEffect, useRef } from 'react';
import { isAuthorizedForTab, isAuthorizedForWorkspace } from '../utils/auth';
import { 
  Activity, Users, Cpu, Coins, ArrowRightLeft, Landmark, RotateCcw, 
  Sliders, CreditCard, Shield, UserCheck, ShieldAlert, DollarSign, 
  MessageSquare, Settings, Terminal, Star, ChevronLeft, ChevronRight, 
  X, Search, Clock, Key, Ticket, ToggleLeft, Mail, FileText, Lock, 
  Percent, Globe, AlertTriangle, ShieldCheck, HelpCircle, FileSpreadsheet,
  TrendingUp, Droplet, BookOpen, MessageCircle, Bell, UserPlus, Webhook,
  CheckCircle, ChevronDown, LayoutDashboard, Layers, Network,
  Palette, Languages, Calendar, HardDrive, RefreshCw, HeartPulse, Server,
  GitBranch, BadgeCheck, ClipboardList, Send
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  optimizedCount: number;
  totalCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

export function Sidebar({ 
  activeTab, 
  onSelectTab, 
  optimizedCount, 
  totalCount,
  isCollapsed = false,
  onToggleCollapse,
  isMobile = false,
  onCloseMobile
}: SidebarProps) {
  // Navigation State
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('walletpro_sidebar_favorites');
      return saved ? JSON.parse(saved) : ['dashboard', 'kyc-queue', 'cards'];
    } catch (e) {
      return ['dashboard', 'kyc-queue', 'cards'];
    }
  });
  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('walletpro_sidebar_recents');
      return saved ? JSON.parse(saved) : ['dashboard', 'kyc-queue'];
    } catch (e) {
      return ['dashboard', 'kyc-queue'];
    }
  });

  // Role System (RBAC Permissions)
  const [activeRole, setActiveRole] = useState<
    'Super Administrator' | 'Platform Administrator' | 'Operations Manager' | 'Operations Agent' |
    'Compliance Manager' | 'Compliance Officer' | 'Fraud Manager' | 'Fraud Analyst' |
    'Finance Manager' | 'Finance Officer' | 'Treasury Manager' | 'Support Manager' |
    'Support Agent' | 'Security Analyst' | 'Developer' | 'Auditor' | 'Read Only Analyst' |
    'CEO' | 'Executive Team'
  >(() => {
    return (localStorage.getItem('walletpro_active_role') as any) || 'Super Administrator';
  });
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Nested Collapsible State for each group folder
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('walletpro_sidebar_expanded_groups');
      return saved ? JSON.parse(saved) : {
        Executive: true,
        'Business Intelligence': true,
        'Identity & Access': true,
        Operations: true,
        Compliance: true,
        Platform: false,
        Developers: false,
        Finance: false,
        Risk: false,
        Support: false
      };
    } catch (e) {
      return {
        Executive: true,
        'Business Intelligence': true,
        'Identity & Access': true,
        Operations: true,
        Compliance: true
      };
    }
  });

  // Keyboard navigation focus state
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const flatItemsRef = useRef<NavItem[]>([]);

  // Persist expanded states
  useEffect(() => {
    localStorage.setItem('walletpro_sidebar_expanded_groups', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('walletpro_sidebar_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Track recents
  const handleItemSelect = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
    
    // Update recents
    const updated = [tabId, ...recents.filter(id => id !== tabId)].slice(0, 5);
    setRecents(updated);
    localStorage.setItem('walletpro_sidebar_recents', JSON.stringify(updated));
  };

  const handleToggleFavorite = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const updated = favorites.includes(tabId) 
      ? favorites.filter(id => id !== tabId)
      : [...favorites, tabId];
    setFavorites(updated);
  };

  const handleToggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleRoleChange = (role: typeof activeRole) => {
    setActiveRole(role);
    localStorage.setItem('walletpro_active_role', role);
    setIsRoleDropdownOpen(false);
  };

  // Define structured navigation according to specifications
  const navigationGroups: NavGroup[] = [
    {
      name: 'Executive',
      items: [
        { id: 'dashboard', name: 'Dashboard', icon: Activity },
        { id: 'analytics', name: 'Analytics', icon: Sliders },
        { id: 'reports', name: 'Reports', icon: FileSpreadsheet, badge: 'SLA' },
        { id: 'audit', name: 'System Health', icon: Cpu }
      ]
    },
    {
      name: 'Business Intelligence',
      items: [
        { id: 'bi-executive-dashboard', name: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'bi-operational-analytics', name: 'Operational Analytics', icon: Activity },
        { id: 'bi-revenue-analytics', name: 'Revenue Analytics', icon: Landmark },
        { id: 'bi-customer-analytics', name: 'Customer Analytics', icon: Users },
        { id: 'bi-transaction-analytics', name: 'Transaction Analytics', icon: ArrowRightLeft },
        { id: 'bi-wallet-analytics', name: 'Wallet Analytics', icon: Coins },
        { id: 'bi-card-analytics', name: 'Card Analytics', icon: CreditCard },
        { id: 'bi-compliance-analytics', name: 'Compliance Analytics', icon: ShieldCheck },
        { id: 'bi-fraud-analytics', name: 'Fraud Analytics', icon: ShieldAlert },
        { id: 'bi-support-analytics', name: 'Support Analytics', icon: Ticket },
        { id: 'bi-treasury-analytics', name: 'Treasury Analytics', icon: DollarSign },
        { id: 'bi-custom-reports', name: 'Custom Reports', icon: FileSpreadsheet },
        { id: 'bi-scheduled-reports', name: 'Scheduled Reports', icon: Clock }
      ]
    },
    {
      name: 'Identity & Access',
      items: [
        { id: 'iam-dashboard', name: 'Staff Dashboard', icon: LayoutDashboard },
        { id: 'iam-staff', name: 'Staff Directory', icon: Users },
        { id: 'iam-admin-users', name: 'Admin Users', icon: UserCheck },
        { id: 'iam-invitations', name: 'Invitations', icon: Mail },
        { id: 'iam-departments', name: 'Departments', icon: Landmark },
        { id: 'iam-teams', name: 'Teams', icon: UserPlus },
        { id: 'iam-roles', name: 'Roles', icon: ShieldCheck },
        { id: 'iam-permission-groups', name: 'Permission Groups', icon: Layers },
        { id: 'iam-permissions', name: 'Permissions', icon: Key },
        { id: 'iam-access-policies', name: 'Access Policies', icon: Lock },
        { id: 'iam-approval-workflows', name: 'Approval Workflows', icon: CheckCircle },
        { id: 'iam-mfa-management', name: 'MFA Management', icon: ShieldCheck },
        { id: 'iam-sessions', name: 'Sessions', icon: Clock },
        { id: 'iam-devices', name: 'Devices', icon: Cpu },
        { id: 'iam-login-history', name: 'Login History', icon: FileText },
        { id: 'iam-password-policies', name: 'Password Policies', icon: Key },
        { id: 'iam-access-reviews', name: 'Access Reviews', icon: HelpCircle },
        { id: 'iam-audit-logs', name: 'Audit Logs', icon: FileText }
      ]
    },
    {
      name: 'Security Operations',
      items: [
        { id: 'sec-dashboard', name: 'Security Dashboard', icon: LayoutDashboard },
        { id: 'sec-events', name: 'Live Security Events', icon: Activity },
        { id: 'sec-alerts', name: 'Security Alerts', icon: ShieldAlert },
        { id: 'sec-threat', name: 'Threat Intelligence', icon: Globe },
        { id: 'sec-logins', name: 'Login Monitoring', icon: Users },
        { id: 'sec-sessions', name: 'Session Monitoring', icon: Clock },
        { id: 'sec-devices', name: 'Device Monitoring', icon: Cpu },
        { id: 'sec-ips', name: 'IP Intelligence', icon: Network },
        { id: 'sec-geo', name: 'Geo Activity', icon: Globe },
        { id: 'sec-api', name: 'API Security', icon: Terminal },
        { id: 'sec-incidents', name: 'Incident Management', icon: AlertTriangle },
        { id: 'sec-audit', name: 'Audit Explorer', icon: FileText },
        { id: 'sec-vuln', name: 'Vulnerability Center', icon: ShieldAlert },
        { id: 'sec-policies', name: 'Security Policies', icon: Sliders },
        { id: 'sec-reports', name: 'Security Reports', icon: FileSpreadsheet }
      ]
    },
    {
      name: 'Operations',
      items: [
        { id: 'customers', name: 'Customers', icon: Users },
        { id: 'wallets', name: 'Wallets', icon: Coins },
        { id: 'transactions', name: 'Transactions', icon: ArrowRightLeft },
        { id: 'cards', name: 'Cards', icon: CreditCard },
        { id: 'settlements', name: 'Settlements', icon: Landmark },
        { id: 'refunds', name: 'Refunds', icon: RotateCcw }
      ]
    },
    {
      name: 'Compliance',
      items: [
        { id: 'kyc-queue', name: 'KYC Queue', icon: UserCheck, badge: '12', badgeColor: 'bg-amber-500' },
        { id: 'identity-verification', name: 'Identity Verification', icon: ShieldCheck },
        { id: 'aml-screening', name: 'AML Screening', icon: ShieldCheck, badge: 'Alert', badgeColor: 'bg-red-500' },
        { id: 'sanctions-screening', name: 'Sanctions Screening', icon: Globe },
        { id: 'pep-screening', name: 'PEP Screening', icon: Users },
        { id: 'compliance-cases', name: 'Compliance Cases', icon: FileText, badge: '4' }
      ]
    },
    {
      name: 'Risk',
      items: [
        { id: 'fraud-center', name: 'Fraud Center', icon: ShieldAlert },
        { id: 'alerts', name: 'Alerts', icon: AlertTriangle, badge: '7', badgeColor: 'bg-red-500' },
        { id: 'investigations', name: 'Investigations', icon: Search },
        { id: 'high-risk-accounts', name: 'High Risk Accounts', icon: ShieldCheck },
        { id: 'frozen-accounts', name: 'Frozen Accounts', icon: Lock }
      ]
    },
    {
      name: 'Finance',
      items: [
        { id: 'treasury-dashboard', name: 'Treasury Dashboard', icon: DollarSign },
        { id: 'treasury-liquidity', name: 'Liquidity', icon: Droplet },
        { id: 'treasury-settlements', name: 'Settlements', icon: Landmark },
        { id: 'treasury-reconciliation', name: 'Reconciliation', icon: CheckCircle },
        { id: 'treasury-revenue', name: 'Revenue', icon: TrendingUp },
        { id: 'treasury-fees', name: 'Fees', icon: Percent },
        { id: 'treasury-reserve-accounts', name: 'Reserve Accounts', icon: ShieldCheck },
        { id: 'treasury-bank-accounts', name: 'Bank Accounts', icon: Landmark },
        { id: 'treasury-accounting', name: 'Accounting', icon: BookOpen },
        { id: 'treasury-financial-reports', name: 'Financial Reports', icon: FileSpreadsheet }
      ]
    },
    {
      name: 'Support',
      items: [
        { id: 'support-dashboard', name: 'Support Dashboard', icon: Activity },
        { id: 'tickets', name: 'Tickets', icon: Ticket, badge: '3' },
        { id: 'support-cases', name: 'Cases', icon: FileText },
        { id: 'live-chat', name: 'Live Chat', icon: MessageCircle, badge: 'Live', badgeColor: 'bg-emerald-500' },
        { id: 'customer-communication', name: 'Customer Comms', icon: Mail },
        { id: 'escalations', name: 'Escalations', icon: AlertTriangle, badge: 'SLA', badgeColor: 'bg-red-500' },
        { id: 'knowledge-base', name: 'Knowledge Base', icon: BookOpen },
        { id: 'macros', name: 'Macros', icon: Terminal },
        { id: 'sla-management', name: 'SLA Management', icon: Clock }
      ]
    },
    {
      name: 'Platform Administration',
      items: [
        { id: 'plat-dashboard', name: 'Platform Dashboard', icon: LayoutDashboard },
        { id: 'plat-settings', name: 'Global Settings', icon: Settings },
        { id: 'plat-flags', name: 'Feature Flags', icon: ToggleLeft },
        { id: 'plat-business-rules', name: 'Business Rules', icon: FileText },
        { id: 'plat-transaction-rules', name: 'Transaction Rules', icon: Sliders },
        { id: 'plat-wallet-config', name: 'Wallet Configuration', icon: Coins },
        { id: 'plat-card-config', name: 'Card Configuration', icon: CreditCard },
        { id: 'plat-fees', name: 'Fee Management', icon: Percent },
        { id: 'plat-exchange', name: 'Exchange Rates', icon: RefreshCw },
        { id: 'plat-currencies', name: 'Currency Management', icon: DollarSign },
        { id: 'plat-regions', name: 'Countries & Regions', icon: Globe },
        { id: 'plat-notifications', name: 'Notification Center', icon: Bell },
        { id: 'plat-emails', name: 'Email Templates', icon: Mail },
        { id: 'plat-sms', name: 'SMS Templates', icon: MessageSquare },
        { id: 'plat-push', name: 'Push Templates', icon: Send },
        { id: 'plat-branding', name: 'Branding', icon: Palette },
        { id: 'plat-localization', name: 'Localization', icon: Languages },
        { id: 'plat-jobs', name: 'Scheduled Jobs', icon: Calendar },
        { id: 'plat-queue', name: 'Queue Monitor', icon: Activity },
        { id: 'plat-storage', name: 'Storage Management', icon: HardDrive },
        { id: 'plat-files', name: 'File Management', icon: FileText },
        { id: 'plat-backup', name: 'Backup & Restore', icon: ShieldCheck },
        { id: 'plat-health', name: 'System Health', icon: HeartPulse },
        { id: 'plat-services', name: 'Service Status', icon: Server },
        { id: 'plat-env', name: 'Environment Status', icon: Terminal },
        { id: 'plat-maintenance', name: 'Maintenance Mode', icon: AlertTriangle },
        { id: 'plat-releases', name: 'Release Management', icon: GitBranch },
        { id: 'plat-license', name: 'License & Version', icon: BadgeCheck },
        { id: 'plat-audit', name: 'Configuration Audit', icon: ClipboardList }
      ]
    },
    {
      name: 'Platform',
      items: [
        { id: 'admin-users', name: 'Admin Users', icon: UserCheck },
        { id: 'roles', name: 'Roles', icon: Lock },
        { id: 'permissions', name: 'Permissions', icon: Shield },
        { id: 'feature-flags', name: 'Feature Flags', icon: ToggleLeft },
        { id: 'app-settings', name: 'App Settings', icon: Settings },
        { id: 'notification-templates', name: 'Notification Templates', icon: Mail },
        { id: 'audit-logs', name: 'Audit Logs', icon: FileText },
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'sessions', name: 'Sessions', icon: Clock }
      ]
    },
    {
      name: 'Developer Portal',
      items: [
        { id: 'dev-overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'dev-api-mgmt', name: 'API Management', icon: Layers },
        { id: 'dev-api-keys', name: 'API Keys', icon: Key },
        { id: 'dev-oauth', name: 'OAuth Clients', icon: UserCheck },
        { id: 'dev-webhooks', name: 'Webhooks', icon: Webhook },
        { id: 'dev-webhook-deliveries', name: 'Webhook Deliveries', icon: ArrowRightLeft },
        { id: 'dev-explorer', name: 'API Explorer', icon: Terminal },
        { id: 'dev-docs', name: 'API Documentation', icon: BookOpen },
        { id: 'dev-sdks', name: 'SDK Downloads', icon: HardDrive },
        { id: 'dev-sandbox', name: 'Sandbox', icon: Sliders },
        { id: 'dev-marketplace', name: 'Integration Marketplace', icon: Cpu },
        { id: 'dev-event-bus', name: 'Event Bus', icon: Network },
        { id: 'dev-queues', name: 'Queues', icon: Activity },
        { id: 'dev-bg-jobs', name: 'Background Jobs', icon: RefreshCw },
        { id: 'dev-workers', name: 'Workers', icon: Users },
        { id: 'dev-cron-jobs', name: 'Cron Jobs', icon: Calendar },
        { id: 'dev-secrets', name: 'Secrets Management', icon: Lock },
        { id: 'dev-env-vars', name: 'Environment Variables', icon: Settings },
        { id: 'dev-logs', name: 'Logs', icon: FileText },
        { id: 'dev-tracing', name: 'Tracing', icon: TrendingUp },
        { id: 'dev-monitoring', name: 'Monitoring', icon: HeartPulse },
        { id: 'dev-service-registry', name: 'Service Registry', icon: Server },
        { id: 'dev-microservices', name: 'Microservices', icon: Layers },
        { id: 'dev-health', name: 'Health Checks', icon: HeartPulse },
        { id: 'dev-rate-limits', name: 'Rate Limits', icon: Shield },
        { id: 'dev-api-analytics', name: 'API Analytics', icon: TrendingUp },
        { id: 'dev-error-analytics', name: 'Error Analytics', icon: AlertTriangle },
        { id: 'dev-version-mgmt', name: 'Version Management', icon: GitBranch },
        { id: 'dev-deployment', name: 'Deployment History', icon: Clock },
        { id: 'dev-releases', name: 'Release Notes', icon: ClipboardList }
      ]
    }
  ];

  const ROLE_BI_PERMISSIONS: Record<string, string[]> = {
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

  // RBAC Permission Logic
  // Hide unauthorized menu sections / items based on role selection
  const isItemAuthorized = (tabId: string, groupName: string): boolean => {
    return isAuthorizedForWorkspace(activeRole, groupName) && isAuthorizedForTab(activeRole, tabId);
  };

  // Filter groups according to RBAC permissions AND dynamic Search Term
  const filteredGroups = navigationGroups.map(group => {
    const authorizedItems = group.items.filter(item => isItemAuthorized(item.id, group.name));
    
    const searchedItems = authorizedItems.filter(item => {
      const matchSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });

    return {
      ...group,
      items: searchedItems
    };
  }).filter(group => group.items.length > 0);

  // Setup list for Keyboard navigation
  const flatItems: NavItem[] = [];
  filteredGroups.forEach(group => {
    if (expandedGroups[group.name] || searchTerm) {
      flatItems.push(...group.items);
    }
  });
  flatItemsRef.current = flatItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatItems.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIndex(prev => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter' && focusIndex >= 0) {
      e.preventDefault();
      const item = flatItems[focusIndex];
      handleItemSelect(item.id);
    }
  };

  const getStarredIcon = (tabId: string) => {
    return favorites.includes(tabId) ? (
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
    ) : (
      <Star className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500" />
    );
  };

  const baseCoverage = 65;
  const bonusPerFix = (100 - baseCoverage) / totalCount;
  const currentCoverage = Math.min(100, Math.round(baseCoverage + (optimizedCount * bonusPerFix)));

  return (
    <aside 
      id="app-sidebar" 
      className={`h-full flex flex-col border-r border-slate-200/60 bg-white z-20 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${isMobile ? 'w-full h-full' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-200/50 flex items-center justify-between gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 text-white">
            <Shield className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-slate-800 text-sm">WalletPro</span>
                <span className="text-[9px] bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-bold uppercase tracking-wider scale-95 origin-left">Ent</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Operations Console</span>
            </div>
          )}
        </div>

        {isMobile ? (
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer ${
                isCollapsed ? 'hidden' : 'block'
              }`}
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      {/* Role-Based Access Control Selector */}
      {!isCollapsed && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 relative">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Role</span>
            <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-100">
              RBAC OK
            </span>
          </div>
          <button
            onClick={() => setIsRoleDropdownOpen(prev => !prev)}
            className="mt-1 w-full flex items-center justify-between px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded text-[11px] font-semibold text-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <span className="truncate">{activeRole}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute top-11 left-4 right-4 bg-white border border-slate-200 rounded shadow-lg z-30 divide-y divide-slate-50 text-[10px] text-left max-h-60 overflow-y-auto">
              {[
                'Super Administrator', 'Platform Administrator', 'CEO', 'Executive Team', 
                'Operations Manager', 'Operations Agent', 'Compliance Manager', 'Compliance Officer', 
                'Fraud Manager', 'Fraud Analyst', 'Finance Manager', 'Finance Officer', 
                'Treasury Manager', 'Support Manager', 'Support Agent', 'Security Analyst', 
                'Developer', 'Auditor', 'Read Only Analyst'
              ].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role as any)}
                  className={`w-full block px-3 py-2 text-left hover:bg-slate-50 font-medium ${
                    activeRole === role ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Filter Search */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Quick search navigation..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-slate-50 placeholder-slate-400 shadow-inner"
            />
          </div>
        </div>
      )}

      {/* Navigation Area */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar">
        
        {/* Starred Favorites Section */}
        {favorites.length > 0 && !isCollapsed && !searchTerm && (
          <div className="space-y-1">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1 flex items-center gap-1 text-left">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" /> Starred Pages
            </div>
            {favorites.map((favId) => {
              // Find item in definition
              let foundItem: NavItem | null = null;
              navigationGroups.forEach(g => {
                const item = g.items.find(i => i.id === favId);
                if (item) foundItem = item;
              });
              
              if (!foundItem) return null;
              const Icon = (foundItem as NavItem).icon;
              const isActive = activeTab === favId;
              
              return (
                <button
                  key={favId}
                  onClick={() => handleItemSelect(favId)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm'
                      : 'text-slate-600 border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{(foundItem as NavItem).name}</span>
                  </div>
                  <span onClick={(e) => handleToggleFavorite(e, favId)}>
                    {getStarredIcon(favId)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Structured Groups Nested Folders */}
        <div className="space-y-3">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups[group.name] || searchTerm;
            return (
              <div key={group.name} className="space-y-1">
                {/* Nested folder header */}
                {!isCollapsed && (
                  <button
                    onClick={() => handleToggleGroup(group.name)}
                    className="w-full flex items-center justify-between px-3 py-1 text-slate-400 hover:text-slate-700 font-bold uppercase tracking-wider text-[10px] text-left cursor-pointer"
                  >
                    <span>{group.name}</span>
                    {!searchTerm && (
                      isExpanded ? (
                        <ChevronLeft className="w-3 h-3 rotate-90 transition-transform" />
                      ) : (
                        <ChevronLeft className="w-3 h-3 transition-transform" />
                      )
                    )}
                  </button>
                )}

                {/* Nested items list */}
                {(isExpanded || isCollapsed) && (
                  <div className="space-y-0.5 pl-1">
                    {group.items.map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const globalIndex = flatItems.findIndex(f => f.id === item.id);
                      const isFocused = globalIndex === focusIndex;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemSelect(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border text-left cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm'
                              : isFocused
                                ? 'bg-slate-100 text-slate-900 border-slate-200'
                                : 'text-slate-600 border-transparent hover:bg-slate-100/70 hover:text-slate-900'
                          } ${isCollapsed ? 'justify-center px-0' : ''}`}
                          title={item.name}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                            {!isCollapsed && <span>{item.name}</span>}
                          </div>

                          {!isCollapsed && (
                            <div className="flex items-center gap-1">
                              {/* Counter/Badge check */}
                              {item.badge && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold text-white uppercase tracking-wider ${item.badgeColor || 'bg-blue-600'}`}>
                                  {item.badge}
                                </span>
                              )}
                              {/* Star Toggle */}
                              <span 
                                onClick={(e) => handleToggleFavorite(e, item.id)}
                                className="opacity-0 group-hover:opacity-100 hover:scale-110 transition-transform"
                              >
                                {getStarredIcon(item.id)}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Expand trigger button when collapsed */}
      {isCollapsed && onToggleCollapse && (
        <div className="p-3 border-t border-slate-200/50 flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live SLA Compliance Banner */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200/50 bg-slate-50/50">
          <div className="bg-slate-900/95 backdrop-blur-md rounded-xl p-3.5 text-white shadow-xl border border-slate-800 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Audit Security</span>
              {currentCoverage === 100 && (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <div className="text-[11px] mb-2 text-slate-300 font-medium leading-tight">
              {currentCoverage === 100 ? (
                <span>Ledger secure: <strong className="text-emerald-400">100%</strong> compliance.</span>
              ) : (
                <span>Scan coverage: <strong className="text-blue-400">{currentCoverage}%</strong>.</span>
              )}
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  currentCoverage === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
                style={{ width: `${currentCoverage}%` }}
              />
            </div>
            <div className="mt-1.5 text-[9px] text-slate-500 font-mono flex justify-between">
              <span>{optimizedCount} of {totalCount} verified</span>
              <span>{currentCoverage}%</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
