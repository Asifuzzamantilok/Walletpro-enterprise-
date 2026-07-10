import React, { useState, useMemo } from 'react';
import { 
  FileText, TrendingUp, Server, HardDrive, HeartPulse, Sliders,
  Shield, CheckCircle, AlertTriangle, RefreshCw, XCircle, Search, Play
} from 'lucide-react';
import { 
  DevLog, ServiceRegistryNode, RateLimitRule, RateLimitViolation 
} from './devMockData';

interface DevLogsTracingHealthRegistryProps {
  isDarkMode: boolean;
  logs: DevLog[];
  setLogs: React.Dispatch<React.SetStateAction<DevLog[]>>;
  services: ServiceRegistryNode[];
  setServices: React.Dispatch<React.SetStateAction<ServiceRegistryNode[]>>;
  rateRules: RateLimitRule[];
  setRateRules: React.Dispatch<React.SetStateAction<RateLimitRule[]>>;
  violations: RateLimitViolation[];
  setViolations: React.Dispatch<React.SetStateAction<RateLimitViolation[]>>;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  activeSubTab: string;
}

export function DevLogsTracingHealthRegistry({
  isDarkMode,
  logs,
  setLogs,
  services,
  setServices,
  rateRules,
  setRateRules,
  violations,
  setViolations,
  onToast,
  activeSubTab
}: DevLogsTracingHealthRegistryProps) {
  
  // LOGS FILTER STATE
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [logTypeFilter, setLogTypeFilter] = useState<'ALL' | 'API' | 'WEBHOOK' | 'WORKER' | 'APP'>('ALL');

  // TRACING CORRELATION ID
  const [traceCorrelationId, setTraceCorrelationId] = useState('c-88a2-f901');

  // UNBLOCK RATE LIMIT CLIENTS
  const [blockedClients, setBlockedClients] = useState([
    { ip: '185.190.140.22', endpoint: '/api/v2/wallets', blockTime: '2026-07-10T07:05:12Z', releaseTime: 'In 4 minutes' },
    { ip: '45.112.98.11', endpoint: '/api/v2/transactions/transfer', blockTime: '2026-07-10T06:50:00Z', releaseTime: 'In 9 minutes' }
  ]);

  // MICROSERVICES POD SLIDER CONFIGS
  const [podReplicaSettings, setPodReplicaSettings] = useState<Record<string, number>>({
    'srv-1': 3,
    'srv-2': 2,
    'srv-3': 4,
    'srv-4': 2,
    'srv-5': 3
  });

  const handleUpdateReplica = (serviceId: string, value: number) => {
    setPodReplicaSettings(prev => ({ ...prev, [serviceId]: value }));
    const srvName = services.find(s => s.id === serviceId)?.name || 'microservice';
    onToast('Kubernetes Scaling Pods', `Scaling replica set for ${srvName} to ${value} pods. Rescheduling...`, 'success');
  };

  const handleUnblockClient = (ip: string) => {
    setBlockedClients(prev => prev.filter(c => c.ip !== ip));
    onToast('Client IP Released', `Removed restriction block for client IP: ${ip}`, 'success');
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(lg => {
      const matchQuery = lg.message.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                         lg.correlationId.toLowerCase().includes(logSearchQuery.toLowerCase());
      const matchLevel = logLevelFilter === 'ALL' || lg.level === logLevelFilter;
      const matchType = logTypeFilter === 'ALL' || lg.type === logTypeFilter;
      return matchQuery && matchLevel && matchType;
    });
  }, [logs, logSearchQuery, logLevelFilter, logTypeFilter]);

  return (
    <div className="space-y-6 text-left">
      {/* ==================================== */}
      {/* 1. ENTERPRISE LOGS TERMINAL */}
      {/* ==================================== */}
      {activeSubTab === 'dev-logs' && (
        <div className={`p-5 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Platform Event Logging Terminal
              </h2>
              <p className="text-xs opacity-75">Trace execution payloads, gateway transfers and worker threads in real-time</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input 
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Correlation ID / text..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border text-xs bg-transparent border-slate-700 w-44 font-mono focus:outline-none"
                />
              </div>

              <select 
                value={logLevelFilter}
                onChange={(e) => setLogLevelFilter(e.target.value as any)}
                className="p-1.5 rounded-lg border text-xs bg-transparent border-slate-700 font-mono"
              >
                <option value="ALL">All Levels</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
              </select>

              <select 
                value={logTypeFilter}
                onChange={(e) => setLogTypeFilter(e.target.value as any)}
                className="p-1.5 rounded-lg border text-xs bg-transparent border-slate-700 font-mono"
              >
                <option value="ALL">All Modules</option>
                <option value="API">API Gateway</option>
                <option value="WEBHOOK">Webhooks</option>
                <option value="WORKER">Workers</option>
                <option value="APP">App Log</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl min-h-[340px] max-h-[440px] overflow-y-auto font-mono text-[11px] text-slate-300 space-y-2 text-left">
            {filteredLogs.length === 0 ? (
              <div className="text-center opacity-40 py-12">No system logs match active filters.</div>
            ) : (
              filteredLogs.map(lg => (
                <div key={lg.id} className="border-b border-slate-900/60 pb-1.5 flex items-start gap-2">
                  <span className="opacity-40 select-none">[{new Date(lg.timestamp).toLocaleTimeString()}]</span>
                  <span className={`px-1 rounded text-[9px] font-black uppercase ${
                    lg.level === 'INFO' ? 'bg-blue-500/10 text-blue-400' :
                    lg.level === 'WARN' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {lg.level}
                  </span>
                  <span className="opacity-50 select-none">[{lg.type}]</span>
                  <span className="text-blue-500 underline cursor-pointer" onClick={() => { setTraceCorrelationId(lg.correlationId); onToast('Tracing Filter Activated', `Viewing trace correlation for ${lg.correlationId}`, 'info'); }} title="Trace this correlation ID">
                    ({lg.correlationId})
                  </span>
                  <span className="flex-1 whitespace-pre-wrap">{lg.message}</span>
                  {lg.latencyMs && <span className="opacity-50 select-none font-bold text-[10px]">{lg.latencyMs}ms</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 2. DISTRIBUTED TRACING TIMELINE */}
      {/* ==================================== */}
      {activeSubTab === 'dev-tracing' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Distributed Tracing Waterfall
              </h2>
              <p className="text-xs opacity-75">Trace transaction cascades and locate execution latencies across isolated cloud components</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs opacity-65">Trace Correlation ID</span>
              <input 
                type="text"
                value={traceCorrelationId}
                onChange={(e) => setTraceCorrelationId(e.target.value)}
                placeholder="Trace ID..."
                className="p-1.5 rounded border text-xs bg-transparent border-slate-700 font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Trace Breakdown Waterfall visualization */}
          <div className="space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/60 flex justify-between text-xs font-mono">
              <span className="font-bold text-blue-400">TRACE ID: {traceCorrelationId}</span>
              <span className="opacity-60">Total Duration: 215ms (100% compliant)</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {[
                { name: '1. Ingress Proxy Route (API Gateway)', latency: 4, barPct: 2, startPct: 0, service: 'api-gateway' },
                { name: '2. JWT Security Auths & Scopes validation', latency: 12, barPct: 6, startPct: 2, service: 'auth-service' },
                { name: '3. Regional Account Balance Locks check', latency: 35, barPct: 16, startPct: 8, service: 'ledger-engine' },
                { name: '4. Atomic PostgreSQL Transaction Commit', latency: 22, barPct: 10, startPct: 24, service: 'cloud-postgres' },
                { name: '5. Outbound Stripe Sync Hook (Webhooks)', latency: 142, barPct: 66, startPct: 34, service: 'webhook-dispatch' }
              ].map((trace, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <div className="md:col-span-1">
                    <span className="font-bold text-slate-300">{trace.name}</span>
                    <span className="block text-[9px] opacity-40 uppercase">{trace.service}</span>
                  </div>

                  <div className="md:col-span-2 flex items-center h-5 bg-slate-950 rounded overflow-hidden relative">
                    <div 
                      className="bg-blue-600 h-full rounded flex items-center px-1.5 text-[9px] font-bold text-white transition-all duration-500" 
                      style={{ 
                        marginLeft: `${trace.startPct}%`, 
                        width: `${trace.barPct}%` 
                      }}
                    >
                      {trace.latency}ms
                    </div>
                  </div>

                  <div className="md:col-span-1 text-right text-[10px] opacity-60">
                    Segment latency: {trace.latency} ms
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 3. SERVICE REGISTRY */}
      {/* ==================================== */}
      {activeSubTab === 'dev-service-registry' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-500" /> Consul Microservices Service Registry
            </h2>
            <p className="text-xs opacity-75">Live health registry cataloging dynamic peering scores, API version, and replica sets</p>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 opacity-60">
                  <th className="py-2">Service Name</th>
                  <th className="py-2">Active Version</th>
                  <th className="py-2">Component Owner</th>
                  <th className="py-2">Health Score</th>
                  <th className="py-2">Inter-Service Latency</th>
                  <th className="py-2 font-mono">Replicas</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {services.map(srv => (
                  <tr key={srv.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 font-sans font-bold text-blue-400">{srv.name}</td>
                    <td className="py-3">{srv.version}</td>
                    <td className="py-3 font-sans opacity-70">{srv.owner}</td>
                    <td className="py-3 font-bold text-emerald-500">{srv.healthScore}%</td>
                    <td className="py-3">{srv.latencyMs} ms</td>
                    <td className="py-3">{podReplicaSettings[srv.id] || srv.replicas} pods</td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-500 font-bold">UP</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 4. MICROSERVICES pod configs */}
      {/* ==================================== */}
      {activeSubTab === 'dev-microservices' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-500" /> Kubernetes Pod Microservices Config
            </h2>
            <p className="text-xs opacity-75">Scale microservice deployment replica counts and audit auto-scaling rules live</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {services.map(srv => (
              <div key={srv.id} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-400 font-mono">{srv.name}</span>
                  <span className="text-[10px] opacity-50 font-mono">Scaling Mode: HPA (CPU &gt;75%)</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="opacity-60">Replica Instance Pods</span>
                    <span className="font-bold text-slate-200">{podReplicaSettings[srv.id] || srv.replicas} instances</span>
                  </div>
                  <input 
                    type="range"
                    min={1}
                    max={10}
                    value={podReplicaSettings[srv.id] || srv.replicas}
                    onChange={(e) => handleUpdateReplica(srv.id, parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono opacity-60">
                  <span>Target Memory: 512MB/pod</span>
                  <span>Cool-down timer: 300s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 5. HEALTH CHECKS MATRIX */}
      {/* ==================================== */}
      {activeSubTab === 'dev-health' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-blue-500" /> Heartbeat Service Health Checks Matrix
            </h2>
            <p className="text-xs opacity-75">Dynamic ping matrix auditing peripheral service routing nodes and external gateway peers</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { name: 'Core API Ingress Gateway', status: 'OPERATIONAL', latency: '4 ms', color: 'bg-emerald-500' },
              { name: 'Primary Cloud SQL Postgres', status: 'OPERATIONAL', latency: '22 ms', color: 'bg-emerald-500' },
              { name: 'In-Memory Cache (Redis Cluster)', status: 'OPERATIONAL', latency: '1 ms', color: 'bg-emerald-500' },
              { name: 'Kafka Dispatch Event Bus', status: 'OPERATIONAL', latency: '9 ms', color: 'bg-emerald-500' },
              { name: 'Outbound SendGrid Mailer', status: 'OPERATIONAL', latency: '115 ms', color: 'bg-emerald-500' },
              { name: 'Twilio Gateway SMS peering', status: 'DEGRADED', latency: '542 ms', color: 'bg-amber-500' },
              { name: 'S3 Secured Assets Upload Node', status: 'OPERATIONAL', latency: '85 ms', color: 'bg-emerald-500' },
              { name: 'Onfido KYC validation engine', status: 'OPERATIONAL', latency: '240 ms', color: 'bg-emerald-500' }
            ].map((node, index) => (
              <div key={index} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between font-mono text-xs`}>
                <div>
                  <span className="font-sans font-bold text-slate-300 block leading-tight">{node.name}</span>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`w-2 h-2 rounded-full ${node.color}`} />
                    <span className="font-sans font-bold text-[10px] text-slate-400">{node.status}</span>
                  </div>
                </div>
                <div className="mt-4 pt-1.5 border-t border-slate-800/40 text-[10px] opacity-60 flex justify-between">
                  <span>Heartbeat</span>
                  <span>{node.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 6. RATE LIMITS */}
      {/* ==================================== */}
      {activeSubTab === 'dev-rate-limits' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" /> API Gateway Rate Limiting Rules
              </h2>
              <p className="text-xs opacity-75">Configured traffic rules restricting malicious API volume and avoiding double-spend loops</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 opacity-60">
                    <th className="py-2">Target Node Pattern</th>
                    <th className="py-2">Limiter Expression</th>
                    <th className="py-2 text-rose-400 font-mono">Violations Today</th>
                    <th className="py-2 font-mono">Blocked IPs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {rateRules.map(rule => (
                    <tr key={rule.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 font-bold text-slate-300">{rule.target}</td>
                      <td className="py-3 opacity-80">{rule.limit}</td>
                      <td className="py-3 text-rose-500 font-bold">{rule.violationsToday}</td>
                      <td className="py-3">{rule.blockedClientsCount} clients</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Blocked clients list */}
          <div className={`p-4 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-semibold opacity-60 uppercase block">Active Gateway Bans</span>
            
            <div className="space-y-3">
              {blockedClients.length === 0 ? (
                <div className="text-xs text-center opacity-40 font-mono py-8">Zero client IPs blocked.</div>
              ) : (
                blockedClients.map(client => (
                  <div key={client.ip} className="p-3 rounded-lg bg-slate-950 border border-slate-850 font-mono text-xs">
                    <div className="flex justify-between font-bold text-rose-500">
                      <span>{client.ip}</span>
                      <span className="text-[10px] font-normal font-sans bg-rose-500/15 px-1.5 py-0.2 rounded">Banned</span>
                    </div>
                    <p className="text-[10px] opacity-60 mt-1">Route: {client.endpoint}</p>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-900">
                      <span className="text-[9px] opacity-40">Release: {client.releaseTime}</span>
                      <button 
                        onClick={() => handleUnblockClient(client.ip)}
                        className="text-[11px] font-sans font-bold text-blue-400 hover:underline"
                      >
                        Unblock Client IP
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
