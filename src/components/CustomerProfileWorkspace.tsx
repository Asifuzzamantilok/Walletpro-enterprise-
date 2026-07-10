import React, { useState } from 'react';
import { 
  X, Check, ShieldAlert, Cpu, Lightbulb, Code, Flame, Sparkles, 
  ArrowLeft, Wallet, CreditCard, History, Users, Smartphone, 
  Activity, FileText, Ticket, MapPin, AlertOctagon, Compass, 
  Send, LogOut, UserPlus, Flag, ChevronLeft, Star, BadgeAlert, 
  Copy, MoreHorizontal, Moon, Sun, Keyboard, User, CheckCircle2,
  XCircle, Lock, Unlock, Mail, Phone, Globe, Shield, RefreshCw, Key
} from 'lucide-react';
import { Customer, CustomerWallet, CustomerCard, CustomerTransaction, TimelineEvent, CustomerDocument, WalletStatus, KYCStatus } from './customerTypes';

interface CustomerProfileWorkspaceProps {
  customer: Customer;
  onBack: () => void;
  onUpdateCustomer: (updated: Customer) => void;
  onToast: (title: string, msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export function CustomerProfileWorkspace({ customer, onBack, onUpdateCustomer, onToast }: CustomerProfileWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [newNote, setNewNote] = useState<string>(customer.notes);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [agentInput, setAgentInput] = useState(customer.assignedAgent);
  const [isAssigningAgent, setIsAssigningAgent] = useState(false);

  // Tabs for Customer Profile
  const profileTabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'wallets', name: 'Wallets', icon: Wallet },
    { id: 'cards', name: 'Cards', icon: CreditCard },
    { id: 'transactions', name: 'Transactions', icon: History },
    { id: 'beneficiaries', name: 'Beneficiaries', icon: Users },
    { id: 'bankAccounts', name: 'Bank Accounts', icon: Compass },
    { id: 'devices', name: 'Devices', icon: Smartphone },
    { id: 'sessions', name: 'Sessions', icon: Activity },
    { id: 'kyc', name: 'KYC Status', icon: Shield },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'tickets', name: 'Support Tickets', icon: Ticket },
    { id: 'fraud', name: 'Fraud Signals', icon: AlertOctagon },
    { id: 'timeline', name: 'Audit Timeline', icon: ClockIcon },
    { id: 'security', name: 'Security Config', icon: Key },
    { id: 'notes', name: 'Internal Notes', icon: Lightbulb }
  ];

  // Simple clock icon replacement
  function ClockIcon(props: any) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }

  // Admin Actions Execution
  const triggerAdminAction = (actionType: string) => {
    let updated = { ...customer };
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const eventId = `EV-${Math.floor(1000 + Math.random() * 9000)}`;

    let newEvent: TimelineEvent = {
      id: eventId,
      date: dateStr,
      title: '',
      description: '',
      category: 'Admin',
      performedBy: 'System Administrator (tilok.mania@gmail.com)'
    };

    switch (actionType) {
      case 'freeze':
        updated.walletStatus = 'Frozen';
        updated.wallets = updated.wallets.map(w => ({ ...w, status: 'Frozen' }));
        newEvent.title = 'Account Wallets Frozen';
        newEvent.description = 'All active currency wallets were placed on administrative hold.';
        onToast('Account Frozen', 'Customer wallet status updated to Frozen successfully.', 'warning');
        break;
      case 'unfreeze':
        updated.walletStatus = 'Active';
        updated.wallets = updated.wallets.map(w => ({ ...w, status: 'Active' }));
        newEvent.title = 'Account Wallets Unfrozen';
        newEvent.description = 'Administrative holds on wallets were lifted.';
        onToast('Account Restored', 'Customer wallet is now fully active.', 'success');
        break;
      case 'suspend':
        updated.walletStatus = 'Suspended';
        newEvent.title = 'Account Suspended';
        newEvent.description = 'User authentication access suspended due to compliance breaches.';
        onToast('User Suspended', 'Access token revoked and account suspended.', 'warning');
        break;
      case 'reset-password':
        newEvent.title = 'Administrative Password Reset';
        newEvent.description = 'Triggered system dispatch for master password reset link.';
        onToast('Password Reset Dispatched', 'A temporary password reset link was emailed to ' + customer.email, 'info');
        break;
      case 'reset-pin':
        newEvent.title = 'Administrative Security PIN Reset';
        newEvent.description = 'Revoked card execution PINs. Secure SMS trigger dispatched.';
        onToast('PIN Reset Complete', 'A PIN reset SMS code was dispatched.', 'info');
        break;
      case 'approve-kyc':
        updated.kycStatus = 'Verified';
        updated.riskScore = Math.max(10, updated.riskScore - 15);
        updated.documents = updated.documents.map(d => ({ ...d, status: 'Approved' }));
        newEvent.title = 'KYC Documents Approved';
        newEvent.description = 'Identity credentials manually verified and accepted.';
        newEvent.category = 'KYC';
        onToast('KYC Verification Approved', 'Customer status updated to Verified.', 'success');
        break;
      case 'reject-kyc':
        updated.kycStatus = 'Rejected';
        updated.riskScore = Math.min(95, updated.riskScore + 20);
        updated.documents = updated.documents.map(d => ({ ...d, status: 'Rejected' }));
        newEvent.title = 'KYC Verification Rejected';
        newEvent.description = 'Identity details rejected. Dispatched alert notice to user email.';
        newEvent.category = 'KYC';
        onToast('KYC Rejected', 'Customer KYC marked as rejected.', 'warning');
        break;
      case 'issue-card':
        const cardId = `CARD-${Math.floor(1000 + Math.random() * 9000)}`;
        const newCard: CustomerCard = {
          id: cardId,
          cardNumber: `•••• •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
          cardType: 'Virtual',
          expiry: '08/31',
          status: 'Active',
          limit: 5000
        };
        updated.cards = [...updated.cards, newCard];
        newEvent.title = 'New Virtual Card Issued';
        newEvent.description = `Issued secure virtual card Ending in ${newCard.cardNumber.slice(-4)}.`;
        newEvent.category = 'Card';
        onToast('Card Issued', 'New virtual transaction card deployed to account.', 'success');
        break;
      case 'block-card':
        updated.cards = updated.cards.map(c => ({ ...c, status: 'Blocked' }));
        newEvent.title = 'Transaction Cards Blocked';
        newEvent.description = 'Administratively locked all registered card payment routes.';
        newEvent.category = 'Card';
        onToast('Cards Blocked', 'All active customer cards have been locked.', 'warning');
        break;
      case 'force-logout':
        updated.sessions = [];
        newEvent.title = 'Administrative Session Force Logout';
        newEvent.description = 'Killed all active auth tokens and forced secure terminal logouts.';
        onToast('Active Sessions Killed', 'Forced logouts on all customer devices successfully.', 'info');
        break;
      case 'investigate':
        updated.riskScore = Math.min(100, updated.riskScore + 10);
        newEvent.title = 'Flagged for Fraud Investigation';
        newEvent.description = 'Account referred to AML compliance team for in-depth ledger audit.';
        newEvent.category = 'Fraud';
        onToast('Flagged for Investigation', 'Compliance case created. Risk weight increased.', 'warning');
        break;
      case 'refund-tx':
        if (updated.transactions.length > 0) {
          updated.transactions = updated.transactions.map((tx, idx) => 
            idx === 0 ? { ...tx, status: 'Refunded' } : tx
          );
          newEvent.title = 'Transaction Reversal Refunded';
          newEvent.description = 'Authorized immediate credit reversal of most recent transaction ledger.';
          newEvent.category = 'Transaction';
          onToast('Transaction Refunded', 'Credit reversal completed. Clearing networks notified.', 'success');
        } else {
          onToast('Refund Failed', 'No transaction history available to reverse.', 'warning');
          return;
        }
        break;
      default:
        return;
    }

    updated.timeline = [newEvent, ...updated.timeline];
    onUpdateCustomer(updated);
  };

  const handleSaveNote = () => {
    let updated = { ...customer, notes: newNote };
    const dateStr = new Date().toISOString().substring(0, 10);
    updated.timeline = [{
      id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: dateStr,
      title: 'Internal Ops Note Modified',
      description: 'Account executive updated internal notes dossier.',
      category: 'Admin',
      performedBy: 'System Administrator (tilok.mania@gmail.com)'
    }, ...updated.timeline];
    onUpdateCustomer(updated);
    setIsEditingNote(false);
    onToast('Notes Saved', 'Customer dossier updated successfully.', 'success');
  };

  const handleAssignAgent = () => {
    let updated = { ...customer, assignedAgent: agentInput };
    updated.timeline = [{
      id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().substring(0, 10),
      title: 'Support Agent Reassigned',
      description: `Assigned case executive set to: ${agentInput}.`,
      category: 'Admin',
      performedBy: 'System Administrator'
    }, ...updated.timeline];
    onUpdateCustomer(updated);
    setIsAssigningAgent(false);
    onToast('Agent Assigned', `Case assigned to ${agentInput}.`, 'success');
  };

  // Get status color utilities
  const getRiskScoreColor = (score: number) => {
    if (score < 30) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score < 60) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getStatusBadge = (status: WalletStatus) => {
    switch (status) {
      case 'Active': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Active Wallet</span>;
      case 'Frozen': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">Frozen</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">Suspended</span>;
    }
  };

  const getKycBadge = (status: KYCStatus) => {
    switch (status) {
      case 'Verified': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><Check className="w-3 h-3" /> KYC Verified</span>;
      case 'Pending': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 animate-pulse flex items-center gap-1"><RefreshCw className="w-3 h-3" /> KYC Pending</span>;
      case 'Rejected': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> KYC Rejected</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">KYC Not Submitted</span>;
    }
  };

  // Document action trigger
  const toggleDocStatus = (docId: string, action: 'Approve' | 'Reject') => {
    const updatedDocs = customer.documents.map(d => {
      if (d.id === docId) {
        return { ...d, status: action === 'Approve' ? 'Approved' as const : 'Rejected' as const };
      }
      return d;
    });
    onUpdateCustomer({ ...customer, documents: updatedDocs });
    onToast('Document Audited', `Credential document marked as ${action}d.`, 'info');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-800 text-left">
      {/* Workspace Header Panel */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 mb-5 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Grid</span>
          </button>
          
          <div className="flex items-center gap-3">
            <img 
              src={customer.photoUrl} 
              alt={customer.fullName} 
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-sm"
              onError={(e) => {
                // Fallback
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
              }}
            />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight font-display">{customer.fullName}</h2>
                {customer.kycStatus === 'Verified' && (
                  <span className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white" title="Verified Customer">
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span>{customer.id}</span>
                <span>•</span>
                <span className="font-sans font-medium text-slate-500">{customer.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`px-3 py-1 rounded-lg border text-xs font-bold font-mono flex items-center gap-1.5 ${getRiskScoreColor(customer.riskScore)}`}>
            <span>Risk Score:</span>
            <span className="font-black text-sm">{customer.riskScore}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            {customer.accountTier}
          </div>

          {getStatusBadge(customer.walletStatus)}
          {getKycBadge(customer.kycStatus)}
        </div>
      </div>

      {/* Main Splitscreen Layout */}
      <div className="flex-1 grid grid-cols-12 gap-5 overflow-hidden">
        
        {/* Left Hand: Workspace Tabs (9 Columns) */}
        <div className="col-span-12 xl:col-span-9 flex flex-col bg-white border border-slate-200/80 rounded-xl overflow-hidden h-full shadow-xs">
          
          {/* Scrollable Tabs row */}
          <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50 custom-scrollbar shrink-0">
            {profileTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Workstation Body */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 text-left">
                {/* Visual Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ledger Net Worth widget */}
                  <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-xl p-5 border border-slate-800 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Ledger Balance</span>
                    <h3 className="text-2xl font-black font-display tracking-tight text-white">
                      {customer.primaryCurrency === 'XOF' ? 'CFA' : customer.primaryCurrency} {customer.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-300 font-mono bg-white/5 border border-white/10 px-2 py-1 rounded w-fit">
                      <Wallet className="w-3.5 h-3.5 text-blue-400" />
                      <span>{customer.wallets.length} Active Accounts</span>
                    </div>
                  </div>

                  {/* Operational Health widget */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60 shadow-inner flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Dossier Health Indicator</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className={`w-3 h-3 rounded-full ${
                          customer.riskScore < 35 ? 'bg-emerald-500 animate-pulse' : customer.riskScore < 70 ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-pulse'
                        }`} />
                        <span className="font-bold text-sm text-slate-800">
                          {customer.riskScore < 35 ? 'Highly Reliable / Guard' : customer.riskScore < 70 ? 'Inconclusive Hold' : 'High Risk Level'}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2">
                      Last reviewed on {customer.lastLogin.substring(0, 10)} by automated compliance pipeline.
                    </div>
                  </div>

                  {/* Case Owner Agent widget */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60 shadow-inner flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Assigned Support Executive</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-sm text-slate-800">{customer.assignedAgent}</span>
                        <button
                          onClick={() => {
                            setAgentInput(customer.assignedAgent);
                            setIsAssigningAgent(true);
                          }}
                          className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                        >
                          Modify
                        </button>
                      </div>
                    </div>
                    
                    {isAssigningAgent ? (
                      <div className="flex gap-1.5 mt-2">
                        <input
                          type="text"
                          value={agentInput}
                          onChange={(e) => setAgentInput(e.target.value)}
                          className="bg-white border border-slate-200 text-[11px] rounded px-1.5 py-1 outline-none w-full"
                          placeholder="Agent name..."
                        />
                        <button onClick={handleAssignAgent} className="bg-blue-600 text-white text-[10px] font-bold px-2 rounded">Save</button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-medium mt-2">
                        Assigned partner for live operations, tickets, and escalation.
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Information Block */}
                <div className="bg-white rounded-xl border border-slate-200/70 p-5 space-y-4">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display">Fintech Core Profile Dossier</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Country Location</span>
                      <span className="text-slate-800 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        {customer.country}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Verified Telephone</span>
                      <span className="text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {customer.phone}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Dossier Registered Since</span>
                      <span className="text-slate-800 font-mono">{customer.registrationDate}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Last Known Login Time</span>
                      <span className="text-slate-800 font-mono">{customer.lastLogin}</span>
                    </div>
                  </div>
                </div>

                {/* Current Balances Sub-Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display">Liquidity Vault Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {customer.wallets.map(w => (
                      <div key={w.id} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex justify-between items-center">
                        <div className="text-left space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{w.currency} Wallet</span>
                          <h5 className="text-base font-black text-slate-800 font-display">
                            {w.currency} {w.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </h5>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          w.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions list */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display">Recent Activity Ledger</h4>
                  <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-100">
                          <th className="px-4 py-3">Transaction ID</th>
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Narration Description</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3 text-right">Ledger Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium">
                        {customer.transactions.slice(0, 3).map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{tx.id}</td>
                            <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">{tx.date}</td>
                            <td className="px-4 py-3 text-slate-800 font-semibold">{tx.description}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                                tx.type === 'Inflow' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-right font-bold ${
                              tx.type === 'Inflow' ? 'text-emerald-600' : 'text-slate-800'
                            }`}>
                              {tx.type === 'Inflow' ? '+' : '-'}{tx.currency} {Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* WALLETS TAB */}
            {activeTab === 'wallets' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800 font-display">Multi-Currency Wallet Clearing Dossier</h3>
                  <span className="text-[10px] bg-slate-100 border px-2.5 py-1 rounded font-mono text-slate-500">
                    AUTHORITATIVE SERVER SYSTEM
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.wallets.map(wallet => (
                    <div key={wallet.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-2xs relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold font-display text-slate-800">{wallet.currency}</span>
                            {wallet.isPrimary && (
                              <span className="bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wide">
                                Primary clearing
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Dossier ID: {wallet.id}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                          wallet.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {wallet.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Available Cleared Balance</span>
                        <h4 className="text-2xl font-black font-display text-slate-900">
                          {wallet.currency} {wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CARDS TAB */}
            {activeTab === 'cards' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800 font-display">Registered Payment Interface Cards</h3>
                  <button 
                    onClick={() => triggerAdminAction('issue-card')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Issue Virtual Card</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.cards.map(card => (
                    <div key={card.id} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between h-40">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                      <div className="flex justify-between items-start z-10">
                        <div>
                          <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-slate-300">
                            {card.cardType}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">{card.id}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          card.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {card.status}
                        </span>
                      </div>

                      <div className="my-2 z-10">
                        <span className="text-lg font-mono tracking-widest block">{card.cardNumber}</span>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                          <span>EXP: {card.expiry}</span>
                          <span>Daily Limit: USD {card.limit.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800 font-display">Authoritative Transaction Ledger</h3>
                  <button 
                    onClick={() => triggerAdminAction('refund-tx')}
                    className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refund Last Transaction</span>
                  </button>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-100">
                        <th className="px-4 py-3">TX ID</th>
                        <th className="px-4 py-3">Settlement Date</th>
                        <th className="px-4 py-3">Description Narration</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Ledger Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {customer.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{tx.id}</td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">{tx.date}</td>
                          <td className="px-4 py-3 text-slate-800 font-semibold">{tx.description}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'Settled' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : tx.status === 'Refunded'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${
                            tx.type === 'Inflow' ? 'text-emerald-600' : 'text-slate-800'
                          }`}>
                            {tx.type === 'Inflow' ? '+' : '-'}{tx.currency} {Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BENEFICIARIES TAB */}
            {activeTab === 'beneficiaries' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 font-display">Trusted Beneficiary Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {customer.beneficiaries.length > 0 ? (
                    customer.beneficiaries.map((b, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold font-mono">
                          {b.charAt(0)}
                        </div>
                        <div className="text-left font-semibold text-xs text-slate-800">
                          {b}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center p-6 text-slate-400 text-xs">No trusted beneficiaries saved.</div>
                  )}
                </div>
              </div>
            )}

            {/* BANK ACCOUNTS TAB */}
            {activeTab === 'bankAccounts' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 font-display">Linked Bank Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.bankAccounts.length > 0 ? (
                    customer.bankAccounts.map((acct, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/80 p-5 rounded-xl flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Compass className="w-5 h-5" />
                        </div>
                        <div className="text-left space-y-1">
                          <h4 className="font-bold text-xs text-slate-800">External Clearing Institution</h4>
                          <p className="text-xs text-slate-500 font-mono">{acct}</p>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded inline-block">
                            Verified Wire Target
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center p-8 text-slate-400 text-xs">No external bank profiles linked.</div>
                  )}
                </div>
              </div>
            )}

            {/* DEVICES TAB */}
            {activeTab === 'devices' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 font-display">Registered Hardware Cryptographic Devices</h3>
                <div className="space-y-2">
                  {customer.devices.map((device, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-slate-400" />
                      <div className="text-left text-xs">
                        <strong className="font-bold text-slate-800">{device}</strong>
                        <span className="block text-[10px] text-slate-400 font-mono">Device Fingerprint Registered</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SESSIONS TAB */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800 font-display">Active Session Logins</h3>
                  <button 
                    onClick={() => triggerAdminAction('force-logout')}
                    className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Kill All Sessions</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {customer.sessions.length > 0 ? (
                    customer.sessions.map((sess, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-slate-400 animate-pulse" />
                          <div className="text-left">
                            <span className="text-xs font-bold text-slate-800">{sess}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">SSL Secure Web Session</span>
                          </div>
                        </div>
                        {idx === 0 && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Active Node
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 text-slate-400 text-xs">No active web sessions.</div>
                  )}
                </div>
              </div>
            )}

            {/* KYC TAB */}
            {activeTab === 'kyc' && (
              <div className="space-y-5">
                <h3 className="font-bold text-sm text-slate-800 font-display">Manual KYC Evaluation Dashboard</h3>
                
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">KYC Verification Status</span>
                    <div className="mt-1.5">{getKycBadge(customer.kycStatus)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Assigned AML Risk Weight</span>
                    <span className="text-sm font-bold text-slate-800 block mt-1.5 font-mono">{customer.riskScore} / 100</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Referral Status</span>
                    <span className="text-xs font-bold text-slate-800 block mt-1.5 font-mono">{customer.referralStatus}</span>
                  </div>
                </div>

                <div className="flex justify-start gap-3">
                  <button 
                    onClick={() => triggerAdminAction('approve-kyc')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve KYC Credentials</span>
                  </button>
                  <button 
                    onClick={() => triggerAdminAction('reject-kyc')}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject KYC Credentials</span>
                  </button>
                </div>
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 font-display">Dossier Identity Verification Documents</h3>
                
                <div className="space-y-3">
                  {customer.documents.map(doc => (
                    <div key={doc.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-2xs">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 block">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">{doc.type} • ID: {doc.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : doc.status === 'Pending' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {doc.status}
                        </span>

                        {doc.status === 'Pending' && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => toggleDocStatus(doc.id, 'Approve')}
                              className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded hover:bg-emerald-700 cursor-pointer"
                            >
                              Verify
                            </button>
                            <button 
                              onClick={() => toggleDocStatus(doc.id, 'Reject')}
                              className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded hover:bg-red-600 cursor-pointer"
                            >
                              Deny
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TICKETS TAB */}
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 font-display">Assigned Support Escalations</h3>
                
                <div className="space-y-3">
                  {customer.supportTickets.length > 0 ? (
                    customer.supportTickets.map(tkt => (
                      <div key={tkt.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-2xs">
                        <div className="text-left space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{tkt.subject}</span>
                            <span className="text-[9px] bg-slate-100 border text-slate-400 font-mono px-1.5 rounded">{tkt.id}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">Opened: {tkt.createdDate}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            tkt.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {tkt.priority} Priority
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            tkt.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800 animate-pulse'
                          }`}>
                            {tkt.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 text-slate-400 text-xs">No active support tickets found.</div>
                  )}
                </div>
              </div>
            )}

            {/* FRAUD SIGNALS TAB */}
            {activeTab === 'fraud' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800 font-display">Risk &amp; Compliance Anomaly Alerts</h3>
                  <button 
                    onClick={() => triggerAdminAction('investigate')}
                    className="bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Escalate Risk Level</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {customer.fraudSignals.map((sig, idx) => (
                    <div key={idx} className="bg-red-50/50 border border-red-100 p-4 rounded-xl flex items-center gap-3">
                      <AlertOctagon className="w-5 h-5 text-red-500 shrink-0" />
                      <span className="text-xs text-red-950 font-semibold text-left">{sig}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIT TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="space-y-4 text-left">
                <h3 className="font-bold text-sm text-slate-800 font-display">Operational Audit Trail</h3>
                
                <div className="relative pl-6 border-l border-slate-200 space-y-6">
                  {customer.timeline.map((ev) => (
                    <div key={ev.id} className="relative group">
                      {/* Timeline Bullet */}
                      <div className="absolute -left-[29px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-slate-300 ring-4 ring-slate-50 group-hover:bg-blue-600 transition-colors" />
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="font-bold text-xs text-slate-800">{ev.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono font-medium">{ev.date}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{ev.description}</p>
                        {ev.performedBy && (
                          <span className="text-[9px] font-mono font-bold text-slate-400 block">
                            Triggered by: {ev.performedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                <h3 className="font-bold text-sm text-slate-800 font-display">Security Settings Dossier</h3>
                
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <span className="text-slate-400 block text-[10px] uppercase">Two-Factor Auth (2FA)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      customer.securitySettings.twoFactorEnabled 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {customer.securitySettings.twoFactorEnabled ? '2FA Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-slate-400 block text-[10px] uppercase">Biometric MFA Registration</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      customer.securitySettings.biometricsEnabled 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {customer.securitySettings.biometricsEnabled ? 'Biometrics Active' : 'No Hardware registration'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-slate-400 block text-[10px] uppercase">Administrative Withdrawal Limit</span>
                    <span className="text-xs font-bold text-slate-800 block mt-0.5 font-mono">
                      USD {customer.securitySettings.withdrawalLimit.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => triggerAdminAction('reset-password')}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Reset Customer Password</span>
                  </button>
                  <button 
                    onClick={() => triggerAdminAction('reset-pin')}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Reset Secure PIN</span>
                  </button>
                </div>
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-800 font-display">Administrative Case Notes Dossier</h3>
                  {!isEditingNote && (
                    <button 
                      onClick={() => setIsEditingNote(true)}
                      className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      Edit dossier
                    </button>
                  )}
                </div>

                {isEditingNote ? (
                  <div className="space-y-3">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full h-40 bg-white border border-slate-200 rounded-xl p-4 text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-inner"
                      placeholder="Enter private compliance notes or dossier reviews..."
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setIsEditingNote(false)}
                        className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveNote}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/40 p-5 rounded-xl border border-amber-100/50 text-xs text-slate-700 leading-relaxed font-semibold">
                    {customer.notes || 'No active administrative case notes entered. Edit this tab to append custom notes.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: Admin Actions Station (3 Columns) */}
        <div className="col-span-12 xl:col-span-3 bg-slate-900 text-white border border-slate-800 rounded-xl flex flex-col overflow-hidden h-full shadow-lg">
          <div className="p-5 border-b border-slate-800 bg-slate-800/20 text-left">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider font-display">Admin Action Command Center</h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">Execute system level modifications to user state, credentials, and cards instantly.</p>
          </div>

          <div className="flex-1 p-5 space-y-3.5 overflow-y-auto custom-scrollbar text-left">
            
            {/* Account Status segment */}
            <div className="space-y-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Account Vault Operations</span>
              <div className="grid grid-cols-1 gap-2">
                {customer.walletStatus === 'Active' ? (
                  <button 
                    onClick={() => triggerAdminAction('freeze')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Freeze All Wallets</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => triggerAdminAction('unfreeze')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5 shrink-0" />
                    <span>Unfreeze Account</span>
                  </button>
                )}

                <button 
                  onClick={() => triggerAdminAction('suspend')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Suspend Auth Access</span>
                </button>
              </div>
            </div>

            {/* Compliance Manual override */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Identity &amp; Compliance Audit</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => triggerAdminAction('approve-kyc')}
                  className="flex items-center justify-center gap-1.5 px-2 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-[10px] font-bold cursor-pointer border border-emerald-500/20 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pass KYC</span>
                </button>
                <button 
                  onClick={() => triggerAdminAction('reject-kyc')}
                  className="flex items-center justify-center gap-1.5 px-2 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg text-[10px] font-bold cursor-pointer border border-red-500/20 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Fail KYC</span>
                </button>
              </div>
            </div>

            {/* Credential Reset overrides */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Cryptographic Dispatches</span>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => triggerAdminAction('reset-password')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700/30 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>Dispatch PW Reset</span>
                </button>
                <button 
                  onClick={() => triggerAdminAction('reset-pin')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700/30 transition-colors"
                >
                  <Key className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>SMS Reset Secure PIN</span>
                </button>
              </div>
            </div>

            {/* Payment Systems triggers */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Cards &amp; Payment Networks</span>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => triggerAdminAction('issue-card')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer border border-slate-700/30 transition-colors"
                >
                  <PlusIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>Deploy Virtual Card</span>
                </button>
                <button 
                  onClick={() => triggerAdminAction('block-card')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg text-xs font-semibold cursor-pointer border border-red-500/10 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                  <span>Lock Active Cards</span>
                </button>
              </div>
            </div>

            {/* Risk / Investigation controls */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">AML Watchtower Overrides</span>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => triggerAdminAction('investigate')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-red-950/40 hover:bg-red-950/70 text-red-400 rounded-lg text-xs font-bold cursor-pointer border border-red-900/30 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5 shrink-0" />
                  <span>Flag for Investigation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// PlusIcon replacement
function PlusIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
