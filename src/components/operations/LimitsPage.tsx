import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, AlertTriangle, Sliders, Check, X, FileText, Settings, Coins } from 'lucide-react';
import { OperationsService } from './OperationsService';
import { LimitConfig } from './OperationsTypes';

interface LimitsPageProps {
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function LimitsPage({ onToast }: LimitsPageProps) {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [selectedLimitId, setSelectedLimitId] = useState<string | null>(null);

  // Edit fields state
  const [editFields, setEditFields] = useState<Partial<LimitConfig>>({});

  const { 
    data: limits = [], 
    isLoading, 
    isError, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['operations-limits'],
    queryFn: () => OperationsService.getLimits(),
    staleTime: 5000
  });

  const updateMutation = useMutation({
    mutationFn: ({ limitId, fields }: { limitId: string; fields: Partial<LimitConfig> }) => 
      OperationsService.updateLimits(limitId, fields),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['operations-limits'] });
      onToast('Limits Synchronized', `Successfully updated velocity rules for ${data.customerName}`, 'success');
      setSelectedLimitId(null);
      setEditFields({});
    },
    onError: (err: any) => {
      onToast('Override Failed', err.message || 'Error modifying velocity parameters', 'warning');
    }
  });

  const handleEditClick = (config: LimitConfig) => {
    setSelectedLimitId(config.id);
    setEditFields({
      dailyLimit: config.dailyLimit,
      monthlyLimit: config.monthlyLimit,
      cardTxLimit: config.cardTxLimit,
      withdrawalLimit: config.withdrawalLimit,
      transferLimit: config.transferLimit,
      merchantTxLimit: config.merchantTxLimit
    });
  };

  const handleSave = (id: string) => {
    updateMutation.mutate({ limitId: id, fields: editFields });
  };

  const filteredLimits = limits.filter(l => {
    const searchLower = searchText.toLowerCase();
    return (
      l.id.toLowerCase().includes(searchLower) ||
      l.walletId.toLowerCase().includes(searchLower) ||
      l.customerName.toLowerCase().includes(searchLower)
    );
  });

  const formatMoney = (val: number, curr: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-left">
      
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-200/60 p-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            Fintech Velocity & Limits Control Center
          </h2>
          <p className="text-xs text-slate-500 font-mono">Enforce daily/monthly transaction ceiling rules and card spending constraints</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            disabled={isLoading || isFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Sync Velocity Profiles
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Search Wallet Velocity Profile</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search wallet, customer name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid or Edit panel */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse h-16" />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg mx-auto mt-12 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Velocity Controller Error</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Fail to verify rate limiting profiles on target cache database.</p>
            <button onClick={() => refetch()} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold">
              Retry Connect
            </button>
          </div>
        ) : filteredLimits.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 max-w-md mx-auto mt-12 text-center">
            <Sliders className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No Velocity Records Found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            {filteredLimits.map(config => {
              const isEditing = selectedLimitId === config.id;
              
              // Percentages calculation for visual bar
              const dailyPct = Math.min(100, (config.dailyUsed / config.dailyLimit) * 100);
              const monthlyPct = Math.min(100, (config.monthlyUsed / config.monthlyLimit) * 100);

              return (
                <div key={config.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Customer Quick profile */}
                  <div className="space-y-1.5 shrink-0 min-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold font-mono text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                        {config.id}
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono">
                        Wallet: {config.walletId}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">{config.customerName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Updated: {config.updatedAt}</p>
                  </div>

                  {/* Visual progression bars */}
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-500 font-sans font-bold">Daily Limit Utilization:</span>
                        <span className="text-slate-700 font-bold">
                          {formatMoney(config.dailyUsed, config.currency)} / {formatMoney(isEditing ? editFields.dailyLimit || 0 : config.dailyLimit, config.currency)} ({dailyPct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div 
                          className={`h-full transition-all duration-500 ${dailyPct > 80 ? 'bg-rose-500' : 'bg-blue-600'}`}
                          style={{ width: `${dailyPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-500 font-sans font-bold">Monthly Limit Utilization:</span>
                        <span className="text-slate-700 font-bold">
                          {formatMoney(config.monthlyUsed, config.currency)} / {formatMoney(isEditing ? editFields.monthlyLimit || 0 : config.monthlyLimit, config.currency)} ({monthlyPct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${monthlyPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Editable Rate limits grid values */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    
                    {/* Card Spend limit */}
                    <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-2.5">
                      <span className="text-[9px] text-slate-400 block font-sans font-bold">Card Tx Limit</span>
                      {isEditing ? (
                        <input 
                          type="number"
                          value={editFields.cardTxLimit || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, cardTxLimit: parseFloat(e.target.value) }))}
                          className="w-20 p-1 border border-slate-300 rounded font-bold font-mono text-[11px]"
                        />
                      ) : (
                        <strong className="text-slate-800 font-bold">{formatMoney(config.cardTxLimit, config.currency)}</strong>
                      )}
                    </div>

                    {/* Withdrawal limit */}
                    <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-2.5">
                      <span className="text-[9px] text-slate-400 block font-sans font-bold">Withdrawal Limit</span>
                      {isEditing ? (
                        <input 
                          type="number"
                          value={editFields.withdrawalLimit || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, withdrawalLimit: parseFloat(e.target.value) }))}
                          className="w-20 p-1 border border-slate-300 rounded font-bold font-mono text-[11px]"
                        />
                      ) : (
                        <strong className="text-slate-800 font-bold">{formatMoney(config.withdrawalLimit, config.currency)}</strong>
                      )}
                    </div>

                    {/* Transfer limit */}
                    <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-2.5">
                      <span className="text-[9px] text-slate-400 block font-sans font-bold">Transfer Limit</span>
                      {isEditing ? (
                        <input 
                          type="number"
                          value={editFields.transferLimit || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, transferLimit: parseFloat(e.target.value) }))}
                          className="w-20 p-1 border border-slate-300 rounded font-bold font-mono text-[11px]"
                        />
                      ) : (
                        <strong className="text-slate-800 font-bold">{formatMoney(config.transferLimit, config.currency)}</strong>
                      )}
                    </div>

                    {/* Merchant payout limit */}
                    <div className="bg-slate-50 border border-slate-200/40 rounded-lg p-2.5">
                      <span className="text-[9px] text-slate-400 block font-sans font-bold">Merchant Ceil</span>
                      {isEditing ? (
                        <input 
                          type="number"
                          value={editFields.merchantTxLimit || ''}
                          onChange={(e) => setEditFields(prev => ({ ...prev, merchantTxLimit: parseFloat(e.target.value) }))}
                          className="w-20 p-1 border border-slate-300 rounded font-bold font-mono text-[11px]"
                        />
                      ) : (
                        <strong className="text-slate-800 font-bold">{formatMoney(config.merchantTxLimit, config.currency)}</strong>
                      )}
                    </div>

                  </div>

                  {/* Actions buttons */}
                  <div className="shrink-0 flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setSelectedLimitId(null)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 cursor-pointer text-xs"
                          title="Discard overrides"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSave(config.id)}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEditClick(config)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 cursor-pointer text-xs font-semibold"
                        title="Override operational limits"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Adjust Limits
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
