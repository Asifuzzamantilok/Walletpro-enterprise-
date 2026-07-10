import React, { useMemo } from 'react';
import { 
  Activity, ArrowRightLeft, Cpu, Server, HardDrive, 
  TrendingUp, HeartPulse, RefreshCw, AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  ApiEndpoint, DevApiKey, DevOAuthClient, DevWebhook, 
  QueueJob, BackgroundJob, BackgroundWorker, ServiceRegistryNode 
} from './devMockData';

interface DevDashboardOverviewProps {
  isDarkMode: boolean;
  endpoints: ApiEndpoint[];
  apiKeys: DevApiKey[];
  oauthClients: DevOAuthClient[];
  webhooks: DevWebhook[];
  queueJobs: QueueJob[];
  bgJobs: BackgroundJob[];
  workers: BackgroundWorker[];
  services: ServiceRegistryNode[];
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function DevDashboardOverview({
  isDarkMode,
  endpoints,
  apiKeys,
  oauthClients,
  webhooks,
  queueJobs,
  bgJobs,
  workers,
  services,
  onToast
}: DevDashboardOverviewProps) {
  
  // Dynamic metrics calculations
  const totalCallsToday = useMemo(() => {
    return apiKeys.reduce((acc, k) => acc + k.callsToday, 0);
  }, [apiKeys]);

  const avgLatency = useMemo(() => {
    if (endpoints.length === 0) return 0;
    return Math.round(endpoints.reduce((acc, e) => acc + e.avgLatencyMs, 0) / endpoints.length);
  }, [endpoints]);

  const successRate = useMemo(() => {
    if (endpoints.length === 0) return 100;
    return Number((endpoints.reduce((acc, e) => acc + e.successRate, 0) / endpoints.length).toFixed(2));
  }, [endpoints]);

  const pendingQueuesCount = useMemo(() => {
    return queueJobs.filter(j => j.status === 'PENDING').length;
  }, [queueJobs]);

  const runningWorkersCount = useMemo(() => {
    return workers.filter(w => w.status === 'ONLINE').length;
  }, [workers]);

  const onlineServicesCount = useMemo(() => {
    return services.filter(s => s.status === 'UP').length;
  }, [services]);

  // Recharts custom tooltips style
  const tooltipStyle = {
    background: isDarkMode ? '#0f172a' : '#ffffff',
    borderColor: isDarkMode ? '#334155' : '#cbd5e1',
    color: isDarkMode ? '#f8fafc' : '#0f172a',
    borderRadius: '8px'
  };

  const chartColorTheme = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  return (
    <div className="space-y-6 text-left">
      {/* 13 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Requests Today</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">{totalCallsToday.toLocaleString()}</h4>
          <span className="text-[10px] text-emerald-500 font-mono">+12.4% vs yesterday</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Success Rate</span>
            <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">{successRate}%</h4>
          <span className="text-[10px] text-emerald-500 font-mono">Within SLA threshold</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Avg Latency</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">{avgLatency} ms</h4>
          <span className="text-[10px] text-emerald-500 font-mono">P95: 185ms stable</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Failed Calls</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">412</h4>
          <span className="text-[10px] text-rose-500 font-mono">0.18% error rate</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Rate Limited</span>
            <Cpu className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">142 IPs</h4>
          <span className="text-[10px] text-amber-500 font-mono">Violations logged</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Webhook Deliv</span>
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">24,590</h4>
          <span className="text-[10px] text-emerald-500 font-mono">99.8% dispatched</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Failed Webhooks</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">1</h4>
          <span className="text-[10px] text-amber-500 font-mono">3 retries queued</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Queue Backlog</span>
            <Server className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">{pendingQueuesCount} jobs</h4>
          <span className="text-[10px] text-emerald-500 font-mono">Kafka latency &lt;10ms</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Bg Cron Jobs</span>
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">{bgJobs.length} active</h4>
          <span className="text-[10px] text-emerald-500 font-mono">1 running now</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Workers Online</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">{runningWorkersCount} nodes</h4>
          <span className="text-[10px] text-emerald-500 font-mono">Healthy replica sync</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Services Online</span>
            <Server className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">{onlineServicesCount} UP</h4>
          <span className="text-[10px] text-emerald-500 font-mono">100% cloud nodes</span>
        </div>

        <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>SDK Downloads</span>
            <HardDrive className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <h4 className="text-lg font-bold mt-1 tracking-tight">1,894</h4>
          <span className="text-[10px] text-emerald-500 font-mono">Active this month</span>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="text-sm font-bold mb-4">API Request Volume & Latency Profile (Last 8 Hours)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { time: '00:00', requests: 12400, latency: 42 },
                { time: '01:00', requests: 14500, latency: 45 },
                { time: '02:00', requests: 11200, latency: 38 },
                { time: '03:00', requests: 9800, latency: 32 },
                { time: '04:00', requests: 15400, latency: 48 },
                { time: '05:00', requests: 22100, latency: 55 },
                { time: '06:00', requests: 28400, latency: 68 },
                { time: '07:00', requests: 31200, latency: 74 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} opacity={0.5} />
                <XAxis dataKey="time" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                <YAxis yAxisId="left" stroke={chartColorTheme.primary} />
                <YAxis yAxisId="right" orientation="right" stroke={chartColorTheme.accent} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="requests" name="Total Requests" stroke={chartColorTheme.primary} fillOpacity={0.15} fill="url(#colorReqs)" />
                <Area yAxisId="right" type="monotone" dataKey="latency" name="Avg Latency (ms)" stroke={chartColorTheme.accent} fillOpacity={0.05} fill="url(#colorLat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className="text-sm font-bold mb-4">Response Status Code Distribution</h3>
          <div className="h-64 flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={[
                { name: '2xx Success', value: 99.82, fill: chartColorTheme.secondary },
                { name: '3xx Redirect', value: 0.05, fill: chartColorTheme.primary },
                { name: '4xx Client Err', value: 0.11, fill: chartColorTheme.warning },
                { name: '5xx Server Err', value: 0.02, fill: chartColorTheme.danger }
              ]}>
                <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={10} />
                <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Percentage (%)" radius={[4, 4, 0, 0]}>
                  {
                    [
                      { fill: chartColorTheme.secondary },
                      { fill: chartColorTheme.primary },
                      { fill: chartColorTheme.warning },
                      { fill: chartColorTheme.danger }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-[11px] font-mono opacity-70 border-t pt-2 border-slate-800/40 flex justify-between">
              <span>Health Target: &gt;99.5%</span>
              <span className="text-emerald-500 font-bold">STATUS: COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tracing Timeline Preview / Gateway Node Check */}
      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h4 className="text-xs font-bold">API Routing Mesh Active</h4>
            <p className="text-[10px] opacity-65 font-mono">BGP routers peering dynamically with 3 cloud ingress proxies</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onToast('Core Routing Health Check', 'All peering servers returned HTTP 200 OK.', 'success')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-100'}`}
          >
            Peering Diagnose
          </button>
        </div>
      </div>
    </div>
  );
}
