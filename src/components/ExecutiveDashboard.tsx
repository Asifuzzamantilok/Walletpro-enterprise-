import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle, ShieldAlert, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, 
  TrendingUp, Activity, CircleDot, AlertTriangle, Clock, RefreshCw, Plus, MinusCircle, 
  UserCheck, Send, Zap, ChevronRight, ChevronUp, ChevronDown, Search, Play, Pause, Trash2, X, Filter, Sparkles,
  Database, Server, Cpu, HardDrive, Mail, Phone, BellRing, Settings, ShieldCheck, Terminal,
  MessageSquare, FileText, Ban, Check, DollarSign, BarChart3, HelpCircle, AlertOctagon, Info
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Define TS Types for Dashboard state
interface KPICardState {
  id: string;
  name: string;
  value: string;
  numberVal: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'stable';
  comparison: string;
  category: 'financial' | 'customers' | 'wallets' | 'operations';
  loading: boolean;
  error: boolean;
  unit?: string;
  icon: React.ComponentType<any>;
}

interface OperationLog {
  id: string;
  timestamp: string;
  type: 'transaction' | 'kyc' | 'support' | 'fraud' | 'failed_payment' | 'admin_action' | 'login';
  title: string;
  detail: string;
  status: 'pending' | 'success' | 'resolved' | 'failed' | 'warning' | 'completed';
  amount?: string;
  user?: string;
}

