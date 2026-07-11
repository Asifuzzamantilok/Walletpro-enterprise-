import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, AlertTriangle, RotateCcw, Check, X, ShieldAlert, FileText } from 'lucide-react';
import { OperationsService } from './OperationsService';
import { Refund } from './OperationsTypes';

interface RefundsPageProps {
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function RefundsPage({ onToast }: RefundsPageProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchText, setSearchText] = useState('');

  // Comment input state per refund
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});

  const { 
    data: refunds = [], 
    isLoading, 
    isError, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['operations-refunds'],
    queryFn: () => OperationsService.getRefunds(),
    staleTime: 5000
  });

  const actionMutation = useMutation({
    mutationFn: ({ refundId, status, comments }: { refundId: string; status: 'Approved' | 'Rejected'; comments: string }) => 
      OperationsService.processRefundAction(refundId, status, 'Compliance Desk Auditor', comments),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['operations-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['operations-wallets'] });
      queryClient.invalidateQueries({ queryKey: ['operations-ledger'] });
      onToast('Dispute Resolved', `Refund dispute ${data.id} has been marked ${data.status.toUpperCase()}`, 'success');
      
      // Clear comments for this item
      setReviewComments(prev => {
        const next = { ...prev };
        delete next[data.id];
        return next;
      });
    },
    onError: (err: any) => {
      onToast('Dispute Action Failed', err.message || 'Error processing refund decision', 'warning');
    }
  });

  const handleResolve = (refundId: string, status: 'Approved' | 'Rejected') => {
    const comments = reviewComments[refundId] || 'Manual dispute evaluation completed.';
    actionMutation.mutate({ refundId, status, comments });
  };

  const filteredRefunds = refunds.filter(r => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      r.id.toLowerCase().includes(searchLower) ||
      r.transactionId.toLowerCase().includes(searchLower) ||
      r.walletId.toLowerCase().includes(searchLower) ||
      r.customerName.toLowerCase().includes(searchLower) ||
      r.reason.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (activeTab === 'pending' && r.status !== 'Pending Approval') return false;
    if (activeTab === 'approved' && r.status !== 'Processed') return false;
    if (activeTab === 'rejected' && r.status !== 'Rejected') return false;

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
            <RotateCcw className="w-5 h-5 text-blue-600" />
            Refund Dispute Resolutions Desk
          </h2>
          <p className="text-xs text-slate-500 font-mono">Verify and resolve consumer disputes and merchant chargeback claims</p>
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

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
        <div className="flex gap-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {tab === 'pending' ? 'Pending Disputes' : tab + ' Claims'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-64">
          <div className="relative">
            <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search dispute, wallet..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-7 pr-3 py-1 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Data List */}
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
            <h3 className="font-bold text-slate-800 text-sm mt-3">Dispute Claims Load Failure</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Refund ledger database connection timed out during query stream.</p>
            <button onClick={() => refetch()} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold">
              Retry Load
            </button>
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 max-w-md mx-auto mt-12 text-center">
            <RotateCcw className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Dispute Inbox Empty</h3>
            <p className="text-xs text-slate-500 mt-1">There are no active refund disputes awaiting audit at this index.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden text-left">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider font-sans">
                  <th className="px-4 py-3">Dispute ID</th>
                  <th className="px-4 py-3">Linked Tx / Wallet ID</th>
                  <th className="px-4 py-3">Customer Profile</th>
                  <th className="px-4 py-3">Dispute Reason</th>
                  <th className="px-4 py-3 text-right">Disputed Sum</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Review Decision Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRefunds.map(refund => (
                  <tr key={refund.id} className="hover:bg-slate-50/50 transition">
                    
                    {/* ID */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{refund.id}</td>
                    
                    {/* Tx / Wallet */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      <div>Tx: <strong className="text-blue-600">{refund.transactionId}</strong></div>
                      <div>Wallet: {refund.walletId}</div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {refund.customerName}
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">Requested: {refund.requestedTime}</div>
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">{refund.reason}</p>
                      {refund.comments && (
                        <div className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200/30 p-1.5 rounded mt-1">
                          <strong>Response:</strong> {refund.comments}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right font-mono font-bold text-purple-700">
                      {formatMoney(refund.amount, refund.currency)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                        refund.status === 'Processed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : refund.status === 'Pending Approval'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        {refund.status === 'Processed' ? 'Approved' : refund.status}
                      </span>
                      {refund.reviewedBy && (
                        <div className="text-[9px] text-slate-400 font-mono mt-1">
                          By: {refund.reviewedBy}
                        </div>
                      )}
                    </td>

                    {/* Decision Column */}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {refund.status === 'Pending Approval' ? (
                        <div className="space-y-1.5 max-w-[200px] mx-auto">
                          {/* Quick response text area */}
                          <input 
                            type="text"
                            placeholder="Add audit resolution comments..."
                            value={reviewComments[refund.id] || ''}
                            onChange={(e) => setReviewComments(prev => ({ ...prev, [refund.id]: e.target.value }))}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-[10px] focus:outline-none"
                          />
                          
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleResolve(refund.id, 'Rejected')}
                              className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Deny Claim
                            </button>
                            <button
                              onClick={() => handleResolve(refund.id, 'Approved')}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Settle & Refund
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[10px] text-center block">Dispute Settled</span>
                      )}
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
