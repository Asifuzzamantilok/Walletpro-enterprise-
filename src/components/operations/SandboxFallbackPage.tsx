import React from 'react';
import { Lock, ShieldAlert, Cpu, HardDrive, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

interface SandboxFallbackPageProps {
  tabId: string;
}

export function SandboxFallbackPage({ tabId }: SandboxFallbackPageProps) {
  // Map internal system codes for realistic display
  const systemModules: { [key: string]: { name: string; cluster: string; status: string; progress: number } } = {
    'analytics': { name: 'Executive Analytics Center', cluster: 'BI-CLUSTER-09', status: 'In Active Development', progress: 85 },
    'reports': { name: 'Regulatory reporting & Audit exports', cluster: 'BI-CLUSTER-12', status: 'Halted - Compliance Scrutiny', progress: 40 },
    'fraud-center': { name: 'Risk Analytics & Fraud models', cluster: 'RISK-CLUSTER-03', status: 'Halted - Pending Core Audit', progress: 15 },
    'alerts': { name: 'Live Threat Alerts Feed', cluster: 'RISK-CLUSTER-04', status: 'Planned for Phase 7', progress: 0 },
    'investigations': { name: 'Advanced fraud cases investigations', cluster: 'RISK-CLUSTER-05', status: 'Planned for Phase 7', progress: 0 },
    'high-risk-accounts': { name: 'High-Risk Blocklist Controller', cluster: 'RISK-CLUSTER-09', status: 'In Active Development', progress: 70 },
    'frozen-accounts': { name: 'Sovereign Account Freezing registry', cluster: 'RISK-CLUSTER-01', status: 'Planned for Phase 7', progress: 0 },
    'treasury': { name: 'Finance Treasury sweep desks', cluster: 'FIN-CLUSTER-02', status: 'Halted - Phase 4 complete', progress: 100 },
    'revenue': { name: 'Revenue Accounting ledgers', cluster: 'FIN-CLUSTER-03', status: 'Planned for Phase 8', progress: 0 },
    'fees': { name: 'Dynamic pricing & fees controller', cluster: 'FIN-CLUSTER-04', status: 'Planned for Phase 8', progress: 0 },
    'reconciliation': { name: 'Sovereign Bank settlement reconciliator', cluster: 'FIN-CLUSTER-05', status: 'Planned for Phase 8', progress: 0 },
    'liquidity': { name: 'Liquidity desk & balance alerts', cluster: 'FIN-CLUSTER-06', status: 'Planned for Phase 8', progress: 0 },
    'accounting': { name: 'Double-entry GL sync tools', cluster: 'FIN-CLUSTER-01', status: 'Planned for Phase 8', progress: 0 },
    'tickets': { name: 'Customer Helpdesk & Ticketing', cluster: 'SUP-CLUSTER-02', status: 'In Active Development', progress: 60 },
    'customer-communication': { name: 'Automated mailer & SMS systems', cluster: 'SUP-CLUSTER-04', status: 'Planned for Phase 9', progress: 0 },
    'live-chat': { name: 'Platform Live Chat & Webhooks', cluster: 'SUP-CLUSTER-01', status: 'In Active Development', progress: 45 },
    'notifications': { name: 'Alert notification templates config', cluster: 'SUP-CLUSTER-03', status: 'Planned for Phase 9', progress: 0 },
    'admin-users': { name: 'Platform administrator registry', cluster: 'PLAT-CLUSTER-02', status: 'Planned for Phase 10', progress: 0 },
    'roles': { name: 'RBAC Roles configuration console', cluster: 'PLAT-CLUSTER-03', status: 'Planned for Phase 10', progress: 0 },
    'permissions': { name: 'Micro-permissions controller matrix', cluster: 'PLAT-CLUSTER-04', status: 'Planned for Phase 10', progress: 0 },
    'feature-flags': { name: 'Continuous deployment feature flags', cluster: 'PLAT-CLUSTER-05', status: 'Planned for Phase 10', progress: 0 },
    'app-settings': { name: 'Global application properties config', cluster: 'PLAT-CLUSTER-01', status: 'Planned for Phase 10', progress: 0 },
    'notification-templates': { name: 'Platform-wide email styling files', cluster: 'PLAT-CLUSTER-06', status: 'Planned for Phase 10', progress: 0 },
    'audit-logs': { name: 'Cryptographic system actions audit logs', cluster: 'PLAT-CLUSTER-07', status: 'Planned for Phase 10', progress: 0 },
    'security': { name: 'SSO & Multi-factor auth properties', cluster: 'PLAT-CLUSTER-08', status: 'Planned for Phase 10', progress: 0 },
    'sessions': { name: 'Active platform admin sessions matrix', cluster: 'PLAT-CLUSTER-09', status: 'Planned for Phase 10', progress: 0 },
    'api-keys': { name: 'Merchant API secrets controller', cluster: 'DEV-CLUSTER-01', status: 'Planned for Phase 11', progress: 0 },
    'webhooks': { name: 'Real-time webhook dispatcher logs', cluster: 'DEV-CLUSTER-02', status: 'Planned for Phase 11', progress: 0 },
    'api-logs': { name: 'Server-side API requests logging stream', cluster: 'DEV-CLUSTER-03', status: 'Planned for Phase 11', progress: 0 },
    'integrations': { name: 'Third-party banking plugins config', cluster: 'DEV-CLUSTER-04', status: 'Planned for Phase 11', progress: 0 },
    'developer-documentation': { name: 'API Reference & onboarding tutorials', cluster: 'DEV-CLUSTER-05', status: 'Planned for Phase 11', progress: 0 }
  };

  const currentModule = systemModules[tabId] || {
    name: 'Unified Platform Extension Module',
    cluster: 'SYS-CLUSTER-UNKNOWN',
    status: 'In Development Pipeline',
    progress: 30
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 text-center text-left">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center max-w-xl mx-auto space-y-5">
        <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10 border border-slate-800">
          <Lock className="w-6 h-6 text-yellow-400" />
        </div>

        <div className="space-y-1.5 text-center">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
            System Code: {tabId.toUpperCase()} • Cluster {currentModule.cluster}
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {currentModule.name}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            This workspace module is currently offline. Access is restricted under Active RBAC profile configuration, or the system layer is scheduled for a future roadmap release.
          </p>
        </div>

        {/* Dynamic RoadMap Progress Bar */}
        <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-600">Roadmap Progress</span>
            <span className="font-mono font-bold text-slate-500">{currentModule.progress}%</span>
          </div>

          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden p-[1px] border">
            <div 
              className="h-full bg-slate-900 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${currentModule.progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>Status: <strong className="text-slate-600">{currentModule.status}</strong></span>
            <span>Est. Delivery: Q4 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />
          <span>Restricted under Basel IV Framework Guidelines.</span>
        </div>
      </div>
    </div>
  );
}
