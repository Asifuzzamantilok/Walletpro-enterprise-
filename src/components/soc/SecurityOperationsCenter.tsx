import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Search, Filter, Lock, Unlock, 
  Activity, Users, Cpu, Coins, CreditCard, ArrowRightLeft, Landmark, Sliders, 
  Globe, TrendingUp, Droplet, BookOpen, MessageSquare, Plus, CheckCircle, 
  FileText, Settings, Clock, Bell, UserPlus, Trash2, Edit3, Check, X,
  FileSpreadsheet, Terminal, BarChart2, Eye, ExternalLink, Network,
  UserCheck, ThumbsUp, HelpCircle, Laptop, Shield, ShieldX, RefreshCw, Send,
  AlertCircle, Download, FileDown, Power, Play, Pause, ChevronRight, CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

import {
  LiveSecurityEvent, SecurityAlert, ThreatIntelIP, ThreatIntelDevice,
  ActiveSession, DeviceRecord, IpRecord, ApiThreatEvent, IncidentRecord,
  VulnerabilityAlert, SecurityPolicy,
  SEED_LIVE_EVENTS, SEED_SECURITY_ALERTS, SEED_THREAT_IPS, SEED_THREAT_DEVICES,
  SEED_ACTIVE_SESSIONS, SEED_DEVICES, SEED_IPS, SEED_API_THREAT_EVENTS,
  SEED_INCIDENTS, SEED_VULNERABILITIES, SEED_POLICIES
} from './socMockData';

interface SecurityOperationsCenterProps {
  activeSubTab: string;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  onSelectTab: (tabId: string) => void;
  isDarkMode?: boolean;
}

