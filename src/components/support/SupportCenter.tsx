import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Filter, SlidersHorizontal, ArrowUpDown, ChevronDown, Check, X, ShieldAlert, 
  FileText, Activity, Ticket, MessageCircle, Mail, AlertTriangle, BookOpen, Terminal, 
  Clock, Send, Eye, ShieldCheck, UserCheck, Lock, Unlock, Landmark, RotateCcw, Plus, 
  Trash2, ArrowRight, CornerUpRight, Zap, RefreshCw, Star, Info, MoreHorizontal, 
  MessageSquare, AlertOctagon, HelpCircle, CheckCircle, FileSpreadsheet, Download, 
  Paperclip, Smile, Shield, File, ThumbsUp, BarChart2, Award, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- MOCK CONSTANTS & STORAGE KEYS ---
const STORAGE_KEYS = {
  TICKETS: 'walletpro_support_tickets',
  CASES: 'walletpro_support_cases',
  CHAT_SESSIONS: 'walletpro_support_chats',
  SLA_CONFIG: 'walletpro_support_sla_config',
  AUDIT_TRAIL: 'walletpro_support_audit'
};

// Default Customer Data Links
const SUPPORT_CUSTOMERS = [
  { id: 'CUST-8201', name: 'Alexander Wright', email: 'alex.wright@enterprise.com', phone: '+1 (555) 234-5678', country: 'United States', walletId: 'W-USD-01', riskScore: 12, tier: 'VIP', kyc: 'Verified' },
  { id: 'CUST-4039', name: 'Elena Rostova', email: 'elena.rostova@berlin-tech.de', phone: '+49 170 9876543', country: 'Germany', walletId: 'W-EUR-02', riskScore: 28, tier: 'Tier 3', kyc: 'Verified' },
  { id: 'CUST-1049', name: 'Devon Kenji', email: 'd.kenji@tokyo-funds.jp', phone: '+81 90 1234 5678', country: 'Japan', walletId: 'W-JPY-01', riskScore: 78, tier: 'Tier 2', kyc: 'Pending' },
  { id: 'CUST-2901', name: 'Zahra Al-Mansoor', email: 'zahra.m@dubaiholdings.ae', phone: '+971 50 123 4567', country: 'UAE', walletId: 'W-AED-05', riskScore: 5, tier: 'VIP', kyc: 'Verified' },
  { id: 'CUST-5512', name: 'Mateo Silva', email: 'mateo.silva@brazil-export.br', phone: '+55 11 98765-4321', country: 'Brazil', walletId: 'W-BRL-03', riskScore: 45, tier: 'Tier 1', kyc: 'Failed' }
];

// Seed Support Tickets
const INITIAL_TICKETS = [
  {
    id: 'TKT-1049',
    customerId: 'CUST-8201',
    customerName: 'Alexander Wright',
    customerEmail: 'alex.wright@enterprise.com',
    subject: 'Increase transaction limit request - Q3 Volume Expansion',
    category: 'Limits',
    priority: 'High',
    status: 'Open',
    assignedAgent: 'Marcus Vance',
    createdTime: '2026-07-09 11:30',
    updatedTime: '2026-07-09 13:45',
    slaRemaining: '4h 15m',
    slaBreached: false,
    conversation: [
      { id: 'm1', sender: 'customer', senderName: 'Alexander Wright', message: 'Hello, our trading desk expects high payout volumes this quarter. Can we double our daily card settlement limit?', timestamp: '2026-07-09 11:30' },
      { id: 'm2', sender: 'agent', senderName: 'Marcus Vance', message: 'Hi Alexander, I have received your request. I am initiating an assessment of your account volumes and will update you shortly.', timestamp: '2026-07-09 13:45' }
    ],
    internalNotes: [
      { id: 'n1', author: 'Marcus Vance', text: 'Checked user risk score: 12 (Very Low). Safe to proceed pending compliance team approval.', timestamp: '2026-07-09 13:50' }
    ],
    auditTimeline: [
      { id: 'a1', action: 'Ticket Created', user: 'Alexander Wright', timestamp: '2026-07-09 11:30' },
      { id: 'a2', action: 'Assigned to Marcus Vance', user: 'System Auto-Route', timestamp: '2026-07-09 11:35' },
      { id: 'a3', action: 'Reply Sent', user: 'Marcus Vance', timestamp: '2026-07-09 13:45' }
    ]
  },
  {
    id: 'TKT-2034',
    customerId: 'CUST-1049',
    customerName: 'Devon Kenji',
    customerEmail: 'd.kenji@tokyo-funds.jp',
    subject: 'Identity validation failure during selfie biometric check',
    category: 'Verification Follow-up',
    priority: 'Critical',
    status: 'Pending',
    assignedAgent: 'Sophia Lin',
    createdTime: '2026-07-09 08:20',
    updatedTime: '2026-07-09 09:12',
    slaRemaining: 'Breached',
    slaBreached: true,
    conversation: [
      { id: 'm3', sender: 'customer', senderName: 'Devon Kenji', message: 'My KYC failed three times. It says selfie camera glare is too high. Can I upload an offline dossier?', timestamp: '2026-07-09 08:20' },
      { id: 'm4', sender: 'system', senderName: 'SLA Engine', message: 'Response target limit breached for high-tier queue.', timestamp: '2026-07-09 09:00' }
    ],
    internalNotes: [
      { id: 'n2', author: 'Sophia Lin', text: 'High risk score (78). Manual ID verification is required. Awaiting scan from compliance.', timestamp: '2026-07-09 09:12' }
    ],
    auditTimeline: [
      { id: 'a4', action: 'Ticket Created', user: 'Devon Kenji', timestamp: '2026-07-09 08:20' },
      { id: 'a5', action: 'SLA Target Breached', user: 'SLA Engine', timestamp: '2026-07-09 09:00' }
    ]
  },
  {
    id: 'TKT-3091',
    customerId: 'CUST-4039',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@berlin-tech.de',
    subject: 'Refund Request: AWS Cloud Double-Billing Settlement Error',
    category: 'Refund Request',
    priority: 'Medium',
    status: 'Open',
    assignedAgent: 'Unassigned',
    createdTime: '2026-07-09 14:00',
    updatedTime: '2026-07-09 14:00',
    slaRemaining: '12h 45m',
    slaBreached: false,
    conversation: [
      { id: 'm5', sender: 'customer', senderName: 'Elena Rostova', message: 'The direct SEPA debit for AWS host services was charged twice. Please check the ledger record TX-402.', timestamp: '2026-07-09 14:00' }
    ],
    internalNotes: [],
    auditTimeline: [
      { id: 'a6', action: 'Ticket Created', user: 'Elena Rostova', timestamp: '2026-07-09 14:00' }
    ]
  },
  {
    id: 'TKT-4122',
    customerId: 'CUST-5512',
    customerName: 'Mateo Silva',
    customerEmail: 'mateo.silva@brazil-export.br',
    subject: 'Card Blocked at POS Terminal - Urgent cargo fuel payment',
    category: 'Card Issue',
    priority: 'Critical',
    status: 'Open',
    assignedAgent: 'Marcus Vance',
    createdTime: '2026-07-09 14:22',
    updatedTime: '2026-07-09 14:25',
    slaRemaining: '0h 35m',
    slaBreached: false,
    conversation: [
      { id: 'm6', sender: 'customer', senderName: 'Mateo Silva', message: 'I am at the fuel terminal. Card was declined. Cargo is blocked. Please unlock immediately!', timestamp: '2026-07-09 14:22' }
    ],
    internalNotes: [],
    auditTimeline: [
      { id: 'a7', action: 'Ticket Created', user: 'Mateo Silva', timestamp: '2026-07-09 14:22' },
      { id: 'a8', action: 'Routed to Escalation Desk', user: 'System Risk Engine', timestamp: '2026-07-09 14:25' }
    ]
  },
  {
    id: 'TKT-5591',
    customerId: 'CUST-2901',
    customerName: 'Zahra Al-Mansoor',
    customerEmail: 'zahra.m@dubaiholdings.ae',
    subject: 'Corporate wire transfer clearance delay - USD 250,000.00',
    category: 'Wallet Freeze',
    priority: 'High',
    status: 'Resolved',
    assignedAgent: 'Sarah Jenkins',
    createdTime: '2026-07-08 10:15',
    updatedTime: '2026-07-08 15:30',
    slaRemaining: 'Resolved',
    slaBreached: false,
    conversation: [
      { id: 'm7', sender: 'customer', senderName: 'Zahra Al-Mansoor', message: 'Hello, the wire settlement of USD 250k hasn’t appeared. Can you trace this?', timestamp: '2026-07-08 10:15' },
      { id: 'm8', sender: 'agent', senderName: 'Sarah Jenkins', message: 'Hello Zahra, I have verified with our treasury desk. It was held by partner bank verification rules. It is now fully released.', timestamp: '2026-07-08 15:20' },
      { id: 'm9', sender: 'customer', senderName: 'Zahra Al-Mansoor', message: 'Perfect, confirmed receipt. Excellent service!', timestamp: '2026-07-08 15:30' }
    ],
    internalNotes: [
      { id: 'n3', author: 'Sarah Jenkins', text: 'Spoke with treasury specialist. Wire released manually under transaction auth code 9012.', timestamp: '2026-07-08 15:15' }
    ],
    auditTimeline: [
      { id: 'a9', action: 'Ticket Created', user: 'Zahra Al-Mansoor', timestamp: '2026-07-08 10:15' },
      { id: 'a10', action: 'Resolved', user: 'Sarah Jenkins', timestamp: '2026-07-08 15:30' }
    ]
  }
];

