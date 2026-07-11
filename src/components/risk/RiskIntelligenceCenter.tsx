import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Search, Filter, Lock, Unlock, 
  UserMinus, RefreshCw, Layers, Server, Activity, Users, Coins, 
  CreditCard, ArrowRightLeft, Landmark, Sliders, Globe, TrendingUp, 
  Droplet, BookOpen, MessageSquare, Plus, CheckCircle, FileText, 
  Settings, Clock, Bell, UserPlus, Trash2, Edit3, Check, X,
  FileSpreadsheet, Terminal, BarChart2, Eye, ExternalLink, Network,
  UserCheck, ThumbsUp, HelpCircle, Laptop, Shield
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface RiskIntelligenceCenterProps {
  activeSubTab: string;
  onToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  onSelectTab: (tabId: string) => void;
  isDarkMode?: boolean;
}

// Interfaces
interface Alert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  customerName: string;
  customerId: string;
  riskScore: number;
  alertType: string;
  relatedWallet: string;
  relatedCard: string;
  relatedTransaction: string;
  country: string;
  device: string;
  createdTime: string;
  status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'CLOSED_RESOLVED' | 'CLOSED_FALSE_POSITIVE';
  assignedInvestigator: string;
  notes: string;
  ipAddress: string;
}

interface InvestigationCase {
  id: string;
  alertId: string;
  title: string;
  customerId: string;
  customerName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'ESCALATED' | 'RESOLVED_FRAUD' | 'RESOLVED_BENIGN';
  createdDate: string;
  assignedInvestigator: string;
  notes: string[];
  evidence: string[];
  attachments: { name: string; size: string; date: string }[];
}

interface LiveEvent {
  id: string;
  time: string;
  type: string;
  description: string;
  riskDelta: number;
  customer: string;
  country: string;
  device: string;
}

interface VelocityRule {
  id: string;
  name: string;
  category: string;
  description: string;
  threshold: string;
  isActive: boolean;
  triggerCount: number;
}

interface FrozenAccount {
  id: string;
  type: 'Wallet' | 'Card';
  ownerName: string;
  ownerId: string;
  frozenAt: string;
  reason: string;
  investigator: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  investigator: string;
  action: string;
  entity: string;
  details: string;
}