interface QuickActionModalProps {
  action: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface ExecutiveDashboardProps {
  addToast?: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export function ExecutiveDashboard({ addToast }: ExecutiveDashboardProps) {
  const [activeKpiCategory, setActiveKpiCategory] = useState<'all' | 'financial' | 'customers' | 'wallets' | 'operations'>('all');
  const [activeChartGroup, setActiveChartGroup] = useState<'financial' | 'growth' | 'operations'>('financial');
  const [operationFilter, setOperationFilter] = useState<'all' | 'transaction' | 'kyc' | 'support' | 'fraud' | 'failed_payment' | 'admin_action' | 'login'>('all');
  const [operationSearch, setOperationSearch] = useState('');
  
  // Active role syncing for permission gating of debug simulation actions
  const [activeRole, setActiveRole] = useState<string>(() => {
    return localStorage.getItem('walletpro_active_role') || 'Super Administrator';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setActiveRole(localStorage.getItem('walletpro_active_role') || 'Super Administrator');
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Simulation states
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);
  const [errorSimulationMode, setErrorSimulationMode] = useState(false);
  const [loadingSimulationMode, setLoadingSimulationMode] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isKpiExpanded, setIsKpiExpanded] = useState(false);

  // Stateful Executive Alerts
  const [executiveAlerts, setExecutiveAlerts] = useState([
    {
      id: 'alert-1',
      severity: 'critical', // critical, warning, info
      time: '1m ago',
      title: 'Clearing Node Outflow Discrepancy',
      desc: 'FedWire clearing gateway reported mismatch of EUR transactions. Security keys temporarily throttled.',
      system: 'FedWire Gateway',
      owner: 'tilok.compliance@walletpro.co',
      unresolved: true
    },
    {
      id: 'alert-2',
      severity: 'warning',
      time: '15m ago',
      title: 'Redis Memory Limit Approaching 80%',
      desc: 'Cluster #09 cache is saturating with live ledger balances. Auto-scaling policy primed to scale node.',
      system: 'Redis Cache Cluster #09',
      owner: 'infra.ops@walletpro.co',
      unresolved: true
    },
    {
      id: 'alert-3',
      severity: 'info',
      time: '1h ago',
      title: 'PCI-DSS Audit Pre-Flight Renewed',
      desc: 'Scheduled cron job verified security posture: 5 of 5 controls compliant. Certificates refreshed.',
      system: 'PCI Security Engine',
      owner: 'auditor.compliance@walletpro.co',
      unresolved: true
    }
  ]);

  // Quick Action Modal active state
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

  // 1. KPI CARDS DATA STATE
  const [kpis, setKpis] = useState<KPICardState[]>([
    { id: 'total-customers', name: 'Total Customers', value: '1,245,820', numberVal: 1245820, trend: 4.2, trendDirection: 'up', comparison: 'vs yesterday', category: 'customers', loading: false, error: false, icon: Users },
    { id: 'verified-customers', name: 'Verified Customers', value: '1,180,432', numberVal: 1180432, trend: 3.8, trendDirection: 'up', comparison: 'vs yesterday', category: 'customers', loading: false, error: false, icon: UserCheck },
    { id: 'pending-kyc', name: 'Pending KYC', value: '1,420', numberVal: 1420, trend: -12.4, trendDirection: 'down', comparison: 'vs yesterday', category: 'customers', loading: false, error: false, icon: Clock },
    { id: 'total-wallets', name: 'Total Wallets', value: '2,450,912', numberVal: 2450912, trend: 5.1, trendDirection: 'up', comparison: 'vs yesterday', category: 'wallets', loading: false, error: false, icon: Wallet },
    { id: 'active-wallets', name: 'Active Wallets', value: '1,890,420', numberVal: 1890420, trend: 6.3, trendDirection: 'up', comparison: 'vs yesterday', category: 'wallets', loading: false, error: false, icon: Activity },
    { id: 'virtual-cards', name: 'Virtual Cards', value: '450,120', numberVal: 450120, trend: 15.8, trendDirection: 'up', comparison: 'vs yesterday', category: 'wallets', loading: false, error: false, icon: CreditCard },
    { id: 'daily-transactions', name: 'Daily Transactions', value: '184,290', numberVal: 184290, trend: 8.2, trendDirection: 'up', comparison: 'vs yesterday', category: 'financial', loading: false, error: false, icon: Zap },
    { id: 'monthly-transactions', name: 'Monthly Transactions', value: '5,420,912', numberVal: 5420912, trend: 11.4, trendDirection: 'up', comparison: 'vs yesterday', category: 'financial', loading: false, error: false, icon: BarChart3 },
    { id: 'tx-success-rate', name: 'Transaction Success Rate', value: '99.82%', numberVal: 99.82, trend: 0.04, trendDirection: 'up', comparison: 'vs yesterday', category: 'financial', loading: false, error: false, icon: CheckCircle },
    { id: 'failed-transactions', name: 'Failed Transactions', value: '340', numberVal: 340, trend: -18.2, trendDirection: 'down', comparison: 'vs yesterday', category: 'financial', loading: false, error: false, icon: MinusCircle },
    { id: 'revenue-today', name: 'Revenue Today', value: '$458,920', numberVal: 458920, trend: 14.5, trendDirection: 'up', comparison: 'vs yesterday', category: 'financial', loading: false, error: false, unit: '$', icon: DollarSign },
    { id: 'revenue-month', name: 'Revenue This Month', value: '$12,420,850', numberVal: 12420850, trend: 10.2, trendDirection: 'up', comparison: 'vs yesterday', category: 'financial', loading: false, error: false, unit: '$', icon: DollarSign },
    { id: 'processing-volume', name: 'Processing Volume', value: '$45,820,900', numberVal: 45820900, trend: 9.1, trendDirection: 'up', comparison: 'vs yesterday', category: 'financial', loading: false, error: false, unit: '$', icon: TrendingUp },
    { id: 'avg-tx-value', name: 'Average Transaction Value', value: '$248.50', numberVal: 248.5, trend: 1.2, trendDirection: 'up', comparison: 'vs yesterday', category: 'financial', loading: false, error: false, unit: '$', icon: ArrowUpRight },
    { id: 'fraud-alerts', name: 'Fraud Alerts', value: '2', numberVal: 2, trend: -50.0, trendDirection: 'down', comparison: 'vs yesterday', category: 'operations', loading: false, error: false, icon: ShieldAlert },
    { id: 'frozen-accounts', name: 'Frozen Accounts', value: '84', numberVal: 84, trend: 2.4, trendDirection: 'up', comparison: 'vs yesterday', category: 'operations', loading: false, error: false, icon: Ban },
    { id: 'support-queue', name: 'Support Queue', value: '14', numberVal: 14, trend: -30.0, trendDirection: 'down', comparison: 'vs yesterday', category: 'operations', loading: false, error: false, icon: MessageSquare },
    { id: 'api-health', name: 'API Health', value: '99.99%', numberVal: 99.99, trend: 0.0, trendDirection: 'stable', comparison: 'Stable response (42ms)', category: 'operations', loading: false, error: false, icon: Terminal },
    { id: 'system-health', name: 'System Health', value: '100%', numberVal: 100, trend: 0.0, trendDirection: 'stable', comparison: 'All systems operational', category: 'operations', loading: false, error: false, icon: Cpu }
  ]);

  // 2. LIVE OPERATION STREAM STATE
  const [logs, setLogs] = useState<OperationLog[]>([
    { id: 'log-1', timestamp: '07:12:35', type: 'transaction', title: 'Payment Processing Outflow', detail: 'Mercury Clearing Sweeper dispatched from Master Reserve USD', status: 'success', amount: '-$300,000.00', user: 'SYSTEM' },
    { id: 'log-2', timestamp: '07:11:50', type: 'kyc', title: 'KYC Document Validation', detail: 'Iden3 Verified passport upload for Alice Vance (US)', status: 'pending', user: 'Alice Vance' },
    { id: 'log-3', timestamp: '07:10:14', type: 'support', title: 'API Key Rotator Bug', detail: 'Support ticket #10298 opened: "Secondary Webhook missing ping payload"', status: 'pending', user: 'DevOps Lead' },
    { id: 'log-4', timestamp: '07:08:42', type: 'fraud', title: 'Velocity Limit Triggered', detail: 'High-frequency micro-payout attempt in Lagos, NG (Blocked)', status: 'warning', user: 'Unknown IP' },
    { id: 'log-5', timestamp: '07:05:12', type: 'failed_payment', title: 'Auth Failure Code 51', detail: 'Insufficent Funds transfer from Wells Fargo clearing account', status: 'failed', amount: '$42,500.00', user: 'Clearing API' },
    { id: 'log-6', timestamp: '07:02:18', type: 'admin_action', title: 'RBAC Policy Deployed', detail: 'Admin tilok.mania@gmail.com enabled 2FA enforcement policy', status: 'completed', user: 'tilok.mania@gmail.com' },
    { id: 'log-7', timestamp: '07:00:05', type: 'login', title: 'Enterprise SSO Auth', detail: 'Successful login from recognized corporate node in Tokyo', status: 'success', user: 'HQ Auditor 2' }
  ]);

  // 3. SYSTEM METRICS PING DATA
  const [systemUptimes, setSystemUptimes] = useState({
    database: { status: 'Operational', uptime: '99.99%', latency: '8ms', load: 18 },
    redis: { status: 'Operational', uptime: '100.00%', latency: '0.9ms', load: 12 },
    api: { status: 'Operational', uptime: '99.99%', latency: '42ms', load: 35 },
    queue: { status: 'Operational', uptime: '100.00%', latency: '15ms', load: 8 },
    email: { status: 'Operational', uptime: '99.85%', latency: '120ms', load: 5 },
    sms: { status: 'Operational', uptime: '99.92%', latency: '240ms', load: 3 },
    push: { status: 'Operational', uptime: '100.00%', latency: '18ms', load: 14 },
    storage: { status: 'Operational', uptime: '100.00%', latency: '35ms', load: 42 },
    cpu: { status: 'Optimal', uptime: 'N/A', latency: 'N/A', load: 24 },
    memory: { status: 'Optimal', uptime: 'N/A', latency: 'N/A', load: 58 }
  });

  // 4. CHART DATA GENERATORS
  const revenue30Days = [
    { name: 'Day 1', revenue: 310000, txCount: 12000 },
    { name: 'Day 5', revenue: 340000, txCount: 13500 },
    { name: 'Day 10', revenue: 380000, txCount: 14000 },
    { name: 'Day 15', revenue: 410000, txCount: 16200 },
    { name: 'Day 20', revenue: 390000, txCount: 15100 },
    { name: 'Day 25', revenue: 435000, txCount: 17800 },
    { name: 'Day 30', revenue: 458920, txCount: 184290 }
  ];

  const growthData = [
    { name: 'Jan', customers: 850000, wallets: 1600000, kycRate: 91 },
    { name: 'Feb', customers: 920000, wallets: 1750000, kycRate: 93 },
    { name: 'Mar', customers: 990000, wallets: 1910000, kycRate: 92 },
    { name: 'Apr', customers: 1080000, wallets: 2100000, kycRate: 94 },
    { name: 'May', customers: 1150000, wallets: 2280000, kycRate: 96 },
    { name: 'Jun', customers: 1245820, wallets: 2450912, kycRate: 98 }
  ];

  const statusDistribution = [
    { name: 'Settled', value: 92 },
    { name: 'Pending', value: 6.8 },
    { name: 'Failed', value: 1.2 }
  ];

  const paymentMethods = [
    { name: 'ACH Transfer', value: 45, volume: '$20.6M' },
    { name: 'FedWire', value: 25, volume: '$11.4M' },
    { name: 'Swift Wire', value: 15, volume: '$6.8M' },
    { name: 'Visa/MC Debit', value: 10, volume: '$4.5M' },
    { name: 'Apple Pay', value: 5, volume: '$2.5M' }
  ];

  const countries = [
    { name: 'United States', percentage: 48 },
    { name: 'United Kingdom', percentage: 18 },
    { name: 'Germany', percentage: 12 },
    { name: 'Singapore', percentage: 10 },
    { name: 'Japan', percentage: 7 },
    { name: 'Others', percentage: 5 }
  ];

  const currencies = [
    { name: 'USD', value: 65, color: '#2563eb' },
    { name: 'EUR', value: 20, color: '#10b981' },
    { name: 'SGD', value: 10, color: '#f59e0b' },
    { name: 'GBP', value: 5, color: '#ec4899' }
  ];

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Live Integration Effect: Fetch real metrics from Backend REST API
  useEffect(() => {
    let active = true;
    const fetchLiveDashboard = async () => {
      try {
        const { apiClient } = await import('../api/client');
        
        // Fetch KPI Metrics
        try {
          const metricsRes = await apiClient.get('/dashboard/metrics');
          if (active && metricsRes.data && Array.isArray(metricsRes.data)) {
            setKpis(prev => prev.map(kpi => {
              const live = metricsRes.data.find((m: any) => m.id === kpi.id);
              if (live) {
                return {
                  ...kpi,
                  value: live.value,
                  numberVal: live.numberVal ?? kpi.numberVal,
                  trend: live.trend ?? kpi.trend,
                  trendDirection: live.trendDirection ?? kpi.trendDirection
                };
              }
              return kpi;
            }));
          }
        } catch (e) {
          console.debug('Dashboard metrics endpoint not found or unreachable', e);
        }

        // Fetch Live Operation Logs
        try {
          const logsRes = await apiClient.get<OperationLog[]>('/dashboard/live-stream');
          if (active && logsRes.data && Array.isArray(logsRes.data)) {
            setLogs(logsRes.data);
          }
        } catch (e) {
          console.debug('Dashboard live-stream endpoint not found or unreachable', e);
        }

        // Fetch System status
        try {
          const systemRes = await apiClient.get('/dashboard/system-status');
          if (active && systemRes.data) {
            setSystemUptimes(prev => ({
              ...prev,
              ...systemRes.data
            }));
          }
        } catch (e) {
          console.debug('Dashboard system-status endpoint not found or unreachable', e);
        }

      } catch (err) {
        console.warn('Backend REST API currently unreachable. Dashboard running in self-contained simulation mode.', err);
      }
    };

    fetchLiveDashboard();
    // Poll every 10 seconds if live updates are enabled
    const pollInterval = setInterval(() => {
      if (isLiveUpdating) {
        fetchLiveDashboard();
      }
    }, 10000);

    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [isLiveUpdating]);

  // Real-time ticking simulation effect
  useEffect(() => {
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      // 1. Randomly update minor KPI values slightly
      setKpis(prevKpis => prevKpis.map(kpi => {
        if (kpi.id === 'api-health' || kpi.id === 'system-health') return kpi;

        // Minor changes with subtle randomness
        const multiplier = Math.random() > 0.4 ? 1 : -1;
        const pctChange = (Math.random() * 0.1) * multiplier; // Max 0.1% change
        let nextNum = kpi.numberVal * (1 + pctChange / 100);

        // Format rules based on card type
        let formattedVal = '';
        if (kpi.id.includes('revenue') || kpi.id === 'avg-tx-value' || kpi.id === 'processing-volume') {
          formattedVal = '$' + Math.round(nextNum).toLocaleString();
          if (kpi.id === 'avg-tx-value') {
            formattedVal = '$' + nextNum.toFixed(2);
          }
        } else if (kpi.id.includes('rate') || kpi.id.includes('health')) {
          nextNum = Math.min(100, Math.max(90, nextNum));
          formattedVal = nextNum.toFixed(2) + '%';
        } else {
          formattedVal = Math.round(nextNum).toLocaleString();
        }

        return {
          ...kpi,
          numberVal: nextNum,
          value: formattedVal
        };
      }));

      // 2. Fluctuating CPU / Memory logs
      setSystemUptimes(prev => {
        const nextCpu = Math.min(95, Math.max(8, prev.cpu.load + Math.floor(Math.random() * 9 - 4)));
        const nextMemory = Math.min(90, Math.max(45, prev.memory.load + Math.floor(Math.random() * 3 - 1)));
        const dbLatency = `${Math.max(3, 8 + Math.floor(Math.random() * 5 - 2))}ms`;
        const apiLatency = `${Math.max(35, 42 + Math.floor(Math.random() * 15 - 7))}ms`;

        return {
          ...prev,
          cpu: { ...prev.cpu, load: nextCpu },
          memory: { ...prev.memory, load: nextMemory },
          database: { ...prev.database, latency: dbLatency, load: Math.max(5, prev.database.load + Math.floor(Math.random() * 5 - 2)) },
          api: { ...prev.api, latency: apiLatency, load: Math.max(10, prev.api.load + Math.floor(Math.random() * 9 - 4)) }
        };
      });

      // 3. Occasionally feed a new live transaction or heartbeat into log list (15% chance)
      if (Math.random() > 0.82) {
        const timestamp = new Date().toTimeString().split(' ')[0];
        const logTypes: Array<OperationLog['type']> = ['transaction', 'kyc', 'support', 'fraud', 'failed_payment', 'admin_action', 'login'];
        const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
        
        let newLog: OperationLog = {
          id: `log-${Date.now()}`,
          timestamp,
          type: randomType,
          title: 'Direct API Operation Logged',
          detail: 'Webhooks executed securely from recognized API container nodes.',
          status: 'success',
          user: 'API-ROUTER'
        };

        if (randomType === 'transaction') {
          const amt = Math.floor(Math.random() * 25000 + 100);
          const isUp = Math.random() > 0.3;
          newLog = {
            id: `log-${Date.now()}`,
            timestamp,
            type: 'transaction',
            title: isUp ? 'Payment Ledger Credited' : 'Merchant Sweep Settled',
            detail: `${isUp ? 'ACH Deposit clearing' : 'Outbound corporate sweep'} executed`,
            status: 'success',
            amount: `${isUp ? '' : '-'}$${amt.toLocaleString()}`,
            user: isUp ? 'Stripe Gateway' : 'Airwallex Bank'
          };
          
          // Instantly bump revenue/transaction counts accordingly
          setKpis(prev => prev.map(k => {
            if (k.id === 'revenue-today' && isUp) {
              return { ...k, numberVal: k.numberVal + amt, value: '$' + Math.round(k.numberVal + amt).toLocaleString() };
            }
            if (k.id === 'daily-transactions') {
              return { ...k, numberVal: k.numberVal + 1, value: Math.round(k.numberVal + 1).toLocaleString() };
            }
            return k;
          }));
        } else if (randomType === 'failed_payment') {
          const amt = Math.floor(Math.random() * 8000 + 20);
          newLog = {
            id: `log-${Date.now()}`,
            timestamp,
            type: 'failed_payment',
            title: 'Gateway Denied Transaction',
            detail: 'Declined: Card issuer code 54 (Expired Card attempt)',
            status: 'failed',
            amount: `$${amt.toLocaleString()}`,
            user: 'Visa Credit'
          };
          setKpis(prev => prev.map(k => {
            if (k.id === 'failed-transactions') {
              return { ...k, numberVal: k.numberVal + 1, value: Math.round(k.numberVal + 1).toLocaleString() };
            }
            return k;
          }));
        } else if (randomType === 'fraud') {
          newLog = {
            id: `log-${Date.now()}`,
            timestamp,
            type: 'fraud',
            title: 'Anomalous Location Access',
            detail: 'Simultaneous login attempts from remote VPN IPs (Security flagged)',
            status: 'warning',
            user: 'Risk Engine'
          };
          setKpis(prev => prev.map(k => {
            if (k.id === 'fraud-alerts') {
              return { ...k, numberVal: k.numberVal + 1, value: Math.round(k.numberVal + 1).toLocaleString() };
            }
            return k;
          }));
        }

        setLogs(prev => [newLog, ...prev.slice(0, 15)]);
      }

    }, 2800);

    return () => clearInterval(interval);
  }, [isLiveUpdating]);

  // Click handler on KPI cards to execute filters or UI interactions
  const handleKpiCardClick = (kpiId: string) => {
    // Alert the user with a beautiful toast or change active view filter
    console.log(`Focused KPI context: ${kpiId}`);
    if (kpiId.includes('customer') || kpiId.includes('kyc')) {
      setOperationFilter('kyc');
      setActiveChartGroup('growth');
    } else if (kpiId.includes('transaction') || kpiId.includes('revenue') || kpiId === 'processing-volume') {
      setOperationFilter('transaction');
      setActiveChartGroup('financial');
    } else if (kpiId.includes('fraud') || kpiId.includes('frozen') || kpiId === 'api-health') {
      setOperationFilter('fraud');
      setActiveChartGroup('operations');
    } else if (kpiId === 'support-queue') {
      setOperationFilter('support');
      setActiveChartGroup('operations');
    }
  };

  // Callback from Quick Actions
  const handleQuickActionSubmit = (data: any) => {
    const timestamp = new Date().toTimeString().split(' ')[0];
    const userEmail = "tilok.mania@gmail.com";
    
    // Add custom logs based on action
    let logTitle = '';
    let logDetail = '';
    let logType: OperationLog['type'] = 'admin_action';
    let logStatus: OperationLog['status'] = 'completed';

    switch (activeQuickAction) {
      case 'create_user':
        logTitle = 'Customer Identity Created';
        logDetail = `Account opened for ${data.name || 'Anonymous'} (${data.country || 'Global'}). Sandbox profile activated.`;
        logType = 'admin_action';
        // Bump customer counter
        setKpis(prev => prev.map(k => {
          if (k.id === 'total-customers') {
            const nv = k.numberVal + 1;
            return { ...k, numberVal: nv, value: nv.toLocaleString() };
          }
          return k;
        }));
        break;
      case 'freeze_wallet':
        logTitle = 'Wallet Frozen by Operations';
        logDetail = `Wallet Address ${data.address || '0xWallet...'} locked. All settlement channels terminated. Reason: ${data.reason || 'Verification Required'}`;
        logType = 'fraud';
        logStatus = 'warning';
        // Bump frozen accounts counter
        setKpis(prev => prev.map(k => {
          if (k.id === 'frozen-accounts') {
            const nv = k.numberVal + 1;
            return { ...k, numberVal: nv, value: nv.toLocaleString() };
          }
          return k;
        }));
        break;
      case 'approve_kyc':
        logTitle = 'Compliance Approved Record';
        logDetail = `Verified KYC application #KYC-${data.id || '9921'}. Identity confirmed.`;
        logType = 'kyc';
        logStatus = 'success';
        // Update counters
        setKpis(prev => prev.map(k => {
          if (k.id === 'verified-customers') {
            const nv = k.numberVal + 1;
            return { ...k, numberVal: nv, value: nv.toLocaleString() };
          }
          if (k.id === 'pending-kyc') {
            const nv = Math.max(0, k.numberVal - 1);
            return { ...k, numberVal: nv, value: nv.toLocaleString() };
          }
          return k;
        }));
        break;
      case 'issue_card':
        logTitle = 'Virtual Visa Issued';
        logDetail = `Assigned new multi-currency active card to user with monthly limit $${data.limit || '5,000'}.`;
        logType = 'admin_action';
        // Bump virtual cards counter
        setKpis(prev => prev.map(k => {
          if (k.id === 'virtual-cards') {
            const nv = k.numberVal + 1;
            return { ...k, numberVal: nv, value: nv.toLocaleString() };
          }
          return k;
        }));
        break;
      case 'refund_transaction':
        const refAmt = parseFloat(data.amount || '0');
        logTitle = 'Reversal Ledger Clearance';
        logDetail = `Issued immediate credit reversal for transaction ref #${data.refId || 'TX-902'}. Status Settled.`;
        logType = 'transaction';
        logStatus = 'resolved';
        // Adjust revenue
        setKpis(prev => prev.map(k => {
          if (k.id === 'revenue-today') {
            const nv = Math.max(0, k.numberVal - refAmt);
            return { ...k, numberVal: nv, value: '$' + Math.round(nv).toLocaleString() };
          }
          return k;
        }));
        break;
      case 'create_admin':
        logTitle = 'IAM Security Policy Granted';
        logDetail = `Admin privilege role was provisioned securely for email: ${data.email || 'operator@walletpro.co'}.`;
        logType = 'admin_action';
        break;
      case 'open_support':
        logTitle = 'Priority Helpdesk Opened';
        logDetail = `Ticket #${Math.floor(10000 + Math.random()*90000)}: "${data.subject || 'L2 Webhook delay'}" assigned.`;
        logType = 'support';
        logStatus = 'pending';
        // Bump support count
        setKpis(prev => prev.map(k => {
          if (k.id === 'support-queue') {
            const nv = k.numberVal + 1;
            return { ...k, numberVal: nv, value: nv.toLocaleString() };
          }
          return k;
        }));
        break;
      case 'broadcast_notification':
        logTitle = 'Global Push Broadcasted';
        logDetail = `Delivered secure system notification to all mobile & web sessions: "${data.message || 'Scheduled platform maintenance'}"`;
        logType = 'admin_action';
        break;
      case 'sys_config':
        logTitle = 'Global System Limit Shifted';
        logDetail = `Max velocity set to $${parseFloat(data.max_limit || '150000').toLocaleString()}. Global reserve ratio adjusted to ${data.buffer_ratio || '15'}%.`;
        logType = 'admin_action';
        logStatus = 'completed';
        break;
      case 'flag_user':
        logTitle = 'Compliance Alert Watchlist Flag';
        logDetail = `User account under email ${data.email || 'suspicious@operator.com'} was flagged for immediate AML auditing velocity scan.`;
        logType = 'fraud';
        logStatus = 'warning';
        // Bump fraud alerts counter
        setKpis(prev => prev.map(k => {
          if (k.id === 'fraud-alerts') {
            const nv = k.numberVal + 1;
            return { ...k, numberVal: nv, value: nv.toLocaleString() };
          }
          return k;
        }));
        break;
      case 'treasury_sweep':
        logTitle = 'Treasury Liquidity Clear';
        logDetail = `Cleared sweep of $${parseFloat(data.sweep_amount || '4500000').toLocaleString()} to routing bank account: ${data.routing || 'JP_MORGAN'}.`;
        logType = 'transaction';
        logStatus = 'completed';
        break;
    }

    const manualLog: OperationLog = {
      id: `log-manual-${Date.now()}`,
      timestamp,
      type: logType,
      title: logTitle,
      detail: logDetail,
      status: logStatus,
      amount: data.amount ? `-$${parseFloat(data.amount).toLocaleString()}` : undefined,
      user: userEmail
    };

    setLogs(prev => [manualLog, ...prev]);
    setActiveQuickAction(null);

    if (addToast) {
      addToast('Command Executed', logTitle, 'success');
    }
  };

  // Interactive alert dismissal handler
  const handleAcknowledgeAlert = (alertId: string) => {
    setExecutiveAlerts(prev => prev.filter(a => a.id !== alertId));
    if (addToast) {
      addToast('Alert Safely Archived', 'Regional operational threat has been audited and signed.', 'success');
    }
  };

  // Interactive resolutions directly on operational items
  const handleResolveKyc = (logId: string, approve: boolean) => {
    setLogs(prev => prev.map(l => {
      if (l.id === logId) {
        return {
          ...l,
          title: approve ? 'KYC Approved & Certified' : 'KYC Rejected - Incomplete Data',
          detail: approve ? 'Identity verified by operational override.' : 'Denied by operations team override.',
          status: approve ? 'success' : 'failed'
        };
      }
      return l;
    }));

    if (approve) {
      setKpis(prev => prev.map(k => {
        if (k.id === 'verified-customers') {
          const nv = k.numberVal + 1;
          return { ...k, numberVal: nv, value: nv.toLocaleString() };
        }
        if (k.id === 'pending-kyc') {
          const nv = Math.max(0, k.numberVal - 1);
          return { ...k, numberVal: nv, value: nv.toLocaleString() };
        }
        return k;
      }));
    }
  };

  const handleResolveSupport = (logId: string) => {
    setLogs(prev => prev.map(l => {
      if (l.id === logId) {
        return {
          ...l,
          title: 'Ticket Resolved & Closed',
          detail: 'Ops operator manually set ticket state to closed.',
          status: 'resolved'
        };
      }
      return l;
    }));

    setKpis(prev => prev.map(k => {
      if (k.id === 'support-queue') {
        const nv = Math.max(0, k.numberVal - 1);
        return { ...k, numberVal: nv, value: nv.toLocaleString() };
      }
      return k;
    }));
  };

  const handleResolveFraudAlert = (logId: string, action: 'block' | 'clear') => {
    setLogs(prev => prev.map(l => {
      if (l.id === logId) {
        return {
          ...l,
          title: action === 'block' ? 'Threat Isolated - Wallet Terminated' : 'Threat Cleared - False Positive',
          detail: action === 'block' ? 'Security policy locked down associated profile credentials.' : 'Operator verified IP signature as benign travel route.',
          status: action === 'block' ? 'failed' : 'success'
        };
      }
      return l;
    }));

    if (action === 'block') {
      setKpis(prev => prev.map(k => {
        if (k.id === 'frozen-accounts') {
          const nv = k.numberVal + 1;
          return { ...k, numberVal: nv, value: nv.toLocaleString() };
        }
        if (k.id === 'fraud-alerts') {
          const nv = Math.max(0, k.numberVal - 1);
          return { ...k, numberVal: nv, value: nv.toLocaleString() };
        }
        return k;
      }));
    } else {
      setKpis(prev => prev.map(k => {
        if (k.id === 'fraud-alerts') {
          const nv = Math.max(0, k.numberVal - 1);
          return { ...k, numberVal: nv, value: nv.toLocaleString() };
        }
        return k;
      }));
    }
  };

  // Filtered operational list
  const filteredLogs = logs.filter(log => {
    if (operationFilter !== 'all' && log.type !== operationFilter) return false;
    if (operationSearch) {
      const q = operationSearch.toLowerCase();
      return log.title.toLowerCase().includes(q) || 
             log.detail.toLowerCase().includes(q) || 
             (log.user && log.user.toLowerCase().includes(q));
    }
    return true;
  });

  // Filtered KPIs (Top 6 primary vs 13 additional)
  const primaryKpiIds = ['revenue-today', 'total-customers', 'processing-volume', 'pending-kyc', 'fraud-alerts', 'system-health'];
  
  const primaryKpis = kpis.filter(kpi => primaryKpiIds.includes(kpi.id))
    .filter(kpi => {
      if (activeKpiCategory !== 'all' && kpi.category !== activeKpiCategory) return false;
      return true;
    });

  const additionalKpis = kpis.filter(kpi => !primaryKpiIds.includes(kpi.id))
    .filter(kpi => {
      if (activeKpiCategory !== 'all' && kpi.category !== activeKpiCategory) return false;
      return true;
    });

  const isDevelopment = (import.meta as any).env?.MODE === 'development' || (import.meta as any).env?.DEV || false;
  const showDevTools = isDevelopment && activeRole === 'Developer';

  return (
    <div id="executive-dashboard-panel" className="grid grid-cols-12 gap-6 select-none">
      {/* LEFT 9 COLUMNS: Main Controls, KPIs, Recharts, and running log stream */}
      <div className="col-span-12 xl:col-span-9 flex flex-col gap-6 pr-2">
        
        {/* TOP STATUS AND CONTROL STRIP */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex flex-wrap justify-between items-center gap-4">
          {showDevTools ? (
            <div className="flex items-center gap-2.5 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveUpdating ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveUpdating ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isLiveUpdating ? 'Platform Live Stream Active' : 'Live Stream Paused'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Authoritative Master Ledger Node: <strong className="text-blue-600 font-bold">online_4.21.99</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div>
                <p className="text-xs font-bold text-slate-800">Enterprise Core Engine Status Stable</p>
                <p className="text-[10px] text-slate-400 font-mono">Production Grade Ledger Cluster Running</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            {/* Developer Mode Toggle (Only visible in Dev env to Developer role) */}
            {showDevTools && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg select-none">
                <span className="text-[9px] font-bold text-slate-400 font-mono">SIMULATOR</span>
                <button
                  onClick={() => setIsDevMode(!isDevMode)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    isDevMode ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle Simulator Mode"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
                      isDevMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-[10px] font-bold text-slate-700">
                  {isDevMode ? 'Sandbox ON' : 'Sandbox OFF'}
                </span>
              </div>
            )}

            {/* Quick Simulation Debug Controls - ONLY visible when isDevMode is active */}
            {showDevTools && isDevMode && (
              <div className="flex items-center gap-2 animate-fade-in">
                {/* Live Toggling */}
                <button
                  onClick={() => setIsLiveUpdating(!isLiveUpdating)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer min-h-[30px] ${
                    isLiveUpdating 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                  }`}
                >
                  {isLiveUpdating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isLiveUpdating ? 'Pause Simulator' : 'Resume Simulator'}
                </button>

                {/* Simulated Error Toggling */}
                <button
                  onClick={() => {
                    setErrorSimulationMode(!errorSimulationMode);
                    if (!errorSimulationMode) {
                      setKpis(prev => prev.map((k, idx) => idx % 4 === 0 ? { ...k, error: true } : k));
                    } else {
                      setKpis(prev => prev.map(k => ({ ...k, error: false })));
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer min-h-[30px] ${
                    errorSimulationMode 
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {errorSimulationMode ? 'Restore Health' : 'Trigger Mock Error'}
                </button>

                {/* Simulated Loading State */}
                <button
                  onClick={() => {
                    setLoadingSimulationMode(true);
                    setKpis(prev => prev.map(k => ({ ...k, loading: true })));
                    setTimeout(() => {
                      setLoadingSimulationMode(false);
                      setKpis(prev => prev.map(k => ({ ...k, loading: false })));
                    }, 1400);
                  }}
                  disabled={loadingSimulationMode}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer min-h-[30px] ${
                    loadingSimulationMode 
                      ? 'bg-blue-50 text-blue-400 border-blue-100 cursor-not-allowed' 
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${loadingSimulationMode ? 'animate-spin' : ''}`} />
                  Trigger Loader
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HIGH DENSITY KPI SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-100 p-1.5 rounded-lg border border-slate-200/60 max-w-lg">
            {[
              { id: 'all', name: 'All KPIs' },
              { id: 'financial', name: 'Financials' },
              { id: 'customers', name: 'Identity' },
              { id: 'wallets', name: 'Wallets & Cards' },
              { id: 'operations', name: 'Risk & Health' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveKpiCategory(cat.id as any)}
                className={`flex-1 text-center py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  activeKpiCategory === cat.id
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 1. PRIMARY TOP 6 KPIs GRID */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
              Core Executive Indicators
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <AnimatePresence mode="popLayout">
                {primaryKpis.map((kpi) => {
                  const IconComp = kpi.icon;
                  const isTrendPositive = kpi.trendDirection === 'up' && kpi.trend > 0;
                  const isTrendNegative = kpi.trendDirection === 'down' || kpi.trend < 0;
                  
                  return (
                    <motion.div
                      layout
                      key={kpi.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`KPI card for ${kpi.name}. Current value is ${kpi.value}.`}
                      onClick={() => handleKpiCardClick(kpi.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleKpiCardClick(kpi.id); } }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      className="bg-white border border-slate-200/70 hover:border-blue-400 rounded-xl p-3.5 shadow-xs flex flex-col justify-between cursor-pointer relative overflow-hidden transition-all group focus-visible:ring-2 focus-visible:ring-blue-500 outline-none select-none"
                    >
                      {/* Glow effect on real-time ticking value */}
                      <div className="absolute inset-0 bg-blue-500/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[100px]">
                          {kpi.name}
                        </span>
                        <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Skeletons and Errors */}
                      {kpi.loading ? (
                        <div className="space-y-1.5 my-1">
                          <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
                          <div className="h-3 w-16 bg-slate-50 rounded animate-pulse" />
                        </div>
                      ) : kpi.error ? (
                        <div className="my-1.5 py-1 text-[10px] text-red-500 font-bold bg-red-50 border border-red-100/60 rounded flex items-center justify-center gap-1 font-mono">
                          <AlertOctagon className="w-3 h-3 text-red-600" />
                          NODE_CONN_ERR
                        </div>
                      ) : (
                        <div className="my-1">
                          <span className="text-lg font-bold font-display tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                            {kpi.value}
                          </span>

                          {/* Trend line */}
                          <div className="flex items-center gap-1 mt-1 text-[9px] font-mono font-medium">
                            {isTrendPositive && (
                              <span className="text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-md flex items-center">
                                <ArrowUpRight className="w-2.5 h-2.5" />
                                +{kpi.trend}%
                              </span>
                            )}
                            {isTrendNegative && (
                              <span className="text-red-600 bg-red-50 px-1 py-0.2 rounded-md flex items-center">
                                <ArrowDownRight className="w-2.5 h-2.5" />
                                {kpi.trend}%
                              </span>
                            )}
                            {kpi.trend === 0 && (
                              <span className="text-slate-500 bg-slate-100 px-1 py-0.2 rounded-md flex items-center">
                                STABLE
                              </span>
                            )}
                            <span className="text-slate-400 text-[8px] truncate">
                              {kpi.comparison}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Last updated timestamp */}
                      <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mt-2 border-t border-slate-50 pt-1.5">
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                          Synced: Just now
                        </span>
                        <span>SYS-EXEC</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* EXPANDABLE TRIGGER FOR OTHER KPIs */}
          {additionalKpis.length > 0 && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setIsKpiExpanded(!isKpiExpanded)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer select-none min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              >
                {isKpiExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                    Hide {additionalKpis.length} Additional Operational Metrics
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-slate-500 animate-bounce" />
                    Expand {additionalKpis.length} Additional Operational Metrics
                  </>
                )}
              </button>
            </div>
          )}

          {/* 2. ADDITIONAL KPIs DRAWER */}
          {additionalKpis.length > 0 && isKpiExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-2 border-t border-slate-100"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                Secondary Operational Metrics
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <AnimatePresence mode="popLayout">
                  {additionalKpis.map((kpi) => {
                    const IconComp = kpi.icon;
                    const isTrendPositive = kpi.trendDirection === 'up' && kpi.trend > 0;
                    const isTrendNegative = kpi.trendDirection === 'down' || kpi.trend < 0;
                    
                    return (
                      <motion.div
                        layout
                        key={kpi.id}
                        tabIndex={0}
                        role="button"
                        aria-label={`KPI card for ${kpi.name}. Current value is ${kpi.value}.`}
                        onClick={() => handleKpiCardClick(kpi.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleKpiCardClick(kpi.id); } }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ y: -2, transition: { duration: 0.15 } }}
                        className="bg-white border border-slate-200/70 hover:border-blue-400 rounded-xl p-3.5 shadow-xs flex flex-col justify-between cursor-pointer relative overflow-hidden transition-all group focus-visible:ring-2 focus-visible:ring-blue-500 outline-none select-none"
                      >
                        {/* Glow effect on real-time ticking value */}
                        <div className="absolute inset-0 bg-blue-500/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[100px]">
                            {kpi.name}
                          </span>
                          <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Skeletons and Errors */}
                        {kpi.loading ? (
                          <div className="space-y-1.5 my-1">
                            <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
                            <div className="h-3 w-16 bg-slate-50 rounded animate-pulse" />
                          </div>
                        ) : kpi.error ? (
                          <div className="my-1.5 py-1 text-[10px] text-red-500 font-bold bg-red-50 border border-red-100/60 rounded flex items-center justify-center gap-1 font-mono">
                            <AlertOctagon className="w-3 h-3 text-red-600" />
                            NODE_CONN_ERR
                          </div>
                        ) : (
                          <div className="my-1">
                            <span className="text-lg font-bold font-display tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                              {kpi.value}
                            </span>

                            {/* Trend line */}
                            <div className="flex items-center gap-1 mt-1 text-[9px] font-mono font-medium">
                              {isTrendPositive && (
                                <span className="text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded-md flex items-center">
                                  <ArrowUpRight className="w-2.5 h-2.5" />
                                  +{kpi.trend}%
                                </span>
                              )}
                              {isTrendNegative && (
                                <span className="text-red-600 bg-red-50 px-1 py-0.2 rounded-md flex items-center">
                                  <ArrowDownRight className="w-2.5 h-2.5" />
                                  {kpi.trend}%
                                </span>
                              )}
                              {kpi.trend === 0 && (
                                <span className="text-slate-500 bg-slate-100 px-1 py-0.2 rounded-md flex items-center">
                                  STABLE
                                </span>
                              )}
                              <span className="text-slate-400 text-[8px] truncate">
                                {kpi.comparison}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Last updated timestamp */}
                        <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 mt-2 border-t border-slate-50 pt-1.5">
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                            Synced: Just now
                          </span>
                          <span>SYS-EXEC</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* RECHARTS DATA VISUALIZATIONS SECTION */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-xs text-slate-800 font-display uppercase tracking-widest flex items-center gap-2">
                <span>Operation Intelligence Visualizers</span>
                <span className="bg-blue-100 text-blue-700 text-[8px] px-1.5 py-0.5 rounded font-bold font-mono">
                  AUTO-RESOLVE PING
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Live charts represent combined streaming volume traces from all border nodes.</p>
            </div>

            {/* Chart Group Selectors */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {[
                { id: 'financial', name: 'Volume & Financials' },
                { id: 'growth', name: 'Customer & Growth' },
                { id: 'operations', name: 'Operations & Health' }
              ].map(grp => (
                <button
                  key={grp.id}
                  onClick={() => setActiveChartGroup(grp.id as any)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    activeChartGroup === grp.id
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {grp.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 grid grid-cols-12 gap-6 min-h-[340px]">
            {activeChartGroup === 'financial' && (
              <>
                {/* Chart 1: Revenue (30 days) */}
                <div className="col-span-12 lg:col-span-8 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Revenue Trace Today (30 Days Area)
                  </span>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenue30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} 
                          formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Top Currency Usage */}
                <div className="col-span-12 lg:col-span-4 space-y-2 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <CircleDot className="w-3.5 h-3.5 text-emerald-500" /> Currency Volume Ratio (Donut)
                  </span>
                  <div className="h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currencies}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {currencies.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Volume Share']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-100 pt-3">
                    {currencies.map((cur) => (
                      <div key={cur.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cur.color }} />
                        <span className="font-bold text-slate-700">{cur.name}</span>
                        <span className="text-slate-400">({cur.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra row for Financials */}
                {/* Chart 3: Transaction Volume */}
                <div className="col-span-12 lg:col-span-6 space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" /> Transaction Swarm Volume (Bar Chart)
                  </span>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenue30Days} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                          formatter={(value: any) => [value.toLocaleString() + ' txs', 'Transactions']}
                        />
                        <Bar dataKey="txCount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 4: Payment Methods Distribution */}
                <div className="col-span-12 lg:col-span-6 space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-pink-500" /> Route Channel Performance
                  </span>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={paymentMethods} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                          formatter={(value: any, name, props) => [`${value}% share (${props.payload.volume})`, 'Route Share']}
                        />
                        <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {activeChartGroup === 'growth' && (
              <>
                {/* Chart 5: Customer Growth */}
                <div className="col-span-12 lg:col-span-6 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Customer Growth curve
                  </span>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Users']} />
                        <Line type="monotone" dataKey="customers" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 6: Wallet Growth */}
                <div className="col-span-12 lg:col-span-6 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-500" /> Wallet Growth curve
                  </span>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Wallets']} />
                        <Line type="monotone" dataKey="wallets" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 7: KYC Approval Rate */}
                <div className="col-span-12 lg:col-span-6 space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500" /> Compliance KYC Approval Rate (Area %)
                  </span>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorKyc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} domain={[80, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'KYC Pass Rate']} />
                        <Area type="monotone" dataKey="kycRate" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorKyc)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 8: Country Distribution */}
                <div className="col-span-12 lg:col-span-6 space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Settings className="w-3.5 h-3.5 text-purple-500" /> Regional Node Distribution (%)
                  </span>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={countries} margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                        <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} />
                        <Tooltip formatter={(value) => [`${value}%`, 'User Ratio']} />
                        <Bar dataKey="percentage" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {activeChartGroup === 'operations' && (
              <>
                {/* Chart 9: Support Volume */}
                <div className="col-span-12 lg:col-span-7 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" /> Incoming Support Ticket Trends (Bar)
                  </span>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Mon', tickets: 18 },
                        { name: 'Tue', tickets: 22 },
                        { name: 'Wed', tickets: 14 },
                        { name: 'Thu', tickets: 16 },
                        { name: 'Fri', tickets: 12 },
                        { name: 'Sat', tickets: 5 },
                        { name: 'Sun', tickets: 7 }
                      ]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip formatter={(value) => [value, 'Tickets']} />
                        <Bar dataKey="tickets" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 10: Transaction Status Ratio */}
                <div className="col-span-12 lg:col-span-5 space-y-2 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Global Ledger Settlement Status
                  </span>
                  <div className="h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Ledger Status Ratio']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono border-t border-slate-100 pt-3">
                    {statusDistribution.map((st, idx) => (
                      <div key={st.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="font-bold text-slate-700">{st.name}</span>
                        <span className="text-slate-400">({st.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* LIVE REAL-TIME OPERATIONS PANEL */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-xs text-slate-800 font-display uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-500" /> 
                <span>Operational Activity Ledger</span>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                  STRICT_TLS_V1.3
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Click operations rows to resolve warnings, approve compliance audits, or issue fast reversals.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dynamic Sub-Filter Search */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Query trace logs..."
                  value={operationSearch}
                  onChange={(e) => setOperationSearch(e.target.value)}
                  className="bg-white border border-slate-200 text-[10px] font-medium rounded-lg py-1 px-8 w-44 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* Log Categories */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {[
                  { id: 'all', name: 'All' },
                  { id: 'transaction', name: 'Txs' },
                  { id: 'kyc', name: 'KYC' },
                  { id: 'support', name: 'Tickets' },
                  { id: 'fraud', name: 'Risks' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setOperationFilter(cat.id as any)}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                      operationFilter === cat.id
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Running Logs list with detailed actions */}
          <div className="divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 hover:bg-slate-50/70 transition-all flex items-start justify-between gap-4 select-text"
                  >
                    <div className="flex items-start gap-3">
                      {/* Interactive indicator color */}
                      <span className="text-[10px] text-slate-400 font-mono pt-0.5 whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.timestamp}
                      </span>
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800 tracking-tight">
                            {log.title}
                          </span>
                          {/* Log Badge */}
                          <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold font-mono ${
                            log.type === 'transaction' ? 'bg-blue-50 text-blue-700 border border-blue-100/60' :
                            log.type === 'kyc' ? 'bg-amber-50 text-amber-700 border border-amber-100/60' :
                            log.type === 'fraud' ? 'bg-red-50 text-red-700 border border-red-100/60' :
                            log.type === 'failed_payment' ? 'bg-orange-50 text-orange-700 border border-orange-100/60' :
                            log.type === 'support' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/60' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {log.type}
                          </span>
                          
                          {/* Log Status */}
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            log.status === 'success' || log.status === 'completed' || log.status === 'resolved' ? 'bg-emerald-500' :
                            log.status === 'pending' ? 'bg-amber-400' : 'bg-red-500'
                          }`} />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {log.detail}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                          <span>Identity context: <strong className="text-slate-600 font-medium">{log.user || 'Unknown'}</strong></span>
                          <span>•</span>
                          <span>Trace Token: <strong className="text-slate-500">{log.id.slice(0, 12)}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right side actions based on Log Type */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {log.amount && (
                        <span className={`text-xs font-mono font-bold ${log.amount.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>
                          {log.amount}
                        </span>
                      )}

                      {/* Interactive override buttons */}
                      <div className="flex items-center gap-1.5">
                        {log.type === 'kyc' && log.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleResolveKyc(log.id, true)}
                              className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleResolveKyc(log.id, false)}
                              className="px-2 py-0.5 text-[9px] font-bold bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 rounded transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {log.type === 'support' && log.status === 'pending' && (
                          <button
                            onClick={() => handleResolveSupport(log.id)}
                            className="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 rounded transition-colors cursor-pointer"
                          >
                            Resolve Ticket
                          </button>
                        )}
                        {log.type === 'fraud' && log.status === 'warning' && (
                          <>
                            <button
                              onClick={() => handleResolveFraudAlert(log.id, 'block')}
                              className="px-2 py-0.5 text-[9px] font-bold bg-red-600 text-white hover:bg-red-700 rounded transition-colors cursor-pointer"
                            >
                              Freeze Wallet
                            </button>
                            <button
                              onClick={() => handleResolveFraudAlert(log.id, 'clear')}
                              className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                            >
                              Dismiss Alert
                            </button>
                          </>
                        )}
                        
                        {/* Status text if resolved */}
                        {(log.status === 'success' || log.status === 'resolved' || log.status === 'completed') && (
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3 text-emerald-500" /> Settled
                          </span>
                        )}
                        {log.status === 'failed' && (
                          <span className="text-[10px] text-red-500 font-bold flex items-center gap-0.5">
                            <X className="w-3 h-3" /> Blocked
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <Terminal className="w-8 h-8 mx-auto stroke-1 opacity-25 mb-2" />
                  No system trace logs matching the current filter.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* RIGHT 3 COLUMNS: Status indicators, alerts sidebar, and Quick Actions deck */}
      <div className="col-span-12 xl:col-span-3 flex flex-col gap-6 pr-1">
        
        {/* QUICK ACTIONS DECK */}
        <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-widest font-display text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400 animate-pulse" /> Command Quick Actions
            </h3>
            <span className="text-[9px] bg-blue-900/50 text-blue-300 font-mono font-bold px-1.5 py-0.2 rounded border border-blue-800/40">
              SYS-EXEC
            </span>
          </div>

          {/* Unlocked status badge */}
          <div className="mb-3 px-2 py-1.5 bg-slate-850 border border-slate-800/60 rounded-lg flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">ACTIVE_CREDENTIAL:</span>
            <span className="text-blue-400 font-bold truncate max-w-[120px]">{activeRole}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              // Super Admin / Developer
              { id: 'create_admin', label: 'Create Admin', desc: 'IAM Access Scope', roles: ['Super Administrator', 'Platform Administrator', 'CEO', 'Executive Team', 'Developer'] },
              { id: 'sys_config', label: 'Configure System', desc: 'Global settings', roles: ['Super Administrator', 'Platform Administrator', 'CEO', 'Executive Team', 'Developer'] },

              // Operations
              { id: 'freeze_wallet', label: 'Freeze Wallet', desc: 'Secure asset lock', roles: ['Super Administrator', 'Platform Administrator', 'CEO', 'Executive Team', 'Operations Manager', 'Operations Agent', 'Developer'] },
              { id: 'issue_card', label: 'Issue Visa Card', desc: 'Instantiate token', roles: ['Super Administrator', 'Platform Administrator', 'CEO', 'Executive Team', 'Operations Manager', 'Operations Agent', 'Developer'] },
              
              // Compliance
              { id: 'approve_kyc', label: 'Approve KYC', desc: 'Manual review', roles: ['Super Administrator', 'Platform Administrator', 'CEO', 'Executive Team', 'Compliance Manager', 'Compliance Officer', 'Fraud Manager', 'Fraud Analyst', 'Developer'] },
              { id: 'flag_user', label: 'Flag User AML', desc: 'Compliance warn', roles: ['Super Administrator', 'Platform Administrator', 'CEO', 'Executive Team', 'Compliance Manager', 'Compliance Officer', 'Fraud Manager', 'Fraud Analyst', 'Developer'] },

              // Finance
              { id: 'refund_transaction', label: 'Refund Tx', desc: 'Reverse processing', roles: ['Super Administrator', 'Platform Administrator', 'CEO', 'Executive Team', 'Finance Manager', 'Finance Officer', 'Treasury Manager', 'Developer'] },
              { id: 'treasury_sweep', label: 'Treasury Sweep', desc: 'Liquidity balance', roles: ['Super Administrator', 'Platform Administrator', 'CEO', 'Executive Team', 'Finance Manager', 'Finance Officer', 'Treasury Manager', 'Developer'] },

              // Standard/Default Set (Always visible)
              { id: 'create_user', label: 'Create User', desc: 'New profile log', roles: [] },
              { id: 'open_support', label: 'Open Ticket', desc: 'Help queue assign', roles: [] },
              { id: 'broadcast_notification', label: 'Broadcast Info', desc: 'Global system push', roles: [] },
            ]
            .filter(act => act.roles.length === 0 || act.roles.includes(activeRole))
            .map(act => (
              <button
                key={act.id}
                onClick={() => setActiveQuickAction(act.id)}
                className="flex flex-col items-start p-2.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800/80 hover:border-blue-500/50 text-left transition-all cursor-pointer group min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                aria-label={`Execute command action ${act.label}`}
              >
                <span className="text-[10px] font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                  {act.label}
                </span>
                <span className="text-[8px] text-slate-500 font-mono mt-0.5 uppercase">
                  {act.desc}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 text-[8px] text-slate-500 font-mono text-center border-t border-slate-800/60 pt-2 flex items-center justify-center gap-1">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
            COMPLIANCE_LEVEL_4_LOGGING_ACTIVE
          </div>
        </div>

        {/* COMPREHENSIVE ALERTS SIDEBAR */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-widest font-display text-slate-800 flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-amber-500" /> Executive Monitor Alerts
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Critical signals trace directly to regional operational command nodes.</p>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {executiveAlerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 text-center bg-slate-50 border border-slate-150 rounded-lg"
                >
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">Operational Gateway Secure</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    All global microservices and currency tunnels are reporting standard latency boundaries. No alerts triggered.
                  </p>
                </motion.div>
              ) : (
                executiveAlerts.map(alert => {
                  let cardStyle = "bg-slate-50 border-slate-200/80";
                  let badgeStyle = "text-slate-750 bg-slate-100";
                  let iconColor = "text-slate-500";
                  let titleColor = "text-slate-800";

                  if (alert.severity === 'critical') {
                    cardStyle = "bg-red-50/70 border-red-150";
                    badgeStyle = "text-red-700 bg-red-100/70";
                    iconColor = "text-red-500";
                    titleColor = "text-red-950";
                  } else if (alert.severity === 'warning') {
                    cardStyle = "bg-amber-50/70 border-amber-150";
                    badgeStyle = "text-amber-700 bg-amber-100/70";
                    iconColor = "text-amber-500";
                    titleColor = "text-amber-950";
                  } else if (alert.severity === 'info') {
                    cardStyle = "bg-blue-50/70 border-blue-150";
                    badgeStyle = "text-blue-700 bg-blue-100/70";
                    iconColor = "text-blue-500";
                    titleColor = "text-blue-950";
                  }

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 15 }}
                      transition={{ duration: 0.25 }}
                      className={`p-3.5 border rounded-xl text-left space-y-2 overflow-hidden ${cardStyle}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${badgeStyle}`}>
                          {alert.severity}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {alert.time}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className={`text-[11px] font-bold leading-snug ${titleColor}`}>{alert.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-normal">{alert.desc}</p>
                      </div>

                      <div className="pt-1.5 border-t border-slate-200/50 flex flex-col gap-1 text-[9px] font-mono text-slate-500">
                        <div className="flex justify-between">
                          <span>SYSTEM:</span>
                          <span className="font-bold text-slate-700">{alert.system}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>OWNER:</span>
                          <span className="text-slate-600 truncate max-w-[150px]" title={alert.owner}>{alert.owner}</span>
                        </div>
                      </div>

                      {/* Contextual actions */}
                      <div className="pt-2 flex items-center justify-between gap-1.5">
                        {/* Left contextual control */}
                        {alert.id === 'alert-1' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                if (addToast) addToast('Emergency Halt Issued', 'Global clearing rails paused under CEO authority.', 'error');
                              }}
                              className="text-[9px] bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded transition-colors cursor-pointer min-h-[28px] flex items-center"
                            >
                              Halt Rails
                            </button>
                            <button
                              onClick={() => {
                                if (addToast) addToast('PCI Audit Triggered', 'PCI system core verification logs generated.', 'info');
                              }}
                              className="text-[9px] bg-slate-200 hover:bg-slate-300 text-slate-750 font-bold px-2 py-1 rounded transition-colors cursor-pointer min-h-[28px] flex items-center"
                            >
                              Verify Logs
                            </button>
                          </div>
                        )}

                        {alert.id === 'alert-2' && (
                          <button
                            onClick={() => {
                              if (addToast) addToast('Cluster Scaled', 'Added node #10 to Redis cache cluster.', 'success');
                            }}
                            className="text-[9px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-1 rounded transition-colors cursor-pointer min-h-[28px] flex items-center"
                          >
                            Scale Node #10
                          </button>
                        )}

                        {alert.id === 'alert-3' && (
                          <button
                            onClick={() => {
                              if (addToast) addToast('Postures Verified', 'All regional TLS keys matching master root hash.', 'success');
                            }}
                            className="text-[9px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2 py-1 rounded transition-colors cursor-pointer min-h-[28px] flex items-center"
                          >
                            Audit Signature
                          </button>
                        )}

                        {/* Standard Acknowledge dismiss */}
                        <button
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="text-[9px] hover:bg-slate-200 border border-slate-300 hover:border-slate-400 text-slate-600 font-medium px-2 py-1 rounded transition-all cursor-pointer ml-auto min-h-[28px] flex items-center gap-1"
                          aria-label={`Acknowledge alert: ${alert.title}`}
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          Acknowledge
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>

            {/* 6. Scheduled Jobs */}
            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block mb-2">
                Active Scheduled Cron Jobs
              </span>
              <div className="space-y-1.5 text-[10px] font-mono text-slate-600">
                <div className="flex justify-between items-center">
                  <span>• compliance-scan</span>
                  <span className="text-emerald-600 font-bold">Every 5m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• treasury-sweep-settlement</span>
                  <span className="text-emerald-600 font-bold">Hourly</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• kyc-velocity-cleaner</span>
                  <span className="text-blue-600">Daily 00:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>• backup-spanner-snapshot</span>
                  <span className="text-blue-600">Daily 04:00</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DENSE SYSTEM HEALTH MONITOR */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-widest font-display text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500" /> Infrastructure Node Status
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Real-time health telemetry across server borders.</p>
          </div>

          <div className="space-y-3.5 text-xs font-mono font-medium">
            {/* DB */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                  <Database className="w-3.5 h-3.5 text-blue-500" /> Database Cluster
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded">
                  {systemUptimes.database.uptime}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Latency: {systemUptimes.database.latency}</span>
                <span>Load: {systemUptimes.database.load}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${systemUptimes.database.load}%` }} />
              </div>
            </div>

            {/* Redis */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                  <Server className="w-3.5 h-3.5 text-red-500" /> Redis Cluster Cache
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded">
                  {systemUptimes.redis.uptime}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Latency: {systemUptimes.redis.latency}</span>
                <span>Load: {systemUptimes.redis.load}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${systemUptimes.redis.load}%` }} />
              </div>
            </div>

            {/* API */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-indigo-500" /> Edge REST/gRPC API
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded">
                  {systemUptimes.api.uptime}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Latency: {systemUptimes.api.latency}</span>
                <span>Load: {systemUptimes.api.load}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${systemUptimes.api.load}%` }} />
              </div>
            </div>

            {/* Queue */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                  <Activity className="w-3.5 h-3.5 text-amber-500" /> BullMQ Settlement
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded">
                  {systemUptimes.queue.uptime}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Latency: {systemUptimes.queue.latency}</span>
                <span>Load: {systemUptimes.queue.load}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${systemUptimes.queue.load}%` }} />
              </div>
            </div>

            {/* Email Service */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                  <Mail className="w-3.5 h-3.5 text-sky-500" /> SMTP Mailer Node
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded">
                  {systemUptimes.email.uptime}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Latency: {systemUptimes.email.latency}</span>
                <span>Load: {systemUptimes.email.load}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${systemUptimes.email.load}%` }} />
              </div>
            </div>

            {/* SMS Service */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                  <Phone className="w-3.5 h-3.5 text-pink-500" /> SMS OTP Gateway
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded">
                  {systemUptimes.sms.uptime}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Latency: {systemUptimes.sms.latency}</span>
                <span>Load: {systemUptimes.sms.load}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${systemUptimes.sms.load}%` }} />
              </div>
            </div>

            {/* Push Notifications */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                  <BellRing className="w-3.5 h-3.5 text-emerald-500" /> FCM Web-Push Hub
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded">
                  {systemUptimes.push.uptime}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Latency: {systemUptimes.push.latency}</span>
                <span>Load: {systemUptimes.push.load}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${systemUptimes.push.load}%` }} />
              </div>
            </div>

            {/* Storage Node */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 flex items-center gap-1.5 font-bold">
                  <HardDrive className="w-3.5 h-3.5 text-orange-500" /> Cloud Media Storage
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded">
                  {systemUptimes.storage.uptime}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Latency: {systemUptimes.storage.latency}</span>
                <span>Load: {systemUptimes.storage.load}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${systemUptimes.storage.load}%` }} />
              </div>
            </div>

            {/* Containers (CPU / Memory) */}
            <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
              {/* CPU */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-bold">
                  <span>Core Container CPU</span>
                  <span className="text-slate-900">{systemUptimes.cpu.load}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${
                    systemUptimes.cpu.load > 80 ? 'bg-red-500' : systemUptimes.cpu.load > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} style={{ width: `${systemUptimes.cpu.load}%` }} />
                </div>
              </div>

              {/* Memory */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700 font-bold">
                  <span>Shared Pod memory RAM</span>
                  <span className="text-slate-900">{systemUptimes.memory.load}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${systemUptimes.memory.load}%` }} />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* RENDER QUICK ACTION MODAL OVERLAY */}
      {activeQuickAction && (
        <QuickActionModal 
          action={activeQuickAction} 
          onClose={() => setActiveQuickAction(null)}
          onSubmit={handleQuickActionSubmit}
        />
      )}

    </div>
  );
}

// Internal reusable helper for Quick Actions Forms
function QuickActionModal({ action, onClose, onSubmit }: QuickActionModalProps) {
  const [formData, setFormData] = useState<any>({});
  
  const getActionTitle = () => {
    switch (action) {
      case 'create_user': return 'Create Authorized User';
      case 'freeze_wallet': return 'Freeze Wallet Core';
      case 'approve_kyc': return 'Override KYC Authorization';
      case 'issue_card': return 'Issue Instant Virtual Card';
      case 'refund_transaction': return 'Clear Instant Refund Reversal';
      case 'create_admin': return 'Authorize IAM Policy Operator';
      case 'open_support': return 'Open Critical Level-2 Support Ticket';
      case 'broadcast_notification': return 'Broadcast Multi-Region Push Message';
      case 'sys_config': return 'Configure Enterprise Global Settings';
      case 'flag_user': return 'Flag User for Compliance Review (AML)';
      case 'treasury_sweep': return 'Initiate Multi-Currency Treasury Sweep';
      default: return 'Execute Console Security Command';
    }
  };

  const renderFormFields = () => {
    switch (action) {
      case 'create_user':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">User Full Name</label>
              <input 
                type="text" 
                required
                placeholder="Jane Doe"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Region/Country</label>
              <input 
                type="text" 
                placeholder="United Kingdom"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Initial Reserve Deposit (USD)</label>
              <input 
                type="number" 
                placeholder="10000"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>
        );
      case 'freeze_wallet':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Wallet Public Address</label>
              <input 
                type="text" 
                required
                placeholder="0x892aF01b92c..."
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Incident Threat Category</label>
              <select 
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              >
                <option value="Suspicious Velocity Flow">Suspicious Velocity Flow</option>
                <option value="API Credentials Compromise">API Credentials Compromise</option>
                <option value="Non-Compliant KYC profile">Non-Compliant KYC profile</option>
                <option value="Audit Override Request">Audit Override Request</option>
              </select>
            </div>
          </div>
        );
      case 'approve_kyc':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Application Reference Token</label>
              <input 
                type="text" 
                required
                placeholder="KYC-40291"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              />
            </div>
            <div className="p-2.5 bg-amber-950/40 border border-amber-900/60 rounded text-[10px] text-amber-300 leading-normal font-medium">
              ⚠️ <strong>Warning:</strong> Manual operational overrides bypass state-level AML scanners. Logging will be preserved for security reviews.
            </div>
          </div>
        );
      case 'issue_card':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner Account ID</label>
              <input 
                type="text" 
                required
                placeholder="usr_9281a8"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Transaction Limit (USD)</label>
              <input 
                type="number" 
                placeholder="5000"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              />
            </div>
          </div>
        );
      case 'refund_transaction':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clearing Transaction reference</label>
              <input 
                type="text" 
                required
                placeholder="tx_1004"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, refId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Refund Reversal Value (USD)</label>
              <input 
                type="number" 
                required
                placeholder="250.00"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>
        );
      case 'create_admin':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operator Corporate Email</label>
              <input 
                type="email" 
                required
                placeholder="auditor.tokyo@walletpro.co"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned IAM Policy Scope</label>
              <select 
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
              >
                <option value="Audit Read-Only">Auditor Level 1 (Read-Only)</option>
                <option value="Operations Compliance Override">Operations Supervisor (Write/Manual Clears)</option>
                <option value="Master Key Control">IAM Key Security Admin (Full Admin Control)</option>
              </select>
            </div>
          </div>
        );
      case 'open_support':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject Brief</label>
              <input 
                type="text" 
                required
                placeholder="Secondary Webhook connection lag"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Support Category</label>
              <select 
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="API Webhooks">API & Webhooks Integration</option>
                <option value="Clearing Banks">Clearing Bank Settlement delays</option>
                <option value="Card Authorization">Virtual Card Auth decline</option>
              </select>
            </div>
          </div>
        );
      case 'broadcast_notification':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Broadcast Push Message</label>
              <textarea 
                required
                rows={3}
                placeholder="WalletPro will run zero-downtime database upgrades tomorrow at 03:00 UTC."
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 resize-none"
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Channel Target</label>
              <select 
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500"
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              >
                <option value="All active client sessions">All active client sessions (Web & Mobile)</option>
                <option value="Enterprise developers only">Enterprise developers (Webhook API key owners)</option>
                <option value="Merchant admins only">Merchant Store Owners only</option>
              </select>
            </div>
          </div>
        );
      case 'sys_config':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Global Max Velocity Limit (USD)</label>
              <input 
                type="number" 
                required
                placeholder="150000"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, max_limit: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Global Reserve Buffer Ratio (%)</label>
              <input 
                type="number" 
                placeholder="15"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, buffer_ratio: e.target.value })}
              />
            </div>
          </div>
        );
      case 'flag_user':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Compliance Customer Email</label>
              <input 
                type="email" 
                required
                placeholder="suspicious.operator@gmail.com"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="p-2.5 bg-red-950/40 border border-red-900/60 rounded text-[10px] text-red-300 leading-normal font-medium font-mono">
              ⚠️ <strong>Critical Action:</strong> This flags the account across AML, PEP, and OFAC velocity watchlists instantly.
            </div>
          </div>
        );
      case 'treasury_sweep':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Sweep Target Bank Routing</label>
              <input 
                type="text" 
                required
                placeholder="JP_MORGAN_90182"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, routing: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Liquidity Transfer Amount (USD)</label>
              <input 
                type="number" 
                required
                placeholder="4500000.00"
                className="w-full bg-slate-800 text-slate-100 border border-slate-750 rounded-lg p-2 text-xs outline-none focus:border-blue-500 font-mono"
                onChange={(e) => setFormData({ ...formData, sweep_amount: e.target.value })}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500 animate-pulse" />
            <h3 className="font-bold text-sm tracking-tight text-white">{getActionTitle()}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit}>
          <div className="p-5">
            {renderFormFields()}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              Dispatch Command
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
