import React from 'react';
import { 
  Users, UserCheck, ShieldAlert, AlertTriangle, Mail, Clock, ShieldCheck, 
  Cpu, Activity, CheckCircle, ChevronRight, Play
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts';
import { StaffMember, IAMInvitation, IAMDevice, IAMSession } from './iamMockData';

interface IamDashboardProps {
  staff: StaffMember[];
  invitations: IAMInvitation[];
  onSelectTab: (tabId: string) => void;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function IamDashboard({ staff, invitations, onSelectTab, onToast }: IamDashboardProps) {
  // Calculations
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'Active').length;
  const suspendedStaff = staff.filter(s => s.status === 'Suspended').length;
  const lockedAccounts = staff.filter(s => s.status === 'Locked').length;
  
  const pendingInvitations = invitations.filter(i => i.status === 'Pending').length;
  const expiredInvitations = invitations.filter(i => i.status === 'Expired').length;
  
  // Simulated today metrics
  const failedLoginsToday = 4;
  const mfaEnabledCount = staff.filter(s => s.mfaEnabled).length;
  const mfaAdoptionRate = totalStaff > 0 ? Math.round((mfaEnabledCount / totalStaff) * 100) : 100;
  
  const onlineStaff = staff.filter(s => s.sessions.length > 0).length;
  const offlineStaff = totalStaff - onlineStaff;
  
  const activeSessions = staff.reduce((acc, s) => acc + s.sessions.length, 0);
  const blockedDevices = staff.reduce((acc, s) => acc + s.devices.filter(d => d.status === 'Blocked').length, 0);

  // Recharts Data
  const departmentData = [
    { name: 'Exec', value: staff.filter(s => s.department === 'Executive').length },
    { name: 'Ops', value: staff.filter(s => s.department === 'Operations').length },
    { name: 'Comp', value: staff.filter(s => s.department === 'Compliance').length },
    { name: 'Fraud', value: staff.filter(s => s.department === 'Fraud').length },
    { name: 'Fin', value: staff.filter(s => s.department === 'Finance').length },
    { name: 'Supp', value: staff.filter(s => s.department === 'Support').length },
    { name: 'Eng', value: staff.filter(s => s.department === 'Engineering').length },
  ];

  const riskTimelineData = [
    { hour: '08:00', success: 12, failed: 0 },
    { hour: '10:00', success: 28, failed: 1 },
    { hour: '12:00', success: 35, failed: 0 },
    { hour: '14:00', success: 19, failed: 2 },
    { hour: '16:00', success: 24, failed: 0 },
    { hour: '18:00', success: 15, failed: 1 },
    { hour: '20:00', success: 8, failed: 0 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  const kpis = [
    { id: 'total', name: 'Total Staff', val: totalStaff, icon: Users, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' },
    { id: 'active', name: 'Active Staff', val: activeStaff, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100' },
    { id: 'suspended', name: 'Suspended Staff', val: suspendedStaff, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100' },
    { id: 'locked', name: 'Locked Accounts', val: lockedAccounts, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50/50 border-red-100' },
    { id: 'pending-inv', name: 'Pending Invites', val: pendingInvitations, icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50/50 border-indigo-100' },
    { id: 'expired-inv', name: 'Expired Invites', val: expiredInvitations, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50/50 border-rose-100' },
    { id: 'failed-logins', name: 'Failed Logins Today', val: failedLoginsToday, icon: ShieldAlert, color: 'text-red-700', bg: 'bg-red-100/30 border-red-200' },
    { id: 'mfa', name: 'MFA Adoption', val: `${mfaAdoptionRate}%`, icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50/50 border-teal-100' },
    { id: 'online', name: 'Online Staff', val: onlineStaff, icon: Activity, color: 'text-green-600', bg: 'bg-green-50/50 border-green-100' },
    { id: 'offline', name: 'Offline Staff', val: offlineStaff, icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50/40 border-slate-100' },
    { id: 'sessions', name: 'Active Sessions', val: activeSessions, icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50/50 border-blue-100' },
    { id: 'blocked-dev', name: 'Blocked Devices', val: blockedDevices, icon: ShieldAlert, color: 'text-red-800', bg: 'bg-rose-100/50 border-rose-200' }
  ];

  return (
    <div id="iam-dashboard-container" className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Workforce Identity & Analytics Dashboard</h1>
        <p className="text-xs text-slate-500">Live operational oversight of corporate directories, sessions, and authentication security alerts.</p>
      </div>

      {/* Grid of KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.id} 
              id={`kpi-${kpi.id}`}
              className={`p-4 rounded-xl border flex flex-col justify-between shadow-sm transition-all hover:shadow bg-white ${kpi.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{kpi.name}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="mt-2 text-left">
                <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">{kpi.val}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left chart - Department Allocation */}
        <div id="dept-chart-card" className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Staff Distribution by Department</h3>
              <p className="text-[11px] text-slate-400">Department headcount statistics across corporate entities</p>
            </div>
            <button 
              onClick={() => onSelectTab('iam-departments')}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 cursor-pointer"
            >
              View Departments <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right chart - Risks & Authentication history */}
        <div id="risk-chart-card" className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Today's Sign-In Request Pattern</h3>
              <p className="text-[11px] text-slate-400">Temporal distribution of successful vs blocked authentications</p>
            </div>
            <button 
              onClick={() => onSelectTab('iam-login-history')}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 cursor-pointer"
            >
              View Login Logs <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTimelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="success" name="Successful Logins" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" strokeWidth={2} />
                <Area type="monotone" dataKey="failed" name="Failed Sign-Ins" stroke="#ef4444" fillOpacity={1} fill="url(#colorFailed)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Security Quick Actions and Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 text-left">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Workforce Policy Alerts & Audits</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
              <ShieldAlert className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-800">Critical: Account Lock for Sarah Jenkins (EMP-501)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Account suspended automatically following brute-force attempts from Moscow, RU on uncertified device.</div>
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={() => onSelectTab('iam-staff')}
                    className="text-[10px] bg-red-600 text-white font-semibold px-2.5 py-1 rounded hover:bg-red-700 cursor-pointer"
                  >
                    Investigate Profile
                  </button>
                  <button 
                    onClick={() => {
                      onToast('Account Suspended', 'Preventive suspension is fully active.', 'info');
                    }}
                    className="text-[10px] bg-white border border-red-200 text-red-700 font-semibold px-2.5 py-1 rounded hover:bg-red-50 cursor-pointer"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-slate-800">Warning: Inactive Multi-Factor Authorization</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Davin Miller (EMP-602) logged in without active MFA credentials. Password safety triggers initiated.</div>
                <div className="mt-2">
                  <button 
                    onClick={() => onSelectTab('iam-mfa-management')}
                    className="text-[10px] bg-amber-600 text-white font-semibold px-2.5 py-1 rounded hover:bg-amber-700 cursor-pointer"
                  >
                    Enforce MFA policy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Quicklinks */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm text-left flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">IAM Administrative Panel</h3>
            <p className="text-[11px] text-slate-400 mb-4">Direct shortcuts to critical security policy parameters</p>
            <div className="space-y-1.5">
              {[
                { name: 'Invite New Operator', id: 'iam-invitations' },
                { name: 'Review Active Permissions', id: 'iam-permissions' },
                { name: 'Configure Password Guidelines', id: 'iam-password-policies' },
                { name: 'Deploy Approval Workflows', id: 'iam-approval-workflows' },
                { name: 'Audit Access Policies', id: 'iam-access-policies' }
              ].map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectTab(link.id)}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors text-xs font-semibold text-slate-600 text-left cursor-pointer group"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-mono">Workspace Security Level: <b>STRICT-9</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
