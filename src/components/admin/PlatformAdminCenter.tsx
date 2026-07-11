import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sliders, Settings, ToggleLeft, FileText, Coins, CreditCard, Percent, 
  RefreshCw, DollarSign, Globe, Bell, Mail, MessageSquare, Send, 
  Palette, Languages, Calendar, Activity, HardDrive, ShieldCheck, 
  HeartPulse, Server, Terminal, AlertTriangle, GitBranch, BadgeCheck, 
  ClipboardList, Search, Plus, Filter, Play, RefreshCw as LoopIcon, Check,
  X, CheckCircle, ArrowRightLeft, Info, ChevronRight, HelpCircle, Save,
  Trash2, Layers, Cpu, Database, Wrench, Shield, Laptop, AlertCircle, FileDown,
  Lock, RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// Import our structured seed data and interfaces
import {
  FeatureFlag, BusinessRule, WalletConfig, CardProgramConfig, FeeRule,
  ExchangeRate, CountryRegionRule, NotificationTemplate, ScheduledJob,
  SystemService, StorageFile, BackupPoint, PlatAuditLog,
  SEED_FEATURE_FLAGS, SEED_BUSINESS_RULES, SEED_WALLET_CONFIGS,
  SEED_CARD_PROGRAMS, SEED_FEE_RULES, SEED_EXCHANGE_RATES,
  SEED_COUNTRIES, SEED_NOTIFICATION_TEMPLATES, SEED_SCHEDULED_JOBS,
  SEED_SYSTEM_SERVICES, SEED_STORAGE_FILES, SEED_BACKUPS,
  SEED_AUDIT_LOGS
} from './platMockData';

interface PlatformAdminCenterProps {
  activeSubTab: string;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  onSelectTab: (tabId: string) => void;
  isDarkMode?: boolean;
}

