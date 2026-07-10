import React, { useState } from 'react';
import { 
  Sliders, Cpu, AlertTriangle, RefreshCw, Layers, CheckCircle2,
  Lock, ArrowRight, Check, X
} from 'lucide-react';
import { MarketplaceIntegration } from './devMockData';

interface DevSandboxMarketplaceProps {
  isDarkMode: boolean;
  marketplace: MarketplaceIntegration[];
  setMarketplace: React.Dispatch<React.SetStateAction<MarketplaceIntegration[]>>;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  activeSubTab: string;
}

export function DevSandboxMarketplace({
  isDarkMode,
  marketplace,
  setMarketplace,
  onToast,
  activeSubTab
}: DevSandboxMarketplaceProps) {
  
  // SANDBOX TEST STATE
  const [testAccounts, setTestAccounts] = useState([
    { id: 'ACT-001', name: 'Standard USD Test Account', currency: 'USD', balance: 50000.00, status: 'ACTIVE', card: '4111 2222 3333 4444', cvv: '123', exp: '12/28' },
    { id: 'ACT-002', name: 'Standard EUR Test Account', currency: 'EUR', balance: 25000.00, status: 'ACTIVE', card: '4912 3812 0019 9211', cvv: '981', exp: '06/29' },
    { id: 'ACT-003', name: 'High-Risk GBP Merchant Sandbox', currency: 'GBP', balance: 185000.00, status: 'ACTIVE', card: '4000 1234 5678 9010', cvv: '442', exp: '10/27' }
  ]);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Trigger generators
  const handleGenerateMockData = () => {
    onToast('Mock Data Appended', 'Injecting 10 synthetic card transactions and updating test account balances.', 'success');
    setTestAccounts(prev => prev.map(acc => ({
      ...acc,
      balance: Number((acc.balance + (Math.random() > 0.5 ? 1200.50 : -450.00)).toFixed(2))
    })));
  };

  const handleClearSandboxLogs = () => {
    onToast('Logs Pruned', 'Sandbox transactions audit trail reset successfully.', 'info');
  };

  const handleResetSandbox = () => {
    setIsResetting(true);
    setConfirmResetOpen(false);
    onToast('Reset Requested', 'Flushing ledger caches and resetting standard test account balances...', 'info');

    setTimeout(() => {
      setIsResetting(false);
      setTestAccounts([
        { id: 'ACT-001', name: 'Standard USD Test Account', currency: 'USD', balance: 50000.00, status: 'ACTIVE', card: '4111 2222 3333 4444', cvv: '123', exp: '12/28' },
        { id: 'ACT-002', name: 'Standard EUR Test Account', currency: 'EUR', balance: 25000.00, status: 'ACTIVE', card: '4912 3812 0019 9211', cvv: '981', exp: '06/29' },
        { id: 'ACT-003', name: 'High-Risk GBP Merchant Sandbox', currency: 'GBP', balance: 185000.00, status: 'ACTIVE', card: '4000 1234 5678 9010', cvv: '442', exp: '10/27' }
      ]);
      onToast('Reset Complete', 'Sandbox returned to factory seed configurations.', 'success');
    }, 1500);
  };

  // Toggle Integrations
  const handleToggleIntegration = (id: string) => {
    setMarketplace(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'ACTIVE' || item.status === 'CONNECTED' ? 'DISABLED' : 'ACTIVE';
        onToast('Marketplace Synced', `${item.name} set to ${nextStatus}`, 'success');
        return { ...item, status: nextStatus as any, lastSync: new Date().toISOString() };
      }
      return item;
    }));
  };

  const [activeMarketplaceCat, setActiveMarketplaceCat] = useState<string>('ALL');

  const filteredMarketplace = marketplace.filter(item => {
    return activeMarketplaceCat === 'ALL' || item.category === activeMarketplaceCat;
  });

  return (
    <div className="space-y-6 text-left">
      {/* ==================================== */}
      {/* 1. SANDBOX CONTROL PANEL */}
      {/* ==================================== */}
      {activeSubTab === 'dev-sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Test Accounts list */}
          <div className={`lg:col-span-2 p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" /> Isolated Sandbox Controller
              </h2>
              <p className="text-xs opacity-75">Synthetic accounts, mock credentials and wallet balances for sandbox environments</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {testAccounts.map(acc => (
                <div key={acc.id} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono opacity-60 uppercase">{acc.id}</span>
                      <h4 className="font-sans font-bold text-sm text-slate-200 mt-0.5">{acc.name}</h4>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold">{acc.status}</span>
                  </div>

                  <div className="mt-3 font-mono">
                    <div className="text-xs opacity-60">Balance State</div>
                    <div className="text-lg font-black text-emerald-400 mt-0.5">
                      {acc.currency} {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Card credentials */}
                  <div className="mt-3 pt-3 border-t border-slate-800/40 grid grid-cols-3 gap-2 font-mono text-[10px]">
                    <div className="col-span-2">
                      <span className="opacity-50 block text-[9px] uppercase">Card Number</span>
                      <span className="font-bold text-slate-300">{acc.card}</span>
                    </div>
                    <div>
                      <span className="opacity-50 block text-[9px] uppercase">CVV / EXP</span>
                      <span className="font-bold text-slate-300">{acc.cvv} | {acc.exp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sandbox Generators */}
          <div className="flex flex-col gap-4">
            <div className={`p-4 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs font-semibold opacity-60 uppercase block">Sandbox Actions & Seeders</span>
              
              <button 
                onClick={handleGenerateMockData}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-xs font-bold transition-colors"
              >
                <span>Generate 10 Mock Transactions</span>
                <ArrowRight className="w-4 h-4 text-blue-500" />
              </button>

              <button 
                onClick={handleClearSandboxLogs}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-xs font-bold transition-colors"
              >
                <span>Clear Sandbox Log Trails</span>
                <ArrowRight className="w-4 h-4 text-blue-500" />
              </button>

              <div className="border-t border-slate-800/40 pt-4">
                <button 
                  onClick={() => setConfirmResetOpen(true)}
                  disabled={isResetting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                  {isResetting ? 'Resetting Sandbox...' : 'Reset Sandbox to Factory Seed'}
                </button>
              </div>
            </div>

            {/* Confirmation modal */}
            {confirmResetOpen && (
              <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 text-xs text-left">
                <div className="flex items-start gap-2 text-rose-500 mb-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Dangerous Sandbox Reset</h5>
                    <p className="text-[10px] opacity-80">This flushes all virtual account balances, deletes custom webhooks, and resets simulated API keys to default templates. Proceed?</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3 font-semibold">
                  <button onClick={() => setConfirmResetOpen(false)} className="px-2 py-1 rounded border border-slate-800 text-slate-400">Cancel</button>
                  <button onClick={handleResetSandbox} className="px-2 py-1 rounded bg-rose-600 text-white">Reset Now</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 2. INTEGRATION MARKETPLACE */}
      {/* ==================================== */}
      {activeSubTab === 'dev-marketplace' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-500" /> Third-Party Integrations Marketplace
              </h2>
              <p className="text-xs opacity-75">Enable, toggle and synchronize multi-regional cloud services with WalletPro microservices</p>
            </div>

            <select 
              value={activeMarketplaceCat}
              onChange={(e) => setActiveMarketplaceCat(e.target.value)}
              className="p-1.5 rounded-lg border text-xs bg-transparent border-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="Payment Gateways">Payment Gateways</option>
              <option value="SMS Providers">SMS Providers</option>
              <option value="Email Providers">Email Providers</option>
              <option value="KYC Providers">KYC Providers</option>
              <option value="Banking Partners">Banking Partners</option>
              <option value="Cloud Storage">Cloud Storage</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketplace.map(item => {
              const isActive = item.status === 'ACTIVE' || item.status === 'CONNECTED';
              return (
                <div key={item.id} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                        <span className="text-[10px] font-semibold opacity-75 font-mono">{item.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 mt-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white font-mono text-sm" style={{ backgroundColor: item.logoColor }}>
                        {item.name.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-sm text-slate-200">{item.name}</h4>
                        <span className="text-[10px] opacity-50 block font-mono">Provider: {item.provider}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/40 flex items-center justify-between text-xs">
                    <span className="text-[10px] opacity-50 font-mono">Sync: {new Date(item.lastSync).toLocaleDateString()}</span>
                    
                    <button 
                      onClick={() => handleToggleIntegration(item.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        isActive ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500' : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isActive ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
