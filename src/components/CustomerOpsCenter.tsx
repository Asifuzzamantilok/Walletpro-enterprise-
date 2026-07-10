import React, { useState } from 'react';
import { 
  Search, Filter, SlidersHorizontal, Eye, Download, Trash2, 
  Lock, Unlock, ShieldAlert, CheckCircle2, XCircle, Plus, 
  RefreshCw, Users, Shield, ArrowUpDown, ChevronLeft, ChevronRight,
  Sparkles, Star, Moon, Sun, Info, Settings, Pin, PinOff
} from 'lucide-react';
import { Customer, WalletStatus, KYCStatus, AccountTier } from './customerTypes';
import { initialCustomers } from './customerMockData';
import { CustomerProfileWorkspace } from './CustomerProfileWorkspace';

interface CustomerOpsCenterProps {
  onToast: (title: string, msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export function CustomerOpsCenter({ onToast }: CustomerOpsCenterProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [kycFilter, setKycFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All'); // 'All', 'Low (<30)', 'Medium (30-60)', 'High (>60)'

  // Saved Views/Filters
  const [activeSavedView, setActiveSavedView] = useState('All Active');

  // Sorting State
  const [sortField, setSortField] = useState<keyof Customer>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Column Visibility & Pinning State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    fullName: true,
    email: true,
    phone: false,
    country: true,
    walletStatus: true,
    kycStatus: true,
    riskScore: true,
    accountTier: true,
    totalBalance: true,
    primaryCurrency: true,
    lastLogin: true,
  });

  const [pinnedColumns, setPinnedColumns] = useState<Record<string, boolean>>({
    id: true,
    fullName: false,
  });

  const [showColSettings, setShowColSettings] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Customer reference
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Saved views pre-configured filters
  const applySavedView = (viewName: string) => {
    setActiveSavedView(viewName);
    setCurrentPage(1);
    
    // Reset filters
    setSearchTerm('');
    setCountryFilter('All');
    setTierFilter('All');
    setStatusFilter('All');
    setKycFilter('All');
    setRiskFilter('All');

    switch (viewName) {
      case 'High Risk':
        setRiskFilter('High (>60)');
        break;
      case 'KYC Pending':
        setKycFilter('Pending');
        break;
      case 'Tier 3 VIP':
        setTierFilter('VIP');
        break;
      default:
        break;
    }
  };

  // Handle Sort Toggle
  const toggleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Perform Column Toggle
  const toggleColumnVisibility = (col: string) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const toggleColumnPin = (col: string) => {
    setPinnedColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = ['Customer ID', 'Full Name', 'Email', 'Country', 'Wallet Status', 'KYC Status', 'Risk Score', 'Account Tier', 'Total Balance'];
    const rows = customers.map(c => [
      c.id, c.fullName, c.email, c.country, c.walletStatus, c.kycStatus, c.riskScore, c.accountTier, c.totalBalance
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WalletPro_CustomerOps_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onToast('Export Successful', 'Customer directory CSV downloaded successfully.', 'success');
  };

  // Bulk operations
  const handleBulkAction = (action: 'freeze' | 'unfreeze' | 'kyc-verify') => {
    if (selectedIds.length === 0) {
      onToast('No Selection', 'Please select at least one customer record.', 'warning');
      return;
    }

    const updated = customers.map(c => {
      if (selectedIds.includes(c.id)) {
        let updateObj = { ...c };
        const dateStr = new Date().toISOString().substring(0, 10);
        if (action === 'freeze') {
          updateObj.walletStatus = 'Frozen' as const;
          updateObj.timeline = [{
            id: `EV-BULK-${Math.floor(Math.random() * 1000)}`,
            date: dateStr,
            title: 'Bulk Frozen Operations Hold',
            description: 'Customer wallet locked by administrative bulk operational action.',
            category: 'Admin',
            performedBy: 'System Administrator'
          }, ...updateObj.timeline];
        } else if (action === 'unfreeze') {
          updateObj.walletStatus = 'Active' as const;
          updateObj.timeline = [{
            id: `EV-BULK-${Math.floor(Math.random() * 1000)}`,
            date: dateStr,
            title: 'Bulk Unfreeze Hold Lifted',
            description: 'Customer wallet administrative hold lifted by bulk operational override.',
            category: 'Admin',
            performedBy: 'System Administrator'
          }, ...updateObj.timeline];
        } else if (action === 'kyc-verify') {
          updateObj.kycStatus = 'Verified' as const;
          updateObj.timeline = [{
            id: `EV-BULK-${Math.floor(Math.random() * 1000)}`,
            date: dateStr,
            title: 'Bulk KYC Manual Bypass Verified',
            description: 'KYC verified via bulk administrative database action.',
            category: 'KYC',
            performedBy: 'System Administrator'
          }, ...updateObj.timeline];
        }
        return updateObj;
      }
      return c;
    });

    setCustomers(updated);
    setSelectedIds([]);
    onToast('Bulk Action Executed', `Successfully modified state for ${selectedIds.length} customer dossiers.`, 'success');
  };

  const handleToggleSelectAll = (filteredList: Customer[]) => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(c => c.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter & Sort core logic
  const filteredList = customers.filter(c => {
    // Search matching
    const matchesSearch = 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Country Filter
    const matchesCountry = countryFilter === 'All' || c.country === countryFilter;
    
    // Tier Filter
    const matchesTier = tierFilter === 'All' || c.accountTier === tierFilter;

    // Status Filter
    const matchesStatus = statusFilter === 'All' || c.walletStatus === statusFilter;

    // KYC Filter
    const matchesKyc = kycFilter === 'All' || c.kycStatus === kycFilter;

    // Risk Filter
    let matchesRisk = true;
    if (riskFilter === 'Low (<30)') matchesRisk = c.riskScore < 30;
    else if (riskFilter === 'Medium (30-60)') matchesRisk = c.riskScore >= 30 && c.riskScore <= 60;
    else if (riskFilter === 'High (>60)') matchesRisk = c.riskScore > 60;

    return matchesSearch && matchesCountry && matchesTier && matchesStatus && matchesKyc && matchesRisk;
  }).sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  // Unique countries for dropdown
  const availableCountries = ['All', ...Array.from(new Set(customers.map(c => c.country)))];

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Status indicators color utilities
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score <= 60) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getStatusBadgeClass = (status: WalletStatus) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 font-bold';
      case 'Frozen': return 'bg-amber-100 text-amber-800 font-bold animate-pulse';
      default: return 'bg-red-100 text-red-800 font-bold';
    }
  };

  const getKycBadgeClass = (status: KYCStatus) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Pending': return 'bg-blue-50 text-blue-700 border-blue-200/80 animate-pulse';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200/80';
      default: return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  // Render detail workspace if customer selected
  if (selectedCustomerId && selectedCustomer) {
    return (
      <CustomerProfileWorkspace 
        customer={selectedCustomer}
        onBack={() => setSelectedCustomerId(null)}
        onUpdateCustomer={handleUpdateCustomer}
        onToast={onToast}
      />
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-800 text-left">
      
      {/* Search and Filters Hub */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 mb-5 shadow-xs shrink-0 space-y-4">
        
        {/* Top Control Bar: Search Input & Export Actions */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight font-display">Customer Operations Hub</h1>
              <p className="text-[11px] text-slate-400 font-medium">Verify credentials, bypass KYC constraints, issue card networks, and lock wallets.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Instant Saved Views */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/40 text-[11px] font-bold">
              {['All Active', 'High Risk', 'KYC Pending', 'Tier 3 VIP'].map((view) => (
                <button
                  key={view}
                  onClick={() => applySavedView(view)}
                  className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    activeSavedView === view 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Export CSV button */}
            <button 
              onClick={handleExportCSV}
              className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Matrix row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
          
          {/* Instant Search Bar */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Name, Email, Phone, ID..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-medium outline-none focus:bg-white focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>

          {/* Country Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Country Origin</label>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:bg-white cursor-pointer"
            >
              {availableCountries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Account Tier Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Tier</label>
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:bg-white cursor-pointer"
            >
              <option value="All">All Tiers</option>
              <option value="VIP">VIP</option>
              <option value="Tier 3">Tier 3</option>
              <option value="Tier 2">Tier 2</option>
              <option value="Tier 1">Tier 1</option>
            </select>
          </div>

          {/* Wallet Status Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wallet Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:bg-white cursor-pointer"
            >
              <option value="All">All States</option>
              <option value="Active">Active</option>
              <option value="Frozen">Frozen</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* KYC Status Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">KYC Status</label>
            <select
              value={kycFilter}
              onChange={(e) => {
                setKycFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:bg-white cursor-pointer"
            >
              <option value="All">All KYC</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Dynamic Column Visibility Settings Drawer Toggle */}
        <div className="flex justify-between items-center pt-2.5 text-[11px] font-bold">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowColSettings(!showColSettings)}
              className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Configure Visible Columns ({Object.values(visibleColumns).filter(Boolean).length})</span>
            </button>
          </div>

          <span className="text-slate-400 font-mono font-medium">Found: {filteredList.length} Customer Dossiers</span>
        </div>

        {/* Column Settings Drawer */}
        {showColSettings && (
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/50 text-xs text-slate-700 leading-relaxed grid grid-cols-2 md:grid-cols-6 gap-3">
            {Object.keys(visibleColumns).map((col) => (
              <div key={col} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-2xs">
                <input 
                  type="checkbox" 
                  checked={visibleColumns[col]} 
                  onChange={() => toggleColumnVisibility(col)}
                  className="cursor-pointer"
                  id={`chk-${col}`}
                />
                <label htmlFor={`chk-${col}`} className="font-bold cursor-pointer capitalize">
                  {col.replace(/([A-Z])/g, ' $1')}
                </label>
                
                {/* Pin button */}
                <button
                  onClick={() => toggleColumnPin(col)}
                  className={`ml-auto text-slate-400 hover:text-slate-800 ${pinnedColumns[col] ? 'text-blue-600' : ''}`}
                  title="Pin column to left"
                >
                  {pinnedColumns[col] ? <Pin className="w-3 h-3 fill-current" /> : <PinOff className="w-3 h-3" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid Multi-Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-600 text-white rounded-xl px-5 py-3 mb-5 shadow-md flex justify-between items-center z-10 animate-fade-in shrink-0">
          <div className="flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{selectedIds.length} Customer Accounts Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleBulkAction('freeze')}
              className="bg-white hover:bg-slate-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Bulk Freeze
            </button>
            <button 
              onClick={() => handleBulkAction('unfreeze')}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Bulk Unfreeze
            </button>
            <button 
              onClick={() => handleBulkAction('kyc-verify')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Bulk KYC Verify
            </button>
            <span className="text-white/40 font-mono text-[11px] px-1">|</span>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-white hover:underline text-xs font-semibold cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Customer Directory Ledger Data Grid */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs flex flex-col min-h-0">
        
        {/* Scrollable table container */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs select-none">
            
            {/* Headers row */}
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-100 sticky top-0 z-10 shadow-3xs">
                {/* Select All Checkbox */}
                <th className="px-4 py-3.5 w-10 text-center">
                  <input 
                    type="checkbox" 
                    checked={paginatedList.length > 0 && selectedIds.length === paginatedList.length}
                    onChange={() => handleToggleSelectAll(paginatedList)}
                    className="cursor-pointer"
                  />
                </th>

                {/* Grid Pinned Columns render first */}
                {Object.keys(pinnedColumns).map((col) => {
                  if (!pinnedColumns[col] || !visibleColumns[col]) return null;
                  return (
                    <th 
                      key={`pin-${col}`} 
                      onClick={() => toggleSort(col as keyof Customer)}
                      className="px-4 py-3.5 font-bold cursor-pointer select-none text-slate-700 bg-slate-100 border-r border-slate-200"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.replace(/([A-Z])/g, ' $1')}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        <Pin className="w-2.5 h-2.5 text-blue-500" />
                      </div>
                    </th>
                  );
                })}

                {/* Normal Columns */}
                {Object.keys(visibleColumns).map((col) => {
                  if (pinnedColumns[col] || !visibleColumns[col]) return null;
                  return (
                    <th 
                      key={col} 
                      onClick={() => toggleSort(col as keyof Customer)}
                      className="px-4 py-3.5 font-bold cursor-pointer select-none hover:bg-slate-100/50"
                    >
                      <div className="flex items-center gap-1">
                        <span>{col.replace(/([A-Z])/g, ' $1')}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  );
                })}

                {/* Actions column header */}
                <th className="px-4 py-3.5 text-right font-bold w-24">Actions</th>
              </tr>
            </thead>

            {/* Grid Items Body */}
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedList.length > 0 ? (
                paginatedList.map((customer) => {
                  const isSelected = selectedIds.includes(customer.id);
                  return (
                    <tr 
                      key={customer.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isSelected ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      {/* Checkbox cell */}
                      <td className="px-4 py-3.5 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(customer.id)}
                          className="cursor-pointer"
                        />
                      </td>

                      {/* Pinned columns values */}
                      {Object.keys(pinnedColumns).map((col) => {
                        if (!pinnedColumns[col] || !visibleColumns[col]) return null;
                        return (
                          <td key={`val-pin-${col}`} className="px-4 py-3.5 font-bold text-slate-900 bg-slate-100/30 border-r border-slate-200">
                            {col === 'id' && (
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border">
                                {customer.id}
                              </span>
                            )}
                            {col === 'fullName' && (
                              <div className="flex items-center gap-2">
                                <img src={customer.photoUrl} alt={customer.fullName} className="w-6 h-6 rounded-full object-cover border" />
                                <span>{customer.fullName}</span>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Normal Columns values */}
                      {Object.keys(visibleColumns).map((col) => {
                        if (pinnedColumns[col] || !visibleColumns[col]) return null;
                        
                        // ID cell fallback
                        if (col === 'id') {
                          return (
                            <td key={col} className="px-4 py-3.5 font-mono text-[10px] text-slate-500">
                              {customer.id}
                            </td>
                          );
                        }

                        // FullName cell fallback
                        if (col === 'fullName') {
                          return (
                            <td key={col} className="px-4 py-3.5 text-slate-900">
                              <div className="flex items-center gap-2">
                                <img src={customer.photoUrl} alt="" className="w-6 h-6 rounded-full object-cover border" />
                                <span>{customer.fullName}</span>
                              </div>
                            </td>
                          );
                        }

                        // Other customized cells
                        if (col === 'email') return <td key={col} className="px-4 py-3.5 text-slate-500">{customer.email}</td>;
                        if (col === 'phone') return <td key={col} className="px-4 py-3.5 font-mono text-slate-500">{customer.phone}</td>;
                        if (col === 'country') return <td key={col} className="px-4 py-3.5 text-slate-600">{customer.country}</td>;
                        
                        if (col === 'walletStatus') {
                          return (
                            <td key={col} className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadgeClass(customer.walletStatus)}`}>
                                {customer.walletStatus}
                              </span>
                            </td>
                          );
                        }

                        if (col === 'kycStatus') {
                          return (
                            <td key={col} className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getKycBadgeClass(customer.kycStatus)}`}>
                                {customer.kycStatus}
                              </span>
                            </td>
                          );
                        }

                        if (col === 'riskScore') {
                          return (
                            <td key={col} className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] border ${getRiskColor(customer.riskScore)}`}>
                                {customer.riskScore}
                              </span>
                            </td>
                          );
                        }

                        if (col === 'accountTier') {
                          return (
                            <td key={col} className="px-4 py-3.5 text-slate-500 font-bold">
                              {customer.accountTier}
                            </td>
                          );
                        }

                        if (col === 'totalBalance') {
                          return (
                            <td key={col} className="px-4 py-3.5 font-bold font-display text-slate-900">
                              {customer.primaryCurrency === 'XOF' ? 'CFA' : customer.primaryCurrency} {customer.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          );
                        }

                        if (col === 'primaryCurrency') return <td key={col} className="px-4 py-3.5 font-mono font-bold text-slate-400">{customer.primaryCurrency}</td>;
                        if (col === 'lastLogin') return <td key={col} className="px-4 py-3.5 font-mono text-slate-400 text-[10px]">{customer.lastLogin}</td>;

                        return <td key={col} className="px-4 py-3.5 text-slate-500">{(customer as any)[col]?.toString()}</td>;
                      })}

                      {/* Action buttons cell */}
                      <td className="px-4 py-3.5 text-right">
                        <button 
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className="p-1.5 rounded bg-slate-50 border border-slate-200/50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ml-auto"
                          title="Open Profile Workspace"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Workspace</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="text-center p-12 text-slate-400 text-xs font-semibold">
                    <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <span>No customer records match active filters matrix.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Global Pagination Bar */}
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex justify-between items-center text-xs font-semibold shrink-0">
          <span className="text-slate-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredList.length)} of {filteredList.length} Entries
          </span>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex gap-1 font-mono">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