// Initial Support Cases
const INITIAL_CASES = [
  { id: 'CSE-9021', customerId: 'CUST-1049', customerName: 'Devon Kenji', subject: 'Identity Theft Investigation - Biometric mismatch', priority: 'High', status: 'Under Investigation', assignedTo: 'Compliance Team', createdTime: '2026-07-09 09:12' },
  { id: 'CSE-4211', customerId: 'CUST-5512', customerName: 'Mateo Silva', subject: 'Card Velocity Breach & Card Lock Analysis', priority: 'Medium', status: 'In Progress', assignedTo: 'Fraud Desk', createdTime: '2026-07-09 14:25' }
];

// Initial Chat Sessions
const INITIAL_CHATS = [
  {
    id: 'CHT-401',
    customerName: 'Alexander Wright',
    customerId: 'CUST-8201',
    lastMessage: 'Let me grab the passport scan now.',
    unread: true,
    typing: false,
    messages: [
      { sender: 'customer', text: 'Hi support team, I need to upload some secondary documentation for account tier upgrades.', timestamp: '14:10' },
      { sender: 'agent', text: 'Hello Alexander! I can certainly assist you with that. Please share the file here directly.', timestamp: '14:12' },
      { sender: 'customer', text: 'Let me grab the passport scan now.', timestamp: '14:15' }
    ]
  },
  {
    id: 'CHT-402',
    customerName: 'Elena Rostova',
    customerId: 'CUST-4039',
    lastMessage: 'Awesome, that worked perfectly.',
    unread: false,
    typing: false,
    messages: [
      { sender: 'customer', text: 'My secondary virtual card isn’t enabling contactless payments.', timestamp: '11:02' },
      { sender: 'agent', text: 'Virtual cards require the companion app pin syncing. I have synchronized it for you.', timestamp: '11:05' },
      { sender: 'customer', text: 'Awesome, that worked perfectly.', timestamp: '11:08' }
    ]
  }
];

// Default SLA Config values
const DEFAULT_SLA_CONFIG = {
  responseCritical: 15, // minutes
  responseHigh: 60,
  responseMedium: 240,
  responseLow: 480,
  resolutionCritical: 120, // minutes
  resolutionHigh: 360,
  resolutionMedium: 1440,
  resolutionLow: 2880
};

// Knowledge Base Articles
const KB_ARTICLES = [
  { id: 'kb1', category: 'Wallet Operations', title: 'How to Resolve Wallet Holds & Security Locks', views: 1420, rating: 4.8, description: 'Step-by-step resolution process for compliance-locked corporate wallets.' },
  { id: 'kb2', category: 'Limits', title: 'Q3 Volume Payout Limits Increase Request Procedure', views: 890, rating: 4.6, description: 'Guidelines on credit assessment parameters, tier structure requirements, and documentation needs.' },
  { id: 'kb3', category: 'Card Issue', title: 'Unblocking physical/virtual cards at checkout registers', views: 2310, rating: 4.9, description: 'Manual synchronization of CVV details and offline validation check solutions.' },
  { id: 'kb4', category: 'Compliance', title: 'Secondary documentation requirements for VIP onboarding', views: 650, rating: 4.2, description: 'Instructions for passport scans, business registrations, tax filings and utility bills.' },
  { id: 'kb5', category: 'Refund Request', title: 'Reversing double AWS/Stripe merchant ledger records', views: 340, rating: 4.5, description: 'Standard treasury refund authorization parameters and credit back timings.' }
];

