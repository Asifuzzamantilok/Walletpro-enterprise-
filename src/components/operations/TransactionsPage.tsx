import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Filter, SlidersHorizontal, Eye, ShieldAlert, Lock, Unlock, 
  CheckCircle2, XCircle, RefreshCw, ArrowRightLeft, FileDown, AlertTriangle, 
  DollarSign, Plus, Coins, Play, HelpCircle, ArrowUpDown, ChevronDown, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, X, Check, FileText, Ban, 
  RotateCcw, AlertOctagon, Landmark, Cpu, Wifi, WifiOff, BellRing, EyeOff
} from 'lucide-react';
import { OperationsService } from './OperationsService';
import { Transaction, TransactionStatus, TransactionChannel, TransactionType } from './OperationsTypes';

interface TransactionsPageProps {
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  onSelectTab: (tab: string) => void;
}

export function TransactionsPage({ onToast, onSelectTab }: TransactionsPageProps) {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currencyFilter, setCurrencyFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All'); // 'All', 'Low (<30)', 'Medium (30-60)', 'High (>60)'
  const [amountFilter, setAmountFilter] = useState('All'); // 'All', '<1k', '1k-10k', '10k-100k', '>100k'
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

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

  // Sorting State
  const [sortField, setSortField] = useState<string>('createdTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter, currencyFilter, channelFilter, typeFilter, countryFilter, riskFilter, amountFilter, paymentMethodFilter]);

  // Live simulation state
  const [isLiveEnabled, setIsLiveEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting'>('connected');
  const [pingTime, setPingTime] = useState(12);

  // Action Modals State
  const [reversalModal, setReversalModal] = useState<{ isOpen: boolean; tx: Transaction | null }>({
    isOpen: false,
    tx: null
  });
  const [reversalReason, setReversalReason] = useState('');

  const [refundModal, setRefundModal] = useState<{ isOpen: boolean; tx: Transaction | null }>({
    isOpen: false,
    tx: null
  });
  const [refundReason, setRefundReason] = useState('');

  // React Query Fetch Transactions
  const { 
    data: transactions = [], 
    isLoading, 
    isError, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['operations-transactions'],
    queryFn: () => OperationsService.getTransactions(),
    staleTime: 5000,
    retry: 2
  });

  // Fetch wallets for context
  const { data: wallets = [] } = useQuery({
    queryKey: ['operations-wallets'],
    queryFn: () => OperationsService.getWallets()
  });

  // MUTATIONS
  const statusMutation = useMutation({
    mutationFn: ({ txId, status, performedBy, notes }: { txId: string; status: TransactionStatus; performedBy: string; notes?: string }) => 
      OperationsService.updateTransactionStatus(txId, status, performedBy, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['operations-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['operations-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['operations-refunds'] });
      onToast('Transaction Actioned', `Successfully updated transaction ${data.id} status to ${data.status.toUpperCase()}`, 'success');
      setReversalModal({ isOpen: false, tx: null });
      setRefundModal({ isOpen: false, tx: null });
      setReversalReason('');
      setRefundReason('');
    },
    onError: (err: any) => {
      onToast('Action Failed', err.message || 'Unable to update transaction status', 'warning');
    }
  });

  // Simulated live feed generation
  useEffect(() => {
    if (!isLiveEnabled) return;

    const interval = setInterval(() => {
      // Simulate ping fluctuation
      setPingTime(Math.floor(10 + Math.random() * 8));

      // 15% chance to inject a live transaction
      if (Math.random() < 0.15) {
        // Pick random wallet
        if (wallets.length > 0) {
          const randomWallet = wallets[Math.floor(Math.random() * wallets.length)];
          const randomAmount = Math.floor(50 + Math.random() * 1450);
          
          // Inject into list manually for local effect OR create a fake tx
          const liveTx: Transaction = {
            id: `TX-${Math.floor(88200 + Math.random() * 1000)}`,
            reference: `REF-LIVE-${Math.floor(1000 + Math.random() * 9000)}`,
            customerName: randomWallet.customerName,
            customerEmail: randomWallet.customerEmail,
            senderWalletId: randomWallet.id,
            receiverWalletId: 'W-MER-3052',
            currency: randomWallet.currency,
            amount: randomAmount,
            fee: parseFloat((randomAmount * 0.01).toFixed(2)),
            status: 'Completed',
            channel: ['API', 'Card', 'Web', 'Mobile'][Math.floor(Math.random() * 4)] as TransactionChannel,
            type: 'Payment',
            paymentMethod: 'Virtual Debit Card',
            country: randomWallet.country,
            device: 'Mobile App (iOS)',
            ipAddress: '198.51.100.' + Math.floor(Math.random() * 255),
            location: 'Simulated Inbound Feed',
            riskScore: Math.floor(Math.random() * 45),
            createdTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            completedTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
            auditTrail: [
              {
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                action: 'Inbound Auth Request',
                performedBy: 'External Processor Gateway',
                details: 'Auth Code 00 approved.'
              }
            ]
          };

          // Trigger React Query Cache update or push
          queryClient.setQueryData(['operations-transactions'], (old: any) => {
            if (!old) return [liveTx];
            // Prevent duplicated inserts
            if (old.some((t: any) => t.id === liveTx.id)) return old;
            return [liveTx, ...old];
          });

          onToast('Live Feed Alert', `Received new transaction ${liveTx.id} of ${randomAmount} ${liveTx.currency}`, 'info');
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveEnabled, wallets, queryClient]);

  // Actions trigger functions
  const handleApprove = (tx: Transaction) => {
    statusMutation.mutate({
      txId: tx.id,
      status: 'Completed',
      performedBy: 'Compliance Desk Officer',
      notes: 'Manually cleared review queue.'
    });
  };

  const handleReject = (tx: Transaction) => {
    statusMutation.mutate({
      txId: tx.id,
      status: 'Failed',
      performedBy: 'Compliance Desk Officer',
      notes: 'Rejected due to risk scorecard criteria compliance.'
    });
  };

  const handleExecuteReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalModal.tx) return;
    statusMutation.mutate({
      txId: reversalModal.tx.id,
      status: 'Reversed',
      performedBy: 'Audit Controller',
      notes: reversalReason || 'Manual adjustment reversal'
    });
  };

  const handleExecuteRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModal.tx) return;
    
    // Create actual Refund request inside Refunds page State
    OperationsService.createRefundRequest(
      refundModal.tx.id,
      refundModal.tx.senderWalletId,
      refundModal.tx.customerName,
      refundModal.tx.currency,
      refundModal.tx.amount,
      refundReason || 'Customer requested'
    ).then((newRef) => {
      queryClient.invalidateQueries({ queryKey: ['operations-refunds'] });
      statusMutation.mutate({
        txId: refundModal.tx!.id,
        status: 'Refunded',
        performedBy: 'Merchant Service Agent',
        notes: `Refund ID ${newRef.id} requested: ${refundReason}`
      });
    });
  };

  const handleRetry = (tx: Transaction) => {
    onToast('Retrying Transaction', `Reprocessing clearing queues for ${tx.id}.`, 'info');
    setTimeout(() => {
      statusMutation.mutate({
        txId: tx.id,
        status: 'Completed',
        performedBy: 'System Retrier Daemon',
        notes: 'Retry auth was successful.'
      });
    }, 1000);
  };

  const handleOpenFraudCase = (tx: Transaction) => {
    onToast('Fraud Case Initiated', `Created incident report CASE-${Math.floor(1000 + Math.random()*9000)} linked to transaction ${tx.id}`, 'warning');
  };

  const handleFreezeWallet = (walletId: string) => {
    if (walletId.startsWith('SYSTEM')) {
      onToast('Action Blocked', 'System internal liquidity escrow pools cannot be manually frozen.', 'warning');
      return;
    }
    OperationsService.updateWalletStatus(walletId, 'Frozen').then(() => {
      queryClient.invalidateQueries({ queryKey: ['operations-wallets'] });
      onToast('Wallet Frozen', `Counterparty wallet ${walletId} has been suspended`, 'success');
    });
  };

  const handleExportCSV = () => {
    onToast('Export Assembling', 'Compiling transaction grid logs to spreadsheet...', 'info');
    setTimeout(() => {
      const headers = ['Transaction ID', 'Reference', 'Customer Name', 'Sender', 'Receiver', 'Currency', 'Amount', 'Fee', 'Status', 'Channel', 'Created Time'];
      const rows = filteredTransactions.map(t => [
        t.id, t.reference, t.customerName, t.senderWalletId, t.receiverWalletId, t.currency, t.amount, t.fee, t.status, t.channel, t.createdTime
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Transaction_Audit_Export_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast('Export Complete', 'Exported transaction search results successfully', 'success');
    }, 800);
  };

  // FILTER LOGIC
  const filteredTransactions = transactions.filter(tx => {
    // Search by ID, Ref, Wallet, Customer, IP, Country
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchLower) ||
      tx.reference.toLowerCase().includes(searchLower) ||
      tx.senderWalletId.toLowerCase().includes(searchLower) ||
      tx.receiverWalletId.toLowerCase().includes(searchLower) ||
      tx.customerName.toLowerCase().includes(searchLower) ||
      tx.customerEmail.toLowerCase().includes(searchLower) ||
      tx.paymentMethod.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Status
    if (statusFilter !== 'All' && tx.status !== statusFilter) return false;

    // Currency
    if (currencyFilter !== 'All' && tx.currency !== currencyFilter) return false;

    // Channel
    if (channelFilter !== 'All' && tx.channel !== channelFilter) return false;

    // Type
    if (typeFilter !== 'All' && tx.type !== typeFilter) return false;

    // Country
    if (countryFilter !== 'All' && tx.country !== countryFilter) return false;

    // Risk Level filter
    if (riskFilter !== 'All') {
      const score = tx.riskScore;
      if (riskFilter === 'Low' && score >= 30) return false;
      if (riskFilter === 'Medium' && (score < 30 || score > 60)) return false;
      if (riskFilter === 'High' && score <= 60) return false;
    }

    // Amount filter
    if (amountFilter !== 'All') {
      const amt = tx.amount;
      if (amountFilter === '<1k' && amt >= 1000) return false;
      if (amountFilter === '1k-10k' && (amt < 1000 || amt > 10000)) return false;
      if (amountFilter === '10k-100k' && (amt < 10000 || amt > 100000)) return false;
      if (amountFilter === '>100k' && amt <= 100000) return false;
    }

    return true;
  });

  // Column-sorting logic
  const sortedTransactions = React.useMemo(() => {
    return [...filteredTransactions].sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle string comparisons
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTransactions, sortField, sortDirection]);

  // Pagination logic
  const paginatedTransactions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedTransactions.slice(startIndex, startIndex + pageSize);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(sortedTransactions.length / pageSize);

  const selectedTx = transactions.find(t => t.id === selectedTxId);

  // Helper formats
  const formatMoney = (val: number, curr: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(val);
  };

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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Sub-header Controls */}
      <div className="bg-white border-b border-slate-200/60 p-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Transaction Monitoring Center</h2>
            
            {/* Live Feed Status Pill */}
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isLiveEnabled 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                : 'bg-slate-100 text-slate-500 border-slate-200/50'
            }`}>
              {isLiveEnabled ? (
                <>
                  <Wifi className="w-3 h-3 animate-pulse text-emerald-500" />
                  Live Feed ({pingTime}ms)
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-slate-400" />
                  Feed Suspended
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono">Real-time ledger processing and risk-assessment desk</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Live toggle */}
          {(activeRole === 'Super Administrator' || activeRole === 'Developer') && (
            <button
              onClick={() => setIsLiveEnabled(!isLiveEnabled)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                isLiveEnabled 
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              {isLiveEnabled ? 'Mute Live' : 'Go Live'}
            </button>
          )}

          {/* Export */}
          <button 
            onClick={handleExportCSV}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Export CSV dataset"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {/* Filter toggle */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
              showFilters 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {(statusFilter !== 'All' || currencyFilter !== 'All' || channelFilter !== 'All' || typeFilter !== 'All' || riskFilter !== 'All' || amountFilter !== 'All') && '●'}
          </button>
        </div>
      </div>

      {/* Extended Filters */}
      {showFilters && (
        <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-inner grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-left">
          {/* Search bar */}
          <div className="col-span-2 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Search Keyword</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="ID, Ref, email, bank..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none"
            >
              <option value="All">All statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Reversed">Reversed</option>
              <option value="Refunded">Refunded</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Currency</label>
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none"
            >
              <option value="All">All Currencies</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="SGD">SGD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>

          {/* Channel */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Channel</label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none"
            >
              <option value="All">All channels</option>
              <option value="API">API Gateway</option>
              <option value="Card">Card Swipe</option>
              <option value="Web">Web Portal</option>
              <option value="Mobile">Mobile Native</option>
              <option value="ACH">ACH Network</option>
              <option value="Wire">Fedwire</option>
              <option value="SWIFT">SWIFT Network</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Transaction Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Payment">Payment</option>
              <option value="Transfer">Transfer</option>
              <option value="Refund">Refund</option>
              <option value="Payout">Payout</option>
              <option value="Deposit">Deposit</option>
              <option value="Sweep">Sweep</option>
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Risk Rating</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none"
            >
              <option value="All">All Risk</option>
              <option value="Low">Low (&lt; 30)</option>
              <option value="Medium">Medium (30-60)</option>
              <option value="High">High (&gt; 60)</option>
            </select>
          </div>

          {/* Amount range */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Amount tier</label>
            <select
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none"
            >
              <option value="All">Any Amount</option>
              <option value="<1k">&lt; 1,000</option>
              <option value="1k-10k">1,000 - 10,000</option>
              <option value="10k-100k">10,000 - 100,000</option>
              <option value=">100k">&gt; 100,000</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Grid Area Split */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <div className="flex-1 overflow-y-auto h-full p-4 custom-scrollbar">
          
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-200/50 animate-pulse flex justify-between">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg mx-auto mt-12 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm font-sans">Queue Fetch Failure</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Error loading ledger stream. Please retry connecting.</p>
              <button onClick={() => refetch()} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">
                Retry Connection
              </button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 max-w-md mx-auto mt-12 text-center">
              <Coins className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No Transactions Found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">No logged payments match the active filter criteria.</p>
              <button 
                onClick={() => {
                  setSearchText('');
                  setStatusFilter('All');
                  setCurrencyFilter('All');
                  setChannelFilter('All');
                  setTypeFilter('All');
                  setCountryFilter('All');
                  setRiskFilter('All');
                  setAmountFilter('All');
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* Table Grid */
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('id')}>
                      Tx ID / Ref {renderSortIcon('id')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('customerName')}>
                      Customer {renderSortIcon('customerName')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('senderWalletId')}>
                      Sender / Recipient {renderSortIcon('senderWalletId')}
                    </th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('amount')}>
                      Amount {renderSortIcon('amount')}
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('type')}>
                      Channel/Type {renderSortIcon('type')}
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('riskScore')}>
                      Risk Score {renderSortIcon('riskScore')}
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('status')}>
                      Status {renderSortIcon('status')}
                    </th>
                    <th className="px-4 py-3 text-center select-none">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedTransactions.map(tx => {
                    const isSelected = selectedTxId === tx.id;
                    const isHighRisk = tx.riskScore > 60;
                    return (
                      <tr 
                        key={tx.id}
                        className={`hover:bg-slate-50/70 transition cursor-pointer select-none ${
                          isSelected ? 'bg-blue-50/30' : ''
                        }`}
                        onClick={() => setSelectedTxId(tx.id === selectedTxId ? null : tx.id)}
                      >
                        {/* ID / Ref */}
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            {tx.id}
                            {isHighRisk && (
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-500 animate-pulse" title="High Risk Trigger" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.reference}</div>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{tx.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{tx.country}</div>
                        </td>

                        {/* Sender / Receiver */}
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                          <div>S: {tx.senderWalletId}</div>
                          <div>R: {tx.receiverWalletId}</div>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 text-right font-mono font-bold">
                          <div className="text-slate-900">{formatMoney(tx.amount, tx.currency)}</div>
                          <div className="text-[10px] text-slate-400">Fee: {formatMoney(tx.fee, tx.currency)}</div>
                        </td>

                        {/* Channel/Type */}
                        <td className="px-4 py-3 text-center">
                          <div className="font-semibold text-slate-700">{tx.type}</div>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-500 font-mono text-[9px]">
                            {tx.channel}
                          </span>
                        </td>

                        {/* Risk */}
                        <td className="px-4 py-3 text-center font-mono">
                          <span className={`font-bold ${
                            tx.riskScore < 30 
                              ? 'text-emerald-600' 
                              : tx.riskScore <= 60 
                                ? 'text-amber-600' 
                                : 'text-rose-600 font-extrabold'
                          }`}>
                            {tx.riskScore} / 100
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            tx.status === 'Completed' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : tx.status === 'Pending' || tx.status === 'Under Review'
                                ? 'bg-amber-100 text-amber-800' 
                                : tx.status === 'Refunded' || tx.status === 'Reversed'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-rose-100 text-rose-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            
                            {/* Manual decision triggers for Pending reviews */}
                            {(tx.status === 'Pending' || tx.status === 'Under Review') && (
                              <>
                                <button
                                  onClick={() => handleApprove(tx)}
                                  className="p-1 rounded text-emerald-600 hover:bg-slate-100 transition cursor-pointer"
                                  title="Approve & Settlement Dispatch"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleReject(tx)}
                                  className="p-1 rounded text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                                  title="Reject Transaction"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* Failed retry trigger */}
                            {tx.status === 'Failed' && (
                              <button
                                onClick={() => handleRetry(tx)}
                                className="p-1 rounded text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                                title="Retry Transaction Execution"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Reversal trigger for completed payments */}
                            {tx.status === 'Completed' && (
                              <>
                                <button
                                  onClick={() => setReversalModal({ isOpen: true, tx })}
                                  className="p-1 rounded text-amber-600 hover:bg-slate-100 transition cursor-pointer"
                                  title="Reverse Transaction Ledger Impact"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setRefundModal({ isOpen: true, tx })}
                                  className="p-1 rounded text-purple-600 hover:bg-slate-100 transition cursor-pointer"
                                  title="Initiate Refund Request"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* General Security Fraud incidents */}
                            <button
                              onClick={() => handleOpenFraudCase(tx)}
                              className="p-1 rounded text-rose-500 hover:bg-slate-100 transition cursor-pointer"
                              title="Open Fraud Incident Case"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="bg-slate-50/75 border-t border-slate-200/50 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 select-none">
                  <span>Showing</span>
                  <span className="font-semibold text-slate-800">
                    {sortedTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </span>
                  <span>to</span>
                  <span className="font-semibold text-slate-800">
                    {Math.min(currentPage * pageSize, sortedTransactions.length)}
                  </span>
                  <span>of</span>
                  <span className="font-semibold text-slate-800">{sortedTransactions.length}</span>
                  <span>entries</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-slate-600 transition cursor-pointer select-none"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    if (totalPages > 5 && Math.abs(pageNum - currentPage) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                      if (pageNum === 2 || pageNum === totalPages - 1) {
                        return <span key={pageNum} className="px-1 text-slate-400 select-none">...</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 rounded border font-semibold transition cursor-pointer select-none ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-slate-600 transition cursor-pointer select-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Transaction Detail panel */}
        {selectedTx && (
          <div className="w-96 border-l border-slate-200 bg-white h-full overflow-y-auto shrink-0 shadow-lg text-left p-4 custom-scrollbar flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded uppercase tracking-wider">
                  Tx Audit trail
                </span>
                <h3 className="text-sm font-bold text-slate-800 mt-1 font-mono">{selectedTx.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedTxId(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 flex-1 text-xs">
              
              {/* Overview Details */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-mono text-slate-800 font-bold">{selectedTx.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="text-slate-800 font-semibold">{selectedTx.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Currency:</span>
                  <span className="text-slate-800 font-mono font-bold">{selectedTx.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settled Amount:</span>
                  <span className="text-slate-950 font-mono font-extrabold text-[13px]">{formatMoney(selectedTx.amount, selectedTx.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settled Fee:</span>
                  <span className="text-slate-700 font-mono">{formatMoney(selectedTx.fee, selectedTx.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Channel Method:</span>
                  <span className="text-slate-700 font-mono">{selectedTx.channel} ({selectedTx.paymentMethod})</span>
                </div>
              </div>

              {/* Sender Recipient wallets movements */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Wallet Movements</div>
                <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-2.5 space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-rose-600 flex items-center gap-1 font-sans">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Source Debited
                    </span>
                    <button 
                      onClick={() => handleFreezeWallet(selectedTx.senderWalletId)}
                      className="px-1.5 py-0.2 text-[9px] bg-rose-50 text-rose-700 rounded border border-rose-200/45 hover:bg-rose-100 transition"
                    >
                      Freeze Wallet
                    </button>
                  </div>
                  <div className="text-slate-800 pl-4 font-bold">{selectedTx.senderWalletId}</div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/40">
                    <span className="text-emerald-600 flex items-center gap-1 font-sans">
                      <ArrowDownLeft className="w-3.5 h-3.5" /> Recipient Credited
                    </span>
                    <button 
                      onClick={() => handleFreezeWallet(selectedTx.receiverWalletId)}
                      className="px-1.5 py-0.2 text-[9px] bg-rose-50 text-rose-700 rounded border border-rose-200/45 hover:bg-rose-100 transition"
                    >
                      Freeze Wallet
                    </button>
                  </div>
                  <div className="text-slate-800 pl-4 font-bold">{selectedTx.receiverWalletId}</div>
                </div>
              </div>

              {/* Risk Analysis Scoreboard */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Risk Analysis Scorecard</div>
                <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-2.5 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Score:</span>
                    <strong className={selectedTx.riskScore > 60 ? 'text-rose-600' : 'text-slate-700'}>{selectedTx.riskScore} / 100</strong>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full ${selectedTx.riskScore > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${selectedTx.riskScore}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">
                    {selectedTx.riskScore > 60 
                      ? 'Action advised: Hold funds and request manual 3DS authorization.' 
                      : 'Compliant signature verified.'}
                  </div>
                </div>
              </div>

              {/* Device and IP */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Device Information</div>
                <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-2.5 text-[11px] font-mono space-y-1">
                  <div><span className="text-slate-400">Device:</span> {selectedTx.device}</div>
                  <div><span className="text-slate-400">IP Address:</span> {selectedTx.ipAddress}</div>
                  <div><span className="text-slate-400">Location:</span> {selectedTx.location}</div>
                  <div><span className="text-slate-400">Geo Code:</span> {selectedTx.country}</div>
                </div>
              </div>

              {/* Audit timeline trail */}
              <div className="space-y-1.5 pb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Audit Trail</div>
                <div className="pl-3 border-l border-slate-200 space-y-3">
                  {selectedTx.auditTrail.map((item, idx) => (
                    <div key={idx} className="relative text-[10px] text-slate-600 text-left">
                      <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 border border-white" />
                      <div className="font-bold font-mono text-slate-400">{item.timestamp}</div>
                      <div className="font-semibold text-slate-800">{item.action} ({item.performedBy})</div>
                      <p className="text-slate-500 mt-0.5">{item.details}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* REVERSAL MODAL */}
      {reversalModal.isOpen && reversalModal.tx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleExecuteReversal}
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-left border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600 animate-spin-reverse" />
                Reverse Ledger Posting
              </h3>
              <button 
                type="button" 
                onClick={() => setReversalModal({ isOpen: false, tx: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">This action will reverse the debit/credit items of transaction <strong>{reversalModal.tx.id}</strong> on the corresponding balance ledgers instantly.</p>
              
              <div>
                <span className="font-bold text-slate-400">Total Refund Impact:</span> <strong className="font-mono text-rose-600">{formatMoney(reversalModal.tx.amount, reversalModal.tx.currency)}</strong>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reason for Reversal</label>
                <textarea 
                  rows={2}
                  placeholder="Compliance review error, customer chargeback, double billing..."
                  required
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReversalModal({ isOpen: false, tx: null })}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? 'Reversing...' : 'Confirm Reversal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REFUND REQUEST MODAL */}
      {refundModal.isOpen && refundModal.tx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleExecuteRefund}
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-left border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                Initiate Refund Request
              </h3>
              <button 
                type="button" 
                onClick={() => setRefundModal({ isOpen: false, tx: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">Initiates a partial/full refund workflow for <strong>{refundModal.tx.id}</strong>. This registers a pending ticket in the Refunds Queue.</p>
              
              <div>
                <span className="font-bold text-slate-400">Refundable Amount:</span> <strong className="font-mono text-purple-700">{formatMoney(refundModal.tx.amount, refundModal.tx.currency)}</strong>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reason for Refund</label>
                <textarea 
                  rows={2}
                  placeholder="Faulty merchant products, duplicate settlement, goodwill refund..."
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRefundModal({ isOpen: false, tx: null })}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending ? 'Requesting...' : 'Dispatch Request'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
