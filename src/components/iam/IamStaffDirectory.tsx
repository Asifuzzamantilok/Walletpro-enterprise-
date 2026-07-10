import React, { useState } from 'react';
import { 
  Search, ShieldCheck, ShieldAlert, Clock, Mail, 
  Smartphone, Monitor, Shield, Key, Eye, CheckCircle, AlertCircle,
  Lock, Power, UserX, UserCheck, ChevronRight, X, UserMinus, RotateCw, Plus
} from 'lucide-react';
import { StaffMember, IAMRole, IAMPermission, IAMSession, IAMDevice } from './iamMockData';
import { canAssignRole, ROLE_AUTHORITY_SCORES, logAuthorizationFailure, hasActionPermission } from '../../utils/auth';

interface IamStaffDirectoryProps {
  staff: StaffMember[];
  onUpdateStaff: (staffId: string, updates: Partial<StaffMember>) => void;
  onAddAuditLog: (action: string, target: string, prevValue: string, newValue: string, reason: string) => void;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  onInviteClick: () => void;
}

export function IamStaffDirectory({ staff, onUpdateStaff, onAddAuditLog, onToast, onInviteClick }: IamStaffDirectoryProps) {
  const activeRole = localStorage.getItem('walletpro_active_role') || 'Super Administrator';

  // Directory state
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [mfaFilter, setMfaFilter] = useState('All');
  
  // Selected Profile state
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'permissions' | 'sessions' | 'devices'>('profile');
  
  // Action reason dialog inputs
  const [actionReason, setActionReason] = useState('');
  const [currentAction, setCurrentAction] = useState<{ type: string; label: string } | null>(null);

  // Filter lists
  const departments = ['All', ...new Set(staff.map(s => s.department))];
  const statuses = ['All', 'Active', 'Suspended', 'Locked'];

  // Apply filters
  const filteredStaff = staff.filter(s => {
    const matchSearch = 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchDept = deptFilter === 'All' || s.department === deptFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchMfa = mfaFilter === 'All' || 
      (mfaFilter === 'Enabled' && s.mfaEnabled) || 
      (mfaFilter === 'Disabled' && !s.mfaEnabled);

    return matchSearch && matchDept && matchStatus && matchMfa;
  });

  // Action execution
  const executeAction = (actionType: string, label: string) => {
    if (!selectedStaff) return;
    
    // Check authority hierarchy
    if (!canAssignRole(activeRole, selectedStaff.role)) {
      onToast(
        'Authority Level Insufficient',
        `Your active role (${activeRole}) does not have permission to modify profiles with role (${selectedStaff.role}).`,
        'warning'
      );
      logAuthorizationFailure(
        'Current User',
        activeRole,
        `staff.${actionType}`,
        selectedStaff.fullName,
        `Attempted to perform '${label}' on equal/higher-ranked staff member with role ${selectedStaff.role}`
      );
      return;
    }
    
    setCurrentAction({ type: actionType, label });
    setActionReason('');
  };

  const confirmAction = () => {
    if (!selectedStaff || !currentAction) return;
    
    const sId = selectedStaff.id;
    const prevStatus = selectedStaff.status;
    let newStatus = selectedStaff.status;
    let updates: Partial<StaffMember> = {};

    switch (currentAction.type) {
      case 'activate':
        newStatus = 'Active';
        updates = { status: 'Active' };
        break;
      case 'suspend':
        newStatus = 'Suspended';
        updates = { status: 'Suspended' };
        break;
      case 'lock':
        newStatus = 'Locked';
        updates = { status: 'Locked' };
        break;
      case 'unlock':
        newStatus = 'Active';
        updates = { status: 'Active' };
        break;
      case 'pw_reset':
        updates = { lastActivity: new Date().toISOString() };
        onToast('Password Reset Triggered', `A temporary password hash link has been compiled for ${selectedStaff.fullName}.`, 'success');
        break;
      case 'force_mfa':
        updates = { mfaEnabled: true, mfaType: 'Authenticator App' };
        onToast('MFA Policy Enforced', `MFA token generation has been marked as mandatory for ${selectedStaff.fullName}.`, 'success');
        break;
      default:
        break;
    }

    if (currentAction.type !== 'pw_reset' && currentAction.type !== 'force_mfa') {
      updates = { status: newStatus };
      onUpdateStaff(sId, updates);
      onToast('Directory Status Shifted', `Account status of ${selectedStaff.fullName} is now ${newStatus}.`, 'warning');
    }

    // Append to Audit Logs
    onAddAuditLog(
      `staff.${currentAction.type}`,
      selectedStaff.fullName,
      prevStatus,
      updates.status || 'No Status Change',
      actionReason || 'Administrative direct trigger override'
    );

    // Refresh selected staff reference in state
    setSelectedStaff(prev => prev ? { ...prev, ...updates } : null);
    setCurrentAction(null);
  };

  const terminateSession = (sessionId: string) => {
    if (!selectedStaff) return;
    if (!canAssignRole(activeRole, selectedStaff.role)) {
      onToast(
        'Authority Level Insufficient',
        `Your active role (${activeRole}) cannot revoke session tokens for (${selectedStaff.role}).`,
        'warning'
      );
      logAuthorizationFailure(
        'Current User',
        activeRole,
        'session.revoke',
        selectedStaff.fullName,
        `Attempted to terminate session of equal/higher-ranked staff member (${selectedStaff.role})`
      );
      return;
    }
    const updatedSessions = selectedStaff.sessions.filter(se => se.id !== sessionId);
    onUpdateStaff(selectedStaff.id, { sessions: updatedSessions });
    onToast('Session Terminated', `Active session token ${sessionId} revoked.`, 'info');
    onAddAuditLog('session.revoke', selectedStaff.fullName, 'Active', 'Revoked', `Forced logout of token ID ${sessionId}`);
    
    setSelectedStaff(prev => prev ? { ...prev, sessions: updatedSessions } : null);
  };

  const blockDevice = (deviceId: string) => {
    if (!selectedStaff) return;
    if (!canAssignRole(activeRole, selectedStaff.role)) {
      onToast(
        'Authority Level Insufficient',
        `Your active role (${activeRole}) cannot blacklist device signatures for (${selectedStaff.role}).`,
        'warning'
      );
      logAuthorizationFailure(
        'Current User',
        activeRole,
        'device.block',
        selectedStaff.fullName,
        `Attempted to block device of equal/higher-ranked staff member (${selectedStaff.role})`
      );
      return;
    }
    const updatedDevices = selectedStaff.devices.map(d => d.id === deviceId ? { ...d, status: 'Blocked' as const } : d);
    onUpdateStaff(selectedStaff.id, { devices: updatedDevices });
    onToast('Device Blocked', `Device hardware key ${deviceId} has been placed in blacklist.`, 'warning');
    onAddAuditLog('device.block', selectedStaff.fullName, 'Trusted', 'Blocked', `Blacklisted hardware signature ID ${deviceId}`);
    
    setSelectedStaff(prev => prev ? { ...prev, devices: updatedDevices } : null);
  };

  return (
    <div id="iam-staff-directory-container" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Directory Main List (2/3 width) */}
      <div className="xl:col-span-2 space-y-4">
        {/* Title Header with Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Operational Staff Directory</h2>
            <p className="text-[11px] text-slate-400">Search, filter, and oversee workforce security status profiles</p>
          </div>
          <button
            onClick={() => {
              if (!hasActionPermission(activeRole, 'staff.create')) {
                onToast(
                  'Access Denied',
                  `Your active role (${activeRole}) does not have permission to invite staff operators.`,
                  'warning'
                );
                logAuthorizationFailure(
                  'Current User',
                  activeRole,
                  'staff.create',
                  'Staff Operator Invitation',
                  `Attempted to invite staff under unauthorized active role ${activeRole}`
                );
                return;
              }
              onInviteClick();
            }}
            className={`self-start md:self-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer ${
              !hasActionPermission(activeRole, 'staff.create') ? 'opacity-50 cursor-not-allowed bg-slate-500 hover:bg-slate-500' : ''
            }`}
          >
            <Plus className="w-4 h-4" />
            Invite Staff Operator
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Employee ID, Name, User, Email..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder-slate-400 shadow-inner bg-slate-50/50"
            />
          </div>
          
          <div className="grid grid-cols-2 md:flex gap-2 text-[11px] font-semibold text-slate-600">
            {/* Department Filter */}
            <div className="flex flex-col text-left gap-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400">Department</span>
              <select 
                value={deptFilter} 
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white outline-none"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col text-left gap-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400">Status</span>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white outline-none"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* MFA Filter */}
            <div className="flex flex-col text-left gap-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400">MFA</span>
              <select 
                value={mfaFilter} 
                onChange={(e) => setMfaFilter(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white outline-none"
              >
                <option value="All">All</option>
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-4">Employee ID / Name</th>
                  <th className="py-3 px-4">Department & Team</th>
                  <th className="py-3 px-4">Role Profile</th>
                  <th className="py-3 px-4">MFA</th>
                  <th className="py-3 px-4">Security Status</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold font-mono">
                      No staff profiles match current directory criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => {
                    const isSelected = selectedStaff?.id === member.id;
                    return (
                      <tr 
                        key={member.id}
                        id={`staff-${member.id}`}
                        onClick={() => {
                          setSelectedStaff(member);
                          setActiveProfileTab('profile');
                        }}
                        className={`hover:bg-blue-50/20 transition-all cursor-pointer ${isSelected ? 'bg-blue-50/45 font-semibold border-l-2 border-l-blue-600' : ''}`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs">{member.fullName}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-medium">{member.id} • {member.username}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700">{member.department}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{member.team}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{member.role}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">{member.jobTitle}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {member.mfaEnabled ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-100 flex items-center gap-1 w-max">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-semibold border border-rose-100 flex items-center gap-1 w-max">
                              <ShieldAlert className="w-3 h-3 text-rose-500 shrink-0" />
                              Off
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {member.status === 'Active' && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                              Active
                            </span>
                          )}
                          {member.status === 'Suspended' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                              Suspended
                            </span>
                          )}
                          {member.status === 'Locked' && (
                            <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold border border-red-200">
                              Locked
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-left text-[10px] text-slate-400 font-mono">
            Showing {filteredStaff.length} of {staff.length} registered personnel profiles in company records.
          </div>
        </div>
      </div>

      {/* Selected Member Detail Panel (1/3 width) */}
      <div className="space-y-4">
        {selectedStaff ? (
          <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between text-left h-full min-h-[500px]">
            <div>
              {/* Header Profile Title */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-800">{selectedStaff.fullName}</h3>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">{selectedStaff.id}</span>
                </div>
                <button 
                  onClick={() => setSelectedStaff(null)}
                  className="p-1 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex border-b border-slate-100 mt-3 text-[10px] font-bold text-slate-500 gap-2 mb-4">
                {[
                  { id: 'profile', label: 'Identity' },
                  { id: 'permissions', label: 'RBAC Matrices' },
                  { id: 'sessions', label: `Sessions (${selectedStaff.sessions.length})` },
                  { id: 'devices', label: `Devices (${selectedStaff.devices.length})` }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveProfileTab(t.id as any)}
                    className={`pb-2 transition-all border-b-2 cursor-pointer ${activeProfileTab === t.id ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-700'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Profile Details Tab */}
              {activeProfileTab === 'profile' && (
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Username</span>
                      <span className="text-slate-700 font-mono">{selectedStaff.username}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Work Email</span>
                      <span className="text-slate-700 truncate block">{selectedStaff.email}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] text-slate-400 font-bold block">Department</span>
                      <span className="text-slate-700">{selectedStaff.department}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] text-slate-400 font-bold block">Team Desk</span>
                      <span className="text-slate-700">{selectedStaff.team}</span>
                    </div>
                    <div className="mt-2 col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold block">Supervisor / Manager</span>
                      <span className="text-slate-700 font-semibold">{selectedStaff.manager || 'Board of Directors'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] font-semibold text-slate-500">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span>MFA Status</span>
                      <span className={selectedStaff.mfaEnabled ? 'text-emerald-600' : 'text-rose-600'}>
                        {selectedStaff.mfaEnabled ? `Active (${selectedStaff.mfaType})` : 'Inactive Override'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span>Account Status</span>
                      <span className="font-bold">{selectedStaff.status}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span>Last Authentication</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {selectedStaff.lastLogin ? new Date(selectedStaff.lastLogin).toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Permissions/Roles Tab */}
              {activeProfileTab === 'permissions' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-left">
                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block mb-1">Assigned RBAC Role</span>
                    {canAssignRole(activeRole, selectedStaff.role) ? (
                      <div className="space-y-2 mt-1">
                        <select
                          value={selectedStaff.role}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            if (!canAssignRole(activeRole, newRole)) {
                              onToast(
                                'Escalation Prevented',
                                `Your active role (${activeRole}) cannot assign equal or higher role (${newRole}).`,
                                'warning'
                              );
                              logAuthorizationFailure(
                                'Current User',
                                activeRole,
                                'staff.role_change',
                                selectedStaff.fullName,
                                `Attempted to escalate role of ${selectedStaff.fullName} to ${newRole}`
                              );
                              return;
                            }
                            onUpdateStaff(selectedStaff.id, { role: newRole });
                            onToast('Role Profile Assigned', `Assigned new role ${newRole} to ${selectedStaff.fullName}.`, 'success');
                            onAddAuditLog('staff.role_change', selectedStaff.fullName, selectedStaff.role, newRole, 'Administrative direct role reassignment');
                            setSelectedStaff(prev => prev ? { ...prev, role: newRole } : null);
                          }}
                          className="w-full p-2 border border-blue-200 bg-white rounded text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 text-slate-800 focus:border-blue-500 outline-none"
                        >
                          {[
                            'Super Administrator', 'Platform Administrator', 'CEO', 'Executive Team', 
                            'Operations Manager', 'Operations Agent', 'Compliance Manager', 'Compliance Officer', 
                            'Fraud Manager', 'Fraud Analyst', 'Finance Manager', 'Finance Officer', 
                            'Treasury Manager', 'Support Manager', 'Support Agent', 'Security Analyst', 
                            'Developer', 'Auditor', 'Read Only Analyst'
                          ].map((role) => (
                            <option key={role} value={role} disabled={!canAssignRole(activeRole, role)}>
                              {role} {!canAssignRole(activeRole, role) ? '🔒' : ''}
                            </option>
                          ))}
                        </select>
                        <p className="text-[9px] text-slate-500 font-medium">Roles higher than or equal to your authority level are locked (🔒).</p>
                      </div>
                    ) : (
                      <div className="space-y-1 mt-1">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          {selectedStaff.role}
                        </span>
                        <p className="text-[10px] text-slate-400 italic">Role editing locked. Your active role authority level ({activeRole}) is insufficient to modify this staff member's role.</p>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-500 mt-2">Inherits permissions assigned to {selectedStaff.role} workspace group.</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Direct Permission Groups</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedStaff.assignedGroups.map(pg => (
                        <span key={pg} className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-bold">
                          {pg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Granular API Access Overrides</span>
                    <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                      {selectedStaff.customPermissions.map(pm => (
                        <span key={pm} className="text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.2 rounded font-semibold">
                          {pm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions Tab */}
              {activeProfileTab === 'sessions' && (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {selectedStaff.sessions.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-mono border rounded-lg bg-slate-50">
                      No live active sessions found.
                    </div>
                  ) : (
                    selectedStaff.sessions.map(ses => (
                      <div key={ses.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 text-[11px] flex flex-col justify-between">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>{ses.browser} on {ses.os}</span>
                          <button
                            onClick={() => terminateSession(ses.id)}
                            className="text-red-600 hover:text-red-700 text-[10px] cursor-pointer hover:underline"
                          >
                            Terminate
                          </button>
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>IP: {ses.ipAddress}</span>
                          <span>{ses.location}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 mt-2 block">Started: {new Date(ses.loginTime).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Devices Tab */}
              {activeProfileTab === 'devices' && (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {selectedStaff.devices.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-mono border rounded-lg bg-slate-50">
                      No registered trusted devices.
                    </div>
                  ) : (
                    selectedStaff.devices.map(dev => (
                      <div key={dev.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 text-[11px] flex flex-col justify-between">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>{dev.name} ({dev.os})</span>
                          {dev.status !== 'Blocked' && (
                            <button
                              onClick={() => blockDevice(dev.id)}
                              className="text-amber-700 hover:text-amber-800 text-[10px] cursor-pointer hover:underline"
                            >
                              Blacklist
                            </button>
                          )}
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Hash: {dev.id.substring(0, 12)}...</span>
                          <span className={dev.status === 'Trusted' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                            {dev.status}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 mt-2 block">Last Active: {new Date(dev.lastActive).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons Panel */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs">
              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Administrative Action Suite</span>
              <div className="grid grid-cols-2 gap-2">
                {selectedStaff.status !== 'Active' && (
                  <button 
                    onClick={() => executeAction('activate', 'Activate Account')}
                    className="flex items-center justify-center gap-1.5 p-2 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Activate Staff
                  </button>
                )}
                {selectedStaff.status === 'Active' && (
                  <button 
                    onClick={() => executeAction('suspend', 'Suspend Account')}
                    className="flex items-center justify-center gap-1.5 p-2 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold transition-all cursor-pointer"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    Suspend Staff
                  </button>
                )}
                {selectedStaff.status !== 'Locked' && (
                  <button 
                    onClick={() => executeAction('lock', 'Lock Account')}
                    className="flex items-center justify-center gap-1.5 p-2 rounded bg-red-50 text-red-700 hover:bg-red-100 font-bold transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Lock Account
                  </button>
                )}
                {selectedStaff.status === 'Locked' && (
                  <button 
                    onClick={() => executeAction('unlock', 'Unlock Account')}
                    className="flex items-center justify-center gap-1.5 p-2 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-all cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Unlock Account
                  </button>
                )}
                
                <button 
                  onClick={() => executeAction('pw_reset', 'Reset Password')}
                  className="flex items-center justify-center gap-1.5 p-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-all cursor-pointer col-span-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  Reset Pass / Force Expiry
                </button>

                {!selectedStaff.mfaEnabled && (
                  <button 
                    onClick={() => executeAction('force_mfa', 'Force MFA Setup')}
                    className="flex items-center justify-center gap-1.5 p-2 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition-all cursor-pointer col-span-2"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Force MFA Setup
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs font-semibold h-full min-h-[500px] flex flex-col justify-center items-center">
            <Shield className="w-10 h-10 text-slate-300 mb-2" />
            Select a staff member from the directory grid on the left to review nested logs, active device signatures, authorization tokens, or trigger state adjustments.
          </div>
        )}
      </div>

      {/* Action Override Modal */}
      {currentAction && selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-left">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <Shield className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider">{currentAction.label}</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              You are performing a sensitive security state override on <b>{selectedStaff.fullName} ({selectedStaff.id})</b>. You must provide a formal corporate reason for audit trail transparency.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Reason for override</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="E.g., Temporary lock following failed biometric scan while traveling. Certified by Manager."
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded bg-slate-50 h-20 outline-none text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => setCurrentAction(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={!actionReason.trim()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded cursor-pointer shadow-sm"
                >
                  Authorise Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