// Macros Repetitive Scripts
const MACROS = [
  { id: 'mac1', name: 'Password Reset Sequence', shortcut: '/pw-reset', category: 'Verification', content: 'Hello, I have initiated an automated password reset sequence for your primary administrator. Please inspect your registered email address inbox (and spam folder) for the authorization token.' },
  { id: 'mac2', name: 'Refund Request Acknowledged', shortcut: '/refund', category: 'Finance', content: 'Hello, I have audited your double-debit transaction log and verified the ledger discrepancy. I am routing this claim to our Treasury Clearance Desk to reverse the outflow back to your USD primary balance. Expect credits in 24-48 hours.' },
  { id: 'mac3', name: 'KYC Document Request', shortcut: '/kyc-docs', category: 'Compliance', content: 'Hello, our compliance team requires an updated proof of corporate address (such as a utility bill, bank register summary, or local tax receipt dated in the last 90 days) to lift the pending limit hold.' },
  { id: 'mac4', name: 'Card Trigger Velocity Unlock', shortcut: '/card-issue', category: 'Cards', content: 'Hello, I checked your virtual card register. It was temporarily blocked by automated risk shields due to a merchant terminal timeout. I have reset your card velocity limits, and you can swipe safely now.' },
  { id: 'mac5', name: 'Wallet Hold Hold Explainer', shortcut: '/wallet-freeze', category: 'Compliance', content: 'Hello, your wallet account is under secondary manual verification due to high inbound volume. We appreciate your patience; our auditors are manually releasing transfers sequentially.' },
  { id: 'mac6', name: 'SLA Delay Acknowledgment', shortcut: '/followup', category: 'General', content: 'Hello, we are experiencing higher-than-average support volume. We have escalated your inquiry directly to our Operations Team. We anticipate resolving this in under 15 minutes.' }
];