export function PlatformAdminCenter({ activeSubTab, onToast, onSelectTab, isDarkMode = false }: PlatformAdminCenterProps) {
  // LIVE RUNTIME STATES (using LocalStorage for reliable persistence during exploration)
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(() => {
    const local = localStorage.getItem('walletpro_plat_flags');
    return local ? JSON.parse(local) : SEED_FEATURE_FLAGS;
  });

  const [businessRules, setBusinessRules] = useState<BusinessRule[]>(() => {
    const local = localStorage.getItem('walletpro_plat_biz_rules');
    return local ? JSON.parse(local) : SEED_BUSINESS_RULES;
  });

  const [walletConfigs, setWalletConfigs] = useState<WalletConfig[]>(() => {
    const local = localStorage.getItem('walletpro_plat_wallets');
    return local ? JSON.parse(local) : SEED_WALLET_CONFIGS;
  });

  const [cardPrograms, setCardPrograms] = useState<CardProgramConfig[]>(() => {
    const local = localStorage.getItem('walletpro_plat_cards');
    return local ? JSON.parse(local) : SEED_CARD_PROGRAMS;
  });

  const [feeRules, setFeeRules] = useState<FeeRule[]>(() => {
    const local = localStorage.getItem('walletpro_plat_fees');
    return local ? JSON.parse(local) : SEED_FEE_RULES;
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(() => {
    const local = localStorage.getItem('walletpro_plat_rates');
    return local ? JSON.parse(local) : SEED_EXCHANGE_RATES;
  });

  const [countries, setCountries] = useState<CountryRegionRule[]>(() => {
    const local = localStorage.getItem('walletpro_plat_countries');
    return local ? JSON.parse(local) : SEED_COUNTRIES;
  });

  const [templates, setTemplates] = useState<NotificationTemplate[]>(() => {
    const local = localStorage.getItem('walletpro_plat_templates');
    return local ? JSON.parse(local) : SEED_NOTIFICATION_TEMPLATES;
  });

  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>(() => {
    const local = localStorage.getItem('walletpro_plat_jobs');
    return local ? JSON.parse(local) : SEED_SCHEDULED_JOBS;
  });

  const [systemServices, setSystemServices] = useState<SystemService[]>(() => {
    const local = localStorage.getItem('walletpro_plat_services');
    return local ? JSON.parse(local) : SEED_SYSTEM_SERVICES;
  });

  const [storageFiles, setStorageFiles] = useState<StorageFile[]>(() => {
    const local = localStorage.getItem('walletpro_plat_storage_files');
    return local ? JSON.parse(local) : SEED_STORAGE_FILES;
  });

  const [backups, setBackups] = useState<BackupPoint[]>(() => {
    const local = localStorage.getItem('walletpro_plat_backups');
    return local ? JSON.parse(local) : SEED_BACKUPS;
  });

  const [auditLogs, setAuditLogs] = useState<PlatAuditLog[]>(() => {
    const local = localStorage.getItem('walletpro_plat_audit_logs');
    return local ? JSON.parse(local) : SEED_AUDIT_LOGS;
  });

  // State Save Side-Effects
  useEffect(() => { localStorage.setItem('walletpro_plat_flags', JSON.stringify(featureFlags)); }, [featureFlags]);
  useEffect(() => { localStorage.setItem('walletpro_plat_biz_rules', JSON.stringify(businessRules)); }, [businessRules]);
  useEffect(() => { localStorage.setItem('walletpro_plat_wallets', JSON.stringify(walletConfigs)); }, [walletConfigs]);
  useEffect(() => { localStorage.setItem('walletpro_plat_cards', JSON.stringify(cardPrograms)); }, [cardPrograms]);
  useEffect(() => { localStorage.setItem('walletpro_plat_fees', JSON.stringify(feeRules)); }, [feeRules]);
  useEffect(() => { localStorage.setItem('walletpro_plat_rates', JSON.stringify(exchangeRates)); }, [exchangeRates]);
  useEffect(() => { localStorage.setItem('walletpro_plat_countries', JSON.stringify(countries)); }, [countries]);
  useEffect(() => { localStorage.setItem('walletpro_plat_templates', JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem('walletpro_plat_jobs', JSON.stringify(scheduledJobs)); }, [scheduledJobs]);
  useEffect(() => { localStorage.setItem('walletpro_plat_services', JSON.stringify(systemServices)); }, [systemServices]);
  useEffect(() => { localStorage.setItem('walletpro_plat_storage_files', JSON.stringify(storageFiles)); }, [storageFiles]);
  useEffect(() => { localStorage.setItem('walletpro_plat_backups', JSON.stringify(backups)); }, [backups]);
  useEffect(() => { localStorage.setItem('walletpro_plat_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  // GLOBAL CONFIG STATE (Settings Tab)
  const [globalSettings, setGlobalSettings] = useState({
    platformName: 'WalletPro Enterprise System',
    supportEmail: 'ops-support@walletpro.io',
    supportPhone: '+1 (800) 555-0199',
    businessHours: '08:00 - 20:00 UTC',
    timezone: 'UTC/GMT +0',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    currencyDefault: 'USD',
    languageDefault: 'EN',
    securityDefaultMFA: 'Mandatory',
    isMaintenanceMode: false,
    maintenanceMessage: 'The system is undergoing scheduled infrastructure upgrades. Core wallet balances remain fully secure. Thank you for your patience.',
    maintenanceDuration: '120 mins',
    releaseVersion: 'v2.4.12-pro',
    licenseExpires: '2028-12-31',
    brandingPrimaryColor: '#2563EB', // Blue 600
    brandingSecondaryColor: '#475569', // Slate 600
    brandingTypography: 'Inter, Space Grotesk',
  });

  // Load settings
  useEffect(() => {
    const localSettings = localStorage.getItem('walletpro_plat_global_settings');
    if (localSettings) {
      setGlobalSettings(JSON.parse(localSettings));
    }
  }, []);

  const saveGlobalSettings = (newSettings: typeof globalSettings, reason: string) => {
    setGlobalSettings(newSettings);
    localStorage.setItem('walletpro_plat_global_settings', JSON.stringify(newSettings));
    addAuditLog('GlobalSettings.Update', 'System Configuration', 'Version: ' + globalSettings.releaseVersion, 'Updated parameters', reason);
    onToast('Settings Applied', 'Global configuration rules saved & replicated across dev nodes.', 'success');
  };

  // AUDIT LOG HELPER
  const addAuditLog = (action: string, target: string, oldValue: string, newValue: string, reason: string) => {
    const newLog: PlatAuditLog = {
      id: `aud-sys-${Math.floor(100000 + Math.random() * 900000)}`,
      actor: 'tilok.mania@gmail.com',
      action,
      oldValue,
      newValue,
      reason: reason || 'Routine administrator panel operation',
      timestamp: new Date().toISOString(),
      approved: true,
      approvedBy: 'Super Administrator'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 1. FEE SIMULATOR STATE & LOGIC
  const [simAmount, setSimAmount] = useState<number>(2500);
  const [simTxType, setSimTxType] = useState<FeeRule['type']>('transfer');
  const [simCurrency, setSimCurrency] = useState<string>('USD');
  const [simRateMarkup, setSimRateMarkup] = useState<number>(1.2); //%
  
  const simResults = useMemo(() => {
    const activeRules = feeRules.filter(r => r.type === simTxType);
    if (activeRules.length === 0) {
      return { fixed: 0, percentage: 0, total: 0, ruleName: 'None configured' };
    }
    // pick first matched or average
    const rule = activeRules[0];
    const fixed = rule.fixedAmount;
    let percentage = (simAmount * rule.percentageRate);
    if (simTxType === 'fx') {
      percentage = (simAmount * (simRateMarkup / 100));
    }
    let calculated = fixed + percentage;
    calculated = Math.max(rule.minFee, Math.min(rule.maxFee, calculated));
    return {
      fixed,
      percentage,
      total: calculated,
      ruleName: rule.name
    };
  }, [simAmount, simTxType, simCurrency, feeRules, simRateMarkup]);

  // 2. LIVE NOTIFICATION TEMPLATE SELECTOR & PREVIEWER
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('t-1');
  const [templatePreviewVars, setTemplatePreviewVars] = useState<Record<string, string>>({
    user_name: 'Jessica Miller',
    account_id: 'W-ACC-774129',
    ip_address: '185.190.140.22',
    country: 'Netherlands',
    otp_code: '412809',
    amount: '1,250.00',
    currency: 'USD',
    wallet_id: 'W-CONSUMER-PRIMARY'
  });

  const activeTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || templates[0];
  }, [selectedTemplateId, templates]);

  const compiledPreviewText = useMemo(() => {
    if (!activeTemplate) return '';
    let result = activeTemplate.content;
    activeTemplate.variables.forEach(v => {
      const value = templatePreviewVars[v] || `{{${v}}}`;
      result = result.replaceAll(`{{${v}}}`, value);
    });
    return result;
  }, [activeTemplate, templatePreviewVars]);

  // 3. STORAGE & FILE CLEANUP
  const totalStorageUsageBytes = useMemo(() => {
    return storageFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  }, [storageFiles]);

  const storagePercentage = useMemo(() => {
    const maxCapacity = 536870912000; // 500 GB
    return (totalStorageUsageBytes / maxCapacity) * 100;
  }, [totalStorageUsageBytes]);

  // 4. BACKUP GENERATOR MODAL STATE & ACTIONS
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupStep, setBackupStep] = useState<'idle' | 'analyzing' | 'snapshot' | 'compress' | 'done'>('idle');
  const [backupProgress, setBackupProgress] = useState(0);

  const triggerBackupFlow = () => {
    setIsBackupModalOpen(true);
    setBackupStep('analyzing');
    setBackupProgress(10);
    
    const steps: ('analyzing' | 'snapshot' | 'compress' | 'done')[] = ['analyzing', 'snapshot', 'compress', 'done'];
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < steps.length) {
        setBackupStep(steps[currentIdx]);
        setBackupProgress(currentIdx * 30 + 10);
      } else {
        clearInterval(interval);
        setBackupProgress(100);
        // append new backup
        const newBk: BackupPoint = {
          id: `bk-${Math.floor(100 + Math.random() * 900)}`,
          name: `Manual Admin Backup Snapshot - ${new Date().toLocaleTimeString()}`,
          timestamp: new Date().toISOString(),
          sizeBytes: 1548102000 + Math.floor(Math.random() * 200000000),
          status: 'COMPLETED',
          checksum: `sha256-${Math.random().toString(36).substring(2, 12)}...`
        };
        setBackups(prev => [newBk, ...prev]);
        addAuditLog('Backup.Create', 'System Backup', 'N/A', newBk.name, 'Manual backup checkpoint generated by administrator');
        onToast('Backup Complete', 'Encrypted cloud storage snapshot securely finalized.', 'success');
        setIsBackupModalOpen(false);
        setBackupStep('idle');
      }
    }, 1200);
  };

  // 5. SYSTEM HEALTHSEQUENTIAL CHECKER PING
  const [isPingingAll, setIsPingingAll] = useState(false);
  const triggerHealthPingSequence = () => {
    setIsPingingAll(true);
    onToast('Initiating Health Audit', 'Verifying all internal RPC nodes and external communication APIs.', 'info');
    
    // sequentially verify services
    setTimeout(() => {
      setSystemServices(prev => prev.map((srv, idx) => {
        // slightly fluctuate latencies for live feel
        const statusRandom = Math.random() > 0.95 ? 'DEGRADED' : 'OPERATIONAL';
        const latencyModifier = Math.floor(Math.random() * 8) - 4;
        return {
          ...srv,
          status: statusRandom as any,
          latencyMs: Math.max(2, srv.latencyMs + latencyModifier),
          healthScore: statusRandom === 'OPERATIONAL' ? 98 + Math.floor(Math.random() * 3) : 75
        };
      }));
      setIsPingingAll(false);
      onToast('System Nodes Verified', 'Ping sequence finalized. Latencies successfully recorded inside operations log.', 'success');
      addAuditLog('SystemHealth.Ping', 'Core Clusters', 'Online', 'Active Diagnostic Complete', 'Admin triggered health-checks');
    }, 2000);
  };

  // 6. FORM FIELDS EDITING EMULATORS
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [editingRuleValue, setEditingRuleValue] = useState<string>('');
  const [editingRuleReason, setEditingRuleReason] = useState<string>('');

  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [editingFlagRollout, setEditingFlagRollout] = useState<number>(50);

  // Toggle feature flags directly
  const handleToggleFlag = (id: string, currentVal: boolean) => {
    setFeatureFlags(prev => prev.map(flag => {
      if (flag.id === id) {
        const newVal = !currentVal;
        addAuditLog('FeatureFlag.Toggle', flag.key, currentVal ? 'ENABLED' : 'DISABLED', newVal ? 'ENABLED' : 'DISABLED', 'Dynamic rollout override via System Center');
        onToast(`Feature ${newVal ? 'Enabled' : 'Disabled'}`, `Flag key ${flag.key} updated immediately.`, 'info');
        return { ...flag, enabled: newVal, lastUpdated: new Date().toISOString() };
      }
      return flag;
    }));
  };

  // Update rule value
  const handleSaveRule = (ruleId: string) => {
    const targetRule = businessRules.find(r => r.id === ruleId);
    if (!targetRule) return;
    
    setBusinessRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        addAuditLog('BusinessRule.UpdateValue', r.key, r.value, editingRuleValue, editingRuleReason || 'Policy tuning requirement');
        return { ...r, value: editingRuleValue };
      }
      return r;
    }));
    onToast('Rule Parameter Saved', `Business rule ${targetRule.name} is now updated to ${editingRuleValue}.`, 'success');
    setSelectedRuleId(null);
    setEditingRuleReason('');
  };

  // Trigger manually ondemand job execution
  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const triggerOnDemandJob = (id: string) => {
    setRunningJobId(id);
    onToast('Job Triggered', 'Allocating queue thread and dispatching worker process.', 'info');
    
    // complete job after brief spin
    setTimeout(() => {
      setScheduledJobs(prev => prev.map(job => {
        if (job.id === id) {
          addAuditLog('CronJob.OnDemandRun', job.name, 'IDLE', 'RUNNING -> COMPLETED', 'Administrator on-demand job invocation');
          return {
            ...job,
            status: 'COMPLETED',
            lastRun: new Date().toISOString()
          };
        }
        return job;
      }));
      setRunningJobId(null);
      onToast('Job Finalized', 'Cron job execution completed successfully with exit code 0.', 'success');
    }, 1800);
  };

  // Render variables according to the designated active subtab
  return (
    <div 
      id="platform-system-workspace" 
      className={`flex-1 min-h-full p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 28 SUB-TABS WORKSPACE HEADER */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 mb-6 text-left ${
        isDarkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase opacity-60">
            <span>Enterprise Admin Platform</span>
            <span>/</span>
            <span className="text-blue-600">System Management Center</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {activeSubTab === 'plat-dashboard' && 'Platform Performance Dashboard'}
            {activeSubTab === 'plat-settings' && 'Global App Configuration'}
            {activeSubTab === 'plat-flags' && 'Feature Flags (Vanguard Control)'}
            {activeSubTab === 'plat-business-rules' && 'Operational Limits & Core Business Rules'}
            {activeSubTab === 'plat-transaction-rules' && 'Transaction Filtering & Velocity Rules'}
            {activeSubTab === 'plat-wallet-config' && 'Wallet Configuration Schemes'}
            {activeSubTab === 'plat-card-config' && 'Card Program Threshold Parameters'}
            {activeSubTab === 'plat-fees' && 'Fee Management & Simulation Gateway'}
            {activeSubTab === 'plat-exchange' && 'Live Exchange Rates Monitoring'}
            {activeSubTab === 'plat-currencies' && 'Currency Pool Configurations'}
            {activeSubTab === 'plat-regions' && 'Geographical Restrictions & Tax Rates'}
            {activeSubTab === 'plat-notifications' && 'Notification Orchestrator'}
            {activeSubTab === 'plat-emails' && 'Core Email Templates Editor'}
            {activeSubTab === 'plat-sms' && 'SMS Push Templates'}
            {activeSubTab === 'plat-push' && 'APNS/FCM Push Notification Bundles'}
            {activeSubTab === 'plat-branding' && 'White-Label Branding & Colors Layout'}
            {activeSubTab === 'plat-localization' && 'System Language & Translating Center'}
            {activeSubTab === 'plat-jobs' && 'Cron Scheduled Jobs & Daemons'}
            {activeSubTab === 'plat-queue' && 'Active Kafka Message Queue Pools'}
            {activeSubTab === 'plat-storage' && 'Cloud Storage Allocation'}
            {activeSubTab === 'plat-files' && 'Uploaded File Repository'}
            {activeSubTab === 'plat-backup' && 'System Cold Backups & Snapshot Recovery'}
            {activeSubTab === 'plat-health' && 'Platform Server Node Cluster Health'}
            {activeSubTab === 'plat-services' && 'Microservice Latencies Tracker'}
            {activeSubTab === 'plat-env' && 'Cloud Run Cluster Environments'}
            {activeSubTab === 'plat-maintenance' && 'Global Maintenance Banner Modes'}
            {activeSubTab === 'plat-releases' && 'Kubernetes Releases & Rollbacks Log'}
            {activeSubTab === 'plat-license' && 'Platform Licensing & Terms Audit'}
            {activeSubTab === 'plat-audit' && 'Global Configuration Change Audit Log'}
          </h1>
          <p className="text-xs opacity-75 max-w-3xl">
            {activeSubTab === 'plat-dashboard' && 'Live visual metrics, environment variables status, CPU/Memory telemetry, and active server nodes.'}
            {activeSubTab === 'plat-settings' && 'Configure general variables, brand addresses, business hours, timezones, and active default states.'}
            {activeSubTab === 'plat-flags' && 'Toggle features, handle canary gradual deployments, and scope flags by active environments.'}
            {activeSubTab === 'plat-business-rules' && 'Review and tune financial guardrails, compliance constraints, deposit maximums, and risk rules.'}
            {activeSubTab === 'plat-transaction-rules' && 'Maintain transaction processing rules, multi-stage settlement pipelines, and operational filters.'}
            {activeSubTab === 'plat-wallet-config' && 'Formulate minimum limits, VIP VIP requirements, and automated dormancy fee sweeps.'}
            {activeSubTab === 'plat-card-config' && 'Manage spend program parameters, maximum single transactions, and virtual card linking states.'}
            {activeSubTab === 'plat-fees' && 'Administer system markups, standard inward fees, and verify calculations using the Fee Simulator.'}
            {activeSubTab === 'plat-exchange' && 'Audit live market sync providers, trigger manual forex rate bypasses, or review rate logs.'}
            {activeSubTab === 'plat-currencies' && 'Active system ledger currency pools, standard decimal scale formats, and payment routing configs.'}
            {activeSubTab === 'plat-regions' && 'Enable supported countries, inspect FATF restricted regions, and manage specific tax percentages.'}
            {activeSubTab === 'plat-notifications' && 'Orchestrate general notification templates, variables, and trigger pipelines.'}
            {activeSubTab === 'plat-emails' && 'Draft liquid email templates, compile visual test previews, and trigger dev inbox pings.'}
            {activeSubTab === 'plat-sms' && 'Configure active gateway dispatch rules, SMS templates, and backup routing variables.'}
            {activeSubTab === 'plat-push' && 'Configure mobile notification templates, payloads, and device tokens variables.'}
            {activeSubTab === 'plat-branding' && 'Upload logo assets, tune primary theme colors, typography rules, and setup white-label subdomains.'}
            {activeSubTab === 'plat-localization' && 'Add multi-language localization packets, number patterns, and custom calendar systems.'}
            {activeSubTab === 'plat-jobs' && 'Review scheduled jobs, audit average execution times, and invoke on-demand triggers.'}
            {activeSubTab === 'plat-queue' && 'Monitor pending streams, process backlog volumes, and review failed job dead-letter-queues.'}
            {activeSubTab === 'plat-storage' && 'Audit disk storage allocations, categorize documents, and sweep unreferenced temporary cached directories.'}
            {activeSubTab === 'plat-files' && 'Inspect uploaded file indices, review security mime-type approvals, and download server files.'}
            {activeSubTab === 'plat-backup' && 'Initialize secure manual snapshots, review checksum signatures, and mock full backup recoveries.'}
            {activeSubTab === 'plat-health' && 'Check live ping results, third party APIs connectivity status, and verify platform system status.'}
            {activeSubTab === 'plat-services' && 'Monitor microservices performance latencies, availability rates, and overall operational health scores.'}
            {activeSubTab === 'plat-env' && 'Review deployment targets, view release tags, and inspect environment clusters.'}
            {activeSubTab === 'plat-maintenance' && 'Force client lockout modes, write custom maintenance messages, and schedule server outages.'}
            {activeSubTab === 'plat-releases' && 'Audit app releases history, trace build hashes, and simulate rollback controls.'}
            {activeSubTab === 'plat-license' && 'Inspect subscription licenses, allocated administrative seats, and check certificate statuses.'}
            {activeSubTab === 'plat-audit' && 'Immutable historical record of every single change made by security operators during this session.'}
          </p>
        </div>

        {/* HEADER CONTROLS */}
        <div className="flex items-center gap-3">
          {/* Quick System Status Widget */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium ${
            globalSettings.isMaintenanceMode
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{globalSettings.isMaintenanceMode ? 'MAINTENANCE_MODE' : 'SYSTEM_STABLE'}</span>
          </div>
        </div>
      </div>

      {/* RENDER DYNAMIC PLATFORM VIEWS BASED ON SUBTAB */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >

          {/* ========================================================================================= */}
          {/* 1. PLATFORM PERFORMANCE DASHBOARD */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-dashboard' && (
            <div id="plat-dashboard-view" className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
              {/* Executive KPIs */}
              <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium opacity-60">System Software Build</span>
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mt-2">{globalSettings.releaseVersion}</h3>
                  <div className="text-xs mt-1 text-emerald-500 font-mono">Running Standard Cluster</div>
                </div>

                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium opacity-60">Core Cluster Uptime</span>
                    <Activity className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold mt-2">99.987 %</h3>
                  <div className="text-xs mt-1 opacity-60">Uptime: 261 days continuous</div>
                </div>

                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium opacity-60">Cluster Engine Host</span>
                    <Server className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-bold mt-2">Cloud Run</h3>
                  <div className="text-xs mt-1 text-blue-500 font-mono">Environment: PRODUCTION</div>
                </div>

                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium opacity-60">Active Daemon Pools</span>
                    <Cpu className="w-4 h-4 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold mt-2">{scheduledJobs.length} active cron jobs</h3>
                  <div className="text-xs mt-1 text-amber-500 font-mono">1 executing currently</div>
                </div>
              </div>

              {/* Resource Metrics & Charts */}
              <div className={`xl:col-span-2 p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold mb-4">Core Host Resource Allocation (Last 12 Hours)</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { time: '06:00', cpu: 22, memory: 61, disk: 44 },
                      { time: '07:00', cpu: 34, memory: 62, disk: 44 },
                      { time: '08:00', cpu: 45, memory: 65, disk: 44 },
                      { time: '09:00', cpu: 21, memory: 63, disk: 45 },
                      { time: '10:00', cpu: 28, memory: 61, disk: 45 },
                      { time: '11:00', cpu: 52, memory: 70, disk: 46 },
                      { time: '12:00', cpu: 65, memory: 74, disk: 46 },
                      { time: '13:00', cpu: 32, memory: 68, disk: 47 },
                      { time: '14:00', cpu: 27, memory: 65, disk: 47 },
                      { time: '15:00', cpu: 19, memory: 62, disk: 47 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="time" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                      <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                      <Tooltip contentStyle={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderColor: '#475569' }} />
                      <Legend />
                      <Area type="monotone" dataKey="cpu" name="CPU Usage %" stroke="#3b82f6" fillOpacity={0.1} fill="url(#colorCpu)" />
                      <Area type="monotone" dataKey="memory" name="Memory Allocation %" stroke="#10b981" fillOpacity={0.1} fill="url(#colorMem)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Disk / Disk partitions status */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div>
                  <h2 className="font-bold mb-4">Storage Pool Volume Status</h2>
                  <div className="flex justify-center my-6">
                    <div className="relative w-36 h-36 flex items-center justify-center border-8 border-blue-500 rounded-full border-t-slate-300">
                      <div className="text-center">
                        <span className="text-2xl font-black">{storagePercentage.toFixed(1)}%</span>
                        <div className="text-[10px] opacity-60">Allocated Space</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span>Documents Directory</span>
                    <span>14.5 GB / 100 GB</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '14.5%' }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>Database Log Bundles</span>
                    <span>185.2 GB / 250 GB</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: '74%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 2. GLOBAL APP CONFIGURATION */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-settings' && (
            <div id="plat-settings-view" className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              <div className={`lg:col-span-2 p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Core App Settings Panel</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold opacity-60 block mb-1">Platform Name</label>
                    <input 
                      type="text" 
                      value={globalSettings.platformName}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, platformName: e.target.value })}
                      className="w-full p-2.5 rounded-lg border bg-transparent text-sm border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold opacity-60 block mb-1">Support Email Address</label>
                    <input 
                      type="email" 
                      value={globalSettings.supportEmail}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, supportEmail: e.target.value })}
                      className="w-full p-2.5 rounded-lg border bg-transparent text-sm border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold opacity-60 block mb-1">Support Phone Number</label>
                    <input 
                      type="text" 
                      value={globalSettings.supportPhone}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, supportPhone: e.target.value })}
                      className="w-full p-2.5 rounded-lg border bg-transparent text-sm border-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold opacity-60 block mb-1">Global Base Timezone</label>
                    <select 
                      value={globalSettings.timezone}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, timezone: e.target.value })}
                      className="w-full p-2.5 rounded-lg border bg-transparent text-sm border-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      <option value="UTC/GMT +0">UTC/GMT +0</option>
                      <option value="EST (UTC -5)">EST (UTC -5)</option>
                      <option value="SGT (UTC +8)">SGT (UTC +8)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="font-semibold mb-2">Platform Defaults Configuration</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs opacity-60 block mb-1">Currency Default</label>
                      <select 
                        value={globalSettings.currencyDefault}
                        onChange={(e) => setGlobalSettings({ ...globalSettings, currencyDefault: e.target.value })}
                        className="w-full p-2 rounded border bg-transparent text-xs border-slate-700"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs opacity-60 block mb-1">Language Default</label>
                      <select 
                        value={globalSettings.languageDefault}
                        onChange={(e) => setGlobalSettings({ ...globalSettings, languageDefault: e.target.value })}
                        className="w-full p-2 rounded border bg-transparent text-xs border-slate-700"
                      >
                        <option value="EN">English (EN)</option>
                        <option value="DE">German (DE)</option>
                        <option value="ES">Spanish (ES)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs opacity-60 block mb-1">MFA Security Policy</label>
                      <select 
                        value={globalSettings.securityDefaultMFA}
                        onChange={(e) => setGlobalSettings({ ...globalSettings, securityDefaultMFA: e.target.value })}
                        className="w-full p-2 rounded border bg-transparent text-xs border-slate-700"
                      >
                        <option value="Mandatory">Mandatory Enforcement</option>
                        <option value="Optional">Optional Opt-in</option>
                        <option value="Admin Only">Admin Console Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => saveGlobalSettings(globalSettings, 'Admin tuning of general support contact & default settings')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                  >
                    <Save className="w-4 h-4" /> Save Global Configuration
                  </button>
                </div>
              </div>

              {/* Side helper card */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div>
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" /> Administrative Notes
                  </h3>
                  <p className="text-xs opacity-80 leading-relaxed">
                    Changing the <strong>Global Base Timezone</strong> affects settlement cron logs scheduling. Ensure ledger synchronization matches downstream bank API settlement batches.
                  </p>
                  <p className="text-xs opacity-80 leading-relaxed mt-2">
                    Default <strong>MFA Security settings</strong> apply strictly to new account setups, preventing bypass opportunities.
                  </p>
                </div>
                <div className="border-t border-slate-800 pt-4 mt-4 text-xs space-y-1 font-mono">
                  <div>Operator IP: 192.168.1.100</div>
                  <div>Client Location: London, GB</div>
                  <div>Last Setting Update: 10 mins ago</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 3. FEATURE FLAGS */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-flags' && (
            <div id="plat-flags-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-bold text-lg">Dynamic Canary Feature Flags</h2>
                    <p className="text-xs opacity-75">Enable gradual rolling features to targeted users in controlled clusters</p>
                  </div>
                  <button 
                    onClick={() => {
                      onToast('Add Flag Requested', 'Creation is locked in Production mode. Update flag config rules below.', 'info');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Create Flag
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 opacity-60">
                        <th className="py-3">Flag Variable Name</th>
                        <th className="py-3">Global Flag Key</th>
                        <th className="py-3">Rollout Scope</th>
                        <th className="py-3">Gradual Deploy</th>
                        <th className="py-3 text-center">Status</th>
                        <th className="py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {featureFlags.map(flag => (
                        <tr key={flag.id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="py-4">
                            <span className="font-semibold block">{flag.name}</span>
                            <span className="text-[10px] opacity-60 block mt-0.5">{flag.description}</span>
                          </td>
                          <td className="py-4 font-mono text-blue-500">{flag.key}</td>
                          <td className="py-4">
                            <div className="flex gap-1.5">
                              {flag.environments.map(env => (
                                <span key={env} className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                                  {env}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full" style={{ width: `${flag.gradualRollout}%` }} />
                              </div>
                              <span className="font-bold font-mono">{flag.gradualRollout}%</span>
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              flag.enabled 
                                ? 'bg-emerald-500/15 text-emerald-500' 
                                : 'bg-rose-500/15 text-rose-500'
                            }`}>
                              {flag.enabled ? 'ACTIVE_ROLLOUT' : 'DISABLED'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedFlagId(flag.id);
                                  setEditingFlagRollout(flag.gradualRollout);
                                }}
                                className="p-1 text-slate-400 hover:text-white"
                                title="Edit Canary Split"
                              >
                                <Sliders className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleToggleFlag(flag.id, flag.enabled)}
                                className={`px-2 py-1 rounded text-[10px] font-semibold ${
                                  flag.enabled ? 'bg-slate-800 text-rose-500 hover:bg-slate-700' : 'bg-blue-600 text-white hover:bg-blue-500'
                                }`}
                              >
                                {flag.enabled ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic Edit Dialog Modal */}
              {selectedFlagId && (
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold text-sm mb-3">Tuning Feature Flag: {featureFlags.find(f => f.id === selectedFlagId)?.name}</h3>
                  <div className="space-y-3 max-w-md">
                    <div>
                      <label className="text-xs opacity-60 block mb-1">Gradual Rollout Target %</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={editingFlagRollout}
                        onChange={(e) => setEditingFlagRollout(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <span className="text-xs font-mono font-bold mt-1 block">Traffic Percentage: {editingFlagRollout}%</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setFeatureFlags(prev => prev.map(f => {
                            if (f.id === selectedFlagId) {
                              addAuditLog('FeatureFlag.UpdateCanary', f.key, `${f.gradualRollout}%`, `${editingFlagRollout}%`, 'Canary percentage adjustment');
                              return { ...f, gradualRollout: editingFlagRollout };
                            }
                            return f;
                          }));
                          onToast('Canary Adjusted', 'Traffic allocation changed successfully.', 'success');
                          setSelectedFlagId(null);
                        }}
                        className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-semibold"
                      >
                        Apply Rollout Target
                      </button>
                      <button 
                        onClick={() => setSelectedFlagId(null)}
                        className="px-3 py-1.5 rounded bg-slate-800 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 4. BUSINESS RULES & TRANSACTION RULES */}
          {/* ========================================================================================= */}
          {(activeSubTab === 'plat-business-rules' || activeSubTab === 'plat-transaction-rules') && (
            <div id="plat-rules-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-2">Core System Ledger Operations Parameters</h2>
                <p className="text-xs opacity-75 mb-6">These parameters lock operational transfer limits, deposit floors, routing windows, and trigger automatic KYC escalation overrides.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {businessRules
                    .filter(r => activeSubTab === 'plat-business-rules' ? r.category !== 'Velocity Rules' : r.category === 'Velocity Rules' || r.category === 'Risk Thresholds')
                    .map(rule => (
                      <div key={rule.id} className="p-4 rounded-lg border border-slate-800 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold font-mono text-blue-500 uppercase">{rule.category}</span>
                          <h4 className="font-bold text-sm">{rule.name}</h4>
                          <p className="text-xs opacity-60">{rule.description}</p>
                          <span className="text-xs font-mono font-semibold bg-slate-800 px-2 py-0.5 rounded text-blue-300">
                            Key: {rule.key}
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className="text-lg font-bold font-mono">{rule.value} <span className="text-xs opacity-60">{rule.unit}</span></span>
                          <button 
                            onClick={() => {
                              setSelectedRuleId(rule.id);
                              setEditingRuleValue(rule.value);
                            }}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Edit Parameter
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Editing block modal */}
              {selectedRuleId && (
                <div className={`p-5 rounded-xl border max-w-lg ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-bold mb-3">Tuning Rule Parameter: {businessRules.find(r => r.id === selectedRuleId)?.name}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs opacity-60 block mb-1">New Operational Value</label>
                      <input 
                        type="text" 
                        value={editingRuleValue}
                        onChange={(e) => setEditingRuleValue(e.target.value)}
                        className="w-full p-2 rounded bg-transparent border border-slate-700 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs opacity-60 block mb-1">Mandatory Compliance Reason</label>
                      <input 
                        type="text" 
                        value={editingRuleReason}
                        onChange={(e) => setEditingRuleReason(e.target.value)}
                        placeholder="e.g. Adjusted to cover Q3 financial routing directives"
                        className="w-full p-2 rounded bg-transparent border border-slate-700 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSaveRule(selectedRuleId)}
                        className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-semibold"
                      >
                        Write Parameter
                      </button>
                      <button 
                        onClick={() => setSelectedRuleId(null)}
                        className="px-3 py-1.5 rounded bg-slate-800 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 5. WALLET & CARD CONFIGURATIONS */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-wallet-config' && (
            <div id="plat-wallets-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Unified Account Wallet Classes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {walletConfigs.map(w => (
                    <div key={w.id} className="p-4 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="font-bold text-sm text-blue-500">{w.walletType}</span>
                        <Coins className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="opacity-60">Balance Cap:</span>
                          <span>${w.maxBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Daily Outflow Cap:</span>
                          <span>${w.dailyLimit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Dormancy Months:</span>
                          <span>{w.dormancyMonths} months</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800/50 pt-2 text-amber-500">
                          <span>Dormant Fee Charge:</span>
                          <span>${w.dormancyFee.toFixed(2)}/mo</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => onToast('Wallet Config Change', 'Modifications strictly require dual authentication validation.', 'warning')}
                        className="w-full text-center text-xs py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold"
                      >
                        Modify Parameters
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'plat-card-config' && (
            <div id="plat-cards-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Supported Issuer Card Program Groups</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {cardPrograms.map(prog => (
                    <div key={prog.id} className="p-4 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="font-bold text-sm text-indigo-500">{prog.programName}</span>
                        <CreditCard className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="opacity-60">Daily Spending Ceiling:</span>
                          <span>${prog.dailySpendLimit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">Single Charge Cap:</span>
                          <span>${prog.singleTxLimit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-60">ATM Max Outflow:</span>
                          <span>${prog.atmWithdrawalLimit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800/50 pt-2">
                          <span className="opacity-60">Virtual / Physical:</span>
                          <span>
                            {prog.virtualCardEnabled ? '✅' : '❌'} / {prog.physicalCardEnabled ? '✅' : '❌'}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => onToast('Card Config Change', 'Requires core network processor approval sequence.', 'warning')}
                        className="w-full text-center text-xs py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-semibold"
                      >
                        Tune Thresholds
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 6. FEE MANAGEMENT & INTERACTIVE SIMULATOR */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-fees' && (
            <div id="plat-fees-view" className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
              {/* Rules List */}
              <div className={`xl:col-span-2 p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Core Inward/Outward Fee Schedules</h2>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 opacity-60">
                        <th className="py-2">Fee Variable Description</th>
                        <th className="py-2">Base Fixed</th>
                        <th className="py-2">Rate Markup</th>
                        <th className="py-2">Range bounds (Min - Max)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {feeRules.map(rule => (
                        <tr key={rule.id} className="hover:bg-slate-800/10">
                          <td className="py-3 font-semibold">{rule.name}</td>
                          <td className="py-3 font-mono">${rule.fixedAmount.toFixed(2)}</td>
                          <td className="py-3 font-mono">{(rule.percentageRate * 100).toFixed(2)}%</td>
                          <td className="py-3 font-mono">
                            ${rule.minFee.toFixed(2)} - ${rule.maxFee.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INTERACTIVE FEE CALCULATOR SIMULATOR */}
              <div className={`p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-bold text-blue-500">Live Fee Simulation Engine</h3>
                <p className="text-xs opacity-75">Simulate instant dynamic fees across specific transaction rules.</p>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="opacity-60 block mb-1">Transaction Category</label>
                    <select 
                      value={simTxType} 
                      onChange={(e) => setSimTxType(e.target.value as any)}
                      className="w-full p-2 rounded bg-transparent border border-slate-700"
                    >
                      <option value="transfer">Standard Ledger Transfer</option>
                      <option value="card">Card Issuing Outflow</option>
                      <option value="atm">Atm Cash Outflow</option>
                      <option value="fx">Dynamic FX marked conversion</option>
                      <option value="merchant">Merchant Settlement Credit</option>
                    </select>
                  </div>

                  <div>
                    <label className="opacity-60 block mb-1">Simulated Volume Amount</label>
                    <input 
                      type="number" 
                      value={simAmount}
                      onChange={(e) => setSimAmount(Number(e.target.value))}
                      className="w-full p-2 rounded bg-transparent border border-slate-700 font-mono font-bold text-sm"
                    />
                  </div>

                  {simTxType === 'fx' && (
                    <div>
                      <label className="opacity-60 block mb-1">FX Conversional Markups %</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={simRateMarkup}
                        onChange={(e) => setSimRateMarkup(Number(e.target.value))}
                        className="w-full p-2 rounded bg-transparent border border-slate-700 font-mono"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <span className="font-semibold block text-slate-400">Resulting Calculated Output:</span>
                    <div className="flex justify-between font-mono bg-slate-950/40 p-2.5 rounded border border-slate-800/80">
                      <span>Mapped Fee Rule:</span>
                      <span className="text-blue-400 font-semibold">{simResults.ruleName}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Base Fixed Component:</span>
                      <span>${simResults.fixed.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Rate Percentage Out:</span>
                      <span>${simResults.percentage.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2 font-mono text-lg font-bold text-emerald-500">
                      <span>Final Net Fee:</span>
                      <span>${simResults.total.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 7. EXCHANGE RATES & COUNTRIES */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-exchange' && (
            <div id="plat-exchange-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Supported Currencies & Dynamic Exchange Rates</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 opacity-60">
                        <th className="py-2">Currency Symbol</th>
                        <th className="py-2">Descriptive Name</th>
                        <th className="py-2">Rate Value vs USD</th>
                        <th className="py-2">Data Provider Source</th>
                        <th className="py-2">Update Sync Status</th>
                        <th className="py-2 text-right">Admin Manual Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {exchangeRates.map(rate => (
                        <tr key={rate.id} className="hover:bg-slate-800/10">
                          <td className="py-3 font-bold text-blue-500 font-mono text-sm">{rate.currencyCode}</td>
                          <td className="py-3">{rate.name}</td>
                          <td className="py-3 font-mono font-bold text-sm">{rate.rateVsUsd}</td>
                          <td className="py-3 font-mono text-[10px] opacity-75">{rate.provider}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rate.status === 'SYNCHRONIZED' ? 'bg-emerald-500/10 text-emerald-500' :
                              rate.status === 'MANUAL' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {rate.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => {
                                setExchangeRates(prev => prev.map(r => r.id === rate.id ? { ...r, rateVsUsd: Number((r.rateVsUsd * 1.02).toFixed(5)), manualOverride: true, status: 'MANUAL' } : r));
                                addAuditLog('ExchangeRate.ManualOverride', rate.currencyCode, String(rate.rateVsUsd), String((rate.rateVsUsd * 1.02).toFixed(5)), 'Force currency adjustment manual hedge');
                                onToast('Rate Overridden', `Forex threshold for ${rate.currencyCode} updated inside cache memory.`, 'success');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold"
                            >
                              +2.0% Override
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'plat-currencies' && (
            <div id="plat-currencies-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Currency Decimal & Fractional Limits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800 text-xs space-y-2 font-mono">
                    <span className="font-bold text-sm block text-blue-400">Fiat Class Currencies</span>
                    <div className="flex justify-between"><span>Supported ISO List:</span> <span>USD, EUR, GBP, CAD, SGD</span></div>
                    <div className="flex justify-between"><span>Default Scale:</span> <span>2 Decimals (.00)</span></div>
                    <div className="flex justify-between"><span>Maximum Ledger Settlement Bounds:</span> <span>15 digits precision</span></div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 text-xs space-y-2 font-mono">
                    <span className="font-bold text-sm block text-indigo-400">Stablecoins & Tokenized Pool Assets</span>
                    <div className="flex justify-between"><span>Integrated ERC20 Pools:</span> <span>USDT, USDC, PYUSD</span></div>
                    <div className="flex justify-between"><span>Default Scale:</span> <span>6 Decimals (.000000)</span></div>
                    <div className="flex justify-between"><span>Active Oracle Feed:</span> <span>Chainlink Price Feeds</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'plat-regions' && (
            <div id="plat-regions-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Countries Jurisdiction Screening Configuration</h2>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 opacity-60">
                        <th className="py-2">Country Code</th>
                        <th className="py-2">Country Jurisdiction</th>
                        <th className="py-2">KYC Screening Class</th>
                        <th className="py-2">Regional Tax markups</th>
                        <th className="py-2 text-right">Switch State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {countries.map(c => (
                        <tr key={c.id} className="hover:bg-slate-800/10">
                          <td className="py-3 font-mono font-bold text-sm text-blue-400">{c.countryCode}</td>
                          <td className="py-3 font-semibold">{c.countryName}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'SUPPORTED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 font-mono">{c.localTaxRate * 100}% VAT/Sales</td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => {
                                const newStatus = c.status === 'SUPPORTED' ? 'RESTRICTED' : 'SUPPORTED';
                                setCountries(prev => prev.map(item => item.id === c.id ? { ...item, status: newStatus as any } : item));
                                addAuditLog('Country.ToggleStatus', c.countryName, c.status, newStatus, 'Jurisdiction screening updates');
                                onToast('Region Updated', `Screening for ${c.countryName} set to ${newStatus}.`, 'info');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px]"
                            >
                              Toggle Scope
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 8. NOTIFICATION CENTER & TEMPLATE PREVIEWER */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-notifications' && (
            <div id="plat-notifications-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-2">Platform SMS/Email Dispatch Routing Node</h2>
                <p className="text-xs opacity-75 mb-4">Route transactional messaging streams across third-party communication providers.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-4 rounded-xl border border-slate-800">
                    <span className="font-bold text-blue-400 block mb-2">Email Dispatch Host</span>
                    <div>Active Provider: AWS SES</div>
                    <div>Port: SMTPS / 465 SSL</div>
                    <div className="text-emerald-500 mt-2 font-semibold">● Operational (Ping: 41ms)</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800">
                    <span className="font-bold text-indigo-400 block mb-2">SMS Gateway Host</span>
                    <div>Active Provider: Twilio API</div>
                    <div>Routing Channel: Shortcode primary</div>
                    <div className="text-emerald-500 mt-2 font-semibold">● Operational (Ping: 65ms)</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800">
                    <span className="font-bold text-purple-400 block mb-2">APNS/FCM Push Host</span>
                    <div>Active Provider: Firebase FCM</div>
                    <div>Payload Format: JSON silent</div>
                    <div className="text-emerald-500 mt-2 font-semibold">● Operational (Ping: 12ms)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeSubTab === 'plat-emails' || activeSubTab === 'plat-sms' || activeSubTab === 'plat-push') && (
            <div id="plat-templates-view" className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
              {/* Left Selector List */}
              <div className={`xl:col-span-1 p-5 rounded-xl border flex flex-col gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold mb-2 uppercase text-xs tracking-widest opacity-60">System Templates Indexes</h2>
                <div className="space-y-2">
                  {templates
                    .filter(t => {
                      if (activeSubTab === 'plat-emails') return t.type === 'email';
                      if (activeSubTab === 'plat-sms') return t.type === 'sms';
                      return t.type === 'push';
                    })
                    .map(t => (
                      <button 
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={`w-full p-3 rounded-lg text-left border transition-all text-xs flex flex-col gap-1 ${
                          selectedTemplateId === t.id 
                            ? 'bg-blue-600/10 border-blue-600 text-blue-500' 
                            : 'bg-transparent border-slate-800 hover:bg-slate-800/10'
                        }`}
                      >
                        <span className="font-bold text-sm block text-slate-200">{t.name}</span>
                        <span className="font-mono opacity-70 block">Trigger: {t.trigger}</span>
                        <span className="text-[10px] opacity-50 block mt-1">Variables: {t.variables.join(', ')}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Live Compiler Text Editor */}
              <div className={`xl:col-span-2 p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h2 className="font-bold">Encrypted Live Content Compiler</h2>
                  <button 
                    onClick={() => {
                      onToast('Test Push Sent', `Dispatched standard test envelope using variables placeholder to tilok.mania@gmail.com`, 'success');
                    }}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold text-xs"
                  >
                    Send Dev Test Dispatch
                  </button>
                </div>

                <div className="space-y-4">
                  {activeTemplate?.subject && (
                    <div>
                      <label className="text-xs opacity-60 block mb-1">Email Subject Header</label>
                      <input 
                        type="text" 
                        value={activeTemplate.subject}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? { ...t, subject: val } : t));
                        }}
                        className="w-full p-2 rounded text-xs bg-slate-950 border border-slate-800 font-semibold"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Live Editor Block */}
                    <div className="space-y-1">
                      <label className="text-xs opacity-60 block mb-1">Liquid Text Engine Code</label>
                      <textarea 
                        rows={8}
                        value={activeTemplate?.content || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTemplates(prev => prev.map(t => t.id === activeTemplate.id ? { ...t, content: val } : t));
                        }}
                        className="w-full p-3 rounded font-mono text-xs bg-slate-950 border border-slate-800 text-slate-100 h-64 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Compiled Preview Area */}
                    <div className="space-y-1">
                      <label className="text-xs opacity-60 block mb-1">Simulated Customer Output Preview</label>
                      <div className="p-4 rounded border border-slate-800 bg-slate-900/60 h-64 font-sans text-xs overflow-y-auto whitespace-pre-wrap text-slate-300 leading-relaxed text-left border-dashed">
                        {activeTemplate?.subject && (
                          <div className="font-bold border-b border-slate-800 pb-2 mb-2 text-slate-100">
                            Subject: {activeTemplate.subject}
                          </div>
                        )}
                        {compiledPreviewText}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 9. BRANDING & LOCALIZATION */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-branding' && (
            <div id="plat-branding-view" className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className={`md:col-span-2 p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">White-Label Branding Config</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs opacity-60 block mb-1">Primary Hex Theme Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={globalSettings.brandingPrimaryColor}
                        onChange={(e) => setGlobalSettings({ ...globalSettings, brandingPrimaryColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-800 bg-transparent p-1 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={globalSettings.brandingPrimaryColor}
                        onChange={(e) => setGlobalSettings({ ...globalSettings, brandingPrimaryColor: e.target.value })}
                        className="p-2 border border-slate-800 rounded bg-transparent font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs opacity-60 block mb-1">Secondary Hex Theme Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={globalSettings.brandingSecondaryColor}
                        onChange={(e) => setGlobalSettings({ ...globalSettings, brandingSecondaryColor: e.target.value })}
                        className="w-10 h-10 rounded border border-slate-800 bg-transparent p-1 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={globalSettings.brandingSecondaryColor}
                        onChange={(e) => setGlobalSettings({ ...globalSettings, brandingSecondaryColor: e.target.value })}
                        className="p-2 border border-slate-800 rounded bg-transparent font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="font-bold block mb-2 text-xs opacity-75 uppercase">Whitelabel Asset Preview</span>
                  <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-white" style={{ backgroundColor: globalSettings.brandingPrimaryColor }}>
                      WP
                    </div>
                    <div>
                      <span className="font-bold block text-sm">Preview WalletPro Logo</span>
                      <span className="text-xs opacity-60">Compiled with theme parameters dynamic.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'plat-localization' && (
            <div id="plat-localization-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Supported System Localization Bundles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-sm block text-blue-400">English (EN-US)</span>
                    <div>Translated Key Strings: 12,412</div>
                    <div>Date Masking: MM/DD/YYYY</div>
                    <div className="text-emerald-500 font-semibold font-mono">● 100% Translated</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-sm block text-indigo-400">German (DE-DE)</span>
                    <div>Translated Key Strings: 12,412</div>
                    <div>Date Masking: DD.MM.YYYY</div>
                    <div className="text-emerald-500 font-semibold font-mono">● 100% Translated</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-sm block text-amber-400">Spanish (ES-ES)</span>
                    <div>Translated Key Strings: 9,210</div>
                    <div>Date Masking: DD/MM/YYYY</div>
                    <div className="text-amber-500 font-semibold font-mono">▲ 74% Translated (120 strings pending)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 10. CRON JOBS & KAFKA QUEUE MONITOR */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-jobs' && (
            <div id="plat-jobs-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Cron Scheduled Jobs Orchestration</h2>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 opacity-60">
                        <th className="py-2">Daemon Job Name</th>
                        <th className="py-2">Cron Schedule</th>
                        <th className="py-2">Sync Status</th>
                        <th className="py-2 font-mono">Last Run Timestamp</th>
                        <th className="py-2 text-right">Actions Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {scheduledJobs.map(job => (
                        <tr key={job.id} className="hover:bg-slate-800/10">
                          <td className="py-3 font-semibold">{job.name}</td>
                          <td className="py-3 font-mono text-blue-500">{job.schedule}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                              job.status === 'RUNNING' ? 'bg-blue-500/15 text-blue-400 animate-pulse' :
                              job.status === 'FAILED' ? 'bg-rose-500/15 text-rose-500' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-[10px] opacity-75">{job.lastRun}</td>
                          <td className="py-3 text-right">
                            <button 
                              disabled={runningJobId !== null}
                              onClick={() => triggerOnDemandJob(job.id)}
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-[10px] text-white font-semibold"
                            >
                              {runningJobId === job.id ? 'Spinning...' : 'Run Now'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'plat-queue' && (
            <div id="plat-queue-view" className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
              {/* Telemetry charts */}
              <div className={`xl:col-span-2 p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold mb-4">Kafka Message Queue Volumes & Processing Flow</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { topic: 'Auth.Logs', backlog: 120, throughput: 1240 },
                      { topic: 'Ledger.Tx', backlog: 0, throughput: 5210 },
                      { topic: 'AML.Screen', backlog: 14, throughput: 450 },
                      { topic: 'Sms.Out', backlog: 412, throughput: 890 },
                      { topic: 'Push.APNS', backlog: 5, throughput: 1100 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="topic" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                      <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                      <Tooltip contentStyle={{ background: isDarkMode ? '#1e293b' : '#ffffff', borderColor: '#475569' }} />
                      <Legend />
                      <Bar dataKey="backlog" name="Backlog Message Count" fill="#f43f5e" />
                      <Bar dataKey="throughput" name="Processed Msg/sec" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dead Letter Queue */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="space-y-3">
                  <h3 className="font-bold text-rose-500">Dead-Letter-Queue (DLQ)</h3>
                  <p className="text-xs opacity-75">Unroutable operations isolated for compliance safety checks.</p>
                  
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg space-y-1 font-mono text-[10px]">
                    <div className="font-bold">Topic: SMS.Outflow</div>
                    <div>Error: Twilio API Rate Limit Saturated</div>
                    <div>Isolated Payload: "WP-Challenge-412"</div>
                    <div className="text-[9px] opacity-65">Isolated: 12 mins ago</div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    onToast('DLQ Purged', 'Dead letter queue backlog re-queued immediately.', 'success');
                    addAuditLog('DeadLetterQueue.Retry', 'SMS Queue', 'Stuck: 1 msg', '0', 'Admin re-queue override');
                  }}
                  className="w-full text-center py-2 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs mt-4"
                >
                  Retry Dead Letters
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 11. STORAGE & FILES ALLOCATIONS */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-storage' && (
            <div id="plat-storage-view" className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className={`md:col-span-2 p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg">Cloud Disk Allocations</h2>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Documents Directory', value: 14.5, color: '#3b82f6' },
                          { name: 'Database Log Dump', value: 185.2, color: '#10b981' },
                          { name: 'KYC Passports Vault', value: 24.1, color: '#f59e0b' },
                          { name: 'Temporary Cache Pool', value: 5.4, color: '#64748b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#64748b" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`p-5 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="space-y-2">
                  <h3 className="font-bold">Disk Sweep Diagnostics</h3>
                  <p className="text-xs opacity-75 leading-relaxed">
                    Sweeping unreferenced objects cleans cache pools. Database log dumps remain strictly under retention rules (7-year compliance bounds).
                  </p>
                </div>
                <button 
                  onClick={() => {
                    onToast('Cleanup Succeeded', 'Deleted 5.4 GB temporary cached directories.', 'success');
                    addAuditLog('Storage.Sweep', 'Temporary Space', '5.4 GB', '0 GB', 'Admin disk cleanup sweeps');
                  }}
                  className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs mt-4 rounded-lg"
                >
                  Trigger Storage Sweep
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'plat-files' && (
            <div id="plat-files-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Core Uploaded File Indices</h2>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 opacity-60">
                        <th className="py-2">Object Name</th>
                        <th className="py-2">Category type</th>
                        <th className="py-2">File Size</th>
                        <th className="py-2">Security Mime Approval</th>
                        <th className="py-2 text-right">Action Down</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {storageFiles.map(file => (
                        <tr key={file.id} className="hover:bg-slate-800/10">
                          <td className="py-3 font-semibold text-slate-200">{file.name}</td>
                          <td className="py-3 font-mono text-[10px] text-indigo-400 uppercase">{file.category}</td>
                          <td className="py-3 font-mono">{(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB</td>
                          <td className="py-3 text-emerald-500 font-mono">✓ Approved Codecs</td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => {
                                onToast('File Download Initiated', `Secured download link generated for administrative auditing.`, 'success');
                              }}
                              className="text-blue-500 hover:underline"
                            >
                              Download Object
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 12. BACKUP & SYSTEM SNAPSHOTS RECOVERY */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-backup' && (
            <div id="plat-backup-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-bold text-lg">System Cold Backups & Snapshot Recovery</h2>
                    <p className="text-xs opacity-75">Restore states or generate offline manual backups</p>
                  </div>
                  <button 
                    onClick={triggerBackupFlow}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
                  >
                    <Plus className="w-4 h-4" /> Generate New Backup Snapshot
                  </button>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 opacity-60">
                        <th className="py-2">Backup Object File</th>
                        <th className="py-2">Generated Timestamp</th>
                        <th className="py-2">Disk Volume</th>
                        <th className="py-2">Checksum SHA256</th>
                        <th className="py-2">Status</th>
                        <th className="py-2 text-right">Action Overrides</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {backups.map(bk => (
                        <tr key={bk.id} className="hover:bg-slate-800/10">
                          <td className="py-3 font-semibold">{bk.name}</td>
                          <td className="py-3 font-mono">{bk.timestamp}</td>
                          <td className="py-3 font-mono">{(bk.sizeBytes / (1024 * 1024)).toFixed(1)} MB</td>
                          <td className="py-3 font-mono text-[10px] opacity-75">{bk.checksum}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              bk.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-500'
                            }`}>
                              {bk.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => {
                                if (bk.status === 'FAILED') {
                                  onToast('Recovery Failed', 'This backup block signature contains invalid checksum bounds.', 'warning');
                                  return;
                                }
                                onToast('Restoration Triggered', 'Recovery state mock started successfully. Sync logs generated.', 'success');
                                addAuditLog('Restore.Trigger', 'System recovery', 'Current state', bk.name, 'Admin initiated point-in-time recovery');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px]"
                            >
                              Restore Point
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 13. SYSTEM HEALTH & MICROSERVICE LATENCY STATUS */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-health' && (
            <div id="plat-health-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-bold text-lg">Platform Node Cluster Health Matrix</h2>
                    <p className="text-xs opacity-75">Sequential RPC cluster verifications status.</p>
                  </div>
                  <button 
                    disabled={isPingingAll}
                    onClick={triggerHealthPingSequence}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    {isPingingAll ? 'Pinging Nodes...' : 'Sequential Health Ping Run'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-300">Spanner Relational DB</span>
                    <div className="text-emerald-500 font-bold">● Active (Ping: 4ms)</div>
                    <div className="opacity-60 text-[10px]">Read latency: 0.8ms | Write latency: 1.2ms</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-300">Redis Cache Instance</span>
                    <div className="text-emerald-500 font-bold">● Active (Ping: 0.1ms)</div>
                    <div className="opacity-60 text-[10px]">Total Hits rate: 99.41%</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-300">Kafka Message Queues</span>
                    <div className="text-emerald-500 font-bold">● Active (Ping: 2ms)</div>
                    <div className="opacity-60 text-[10px]">Topic stream nodes: 15/15 green</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'plat-services' && (
            <div id="plat-services-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Kubernetes Microservices Latencies Tracker</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {systemServices.map(srv => (
                    <div key={srv.id} className="p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="font-bold text-sm text-slate-200">{srv.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          srv.status === 'OPERATIONAL' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {srv.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="opacity-60 block">Latency</span>
                          <span className="text-lg font-bold text-blue-400">{srv.latencyMs} ms</span>
                        </div>
                        <div>
                          <span className="opacity-60 block">SLA Available</span>
                          <span className="text-lg font-bold">{srv.availability}%</span>
                        </div>
                        <div>
                          <span className="opacity-60 block">Health Score</span>
                          <span className="text-lg font-bold text-emerald-500">{srv.healthScore}/100</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 14. ENVIRONMENTS, MAINTENANCE MODE, RELEASES */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-env' && (
            <div id="plat-env-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Cloud Run Environment Scope Clusters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-sm block text-blue-400">Development (DEV)</span>
                    <div>Cluster ID: run-dev-asia</div>
                    <div>Scale Nodes bounds: 1 - 5</div>
                    <div className="text-emerald-500">● Status Active</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-sm block text-indigo-400">Staging (STG)</span>
                    <div>Cluster ID: run-stg-asia</div>
                    <div>Scale Nodes bounds: 2 - 10</div>
                    <div className="text-emerald-500">● Status Active</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-sm block text-purple-400">Production (PRD)</span>
                    <div>Cluster ID: run-prd-asia</div>
                    <div>Scale Nodes bounds: 5 - 100</div>
                    <div className="text-emerald-500">● Status Active (Read Only Mode)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'plat-maintenance' && (
            <div id="plat-maintenance-view" className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className={`md:col-span-2 p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-2">Configure Maintenance Lockout Gates</h2>
                <p className="text-xs opacity-75 mb-4">Temporarily block incoming customer API transactions for scheduled Ledger updates.</p>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        const newVal = !globalSettings.isMaintenanceMode;
                        const actionText = newVal ? 'Maintenance Mode [ENABLED]' : 'Maintenance Mode [DISABLED]';
                        setGlobalSettings({ ...globalSettings, isMaintenanceMode: newVal });
                        localStorage.setItem('walletpro_plat_global_settings', JSON.stringify({ ...globalSettings, isMaintenanceMode: newVal }));
                        addAuditLog('MaintenanceMode.Toggle', 'Global Gate', !newVal ? 'ENABLED' : 'DISABLED', actionText, 'Emergency system maintenance gates override');
                        onToast('Lockout Updated', `Maintenance lock ${newVal ? 'Forced ON' : 'Deactivated'}.`, 'warning');
                      }}
                      className={`px-4 py-2 rounded font-semibold ${
                        globalSettings.isMaintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                      }`}
                    >
                      {globalSettings.isMaintenanceMode ? 'FORCE DISABLE MAINTENANCE' : 'FORCE ENABLE MAINTENANCE'}
                    </button>
                    <span className="opacity-60 font-mono">Current State: {globalSettings.isMaintenanceMode ? 'MAINTENANCE_ACTIVE' : 'SYSTEM_STABLE'}</span>
                  </div>

                  <div>
                    <label className="opacity-60 block mb-1">Estimated Maintenance Duration</label>
                    <input 
                      type="text" 
                      value={globalSettings.maintenanceDuration}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, maintenanceDuration: e.target.value })}
                      className="w-full p-2 rounded bg-transparent border border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="opacity-60 block mb-1">Customer User Facing Banner Warning Message</label>
                    <textarea 
                      rows={3}
                      value={globalSettings.maintenanceMessage}
                      onChange={(e) => setGlobalSettings({ ...globalSettings, maintenanceMessage: e.target.value })}
                      className="w-full p-2.5 rounded bg-transparent border border-slate-700 leading-relaxed font-sans text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'plat-releases' && (
            <div id="plat-releases-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Kubernetes Release History Tags</h2>
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-blue-400 block text-sm">v2.4.12-pro (Active Build)</span>
                    <div>Released: 2026-07-09T18:00:00Z | Commit: #3cf19da</div>
                    <div className="opacity-75">Added: Dynamic Apple pay provisioning on virtual cards, optimized ledger locks timeout indexes</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-slate-400 block text-sm">v2.4.11-pro</span>
                    <div>Released: 2026-06-30T10:00:00Z | Commit: #a98f12a</div>
                    <div className="opacity-75">Fixed: Prevent out of boundaries decimals rounding inside foreign currency conversion rules</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'plat-license' && (
            <div id="plat-license-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h2 className="font-bold text-lg mb-4">Enterprise Subscription Licensing & Seat Allocations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-sm block text-blue-400">Enterprise License Signature</span>
                    <div>License Key: LIC-WP-8874129-C520</div>
                    <div>Status: ACTIVE VALIDATED</div>
                    <div>Expiration Limit: {globalSettings.licenseExpires} (Renewal auto-billing active)</div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-sm block text-indigo-400">Administrative Operator Seat Count</span>
                    <div>Active Operators: 14 / 25 seats used</div>
                    <div>Super Administrators: 3 slots</div>
                    <div>Security Analysts: 4 slots</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* 15. CONFIGURATION AUDIT TRAIL */}
          {/* ========================================================================================= */}
          {activeSubTab === 'plat-audit' && (
            <div id="plat-audit-view" className="space-y-6 text-left">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-bold text-lg">System Configuration Audit Trail Log</h2>
                    <p className="text-xs opacity-75">Immutable historical record of every configuration update made by administrative operators during this session.</p>
                  </div>
                  <button 
                    onClick={() => {
                      onToast('Log Downloaded', 'Generating cryptographically signed audit package in CSV format.', 'success');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                  >
                    <FileDown className="w-4 h-4" /> Download Signed Logs (CSV)
                  </button>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 opacity-60">
                        <th className="py-2">Log Reference ID</th>
                        <th className="py-2">Actor Identity</th>
                        <th className="py-2">Action / Target</th>
                        <th className="py-2">Old Parameter</th>
                        <th className="py-2">New Parameter</th>
                        <th className="py-2 font-mono">Timestamp (UTC)</th>
                        <th className="py-2 text-right">MFA Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-800/10">
                          <td className="py-3 font-mono font-bold text-[10px] text-blue-400">{log.id}</td>
                          <td className="py-3 font-semibold text-slate-200">{log.actor}</td>
                          <td className="py-3">
                            <span className="font-bold block text-slate-300">{log.action}</span>
                            <span className="text-[10px] opacity-65 block">{log.reason}</span>
                          </td>
                          <td className="py-3 font-mono text-[10px] opacity-75 max-w-xs truncate" title={log.oldValue}>{log.oldValue}</td>
                          <td className="py-3 font-mono text-[10px] text-emerald-400 max-w-xs truncate" title={log.newValue}>{log.newValue}</td>
                          <td className="py-3 font-mono text-[10px] opacity-75">{log.timestamp}</td>
                          <td className="py-3 text-right">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                              ✓ VERIFIED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* RECOVERY BACKUP LOADING POPUP OVERLAY */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`p-6 rounded-xl border max-w-sm w-full space-y-4 text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <h3 className="font-bold text-base">Creating System Snapshot</h3>
            <p className="text-xs opacity-75">
              {backupStep === 'analyzing' && 'Analyzing disk arrays and active partitions...'}
              {backupStep === 'snapshot' && 'Creating transactionally locked ledger snapshot...'}
              {backupStep === 'compress' && 'Compressing backup volumes and applying checksum SHA256...'}
            </p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${backupProgress}%` }} />
            </div>
            <span className="text-xs font-bold font-mono text-blue-400">{backupProgress}% Complete</span>
          </div>
        </div>
      )}
    </div>
  );
}