export function RiskIntelligenceCenter({ activeSubTab, onToast, onSelectTab, isDarkMode = false }: RiskIntelligenceCenterProps) {
  // Loading States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 850);
    return () => clearTimeout(timer);
  }, [activeSubTab]);

  // Main Datasets in local component state for continuous interactive mutation
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('walletpro_risk_alerts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'ALT-9821',
        severity: 'CRITICAL',
        customerName: 'Marcus Sterling',
        customerId: 'CUST-3829',
        riskScore: 94,
        alertType: 'Impossible Travel',
        relatedWallet: 'W-USD-9901',
        relatedCard: 'CARD-8012',
        relatedTransaction: 'TX-55102',
        country: 'Nigeria',
        device: 'Xiaomi Redmi Note (Android 13)',
        createdTime: '2026-07-09 06:12:44',
        status: 'OPEN',
        assignedInvestigator: 'Sarah Jenkins',
        notes: 'Session authenticated in Lagos 12 minutes after Chicago checkout. High risk score verified.',
        ipAddress: '102.89.44.12'
      },
      {
        id: 'ALT-4519',
        severity: 'CRITICAL',
        customerName: 'Elena Rostova',
        customerId: 'CUST-4039',
        riskScore: 89,
        alertType: 'Multiple Failed OTP Attempts',
        relatedWallet: 'W-EUR-02',
        relatedCard: 'CARD-4402',
        relatedTransaction: 'TX-40112',
        country: 'Germany',
        device: 'Unknown Client (Postman Runtime)',
        createdTime: '2026-07-09 05:44:11',
        status: 'INVESTIGATING',
        assignedInvestigator: 'John Doe',
        notes: 'API OTP endpoint hit 18 times within 2 minutes. Suspicious automation signature.',
        ipAddress: '84.112.5.90'
      },
      {
        id: 'ALT-2041',
        severity: 'HIGH',
        customerName: 'Carlos Santillan',
        customerId: 'CUST-2918',
        riskScore: 78,
        alertType: 'Velocity Spike',
        relatedWallet: 'W-MXN-1029',
        relatedCard: 'CARD-1192',
        relatedTransaction: 'TX-88201',
        country: 'Mexico',
        device: 'Apple iPhone 14 Pro (iOS 17.2)',
        createdTime: '2026-07-09 04:30:15',
        status: 'OPEN',
        assignedInvestigator: 'Unassigned',
        notes: '5 consecutive outgoing transactions under $50 limit in 10 seconds. Highly suggestive of card testing.',
        ipAddress: '189.201.55.4'
      },
      {
        id: 'ALT-3392',
        severity: 'HIGH',
        customerName: 'Jane Abernathy',
        customerId: 'CUST-5510',
        riskScore: 82,
        alertType: 'Rapid Transfers',
        relatedWallet: 'W-USD-2231',
        relatedCard: 'N/A',
        relatedTransaction: 'TX-90118',
        country: 'United States',
        device: 'Apple MacBook Pro M2 (macOS 14.5)',
        createdTime: '2026-07-09 02:15:00',
        status: 'ESCALATED',
        assignedInvestigator: 'Sarah Jenkins',
        notes: 'Structured fund routing pattern. Credited $10k, routed to 4 bank accounts in 5 minutes.',
        ipAddress: '192.150.10.42'
      },
      {
        id: 'ALT-8812',
        severity: 'MEDIUM',
        customerName: 'Siddharth Nair',
        customerId: 'CUST-7011',
        riskScore: 61,
        alertType: 'Device Change',
        relatedWallet: 'W-INR-4432',
        relatedCard: 'CARD-0987',
        relatedTransaction: 'N/A',
        country: 'India',
        device: 'Samsung Galaxy Fold 5 (Android 14)',
        createdTime: '2026-07-08 23:40:12',
        status: 'CLOSED_RESOLVED',
        assignedInvestigator: 'John Doe',
        notes: 'User verified change via 2FA voice callback. Action cleared.',
        ipAddress: '122.160.12.87'
      },
      {
        id: 'ALT-1094',
        severity: 'LOW',
        customerName: 'Marcus Sterling',
        customerId: 'CUST-3829',
        riskScore: 45,
        alertType: 'Location Changes',
        relatedWallet: 'W-USD-9901',
        relatedCard: 'N/A',
        relatedTransaction: 'TX-54210',
        country: 'Canada',
        device: 'Apple iPhone 15 Pro (iOS 17.5)',
        createdTime: '2026-07-08 18:22:00',
        status: 'CLOSED_FALSE_POSITIVE',
        assignedInvestigator: 'Sarah Jenkins',
        notes: 'Identified as commercial VPN endpoint. False positive logged.',
        ipAddress: '204.112.5.31'
      }
    ];
  });

  const [cases, setCases] = useState<InvestigationCase[]>(() => {
    const saved = localStorage.getItem('walletpro_risk_cases');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'CASE-7712',
        alertId: 'ALT-9821',
        title: ' Marcus Sterling Card Takeover & Impossible Travel',
        customerId: 'CUST-3829',
        customerName: 'Marcus Sterling',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        createdDate: '2026-07-09 06:15:00',
        assignedInvestigator: 'Sarah Jenkins',
        notes: [
          'Opened case based on critical alert ALT-9821. Suspicious travel Lagos/Chicago.',
          'Called user primary phone. No response, outgoing voicemail sounds typical. Card suspended as safeguard.'
        ],
        evidence: [
          'High Risk IP match (Nigeria / Lagos Host)',
          'Sudden browser swap from Safari Desktop to Mobile WebView',
          'Declined charge of $15,000 at Jumia Merchant'
        ],
        attachments: [
          { name: 'session_fingerprint.json', size: '2.4 KB', date: '2026-07-09' },
          { name: 'ip_lookup_report.pdf', size: '142 KB', date: '2026-07-09' }
        ]
      },
      {
        id: 'CASE-4091',
        alertId: 'ALT-4519',
        title: ' Elena Rostova API OTP Automation Abuse Check',
        customerId: 'CUST-4039',
        customerName: 'Elena Rostova',
        severity: 'HIGH',
        status: 'ACTIVE',
        createdDate: '2026-07-09 05:48:00',
        assignedInvestigator: 'John Doe',
        notes: [
          'Rate limit triggered. System flagged Postman Client signature.',
          'Investigating connection with high frequency billing attempts.'
        ],
        evidence: [
          '18 Auth failures in 120s',
          'User agent mismatch (Not standard mobile client)'
        ],
        attachments: [
          { name: 'api_request_logs.log', size: '48.1 KB', date: '2026-07-09' }
        ]
      }
    ];
  });

  const [rules, setRules] = useState<VelocityRule[]>(() => {
    const saved = localStorage.getItem('walletpro_risk_rules');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'RULE-1', name: 'Impossible Travel Audit', category: 'Geographic', description: 'Triggers if transaction location changes faster than commercial aircraft speed between authentication points.', threshold: '> 500 MPH', isActive: true, triggerCount: 142 },
      { id: 'RULE-2', name: 'Multiple Failed OTP Limits', category: 'Authentication', description: 'Locks session and flags compliance after successive OTP failures inside 5 minutes.', threshold: '>= 5 attempts', isActive: true, triggerCount: 88 },
      { id: 'RULE-3', name: 'Rapid Transfer Sweep Check', category: 'Velocity', description: 'Triggers when outgoing flow sweeps more than 90% of inward cash within 15 minutes.', threshold: '> $10,000 & 90%', isActive: true, triggerCount: 31 },
      { id: 'RULE-4', name: 'Card Testing Micro-Charges', category: 'Card Strategy', description: 'Identifies micro-auth checks ($1-$5) occurring in sequence under 1 minute.', threshold: '>= 4 checkouts', isActive: true, triggerCount: 201 },
      { id: 'RULE-5', name: 'High Frequency Transactions', category: 'Velocity', description: 'Flags rapid API checks executing consecutive payment transactions.', threshold: '> 10 per min', isActive: false, triggerCount: 0 },
      { id: 'RULE-6', name: 'Impossible Dual Devices', category: 'Device', description: 'Flags simultaneous active session logins on disjoint hardware architectures.', threshold: 'Active', isActive: true, triggerCount: 12 },
      { id: 'RULE-7', name: 'Sanctions Blacklist Country', category: 'Geographic', description: 'Strict block and alert on wallets attempting transactions to or from state-sanctioned locations.', threshold: 'Hard Block', isActive: true, triggerCount: 3 }
    ];
  });

  const [frozenAccounts, setFrozenAccounts] = useState<FrozenAccount[]>(() => {
    const saved = localStorage.getItem('walletpro_risk_frozen');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'FRZ-101', type: 'Wallet', ownerName: 'Marcus Sterling', ownerId: 'CUST-3829', frozenAt: '2026-07-09 06:20', reason: 'Active investigation on CASE-7712 (Impossible Travel)', investigator: 'Sarah Jenkins' },
      { id: 'FRZ-102', type: 'Card', ownerName: 'James McCandless', ownerId: 'CUST-5512', frozenAt: '2026-07-08 12:44', reason: 'High likelihood of credit card testing', investigator: 'John Doe' },
      { id: 'FRZ-103', type: 'Wallet', ownerName: 'Vance Sterling', ownerId: 'CUST-9004', frozenAt: '2026-07-05 09:15', reason: 'OFAC Sanctions screening match', investigator: 'Sarah Jenkins' }
    ];
  });

  const [watchlists, setWatchlists] = useState<{ type: string; value: string; addedBy: string; date: string }[]>(() => {
    const saved = localStorage.getItem('walletpro_risk_watchlists');
    if (saved) return JSON.parse(saved);
    return [
      { type: 'IP Address', value: '102.89.44.12', addedBy: 'Sarah Jenkins', date: '2026-07-09' },
      { type: 'IP Address', value: '185.190.140.165', addedBy: 'System Engine', date: '2026-07-08' },
      { type: 'Device Fingerprint', value: 'FP-Xiaomi-998A1', addedBy: 'John Doe', date: '2026-07-09' },
      { type: 'Merchant ID', value: 'MID-FANCY-GAMES-RU', addedBy: 'System Engine', date: '2026-07-07' },
      { type: 'Country', value: 'Sovereign-Sanctioned List A', addedBy: 'Compliance Board', date: '2026-01-15' }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('walletpro_risk_audit');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'AUD-001', timestamp: '2026-07-09 06:20:12', investigator: 'Sarah Jenkins', action: 'FREEZE_WALLET', entity: 'CUST-3829', details: 'Froze primary USD wallet due to high risk impossible travel anomaly.' },
      { id: 'AUD-002', timestamp: '2026-07-09 05:50:41', investigator: 'John Doe', action: 'ASSIGN_INVESTIGATOR', entity: 'CASE-4091', details: 'Assigned investigator John Doe to Case CASE-4091.' },
      { id: 'AUD-003', timestamp: '2026-07-08 12:44:11', investigator: 'System Engine', action: 'FREEZE_CARD', entity: 'CARD-4402', details: 'Auto-suspended card due to multi-checkout failure rules.' }
    ];
  });

  // Live monitor stream state (fed continuously or added manually)
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([
    { id: 'EV-1009', time: '07:08:44', type: 'Impossible Travel', description: 'Marcus Sterling logged in from Lagos, Nigeria (12 mins after Chicago)', riskDelta: +85, customer: 'Marcus Sterling', country: 'Nigeria', device: 'Android WebView' },
    { id: 'EV-1008', time: '07:07:11', type: 'Velocity Spike', description: 'Carlos Santillan executed 5 card purchases under $10 in 15 seconds', riskDelta: +62, customer: 'Carlos Santillan', country: 'Mexico', device: 'iOS Card SDK' },
    { id: 'EV-1007', time: '07:05:01', type: 'Device Change', description: 'John Wright switched browser architecture to Tor Client', riskDelta: +45, customer: 'John Wright', country: 'Germany', device: 'Firefox Tor' },
    { id: 'EV-1006', time: '07:01:12', type: 'Multiple OTP Failures', description: 'Elena Rostova API checkout triggered 3rd bad verification code', riskDelta: +30, customer: 'Elena Rostova', country: 'Germany', device: 'Postman Runtime' },
    { id: 'EV-1005', time: '06:58:32', type: 'Large Transaction', description: 'Alexander Wright initiated $45,000 transfer to Acme Corp', riskDelta: +5, customer: 'Alexander Wright', country: 'United States', device: 'MacOS Chrome' }
  ]);

  // Sync state helpers
  useEffect(() => {
    localStorage.setItem('walletpro_risk_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('walletpro_risk_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('walletpro_risk_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('walletpro_risk_frozen', JSON.stringify(frozenAccounts));
  }, [frozenAccounts]);

  useEffect(() => {
    localStorage.setItem('walletpro_risk_watchlists', JSON.stringify(watchlists));
  }, [watchlists]);

  useEffect(() => {
    localStorage.setItem('walletpro_risk_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Live simulation ticker for Live Risk Monitor
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  useEffect(() => {
    if (!isLiveStreaming) return;
    
    const sampleEvents = [
      { type: 'Velocity Spike', description: 'Rapid withdrawal attempt: $12,000 to external wire desk', riskDelta: 74, customer: 'Alexander Wright', country: 'United States', device: 'iPhone 15 Pro' },
      { type: 'Multiple Failed OTP Attempts', description: 'Failed OTP submission on card pin change', riskDelta: 55, customer: 'Siddharth Nair', country: 'India', device: 'Android Chrome' },
      { type: 'Device Change', description: 'Unrecognized hardware signature detected during checkout', riskDelta: 40, customer: 'Elena Rostova', country: 'Germany', device: 'Safari Desktop Linux' },
      { type: 'Card Testing', description: 'Repeated $1.00 payment authorizations at generic online store', riskDelta: 82, customer: 'Carlos Santillan', country: 'Mexico', device: 'Mobile API client' },
      { type: 'Impossible Travel', description: 'Checkout in London, UK 5 minutes after Singapore auth', riskDelta: 95, customer: 'James McCandless', country: 'United Kingdom', device: 'Safari Mobile' }
    ];

    const interval = setInterval(() => {
      const source = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newEvent: LiveEvent = {
        id: 'EV-' + Math.floor(1000 + Math.random() * 9000),
        time: timeStr,
        type: source.type,
        description: source.description,
        riskDelta: source.riskDelta,
        customer: source.customer,
        country: source.country,
        device: source.device
      };

      setLiveEvents(prev => [newEvent, ...prev.slice(0, 15)]);

      // If risk score is extremely high, push as alert!
      if (source.riskDelta > 80 && Math.random() > 0.4) {
        const generatedAlert: Alert = {
          id: 'ALT-' + Math.floor(1000 + Math.random() * 9000),
          severity: source.riskDelta > 90 ? 'CRITICAL' : 'HIGH',
          customerName: source.customer,
          customerId: 'CUST-' + Math.floor(3000 + Math.random() * 6000),
          riskScore: source.riskDelta,
          alertType: source.type,
          relatedWallet: 'W-' + Math.floor(1000 + Math.random() * 9000),
          relatedCard: 'CARD-' + Math.floor(1000 + Math.random() * 9000),
          relatedTransaction: 'TX-' + Math.floor(50000 + Math.random() * 40000),
          country: source.country,
          device: source.device,
          createdTime: now.toISOString().replace('T', ' ').slice(0, 19),
          status: 'OPEN',
          assignedInvestigator: 'Unassigned',
          notes: `Automated live threat monitor detection: ${source.description}.`,
          ipAddress: `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        };

        setAlerts(prev => [generatedAlert, ...prev]);
        onToast(`Critical live risk detected! New alert logged for ${source.customer}.`, 'warning');
      }

    }, 5500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Filter variables
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterInvestigator, setFilterInvestigator] = useState<string>('ALL');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Active investigation view state
  const [activeCaseId, setActiveCaseId] = useState<string>('CASE-7712');
  const [caseNoteInput, setCaseNoteInput] = useState<string>('');

  // Watchlist input state
  const [newWatchlistType, setNewWatchlistType] = useState<string>('IP Address');
  const [newWatchlistValue, setNewWatchlistValue] = useState<string>('');

  // Velocity configuration rule limits
  const [cardLimitValue, setCardLimitValue] = useState<number>(3);
  const [amountThresholdValue, setAmountThresholdValue] = useState<number>(10000);

  // Helper: Log Action
  const logInvestigatorAction = (action: string, entityId: string, details: string) => {
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').slice(0, 19);
    const newLog: AuditLog = {
      id: 'AUD-' + Math.floor(100 + Math.random() * 900),
      timestamp: timeStr,
      investigator: ' Sarah Jenkins (Compliance Officer)',
      action,
      entity: entityId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Calculations for Dashboards
  const stats = useMemo(() => {
    const totalCount = alerts.length;
    const openCount = alerts.filter(a => a.status === 'OPEN').length;
    const investigatingCount = alerts.filter(a => a.status === 'INVESTIGATING').length;
    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'CLOSED_RESOLVED' && a.status !== 'CLOSED_FALSE_POSITIVE').length;
    const highRiskCust = new Set(alerts.filter(a => a.riskScore > 75).map(a => a.customerId)).size;
    
    // Aggregates
    const frozenCount = frozenAccounts.length;
    const blockedCards = frozenAccounts.filter(f => f.type === 'Card').length;
    const frozenWallets = frozenAccounts.filter(f => f.type === 'Wallet').length;
    const falsePositives = alerts.filter(a => a.status === 'CLOSED_FALSE_POSITIVE').length;
    const closedCount = alerts.filter(a => a.status === 'CLOSED_RESOLVED' || a.status === 'CLOSED_FALSE_POSITIVE').length;
    const falsePositiveRate = closedCount > 0 ? Math.round((falsePositives / closedCount) * 100) : 18;

    return {
      totalCount,
      openCount,
      investigatingCount,
      criticalCount,
      highRiskCust,
      frozenCount,
      blockedCards,
      frozenWallets,
      falsePositiveRate,
      casesCount: cases.filter(c => c.status === 'ACTIVE').length
    };
  }, [alerts, frozenAccounts, cases]);

  // Interactive Admin Actions
  const handleFreezeWallet = (customerId: string, customerName: string) => {
    // Check if already frozen
    const exists = frozenAccounts.find(f => f.ownerId === customerId && f.type === 'Wallet');
    if (exists) {
      onToast(`Wallet for ${customerName} is already frozen.`, 'info');
      return;
    }
    const newFrz: FrozenAccount = {
      id: 'FRZ-' + Math.floor(100 + Math.random() * 900),
      type: 'Wallet',
      ownerName: customerName,
      ownerId: customerId,
      frozenAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reason: 'Manual suspension via Risk Workspace',
      investigator: 'Sarah Jenkins'
    };
    setFrozenAccounts(prev => [newFrz, ...prev]);
    logInvestigatorAction('FREEZE_WALLET', customerId, `Froze primary multi-currency wallet for customer.`);
    onToast(`Successfully frozen all wallets for ${customerName}. Asset recovery hold active.`, 'success');
  };

  const handleUnfreezeAccount = (frozenId: string, ownerName: string) => {
    setFrozenAccounts(prev => prev.filter(f => f.id !== frozenId));
    logInvestigatorAction('UNFREEZE_ASSETS', frozenId, `Released asset holds for owner: ${ownerName}.`);
    onToast(`Unlocked and released holds for ${ownerName}.`, 'success');
  };

  const handleFreezeCard = (customerId: string, customerName: string) => {
    const exists = frozenAccounts.find(f => f.ownerId === customerId && f.type === 'Card');
    if (exists) {
      onToast(`Physical & Virtual cards are already locked for ${customerName}.`, 'info');
      return;
    }
    const newFrz: FrozenAccount = {
      id: 'FRZ-' + Math.floor(100 + Math.random() * 900),
      type: 'Card',
      ownerName: customerName,
      ownerId: customerId,
      frozenAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      reason: 'Card testing mitigations active',
      investigator: 'Sarah Jenkins'
    };
    setFrozenAccounts(prev => [newFrz, ...prev]);
    logInvestigatorAction('FREEZE_CARD', customerId, `Suspended active cards.`);
    onToast(`Suspended all debit & virtual credit cards for ${customerName}.`, 'success');
  };

  const handleAssignInvestigator = (alertId: string, investigator: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, assignedInvestigator: investigator, status: 'INVESTIGATING' };
      }
      return a;
    }));
    logInvestigatorAction('ASSIGN_INVESTIGATOR', alertId, `Assigned investigator: ${investigator}`);
    onToast(`Assigned ${investigator} to alert ${alertId}.`, 'success');
  };

  const handleAlertStatusUpdate = (alertId: string, status: Alert['status']) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return { ...a, status };
      }
      return a;
    }));
    logInvestigatorAction('UPDATE_ALERT_STATUS', alertId, `Updated alert status to: ${status}`);
    onToast(`Updated status of ${alertId} to ${status}.`, 'info');
  };

  const handleCreateComplianceCase = (customerId: string, customerName: string, subject: string) => {
    onToast(`Dispatched compliance case trigger. Re-verifying KYC dossier for ${customerName}.`, 'success');
    logInvestigatorAction('TRIGGER_COMPLIANCE_CASE', customerId, `Automated SAR filing request for ${customerName}: ${subject}`);
    onSelectTab('compliance-cases');
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        const nextState = !r.isActive;
        logInvestigatorAction('TOGGLE_RULE', r.id, `${nextState ? 'Activated' : 'Suspended'} system rule: ${r.name}`);
        return { ...r, isActive: nextState };
      }
      return r;
    }));
    onToast(`Rule configuration modified.`, 'info');
  };

  const handleAddWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatchlistValue.trim()) return;
    const newEntry = {
      type: newWatchlistType,
      value: newWatchlistValue.trim(),
      addedBy: 'Sarah Jenkins',
      date: new Date().toISOString().slice(0, 10)
    };
    setWatchlists(prev => [newEntry, ...prev]);
    logInvestigatorAction('ADD_WATCHLIST', newWatchlistValue, `Added ${newWatchlistType} entry to blocklists.`);
    setNewWatchlistValue('');
    onToast(`Added blocklist entry successfully.`, 'success');
  };

  const handleRemoveWatchlist = (value: string) => {
    setWatchlists(prev => prev.filter(w => w.value !== value));
    logInvestigatorAction('REMOVE_WATCHLIST', value, `Removed blocklist entry.`);
    onToast(`Removed from blocklist.`, 'info');
  };

  const handleAddCaseNote = () => {
    if (!caseNoteInput.trim()) return;
    setCases(prev => prev.map(c => {
      if (c.id === activeCaseId) {
        return { ...c, notes: [caseNoteInput.trim(), ...c.notes] };
      }
      return c;
    }));
    logInvestigatorAction('ADD_CASE_NOTE', activeCaseId, `Added investigation internal note.`);
    setCaseNoteInput('');
    onToast(`Note added to case files.`, 'success');
  };

  const handleResolveCase = (caseId: string, result: 'FRAUD' | 'BENIGN') => {
    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { ...c, status: result === 'FRAUD' ? 'RESOLVED_FRAUD' : 'RESOLVED_BENIGN' };
      }
      return c;
    }));
    logInvestigatorAction('RESOLVE_CASE', caseId, `Resolved investigation case file. Verdict: ${result}.`);
    onToast(`Case ${caseId} resolved as ${result === 'FRAUD' ? 'CONFIRMED FRAUD' : 'FALSE POSITIVE/BENIGN'}.`, 'success');
  };

  // Filter Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchSeverity = filterSeverity === 'ALL' || a.severity === filterSeverity;
      const matchType = filterType === 'ALL' || a.alertType === filterType;
      const matchInvestigator = filterInvestigator === 'ALL' || a.assignedInvestigator === filterInvestigator;
      const matchSearch = !filterSearch || 
        a.id.toLowerCase().includes(filterSearch.toLowerCase()) ||
        a.customerName.toLowerCase().includes(filterSearch.toLowerCase()) ||
        a.alertType.toLowerCase().includes(filterSearch.toLowerCase()) ||
        a.country.toLowerCase().includes(filterSearch.toLowerCase());
      
      return matchSeverity && matchType && matchInvestigator && matchSearch;
    });
  }, [alerts, filterSeverity, filterType, filterInvestigator, filterSearch]);

  const activeCase = useMemo(() => {
    return cases.find(c => c.id === activeCaseId) || cases[0];
  }, [cases, activeCaseId]);

  // Simulated Charts Data
  const trendData = [
    { name: '07/03', transactions: 12000, alerts: 14, chargebacks: 1 },
    { name: '07/04', transactions: 15400, alerts: 18, chargebacks: 2 },
    { name: '07/05', transactions: 18900, alerts: 25, chargebacks: 4 },
    { name: '07/06', transactions: 14200, alerts: 12, chargebacks: 1 },
    { name: '07/07', transactions: 21000, alerts: 30, chargebacks: 5 },
    { name: '07/08', transactions: 24500, alerts: 41, chargebacks: 8 },
    { name: '07/09', transactions: 19500, alerts: 34, chargebacks: 3 }
  ];

  const distributionData = [
    { name: 'Impossible Travel', value: 35 },
    { name: 'Failed OTP', value: 25 },
    { name: 'Velocity Spikes', value: 20 },
    { name: 'Card Testing', value: 15 },
    { name: 'Device Swap', value: 5 }
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  const deviceDistribution = [
    { name: 'iOS App Client', count: 420 },
    { name: 'Android Native', count: 310 },
    { name: 'Chrome Desktop', count: 215 },
    { name: 'Tor Browser', count: 44 },
    { name: 'Postman/API Automation', count: 18 }
  ];

  return (
    <div className={`p-1 space-y-6 select-none ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Module Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200/50 gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-lg shadow-md shadow-red-500/10">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Enterprise Fraud &amp; Risk Intelligence Center
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Basel IV Multi-Currency Forensic Operations &amp; Real-Time Threat Mitigations
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Live stream trigger indicator */}
          <button 
            onClick={() => {
              setIsLiveStreaming(!isLiveStreaming);
              onToast(isLiveStreaming ? 'Live simulation paused.' : 'Live simulation active.', 'info');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
              isLiveStreaming 
                ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 animate-pulse' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-red-500' : 'bg-slate-400'}`} />
            <span>{isLiveStreaming ? 'LIVE RADAR STREAMING' : 'RADAR PAUSED'}</span>
          </button>

        </div>
      </div>

      {/* Sub Navigation Bar for Risk Module */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-slate-200/40">
        {[
          { id: 'fraud-dashboard', label: 'Fraud Dashboard', icon: BarChart2 },
          { id: 'fraud-alerts', label: `Alert Matrix (${stats.openCount})`, icon: AlertTriangle },
          { id: 'risk-monitoring', label: 'Live Risk Monitor', icon: Activity },
          { id: 'investigations', label: `Workspace (${stats.casesCount})`, icon: Search },
          { id: 'frozen-accounts', label: `Frozen Assets (${stats.frozenCount})`, icon: Lock },
          { id: 'velocity-rules', label: 'Velocity Rule Engine', icon: Sliders },
          { id: 'aml-risk', label: 'AML Risk Ledger', icon: Globe },
          { id: 'behavior-analytics', label: 'Behavioral Radar', icon: TrendingUp },
          { id: 'watchlists', label: 'Security Watchlists', icon: Laptop }
        ].map(item => {
          const isActive = activeSubTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* SKELETON LOAD INJECTOR */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="h-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 animate-pulse p-4 flex flex-col justify-between">
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
          <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* ==================== TAB 1: FRAUD DASHBOARD ==================== */}
          {activeSubTab === 'fraud-dashboard' && (
            <div className="space-y-6 text-left">
              
              {/* Dynamic KPI Metrics Panel */}
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Open Risk Alerts</span>
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.openCount}</span>
                    <span className="text-[10px] text-red-500 font-bold">Unassigned</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-100 dark:border-slate-800 mt-2">Active backlog queue</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">Critical Threats</span>
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-extrabold text-red-600">{stats.criticalCount}</span>
                    <span className="text-[10px] font-bold text-red-400 bg-red-100/50 dark:bg-red-950/40 px-1 py-0.2 rounded">CRIT</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-100 dark:border-slate-800 mt-2">Immediate action required</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fraud Cases Active</span>
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.casesCount}</span>
                    <span className="text-[9px] text-slate-400 font-mono">CASE IDs</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-100 dark:border-slate-800 mt-2">Under active investigation</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Frozen Wallets</span>
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-extrabold text-amber-600">{stats.frozenWallets}</span>
                    <span className="text-[9px] text-slate-400 font-mono">WALLETS</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-100 dark:border-slate-800 mt-2">Asset recovery safeguard holds</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Blocked Card Assets</span>
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-extrabold text-amber-600">{stats.blockedCards}</span>
                    <span className="text-[9px] text-slate-400 font-mono">CARDS</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-100 dark:border-slate-800 mt-2">Card testing blocklist holds</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">False Positive Rate</span>
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.falsePositiveRate}%</span>
                    <span className="text-[10px] text-emerald-600 font-bold">-2.1% MoM</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-100 dark:border-slate-800 mt-2">Closed as False Positive</span>
                </div>

              </div>

              {/* Grid 2: Charts and visual telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Fraud Trend Visualizer */}
                <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">
                        Fraud Telemetry &amp; Chargeback Curves
                      </h3>
                      <p className="text-[11px] text-slate-400">Comparing active alert volume against settlement chargeback incidents.</p>
                    </div>
                    <span className="text-[9px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded font-mono font-bold uppercase">7 Day Horizon</span>
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                        <XAxis dataKey="name" stroke={isDarkMode ? '#64748b' : '#94a3b8'} style={{ fontSize: 10, fontFamily: 'monospace' }} />
                        <YAxis stroke={isDarkMode ? '#64748b' : '#94a3b8'} style={{ fontSize: 10, fontFamily: 'monospace' }} />
                        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: '1px solid #e2e8f0', fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                        <Area type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2.5} name="Alert Anomalies" fillOpacity={1} fill="url(#colorAlerts)" />
                        <Area type="monotone" dataKey="chargebacks" stroke="#f59e0b" strokeWidth={2} name="Disputed Chargebacks" fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk Distribution Chart */}
                <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display mb-1">
                      Threat Factor Breakdown
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-6">Distribution of trigger signatures across the alert queue.</p>
                  </div>

                  <div className="h-44 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center">
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-widest">Risk Index</span>
                      <span className="text-xl font-extrabold text-slate-800 dark:text-white">COSMIC</span>
                    </div>
                  </div>

                  {/* Legend listing */}
                  <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    {distributionData.map((d, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-slate-600 dark:text-slate-400 font-medium">{d.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Grid 3: Subsidiary Telemetry (Country Heat Map, Devices, SLA Resolution Time) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sovereign Country High-Risk Vectors</h3>
                  <div className="space-y-3">
                    {[
                      { country: 'Nigeria', matches: 45, score: '94/100', color: 'bg-red-500' },
                      { country: 'North Korea', matches: 12, score: '99/100', color: 'bg-red-600' },
                      { country: 'Russia', matches: 28, score: '85/100', color: 'bg-red-400' },
                      { country: 'Brazil', matches: 62, score: '72/100', color: 'bg-amber-500' },
                      { country: 'Cayman Islands', matches: 19, score: '80/100', color: 'bg-red-400' }
                    ].map((c, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-slate-700 dark:text-slate-300">{c.country}</span>
                          <span className="text-slate-400">{c.matches} hits • <strong className="text-slate-700 dark:text-slate-300">{c.score}</strong></span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${c.color}`} style={{ width: `${parseInt(c.score)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Authentication Devices Profile</h3>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deviceDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          {deviceDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Tor Browser' || entry.name === 'Postman/API Automation' ? '#ef4444' : '#64748b'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Unrecognized API Automation:</span>
                      <span className="text-red-500 font-bold">High Threat</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Average Case Resolution SLA:</span>
                      <span className="text-emerald-500 font-bold">18.4 mins</span>
                    </div>
                  </div>
                </div>

                {/* Live Audit Log Stream within the Module Dashboard */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Failsafe Action Audit</h3>
                      <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold">CRYPTOGRAPHIC SECURE</span>
                    </div>
                    <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                      {auditLogs.slice(0, 4).map((log, idx) => (
                        <div key={idx} className="border-l-2 border-slate-200 dark:border-slate-800 pl-3 py-0.5 text-left">
                          <div className="flex justify-between text-[9px] text-slate-400">
                            <span className="font-mono font-semibold">{log.action}</span>
                            <span>{log.timestamp.slice(11)}</span>
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-normal">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      onToast('Audit ledger integrity verified via SHA-256 chain anchors.', 'success');
                    }}
                    className="mt-4 w-full text-center py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 transition-all"
                  >
                    VERIFY AUDIT LEDGER CHAIN
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 2: ALERTS MATRIX ==================== */}
          {activeSubTab === 'fraud-alerts' && (
            <div className="space-y-6 text-left">
              
              {/* Alert Matrix Query Filters */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Forensic Filter Engine</span>
                  </div>
                  <button 
                    onClick={() => {
                      setFilterSeverity('ALL');
                      setFilterType('ALL');
                      setFilterInvestigator('ALL');
                      setFilterSearch('');
                      onToast('Clear Filters complete.', 'info');
                    }}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    Reset Query Filters
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Severity</label>
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    >
                      <option value="ALL">All Severities</option>
                      <option value="CRITICAL">Critical Only</option>
                      <option value="HIGH">High Severity</option>
                      <option value="MEDIUM">Medium Severity</option>
                      <option value="LOW">Low Severity</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alert Signature Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    >
                      <option value="ALL">All Signatures</option>
                      <option value="Impossible Travel">Impossible Travel</option>
                      <option value="Multiple Failed OTP Attempts">Multiple Failed OTPs</option>
                      <option value="Velocity Spike">Velocity Spike</option>
                      <option value="Rapid Transfers">Rapid Transfers</option>
                      <option value="Device Change">Device Changes</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Investigator Assigned</label>
                    <select
                      value={filterInvestigator}
                      onChange={(e) => setFilterInvestigator(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                    >
                      <option value="ALL">All Operators</option>
                      <option value="Sarah Jenkins">Sarah Jenkins</option>
                      <option value="John Doe">John Doe</option>
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Text Search</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        placeholder="Search ID, Customer, Country..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts Data Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="p-3">Alert ID</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3 text-center">Score</th>
                        <th className="p-3">Alert Type</th>
                        <th className="p-3">Wallet / Card</th>
                        <th className="p-3">Country</th>
                        <th className="p-3">Assigned Operator</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/85 text-xs font-semibold">
                      {filteredAlerts.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-slate-400">
                            No alerts matching filter options found. Live stream radar remains active in background.
                          </td>
                        </tr>
                      ) : (
                        filteredAlerts.map(alert => {
                          const isCritical = alert.severity === 'CRITICAL';
                          const isHigh = alert.severity === 'HIGH';
                          
                          return (
                            <tr key={alert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                              <td className="p-3 font-mono text-[11px] text-slate-900 dark:text-white">
                                <div className="flex items-center gap-1.5">
                                  <span>{alert.id}</span>
                                  <button 
                                    onClick={() => {
                                      // Search inside cases or create case
                                      const existingCase = cases.find(c => c.alertId === alert.id);
                                      if (existingCase) {
                                        setActiveCaseId(existingCase.id);
                                      } else {
                                        // Create a case
                                        const newCaseId = 'CASE-' + Math.floor(1000 + Math.random() * 9000);
                                        const newC: InvestigationCase = {
                                          id: newCaseId,
                                          alertId: alert.id,
                                          title: `Investigate ${alert.customerName} on ${alert.alertType}`,
                                          customerId: alert.customerId,
                                          customerName: alert.customerName,
                                          severity: alert.severity,
                                          status: 'ACTIVE',
                                          createdDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
                                          assignedInvestigator: 'Sarah Jenkins',
                                          notes: [alert.notes],
                                          evidence: [alert.alertType, 'IP: ' + alert.ipAddress],
                                          attachments: []
                                        };
                                        setCases(prev => [newC, ...prev]);
                                        setActiveCaseId(newCaseId);
                                      }
                                      onSelectTab('investigations');
                                      onToast(`Workspace loaded for ${alert.id}.`, 'success');
                                    }}
                                    className="p-1 rounded text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                    title="Open In Workspace Workspace"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isCritical 
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' 
                                    : isHigh 
                                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' 
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {alert.severity}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col">
                                  <span>{alert.customerName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{alert.customerId}</span>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`font-mono font-bold ${
                                  alert.riskScore > 80 ? 'text-red-600' : 'text-amber-500'
                                }`}>
                                  {alert.riskScore}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                                {alert.alertType}
                              </td>
                              <td className="p-3 font-mono text-[10px] text-slate-500">
                                <div className="flex flex-col">
                                  <span>W: {alert.relatedWallet}</span>
                                  <span>C: {alert.relatedCard}</span>
                                </div>
                              </td>
                              <td className="p-3">{alert.country}</td>
                              <td className="p-3">
                                <select
                                  value={alert.assignedInvestigator}
                                  onChange={(e) => handleAssignInvestigator(alert.id, e.target.value)}
                                  className="bg-transparent border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-700 dark:text-slate-300 font-semibold"
                                >
                                  <option value="Unassigned">Unassigned</option>
                                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                                  <option value="John Doe">John Doe</option>
                                </select>
                              </td>
                              <td className="p-3">
                                <select
                                  value={alert.status}
                                  onChange={(e) => handleAlertStatusUpdate(alert.id, e.target.value as Alert['status'])}
                                  className="bg-transparent border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide"
                                >
                                  <option value="OPEN">Open</option>
                                  <option value="INVESTIGATING">Investigation</option>
                                  <option value="ESCALATED">Escalated</option>
                                  <option value="CLOSED_RESOLVED">Closed resolved</option>
                                  <option value="CLOSED_FALSE_POSITIVE">False Positive</option>
                                </select>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center gap-1.5 justify-center">
                                  {/* Quick Actions */}
                                  <button 
                                    onClick={() => handleFreezeWallet(alert.customerId, alert.customerName)}
                                    className="p-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/50"
                                    title="Freeze Wallet Hold"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleCreateComplianceCase(alert.customerId, alert.customerName, `SAR alert triggered on ${alert.alertType}`)}
                                    className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                    title="Dispatch compliance filing"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleAlertStatusUpdate(alert.id, 'CLOSED_FALSE_POSITIVE')}
                                    className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                                    title="Mark False Positive"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 3: LIVE RISK MONITOR ==================== */}
          {activeSubTab === 'risk-monitoring' && (
            <div className="space-y-6 text-left">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Live Activity Log Stream */}
                <div className="col-span-12 lg:col-span-8 bg-slate-950 text-slate-100 rounded-xl border border-slate-900 shadow-2xl flex flex-col min-h-[480px]">
                  
                  {/* Console header */}
                  <div className="px-5 py-3.5 border-b border-slate-900 bg-slate-900/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-mono font-bold text-slate-200">live-threat-monitor-daemon.sh</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">LIVE STREAM FEED ACTIVE</span>
                      </div>
                      <button
                        onClick={() => setLiveEvents([])}
                        className="p-1 rounded hover:bg-slate-900 text-slate-500 hover:text-slate-300"
                        title="Clear console logs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Console logs */}
                  <div className="flex-1 p-5 font-mono text-[11px] space-y-3 overflow-y-auto max-h-[450px] custom-scrollbar text-left">
                    {liveEvents.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-20">
                        <Activity className="w-8 h-8 text-slate-700 animate-pulse mb-2" />
                        <span>Radar stream currently idle. Live system events will output here as customer transactions execute.</span>
                      </div>
                    ) : (
                      liveEvents.map((evt, idx) => {
                        let textClass = 'text-slate-300';
                        if (evt.riskDelta > 80) textClass = 'text-red-400 font-bold';
                        else if (evt.riskDelta > 50) textClass = 'text-amber-400 font-semibold';

                        return (
                          <div key={idx} className={`p-2 bg-slate-900/30 hover:bg-slate-900/70 rounded border border-slate-900/50 flex flex-col md:flex-row md:items-center md:justify-between gap-2 transition-all ${textClass}`}>
                            <div className="space-y-0.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 font-medium">[{evt.time}]</span>
                                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded text-[9px] uppercase tracking-wider">{evt.type}</span>
                                <span className="font-semibold text-slate-200">{evt.customer}</span>
                                <span className="text-slate-500">({evt.country})</span>
                              </div>
                              <p className="text-slate-400 leading-normal font-medium">{evt.description}</p>
                            </div>
                            <div className="flex items-center gap-3 justify-end">
                              <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{evt.device}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                                evt.riskDelta > 80 ? 'bg-red-950/60 text-red-400 border border-red-900' : 'bg-slate-800 text-slate-400'
                              }`}>
                                Risk: +{evt.riskDelta}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>

                {/* Simulated live threat dashboard metrics (Col 4) */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  
                  {/* Immediate Actions for Live radar anomalies */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Immediate Risk Mitigations</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      Select instant failsafe protocols. Audits are recorded cryptographically.
                    </p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          const customer = prompt("Enter customer ID to freeze wallets globally (e.g. CUST-3829):");
                          if (customer) {
                            handleFreezeWallet(customer, "Customer Requested Hold");
                          }
                        }}
                        className="w-full flex items-center justify-between p-3 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 shrink-0" />
                          <span>Global Asset Wallet Lock</span>
                        </div>
                        <span className="font-mono text-[9px] uppercase">FAILSafe 01</span>
                      </button>

                      <button 
                        onClick={() => {
                          const customer = prompt("Enter customer ID to freeze all connected cards:");
                          if (customer) {
                            handleFreezeCard(customer, "Customer Requested Card Suspend");
                          }
                        }}
                        className="w-full flex items-center justify-between p-3 border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 shrink-0" />
                          <span>Instant Issuing Cards Lock</span>
                        </div>
                        <span className="font-mono text-[9px] uppercase">FAILSafe 02</span>
                      </button>

                      <button 
                        onClick={() => {
                          const device = prompt("Enter Device ID or signature to block globally:");
                          if (device) {
                            logInvestigatorAction('BLOCK_DEVICE', device, `Blocked device signature globally.`);
                            onToast(`Blocked device signature: ${device}. Match will trigger hard decline.`, 'success');
                          }
                        }}
                        className="w-full flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Laptop className="w-4 h-4 shrink-0" />
                          <span>Device Fingerprint Blocklist</span>
                        </div>
                        <span className="font-mono text-[9px] uppercase">FAILSafe 03</span>
                      </button>
                    </div>
                  </div>

                  {/* Threat feed stats */}
                  <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">System Radar Metrics</span>
                    <div className="space-y-4 pt-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>API Request Strain</span>
                          <span className="font-mono font-bold text-red-400">920/sec</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>VPN / Tor Routing Factor</span>
                          <span className="font-mono font-bold text-amber-400">14% of load</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }} />
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-normal">
                        System automatically flags VPN routing that mismatch residential profile caches.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 4: INVESTIGATION WORKSPACE ==================== */}
          {activeSubTab === 'investigations' && (
            <div className="space-y-6 text-left">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Cases List Sidebar inside workspace */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Cases Queue</h3>
                  <div className="space-y-3">
                    {cases.map(c => {
                      const isActive = c.id === activeCaseId;
                      const isResolved = c.status.startsWith('RESOLVED');
                      return (
                        <div 
                          key={c.id}
                          onClick={() => setActiveCaseId(c.id)}
                          className={`p-4 rounded-xl border transition-all text-left cursor-pointer ${
                            isActive
                              ? 'bg-slate-950 text-white border-slate-900 shadow-lg'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400">{c.id}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              c.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {c.severity}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold truncate">{c.title}</h4>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-3 border-t border-slate-100 dark:border-slate-800 pt-2">
                            <span>Owner: {c.customerName}</span>
                            <span className={`font-bold ${isResolved ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {c.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Case workspace console */}
                <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  
                  {/* Case Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">Active dossier: {activeCase.id} • Alert ref {activeCase.alertId}</span>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">{activeCase.title}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleResolveCase(activeCase.id, 'FRAUD')}
                        disabled={activeCase.status.startsWith('RESOLVED')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                      >
                        RESOLVE AS FRAUD
                      </button>
                      <button 
                        onClick={() => handleResolveCase(activeCase.id, 'BENIGN')}
                        disabled={activeCase.status.startsWith('RESOLVED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                      >
                        CLOSE AS FALSE POSITIVE
                      </button>
                    </div>
                  </div>

                  {/* Customer Scoring Radar Overview */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Multi-Factor Risk Scoring Map</h3>
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-center">
                      <div className="p-2 bg-white dark:bg-slate-900 border rounded">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Behavior</span>
                        <span className="text-sm font-extrabold text-red-600">88/100</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 border rounded">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Transaction</span>
                        <span className="text-sm font-extrabold text-red-600">92/100</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 border rounded">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Device</span>
                        <span className="text-sm font-extrabold text-amber-600">74/100</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 border rounded">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                        <span className="text-sm font-extrabold text-red-600">99/100</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 border rounded">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">AML</span>
                        <span className="text-sm font-extrabold text-slate-500">12/100</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 border rounded">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Velocity</span>
                        <span className="text-sm font-extrabold text-red-600">91/100</span>
                      </div>
                      <div className="p-2 bg-red-600 text-white rounded font-bold shadow-md shadow-red-500/10">
                        <span className="text-[9px] uppercase block">OVERALL</span>
                        <span className="text-sm font-extrabold">94/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Relationship Map / Visualizer Network placeholder */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Network className="w-4 h-4 text-blue-500" />
                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Relationship Mapping</h3>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">1 Connected Hub Match</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-6 flex flex-col md:flex-row items-center justify-center gap-6 min-h-[140px] relative overflow-hidden border">
                      <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-950 border-2 border-red-500 rounded shadow-md z-10 w-36">
                        <span className="text-[9px] font-bold text-red-500 uppercase">Primary Suspect</span>
                        <span className="text-xs font-bold mt-1 text-slate-800 dark:text-white truncate max-w-full">{activeCase.customerName}</span>
                        <span className="text-[8px] text-slate-400 font-mono mt-0.5">{activeCase.customerId}</span>
                      </div>

                      <div className="hidden md:block h-0.5 w-16 bg-gradient-to-r from-red-500 to-amber-500 relative">
                        <span className="absolute -top-2 left-1.5 text-[8px] bg-slate-900 text-white px-1 py-0.2 rounded font-mono font-semibold">IP Match</span>
                      </div>

                      <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-950 border border-amber-500 rounded shadow-md z-10 w-36">
                        <span className="text-[9px] font-bold text-amber-500 uppercase font-mono">Suspicious IP</span>
                        <span className="text-xs font-bold mt-1 text-slate-800 dark:text-white">102.89.44.12</span>
                        <span className="text-[8px] text-slate-400 font-mono mt-0.5">Lagos, Nigeria</span>
                      </div>
                    </div>
                  </div>

                  {/* Internal Notes and Evidence Locker Tabs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Notes Workspace */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Internal Collaboration Notes</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={caseNoteInput}
                          onChange={(e) => setCaseNoteInput(e.target.value)}
                          placeholder="Add forensic evidence comment..."
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          onClick={handleAddCaseNote}
                          className="px-3 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          Comment
                        </button>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {activeCase.notes.map((note, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg text-left">
                            <span className="text-[9px] text-slate-400 font-bold block mb-1">SAR Investigator Log • {idx === 0 ? 'Just now' : 'Dossier Entry'}</span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{note}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evidence Locker */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-display">Locked Evidence Profiles</h3>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                        {activeCase.evidence.map((ev, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{ev}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1.5">Evidence Attachments</span>
                        {activeCase.attachments.length === 0 ? (
                          <span className="text-[10px] text-slate-400">No telemetry raw files attached.</span>
                        ) : (
                          activeCase.attachments.map((att, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-800/40 p-2 rounded text-[10px] font-mono">
                              <span>{att.name} ({att.size})</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 5: FROZEN ASSETS ==================== */}
          {activeSubTab === 'frozen-accounts' && (
            <div className="space-y-6 text-left">
              
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white font-display text-sm">Frozen Asset Ledger</h3>
                    <p className="text-xs text-slate-400">Restricted custody balances under regulatory holding rules.</p>
                  </div>
                  <span className="text-[10px] font-mono text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 px-3 py-1 rounded font-bold uppercase">
                    Basel IV Compliance Locked
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="p-3">Asset ID</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Owner / Customer</th>
                        <th className="p-3">Frozen Time</th>
                        <th className="p-3">Compliance Justification</th>
                        <th className="p-3">Authorizing Investigator</th>
                        <th className="p-3 text-center">Failsafe Releases</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/85 text-xs font-semibold">
                      {frozenAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            No frozen custody holds active. All system ledgers operate normally.
                          </td>
                        </tr>
                      ) : (
                        frozenAccounts.map(frz => (
                          <tr key={frz.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="p-3 font-mono text-[11px] text-slate-900 dark:text-white">{frz.id}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                frz.type === 'Wallet' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400' 
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400'
                              }`}>
                                {frz.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span>{frz.ownerName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{frz.ownerId}</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-slate-500">{frz.frozenAt}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                              {frz.reason}
                            </td>
                            <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{frz.investigator}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleUnfreezeAccount(frz.id, frz.ownerName)}
                                className="flex items-center gap-1 mx-auto px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[10px] font-bold transition-all cursor-pointer"
                              >
                                <Unlock className="w-3 h-3" />
                                <span>RELEASE HOLD</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 6: VELOCITY RULES ==================== */}
          {activeSubTab === 'velocity-rules' && (
            <div className="space-y-6 text-left">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Rule List Checklist */}
                <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white font-display text-sm">Velocity &amp; Risk Rule Configurations</h3>
                      <p className="text-xs text-slate-400">Toggle system triggers to enforce continuous payment declines.</p>
                    </div>
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold font-mono">REAL-TIME INJECTION</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {rules.map(rule => (
                      <div key={rule.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{rule.name}</span>
                            <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-500 rounded font-mono font-bold uppercase">
                              {rule.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal max-w-xl font-medium">{rule.description}</p>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Threshold Parameter: <strong className="text-slate-600 dark:text-slate-300">{rule.threshold}</strong> • Triggers matching: <strong className="text-red-500">{rule.triggerCount} times</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleRule(rule.id)}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              rule.isActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border'
                            }`}
                          >
                            {rule.isActive ? 'Enforced' : 'Paused'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adjust Threshold limits block */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Threshold Adjustments</h3>
                    
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Max Failed OTP Limit</span>
                          <span className="font-mono font-bold text-blue-600">{cardLimitValue} attempts</span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={10}
                          value={cardLimitValue}
                          onChange={(e) => {
                            setCardLimitValue(parseInt(e.target.value));
                            onToast('Updated Failed OTP attempts threshold limit.', 'info');
                          }}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                        <span className="text-[9px] text-slate-400 block">Failsafe triggers automatically above this configuration.</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Large Outward Amount Limit</span>
                          <span className="font-mono font-bold text-blue-600">${amountThresholdValue.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min={1000}
                          max={100000}
                          step={5000}
                          value={amountThresholdValue}
                          onChange={(e) => {
                            setAmountThresholdValue(parseInt(e.target.value));
                            onToast('Updated amount limits for compliance sweep.', 'info');
                          }}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        />
                        <span className="text-[9px] text-slate-400 block">Outward flows above threshold trigger immediate audit case.</span>
                      </div>
                    </div>
                  </div>

                  {/* Basel Standards details */}
                  <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 text-left">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Rule Ledger Coverage</span>
                    <div className="mt-4 space-y-3 text-[11px] text-slate-300">
                      <div className="flex justify-between">
                        <span>Total Rules matching:</span>
                        <span>7 active</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Audit Coverage Factor:</span>
                        <span className="text-emerald-400 font-bold">100% compliant</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failsafe Sync latency:</span>
                        <span className="font-mono">1.2ms</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB 7: AML RISK LEDGER ==================== */}
          {activeSubTab === 'aml-risk' && (
            <div className="space-y-6 text-left">
              
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white font-display text-sm">Anti-Money Laundering (AML) &amp; PEP Screenings</h3>
                    <p className="text-xs text-slate-400">Continuous scanning checks against OFAC and FinCEN sanctions list feeds.</p>
                  </div>
                  <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 px-2.5 py-1 rounded font-bold uppercase font-mono">
                    2 Anomalies Identified
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/40 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="text-left space-y-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Siddharth Nair Sanctions Trigger</span>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          High confidence watchlist check matching name structure on OFAC list segment A2. Flagged for immediate investigator re-verification callback.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <button 
                            onClick={() => handleCreateComplianceCase('CUST-7011', 'Siddharth Nair', 'OFAC Screening remediation')}
                            className="text-[10px] bg-red-600 text-white font-bold px-2.5 py-1 rounded cursor-pointer"
                          >
                            DISPATCH COMPLIANCE SAR FILING
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/40 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div className="text-left space-y-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Alexander Wright Clear Dossier</span>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Passed primary and secondary FinCEN automated matching rules. High volume commercial participant with low threat behavior indices.
                        </p>
                        <span className="text-[10px] text-emerald-600 font-bold block pt-1">Cleared 2026-07-08</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 8: BEHAVIORAL RADAR ==================== */}
          {activeSubTab === 'behavior-analytics' && (
            <div className="space-y-6 text-left">
              
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white font-display text-sm mb-2">Behavioral Radar &amp; Device Fingerprinting</h3>
                <p className="text-xs text-slate-400 mb-6">Auditing connection patterns, user agents, and IP subnet ranges.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/40 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Failed OTP Heat Factor</span>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-3xl font-extrabold text-slate-800 dark:text-white">18</span>
                      <span className="text-xs font-semibold text-slate-400">failures/min</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '70%' }} />
                    </div>
                    <p className="text-[10px] text-slate-500">Postman automated script checks active on Elena Rostova endpoints.</p>
                  </div>

                  <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/40 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Impossible Travel Matches</span>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-3xl font-extrabold text-slate-800 dark:text-white">1</span>
                      <span className="text-xs font-semibold text-slate-400">critical incident</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full animate-pulse" style={{ width: '90%' }} />
                    </div>
                    <p className="text-[10px] text-slate-500">Marcus Sterling logged in Lagos (NG) shortly after Chicago check.</p>
                  </div>

                  <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/40 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Multi-Account Handshakes</span>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-3xl font-extrabold text-slate-800 dark:text-white">0</span>
                      <span className="text-xs font-semibold text-slate-400">hardware sharing</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <p className="text-[10px] text-slate-500">All registered devices are single-bound to explicit user owners.</p>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 9: SECURITY WATCHLISTS ==================== */}
          {activeSubTab === 'watchlists' && (
            <div className="space-y-6 text-left">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Watchlists List Table */}
                <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-white font-display text-sm mb-4">Security Blocklists &amp; Watchlists</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="p-3">Block Type</th>
                          <th className="p-3">Target Value</th>
                          <th className="p-3">Added By</th>
                          <th className="p-3">Date</th>
                          <th className="p-3 text-center">Failsafe Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/85 text-xs font-semibold">
                        {watchlists.map((w, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                {w.type}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-800 dark:text-white">{w.value}</td>
                            <td className="p-3 text-slate-500">{w.addedBy}</td>
                            <td className="p-3 font-mono text-slate-400">{w.date}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleRemoveWatchlist(w.value)}
                                className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer mx-auto block"
                                title="Delete Blocklist entry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add entry form */}
                <div className="col-span-12 lg:col-span-4">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Add Watchlist Entry</h3>
                    <form onSubmit={handleAddWatchlist} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Blocklist Type</label>
                        <select
                          value={newWatchlistType}
                          onChange={(e) => setNewWatchlistType(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                        >
                          <option value="IP Address">IP Address</option>
                          <option value="Device Fingerprint">Device Fingerprint</option>
                          <option value="Merchant ID">Merchant ID</option>
                          <option value="Card Hash ID">Card Hash ID</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Value / Identity Address</label>
                        <input
                          type="text"
                          value={newWatchlistValue}
                          onChange={(e) => setNewWatchlistValue(e.target.value)}
                          placeholder="e.g. 192.168.1.1 or FP-Samsung-Fold5"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full text-center py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        Enforce Watchlist Entry
                      </button>
                    </form>
                  </div>
                </div>

              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}