export function SecurityOperationsCenter({ activeSubTab, onToast, onSelectTab, isDarkMode = false }: SecurityOperationsCenterProps) {
  // LIVE DATA STATES
  const [liveEvents, setLiveEvents] = useState<LiveSecurityEvent[]>(SEED_LIVE_EVENTS);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(SEED_SECURITY_ALERTS);
  const [threatIps, setThreatIps] = useState<ThreatIntelIP[]>(SEED_THREAT_IPS);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(SEED_ACTIVE_SESSIONS);
  const [devices, setDevices] = useState<DeviceRecord[]>(SEED_DEVICES);
  const [ipsList, setIpsList] = useState<IpRecord[]>(SEED_IPS);
  const [apiThreats, setApiThreats] = useState<ApiThreatEvent[]>(SEED_API_THREAT_EVENTS);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(SEED_INCIDENTS);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityAlert[]>(SEED_VULNERABILITIES);
  const [policies, setPolicies] = useState<SecurityPolicy[]>(SEED_POLICIES);

  // AUDIT EXPLORER STATES
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: "aud-001", timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "Jessica Jones (SecAnalyst)", action: "IP.Block", target: "45.132.22.110", severity: "HIGH", department: "Security", resource: "WAF Boundary", reason: "Automated brute force containment" },
    { id: "aud-002", timestamp: new Date(Date.now() - 7200000).toISOString(), actor: "System Agent", action: "Policy.Enforce", target: "Session Limit", severity: "MEDIUM", department: "Compliance", resource: "IAM Gate", reason: "Re-evaluated active policy variables" }
  ]);

  // SEARCH & FILTER STATES
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // SELECTION & DIALOG STATES
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = useState<boolean>(false);
  
  // NEW INCIDENT STATE
  const [newIncidentTitle, setNewIncidentTitle] = useState('');
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newIncidentPriority, setNewIncidentPriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P1');
  const [newIncidentSystems, setNewIncidentSystems] = useState('');
  const [newIncidentEvidence, setNewIncidentEvidence] = useState('');

  // NEW AUDIT RECORD WRAPPER
  const logAudit = (action: string, target: string, severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', reason: string) => {
    const newAudit = {
      id: `aud-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      actor: "Super Administrator (You)",
      action,
      target,
      severity,
      department: "Security Operations",
      resource: "SOC Panel",
      reason
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // LIVE TELETEMETRY STREAM SIMULATION
  useEffect(() => {
    if (!isStreaming) return;
    const usernames = ["steve.rogers@walletpro.com", "tony.stark@walletpro.com", "natasha.romanoff@walletpro.com", "clint.barton@walletpro.com", "unknown_hacker", "partner_key_9"];
    const roles = ["Platform Administrator", "Security Analyst", "Developer", "Operations Manager", "None"];
    const countries = ["USA", "Ukraine", "China", "Germany", "Brazil", "Netherlands", "Russia"];
    const eventTypes = ["Auth.MFA.Failed", "API.RateLimit.Breached", "DB.Query.AccessDenied", "Auth.SuspiciousLogin", "Policy.BypassAttempt", "API.Key.Revoked"];
    const devicesList = ["iPhone 14 (iOS)", "Dell XPS (Linux/Firefox)", "Corporate Thinkpad (Windows/Chrome)", "Curl Client", "Postman"];
    const severities: ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    const interval = setInterval(() => {
      const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const randomDevice = devicesList[Math.floor(Math.random() * devicesList.length)];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
      
      const newEvt: LiveSecurityEvent = {
        id: `evt-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        severity: randomSeverity,
        eventType: randomType,
        user: randomUser,
        role: randomRole,
        country: randomCountry,
        ipAddress: `${Math.floor(Math.random()*223 + 1)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
        device: randomDevice,
        status: randomSeverity === 'CRITICAL' ? 'BLOCKED' : randomSeverity === 'HIGH' ? 'FLAGGED' : 'ALLOWED',
        correlationId: `corr-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}`,
        details: `Simulated runtime signal evaluation: ${randomType} triggered with ${randomSeverity} alert weight.`
      };

      setLiveEvents(prev => [newEvt, ...prev].slice(0, 100));

      // Occasionally trigger high risk alerts
      if (randomSeverity === 'CRITICAL' || randomSeverity === 'HIGH') {
        const newAlert: SecurityAlert = {
          id: `alt-${Math.floor(100 + Math.random() * 900)}`,
          severity: randomSeverity,
          category: randomType.includes("Auth") ? "Impossible Travel" : "API Threat",
          affectedUser: randomUser,
          affectedResource: "Platform Security Gateway",
          riskScore: randomSeverity === 'CRITICAL' ? Math.floor(90 + Math.random()*10) : Math.floor(75 + Math.random()*15),
          status: "OPEN",
          assignedAnalyst: "Unassigned",
          createdTime: new Date().toISOString(),
          description: `SIEM correlated threat trace detected. ${newEvt.details}`
        };
        setSecurityAlerts(prev => [newAlert, ...prev]);
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // ACTIONS IMPLEMENTATION
  const handleBlockIP = (ip: string, reason = "Manual administrator override constraint") => {
    setIpsList(prev => {
      const existing = prev.find(i => i.ip === ip);
      if (existing) {
        return prev.map(i => i.ip === ip ? { ...i, status: 'BLOCKED' } : i);
      } else {
        return [...prev, { ip, status: 'BLOCKED', asn: 'AS_MANUAL', isp: 'Operator Assigned', country: 'UNKNOWN', vpn: false, tor: false, city: 'Manual' }];
      }
    });
    setThreatIps(prev => prev.map(ti => ti.ipAddress === ip ? { ...ti, status: 'BLOCKED' } : ti));
    logAudit("IP.Block", ip, "HIGH", reason);
    onToast("IP Blocked", `Successfully blacklisted IP address ${ip} at the edge router level.`, "success");
  };

  const handleUnblockIP = (ip: string) => {
    setIpsList(prev => prev.map(i => i.ip === ip ? { ...i, status: 'KNOWN' } : i));
    setThreatIps(prev => prev.map(ti => ti.ipAddress === ip ? { ...ti, status: 'MONITORED' } : ti));
    logAudit("IP.Unblock", ip, "MEDIUM", "Administrative pardon and recovery");
    onToast("IP Unblocked", `Restored network clearance for IP ${ip}.`, "success");
  };

  const handleBlockDevice = (deviceId: string) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'BLOCKED', riskScore: 99 } : d));
    logAudit("Device.Block", deviceId, "HIGH", "Hardware signature blacklisted due to API threats");
    onToast("Device Restricted", `Blocked client signature hashes for device identifier: ${deviceId}.`, "success");
  };

  const handleUnblockDevice = (deviceId: string) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'TRUSTED', riskScore: 10 } : d));
    logAudit("Device.Unblock", deviceId, "MEDIUM", "Hardware signature restored to trust list");
    onToast("Device Cleared", `Restored hardware device signature trust level.`, "success");
  };

  const handleLockAccount = (user: string) => {
    logAudit("Account.Lock", user, "CRITICAL", "Administrative security quarantine");
    onToast("Account Locked", `Operational lock applied. User "${user}" is completely blocked from authenticating.`, "warning");
  };

  const handleUnlockAccount = (user: string) => {
    logAudit("Account.Unlock", user, "HIGH", "Restored standard access privileges");
    onToast("Account Recovered", `User credentials and authorization vectors unquarantined for ${user}.`, "success");
  };

  const handleForcePasswordReset = (user: string) => {
    logAudit("Account.PasswordResetForce", user, "MEDIUM", "Required rotation due to credential compromise");
    onToast("Reset Mail Dispatched", `Sent critical password rotation link and expired all session tokens for ${user}.`, "info");
  };

  const handleTerminateSession = (sessionId: string) => {
    const sess = activeSessions.find(s => s.id === sessionId);
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    if (sess) {
      logAudit("Session.Terminate", sess.user, "HIGH", `Forced token revocation on Session ID: ${sessionId}`);
      onToast("Session Revoked", `Successfully disconnected active token session for ${sess.user}.`, "success");
    }
  };

  const handleTerminateAllSessions = () => {
    const count = activeSessions.length;
    setActiveSessions([]);
    logAudit("Session.TerminateAll", "Global Platform", "CRITICAL", "Emergency security quarantine cascade");
    onToast("Emergency Revocation", `Revoked all ${count} active administrator and user tokens.`, "warning");
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentTitle.trim()) return;

    const newInc: IncidentRecord = {
      id: `inc-${Math.floor(200 + Math.random() * 800)}`,
      title: newIncidentTitle,
      severity: newIncidentSeverity,
      priority: newIncidentPriority,
      status: 'OPEN',
      assignedOwner: "Super Administrator (You)",
      affectedSystems: newIncidentSystems.split(',').map(s => s.trim()).filter(Boolean),
      evidence: newIncidentEvidence.split(',').map(e => e.trim()).filter(Boolean),
      createdTime: new Date().toISOString(),
      timeline: [
        { timestamp: "00:00", note: "SOC Manual Incident Created.", author: "Super Administrator" }
      ]
    };

    setIncidents(prev => [newInc, ...prev]);
    logAudit("Incident.Create", newInc.id, newIncidentSeverity, `Created incident: ${newIncidentTitle}`);
    onToast("Incident Declared", `Incident ${newInc.id} has been opened and assigned to Security team.`, "success");

    // Reset Form
    setNewIncidentTitle('');
    setNewIncidentSystems('');
    setNewIncidentEvidence('');
    setIsCreateIncidentOpen(false);
  };

  const handleEscalateIncident = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const nextPriority = inc.priority === 'P1' ? 'P0' : inc.priority === 'P2' ? 'P1' : 'P0';
        logAudit("Incident.Escalate", incidentId, "CRITICAL", `Priority elevated to ${nextPriority}`);
        onToast("Incident Escalated", `Incident ${incidentId} elevated to priority ${nextPriority}. Escalated notification sent to executive team.`, "warning");
        return {
          ...inc,
          priority: nextPriority,
          timeline: [...inc.timeline, { timestamp: "Just Now", note: `Incident priority escalated to ${nextPriority} by Super Administrator.`, author: "Super Administrator" }]
        };
      }
      return inc;
    }));
  };

  const handleResolveIncident = (incidentId: string, resolutionNotes = "Remediation verified by security staff.") => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        logAudit("Incident.Resolve", incidentId, "MEDIUM", "Resolution verification successful");
        onToast("Incident Resolved", `Incident ${incidentId} marked as RESOLVED. Postmortem queue updated.`, "success");
        return {
          ...inc,
          status: 'RESOLVED',
          resolvedTime: new Date().toISOString(),
          postmortem: resolutionNotes,
          timeline: [...inc.timeline, { timestamp: "Just Now", note: `Incident marked as resolved. Resolution: ${resolutionNotes}`, author: "Super Administrator" }]
        };
      }
      return inc;
    }));
  };

  const handleRemediateVulnerability = (id: string) => {
    setVulnerabilities(prev => prev.map(v => v.id === id ? { ...v, status: 'PATCHED' } : v));
    const vuln = vulnerabilities.find(v => v.id === id);
    logAudit("Vulnerability.Remediate", id, "MEDIUM", `Remediated security issue: ${vuln?.title}`);
    onToast("Vulnerability Patched", `Remediation action verified for "${vuln?.title}". Patch deployed.`, "success");
  };

  // KPI CALCULATIONS FOR DASHBOARD
  const dashboardStats = useMemo(() => {
    const criticalCount = securityAlerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'CLOSED_RESOLVED').length;
    const highCount = securityAlerts.filter(a => a.severity === 'HIGH' && a.status !== 'CLOSED_RESOLVED').length;
    const mediumCount = securityAlerts.filter(a => a.severity === 'MEDIUM' && a.status !== 'CLOSED_RESOLVED').length;
    const lowCount = securityAlerts.filter(a => a.severity === 'LOW' && a.status !== 'CLOSED_RESOLVED').length;

    const failedLoginsToday = liveEvents.filter(e => e.eventType.includes("Failed") || e.eventType.includes("Denied")).length + 12;
    const lockedAccounts = 3;
    const blockedIps = ipsList.filter(i => i.status === 'BLOCKED').length;
    const blockedDevices = devices.filter(d => d.status === 'BLOCKED').length;
    const suspiciousSessions = activeSessions.filter(s => s.status === 'SUSPICIOUS').length;
    const apiThreatsCount = apiThreats.length;
    const activeIncidents = incidents.filter(i => i.status === 'OPEN' || i.status === 'CONTAINED').length;
    const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'POST_MORTEM_COMPLETED').length;

    // Security Score out of 100
    const baseScore = 92;
    const deductions = (criticalCount * 5) + (highCount * 2) + (vulnerabilities.filter(v => v.status === 'OPEN').length * 2);
    const score = Math.max(35, baseScore - deductions);

    return {
      score,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      failedLoginsToday,
      lockedAccounts,
      blockedIps,
      blockedDevices,
      suspiciousSessions,
      apiThreatsCount,
      activeIncidents,
      resolvedIncidents
    };
  }, [securityAlerts, liveEvents, ipsList, devices, activeSessions, apiThreats, incidents, vulnerabilities]);

  // COLOR THEME CONFIGS
  const classes = {
    panelBg: isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-slate-50 text-slate-800 border-slate-200',
    cardBg: isDarkMode ? 'bg-slate-850 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    border: isDarkMode ? 'border-slate-800' : 'border-slate-200',
    headerBg: isDarkMode ? 'bg-slate-850/60' : 'bg-white/60',
    tableHeader: isDarkMode ? 'bg-slate-800/40 text-slate-300' : 'bg-slate-100/60 text-slate-600',
    tableRowHover: isDarkMode ? 'hover:bg-slate-800/25' : 'hover:bg-slate-50',
    inputBg: isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800',
    tabActive: 'border-blue-500 text-blue-500 font-bold',
    tabInactive: 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
  };

  // ALERTS FILTER LOGIC
  const filteredAlerts = useMemo(() => {
    return securityAlerts.filter(alert => {
      const matchSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
      const matchStatus = statusFilter === 'ALL' || alert.status === statusFilter;
      const matchCategory = categoryFilter === 'ALL' || alert.category === categoryFilter;
      const matchQuery = !searchQuery || 
        alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.affectedUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchStatus && matchCategory && matchQuery;
    });
  }, [securityAlerts, severityFilter, statusFilter, categoryFilter, searchQuery]);

  // GEOGRAPHIC ACTIVITY CHARTS SEED
  const geoChartData = [
    { country: 'USA', traffic: 1240, threats: 4, label: 'North America Hub' },
    { country: 'Germany', traffic: 820, threats: 1, label: 'Frankfurt Node' },
    { country: 'Canada', traffic: 450, threats: 2, label: 'Toronto Relay' },
    { country: 'Ukraine', traffic: 320, threats: 15, label: 'Kiev Proxy Range' },
    { country: 'China', traffic: 290, threats: 48, label: 'Hebei Datacenter' },
    { country: 'Brazil', traffic: 180, threats: 8, label: 'Sao Paulo' }
  ];

  const severityColorMap = {
    CRITICAL: 'text-red-500 bg-red-500/10 border-red-500/30',
    HIGH: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    MEDIUM: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    LOW: 'text-slate-400 bg-slate-400/10 border-slate-400/30'
  };

  return (
    <div id="enterprise-soc-workspace" className={`w-full min-h-screen p-6 transition-colors duration-350 ${classes.panelBg} text-left`}>
      
      {/* 1. TOP CONTROL BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6 border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Enterprise Security Operations Center (SOC)</h1>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Real-time multi-dimensional network defense, credential monitoring, and cryptographic trace logs.
          </p>
        </div>

        {/* Action Widgets */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Streaming Toggle */}
          <button 
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              isStreaming 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : 'bg-slate-500/10 border-slate-500/30 text-slate-400'
            }`}
          >
            {isStreaming ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Live Monitoring Active
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                Telemetry Paused
              </>
            )}
          </button>

          {/* Create Incident Override */}
          <button 
            onClick={() => setIsCreateIncidentOpen(true)}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Declare Incident
          </button>
        </div>
      </div>

      {/* 2. SECURITY DASHBOARD SUMMARY */}
      {activeSubTab === 'sec-dashboard' && (
        <div className="space-y-6">
          
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            
            {/* Score Wheel Card */}
            <div className={`col-span-2 p-4 rounded-xl border flex items-center justify-between shadow-xs ${classes.cardBg}`}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Security Score</span>
                <h3 className="text-2xl font-black">{dashboardStats.score}%</h3>
                <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 inline" /> Fully Certified
                </p>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeWidth="3.2" strokeDasharray={`${dashboardStats.score}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">SOC</span>
              </div>
            </div>

            {/* Alert Weight Cards */}
            <div className={`p-4 rounded-xl border shadow-xs ${classes.cardBg}`}>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Critical Threats</span>
              <h3 className={`text-xl font-bold mt-1 ${dashboardStats.criticalCount > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                {dashboardStats.criticalCount}
              </h3>
              <p className="text-[9px] text-slate-400 mt-1">Requires SLA dispatch</p>
            </div>

            <div className={`p-4 rounded-xl border shadow-xs ${classes.cardBg}`}>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">High Risk Trigger</span>
              <h3 className={`text-xl font-bold mt-1 ${dashboardStats.highCount > 0 ? 'text-amber-500' : 'text-slate-500'}`}>
                {dashboardStats.highCount}
              </h3>
              <p className="text-[9px] text-slate-400 mt-1">Correlated trace events</p>
            </div>

            <div className={`p-4 rounded-xl border shadow-xs ${classes.cardBg}`}>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Failed Logins</span>
              <h3 className="text-xl font-bold mt-1 text-slate-700 dark:text-slate-300">
                {dashboardStats.failedLoginsToday}
              </h3>
              <p className="text-[9px] text-red-500 font-semibold mt-1">Today (simulated)</p>
            </div>

            <div className={`p-4 rounded-xl border shadow-xs ${classes.cardBg}`}>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Active Incidents</span>
              <h3 className={`text-xl font-bold mt-1 ${dashboardStats.activeIncidents > 0 ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
                {dashboardStats.activeIncidents}
              </h3>
              <p className="text-[9px] text-slate-400 mt-1">Owner assigned</p>
            </div>

            <div className={`p-4 rounded-xl border shadow-xs ${classes.cardBg}`}>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Blocked Entities</span>
              <h3 className="text-xl font-bold mt-1 text-emerald-500">
                {dashboardStats.blockedIps + dashboardStats.blockedDevices}
              </h3>
              <p className="text-[9px] text-slate-400 mt-1">{dashboardStats.blockedIps} IP / {dashboardStats.blockedDevices} HW</p>
            </div>
          </div>

          {/* Threat trends and distribution charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Live Chart area */}
            <div className={`xl:col-span-2 p-5 rounded-xl border shadow-xs ${classes.cardBg} space-y-4`}>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Threats Historical Trend</h4>
                  <span className="text-[10px] text-slate-400">Assesses incoming attack vectors mapped by hours</span>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-blue-500">
                  REAL-TIME SIEM CORRELATION
                </span>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { hour: '00:00', failed_logins: 4, api_threats: 1, resolved: 0 },
                    { hour: '01:00', failed_logins: 9, api_threats: 2, resolved: 1 },
                    { hour: '02:00', failed_logins: 15, api_threats: 5, resolved: 2 },
                    { hour: '03:00', failed_logins: 32, api_threats: 14, resolved: 4 },
                    { hour: '04:00', failed_logins: 12, api_threats: 3, resolved: 14 },
                    { hour: '05:00', failed_logins: 8, api_threats: 1, resolved: 20 },
                    { hour: '06:00', failed_logins: dashboardStats.failedLoginsToday, api_threats: dashboardStats.apiThreatsCount, resolved: 12 }
                  ]}>
                    <defs>
                      <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="hour" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={10} />
                    <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={10} />
                    <Tooltip contentStyle={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderColor: '#475569' }} />
                    <Area type="monotone" dataKey="failed_logins" name="Failed Logins" stroke="#ef4444" fillOpacity={1} fill="url(#failedGrad)" />
                    <Area type="monotone" dataKey="api_threats" name="API Threats" stroke="#f59e0b" fillOpacity={1} fill="url(#apiGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Severity Distribution Pie and Threat Indicators */}
            <div className={`p-5 rounded-xl border shadow-xs ${classes.cardBg} flex flex-col justify-between`}>
              <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Threat Indicators Weights</h4>
                <p className="text-[10px] text-slate-400">Current active payload security categories</p>
              </div>

              <div className="h-40 my-4 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Critical', value: dashboardStats.criticalCount, color: '#ef4444' },
                        { name: 'High', value: dashboardStats.highCount, color: '#f59e0b' },
                        { name: 'Medium', value: dashboardStats.mediumCount, color: '#3b82f6' },
                        { name: 'Low', value: dashboardStats.lowCount, color: '#94a3b8' }
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {SEED_SECURITY_ALERTS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#3b82f6', '#94a3b8'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-500">
                  CRITICAL: {dashboardStats.criticalCount}
                </div>
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  HIGH: {dashboardStats.highCount}
                </div>
                <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500">
                  MEDIUM: {dashboardStats.mediumCount}
                </div>
                <div className="p-2 rounded bg-slate-500/10 border border-slate-500/20 text-slate-500">
                  LOW: {dashboardStats.lowCount}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Threat Intel Status and policies checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-xl border ${classes.cardBg} space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Network className="w-4 h-4 text-blue-500" /> Active Threat Intelligence status
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold">Malicious IP Feeds</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    Connected & Synchronized
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold">Brute-Force Subnet DB</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    Active (Cloudflare/AWS feed)
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold">VPN/Tor Detection Nodes</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    99.8% Geo Integrity
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${classes.cardBg} space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Administrative Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button 
                  onClick={() => handleTerminateAllSessions()}
                  className="p-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-center transition-all cursor-pointer shadow-sm"
                >
                  Force Logout All Staff
                </button>
                <button 
                  onClick={() => {
                    const ipToBlock = prompt("Enter IP Address to blacklist globally:");
                    if (ipToBlock) handleBlockIP(ipToBlock);
                  }}
                  className="p-2.5 border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-500 font-bold rounded-lg text-center transition-all cursor-pointer"
                >
                  Blacklist IP Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LIVE SECURITY EVENTS */}
      {activeSubTab === 'sec-events' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Security Event Telemetry</h3>
              <p className="text-[10px] text-slate-400">High-frequency streams originating from the platform's proxy and API gateways. Select rows to audit payloads.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-slate-400">Streaming Speed: 9s</span>
              <button 
                onClick={() => setLiveEvents(SEED_LIVE_EVENTS)}
                className="px-2 py-1 text-[10px] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-semibold cursor-pointer"
              >
                Clear/Reset Stream
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`${classes.tableHeader} font-bold uppercase text-[9px] tracking-wider`}>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Device</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Correlation ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {liveEvents.map(evt => (
                    <tr key={evt.id} className={`${classes.tableRowHover} transition-all`}>
                      <td className="py-3 px-4 text-[10px] font-mono text-slate-400">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${severityColorMap[evt.severity]}`}>
                          {evt.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-blue-500 dark:text-blue-400">{evt.eventType}</td>
                      <td className="py-3 px-4 font-bold">{evt.user}</td>
                      <td className="py-3 px-4 text-slate-400 text-[10px]">{evt.role}</td>
                      <td className="py-3 px-4 font-bold text-[10px]">{evt.country}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">{evt.ipAddress}</td>
                      <td className="py-3 px-4 truncate max-w-xs text-slate-400 text-[10px]" title={evt.device}>{evt.device}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                          evt.status === 'ALLOWED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          evt.status === 'BLOCKED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{evt.correlationId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECURITY ALERTS */}
      {activeSubTab === 'sec-alerts' && (
        <div className="space-y-4">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Correlated Threat Alerts Grid</h3>
              <p className="text-[10px] text-slate-400">Investigate aggregated and scored threat patterns requiring direct administrative override.</p>
            </div>

            {/* Filter Widgets */}
            <div className="flex flex-wrap gap-2 text-xs">
              <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className={`p-1.5 rounded-lg border font-semibold outline-none ${classes.inputBg}`}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High Only</option>
                <option value="MEDIUM">Medium Only</option>
                <option value="LOW">Low Only</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`p-1.5 rounded-lg border font-semibold outline-none ${classes.inputBg}`}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open Only</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="ESCALATED">Escalated</option>
                <option value="CLOSED_RESOLVED">Closed Resolved</option>
              </select>

              <input 
                type="text"
                placeholder="Search alerts (e.g. user, ID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border outline-none text-xs ${classes.inputBg}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Alerts Table (2/3) */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`${classes.tableHeader} font-bold uppercase text-[9px] tracking-wider`}>
                      <th className="py-3 px-4">Alert ID</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Affected User</th>
                      <th className="py-3 px-4">Risk Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Assigned Analyst</th>
                      <th className="py-3 px-4">Created Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {filteredAlerts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-mono">
                          No alerts match search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAlerts.map(alert => {
                        const isSelected = selectedAlert?.id === alert.id;
                        return (
                          <tr 
                            key={alert.id}
                            onClick={() => setSelectedAlert(alert)}
                            className={`${classes.tableRowHover} cursor-pointer transition-all ${
                              isSelected ? 'bg-blue-500/10 border-l-2 border-l-blue-600' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono text-slate-400">{alert.id}</td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${severityColorMap[alert.severity]}`}>
                                {alert.severity}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold">{alert.category}</td>
                            <td className="py-3.5 px-4 truncate max-w-[120px]" title={alert.affectedUser}>{alert.affectedUser}</td>
                            <td className="py-3.5 px-4 font-mono text-xs text-red-500 font-bold">{alert.riskScore}</td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                                alert.status === 'OPEN' ? 'bg-red-500/10 text-red-500' :
                                alert.status === 'INVESTIGATING' ? 'bg-amber-500/10 text-amber-500' :
                                alert.status === 'ESCALATED' ? 'bg-purple-500/10 text-purple-500' :
                                'bg-slate-400/10 text-slate-500'
                              }`}>
                                {alert.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 text-[10px]">{alert.assignedAnalyst}</td>
                            <td className="py-3.5 px-4 text-slate-400 text-[10px]">
                              {new Date(alert.createdTime).toLocaleTimeString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Alert Action Panel (1/3) */}
            <div className="xl:col-span-1">
              {selectedAlert ? (
                <div className={`p-5 rounded-xl border shadow-sm space-y-4 text-xs font-semibold ${classes.cardBg}`}>
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Trace: {selectedAlert.id}</span>
                      <h4 className="font-bold text-slate-800 dark:text-white">Alert Investigation</h4>
                    </div>
                    <button 
                      onClick={() => setSelectedAlert(null)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-100/50 dark:bg-slate-800 p-3 rounded-lg space-y-2 text-left">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Threat Category</span>
                        <span className="text-slate-700 dark:text-slate-300 block font-bold text-sm">{selectedAlert.category}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Affected Target Resource</span>
                        <span className="text-slate-600 dark:text-slate-400 block font-mono text-[10px]">{selectedAlert.affectedResource}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Assigned Analyst</span>
                        <span className="text-slate-700 dark:text-slate-300 block">{selectedAlert.assignedAnalyst}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-500 rounded text-left">
                      <span className="text-[9px] uppercase font-bold text-red-400 block">Threat Diagnostic Payload</span>
                      <p className="mt-1 leading-relaxed text-[11px] font-medium">
                        "{selectedAlert.description}"
                      </p>
                    </div>

                    {/* Operational Action Controls */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-left">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Administrative Remediation</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <button 
                          onClick={() => handleLockAccount(selectedAlert.affectedUser)}
                          className="p-2.5 bg-red-600 text-white font-bold rounded-lg text-center hover:bg-red-700 cursor-pointer"
                        >
                          Lock Account
                        </button>
                        <button 
                          onClick={() => handleForcePasswordReset(selectedAlert.affectedUser)}
                          className="p-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-lg text-center cursor-pointer"
                        >
                          Reset Password
                        </button>
                      </div>

                      <div className="pt-2">
                        <button 
                          onClick={() => {
                            setSecurityAlerts(prev => prev.map(a => a.id === selectedAlert.id ? { ...a, status: 'CLOSED_RESOLVED', assignedAnalyst: 'Super Administrator' } : a));
                            setSelectedAlert(null);
                            onToast("Alert Closed", "Threat vector evaluated as mitigated. Record marked resolved.", "success");
                          }}
                          className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-center cursor-pointer shadow-xs"
                        >
                          Mark Resolved (Benign)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-400 text-xs font-semibold h-64 flex flex-col justify-center items-center">
                  <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                  Select an threat alert from the grid to re-evaluate edge policies, lock active accounts, or dispatch containment tasks.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. THREAT INTELLIGENCE */}
      {activeSubTab === 'sec-threat' && (
        <div className="space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Threat Intelligence & Threat Feed Feeder</h3>
            <p className="text-[10px] text-slate-400">Aggregated corporate honey-pots and global administrative IP blocking directories.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Known Malicious IPs */}
            <div className={`p-4 rounded-xl border ${classes.cardBg} space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-red-500" /> Edge-Blacklisted Network IP Anchors
              </h4>

              <div className="space-y-2">
                {threatIps.map(ti => (
                  <div key={ti.ipAddress} className="flex justify-between items-center p-3 rounded bg-slate-100/50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-xs">
                    <div>
                      <span className="font-mono font-bold block">{ti.ipAddress}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{ti.isp} ({ti.country})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-red-500">Threat: {ti.threatScore}%</span>
                      {ti.status === 'BLOCKED' ? (
                        <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/30 px-2 py-0.5 rounded font-bold">
                          BLOCKED
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleBlockIP(ti.ipAddress, `Threat Intel auto-match validation category: ${ti.category}`)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[9px] cursor-pointer"
                        >
                          Enforce Block
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Known Suspicious Devices / Agents */}
            <div className={`p-4 rounded-xl border ${classes.cardBg} space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-amber-500" /> Tracked Malicious Hardware Signatures
              </h4>

              <div className="space-y-2">
                {SEED_THREAT_DEVICES.map(td => (
                  <div key={td.deviceId} className="flex justify-between items-center p-3 rounded bg-slate-100/50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-xs">
                    <div>
                      <span className="font-mono font-bold block truncate max-w-xs">{td.deviceFingerprint}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{td.os} • {td.browser}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-500">Score: {td.threatScore}%</span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                        {td.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. LOGIN MONITORING */}
      {activeSubTab === 'sec-logins' && (
        <div className="space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Staff & Customer Authentication Integrity</h3>
            <p className="text-[10px] text-slate-400">Evaluates credential stuffing heuristics, geofencing discrepancies, and brute force thresholds.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Brute Force Audit Indicators */}
            <div className={`p-4 rounded-xl border ${classes.cardBg} space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Brute Force / Password Spray</h4>
              
              <div className="space-y-2">
                <div className="p-3 rounded bg-red-500/5 border border-red-500/20 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-red-500">Multiple Failed Attempts</span>
                    <span className="font-mono font-bold">14 Trials</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Target: bruce.wayne@walletpro.com. Subnet blocks applied automatically.</p>
                </div>
                
                <div className="p-3 rounded bg-slate-100/50 dark:bg-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Password Spray Check</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">
                      Compliant
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Evaluated 50 login gateways across 4 subnets. Standard deviation within bounds.</p>
                </div>
              </div>
            </div>

            {/* Impossible Travel indicators */}
            <div className={`p-4 rounded-xl border ${classes.cardBg} space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Impossible Travel Telemetry</h4>
              
              <div className="p-3 rounded bg-red-500/5 border border-red-500/20 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-red-500 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Geo-Velocity Breach Active</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  User john.doe@walletpro.com verified token activity in Toronto, Canada and Kiev, Ukraine within 15 minutes. Travel is physically impossible.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleLockAccount("john.doe@walletpro.com")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1 rounded text-[10px] cursor-pointer"
                  >
                    Lock Account
                  </button>
                  <button 
                    onClick={() => handleForcePasswordReset("john.doe@walletpro.com")}
                    className="flex-1 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold py-1 rounded cursor-pointer"
                  >
                    Force Password Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Concurrent Sessions */}
            <div className={`p-4 rounded-xl border ${classes.cardBg} space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Concurrent / Multiple Sessions</h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded bg-slate-100/50 dark:bg-slate-800">
                  <div>
                    <span className="font-bold block">tony.stark@walletpro.com</span>
                    <span className="text-[9px] text-slate-400">2 Active devices (iPad Pro, macOS Safari)</span>
                  </div>
                  <span className="text-[9px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded font-bold">
                    Monitored
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded bg-slate-100/50 dark:bg-slate-800">
                  <div>
                    <span className="font-bold block">sarah.connor@walletpro.com</span>
                    <span className="text-[9px] text-slate-400">1 Active device</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    Safe
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. SESSION MONITORING */}
      {activeSubTab === 'sec-sessions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Console & API Authentication Tokens</h3>
              <p className="text-[10px] text-slate-400">Revoke live access privileges, track token usage timelines, and quarantine credentials.</p>
            </div>
            
            <button 
              onClick={() => handleTerminateAllSessions()}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-all"
            >
              Force Logout All Staff Sessions
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Session Grid (2/3) */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`${classes.tableHeader} font-bold uppercase text-[9px] tracking-wider`}>
                      <th className="py-3 px-4">Session Hash</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-4">Risk Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {activeSessions.map(sess => (
                      <tr 
                        key={sess.id}
                        onClick={() => setSelectedSession(sess)}
                        className={`${classes.tableRowHover} cursor-pointer transition-all ${
                          selectedSession?.id === sess.id ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-slate-400">{sess.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold">{sess.user}</span>
                            <span className="text-[9px] text-slate-400">{sess.role}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">{sess.ipAddress}</td>
                        <td className="py-3 px-4 text-slate-400 text-[10px]">{sess.device} ({sess.os})</td>
                        <td className="py-3 px-4">
                          <span className={`font-mono text-xs font-bold ${sess.riskScore > 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {sess.riskScore}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                            sess.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' :
                            sess.status === 'SUSPICIOUS' ? 'bg-amber-500/10 text-amber-500 animate-pulse' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {sess.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTerminateSession(sess.id);
                            }}
                            className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Session Timeline (1/3) */}
            <div className="xl:col-span-1">
              {selectedSession ? (
                <div className={`p-5 rounded-xl border shadow-sm space-y-4 text-xs font-semibold ${classes.cardBg}`}>
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Token: {selectedSession.id}</span>
                      <h4 className="font-bold text-slate-800 dark:text-white">Active Session timeline</h4>
                    </div>
                    <button 
                      onClick={() => setSelectedSession(null)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800 p-2.5 rounded">
                      <div><span className="text-[10px] text-slate-400 font-bold uppercase">Browser:</span> {selectedSession.browser}</div>
                      <div><span className="text-[10px] text-slate-400 font-bold uppercase">Location:</span> {selectedSession.country}</div>
                      <div><span className="text-[10px] text-slate-400 font-bold uppercase">Token Age:</span> {new Date(selectedSession.createdTime).toLocaleTimeString()}</div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Audit Trail Checklist</span>
                      
                      <div className="border-l border-slate-200 dark:border-slate-700 ml-1.5 pl-3.5 space-y-3">
                        {selectedSession.timeline.map((item, idx) => (
                          <div key={idx} className="relative text-[11px]">
                            <div className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                            <span className="font-mono text-slate-400 text-[10px]">{item.time}</span>
                            <p className="text-slate-700 dark:text-slate-300 font-bold">{item.action}</p>
                            <span className="text-slate-400 text-[9px]">{item.location}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-400 text-xs font-semibold h-64 flex flex-col justify-center items-center">
                  <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                  Select an active token from the grid to audit step-by-step transaction pathways, location velocity, and device metrics.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. DEVICE MONITORING */}
      {activeSubTab === 'sec-devices' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Device Fingerprinting & Signature Integrity</h3>
            <p className="text-[10px] text-slate-400">Block unauthorized browsers, inspect canvas fingerprints, and audit user hardware compliance logs.</p>
          </div>

          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`${classes.tableHeader} font-bold uppercase text-[9px] tracking-wider`}>
                    <th className="py-3 px-4">Device Reference ID</th>
                    <th className="py-3 px-4">Canvas Fingerprint Hash</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Operating System</th>
                    <th className="py-3 px-4">Browser Client</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Trust Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {devices.map(dev => (
                    <tr key={dev.id} className={`${classes.tableRowHover} transition-all`}>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{dev.id}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] truncate max-w-xs">{dev.fingerprint}</td>
                      <td className="py-3.5 px-4 font-bold">{dev.user}</td>
                      <td className="py-3.5 px-4 text-slate-400">{dev.os}</td>
                      <td className="py-3.5 px-4 text-slate-400">{dev.browser}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-red-500">{dev.riskScore}%</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                          dev.status === 'TRUSTED' ? 'bg-emerald-500/10 text-emerald-500' :
                          dev.status === 'UNKNOWN' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {dev.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {dev.status === 'BLOCKED' ? (
                          <button 
                            onClick={() => handleUnblockDevice(dev.id)}
                            className="bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-500 font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleBlockDevice(dev.id)}
                            className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer"
                          >
                            Block Device
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. IP INTELLIGENCE */}
      {activeSubTab === 'sec-ips' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">IP Intelligence & Edge Whitelists</h3>
              <p className="text-[10px] text-slate-400">Assess VPN proxy nodes, TOR egress relays, and Autonomous System Numbers (ASN).</p>
            </div>
            
            <button 
              onClick={() => {
                const manualIp = prompt("Enter IP to Add to Allowlist:");
                if (manualIp) {
                  setIpsList(prev => [...prev, { ip: manualIp, status: 'ALLOWLISTED', asn: 'AS_MANUAL', isp: 'Admin Override', country: 'USA', vpn: false, tor: false, city: 'Manual' }]);
                  logAudit("IP.Allowlist", manualIp, "MEDIUM", "Manual administration override");
                  onToast("IP Allowlisted", `IP address ${manualIp} has been added to the bypass list.`, "success");
                }
              }}
              className="px-3 py-1.5 border border-emerald-500 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/15 text-xs font-bold rounded-lg cursor-pointer transition-all"
            >
              Add IP to Allowlist
            </button>
          </div>

          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`${classes.tableHeader} font-bold uppercase text-[9px] tracking-wider`}>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">ASN Registry</th>
                    <th className="py-3 px-4">ISP / Carrier</th>
                    <th className="py-3 px-4">Geo-Location</th>
                    <th className="py-3 px-4">VPN Detected</th>
                    <th className="py-3 px-4">Tor Egress Exit</th>
                    <th className="py-3 px-4">Firewall Rules</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {ipsList.map(ipRecord => (
                    <tr key={ipRecord.ip} className={`${classes.tableRowHover} transition-all`}>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-500 dark:text-blue-400">{ipRecord.ip}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{ipRecord.asn}</td>
                      <td className="py-3.5 px-4">{ipRecord.isp}</td>
                      <td className="py-3.5 px-4 font-bold">{ipRecord.city}, {ipRecord.country}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                          ipRecord.vpn ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {ipRecord.vpn ? 'TRUE (VPN)' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                          ipRecord.tor ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {ipRecord.tor ? 'TRUE (TOR)' : 'FALSE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                          ipRecord.status === 'ALLOWLISTED' ? 'bg-emerald-500/10 text-emerald-500' :
                          ipRecord.status === 'BLOCKED' ? 'bg-red-500/10 text-red-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {ipRecord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium">
                        {ipRecord.status === 'BLOCKED' ? (
                          <button 
                            onClick={() => handleUnblockIP(ipRecord.ip)}
                            className="bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-500 font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                          >
                            Unblock IP
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleBlockIP(ipRecord.ip)}
                            className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                          >
                            Block IP
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 10. GEO ACTIVITY */}
      {activeSubTab === 'sec-geo' && (
        <div className="space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Geo-Velocity & Geo-Fencing Logs</h3>
            <p className="text-[10px] text-slate-400">Enforce spatial-temporal access policies and audit compliance with international sanction lists.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Geo Distribution table (2/3) */}
            <div className={`xl:col-span-2 p-5 rounded-xl border ${classes.cardBg} space-y-4`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Global traffic distributions (Heuristics)</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-semibold">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[9px] uppercase">
                      <th className="py-2.5 px-2">Geographic Node</th>
                      <th className="py-2.5 px-2">Relative Coordinates</th>
                      <th className="py-2.5 px-2">Active Sessions</th>
                      <th className="py-2.5 px-2">Anomalous Signatures</th>
                      <th className="py-2.5 px-2 text-right">Risk Factor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {geoChartData.map(g => (
                      <tr key={g.country} className={`${classes.tableRowHover} transition-all`}>
                        <td className="py-3 px-2 flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-bold">{g.country}</span>
                        </td>
                        <td className="py-3 px-2 font-mono text-slate-400 text-[10px]">{g.label}</td>
                        <td className="py-3 px-2 font-mono">{g.traffic}</td>
                        <td className="py-3 px-2 font-mono text-red-500 font-bold">{g.threats}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                            g.threats > 20 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {g.threats > 20 ? 'HIGH THREAT' : 'COMPLIANT'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Geo policies summary */}
            <div className={`p-5 rounded-xl border ${classes.cardBg} flex flex-col justify-between`}>
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Geofencing Rules</h4>
                <p className="text-[10px] text-slate-400">Restricts requests routing outside permitted parameters</p>
              </div>

              <div className="p-3 bg-slate-100/50 dark:bg-slate-800 rounded border border-slate-200/50 dark:border-slate-700 text-xs space-y-2 my-4 text-left">
                <div className="flex justify-between items-center">
                  <span>Sanctioned Country Block</span>
                  <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.2 rounded font-bold">
                    ALWAYS ON
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Manual Ukraine override whitelist</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.2 rounded font-bold">
                    EXEMPT (Support team)
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-700">
                  Compliance warning: Any modifications to spatial rules triggers an administrative maker-checker signature requirement.
                </p>
              </div>

              <button 
                onClick={() => {
                  onToast("Heuristics Check", "Completed a full coordinate cross-validation audit. All sessions verified.", "info");
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
              >
                Trigger Heuristic Recertification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. API SECURITY */}
      {activeSubTab === 'sec-api' && (
        <div className="space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">API Gateway Sentinel & Throttling Metrics</h3>
            <p className="text-[10px] text-slate-400">Detect unauthorized scopes, rate limiting breaches, and compromised partner credentials.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Live API threat grid */}
            <div className={`p-4 rounded-xl border ${classes.cardBg} space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-red-500" /> API gateway threat logs
              </h4>

              <div className="space-y-2">
                {apiThreats.map(ae => (
                  <div key={ae.id} className="p-3 rounded bg-slate-100/50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-xs text-left space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold block text-red-500">{ae.errorType}</span>
                        <span className="text-[9px] text-slate-400 font-mono font-semibold">{ae.endpoint} • Key ID: {ae.apiKeyId}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                        ae.status === 'BLOCKED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {ae.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>IP Address: {ae.ipAddress}</span>
                      <span>{new Date(ae.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Key Health */}
            <div className={`p-4 rounded-xl border ${classes.cardBg} space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-500" /> Active API Keys (Audit)
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="font-bold block font-mono">key_partner_prod_84a</span>
                    <span className="text-[9px] text-slate-400">Associated Owner: Stripe Settlement Relay</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    Safe (1,240 calls/m)
                  </span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded bg-slate-50 dark:bg-slate-800">
                  <div>
                    <span className="font-bold block font-mono">key_dev_sandbox_771x</span>
                    <span className="text-[9px] text-slate-400">Associated Owner: Alex Mercer (Sandbox Dev)</span>
                  </div>
                  <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                    Throttled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. INCIDENT MANAGEMENT */}
      {activeSubTab === 'sec-incidents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise Incident Command Center</h3>
              <p className="text-[10px] text-slate-400">Initiate SLA containment timers, assign incident commanders, and compile postmortem diagnostics.</p>
            </div>
            
            <button 
              onClick={() => setIsCreateIncidentOpen(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-all"
            >
              Declare Security Incident
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Incidents Table (2/3) */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`${classes.tableHeader} font-bold uppercase text-[9px] tracking-wider`}>
                      <th className="py-3 px-4">Incident ID</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Incident Title</th>
                      <th className="py-3 px-4">Assigned Commander</th>
                      <th className="py-3 px-4">Affected Systems</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {incidents.map(inc => (
                      <tr 
                        key={inc.id}
                        onClick={() => setSelectedIncident(inc)}
                        className={`${classes.tableRowHover} cursor-pointer transition-all ${
                          selectedIncident?.id === inc.id ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-slate-400">{inc.id}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold border ${
                            inc.priority === 'P0' ? 'bg-red-600 text-white border-red-700' :
                            inc.priority === 'P1' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {inc.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">{inc.title}</td>
                        <td className="py-3 px-4">{inc.assignedOwner}</td>
                        <td className="py-3 px-4 truncate max-w-[150px]" title={inc.affectedSystems.join(', ')}>
                          {inc.affectedSystems.join(', ') || 'Global'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                            inc.status === 'OPEN' ? 'bg-red-500/10 text-red-500 animate-pulse' :
                            inc.status === 'CONTAINED' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEscalateIncident(inc.id);
                              }}
                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                            >
                              Escalate
                            </button>
                            {inc.status !== 'RESOLVED' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResolveIncident(inc.id);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer shadow-xs"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Incident Details Card (1/3) */}
            <div className="xl:col-span-1">
              {selectedIncident ? (
                <div className={`p-5 rounded-xl border shadow-sm space-y-4 text-xs font-semibold ${classes.cardBg}`}>
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Incident ID: {selectedIncident.id}</span>
                      <h4 className="font-bold text-slate-800 dark:text-white">Active Timeline Check</h4>
                    </div>
                    <button 
                      onClick={() => setSelectedIncident(null)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800 p-2.5 rounded">
                      <div><strong className="text-slate-400">Commander:</strong> {selectedIncident.assignedOwner}</div>
                      <div><strong className="text-slate-400">Severity:</strong> {selectedIncident.severity}</div>
                      <div><strong className="text-slate-400">Affected Node:</strong> {selectedIncident.affectedSystems.join(', ') || 'N/A'}</div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Incident Timelines Log</span>
                      <div className="border-l border-slate-200 dark:border-slate-700 ml-1.5 pl-3.5 space-y-3">
                        {selectedIncident.timeline.map((item, idx) => (
                          <div key={idx} className="relative text-[11px]">
                            <div className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-red-500" />
                            <span className="font-mono text-slate-400 text-[10px]">{item.timestamp}</span>
                            <p className="text-slate-700 dark:text-slate-300 font-bold">{item.note}</p>
                            <span className="text-slate-400 text-[9px]">Author: {item.author}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedIncident.postmortem && (
                      <div className="p-2.5 bg-blue-500/5 border border-blue-500/20 text-slate-300 rounded">
                        <span className="text-[9px] uppercase font-bold block text-blue-400">Mitigation & Postmortem</span>
                        <p className="mt-1 leading-relaxed text-[11px] text-slate-600 dark:text-slate-400 font-medium">"{selectedIncident.postmortem}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-400 text-xs font-semibold h-64 flex flex-col justify-center items-center">
                  <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                  Select an active incident from the list to view diagnostic timelines, add evidence logs, or re-evaluate containment workflows.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 13. AUDIT EXPLORER */}
      {activeSubTab === 'sec-audit' && (
        <div className="space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Global Cryptographic Security Audit Explorer</h3>
            <p className="text-[10px] text-slate-400">Deep searching of admin actions, WAF blocks, and credential lifecycle adjustments.</p>
          </div>

          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`${classes.tableHeader} font-bold uppercase text-[9px] tracking-wider`}>
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Administrative Actor</th>
                    <th className="py-3 px-4">Action Signature</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Administrative Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {auditLogs.map(log => (
                    <tr key={log.id} className={`${classes.tableRowHover} transition-all`}>
                      <td className="py-3 px-4 font-mono text-slate-400">{log.id}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="py-3 px-4 font-bold">{log.actor}</td>
                      <td className="py-3 px-4 font-mono text-blue-500 dark:text-blue-400">{log.action}</td>
                      <td className="py-3 px-4 font-bold">{log.target}</td>
                      <td className="py-3 px-4 text-slate-400 text-[10px]">{log.department}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                          log.severity === 'HIGH' || log.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 truncate max-w-xs text-slate-400 font-medium italic" title={log.reason}>
                        "{log.reason}"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 14. VULNERABILITY CENTER */}
      {activeSubTab === 'sec-vuln' && (
        <div className="space-y-6 text-left">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vulnerability and Security Recommendations</h3>
            <p className="text-[10px] text-slate-400">Review package dependencies CVE advisories, SSL certificates lifecycle and active directory missing security policies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vulnerabilities.map(vul => (
              <div key={vul.id} className={`p-5 rounded-xl border flex flex-col justify-between shadow-xs ${classes.cardBg}`}>
                <div>
                  <div className="flex justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 font-bold">{vul.id} • {vul.category}</span>
                      <h4 className="text-xs font-bold mt-0.5">{vul.title}</h4>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border ${severityColorMap[vul.severity]}`}>
                      {vul.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {vul.description}
                  </p>

                  <div className="bg-slate-100/50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/50 dark:border-slate-700/50 mb-4 text-xs font-semibold">
                    <span className="text-[9px] uppercase font-bold text-blue-500 block">Recommended Patch Action</span>
                    <p className="mt-1 leading-normal text-slate-700 dark:text-slate-300">{vul.recommendation}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-mono font-bold">{vul.remediationSLA}</span>
                  {vul.status === 'PATCHED' ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                      RESOLVED
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleRemediateVulnerability(vul.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded cursor-pointer shadow-sm transition-all text-[10px]"
                    >
                      Remediate & Patch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15. SECURITY POLICIES */}
      {activeSubTab === 'sec-policies' && (
        <div className="space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Policies & Global Enforcements</h3>
            <p className="text-[10px] text-slate-400">Manage session absolute timeouts, hardware MFA credentials requirements, and API edge restrictions rules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {policies.map(pol => (
              <div key={pol.id} className={`p-4 rounded-xl border flex flex-col justify-between ${classes.cardBg}`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 font-bold font-mono">{pol.category} Policy Control</span>
                      <h4 className="font-bold text-sm mt-0.5">{pol.name}</h4>
                    </div>
                    
                    {/* Toggle button */}
                    <button 
                      onClick={() => {
                        const nextStatus = pol.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
                        setPolicies(prev => prev.map(p => p.id === pol.id ? { ...p, status: nextStatus } : p));
                        logAudit("Policy.Toggle", pol.name, "HIGH", `Flipped policy enforcement status to ${nextStatus}`);
                        onToast("Policy Updated", `Policy ${pol.name} set to ${nextStatus}. Applied immediately.`, nextStatus === 'ENABLED' ? 'success' : 'warning');
                      }}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        pol.status === 'ENABLED' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-750'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        pol.status === 'ENABLED' ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <p className="text-slate-400 text-[11px] leading-relaxed">{pol.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 uppercase font-bold">Policy Setting Payload:</span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded font-bold">
                    {pol.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 16. SECURITY REPORTS */}
      {activeSubTab === 'sec-reports' && (
        <div className="space-y-6 text-left">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Reports & Compliance PDF Exporter</h3>
            <p className="text-[10px] text-slate-400">Generate cryptographically verified compliance reports for PCI-DSS, SOC2, and AML audits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Daily Security Operations Report", code: "REP-DAILY", type: "SIEM Heuristics Log", desc: "Correlates failed login rates, blocked IP events, and incident timelines for the past 24 hours." },
              { title: "Weekly PCI-DSS Compliance Summary", code: "REP-WEEKLY", type: "Credential Protection audit", desc: "Audits hardware key MFA compliance ratios, reverse proxy certificate status, and WAF protection indicators." },
              { title: "Monthly SOC-2 Security Operations Audit", code: "REP-MONTHLY", type: "Enterprise Governance Report", desc: "Detailed records of all administrative dual-signature maker-checker approvals and session revocations logs." },
              { title: "Failed Login & Brute Heuristics Export", code: "REP-LOGINS", type: "Authentication Security Log", desc: "Aggregated password spray attempts and impossible travel telemetry anomalies mapped geographically." },
              { title: "Security Incident Resolution Postmortem Bundle", code: "REP-INCIDENTS", type: "Mitigation Archive Log", desc: "Assembles P0-P1 incident timelines, evidence attachments, and remediation verification statements." },
              { title: "Quarterly Access Certification Log", code: "REP-AUDIT", type: "IAM Entitlements Campaign", desc: "A detailed breakdown of staff role recertifications and revoked privilege compliance campaigns." }
            ].map((rep, idx) => (
              <div key={idx} className={`p-5 rounded-xl border flex flex-col justify-between shadow-xs ${classes.cardBg}`}>
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-blue-500 dark:text-blue-400 uppercase">{rep.type}</span>
                  <h4 className="font-bold text-xs">{rep.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{rep.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-mono text-[10px] text-slate-400">{rep.code}</span>
                  <button 
                    onClick={() => {
                      logAudit("Report.Download", rep.code, "LOW", `Exported document template: ${rep.title}`);
                      onToast("Report Exported", `Report ${rep.code} has been successfully downloaded as a cryptographically signed JSON/CSV template.`, "success");
                    }}
                    className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-[10px] px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 cursor-pointer transition-all shadow-xs"
                  >
                    <Download className="w-3 h-3" />
                    Download JSON / PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 17. DECLARE INCIDENT DIALOG / MODAL */}
      {isCreateIncidentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateIncident} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full p-6 text-left space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-red-600 dark:text-red-500">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Declare New Security Incident</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsCreateIncidentOpen(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Incident Title / Classification</label>
                <input 
                  type="text"
                  required
                  placeholder="E.g., Production database credential compromise attempt"
                  value={newIncidentTitle}
                  onChange={(e) => setNewIncidentTitle(e.target.value)}
                  className="w-full p-2.5 border rounded outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white font-semibold"
                />
              </div>

              {/* Priority & Severity row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Severity Level</label>
                  <select 
                    value={newIncidentSeverity}
                    onChange={(e: any) => setNewIncidentSeverity(e.target.value)}
                    className="w-full p-2.5 border rounded outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white font-semibold"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SLA SLA Priority</label>
                  <select 
                    value={newIncidentPriority}
                    onChange={(e: any) => setNewIncidentPriority(e.target.value)}
                    className="w-full p-2.5 border rounded outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white font-semibold"
                  >
                    <option value="P0">P0 (Emergency Call)</option>
                    <option value="P1">P1 (Immediate Containment)</option>
                    <option value="P2">P2 (SLA 4 Hours)</option>
                    <option value="P3">P3 (Routine Audit)</option>
                  </select>
                </div>
              </div>

              {/* Affected Systems & Evidence */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Affected Systems (comma separated)</label>
                  <input 
                    type="text"
                    placeholder="E.g., PostgreSQL Cluster, WAF Node"
                    value={newIncidentSystems}
                    onChange={(e) => setNewIncidentSystems(e.target.value)}
                    className="w-full p-2.5 border rounded outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Evidence Files / IP Hashes</label>
                  <input 
                    type="text"
                    placeholder="E.g., IP: 45.132.22.x, cert_expiry"
                    value={newIncidentEvidence}
                    onChange={(e) => setNewIncidentEvidence(e.target.value)}
                    className="w-full p-2.5 border rounded outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white font-semibold"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateIncidentOpen(false)}
                  className="px-4 py-2 border rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-sm cursor-pointer"
                >
                  Initiate Incident Containment
                </button>
              </div>

            </div>
          </form>
        </div>
      )}

    </div>
  );
}