export function SupportCenter({ activeSubTab, onToast, onSelectTab }: { activeSubTab: string; onToast: (msg: string, type: 'success' | 'warning' | 'info') => void; onSelectTab: (tab: string) => void }) {
  // Active role syncing
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

  // --- CORE STATE PERSISTENCE ---
  const [tickets, setTickets] = useState<any[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [cases, setCases] = useState<any[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASES);
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  const [chatSessions, setChatSessions] = useState<any[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [slaConfig, setSlaConfig] = useState<any>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SLA_CONFIG);
    return saved ? JSON.parse(saved) : DEFAULT_SLA_CONFIG;
  });

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SLA_CONFIG, JSON.stringify(slaConfig));
  }, [slaConfig]);

  // UI Selection States
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string>('CHT-401');
  const [chatInput, setChatInput] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [searchKbQuery, setSearchKbQuery] = useState('');
  const [selectedKbCategory, setSelectedKbCategory] = useState<string>('all');
  
  // Filtering and searching states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  // Sorting State
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter, priorityFilter, categoryFilter, agentFilter, countryFilter]);

  // Selected Ticket Object lookup
  const selectedTicket = useMemo(() => {
    return tickets.find(t => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  // Selected Chat Session lookup
  const activeChat = useMemo(() => {
    return chatSessions.find(c => c.id === activeChatId) || null;
  }, [chatSessions, activeChatId]);

  // Simulate typing indicator trigger when typing in live chat
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    if (chatInput.length > 0 && !isTyping) {
      setIsTyping(true);
      // Simulate typing timer
      const timer = setTimeout(() => setIsTyping(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [chatInput]);

  // Sorting helper
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 inline ml-1" />;
    return sortDirection === 'asc' 
      ? <ArrowUpDown className="w-3 h-3 text-blue-600 inline ml-1 rotate-180 transition-transform" />
      : <ArrowUpDown className="w-3 h-3 text-blue-600 inline ml-1 transition-transform" />;
  };

  // --- FILTERED TICKETS ---
  const filteredTickets = useMemo(() => {
    return tickets.filter(tx => {
      const matchSearch = !searchText || 
        tx.id.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.customerEmail.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.subject.toLowerCase().includes(searchText.toLowerCase());

      const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || tx.priority === priorityFilter;
      const matchCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      const matchAgent = agentFilter === 'all' || tx.assignedAgent === agentFilter;
      
      // Look up customer country
      const customer = SUPPORT_CUSTOMERS.find(c => c.id === tx.customerId);
      const matchCountry = countryFilter === 'all' || (customer && customer.country === countryFilter);

      return matchSearch && matchStatus && matchPriority && matchCategory && matchAgent && matchCountry;
    });
  }, [tickets, searchText, statusFilter, priorityFilter, categoryFilter, agentFilter, countryFilter]);

  // --- SORTED TICKETS ---
  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a: any, b: any) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTickets, sortField, sortDirection]);

  // --- PAGINATED TICKETS ---
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedTickets.slice(startIndex, startIndex + pageSize);
  }, [sortedTickets, currentPage]);

  const totalPages = Math.ceil(sortedTickets.length / pageSize);

  // --- KPI COMPUTATIONS ---
  const kpis = useMemo(() => {
    const open = tickets.filter(t => t.status === 'Open').length;
    const pending = tickets.filter(t => t.status === 'Pending').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const breached = tickets.filter(t => t.slaBreached).length;
    const critical = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Resolved').length;
    
    return { open, pending, resolved, breached, critical };
  }, [tickets]);

  // --- AUDIT TIMELINE EVENT RECORDER ---
  const recordAuditEvent = (ticketId: string, actionName: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          updatedTime: new Date().toISOString().replace('T', ' ').substr(0, 16),
          auditTimeline: [
            {
              id: `aud-${Math.random().toString(36).substr(2, 9)}`,
              action: actionName,
              user: activeRole,
              timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16)
            },
            ...t.auditTimeline
          ]
        };
      }
      return t;
    }));
  };

  // --- AGENT ACTIONS IMPLEMENTATION ---
  const handleAssignTicket = (ticketId: string, agent: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, assignedAgent: agent };
      }
      return t;
    }));
    recordAuditEvent(ticketId, `Reassigned Ticket to ${agent}`);
    onToast(`Ticket reassigned to ${agent} successfully.`, 'success');
  };

  const handleUpdateStatus = (ticketId: string, status: 'Open' | 'Pending' | 'Resolved') => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: status };
      }
      return t;
    }));
    recordAuditEvent(ticketId, `Changed Status to ${status}`);
    onToast(`Ticket status updated to ${status}.`, 'success');
  };

  const handleEscalateTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, priority: 'Critical', assignedAgent: 'Escalation Tier-2 Manager' };
      }
      return t;
    }));
    recordAuditEvent(ticketId, 'Escalated to Tier-2 Management Queue');
    onToast('Ticket successfully escalated to Tier-2 Queue.', 'warning');
  };

  const handleMergeTicket = (ticketId: string) => {
    recordAuditEvent(ticketId, 'Merged with secondary duplicated ticket request');
    onToast('Ticket marked as duplicate and successfully merged.', 'info');
  };

  const handleAddInternalNote = (ticketId: string) => {
    if (!internalNoteInput.trim()) return;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          internalNotes: [
            ...t.internalNotes,
            {
              id: `not-${Math.random().toString(36).substr(2, 9)}`,
              author: activeRole,
              text: internalNoteInput,
              timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16)
            }
          ]
        };
      }
      return t;
    }));
    recordAuditEvent(ticketId, 'Added Internal Review Note');
    setInternalNoteInput('');
    onToast('Internal note published successfully.', 'success');
  };

  const handleSendCustomerMessage = (ticketId: string, customMessage?: string) => {
    const textToSend = customMessage || replyInput;
    if (!textToSend.trim()) return;

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          conversation: [
            ...t.conversation,
            {
              id: `msg-${Math.random().toString(36).substr(2, 9)}`,
              sender: 'agent',
              senderName: `${activeRole} (Support)`,
              message: textToSend,
              timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16)
            }
          ]
        };
      }
      return t;
    }));
    recordAuditEvent(ticketId, 'Sent Outbound Customer Response');
    if (!customMessage) setReplyInput('');
    onToast('Response dispatched to customer balance dashboard.', 'success');
  };

  const handleRequestDocuments = (ticketId: string) => {
    const requestMessage = "OFFICIAL COMPLIANCE ACTION REQUIRED: Hello, we require clean high-resolution passport scans and utility bill receipts dated within 90 days. Please drag & drop these files inside your client cabinet.";
    handleSendCustomerMessage(ticketId, requestMessage);
    onToast('Compliance documentation request dispatched to client.', 'info');
  };

  const handleCreateCase = (type: 'Compliance' | 'Fraud', customerId: string, customerName: string, subject: string) => {
    const caseId = `CSE-${Math.floor(Math.random() * 9000) + 1000}`;
    const newCase = {
      id: caseId,
      customerId,
      customerName,
      subject: `${type} Assessment: ${subject}`,
      priority: 'High',
      status: 'In Progress',
      assignedTo: type === 'Compliance' ? 'Compliance Team' : 'Fraud Desk',
      createdTime: new Date().toISOString().replace('T', ' ').substr(0, 16)
    };
    setCases(prev => [newCase, ...prev]);
    onToast(`New ${type} Case ${caseId} created and synced.`, 'success');
  };

  // Chat actions
  const handleSendLiveChat = () => {
    if (!chatInput.trim()) return;
    setChatSessions(prev => prev.map(c => {
      if (c.id === activeChatId) {
        const updatedMsgs = [
          ...c.messages,
          { sender: 'agent', text: chatInput, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ];
        return {
          ...c,
          lastMessage: chatInput,
          messages: updatedMsgs,
          unread: false
        };
      }
      return c;
    }));
    
    const sentText = chatInput;
    setChatInput('');
    
    // Simulate interactive customer response after delay!
    setTimeout(() => {
      setChatSessions(prev => prev.map(c => {
        if (c.id === activeChatId) {
          const autoReplies = [
            "Thank you. I have retrieved the transaction code and sent the screenshot.",
            "That resolved my card block! It’s working at the checkout terminal now.",
            "I will forward the proof of address utility bill right now.",
            "Excellent support response. Let me know when the compliance review approves."
          ];
          const textReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
          return {
            ...c,
            lastMessage: textReply,
            messages: [
              ...c.messages,
              { sender: 'customer', text: textReply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ]
          };
        }
        return c;
      }));
      onToast('Incoming message received from customer.', 'info');
    }, 2500);
  };

  const handleApplyMacroToChat = (macroContent: string) => {
    setChatInput(macroContent);
    onToast('Macro loaded. Review before dispatching.', 'info');
  };

  // Knowledge Base Search Filter
  const filteredKbArticles = useMemo(() => {
    return KB_ARTICLES.filter(art => {
      const matchCategory = selectedKbCategory === 'all' || art.category === selectedKbCategory;
      const matchSearch = !searchKbQuery || 
        art.title.toLowerCase().includes(searchKbQuery.toLowerCase()) ||
        art.description.toLowerCase().includes(searchKbQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchKbQuery, selectedKbCategory]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      
      {/* HEADER BAR FOR SUPPORT CENTER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-bold text-lg text-slate-800 font-display flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <span>Support & Case Management Center</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-semibold px-2.5 py-0.5 rounded-full">
              SLA Engine v1.9 Active
            </span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Enterprise customer query dispatching, live compliance chat rooms, macro responder scripts, and real-time SLA metrics.
          </p>
        </div>
        
        {/* Role Sync status */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Active Role:</span>
          <span className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${
            activeRole === 'Super Administrator' ? 'bg-purple-50 text-purple-700 border-purple-100' :
            activeRole === 'Compliance Officer' ? 'bg-amber-50 text-amber-700 border-amber-100' :
            activeRole === 'Developer' ? 'bg-blue-50 text-blue-700 border-blue-100' :
            'bg-slate-50 text-slate-700 border-slate-100'
          }`}>
            {activeRole}
          </span>
        </div>
      </div>

      {/* RENDER DYNAMIC SUPPORT SUB-TAB VIEW */}
      <div className="flex-1 flex flex-col">
        
        {/* TAB 1: SUPPORT DASHBOARD */}
        {activeSubTab === 'support-dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">Open Tickets</span>
                <div className="text-2xl font-bold text-slate-800 mt-1">{kpis.open}</div>
                <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active queue
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">Pending Tasks</span>
                <div className="text-2xl font-bold text-amber-600 mt-1">{kpis.pending}</div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  Awaiting compliance doc approval
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">Resolved Today</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">{kpis.resolved}</div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                  CSAT average: 4.85 / 5.0
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">Critical Escalations</span>
                <div className="text-2xl font-bold text-red-600 mt-1">{kpis.critical}</div>
                <div className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold">
                  Awaiting review
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">SLA compliance</span>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {Math.round(((tickets.length - kpis.breached) / (tickets.length || 1)) * 100)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Target: 98% enterprise standard
                </div>
              </div>
            </div>

            {/* CHARTS CONTAINER - HIGH DENSITY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Ticket Volume & SLA Status */}
              <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 flex flex-col">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono mb-4 flex items-center justify-between">
                  <span>SLA Response & Resolution Speeds</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Past 24 Hours</span>
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: '08:00', ResponseTime: 12, ResolutionTime: 95, Volume: 4 },
                      { name: '10:00', ResponseTime: 14, ResolutionTime: 110, Volume: 6 },
                      { name: '12:00', ResponseTime: 18, ResolutionTime: 135, Volume: 9 },
                      { name: '14:00', ResponseTime: 15, ResolutionTime: 120, Volume: 11 },
                      { name: '16:00', ResponseTime: 11, ResolutionTime: 90, Volume: 7 },
                      { name: '18:00', ResponseTime: 9, ResolutionTime: 85, Volume: 5 },
                    ]}>
                      <defs>
                        <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="ResponseTime" name="Avg Response (Min)" stroke="#2563eb" fillOpacity={1} fill="url(#colorResp)" />
                      <Line type="monotone" dataKey="ResolutionTime" name="Avg Resolution (Min)" stroke="#0d9488" strokeWidth={2} />
                      <Bar dataKey="Volume" name="Incoming Tickets" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Support Categories and Workload */}
              <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 flex flex-col">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono mb-4">
                  Top Ticket Categories
                </h3>
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  {[
                    { name: 'KYC Document Re-submissions', count: 18, pct: 38, color: 'bg-blue-600' },
                    { name: 'Card Block Velcoity Resets', count: 14, pct: 29, color: 'bg-emerald-600' },
                    { name: 'Transaction Limit Increases', count: 9, pct: 19, color: 'bg-amber-600' },
                    { name: 'SEPA wire ledger claims', count: 7, pct: 14, color: 'bg-indigo-600' }
                  ].map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">{cat.name}</span>
                        <span className="text-slate-800">{cat.count} ({cat.pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${cat.color}`} style={{ width: `${cat.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AGENT WORKLOAD STATUS GRID */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider font-mono">
                  Agent Workload & Performance Registry
                </h3>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded font-semibold flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Monitoring
                </span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { name: 'Marcus Vance', role: 'Limits Analyst', active: 3, resolved: 14, time: '11m', csat: '4.9/5.0', status: 'Online' },
                  { name: 'Sophia Lin', role: 'Compliance Specialist', active: 5, resolved: 8, time: '28m', csat: '4.7/5.0', status: 'In Call' },
                  { name: 'Sarah Jenkins', role: 'Treasury Advocate', active: 2, resolved: 11, time: '18m', csat: '4.9/5.0', status: 'Online' },
                  { name: 'Unassigned Queue', role: 'General Support Pool', active: 2, resolved: 42, time: 'N/A', csat: '4.5/5.0', status: 'Active' }
                ].map((ag, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{ag.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{ag.role}</p>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono ${
                        ag.status === 'Online' ? 'bg-emerald-100 text-emerald-800' :
                        ag.status === 'In Call' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ag.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/50">
                      <div>
                        <span className="text-[9px] text-slate-400 font-mono font-bold block uppercase">Active</span>
                        <span className="font-semibold text-slate-700">{ag.active} items</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-mono font-bold block uppercase">Speed</span>
                        <span className="font-semibold text-slate-700">{ag.time} response</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: TICKETS (ENTERPRISE DATA GRID & WORKFLOW) */}
        {activeSubTab === 'tickets' && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT AREA: TICKETS DATA GRID */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200 bg-white ${selectedTicketId ? 'hidden xl:flex xl:max-w-2xl' : 'flex'}`}>
              
              {/* FILTERS PANEL */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search ID, customer email, card, transaction, subject..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Quick Filters toggle */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <select 
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg focus:outline-none"
                    >
                      <option value="all">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>

                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-lg focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="Limits">Limits</option>
                      <option value="Verification Follow-up">Verification Follow-up</option>
                      <option value="Refund Request">Refund Request</option>
                      <option value="Card Issue">Card Issue</option>
                      <option value="Wallet Freeze">Wallet Freeze</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TICKETS LIST TABLE */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      <th className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('id')}>
                        Ticket ID {renderSortIcon('id')}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('customerName')}>
                        Customer {renderSortIcon('customerName')}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('subject')}>
                        Subject {renderSortIcon('subject')}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('priority')}>
                        Priority {renderSortIcon('priority')}
                      </th>
                      <th className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('status')}>
                        Status {renderSortIcon('status')}
                      </th>
                      <th className="px-4 py-3 text-right">SLA Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedTickets.map(tk => {
                      const isSelected = selectedTicketId === tk.id;
                      return (
                        <tr 
                          key={tk.id}
                          onClick={() => setSelectedTicketId(tk.id)}
                          className={`hover:bg-slate-50/80 cursor-pointer transition-all ${
                            isSelected ? 'bg-blue-50/60 font-semibold' : ''
                          }`}
                        >
                          <td className="px-4 py-3.5 font-mono text-slate-600">{tk.id}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-slate-800 block">{tk.customerName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{tk.customerEmail}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-slate-700 block truncate max-w-[150px]">{tk.subject}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded">
                              {tk.category}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tk.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                              tk.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {tk.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              tk.status === 'Open' ? 'bg-emerald-100 text-emerald-800 animate-pulse' :
                              tk.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {tk.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-medium">
                            {tk.slaBreached ? (
                              <span className="text-red-600 font-bold flex items-center justify-end gap-1">
                                <AlertTriangle className="w-3 h-3" /> Breached
                              </span>
                            ) : (
                              <span className={tk.status === 'Resolved' ? 'text-slate-400' : 'text-blue-600'}>
                                {tk.slaRemaining}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedTickets.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-medium">
                          No tickets matched specified queue filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS */}
              <div className="bg-slate-50/75 border-t border-slate-200/50 px-4 py-3 flex items-center justify-between text-xs text-slate-500 select-none">
                <div className="flex items-center gap-1">
                  <span>Showing</span>
                  <span className="font-semibold text-slate-800">
                    {sortedTickets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </span>
                  <span>to</span>
                  <span className="font-semibold text-slate-800">
                    {Math.min(currentPage * pageSize, sortedTickets.length)}
                  </span>
                  <span>of</span>
                  <span className="font-semibold text-slate-800">{sortedTickets.length}</span>
                  <span>entries</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-slate-600 transition cursor-pointer"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`px-3 py-1.5 rounded border font-semibold transition cursor-pointer ${
                        currentPage === idx + 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-slate-600 transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT AREA: TICKET CONVERSATION & ACTIONS PANEL */}
            <div className={`flex-1 flex flex-col h-full bg-slate-50 ${selectedTicketId ? 'flex' : 'hidden xl:flex xl:items-center xl:justify-center'}`}>
              
              {selectedTicket ? (
                <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
                  
                  {/* CHAT/CONVERSATION CHANNELS PANEL */}
                  <div className="flex-1 flex flex-col h-full overflow-hidden bg-white border-r border-slate-200">
                    
                    {/* TICKET CARD TOP BAR */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Active Conversation</span>
                        <h2 className="font-bold text-sm text-slate-800">{selectedTicket.subject}</h2>
                      </div>
                      <button 
                        onClick={() => setSelectedTicketId(null)}
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-400 xl:hidden"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* CONVERSATION MESSAGE LIST */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {selectedTicket.conversation.map((msg: any) => (
                        <div 
                          key={msg.id}
                          className={`flex flex-col max-w-[80%] ${
                            msg.sender === 'agent' ? 'ml-auto items-end' :
                            msg.sender === 'system' ? 'mx-auto items-center text-center w-full max-w-full' :
                            'mr-auto items-start'
                          }`}
                        >
                          <span className="text-[10px] text-slate-400 font-mono mb-1">
                            {msg.senderName} • {msg.timestamp}
                          </span>
                          
                          {msg.sender === 'system' ? (
                            <div className="bg-red-50 text-red-700 border border-red-100 text-xs py-1.5 px-4 rounded-full font-semibold">
                              ⚠️ {msg.message}
                            </div>
                          ) : (
                            <div className={`text-xs p-3 rounded-xl leading-relaxed ${
                              msg.sender === 'agent' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/50'
                            }`}>
                              {msg.message}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* CHAT INPUT AREA */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex gap-2">
                        <textarea
                          placeholder="Type customer reply message..."
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          rows={2}
                          className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleSendCustomerMessage(selectedTicket.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center cursor-pointer font-bold text-xs"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Macro Quick Picker */}
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase shrink-0">Apply Macro:</span>
                        {MACROS.slice(0, 3).map(mac => (
                          <button
                            key={mac.id}
                            onClick={() => setReplyInput(mac.content)}
                            className="text-[10px] font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2.5 py-1 rounded shrink-0 transition"
                          >
                            {mac.name}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* CUSTOMER DOSSIER & AGENT ACTIONS BAR */}
                  <div className="w-full md:w-80 h-full overflow-y-auto bg-slate-50 p-6 space-y-6">
                    
                    {/* CUSTOMER QUICK PROFILE */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                        Client Dossier
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                          {selectedTicket.customerName[0]}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800">{selectedTicket.customerName}</h5>
                          <p className="text-[10px] text-slate-400">{selectedTicket.customerEmail}</p>
                        </div>
                      </div>
                      
                      {/* Technical Identifiers */}
                      <div className="space-y-1.5 pt-2 text-[11px] border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-mono uppercase text-[9px] font-bold">Client ID:</span>
                          <span className="font-mono text-slate-700 font-semibold">{selectedTicket.customerId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-mono uppercase text-[9px] font-bold">KYC Status:</span>
                          <span className="text-emerald-600 font-semibold">Verified</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-mono uppercase text-[9px] font-bold">Risk Score:</span>
                          <span className="text-slate-700 font-semibold font-mono">12 (Low)</span>
                        </div>
                      </div>
                    </div>

                    {/* AGENT ACTIONS SELECTOR */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                        Agent Actions
                      </h4>
                      
                      <div className="space-y-2">
                        
                        {/* Assign Picker */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">Assigned Agent</label>
                          <select
                            value={selectedTicket.assignedAgent}
                            onChange={(e) => handleAssignTicket(selectedTicket.id, e.target.value)}
                            className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded"
                          >
                            <option value="Unassigned">Unassigned</option>
                            <option value="Marcus Vance">Marcus Vance</option>
                            <option value="Sophia Lin">Sophia Lin</option>
                            <option value="Sarah Jenkins">Sarah Jenkins</option>
                          </select>
                        </div>

                        {/* Status Change Picker */}
                        <div className="space-y-1 pt-1">
                          <label className="text-[9px] font-mono font-bold text-slate-400 uppercase">Ticket Status</label>
                          <div className="grid grid-cols-3 gap-1">
                            {['Open', 'Pending', 'Resolved'].map(st => (
                              <button
                                key={st}
                                onClick={() => handleUpdateStatus(selectedTicket.id, st as any)}
                                className={`text-[10px] font-bold py-1 px-1.5 rounded border text-center transition ${
                                  selectedTicket.status === st
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Document Request Button */}
                        <button
                          onClick={() => handleRequestDocuments(selectedTicket.id)}
                          className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 font-semibold transition"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Request KYC Uploads</span>
                        </button>

                        {/* Escalate button */}
                        <button
                          onClick={() => handleEscalateTicket(selectedTicket.id)}
                          className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 font-semibold transition"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Escalate SLA Target</span>
                        </button>

                        {/* Duplicate Merge button */}
                        <button
                          onClick={() => handleMergeTicket(selectedTicket.id)}
                          className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 font-semibold transition"
                        >
                          <Check className="w-3.5 h-3.5 text-slate-600" />
                          <span>Merge Duplicate Ticket</span>
                        </button>

                        {/* Create Case compliance / fraud */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleCreateCase('Compliance', selectedTicket.customerId, selectedTicket.customerName, selectedTicket.subject)}
                            className="text-[10px] bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold py-2 rounded-lg transition text-center"
                          >
                            Create AML Case
                          </button>
                          <button
                            onClick={() => handleCreateCase('Fraud', selectedTicket.customerId, selectedTicket.customerName, selectedTicket.subject)}
                            className="text-[10px] bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 font-bold py-2 rounded-lg transition text-center"
                          >
                            Create Fraud Case
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* INTERNAL NOTES WORKSPACE */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                        Internal Review Notes ({selectedTicket.internalNotes.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedTicket.internalNotes.map((nt: any) => (
                          <div key={nt.id} className="bg-slate-50 p-2.5 rounded-lg text-[11px] leading-relaxed border border-slate-100">
                            <div className="flex justify-between font-bold text-slate-600 mb-1">
                              <span>{nt.author}</span>
                              <span className="font-mono text-[9px] font-normal">{nt.timestamp}</span>
                            </div>
                            <p className="text-slate-700">{nt.text}</p>
                          </div>
                        ))}
                        {selectedTicket.internalNotes.length === 0 && (
                          <p className="text-[11px] text-slate-400 italic text-center">No internal memos logged.</p>
                        )}
                      </div>
                      
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          placeholder="Log team-only note..."
                          value={internalNoteInput}
                          onChange={(e) => setInternalNoteInput(e.target.value)}
                          className="flex-1 text-xs p-1.5 bg-slate-50 border border-slate-200 rounded"
                        />
                        <button
                          onClick={() => handleAddInternalNote(selectedTicket.id)}
                          className="bg-slate-800 text-white hover:bg-slate-900 font-bold px-2.5 rounded text-xs flex items-center justify-center cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    {/* AUDIT LOG TRAIL */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex justify-between">
                        <span>Audit Log Trail</span>
                        <span className="font-mono font-normal">({selectedTicket.auditTimeline.length})</span>
                      </h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto text-[11px]">
                        {selectedTicket.auditTimeline.map((aud: any) => (
                          <div key={aud.id} className="relative pl-3.5 border-l border-blue-200">
                            <span className="absolute left-[-4.5px] top-[4px] w-2 h-2 rounded-full bg-blue-500"></span>
                            <div className="font-bold text-slate-700 leading-none">{aud.action}</div>
                            <div className="text-[10px] text-slate-400 mt-1">By {aud.user} • {aud.timestamp}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                  <Ticket className="w-12 h-12 text-slate-300 mb-3 stroke-1" />
                  <p className="text-sm font-semibold">No Ticket Selected</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                    Select a support ticket from the active queue to view customer audit trails, conversational histories, and execute triage operations.
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 3: CASES */}
        {activeSubTab === 'support-cases' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800">Compliance & Fraud Support Cases</h3>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded font-bold uppercase">
                  {cases.length} Investigations Active
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {cases.map(cs => (
                  <div key={cs.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">{cs.id}</span>
                        <span className="text-xs font-bold text-slate-800">{cs.customerName}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold font-mono ${
                          cs.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {cs.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{cs.subject}</p>
                      <p className="text-[10px] text-slate-400">Created {cs.createdTime} • Assigned to <span className="font-semibold">{cs.assignedTo}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded">
                        {cs.status}
                      </span>
                      <button 
                        onClick={() => {
                          setCases(prev => prev.map(c => c.id === cs.id ? { ...c, status: 'Resolved' } : c));
                          onToast(`Case ${cs.id} marked as resolved.`, 'success');
                        }}
                        disabled={cs.status === 'Resolved'}
                        className="text-xs bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Resolve Case
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE CHAT */}
        {activeSubTab === 'live-chat' && (
          <div className="flex-1 flex overflow-hidden bg-white">
            
            {/* CONVERSATION LIST */}
            <div className="w-80 border-r border-slate-200 flex flex-col h-full bg-slate-50/50 shrink-0">
              <div className="p-4 border-b border-slate-200 bg-white">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">Live Chat Sessions</span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search active chatters..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
                {chatSessions.map(ch => {
                  const isActive = activeChatId === ch.id;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        setActiveChatId(ch.id);
                        setChatSessions(prev => prev.map(c => c.id === ch.id ? { ...c, unread: false } : c));
                      }}
                      className={`p-4 cursor-pointer transition flex items-start gap-3 hover:bg-slate-50 ${
                        isActive ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {ch.customerName[0]}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-slate-800 truncate">{ch.customerName}</span>
                          <span className="text-[9px] text-slate-400">14:15</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{ch.lastMessage}</p>
                      </div>
                      {ch.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 self-center shrink-0"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CUSTOMER CHAT ROOM */}
            <div className="flex-1 flex flex-col h-full bg-slate-50">
              {activeChat ? (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  
                  {/* TOP CHATTER INFO */}
                  <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <h4 className="text-sm font-bold text-slate-800">{activeChat.customerName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({activeChat.id})</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
                      ID: {activeChat.customerId}
                    </span>
                  </div>

                  {/* MESSAGES FLOW AREA */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {activeChat.messages.map((m: any, idx: number) => (
                      <div 
                        key={idx}
                        className={`flex flex-col max-w-[70%] ${
                          m.sender === 'agent' ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div className={`text-xs p-3 rounded-xl leading-relaxed ${
                          m.sender === 'agent'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 font-mono">{m.timestamp}</span>
                      </div>
                    ))}
                    
                    {/* Simulated typing indicator */}
                    {isTyping && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium italic">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce delay-150"></span>
                        <span>{activeChat.customerName} is drafting response...</span>
                      </div>
                    )}
                  </div>

                  {/* CHAT INPUT PANEL */}
                  <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                    
                    {/* Macro Quick Templates */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 items-center">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase shrink-0">Quick Reply:</span>
                      {MACROS.map(mac => (
                        <button
                          key={mac.id}
                          onClick={() => handleApplyMacroToChat(mac.content)}
                          className="text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded shrink-0 transition"
                        >
                          {mac.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Draft response message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendLiveChat()}
                        className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={handleSendLiveChat}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  Select an active customer conversation to start text streaming.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: CUSTOMER COMMUNICATIONS */}
        {activeSubTab === 'customer-communication' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800">Enterprise Broadcast communications console</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded font-mono font-semibold">
                  Secure SMS & Mail gateway active
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700">Target Customer Segment</label>
                  <select className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none">
                    <option value="all">All Corporate Clients</option>
                    <option value="vip">VIP accounts only</option>
                    <option value="high-risk">High risk accounts queue</option>
                    <option value="limit-pending">Awaiting compliance verification limits</option>
                  </select>
                  
                  <label className="text-xs font-bold text-slate-700">Delivery Channel</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input type="radio" name="channel" defaultChecked />
                      <span>Email Digest</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                      <input type="radio" name="channel" />
                      <span>Direct SMS Alert</span>
                    </label>
                  </div>

                  <label className="text-xs font-bold text-slate-700">Message Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Q3 Compliance verification schedule alert..." 
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="space-y-3 flex flex-col justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Message Content Body</label>
                    <textarea 
                      rows={4} 
                      placeholder="Input the broadcast announcement body..." 
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg mt-1"
                    />
                  </div>
                  <button 
                    onClick={() => onToast('Broadcast dispatch sequence initiated.', 'success')}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                  >
                    Dispatch Segement Broadcast
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ESCALATIONS */}
        {activeSubTab === 'escalations' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Tier-2 Escalations Queue Management</span>
              </h3>
              <p className="text-slate-500 text-xs">
                Tickets exceeding standard response timers are auto-routed here for team leader manual dispatching.
              </p>

              <div className="divide-y divide-slate-100">
                {tickets.filter(t => t.priority === 'Critical').map(tk => (
                  <div key={tk.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">{tk.id}</span>
                        <span className="text-xs font-bold text-slate-800">{tk.customerName}</span>
                        <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded animate-pulse">
                          CRITICAL SLA TARGET
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-1">{tk.subject}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Assigned to: <span className="font-semibold">{tk.assignedAgent}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAssignTicket(tk.id, 'Marcus Vance')}
                        className="text-[11px] bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg cursor-pointer"
                      >
                        Reassign Marcus
                      </button>
                      <button 
                        onClick={() => {
                          setTickets(prev => prev.map(t => t.id === tk.id ? { ...t, priority: 'Medium' } : t));
                          onToast('Ticket priority downgraded.', 'info');
                        }}
                        className="text-[11px] bg-white hover:bg-slate-50 font-bold px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg cursor-pointer"
                      >
                        De-escalate Priority
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: KNOWLEDGE BASE */}
        {activeSubTab === 'knowledge-base' && (
          <div className="flex-1 flex overflow-hidden bg-white">
            
            {/* CATEGORIES SIDEBAR */}
            <div className="w-64 border-r border-slate-200 bg-slate-50/50 p-4 shrink-0 space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">KB Categories</span>
              <div className="space-y-1">
                {[
                  { id: 'all', name: 'All Articles' },
                  { id: 'Wallet Operations', name: 'Wallet Operations' },
                  { id: 'Limits', name: 'Limits' },
                  { id: 'Card Issue', name: 'Card Issue' },
                  { id: 'Compliance', name: 'Compliance' },
                  { id: 'Refund Request', name: 'Refund Requests' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedKbCategory(cat.id)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg font-semibold transition ${
                      selectedKbCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ARTICLES PANEL */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search titles, keyword summaries, descriptions..."
                    value={searchKbQuery}
                    onChange={(e) => setSearchKbQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <button 
                  onClick={() => onToast('New Knowledge Base Article draft created.', 'info')}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Draft Article</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {filteredKbArticles.map(art => (
                  <div key={art.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold font-mono px-2 py-0.5 rounded">
                          {art.category}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 mt-1">{art.title}</h4>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-mono text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{art.rating}</span>
                        <span className="text-slate-400 font-normal">({art.views} views)</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{art.description}</p>
                    <div className="pt-2 border-t border-slate-100 flex gap-2 justify-end">
                      <button 
                        onClick={() => {
                          setChatInput(art.title + ': ' + art.description);
                          onToast('Article details synced to chat buffer.', 'success');
                        }}
                        className="text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Copy Article URL & Text
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 8: MACROS */}
        {activeSubTab === 'macros' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Support Agent Macros Repository</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Predefined conversational patterns for rapid workflow processing.</p>
                </div>
                <button 
                  onClick={() => onToast('New macro added to local schema.', 'success')}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Macro</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MACROS.map(mac => (
                  <div key={mac.id} className="bg-slate-50 p-4 border border-slate-200/50 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-2 py-0.5 rounded">
                          {mac.category}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 mt-1">{mac.name}</h4>
                      </div>
                      <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {mac.shortcut}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/50 font-medium">
                      "{mac.content}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SLA MANAGEMENT */}
        {activeSubTab === 'sla-management' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* SLA Target Controls */}
              <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-800">SLA Response & Resolution Target Configuration</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Configure system thresholds for auto-triggering alerts and tier escalations.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Response SLAs */}
                  <div className="space-y-4">
                    <h4 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">Response target thresholds (Min)</h4>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-red-600">Critical Priority Target:</span>
                        <span className="text-slate-800">{slaConfig.responseCritical} minutes</span>
                      </div>
                      <input 
                        type="range" 
                        min={5} 
                        max={60} 
                        value={slaConfig.responseCritical} 
                        onChange={(e) => setSlaConfig((p: any) => ({ ...p, responseCritical: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-amber-600">High Priority Target:</span>
                        <span className="text-slate-800">{slaConfig.responseHigh} minutes</span>
                      </div>
                      <input 
                        type="range" 
                        min={15} 
                        max={180} 
                        value={slaConfig.responseHigh} 
                        onChange={(e) => setSlaConfig((p: any) => ({ ...p, responseHigh: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">Medium Priority Target:</span>
                        <span className="text-slate-800">{slaConfig.responseMedium} minutes</span>
                      </div>
                      <input 
                        type="range" 
                        min={30} 
                        max={480} 
                        value={slaConfig.responseMedium} 
                        onChange={(e) => setSlaConfig((p: any) => ({ ...p, responseMedium: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Resolution SLAs */}
                  <div className="space-y-4">
                    <h4 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution target thresholds (Min)</h4>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-red-600">Critical Priority Target:</span>
                        <span className="text-slate-800">{slaConfig.resolutionCritical} minutes</span>
                      </div>
                      <input 
                        type="range" 
                        min={30} 
                        max={240} 
                        value={slaConfig.resolutionCritical} 
                        onChange={(e) => setSlaConfig((p: any) => ({ ...p, resolutionCritical: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-amber-600">High Priority Target:</span>
                        <span className="text-slate-800">{slaConfig.resolutionHigh} minutes</span>
                      </div>
                      <input 
                        type="range" 
                        min={60} 
                        max={720} 
                        value={slaConfig.resolutionHigh} 
                        onChange={(e) => setSlaConfig((p: any) => ({ ...p, resolutionHigh: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">Medium Priority Target:</span>
                        <span className="text-slate-800">{slaConfig.resolutionMedium} minutes</span>
                      </div>
                      <input 
                        type="range" 
                        min={120} 
                        max={2880} 
                        value={slaConfig.resolutionMedium} 
                        onChange={(e) => setSlaConfig((p: any) => ({ ...p, resolutionMedium: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      setSlaConfig(DEFAULT_SLA_CONFIG);
                      onToast('SLA Configurations reverted to default system standards.', 'info');
                    }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-lg cursor-pointer"
                  >
                    Reset defaults
                  </button>
                  <button 
                    onClick={() => onToast('SLA threshold targets updated across primary queues.', 'success')}
                    className="text-xs bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Priority matrix & escalation configuration rules */}
              <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">
                  Priority SLA Severity Matrix
                </h3>
                
                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100 space-y-1">
                    <span className="font-bold text-red-800 block">Critical Priority Matrix</span>
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      Assigned to KYC failure escalations and cargo payment terminal holds. Triggers direct Supervisor alert when countdown &lt; 15 mins.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 space-y-1">
                    <span className="font-bold text-amber-800 block">High Priority Matrix</span>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Triggered on volume expansions and wallet security freezes. SLA targets are monitored by regional compliance leads.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/50 space-y-1">
                    <span className="font-bold text-slate-800 block">Standard Escalation Routines</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Tickets that breach target response timers are flagged automatically and relocated to the supervisor desk in under 3 minutes.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
