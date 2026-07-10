import React, { useState, useEffect } from 'react';
import { 
  SEED_STAFF, SEED_INVITATIONS, SEED_ROLES, SEED_PERMISSIONS, 
  SEED_PERMISSION_GROUPS, SEED_ACCESS_REVIEWS, SEED_APPROVAL_WORKFLOWS, SEED_AUDIT_LOGS,
  StaffMember, IAMRole, IAMPermission, IAMInvitation, IAMSession, IAMDevice,
  IAMApprovalWorkflow, IAMAccessReview, IAMAuditLog, IAMPermissionGroup
} from './iamMockData';
import { IamDashboard } from './IamDashboard';
import { IamStaffDirectory } from './IamStaffDirectory';
import { IamAccessPolicies } from './IamAccessPolicies';
import { IamRolePermission } from './IamRolePermission';
import { IamWorkflowsLogs } from './IamWorkflowsLogs';
import { IamInfrastructure } from './IamInfrastructure';

interface IdentityAccessCenterProps {
  activeSubTab: string;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  onSelectTab: (tabId: string) => void;
}

export default function IdentityAccessCenter({ activeSubTab, onToast, onSelectTab }: IdentityAccessCenterProps) {
  // Unified Root Security State
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const local = localStorage.getItem('walletpro_iam_staff');
    return local ? JSON.parse(local) : SEED_STAFF;
  });

  const [invitations, setInvitations] = useState<IAMInvitation[]>(() => {
    const local = localStorage.getItem('walletpro_iam_invitations');
    return local ? JSON.parse(local) : SEED_INVITATIONS;
  });

  const [roles, setRoles] = useState<IAMRole[]>(() => {
    const local = localStorage.getItem('walletpro_iam_roles');
    return local ? JSON.parse(local) : SEED_ROLES;
  });

  const [workflows, setWorkflows] = useState<IAMApprovalWorkflow[]>(() => {
    const local = localStorage.getItem('walletpro_iam_workflows');
    return local ? JSON.parse(local) : SEED_APPROVAL_WORKFLOWS;
  });

  const [reviews, setReviews] = useState<IAMAccessReview[]>(() => {
    const local = localStorage.getItem('walletpro_iam_reviews');
    return local ? JSON.parse(local) : SEED_ACCESS_REVIEWS;
  });

  const [auditLogs, setAuditLogs] = useState<IAMAuditLog[]>(() => {
    const local = localStorage.getItem('walletpro_iam_auditlogs');
    return local ? JSON.parse(local) : SEED_AUDIT_LOGS;
  });

  // State persistence effect
  useEffect(() => {
    localStorage.setItem('walletpro_iam_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('walletpro_iam_invitations', JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    localStorage.setItem('walletpro_iam_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('walletpro_iam_workflows', JSON.stringify(workflows));
  }, [workflows]);

  useEffect(() => {
    localStorage.setItem('walletpro_iam_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('walletpro_iam_auditlogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Action Mutators
  const handleUpdateStaff = (staffId: string, updates: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, ...updates } : s));
  };

  const handleAddInvitation = (inv: IAMInvitation) => {
    setInvitations(prev => [inv, ...prev]);
  };

  const handleUpdateInvitation = (id: string, updates: Partial<IAMInvitation>) => {
    setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  };

  const handleAddRole = (newRole: IAMRole) => {
    setRoles(prev => [...prev, newRole]);
  };

  const handleUpdateRole = (roleName: string, updates: Partial<IAMRole>) => {
    setRoles(prev => prev.map(r => r.name === roleName ? { ...r, ...updates } : r));
  };

  const handleUpdateWorkflow = (id: string, updates: Partial<IAMApprovalWorkflow>) => {
    setWorkflows(prev => prev.map(wf => wf.id === id ? { ...wf, ...updates } : wf));
  };

  const handleUpdateReview = (id: string, updates: Partial<IAMAccessReview>) => {
    setReviews(prev => prev.map(rev => rev.id === id ? { ...rev, ...updates } : rev));
  };

  // Add audit record
  const handleAddAuditLog = (action: string, target: string, prevValue: string, newValue: string, reason: string) => {
    const newLog: IAMAuditLog = {
      id: `AUD-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      actor: 'Super Administrator', // simulated logged in user
      action,
      target,
      prevValue,
      newValue,
      reason,
      where: '192.168.1.100 (London, GB)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Routing render helpers
  const isDashboardTab = activeSubTab === 'iam-dashboard';
  const isStaffTab = activeSubTab === 'iam-staff';
  const isInvitationsTab = activeSubTab === 'iam-invitations';
  const isDepartmentsTab = activeSubTab === 'iam-departments';
  const isTeamsTab = activeSubTab === 'iam-teams';
  const isRolesTab = activeSubTab === 'iam-roles';
  const isPermissionGroupsTab = activeSubTab === 'iam-permission-groups';
  const isPermissionsTab = activeSubTab === 'iam-permissions';
  const isAccessPoliciesTab = activeSubTab === 'iam-access-policies';
  const isApprovalWorkflowsTab = activeSubTab === 'iam-approval-workflows';
  const isMfaManagementTab = activeSubTab === 'iam-mfa-management';
  const isSessionsTab = activeSubTab === 'iam-sessions';
  const isDevicesTab = activeSubTab === 'iam-devices';
  const isLoginHistoryTab = activeSubTab === 'iam-login-history';
  const isPasswordPoliciesTab = activeSubTab === 'iam-password-policies';
  const isAccessReviewsTab = activeSubTab === 'iam-access-reviews';
  const isAuditLogsTab = activeSubTab === 'iam-audit-logs';
  const isAdminUsersTab = activeSubTab === 'iam-admin-users';

  return (
    <div id="iam-platform-shell" className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-6">
      
      {/* Dynamic Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <span>Security Operations Console</span>
            <span>/</span>
            <span className="text-blue-600">Identity & Access Platform (IAM)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isDashboardTab && 'Staff Analytics Dashboard'}
            {isStaffTab && 'Personnel Directory'}
            {isAdminUsersTab && 'Administrative Operators'}
            {isInvitationsTab && 'Invitations Dispatcher'}
            {isDepartmentsTab && 'Corporate Divisions Map'}
            {isTeamsTab && 'Functional Team Desks'}
            {isRolesTab && 'Role Hierarchies'}
            {isPermissionGroupsTab && 'Reusable Permission Packets'}
            {isPermissionsTab && 'Granular Access Matrix'}
            {isAccessPoliciesTab && 'Global Security Policies'}
            {isApprovalWorkflowsTab && 'Maker-Checker Approval Pipeline'}
            {isMfaManagementTab && 'MFA Access Controls'}
            {isSessionsTab && 'Live Active Sessions'}
            {isDevicesTab && 'Trusted Hardwares Registry'}
            {isLoginHistoryTab && 'Biometric Sign-In Logs'}
            {isPasswordPoliciesTab && 'Password Regulation Parameters'}
            {isAccessReviewsTab && 'Access Recertification Campaigns'}
            {isAuditLogsTab && 'Security Telemetry Trail'}
          </h1>
          <p className="text-xs text-slate-500">
            {isDashboardTab && 'Live statistical summary of logins, MFA status, and device risk ratings.'}
            {isStaffTab && 'Search, filter, edit access groups, reset passwords, or trigger operator locks.'}
            {isAdminUsersTab && 'Inspect active administrator accounts, permissions, and security overrides.'}
            {isInvitationsTab && 'Dispatch encrypted onboarding links and audit outstanding handshakes.'}
            {isDepartmentsTab && 'Structure departmental nodes, supervisors, and headcount stats.'}
            {isTeamsTab && 'Divide operators into distinct functional cells with dedicated team leads.'}
            {isRolesTab && 'Edit inheritable role properties, map permission groupings, and custom overrides.'}
            {isPermissionGroupsTab && 'Organize permissions into logical business packets for bulk assignment.'}
            {isPermissionsTab && 'Reference full grid of granular API gates and operational risks.'}
            {isAccessPoliciesTab && 'Maintain VPN perimeters, IP allowlists, geofencing blocklists, and idle bounds.'}
            {isApprovalWorkflowsTab && 'Manage maker-checker pipeline requests to alter critical platform parameters.'}
            {isMfaManagementTab && 'Enforce MFA rules, audit tokens, and generate Break-Glass backup keys.'}
            {isSessionsTab && 'Monitor live session tokens, geolocation properties, and issue instant revocations.'}
            {isDevicesTab && 'Inspect registered client hardware keys and flag suspicious endpoints.'}
            {isLoginHistoryTab && 'Review authentication timestamps, fail states, and calculated threat indexes.'}
            {isPasswordPoliciesTab && 'Adjust NIST compliance regulators like minimum character bounds and aging rules.'}
            {isAccessReviewsTab && 'Run quarterly recertifications to ensure minimal permission compliance.'}
            {isAuditLogsTab && 'Immutable cryptographic log trace capturing WHO, WHAT, WHEN, and WHY.'}
          </p>
        </div>

        {/* Global Security Status Widget */}
        <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex items-center gap-3 shadow-sm shrink-0 self-start md:self-auto font-mono text-[10px]">
          <div className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div className="text-left font-semibold">
            <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">DIRECTORY SYNC STATUS</span>
            <span className="text-slate-700">OK — CLOUD FIREWALL ON</span>
          </div>
        </div>
      </div>

      {/* Main Tabbed Router Rendering */}
      <div id="iam-tabbed-view" className="transition-all duration-300">
        {isDashboardTab && (
          <IamDashboard 
            staff={staff} 
            invitations={invitations} 
            onSelectTab={onSelectTab} 
            onToast={onToast} 
          />
        )}

        {(isStaffTab || isAdminUsersTab) && (
          <IamStaffDirectory
            staff={isStaffTab ? staff : staff.filter(s => ['Super Administrator', 'Platform Administrator', 'Security Analyst'].includes(s.role))}
            onUpdateStaff={handleUpdateStaff}
            onAddAuditLog={handleAddAuditLog}
            onToast={onToast}
            onInviteClick={() => onSelectTab('iam-invitations')}
          />
        )}

        {(isInvitationsTab || isDepartmentsTab || isTeamsTab) && (
          <IamInfrastructure
            invitations={invitations}
            sessions={staff.flatMap(s => s.sessions)}
            devices={staff.flatMap(s => s.devices)}
            staff={staff}
            onAddInvitation={handleAddInvitation}
            onUpdateInvitation={handleUpdateInvitation}
            onAddAuditLog={handleAddAuditLog}
            onToast={onToast}
          />
        )}

        {(isAccessPoliciesTab || isMfaManagementTab || isPasswordPoliciesTab) && (
          <IamAccessPolicies
            onAddAuditLog={handleAddAuditLog}
            onToast={onToast}
          />
        )}

        {(isRolesTab || isPermissionGroupsTab || isPermissionsTab) && (
          <IamRolePermission
            roles={roles}
            permissions={SEED_PERMISSIONS}
            permissionGroups={SEED_PERMISSION_GROUPS}
            onAddRole={handleAddRole}
            onUpdateRole={handleUpdateRole}
            onAddAuditLog={handleAddAuditLog}
            onToast={onToast}
          />
        )}

        {(isApprovalWorkflowsTab || isAccessReviewsTab || isAuditLogsTab || isSessionsTab || isDevicesTab || isLoginHistoryTab) && (
          <IamWorkflowsLogs
            workflows={workflows}
            reviews={reviews}
            auditLogs={auditLogs}
            onUpdateWorkflow={handleUpdateWorkflow}
            onUpdateReview={handleUpdateReview}
            onAddAuditLog={handleAddAuditLog}
            onToast={onToast}
          />
        )}
      </div>
    </div>
  );
}
