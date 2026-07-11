import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, AlertTriangle, Landmark, CheckCircle2, XCircle, Play, FileText, Check, X, Ban, Sliders } from 'lucide-react';
import { OperationsService } from './OperationsService';
import { Settlement, SettlementStatus } from './OperationsTypes';

interface SettlementsPageProps {
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function SettlementsPage({ onToast }: SettlementsPageProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [searchText, setSearchText] = useState('');

  const { 
    data: settlements = [], 
    isLoading, 
    isError, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['operations-settlements'],
    queryFn: () => OperationsService.getSettlements(),
    staleTime: 5000
  });

  const statusMutation = useMutation({
    mutationFn: ({ settlementId, status }: { settlementId: string; status: SettlementStatus }) => 
      OperationsService.updateSettlementStatus(settlementId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-settlements'] });
      onToast('Settlement Updated', `Batch item ${data.id} updated to ${data.status.toUpperCase()}`, 'success');
    },
    onError: (err: any) => {
      onToast('Update Failed', err.message || 'Error updating settlement state', 'warning');
    }
  });

  const handleApproveSettlement = (id: string) => {
    statusMutation.mutate({ settlementId: id, status: 'Completed' });
  };

  const handleFailSettlement = (id: string) => {
    statusMutation.mutate({ settlementId: id, status: 'Failed' });
  };

  const handleTriggerDispatch = (id: string) => {
    statusMutation.mutate({ settlementId: id, status: 'Processing' });
    onToast('Batch Dispatched', `Settlement ${id} sent to ACH network core clearing.`, 'info');
  };

  const handleDownloadReport = (settlement: Settlement) => {
    onToast('Assembling Report', `Compiling financial clearing dossier for ${settlement.id}.`, 'info');
    setTimeout(() => {
      const headers = ['Settlement ID', 'Merchant', 'Bank Routing', 'Account Number', 'Currency', 'Settlement Net', 'Clearing Batch'];
      const rows = [[
        settlement.id, settlement.merchantName, settlement.destinationBank, settlement.accountNumber, settlement.currency, (settlement.amount - settlement.fee), settlement.batchId
      ]];
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Settlement_Report_${settlement.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast('Report Exported', 'Merchant clearing statement loaded.', 'success');
    }, 1000);
  };

  const filteredSettlements = settlements.filter(s => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      s.id.toLowerCase().includes(searchLower) ||
      s.merchantName.toLowerCase().includes(searchLower) ||
      s.destinationBank.toLowerCase().includes(searchLower) ||
      s.batchId.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (activeTab === 'pending' && s.status !== 'Pending' && s.status !== 'Processing') return false;
    if (activeTab === 'completed' && s.status !== 'Completed') return false;
    if (activeTab === 'failed' && s.status !== 'Failed') return false;

    return true;
  });

  const formatMoney = (val: number, curr: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-200/60 p-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600" />
            Merchant Settlements Desk
          </h2>
          <p className="text-xs text-slate-500 font-mono">Process and dispatch outbound clearing transactions to network banks</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            disabled={isLoading || isFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Navigation tabs for Settlements */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
        <div className="flex gap-1">
          {(['all', 'pending', 'completed', 'failed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {tab === 'pending' ? 'Settlement Queue' : tab + ' Settlements'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-64">
          <div className="relative">
            <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search merchant, bank..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-7 pr-3 py-1 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid view */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse h-16" />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg mx-auto mt-12 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h3 className="font-bold text-slate-800 text-sm mt-3">Clearing Sync Failure</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Merchant settlement queues could not synchronize with target escrow servers.</p>
            <button onClick={() => refetch()} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold">
              Retry Sync
            </button>
          </div>
        ) : filteredSettlements.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 max-w-md mx-auto mt-12 text-center">
            <Landmark className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No Settlement Claims</h3>
            <p className="text-xs text-slate-500 mt-1">There are no settlement operations matching the selected filter state.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden text-left">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                  <th className="px-4 py-3">Settlement ID</th>
                  <th className="px-4 py-3">Merchant Counterparty</th>
                  <th className="px-4 py-3">Destination Account</th>
                  <th className="px-4 py-3 text-right">Settlement Total</th>
                  <th className="px-4 py-3 text-center">Batch ID</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSettlements.map(settlement => (
                  <tr key={settlement.id} className="hover:bg-slate-50/50 transition">
                    {/* ID */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{settlement.id}</td>
                    
                    {/* Merchant */}
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {settlement.merchantName}
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Wallet: {settlement.walletId}</div>
                    </td>

                    {/* Destination Bank Account details */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{settlement.destinationBank}</div>
                      <div className="font-mono text-[10px] text-slate-400">{settlement.accountNumber}</div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <div className="text-slate-900">{formatMoney(settlement.amount, settlement.currency)}</div>
                      <div className="text-[10px] text-slate-400">Fee: {formatMoney(settlement.fee, settlement.currency)}</div>
                    </td>

                    {/* Batch */}
                    <td className="px-4 py-3 text-center font-mono text-[11px] text-slate-500">
                      {settlement.batchId}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                        settlement.status === 'Completed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : settlement.status === 'Processing'
                            ? 'bg-blue-100 text-blue-800'
                            : settlement.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                      }`}>
                        {settlement.status}
                      </span>
                      {settlement.errorMessage && (
                        <div className="text-[9px] text-rose-500 font-sans mt-1 max-w-[150px] leading-tight">
                          {settlement.errorMessage}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Process Claims */}
                        {settlement.status === 'Pending' && (
                          <button
                            onClick={() => handleTriggerDispatch(settlement.id)}
                            className="p-1 rounded text-blue-600 hover:bg-slate-100 cursor-pointer"
                            title="Dispatch Clearing Batch to Network Core"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {settlement.status === 'Processing' && (
                          <>
                            <button
                              onClick={() => handleApproveSettlement(settlement.id)}
                              className="p-1 rounded text-emerald-600 hover:bg-slate-100 cursor-pointer"
                              title="Mark Settlement Cleared / Completed"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleFailSettlement(settlement.id)}
                              className="p-1 rounded text-rose-600 hover:bg-slate-100 cursor-pointer"
                              title="Set Settlement Failed"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {/* Download report */}
                        <button
                          onClick={() => handleDownloadReport(settlement)}
                          className="p-1 rounded text-slate-500 hover:bg-slate-100 cursor-pointer"
                          title="Generate Financial Clearing Report"
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
        )}
      </div>

    </div>
  );
}
