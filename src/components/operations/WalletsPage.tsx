import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Filter, SlidersHorizontal, Eye, ShieldAlert, Lock, Unlock, 
  CheckCircle2, XCircle, RefreshCw, ArrowRightLeft, FileDown, AlertTriangle, 
  DollarSign, Plus, Coins, Play, HelpCircle, ArrowUpDown, ChevronDown, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, X, Check, FileText, Ban, Sliders
} from 'lucide-react';
import { OperationsService } from './OperationsService';
import { Wallet, WalletStatus, WalletRiskLevel, WalletType } from './OperationsTypes';

interface WalletsPageProps {
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  onSelectTab: (tab: string) => void;
}

export function WalletsPage({ onToast, onSelectTab }: WalletsPageProps) {
  const queryClient = useQueryClient();
  
  // Search and Filter State
  const [searchText, setSearchText] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [balanceFilter, setBalanceFilter] = useState('All'); // 'All', '<10k', '10k-100k', '100k-1M', '>1M'
  const [tierFilter, setTierFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  // Sorting State
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, currencyFilter, statusFilter, countryFilter, riskFilter, balanceFilter, tierFilter, dateRange]);

  // Modals / Actions state
  const [adjustModal, setAdjustModal] = useState<{ isOpen: boolean; wallet: Wallet | null; type: 'Credit' | 'Debit' }>({
    isOpen: false,
    wallet: null,
    type: 'Credit'
  });
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');

  const [transferModal, setTransferModal] = useState<{ isOpen: boolean; fromWallet: Wallet | null }>({
    isOpen: false,
    fromWallet: null
  });
  const [transferToId, setTransferToId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const [flagModal, setFlagModal] = useState<{ isOpen: boolean; wallet: Wallet | null }>({
    isOpen: false,
    wallet: null
  });
  const [flagRiskLevel, setFlagRiskLevel] = useState<WalletRiskLevel>('Medium');
  const [flagRiskScore, setFlagRiskScore] = useState('50');

  // React Query Fetch Wallets
  const { 
    data: wallets = [], 
    isLoading, 
    isError, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['operations-wallets'],
    queryFn: () => OperationsService.getWallets(),
    staleTime: 5000,
    retry: 2
  });

  // Query details for Ledger, Transactions relative to selected wallet
  const { data: transactions = [] } = useQuery({
    queryKey: ['operations-transactions'],
    queryFn: () => OperationsService.getTransactions(),
    enabled: !!selectedWalletId
  });

  const { data: ledgerEntries = [] } = useQuery({
    queryKey: ['operations-ledger'],
    queryFn: () => OperationsService.getLedger(),
    enabled: !!selectedWalletId
  });

  // MUTATIONS
  const statusMutation = useMutation({
    mutationFn: ({ walletId, status }: { walletId: string; status: WalletStatus }) => 
      OperationsService.updateWalletStatus(walletId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['operations-transactions'] });
      onToast('Wallet Updated', `Wallet ${data.id} is now ${data.status.toUpperCase()}`, 'success');
    },
    onError: (err: any) => {
      onToast('Update Failed', err.message || 'Unable to update wallet status', 'warning');
    }
  });

  const adjustMutation = useMutation({
    mutationFn: ({ walletId, type, amount, note }: { walletId: string; type: 'Credit' | 'Debit'; amount: number; note: string }) => 
      OperationsService.adjustWalletBalance(walletId, type, amount, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['operations-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['operations-ledger'] });
      onToast('Balance Adjusted', `Successfully ${adjustModal.type}ed ${adjustAmount} ${data.currency} to ${data.customerName}`, 'success');
      setAdjustModal({ isOpen: false, wallet: null, type: 'Credit' });
      setAdjustAmount('');
      setAdjustNote('');
    },
    onError: (err: any) => {
      onToast('Adjustment Failed', err.message || 'Error executing balance adjustment', 'warning');
    }
  });

  const transferMutation = useMutation({
    mutationFn: ({ fromId, toId, amount, currency, note }: { fromId: string; toId: string; amount: number; currency: string; note: string }) => 
      OperationsService.transferFunds(fromId, toId, amount, currency, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['operations-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['operations-ledger'] });
      onToast('Transfer Succeeded', `Transferred ${transferAmount} internally`, 'success');
      setTransferModal({ isOpen: false, fromWallet: null });
      setTransferToId('');
      setTransferAmount('');
      setTransferNote('');
    },
    onError: (err: any) => {
      onToast('Transfer Failed', err.message || 'Unable to complete internal transfer', 'warning');
    }
  });

  const flagMutation = useMutation({
    mutationFn: ({ walletId, risk, score }: { walletId: string; risk: WalletRiskLevel; score: number }) => 
      OperationsService.flagWallet(walletId, risk, score),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-wallets'] });
      onToast('Risk Status Modified', `Wallet ${data.id} risk score set to ${data.riskScore} (${data.riskLevel})`, 'success');
      setFlagModal({ isOpen: false, wallet: null });
    },
    onError: (err: any) => {
      onToast('Update Failed', err.message || 'Unable to update risk status', 'warning');
    }
  });

  // Action helper handers
  const handleFreezeToggle = (wallet: Wallet) => {
    const nextStatus: WalletStatus = wallet.status === 'Frozen' ? 'Active' : 'Frozen';
    statusMutation.mutate({ walletId: wallet.id, status: nextStatus });
  };

  const handleLockToggle = (wallet: Wallet) => {
    const nextStatus: WalletStatus = wallet.status === 'Locked' ? 'Active' : 'Locked';
    statusMutation.mutate({ walletId: wallet.id, status: nextStatus });
  };

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal.wallet) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      onToast('Validation Error', 'Please enter a valid balance adjustment amount', 'warning');
      return;
    }
    adjustMutation.mutate({
      walletId: adjustModal.wallet.id,
      type: adjustModal.type,
      amount,
      note: adjustNote || 'Administrative balance adjustments'
    });
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModal.fromWallet) return;
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      onToast('Validation Error', 'Please enter a valid transfer amount', 'warning');
      return;
    }
    if (!transferToId) {
      onToast('Validation Error', 'Please select a destination wallet', 'warning');
      return;
    }
    transferMutation.mutate({
      fromId: transferModal.fromWallet.id,
      toId: transferToId,
      amount,
      currency: transferModal.fromWallet.currency,
      note: transferNote || 'Manual direct peer transfer'
    });
  };

  const handleExecuteFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagModal.wallet) return;
    const score = parseInt(flagRiskScore, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      onToast('Validation Error', 'Please enter a risk score between 0 and 100', 'warning');
      return;
    }
    flagMutation.mutate({
      walletId: flagModal.wallet.id,
      risk: flagRiskLevel,
      score
    });
  };

  const handleDownloadStatement = (wallet: Wallet) => {
    onToast('Statement Initiated', `Assembling transaction entries for ${wallet.id} statement.`, 'info');
    setTimeout(() => {
      const headers = ['Post Date', 'Ref ID', 'Type', 'Amount', 'Balance Result'];
      const rows = [
        ['2026-07-09 01:10:05', 'REF-ACME-JUL-001', 'Transfer Out', `$150,000.00`, `$1,450,280.50`],
        ['2026-07-08 14:02:11', 'TX-7231', 'Deposit In', `$50,000.00`, `$1,600,280.50`]
      ];
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Statement_${wallet.id}_${wallet.currency}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast('Statement Downloaded', `Successfully compiled CSV statement for ${wallet.customerName}`, 'success');
    }, 1200);
  };

  // FILTER LOGIC
  const filteredWallets = wallets.filter(wallet => {
    // Search
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      wallet.id.toLowerCase().includes(searchLower) ||
      wallet.customerName.toLowerCase().includes(searchLower) ||
      wallet.customerEmail.toLowerCase().includes(searchLower) ||
      wallet.country.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Currency
    if (currencyFilter !== 'All' && wallet.currency !== currencyFilter) return false;

    // Status
    if (statusFilter !== 'All' && wallet.status !== statusFilter) return false;

    // Country
    if (countryFilter !== 'All' && wallet.country !== countryFilter) return false;

    // Risk
    if (riskFilter !== 'All' && wallet.riskLevel !== riskFilter) return false;

    // Tier
    if (tierFilter !== 'All' && wallet.accountTier !== tierFilter) return false;

    // Balance filter
    if (balanceFilter !== 'All') {
      const balance = wallet.availableBalance;
      if (balanceFilter === '<10k' && balance >= 10000) return false;
      if (balanceFilter === '10k-100k' && (balance < 10000 || balance > 100000)) return false;
      if (balanceFilter === '100k-1M' && (balance < 100000 || balance > 1000000)) return false;
      if (balanceFilter === '>1M' && balance <= 1000000) return false;
    }

    return true;
  });

  // Column-sorting logic
  const sortedWallets = useMemo(() => {
    return [...filteredWallets].sort((a: any, b: any) => {
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
  }, [filteredWallets, sortField, sortDirection]);

  // Pagination logic
  const paginatedWallets = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedWallets.slice(startIndex, startIndex + pageSize);
  }, [sortedWallets, currentPage]);

  const totalPages = Math.ceil(sortedWallets.length / pageSize);

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

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  const selectedWalletTx = transactions.filter(t => t.senderWalletId === selectedWalletId || t.receiverWalletId === selectedWalletId);
  const selectedWalletLedger = ledgerEntries.filter(l => l.walletId === selectedWalletId);

  // Helper formatting values
  const formatMoney = (val: number, curr: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Sub-header Controls */}
      <div className="bg-white border-b border-slate-200/60 p-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans">Wallet Operations Center</h2>
          <p className="text-xs text-slate-500 font-mono">Monitor, adjust, and audit all enterprise wallets</p>
        </div>
        
        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            disabled={isLoading || isFetching}
            title="Refresh Ledger Cache"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
              showFilters 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {(currencyFilter !== 'All' || statusFilter !== 'All' || riskFilter !== 'All' || balanceFilter !== 'All' || tierFilter !== 'All') && '●'}
          </button>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-inner grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-left">
          {/* Search */}
          <div className="col-span-2 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search Customer / Wallet ID</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search Acct or ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Currency</label>
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Currencies</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="SGD">SGD (S$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>

          {/* Wallet Status */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Frozen">Frozen Only</option>
              <option value="Locked">Locked Only</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Country</label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Countries</option>
              <option value="United States">United States</option>
              <option value="Germany">Germany</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Singapore">Singapore</option>
              <option value="Australia">Australia</option>
              <option value="Russia">Russia</option>
            </select>
          </div>

          {/* Risk */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Risk Rating</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Risk levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Balance Range */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Balance</label>
            <select
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">Any Balance</option>
              <option value="<10k">&lt; 10k</option>
              <option value="10k-100k">10k - 100k</option>
              <option value="100k-1M">100k - 1M</option>
              <option value=">1M">&gt; 1M</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Content Split: grid on left, details on right if selected */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Table/List Area */}
        <div className="flex-1 overflow-y-auto h-full p-4 custom-scrollbar">
          
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200/50 animate-pulse flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-48 bg-slate-100 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : isError ? (
            /* Error Fallback with Retry Logic */
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg mx-auto mt-12 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">Operation Center Load Failure</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">A network synchronization issue was detected with the ledger query layer.</p>
              <button 
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
              >
                Retry Synchronize
              </button>
            </div>
          ) : filteredWallets.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-slate-200 rounded-xl p-12 max-w-md mx-auto mt-12 text-center">
              <Coins className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No Wallets Match Filters</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Try relaxing search parameters, risk scores, or status checkboxes.</p>
              <button 
                onClick={() => {
                  setSearchText('');
                  setCurrencyFilter('All');
                  setStatusFilter('All');
                  setCountryFilter('All');
                  setRiskFilter('All');
                  setBalanceFilter('All');
                  setTierFilter('All');
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Data Grid */
            <div className="bg-white border border-slate-200/75 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('id')}>
                      Wallet ID {renderSortIcon('id')}
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('customerName')}>
                      Customer {renderSortIcon('customerName')}
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('type')}>
                      Type {renderSortIcon('type')}
                    </th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('availableBalance')}>
                      Available Balance {renderSortIcon('availableBalance')}
                    </th>
                    <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('heldBalance')}>
                      Pending / Held {renderSortIcon('heldBalance')}
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('status')}>
                      Status {renderSortIcon('status')}
                    </th>
                    <th className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100/50 transition select-none" onClick={() => handleSort('riskLevel')}>
                      Risk Level {renderSortIcon('riskLevel')}
                    </th>
                    <th className="px-4 py-3 text-center select-none">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedWallets.map(wallet => {
                    const isSelected = selectedWalletId === wallet.id;
                    return (
                      <tr 
                        key={wallet.id} 
                        className={`hover:bg-slate-50/70 transition cursor-pointer select-none ${
                          isSelected ? 'bg-blue-50/30' : ''
                        }`}
                        onClick={() => setSelectedWalletId(wallet.id === selectedWalletId ? null : wallet.id)}
                      >
                        {/* ID */}
                        <td className="px-4 py-3 font-mono font-bold text-blue-600">
                          {wallet.id}
                        </td>
                        
                        {/* Customer */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{wallet.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{wallet.country}</div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/30 font-mono text-[9px] uppercase font-bold">
                            {wallet.walletType}
                          </span>
                        </td>

                        {/* Available Balance */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          {formatMoney(wallet.availableBalance, wallet.currency)}
                        </td>

                        {/* Pending / Held */}
                        <td className="px-4 py-3 text-right font-mono text-slate-500 text-[11px]">
                          <div>P: {formatMoney(wallet.pendingBalance, wallet.currency)}</div>
                          <div>H: {formatMoney(wallet.heldBalance, wallet.currency)}</div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            wallet.status === 'Active' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : wallet.status === 'Frozen' 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-rose-100 text-rose-800'
                          }`}>
                            {wallet.status}
                          </span>
                        </td>

                        {/* Risk */}
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold ${
                            wallet.riskLevel === 'Low' 
                              ? 'text-slate-500' 
                              : wallet.riskLevel === 'Medium' 
                                ? 'text-amber-600' 
                                : 'text-rose-600'
                          }`}>
                            Score: {wallet.riskScore}
                          </span>
                        </td>

                        {/* Action buttons list */}
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            
                            {/* Freeze toggle */}
                            <button
                              onClick={() => handleFreezeToggle(wallet)}
                              className={`p-1 rounded hover:bg-slate-100 transition cursor-pointer ${
                                wallet.status === 'Frozen' ? 'text-amber-600' : 'text-slate-400'
                              }`}
                              title={wallet.status === 'Frozen' ? 'Unfreeze Wallet' : 'Freeze Wallet'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            {/* Lock toggle */}
                            <button
                              onClick={() => handleLockToggle(wallet)}
                              className={`p-1 rounded hover:bg-slate-100 transition cursor-pointer ${
                                wallet.status === 'Locked' ? 'text-rose-600' : 'text-slate-400'
                              }`}
                              title={wallet.status === 'Locked' ? 'Unlock Wallet' : 'Lock Wallet'}
                            >
                              {wallet.status === 'Locked' ? (
                                <Lock className="w-3.5 h-3.5 text-rose-500" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Credit/Debit */}
                            <button
                              onClick={() => setAdjustModal({ isOpen: true, wallet, type: 'Credit' })}
                              className="p-1 rounded hover:bg-slate-100 text-blue-600 transition cursor-pointer"
                              title="Adjust Wallet Balance (Credit/Debit)"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>

                            {/* Internal transfer */}
                            <button
                              onClick={() => setTransferModal({ isOpen: true, fromWallet: wallet })}
                              className="p-1 rounded hover:bg-slate-100 text-purple-600 transition cursor-pointer"
                              title="Internal Funds Transfer"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Risk Flagging */}
                            <button
                              onClick={() => {
                                setFlagRiskLevel(wallet.riskLevel);
                                setFlagRiskScore(wallet.riskScore.toString());
                                setFlagModal({ isOpen: true, wallet });
                              }}
                              className="p-1 rounded hover:bg-slate-100 text-amber-500 transition cursor-pointer"
                              title="Flag Wallet Risk Level"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                            
                            {/* Download statement */}
                            <button
                              onClick={() => handleDownloadStatement(wallet)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                              title="Download Statement (CSV)"
                            >
                              <FileDown className="w-3.5 h-3.5" />
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
                    {sortedWallets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  </span>
                  <span>to</span>
                  <span className="font-semibold text-slate-800">
                    {Math.min(currentPage * pageSize, sortedWallets.length)}
                  </span>
                  <span>of</span>
                  <span className="font-semibold text-slate-800">{sortedWallets.length}</span>
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

        {/* Selected Wallet Details Panel */}
        {selectedWallet && (
          <div className="w-96 border-l border-slate-200 bg-white h-full overflow-y-auto shrink-0 shadow-lg text-left p-4 custom-scrollbar flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded uppercase tracking-wider">
                  Wallet Details
                </span>
                <h3 className="text-sm font-bold text-slate-800 mt-1 font-mono">{selectedWallet.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedWalletId(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Workspace details */}
            <div className="space-y-4 flex-1">
              {/* Customer quick card */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-lg p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Owner / Customer</div>
                <div className="font-semibold text-slate-800 text-xs mt-1">{selectedWallet.customerName}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedWallet.customerEmail}</div>
                <div className="text-[10px] text-slate-500 font-mono">{selectedWallet.customerPhone}</div>
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-600 font-mono">
                  <span>Country: <strong>{selectedWallet.country}</strong></span>
                  <span>•</span>
                  <span>Tier: <strong>{selectedWallet.accountTier}</strong></span>
                </div>
              </div>

              {/* Balance Summary */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Balance Summary</div>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/30">
                    <span className="text-[9px] text-slate-400 block font-bold">Current</span>
                    <strong className="text-xs text-slate-900 font-mono">{formatMoney(selectedWallet.currentBalance, selectedWallet.currency)}</strong>
                  </div>
                  <div className="bg-blue-50/40 rounded-lg p-2.5 border border-blue-100/40">
                    <span className="text-[9px] text-blue-500 block font-bold">Available</span>
                    <strong className="text-xs text-blue-700 font-mono">{formatMoney(selectedWallet.availableBalance, selectedWallet.currency)}</strong>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/30">
                    <span className="text-[9px] text-slate-400 block font-bold">Held Balance</span>
                    <strong className="text-xs text-slate-700 font-mono">{formatMoney(selectedWallet.heldBalance, selectedWallet.currency)}</strong>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/30">
                    <span className="text-[9px] text-slate-400 block font-bold">Pending In</span>
                    <strong className="text-xs text-slate-700 font-mono">{formatMoney(selectedWallet.pendingBalance, selectedWallet.currency)}</strong>
                  </div>
                </div>
              </div>

              {/* Cards / Bank Accounts count info */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-2 text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Cards</span>
                  <strong className="text-sm font-bold text-slate-800 font-mono">{selectedWallet.cardsCount}</strong>
                </div>
                <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-2 text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Benefic.</span>
                  <strong className="text-sm font-bold text-slate-800 font-mono">{selectedWallet.beneficiariesCount}</strong>
                </div>
                <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-2 text-center">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Banks</span>
                  <strong className="text-sm font-bold text-slate-800 font-mono">{selectedWallet.bankAccountsCount}</strong>
                </div>
              </div>

              {/* Related Transactions (from central state) */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                  <span>Recent Ledger Logs</span>
                  <span className="text-[9px] text-blue-600 font-mono cursor-pointer hover:underline" onClick={() => onSelectTab('transactions')}>
                    View All
                  </span>
                </div>
                <div className="space-y-1 bg-slate-50 border border-slate-200/40 rounded-lg p-2 font-mono text-[10px]">
                  {selectedWalletTx.length === 0 ? (
                    <div className="text-slate-400 text-center py-2">No transaction logs</div>
                  ) : (
                    selectedWalletTx.map(tx => {
                      const isSender = tx.senderWalletId === selectedWalletId;
                      return (
                        <div key={tx.id} className="flex justify-between items-center py-1 border-b border-slate-200/30 last:border-0">
                          <div>
                            <span className="font-bold text-slate-700">{tx.id}</span>
                            <span className="text-slate-400 ml-1.5">({tx.type})</span>
                          </div>
                          <span className={`font-bold ${isSender ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isSender ? '-' : '+'}{formatMoney(tx.amount, tx.currency)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Double-Entry Postings */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center justify-between">
                  <span>Ledger Postings</span>
                </div>
                <div className="space-y-1 bg-slate-50 border border-slate-200/40 rounded-lg p-2 font-mono text-[10px]">
                  {selectedWalletLedger.length === 0 ? (
                    <div className="text-slate-400 text-center py-2">No ledger entries posted</div>
                  ) : (
                    selectedWalletLedger.map(entry => (
                      <div key={entry.id} className="py-1 border-b border-slate-200/30 last:border-0 flex flex-col text-left">
                        <div className="flex justify-between text-slate-600">
                          <span className="font-bold text-slate-800">{entry.reference}</span>
                          <span>{entry.postingTime.split(' ')[0]}</span>
                        </div>
                        <div className="text-slate-400">{entry.account}</div>
                        <div className="flex justify-between font-bold text-[9px] mt-0.5">
                          <span className="text-rose-500">Dr: {entry.debit > 0 ? formatMoney(entry.debit, entry.currency) : '-'}</span>
                          <span className="text-emerald-500">Cr: {entry.credit > 0 ? formatMoney(entry.credit, entry.currency) : '-'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Audit Timeline / Events */}
              <div className="space-y-1.5 pb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Audit & System Log</div>
                <div className="space-y-3 pl-2 border-l border-slate-200">
                  <div className="relative text-[10px] text-slate-600">
                    <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
                    <div className="font-bold font-mono">2026-07-09 01:28</div>
                    <p className="text-slate-500 mt-0.5">Wallet inspected by system operations desk.</p>
                  </div>
                  <div className="relative text-[10px] text-slate-600">
                    <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border border-white" />
                    <div className="font-bold font-mono">
                      {selectedWallet.updatedDate}
                    </div>
                    <p className="text-slate-500 mt-0.5">Ledger synchronizer verified cache compliance status.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ADJUST BALANCE MODAL */}
      {adjustModal.isOpen && adjustModal.wallet && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleExecuteAdjustment}
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-left border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Coins className="w-4 h-4 text-blue-600" />
                Adjust Wallet Balance
              </h3>
              <button 
                type="button" 
                onClick={() => setAdjustModal({ isOpen: false, wallet: null, type: 'Credit' })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-400">Wallet Owner:</span> {adjustModal.wallet.customerName}
              </div>
              <div>
                <span className="font-bold text-slate-400">Currency Unit:</span> {adjustModal.wallet.currency}
              </div>
              
              {/* Type toggle */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Adjustment Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustModal(prev => ({ ...prev, type: 'Credit' }))}
                    className={`py-2 rounded-lg font-bold border text-center transition cursor-pointer ${
                      adjustModal.type === 'Credit' 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Credit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustModal(prev => ({ ...prev, type: 'Debit' }))}
                    className={`py-2 rounded-lg font-bold border text-center transition cursor-pointer ${
                      adjustModal.type === 'Debit' 
                        ? 'bg-rose-50 border-rose-300 text-rose-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Debit (-)
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Amount ({adjustModal.wallet.currency})</label>
                <input 
                  type="number"
                  step="any"
                  placeholder="0.00"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Audit/Justification Note</label>
                <textarea 
                  rows={2}
                  placeholder="Provide brief business context..."
                  required
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustModal({ isOpen: false, wallet: null, type: 'Credit' })}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-3 py-1.5 rounded-lg text-white font-bold text-xs cursor-pointer ${
                  adjustModal.type === 'Credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
                disabled={adjustMutation.isPending}
              >
                {adjustMutation.isPending ? 'Executing...' : 'Post Adjustment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INTERNAL FUNDS TRANSFER MODAL */}
      {transferModal.isOpen && transferModal.fromWallet && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleExecuteTransfer}
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-left border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                Internal Funds Transfer
              </h3>
              <button 
                type="button" 
                onClick={() => setTransferModal({ isOpen: false, fromWallet: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-400">Source Account:</span> {transferModal.fromWallet.id} ({transferModal.fromWallet.customerName})
              </div>
              <div>
                <span className="font-bold text-slate-400">Available:</span> <strong className="font-mono text-blue-600">{formatMoney(transferModal.fromWallet.availableBalance, transferModal.fromWallet.currency)}</strong>
              </div>

              {/* Recipient Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Destination Wallet</label>
                <select
                  required
                  value={transferToId}
                  onChange={(e) => setTransferToId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Choose Recipient Wallet --</option>
                  {wallets
                    .filter(w => w.id !== transferModal.fromWallet?.id && w.currency === transferModal.fromWallet?.currency)
                    .map(w => (
                      <option key={w.id} value={w.id}>
                        {w.id} - {w.customerName} ({w.currency})
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Amount ({transferModal.fromWallet.currency})</label>
                <input 
                  type="number"
                  step="any"
                  placeholder="0.00"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Audit Note</label>
                <textarea 
                  rows={2}
                  placeholder="Describe reason for internal transfer..."
                  required
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTransferModal({ isOpen: false, fromWallet: null })}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
                disabled={transferMutation.isPending}
              >
                {transferMutation.isPending ? 'Executing...' : 'Authorize Transfer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RISK FLAG / MODIFY SECURITY MODAL */}
      {flagModal.isOpen && flagModal.wallet && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleExecuteFlag}
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-left border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Modify Risk Status
              </h3>
              <button 
                type="button" 
                onClick={() => setFlagModal({ isOpen: false, wallet: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-400">Wallet:</span> {flagModal.wallet.id} ({flagModal.wallet.customerName})
              </div>

              {/* Risk Level */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Risk Level</label>
                <select
                  required
                  value={flagRiskLevel}
                  onChange={(e) => setFlagRiskLevel(e.target.value as WalletRiskLevel)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:outline-none"
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                  <option value="Critical">Critical Risk</option>
                </select>
              </div>

              {/* Score */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Risk Score (0 - 100)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={flagRiskScore}
                  onChange={(e) => setFlagRiskScore(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFlagModal({ isOpen: false, wallet: null })}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
                disabled={flagMutation.isPending}
              >
                {flagMutation.isPending ? 'Updating...' : 'Save Risk Status'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
