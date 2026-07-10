import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, RefreshCw, AlertTriangle, BookOpen, FileSpreadsheet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { OperationsService } from './OperationsService';

export function LedgerPage() {
  const [searchText, setSearchText] = useState('');
  const [accountFilter, setAccountFilter] = useState('All');

  const { 
    data: ledger = [], 
    isLoading, 
    isError, 
    refetch, 
    isFetching 
  } = useQuery({
    queryKey: ['operations-ledger'],
    queryFn: () => OperationsService.getLedger(),
    staleTime: 5000
  });

  const filteredLedger = ledger.filter(entry => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch = 
      entry.id.toLowerCase().includes(searchLower) ||
      entry.reference.toLowerCase().includes(searchLower) ||
      entry.walletId.toLowerCase().includes(searchLower) ||
      entry.account.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (accountFilter !== 'All' && !entry.account.includes(accountFilter)) return false;

    return true;
  });

  const formatMoney = (val: number, curr: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(val);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      
      {/* Sub-header */}
      <div className="bg-white border-b border-slate-200/60 p-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-sans flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            General Double-Entry Ledger Book
          </h2>
          <p className="text-xs text-slate-500 font-mono">Immutable cryptographic records of all funds allocations</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => refetch()}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            disabled={isLoading || isFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Sync Ledger
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200/80 p-4 shrink-0 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Search Entries</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Ref, Account, Wallet..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filter Account Type</label>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:outline-none"
          >
            <option value="All">All Chart of Accounts</option>
            <option value="Deposits">1100 - Customer Deposits (Asset)</option>
            <option value="Clearing">1200 - Clearing & Settlements (Liability)</option>
            <option value="Adjust">Administrative Adjustments</option>
          </select>
        </div>
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-y-auto h-full p-4 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse h-16" />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg mx-auto mt-12 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">Ledger Audit Connection Loss</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">The ledger transaction stream failed to answer. Retry synchronization.</p>
            <button onClick={() => refetch()} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold">
              Retry
            </button>
          </div>
        ) : filteredLedger.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 max-w-md mx-auto mt-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No Postings Found</h3>
            <p className="text-xs text-slate-500 mt-1">Adjust search parameters to review double-entry logs.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/50 text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                  <th className="px-4 py-3">Posting ID</th>
                  <th className="px-4 py-3">Reference / Wallet ID</th>
                  <th className="px-4 py-3">Account Title</th>
                  <th className="px-4 py-3 text-right">Debit (Dr)</th>
                  <th className="px-4 py-3 text-right">Credit (Cr)</th>
                  <th className="px-4 py-3 text-right">Balance Before / After</th>
                  <th className="px-4 py-3 text-center">Posting Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                {filteredLedger.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition">
                    {/* Posting ID */}
                    <td className="px-4 py-3 font-bold text-slate-900">{entry.id}</td>
                    
                    {/* Reference / Wallet */}
                    <td className="px-4 py-3 text-left">
                      <div className="font-bold text-slate-800">{entry.reference}</div>
                      <div className="text-[10px] text-slate-400">{entry.walletId}</div>
                    </td>

                    {/* Account */}
                    <td className="px-4 py-3 font-sans text-xs">
                      <div className="font-semibold text-slate-800">{entry.account}</div>
                      <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-mono text-[9px]">
                        {entry.currency}
                      </span>
                    </td>

                    {/* Debit */}
                    <td className="px-4 py-3 text-right font-bold">
                      {entry.debit > 0 ? (
                        <span className="text-rose-600 inline-flex items-center gap-0.5">
                          <ArrowUpRight className="w-3 h-3 text-rose-500" />
                          {formatMoney(entry.debit, entry.currency)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Credit */}
                    <td className="px-4 py-3 text-right font-bold">
                      {entry.credit > 0 ? (
                        <span className="text-emerald-600 inline-flex items-center gap-0.5">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
                          {formatMoney(entry.credit, entry.currency)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Balance progression */}
                    <td className="px-4 py-3 text-right text-slate-500 text-[10px]">
                      <div>Pre: {formatMoney(entry.balanceBefore, entry.currency)}</div>
                      <div className="font-bold text-slate-800">Post: {formatMoney(entry.balanceAfter, entry.currency)}</div>
                    </td>

                    {/* Posting time */}
                    <td className="px-4 py-3 text-center text-slate-400">{entry.postingTime}</td>
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
