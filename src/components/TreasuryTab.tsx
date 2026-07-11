import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, ArrowRight, ArrowUpRight, ArrowDownLeft, Building, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { TreasuryBalance, TransactionFlow } from '../types';

interface TreasuryTabProps {
  balances: TreasuryBalance[];
  transactions: TransactionFlow[];
  onTriggerSweep: (amount: number, bankId: string, currency: string) => void;
  isProcessingSweep: boolean;
}

export function TreasuryTab({ balances, transactions, onTriggerSweep, isProcessingSweep }: TreasuryTabProps) {
  const [sweepAmount, setSweepAmount] = useState('100000');
  const [selectedBank, setSelectedBank] = useState('bal-1'); // Default to Mercury Bank

  // Calculate dynamic totals
  const totalUSD = balances.reduce((acc, bal) => {
    // Basic approximate conversions for visualization
    const rates: Record<string, number> = { USD: 1.0, EUR: 1.08, SGD: 0.74, GBP: 1.27 };
    return acc + bal.amount * (rates[bal.currency] || 1.0);
  }, 0);

  const handleSweepClick = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(sweepAmount);
    if (isNaN(amount) || amount <= 0) return;

    const matchedBal = balances.find(b => b.id === selectedBank);
    if (matchedBal) {
      onTriggerSweep(amount, matchedBal.id, matchedBal.currency);
    }
  };

  // Helper to generate a mini sparkline path inside SVG
  const generateSparklinePath = (trend: number[], width: number, height: number) => {
    if (trend.length === 0) return '';
    const min = Math.min(...trend);
    const max = Math.max(...trend);
    const range = max - min || 1;
    
    return trend
      .map((val, index) => {
        const x = (index / (trend.length - 1)) * width;
        const y = height - ((val - min) / range) * height * 0.8 - height * 0.1; // padding top/bottom
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Top summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Liquidity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Global Treasury Liquidity</span>
            <span className="text-2xl font-bold font-display text-slate-800">
              ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">USD Aggregate conversion</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Settlements Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Settlements Pending</span>
            <span className="text-2xl font-bold font-display text-amber-600">
              $300,000.00
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">Continuous clearing sweep</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 animate-pulse">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Settled Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Settlements</span>
            <span className="text-2xl font-bold font-display text-emerald-600">
              +$750,000.00
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">All channels operating safe</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Balances list (Col 8) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-800 font-display">Authoritative Account Ledgers</h3>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded font-mono">Real-time update</span>
            </div>

            {/* Balances list items */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {balances.map((bal) => (
                <div key={bal.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between h-36">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">{bal.bank}</span>
                      <span className="text-sm font-bold font-display text-slate-800">{bal.currency} Cash Pool</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md font-mono">{bal.currency}</span>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="space-y-0.5">
                      <span className="text-lg font-bold font-mono tracking-tight text-slate-900">
                        {bal.symbol}{bal.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] text-slate-400 block">PCI-DSS Safe Vaulted balance</span>
                    </div>

                    {/* Sparkline */}
                    <div className="w-20 h-8 flex items-center justify-center">
                      <svg width="80" height="32" className="text-blue-500 overflow-visible">
                        <path
                          d={generateSparklinePath(bal.trend, 80, 32)}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-800 font-display">Treasury Audit Trail</h3>
              <span className="text-[10px] font-bold font-mono text-slate-400">DOUBLE-ENTRY COMPLIANT</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-3 font-semibold">Ledger ID</th>
                    <th className="px-6 py-3 font-semibold">Date / Stamp</th>
                    <th className="px-6 py-3 font-semibold">Channel Partner</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold text-right">Value Amount</th>
                    <th className="px-6 py-3 font-semibold text-center">Clearance</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 text-slate-900 font-mono text-[10px]">{tx.id}</td>
                      <td className="px-6 py-3.5 text-slate-500 font-mono text-[10px]">{tx.date}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{tx.counterparty}</td>
                      <td className="px-6 py-3.5">
                        {tx.type === 'Settlement' ? (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-bold">Sweep Settlement</span>
                        ) : tx.type === 'Inflow' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold">Capital Inflow</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-bold">Outbound Sweep</span>
                        )}
                      </td>
                      <td className={`px-6 py-3.5 text-right font-mono font-bold ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tx.currency}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {tx.status === 'Settled' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Settled
                          </span>
                        ) : tx.status === 'Pending' ? (
                          <span className="inline-flex items-center gap-1 text-amber-500 font-semibold text-[10px] animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Clearing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 font-semibold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Failed
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

        {/* Sweep Form Simulator (Col 4) */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-white font-bold text-sm font-display flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400" />
                Treasury Sweep Engine
              </h3>
              <p className="text-slate-400 text-[11px] mt-1">Initiate liquidity transfers across vaults</p>
            </div>

            <form onSubmit={handleSweepClick} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-300 text-[10px] font-bold uppercase tracking-wider block">Source Cash Pool</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-lg p-2.5 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                >
                  {balances.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bank} ({b.currency}) — balance {b.symbol}{b.amount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 text-[10px] font-bold uppercase tracking-wider block">Sweep Value (Amount)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-mono">
                    {balances.find(b => b.id === selectedBank)?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    value={sweepAmount}
                    onChange={(e) => setSweepAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full bg-slate-800 border border-slate-700/60 rounded-lg p-2.5 pl-8 text-xs text-white outline-none focus:border-blue-500 transition-colors font-mono"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Target Routing note */}
              <div className="p-3 bg-slate-850 rounded-lg border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                  <span>Routing Pathway</span>
                  <span className="text-blue-400 font-mono">PCI-DSS Secure</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Clearing Channel</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span>Settlement Bank</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingSweep}
                className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                  isProcessingSweep
                    ? 'bg-blue-500 cursor-not-allowed opacity-80'
                    : 'bg-blue-600 hover:bg-blue-700 active:translate-y-0.5 shadow-blue-500/20'
                }`}
              >
                {isProcessingSweep ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sweeping Liquidity...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Initiate Sweep Settlement</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
