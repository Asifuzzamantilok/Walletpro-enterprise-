import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DollarSign, Landmark, ArrowUpRight, ArrowDownLeft, RefreshCw, 
  ShieldCheck, AlertTriangle, Play, FileText, Check, X, Ban, 
  Sliders, TrendingUp, Droplet, BookOpen, Percent, Plus, Download, 
  Lock, Settings, RefreshCw as LoopIcon, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { FinanceService } from './FinanceService';
import { BankAccount, FinanceSettlement, ReconciliationSource, FeeConfig } from './FinanceTypes';

interface FinanceOperationsCenterProps {
  activeSubTab: string;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  onSelectTab: (tab: string) => void;
}

export function FinanceOperationsCenter({ activeSubTab, onToast, onSelectTab }: FinanceOperationsCenterProps) {
  const queryClient = useQueryClient();
  const [activeRole, setActiveRole] = useState<string>('Super Administrator');
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [blockedAction, setBlockedAction] = useState<string>('');

  // Dialog/Form states
  const [isAdjustReserveOpen, setIsAdjustReserveOpen] = useState(false);
  const [selectedAccountForReserve, setSelectedAccountForReserve] = useState<BankAccount | null>(null);
  const [reserveAdjustmentValue, setReserveAdjustmentValue] = useState('100000');
  const [reserveAdjustmentType, setReserveAdjustmentType] = useState<'Increase' | 'Decrease'>('Increase');

  const [isTransferLiquidityOpen, setIsTransferLiquidityOpen] = useState(false);
  const [liquiditySourceId, setLiquiditySourceId] = useState('');
  const [liquidityTargetId, setLiquidityTargetId] = useState('');
  const [liquidityTransferAmount, setLiquidityTransferAmount] = useState('500000');

  const [isFeeOverrideOpen, setIsFeeOverrideOpen] = useState(false);
  const [selectedFeeForOverride, setSelectedFeeForOverride] = useState<FeeConfig | null>(null);
  const [newFeeOverrideValue, setNewFeeOverrideValue] = useState('');

  const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false);
  const [reportType, setReportType] = useState<string>('Profit Summary');
  const [reportPeriod, setReportPeriod] = useState('Q3 2026 (Forecast)');

  // Sync active role from localStorage
  useEffect(() => {
    const syncRole = () => {
      const role = localStorage.getItem('walletpro_active_role') || 'Super Administrator';
      setActiveRole(role);
    };
    syncRole();
    window.addEventListener('storage', syncRole);
    // Periodically poll role to support immediate dropdown changes in sidebar
    const interval = setInterval(syncRole, 1000);
    return () => {
      window.removeEventListener('storage', syncRole);
      clearInterval(interval);
    };
  }, []);

  // Queries
  const { data: bankAccounts = [], isLoading: accountsLoading, refetch: refetchAccounts } = useQuery({
    queryKey: ['finance-bank-accounts'],
    queryFn: () => FinanceService.getBankAccounts(),
    staleTime: 10000
  });

  const { data: settlements = [], isLoading: settlementsLoading, refetch: refetchSettlements } = useQuery({
    queryKey: ['finance-settlements'],
    queryFn: () => FinanceService.getSettlements(),
    staleTime: 10000
  });

  const { data: reconSources = [], isLoading: reconLoading, refetch: refetchRecon } = useQuery({
    queryKey: ['finance-recon-sources'],
    queryFn: () => FinanceService.getReconciliationSources(),
    staleTime: 10000
  });

  const { data: feeConfigs = [], isLoading: feesLoading, refetch: refetchFees } = useQuery({
    queryKey: ['finance-fee-configs'],
    queryFn: () => FinanceService.getFeeConfigs(),
    staleTime: 10000
  });

  const { data: feeHistory = [], refetch: refetchFeeHistory } = useQuery({
    queryKey: ['finance-fee-history'],
    queryFn: () => FinanceService.getFeeHistory(),
    staleTime: 10000
  });

  const { data: reports = [], refetch: refetchReports } = useQuery({
    queryKey: ['finance-reports'],
    queryFn: () => FinanceService.getFinancialReports(),
    staleTime: 10000
  });

  const { data: auditLogs = [], refetch: refetchAuditLogs } = useQuery({
    queryKey: ['finance-audit-logs'],
    queryFn: () => FinanceService.getAuditLogs(),
    staleTime: 5000
  });

  const { data: alerts = [], refetch: refetchAlerts } = useQuery({
    queryKey: ['finance-alerts'],
    queryFn: () => FinanceService.getAlerts(),
    staleTime: 10000
  });

  // Check RBAC permissions for a financial operation
  const hasPermission = (actionName: string): boolean => {
    if (activeRole === 'Super Administrator') return true;
    
    // Non-admins cannot perform modification/write operations
    const highLevelActions = [
      'ADJUST_RESERVE', 
      'TRANSFER_LIQUIDITY', 
      'SETTLEMENT_ACTION', 
      'RECONCILE_DISCREPANCY',
      'FEE_OVERRIDE',
      'GENERATE_REPORT'
    ];

    if (highLevelActions.includes(actionName)) {
      setBlockedAction(actionName);
      setIsPermissionDialogOpen(true);
      onToast('Access Denied', `Action ${actionName} restricted for role ${activeRole}.`, 'warning');
      return false;
    }

    return true;
  };

  // MUTATIONS
  const adjustReserveMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BankAccount> }) => 
      FinanceService.updateBankAccountBalance(id, updates, activeRole),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance-bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance-audit-logs'] });
      onToast('Reserve Balance Updated', `Successfully updated reserve pool for ${data.bankName}.`, 'success');
      setIsAdjustReserveOpen(false);
    }
  });

  const transferLiquidityMutation = useMutation({
    mutationFn: async ({ sourceId, targetId, amount }: { sourceId: string; targetId: string; amount: number }) => {
      const source = bankAccounts.find(b => b.id === sourceId);
      const target = bankAccounts.find(b => b.id === targetId);
      if (!source || !target) throw new Error('Account mismatch');
      if (source.availableBalance < amount) throw new Error('Insufficient liquidity available in source account.');

      await FinanceService.updateBankAccountBalance(sourceId, {
        currentBalance: source.currentBalance - amount,
        availableBalance: source.availableBalance - amount
      }, activeRole);

      await FinanceService.updateBankAccountBalance(targetId, {
        currentBalance: target.currentBalance + amount,
        availableBalance: target.availableBalance + amount
      }, activeRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance-audit-logs'] });
      onToast('Liquidity Pool Transferred', `Successfully executed inter-bank treasury sweep balance transit.`, 'success');
      setIsTransferLiquidityOpen(false);
    },
    onError: (err: any) => {
      onToast('Transfer Mismatch', err.message || 'Error executing balance transit.', 'warning');
    }
  });

  const updateSettlementMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: FinanceSettlement['status']; reason?: string }) => 
      FinanceService.updateSettlementStatus(id, status, activeRole, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['finance-audit-logs'] });
      onToast('Settlement Batch Updated', `Batch ${data.id} is now ${data.status.toUpperCase()}.`, 'success');
    }
  });

  const triggerReconMutation = useMutation({
    mutationFn: (id: string) => FinanceService.triggerReconciliation(id, activeRole),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance-recon-sources'] });
      queryClient.invalidateQueries({ queryKey: ['finance-audit-logs'] });
      onToast('Reconciliation Completed', `Discrepancies resolved. Ledger source ${data.name} is now BALANCED.`, 'success');
    }
  });

  const feeOverrideMutation = useMutation({
    mutationFn: ({ id, newValue }: { id: string; newValue: string }) => 
      FinanceService.updateFeeConfig(id, newValue, activeRole),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance-fee-configs'] });
      queryClient.invalidateQueries({ queryKey: ['finance-fee-history'] });
      queryClient.invalidateQueries({ queryKey: ['finance-audit-logs'] });
      onToast('Fee Configuration Applied', `Override set for ${data.name} to ${data.value}.`, 'success');
      setIsFeeOverrideOpen(false);
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: ({ type, period }: { type: any; period: string }) => 
      FinanceService.generateFinancialReport(type, period, activeRole),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finance-reports'] });
      queryClient.invalidateQueries({ queryKey: ['finance-audit-logs'] });
      onToast('Financial Statement Compiled', `Report "${data.title}" has been signed and is ready for export.`, 'success');
      setIsGenerateReportOpen(false);
    }
  });

  // HANDLERS FOR ADMIN ACTIONS
  const handleAdjustReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('ADJUST_RESERVE') || !selectedAccountForReserve) return;

    const val = parseFloat(reserveAdjustmentValue);
    if (isNaN(val) || val <= 0) return;

    const diff = reserveAdjustmentType === 'Increase' ? val : -val;
    const nextReserve = Math.max(0, selectedAccountForReserve.reserveBalance + diff);
    const nextCurrent = selectedAccountForReserve.currentBalance + diff;
    const nextAvailable = Math.max(0, selectedAccountForReserve.availableBalance - diff); // allocating liquidity shifts it away from available buffer

    adjustReserveMutation.mutate({
      id: selectedAccountForReserve.id,
      updates: {
        reserveBalance: nextReserve,
        currentBalance: nextCurrent,
        availableBalance: nextAvailable
      }
    });
  };

  const handleTransferLiquiditySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('TRANSFER_LIQUIDITY')) return;

    if (!liquiditySourceId || !liquidityTargetId || liquiditySourceId === liquidityTargetId) {
      onToast('Configuration Error', 'Please select distinct source and destination banks.', 'warning');
      return;
    }

    const amount = parseFloat(liquidityTransferAmount);
    if (isNaN(amount) || amount <= 0) return;

    transferLiquidityMutation.mutate({
      sourceId: liquiditySourceId,
      targetId: liquidityTargetId,
      amount
    });
  };

  const handleApplyFeeOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('FEE_OVERRIDE') || !selectedFeeForOverride) return;

    feeOverrideMutation.mutate({
      id: selectedFeeForOverride.id,
      newValue: newFeeOverrideValue
    });
  };

  const handleGenerateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('GENERATE_REPORT')) return;

    generateReportMutation.mutate({
      type: reportType,
      period: reportPeriod
    });
  };

  // EXPORTS MOCK GENERATOR (Generates structured files for browser downloads)
  const handleExportStatement = (type: 'CSV' | 'Excel' | 'PDF', documentName: string) => {
    onToast('Structuring Export', `Packing audit ledger structures for ${documentName} in ${type} format...`, 'info');
    
    setTimeout(() => {
      let content = '';
      let mimeType = 'text/plain';
      let extension = 'txt';

      if (type === 'CSV') {
        content = "Dossier ID,Record Stamp,Operator,Audit Event,Details,Aggregate Flow\n" + 
          auditLogs.map(l => `"${l.id}","${l.timestamp}","${l.performedBy}","${l.action}","${l.details}",${l.amount || 0}`).join('\n');
        mimeType = 'text/csv';
        extension = 'csv';
      } else if (type === 'Excel') {
        content = "WalletPro Enterprise Treasury Ledger Export Schema\nGenerated on " + new Date().toISOString() + "\n\n" +
          "Bank Name,Currency,Current Balance,Available Buffer,Reserve Allocation\n" +
          bankAccounts.map(b => `"${b.bankName}","${b.currency}",${b.currentBalance},${b.availableBalance},${b.reserveBalance}`).join('\n');
        mimeType = 'application/vnd.ms-excel';
        extension = 'xls';
      } else {
        content = "%PDF-1.4\n%WalletPro Enterprise Finance Statement Dossier: " + documentName + "\n\n" +
          "Treasury Balance Sheet Aggregate:\n" + 
          "Platform Assets Total: $18,450,280.50 USD Equiv\n" + 
          "Customer Liability Ledger: $15,102,400.00 USD Equiv\n" + 
          "Capital Position (Net Buffer): $3,347,880.50 USD Equiv\n\n" + 
          "Audited & certified by PCI-DSS core compliance gateway on " + new Date().toLocaleDateString();
        mimeType = 'application/pdf';
        extension = 'pdf';
      }

      const blob = new Blob([content], { type: mimeType });
      const encodedUri = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${documentName.replace(/\s+/g, '_')}_Statement.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast('Export Downloaded', `${type} statement loaded successfully.`, 'success');
    }, 1200);
  };

  // HELPER FORMATTING
  const formatMoney = (val: number, curr: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(val);
  };

  // SUB-VIEW RENDERING
  const renderSubView = () => {
    switch (activeSubTab) {
      case 'treasury-dashboard':
        return (
          <div className="space-y-6">
            {/* Alerts Ticker if any exist */}
            {alerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-red-800 block">Critical Finance &amp; Liquidity Signals Active ({alerts.length})</span>
                    <p className="text-[11px] text-red-600 font-medium">One or more account balances, reconciliation runs, or ACH batches require high-priority supervisor review.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    refetchAlerts();
                    onToast('Scanning Node Gateway', 'Checking connectivity logs...', 'info');
                  }}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Verify Connections
                </button>
              </div>
            )}

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Platform Assets</span>
                <span className="text-xl font-bold text-slate-800 font-sans block mt-1">$18,450,280.50</span>
                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Aggregate cash position</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Customer Liabilities</span>
                <span className="text-xl font-bold text-slate-800 font-sans block mt-1">$15,102,400.00</span>
                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Held in trust ledgers</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left bg-blue-50/20">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide block">Net Position</span>
                <span className="text-xl font-bold text-blue-700 font-sans block mt-1">$3,347,880.50</span>
                <span className="text-[9px] text-blue-500 font-medium block mt-0.5">Platform safety buffer</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Reserve Balance</span>
                <span className="text-xl font-bold text-slate-800 font-sans block mt-1">$7,000,000.00</span>
                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Collateralized deposit limit</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Today's Settlement Volume</span>
                <span className="text-xl font-bold text-emerald-600 font-sans block mt-1">+$1,245,000.00</span>
                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Cleared ACH, FAST &amp; SEPA</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Monthly Volume</span>
                <span className="text-xl font-bold text-slate-800 font-sans block mt-1">$38,450,000.00</span>
                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Rolling 30-day clearing</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Revenue Today</span>
                <span className="text-xl font-bold text-indigo-600 font-sans block mt-1">$124,500.00</span>
                <span className="text-[9px] text-indigo-500 font-medium block mt-0.5">SaaS &amp; Transaction fees</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Revenue This Month</span>
                <span className="text-xl font-bold text-slate-800 font-sans block mt-1">$3,845,000.00</span>
                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Audited yield forecast</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Fees Collected</span>
                <span className="text-xl font-bold text-slate-800 font-sans block mt-1">$845,000.00</span>
                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">Aggregated fee pools</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Pending Settlements</span>
                <span className="text-xl font-bold text-amber-600 font-sans block mt-1">$485,000.00</span>
                <span className="text-[9px] text-amber-500 font-medium block mt-0.5">2 batches clearing right now</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Failed Settlements</span>
                <span className="text-xl font-bold text-red-600 font-sans block mt-1">$12,500.00</span>
                <span className="text-[9px] text-red-500 font-medium block mt-0.5">1 batch needs ACH retry</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Outstanding Refunds</span>
                <span className="text-xl font-bold text-slate-800 font-sans block mt-1">$45,800.00</span>
                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">14 items pending clearance</span>
              </div>
            </div>

            {/* Main Graphs Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm col-span-2 text-left">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display">Liquidity &amp; Settlement Flow Trends</h3>
                    <p className="text-[10px] text-slate-400">Rolling 7-day asset tracking across multi-bank conduits</p>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">Live</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { day: 'Jul 03', Liquidity: 16800000, Settlements: 890000 },
                      { day: 'Jul 04', Liquidity: 17100000, Settlements: 1100000 },
                      { day: 'Jul 05', Liquidity: 17400000, Settlements: 950000 },
                      { day: 'Jul 06', Liquidity: 17200000, Settlements: 1300000 },
                      { day: 'Jul 07', Liquidity: 17900000, Settlements: 1540000 },
                      { day: 'Jul 08', Liquidity: 18100000, Settlements: 1200000 },
                      { day: 'Jul 09', Liquidity: 18450280, Settlements: 1245000 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip formatter={(value: any) => formatMoney(value)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="Liquidity" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Settlements" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm text-left">
                <h3 className="text-sm font-bold text-slate-800 font-display mb-1">Global Currency Allocations</h3>
                <p className="text-[10px] text-slate-400 mb-4">Percentage distribution of vaulted assets</p>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'USD Cash', value: 12450280 },
                          { name: 'EUR Cash', value: 4210450 },
                          { name: 'GBP Cash', value: 1240150 },
                          { name: 'SGD Cash', value: 549200 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#6366f1" />
                      </Pie>
                      <Tooltip formatter={(value: any) => formatMoney(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>USD Primary (67%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>EUR Vault (22%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>GBP Trust (7%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span>SGD Liquidity (4%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions and Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alert list */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 font-display">Treasury Warning Feed</h3>
                  <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold font-mono">CRITICAL</span>
                </div>
                <div className="p-5 divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar">
                  {alerts.map((alert: any) => (
                    <div key={alert.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        alert.severity === 'Critical' ? 'bg-red-500' : alert.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-bold text-slate-800">{alert.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Panel Quick Operations */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-800 font-display">Treasury Administrator Panel</h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      if (hasPermission('ADJUST_RESERVE')) {
                        setSelectedAccountForReserve(bankAccounts[0] || null);
                        setIsAdjustReserveOpen(true);
                      }
                    }}
                    className="p-4 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 transition text-left cursor-pointer space-y-2 group"
                  >
                    <Sliders className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 block">Adjust Account Reserve</span>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Allocate primary balances to trust compliance thresholds.</p>
                  </button>

                  <button 
                    onClick={() => {
                      if (hasPermission('TRANSFER_LIQUIDITY')) {
                        setLiquiditySourceId(bankAccounts[0]?.id || '');
                        setLiquidityTargetId(bankAccounts[1]?.id || '');
                        setIsTransferLiquidityOpen(true);
                      }
                    }}
                    className="p-4 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 transition text-left cursor-pointer space-y-2 group"
                  >
                    <TrendingUp className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 block">Transfer Cash Liquidity</span>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Execute ACH clearing sweeps between connected platforms.</p>
                  </button>

                  <button 
                    onClick={() => {
                      if (hasPermission('GENERATE_REPORT')) {
                        setIsGenerateReportOpen(true);
                      }
                    }}
                    className="p-4 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 transition text-left cursor-pointer space-y-2 group"
                  >
                    <BookOpen className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 block">Compile Financial Report</span>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Synthesize audited profit summaries and tax reports.</p>
                  </button>

                  <button 
                    onClick={() => handleExportStatement('CSV', 'Platform_Treasury_General_Ledger')}
                    className="p-4 border border-slate-200 hover:border-blue-500 rounded-xl hover:bg-slate-50 transition text-left cursor-pointer space-y-2 group"
                  >
                    <Download className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-800 block">Export General Ledger</span>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Download primary double-entry reports in CSV format.</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'treasury-liquidity':
        return (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Available Liquidity</span>
                <span className="text-2xl font-bold font-sans text-slate-800 block mt-1">$18,100,280.50</span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
                  <ArrowUpRight className="w-3 h-3" /> 89.2% of assets liquid
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Locked Liquidity</span>
                <span className="text-2xl font-bold font-sans text-slate-800 block mt-1">$350,000.00</span>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">Pending clearing sweeps</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reserve Funds</span>
                <span className="text-2xl font-bold font-sans text-slate-800 block mt-1">$7,000,000.00</span>
                <span className="text-[10px] text-indigo-600 font-medium block mt-1">Collateral regulatory trust</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Operational Funds</span>
                <span className="text-2xl font-bold font-sans text-slate-800 block mt-1">$10,750,280.50</span>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">Primary corporate balances</span>
              </div>
            </div>

            {/* Forecast Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display">Liquidity Projection &amp; Forecast Model</h3>
                    <p className="text-[10px] text-slate-400">Next 30 days predictive capital simulation based on rolling payouts</p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-mono font-bold">MONTE-CARLO SIM</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { day: 'Jul 10', Available: 18100000, Required: 15100000 },
                      { day: 'Jul 15', Available: 18400000, Required: 15200000 },
                      { day: 'Jul 20', Available: 18900000, Required: 15400000 },
                      { day: 'Jul 25', Available: 19500000, Required: 15500000 },
                      { day: 'Jul 30', Available: 20100000, Required: 15700000 },
                      { day: 'Aug 04', Available: 20800000, Required: 15900000 },
                      { day: 'Aug 09', Available: 21500000, Required: 16100000 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip formatter={(value: any) => formatMoney(value)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="Available" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Required" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-display">Liquidity Stress-Test Controls</h3>
                  <p className="text-[10px] text-slate-400 mb-4">Evaluate available buffers against market scenarios</p>
                  
                  <div className="space-y-4 text-xs font-semibold text-slate-700">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex justify-between items-center">
                      <div>
                        <span>Standard Scenario</span>
                        <p className="text-[9px] text-slate-500 font-medium">95% confidence interval</p>
                      </div>
                      <span className="text-emerald-700">Surplus $3.0M</span>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 flex justify-between items-center">
                      <div>
                        <span>Payout Spike Stress (+30%)</span>
                        <p className="text-[9px] text-slate-500 font-medium">Extreme clearing demand scenario</p>
                      </div>
                      <span className="text-yellow-700">Surplus $1.2M</span>
                    </div>

                    <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex justify-between items-center">
                      <div>
                        <span>Black-Swan Lockout (-50%)</span>
                        <p className="text-[9px] text-slate-500 font-medium">Primary SVB vault connectivity freeze</p>
                      </div>
                      <span className="text-red-700 font-bold">Deficit -$2.5M</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (hasPermission('TRANSFER_LIQUIDITY')) {
                      setLiquiditySourceId(bankAccounts[0]?.id || '');
                      setLiquidityTargetId(bankAccounts[1]?.id || '');
                      setIsTransferLiquidityOpen(true);
                    }
                  }}
                  className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Transfer Emergency Liquidity
                </button>
              </div>
            </div>
          </div>
        );

      case 'treasury-settlements':
        return (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 font-display">Settlement Center Queue</h3>
                  <p className="text-[10px] text-slate-400">Process and dispatch outbound merchant clearing transactions</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      refetchSettlements();
                      onToast('Clearing Network Sync', 'Synchronizing ACH rails...', 'info');
                    }}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Synchronize Queue
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold border-b border-slate-100">
                      <th className="px-6 py-3">Settlement ID</th>
                      <th className="px-6 py-3">Settlement Batch</th>
                      <th className="px-6 py-3">Bank Conduits</th>
                      <th className="px-6 py-3">Gross Amount</th>
                      <th className="px-6 py-3">Fees</th>
                      <th className="px-6 py-3">Net Amount</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-50">
                    {settlements.map((s: FinanceSettlement) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <span className="font-mono text-[11px] text-slate-900 block">{s.id}</span>
                          {s.failureReason && (
                            <span className="text-[9px] text-red-500 font-medium block max-w-xs mt-1 leading-normal">
                              Reason: {s.failureReason}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{s.batchId}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 block">{s.bankName}</span>
                          <span className="text-[9px] text-slate-400 font-mono">Routing verified</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500">{formatMoney(s.grossAmount, s.currency)}</td>
                        <td className="px-6 py-4 font-mono text-slate-400">-{formatMoney(s.fees, s.currency)}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">{formatMoney(s.netAmount, s.currency)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            s.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            s.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
                            s.status === 'Paused' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                            'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                          {s.completedDate ? (
                            <span className="text-emerald-600 font-semibold">{s.completedDate}</span>
                          ) : (
                            <span>Est: {s.settlementDate}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {s.status === 'Pending' && (
                              <>
                                <button 
                                  onClick={() => {
                                    if (hasPermission('SETTLEMENT_ACTION')) {
                                      updateSettlementMutation.mutate({ id: s.id, status: 'Completed' });
                                    }
                                  }}
                                  className="p-1 hover:bg-emerald-50 text-emerald-600 rounded border border-slate-100 transition cursor-pointer"
                                  title="Approve Settlement"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (hasPermission('SETTLEMENT_ACTION')) {
                                      updateSettlementMutation.mutate({ id: s.id, status: 'Paused', reason: 'Admin Pause applied' });
                                    }
                                  }}
                                  className="p-1 hover:bg-slate-100 text-slate-600 rounded border border-slate-100 transition cursor-pointer"
                                  title="Pause Settlement"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {s.status === 'Paused' && (
                              <button 
                                onClick={() => {
                                  if (hasPermission('SETTLEMENT_ACTION')) {
                                    updateSettlementMutation.mutate({ id: s.id, status: 'Pending' });
                                  }
                                }}
                                className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-100 text-[10px] font-bold transition cursor-pointer"
                              >
                                Resume
                              </button>
                            )}

                            {s.status === 'Failed' && (
                              <button 
                                onClick={() => {
                                  if (hasPermission('SETTLEMENT_ACTION')) {
                                    updateSettlementMutation.mutate({ id: s.id, status: 'Pending' });
                                  }
                                }}
                                className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-100 text-[10px] font-bold transition cursor-pointer flex items-center gap-0.5"
                              >
                                <RefreshCw className="w-3 h-3" /> Retry ACH
                              </button>
                            )}

                            <button 
                              onClick={() => handleExportStatement('PDF', `Settlement_Batch_${s.id}`)}
                              className="p-1 hover:bg-slate-50 text-slate-500 rounded border border-slate-100 transition cursor-pointer"
                              title="Download Clearing Report"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'treasury-reconciliation':
        return (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 font-display">Inter-Account Reconciliation Center</h3>
                  <p className="text-[10px] text-slate-400">Match internal general ledger assets against active custodian banks and Stripe provider streams</p>
                </div>
                <button 
                  onClick={() => {
                    refetchRecon();
                    onToast('Reconciliation Scanning', 'Cracking matching checksum matrices...', 'info');
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Execute System Run
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Matched Records</span>
                  <span className="text-xl font-bold font-sans text-slate-800 block mt-1">27,581</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">99.85% System Accuracy</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Exceptions Detected</span>
                  <span className="text-xl font-bold font-sans text-red-600 block mt-1">2 Discrepancies</span>
                  <span className="text-[10px] text-red-500 font-medium block mt-0.5">Awaiting supervisor balance</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Aggregate Variance</span>
                  <span className="text-xl font-bold font-sans text-amber-600 block mt-1">$4,300.25</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Variance tolerance OK (&lt;0.05%)</span>
                </div>
                <div className="p-4 bg-blue-50/20 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-600 block uppercase">Ledger Health Status</span>
                  <span className="text-lg font-bold font-sans text-blue-700 block mt-1">Variance Found</span>
                  <span className="text-[10px] text-blue-500 font-medium block mt-0.5">Auto-clearing run available</span>
                </div>
              </div>

              {/* Reconciliation Table */}
              <div className="overflow-hidden border border-slate-150 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold bg-slate-50 border-b border-slate-150">
                      <th className="px-4 py-3">Source Channel</th>
                      <th className="px-4 py-3">Source Type</th>
                      <th className="px-4 py-3">Matched</th>
                      <th className="px-4 py-3">Unmatched</th>
                      <th className="px-4 py-3">Exceptions</th>
                      <th className="px-4 py-3">Variance Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Checked Run</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-100">
                    {reconSources.map((r: ReconciliationSource) => (
                      <tr key={r.id} className="hover:bg-slate-50/30 transition">
                        <td className="px-4 py-4 font-bold text-slate-800">{r.name}</td>
                        <td className="px-4 py-4 text-slate-500">{r.type}</td>
                        <td className="px-4 py-4 font-mono text-emerald-600">+{r.matchedCount.toLocaleString()}</td>
                        <td className="px-4 py-4 font-mono text-slate-400">{r.unmatchedCount}</td>
                        <td className="px-4 py-4 font-mono text-red-500">{r.exceptionsCount}</td>
                        <td className={`px-4 py-4 font-mono font-bold ${r.varianceAmount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {formatMoney(r.varianceAmount)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            r.status === 'Balanced' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-[10px] text-slate-400">{r.lastRun}</td>
                        <td className="px-4 py-4 text-right">
                          {r.status !== 'Balanced' ? (
                            <button 
                              onClick={() => {
                                if (hasPermission('RECONCILE_DISCREPANCY')) {
                                  triggerReconMutation.mutate(r.id);
                                }
                              }}
                              className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded border border-amber-200 text-[10px] font-bold transition cursor-pointer"
                            >
                              Resolve
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-0.5">
                              <Check className="w-3.5 h-3.5" /> Balanced
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'treasury-revenue':
        return (
          <div className="space-y-6 text-left">
            {/* Revenue Analytics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily / Monthly Trends */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm col-span-2">
                <h3 className="text-sm font-bold text-slate-800 font-display mb-1">Revenue Performance Matrix</h3>
                <p className="text-[10px] text-slate-400 mb-4">Rolling monthly audited revenue splits by platform fee channels</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { month: 'Feb', Transaction: 420000, Card: 120000, Withdrawal: 85000 },
                      { month: 'Mar', Transaction: 480000, Card: 150000, Withdrawal: 90000 },
                      { month: 'Apr', Transaction: 510000, Card: 140000, Withdrawal: 95000 },
                      { month: 'May', Transaction: 550000, Card: 180000, Withdrawal: 110000 },
                      { month: 'Jun', Transaction: 620000, Card: 210000, Withdrawal: 125000 },
                      { month: 'Jul', Transaction: 680000, Card: 230000, Withdrawal: 140000 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip formatter={(value: any) => formatMoney(value)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Transaction" fill="#3b82f6" stackId="a" />
                      <Bar dataKey="Card" fill="#10b981" stackId="a" />
                      <Bar dataKey="Withdrawal" fill="#f59e0b" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Product Splints */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 font-display mb-1">Product Revenue Allocation</h3>
                <p className="text-[10px] text-slate-400 mb-4">Percentage splits by product lines</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Core API Integration', value: 2450000 },
                          { name: 'Cards Issuance', value: 890000 },
                          { name: 'FX Treasury Margins', value: 340000 },
                          { name: 'Internal Custodial', value: 165000 },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        innerRadius={50}
                        dataKey="value"
                      >
                        <Cell fill="#4f46e5" />
                        <Cell fill="#06b6d4" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ec4899" />
                      </Pie>
                      <Tooltip formatter={(value: any) => formatMoney(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-[10px] text-slate-600 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Core API (Wallets/Ledger)</span>
                    <span className="text-slate-800">$2.45M (63%)</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Card Issuance</span>
                    <span className="text-slate-800">$890k (23%)</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>FX Treasury Margins</span>
                    <span className="text-slate-800">$340k (9%)</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Internal Custodial</span>
                    <span className="text-slate-800">$165k (5%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Geographical splits & currency splits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 font-display mb-1">Revenue by Merchant Country</h3>
                <p className="text-[10px] text-slate-400 mb-4">Global merchant revenue distribution (rolling 30 days)</p>
                <div className="space-y-3 text-xs font-semibold text-slate-700">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>United States (USD)</span>
                      <span>$2,450,000.00 (63.7%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '63.7%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>Germany / Eurozone (EUR)</span>
                      <span>$845,000.00 (21.9%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '21.9%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>United Kingdom (GBP)</span>
                      <span>$385,000.00 (10.0%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '10%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>Singapore (SGD)</span>
                      <span>$165,000.00 (4.4%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '4.4%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 font-display mb-1">Revenue by Fee Type</h3>
                <p className="text-[10px] text-slate-400 mb-4">Sub-fee category crunches</p>
                <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                    <span>SaaS Client Platforms License</span>
                    <span className="font-bold text-slate-800 font-mono">$1,245,000.00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                    <span>Card Interchange / Issuance Overrides</span>
                    <span className="font-bold text-slate-800 font-mono">$845,000.00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                    <span>ACH Wire Outbound Processing fee</span>
                    <span className="font-bold text-slate-800 font-mono">$485,000.00</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                    <span>Treasury Conversion FX spread yield</span>
                    <span className="font-bold text-slate-800 font-mono">$324,500.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'treasury-fees':
        return (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Fee overrides configs list */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden lg:col-span-2">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 font-display">System Fee Matrix</h3>
                    <p className="text-[10px] text-slate-400">View and apply fee overrides across platform channels</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {feeConfigs.map((f: FeeConfig) => (
                    <div key={f.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/40 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{f.name}</span>
                          <span className="text-[8px] uppercase font-bold bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded tracking-wide border border-slate-200/40">
                            {f.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Last modified: {f.lastUpdated} by {f.updatedBy}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 font-mono">
                            {f.value}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            if (hasPermission('FEE_OVERRIDE')) {
                              setSelectedFeeForOverride(f);
                              setNewFeeOverrideValue(f.value);
                              setIsFeeOverrideOpen(true);
                            }
                          }}
                          className="px-2 py-1 border border-slate-200 hover:border-blue-500 text-slate-600 hover:text-blue-600 rounded text-[11px] font-bold transition cursor-pointer"
                        >
                          Override
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee override logs history */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-800 font-display">Fee Adjustments History</h3>
                  <p className="text-[10px] text-slate-400">Audit trail of fee modification logs</p>
                </div>
                <div className="p-5 flex-1 divide-y divide-slate-100 max-h-96 overflow-y-auto custom-scrollbar">
                  {feeHistory.map((h: any) => (
                    <div key={h.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[180px]">{h.feeName}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{h.timestamp.substring(5, 16)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>By {h.modifiedBy}</span>
                        <span className="font-mono text-slate-700">
                          {h.previousValue} &rarr; <strong className="text-indigo-600">{h.newValue}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'treasury-reserve-accounts':
      case 'treasury-bank-accounts':
        const displayReserveOnly = activeSubTab === 'treasury-reserve-accounts';
        return (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 font-display">
                    {displayReserveOnly ? 'Custodian Reserve Accounts' : 'Operational Bank Conduits'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {displayReserveOnly 
                      ? 'Monitored central bank trust buffers for transactional collateral validation' 
                      : 'Connected corporate checking and high-yield clearing accounts'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      refetchAccounts();
                      onToast('Bank API Ping', 'Pinging connected bank conduits...', 'info');
                    }}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <LoopIcon className="w-3.5 h-3.5" />
                    Refresh Balances
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {bankAccounts
                  .filter((b: BankAccount) => !displayReserveOnly || b.reserveBalance > 0)
                  .map((b: BankAccount) => (
                    <div key={b.id} className="border border-slate-150 rounded-xl p-5 hover:border-slate-300 transition flex flex-col justify-between h-56 bg-slate-50/20 shadow-xs relative">
                      {/* Active indicator */}
                      <span className={`absolute top-5 right-5 w-2 h-2 rounded-full ${
                        b.status === 'Active' ? 'bg-emerald-500' : b.status === 'Under Review' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} title={`Status: ${b.status}`} />

                      <div>
                        <div className="flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-blue-600" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{b.id}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 font-display mt-2 leading-tight">{b.bankName}</h4>
                        <span className="text-[10px] text-slate-500 block font-medium leading-none mt-1">{b.accountName}</span>
                      </div>

                      <div className="space-y-1.5 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Balance</span>
                          <span className="text-xs font-bold font-mono text-slate-800">{formatMoney(b.currentBalance, b.currency)}</span>
                        </div>

                        {!displayReserveOnly && (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Available Buffer</span>
                            <span className="text-xs font-semibold font-mono text-slate-600">{formatMoney(b.availableBalance, b.currency)}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center border-t border-slate-200/60 pt-1.5">
                          <span className="text-[10px] text-indigo-500 font-bold uppercase">Reserve Threshold</span>
                          <span className="text-xs font-bold font-mono text-indigo-600">{formatMoney(b.reserveBalance, b.currency)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-slate-200/40 pt-3 mt-4 text-[10px] font-bold">
                        <button 
                          onClick={() => {
                            if (hasPermission('ADJUST_RESERVE')) {
                              setSelectedAccountForReserve(b);
                              setIsAdjustReserveOpen(true);
                            }
                          }}
                          className="flex-1 py-1 px-2 text-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded transition cursor-pointer"
                        >
                          Modify Reserve
                        </button>
                        <button 
                          onClick={() => handleExportStatement('PDF', `${b.bankName}_Bank_Position_Report`)}
                          className="p-1 px-2 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200 rounded transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'treasury-accounting':
        return (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 font-display">General Ledger Audit Trail</h3>
                  <p className="text-[10px] text-slate-400">PCI-DSS compliant double-entry records signed with cryptographic ledger validation</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      refetchAuditLogs();
                      onToast('Audit Log Verified', 'Double-entry checks verified with zero drifts.', 'success');
                    }}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verify Log Signatures
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3">Audit ID</th>
                      <th className="px-4 py-3">Date / Timestamp</th>
                      <th className="px-4 py-3">Financial Action</th>
                      <th className="px-4 py-3">Performed By</th>
                      <th className="px-4 py-3">Action Details / Reference</th>
                      <th className="px-4 py-3 text-right">Value Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-50">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-50/30 transition">
                        <td className="px-4 py-4 font-mono text-[10px] text-slate-400">{log.id}</td>
                        <td className="px-4 py-4 font-mono text-[10px] text-slate-500">{log.timestamp}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                            log.action.includes('SWEEP') ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            log.action.includes('RESERVE') ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            log.action.includes('RECONCILIATION') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            'bg-slate-100 text-slate-700 border border-slate-200/60'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600 font-semibold">{log.performedBy}</td>
                        <td className="px-4 py-4 text-slate-500 font-medium leading-relaxed max-w-sm">
                          {log.details}
                          <span className="block text-[9px] text-slate-400 font-mono mt-0.5">Ref ID: {log.referenceId}</span>
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold text-slate-800">
                          {log.amount ? (
                            <span className={log.action.includes('DECREASE') ? 'text-red-600' : 'text-slate-800'}>
                              {log.action.includes('DECREASE') ? '-' : ''}
                              {formatMoney(log.amount, log.currency || 'USD')}
                            </span>
                          ) : (
                            <span className="text-slate-400">&mdash;</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'treasury-financial-reports':
        return (
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 font-display">Financial Statements &amp; Ledger Audit Reports</h3>
                  <p className="text-[10px] text-slate-400">Compile and sign GAAP-compliant profit and asset position statements</p>
                </div>
                <button 
                  onClick={() => {
                    if (hasPermission('GENERATE_REPORT')) {
                      setIsGenerateReportOpen(true);
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Compile Statement
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((r: any) => (
                  <div key={r.id} className="border border-slate-150 hover:border-slate-300 rounded-xl p-4 flex items-center justify-between gap-4 transition bg-slate-50/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">{r.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Period: {r.reportingPeriod}</p>
                        <span className="text-[9px] text-slate-500 font-mono block mt-1">Generated: {r.generatedAt} by {r.generatedBy}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block mb-2">{r.fileSize}</span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleExportStatement('CSV', r.title)}
                          className="p-1 px-2 hover:bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 transition cursor-pointer"
                        >
                          CSV
                        </button>
                        <button 
                          onClick={() => handleExportStatement('PDF', r.title)}
                          className="p-1 px-2 hover:bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 transition cursor-pointer"
                        >
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
            <HelpCircle className="w-12 h-12 stroke-1 opacity-25 mb-2" />
            <span>Operational module tab under active development.</span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-200/60 p-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Enterprise Treasury &amp; Finance Operations Center
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {activeSubTab === 'treasury-dashboard' && 'Dashboard Overview & Executive Metrics'}
            {activeSubTab === 'treasury-liquidity' && 'Liquidity Bufers & Asset stress forecasting'}
            {activeSubTab === 'treasury-settlements' && 'Merchant settlements, automated sweeps & failures retry'}
            {activeSubTab === 'treasury-reconciliation' && 'Double-entry general ledger reconciliation checks'}
            {activeSubTab === 'treasury-revenue' && 'Revenue allocations, splits & performance models'}
            {activeSubTab === 'treasury-fees' && 'System fees configs & custom client override overrides'}
            {activeSubTab === 'treasury-reserve-accounts' && 'Custodian reserves accounts thresholds buffer'}
            {activeSubTab === 'treasury-bank-accounts' && 'Operational multi-bank checking conduits balance'}
            {activeSubTab === 'treasury-accounting' && 'General Ledger accounting double-entry signed audit logs'}
            {activeSubTab === 'treasury-financial-reports' && 'Compiled audited GAAP-compliant financial statement exports'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 bg-slate-150 px-2 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Role: {activeRole}
          </span>
        </div>
      </div>

      {/* Main Tab Render Space */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar pb-16">
        {renderSubView()}
      </div>

      {/* DIALOG 1: ADJUST RESERVE */}
      {isAdjustReserveOpen && selectedAccountForReserve && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" /> Adjust Custody Reserve
              </h3>
              <button onClick={() => setIsAdjustReserveOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdjustReserveSubmit} className="p-6 space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-lg text-xs space-y-1">
                <span className="font-bold text-blue-800 block">Bank Account context:</span>
                <p className="text-blue-700 leading-normal font-medium">{selectedAccountForReserve.bankName}</p>
                <div className="flex justify-between font-mono text-[10px] text-blue-600 pt-1 border-t border-blue-100/60 mt-1">
                  <span>Current Reserve: {formatMoney(selectedAccountForReserve.reserveBalance, selectedAccountForReserve.currency)}</span>
                  <span>Available Balance: {formatMoney(selectedAccountForReserve.availableBalance, selectedAccountForReserve.currency)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setReserveAdjustmentType('Increase')}
                    className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                      reserveAdjustmentType === 'Increase' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Allocate Reserve Buffer
                  </button>
                  <button 
                    type="button"
                    onClick={() => setReserveAdjustmentType('Decrease')}
                    className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                      reserveAdjustmentType === 'Decrease' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Release Reserve Liquidity
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Adjustment Value Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-mono">{selectedAccountForReserve.currency}</span>
                  <input 
                    type="number"
                    value={reserveAdjustmentValue}
                    onChange={(e) => setReserveAdjustmentValue(e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsAdjustReserveOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 2: TRANSFER LIQUIDITY */}
      {isTransferLiquidityOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Manual Liquidity sweep Transfer
              </h3>
              <button onClick={() => setIsTransferLiquidityOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleTransferLiquiditySubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Source bank account</label>
                <select 
                  value={liquiditySourceId} 
                  onChange={(e) => setLiquiditySourceId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                  required
                >
                  <option value="">Select source...</option>
                  {bankAccounts.map((b: BankAccount) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({b.currency}) &mdash; Available: {formatMoney(b.availableBalance, b.currency)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destination bank account</label>
                <select 
                  value={liquidityTargetId} 
                  onChange={(e) => setLiquidityTargetId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                  required
                >
                  <option value="">Select destination...</option>
                  {bankAccounts.map((b: BankAccount) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({b.currency}) &mdash; Bal: {formatMoney(b.currentBalance, b.currency)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Value Amount to Transfer</label>
                <input 
                  type="number"
                  value={liquidityTransferAmount}
                  onChange={(e) => setLiquidityTransferAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsTransferLiquidityOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Dispatch Sweep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 3: APPLY FEE OVERRIDE */}
      {isFeeOverrideOpen && selectedFeeForOverride && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-blue-600" /> Apply Fee Override
              </h3>
              <button onClick={() => setIsFeeOverrideOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleApplyFeeOverrideSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs space-y-1">
                <span className="font-bold text-indigo-800 block">Fee Configuration Context:</span>
                <p className="text-indigo-700 leading-normal font-medium">{selectedFeeForOverride.name}</p>
                <div className="flex justify-between font-mono text-[10px] text-indigo-600 pt-1 border-t border-indigo-100/60 mt-1">
                  <span>Current Rate: {selectedFeeForOverride.value}</span>
                  <span>Type: {selectedFeeForOverride.type}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Override Rate Value</label>
                <input 
                  type="text"
                  value={newFeeOverrideValue}
                  onChange={(e) => setNewFeeOverrideValue(e.target.value)}
                  placeholder="e.g., 0.95% or $2.00 flat..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsFeeOverrideOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 4: COMPILE FINANCIAL REPORT */}
      {isGenerateReportOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden text-left">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" /> Compile GAAP Financial Report
              </h3>
              <button onClick={() => setIsGenerateReportOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleGenerateReportSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Report Statement Type</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                  required
                >
                  <option value="Profit Summary">GAAP Profit &amp; Loss Statement</option>
                  <option value="Revenue Summary">Platform Gross Yield Revenue Report</option>
                  <option value="Settlement Report">Audited Custodian Settlement Trail</option>
                  <option value="Fee Report">Aggregate System Fee Distribution Summary</option>
                  <option value="Reserve Report">Custodian Collateral Reserve Report</option>
                  <option value="Liquidity Report">Monte-Carlo stress forecasting &amp; Available Liquidity</option>
                  <option value="Bank Position Report">Multi-Bank checking account holdings aggregate</option>
                  <option value="Outstanding Liability Report">Outstanding platform liabilities trust tracker</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reporting Scope Period</label>
                <select 
                  value={reportPeriod} 
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                  required
                >
                  <option value="Q2 2026 (Audited)">Q2 2026 (Audited statement)</option>
                  <option value="June 2026 (Reconciled)">June 2026 (Reconciled statement)</option>
                  <option value="Q3 2026 (Forecast)">Q3 2026 (Monte-carlo projection)</option>
                  <option value="Live Snap - 2026-07-09">Live snap &mdash; 2026-07-09</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsGenerateReportOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Compile &amp; Sign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 5: ACCESS DENIED OVERLAY */}
      {isPermissionDialogOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-red-100 w-full max-w-sm overflow-hidden text-left">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-800">RBAC Financial Access Blocked</h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Your current active role <strong className="text-slate-800">{activeRole}</strong> does not possess high-level custody clearing clearance (<strong className="font-mono text-red-600">TREASURY_OPS_MASTER</strong>).
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-400 font-mono text-left space-y-1">
                <div><span>Denied Action:</span> <strong className="text-slate-600">{blockedAction}</strong></div>
                <div><span>Required Scope:</span> <strong className="text-red-600">Super Administrator</strong></div>
                <div><span>Audit Trace Hash:</span> <span className="text-slate-500">sec_rbac_block_90218</span></div>
              </div>
              <button 
                onClick={() => setIsPermissionDialogOpen(false)}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Acknowledge Restriction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
