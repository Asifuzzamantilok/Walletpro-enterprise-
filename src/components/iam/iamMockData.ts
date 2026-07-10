export interface IAMDevice {
  id: string;
  name: string;
  type: 'Desktop' | 'Mobile' | 'Tablet';
  os: string;
  browser: string;
  lastIp: string;
  lastActive: string;
  status: 'Trusted' | 'Blocked' | 'Unknown';
  riskScore: number;
}

export interface IAMSession {
  id: string;
  deviceId: string;
  location: string;
  browser: string;
  os: string;
  ipAddress: string;
  loginTime: string;
  lastActivity: string;
  isCurrent: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  status: 'Success' | 'Failed';
  country: string;
  city: string;
  device: string;
  browser: string;
  ip: string;
  riskScore: number;
  failureReason?: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: 'Info' | 'Warning' | 'Critical';
  event: string;
  details: string;
  ip: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  username: string;
  email: string;
  department: 'Operations' | 'Compliance' | 'Fraud' | 'Finance' | 'Treasury' | 'Support' | 'Engineering' | 'Platform' | 'Security' | 'Executive';
  team: string;
  jobTitle: string;
  role: string;
  status: 'Active' | 'Suspended' | 'Locked';
  mfaEnabled: boolean;
  mfaType: 'Authenticator App' | 'SMS' | 'Email' | 'Hardware Security Key' | 'None';
  lastLogin: string;
  lastActivity: string;
  manager: string;
  phone: string;
  startDate: string;
  assignedGroups: string[];
  customPermissions: string[];
  devices: IAMDevice[];
  sessions: IAMSession[];
  loginHistory: LoginHistoryEntry[];
  securityEvents: SecurityEvent[];
}

export interface IAMInvitation {
  id: string;
  email: string;
  department: string;
  role: string;
  expiryDate: string;
  status: 'Pending' | 'Accepted' | 'Expired' | 'Cancelled';
  invitedBy: string;
  invitedAt: string;
  auditTrail: { timestamp: string; action: string; user: string; details: string }[];
}

export interface IAMDepartment {
  name: string;
  head: string;
  staffCount: number;
  teamsCount: number;
  description: string;
}

export interface IAMTeam {
  id: string;
  name: string;
  department: string;
  manager: string;
  members: string[]; // employee IDs
  createdDate: string;
}

export interface IAMRole {
  name: string;
  inheritsFrom?: string;
  description: string;
  permissionGroups: string[];
  directPermissions: string[];
  isCustom: boolean;
}

export interface IAMPermission {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface IAMPermissionGroup {
  name: string;
  description: string;
  permissions: string[]; // permission IDs
}

export interface IAMAccessPolicy {
  id: string;
  name: string;
  type: 'Business Hours' | 'Country Restriction' | 'IP Allow List' | 'Device Trust' | 'Risk-Based Auth' | 'Session Timeout';
  description: string;
  config: Record<string, any>;
  isEnabled: boolean;
}

export interface IAMAccessReview {
  id: string;
  title: string;
  reviewer: string;
  dueDate: string;
  status: 'In Progress' | 'Completed' | 'Overdue';
  scope: string;
  certifiedCount: number;
  revokedCount: number;
  totalItems: number;
  history: { employeeId: string; employeeName: string; permission: string; action: 'Certified' | 'Revoked'; timestamp: string; reviewer: string; reason: string }[];
}

export interface IAMApprovalWorkflow {
  id: string;
  actionType: 'Create Platform Administrator' | 'Delete Administrator' | 'Modify Critical Permissions' | 'Change Security Policies' | 'Disable MFA' | 'Export Sensitive Data' | 'Approve Settlement Overrides';
  requestedBy: string;
  requestedAt: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  details: Record<string, any>;
  approvers: { name: string; status: 'Pending' | 'Approved' | 'Rejected'; timestamp?: string }[];
}

export interface IAMAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  where: string; // IP & Location
  prevValue: string;
  newValue: string;
  reason: string;
}

export interface IAMPasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  expirationDays: number;
  preventReuseCount: number;
  allowTemporaryPasswords: boolean;
}

export const SEED_DEPARTMENTS: IAMDepartment[] = [
  { name: 'Executive', head: 'Alexandra Vance', staffCount: 3, teamsCount: 1, description: 'C-Suite leadership and organizational strategy' },
  { name: 'Operations', head: 'Marcus Cole', staffCount: 14, teamsCount: 3, description: 'Core fintech customer operations, wallet management, and transactions' },
  { name: 'Compliance', head: 'Eleanor Sterling', staffCount: 8, teamsCount: 2, description: 'Regulatory, AML screening, and KYC validation' },
  { name: 'Fraud', head: 'Victor Sterling', staffCount: 6, teamsCount: 2, description: 'Risk mitigation, chargeback investigation, and fraud analysis' },
  { name: 'Finance', head: 'Sarah Jenkins', staffCount: 5, teamsCount: 2, description: 'Corporate accounting, ledger auditing, and financial reporting' },
  { name: 'Treasury', head: 'Christian Cole', staffCount: 4, teamsCount: 1, description: 'Liquidity, sweeping, reserve account balancing, and bank relations' },
  { name: 'Support', head: 'Jonathan Vance', staffCount: 12, teamsCount: 3, description: 'Customer tickets, escalations, live chat support, and SLA management' },
  { name: 'Engineering', head: 'Davin Miller', staffCount: 18, teamsCount: 4, description: 'Platform core codebase, developer tools, and API integrations' },
  { name: 'Platform', head: 'Davin Miller', staffCount: 5, teamsCount: 1, description: 'Infrastructure, systems security, and workspace deployments' },
  { name: 'Security', head: 'Diana Prince', staffCount: 4, teamsCount: 1, description: 'IAM policies, cyber defense, SIEM, and data privacy' },
];

export const SEED_PERMISSIONS: IAMPermission[] = [
  { id: 'users.read', name: 'users.read', category: 'Customers', description: 'Read detailed profile data of end-users' },
  { id: 'users.write', name: 'users.write', category: 'Customers', description: 'Modify end-user profile details' },
  { id: 'wallets.freeze', name: 'wallets.freeze', category: 'Wallets', description: 'Freeze or unfreeze client ledger accounts' },
  { id: 'wallets.credit', name: 'wallets.credit', category: 'Wallets', description: 'Credit funds manually to wallets' },
  { id: 'wallets.debit', name: 'wallets.debit', category: 'Wallets', description: 'Debit funds manually from wallets' },
  { id: 'cards.issue', name: 'cards.issue', category: 'Cards', description: 'Issue physical or virtual corporate/user debit cards' },
  { id: 'cards.freeze', name: 'cards.freeze', category: 'Cards', description: 'Temporarily lock or permanently terminate debit cards' },
  { id: 'transactions.refund', name: 'transactions.refund', category: 'Transactions', description: 'Refund completed settlements' },
  { id: 'transactions.reverse', name: 'transactions.reverse', category: 'Transactions', description: 'Reverse processing or stuck transactions' },
  { id: 'kyc.approve', name: 'kyc.approve', category: 'Compliance', description: 'Review and approve customer KYC applications' },
  { id: 'fraud.resolve', name: 'fraud.resolve', category: 'Fraud', description: 'Resolve or close active fraud incidents' },
  { id: 'reports.export', name: 'reports.export', category: 'Reporting', description: 'Download sensitive corporate files and BI logs' },
  { id: 'settings.update', name: 'settings.update', category: 'Platform', description: 'Update system-wide feature flags and constants' },
  { id: 'api.manage', name: 'api.manage', category: 'Developers', description: 'Generate and revoke high-priority API keys' },
  { id: 'staff.invite', name: 'staff.invite', category: 'IAM', description: 'Invite new administrative personnel to the workspace' },
  { id: 'staff.manage', name: 'staff.manage', category: 'IAM', description: 'Suspend, lock, and manage active administrative staff' },
  { id: 'permission.manage', name: 'permission.manage', category: 'IAM', description: 'Edit custom roles, permission groups, and security thresholds' },
];

export const SEED_PERMISSION_GROUPS: IAMPermissionGroup[] = [
  { name: 'Executive', description: 'Full access to financial, operational, and staff telemetry', permissions: ['users.read', 'reports.export', 'settings.update', 'staff.invite', 'staff.manage', 'permission.manage'] },
  { name: 'Operations', description: 'Customer workspace management, wallet balancing, and card issues', permissions: ['users.read', 'users.write', 'wallets.freeze', 'cards.issue', 'cards.freeze'] },
  { name: 'Compliance', description: 'Access to KYC pipeline, AML triggers, and screening reports', permissions: ['users.read', 'kyc.approve', 'reports.export'] },
  { name: 'Fraud', description: 'Risk monitors, chargebacks, velocity rules, and account locks', permissions: ['users.read', 'wallets.freeze', 'cards.freeze', 'fraud.resolve'] },
  { name: 'Finance', description: 'Refund approvals, manual accounting entries, and general ledger auditing', permissions: ['users.read', 'wallets.credit', 'wallets.debit', 'transactions.refund', 'reports.export'] },
  { name: 'Support', description: 'Read customer details, issue minor adjustments, reset security logs', permissions: ['users.read', 'users.write', 'cards.freeze'] },
  { name: 'Engineering', description: 'API, webhooks, sandbox configurations, and platform telemetry', permissions: ['settings.update', 'api.manage'] },
  { name: 'Platform', description: 'Complete administrative controls over infrastructure and authentication logs', permissions: ['settings.update', 'api.manage', 'staff.invite', 'staff.manage', 'permission.manage'] },
];

export const SEED_ROLES: IAMRole[] = [
  { name: 'Super Administrator', description: 'Absolute owner with unconstrained platform control.', permissionGroups: ['Executive', 'Platform', 'Operations', 'Compliance', 'Fraud', 'Finance', 'Support', 'Engineering'], directPermissions: ['users.write', 'wallets.credit', 'wallets.debit', 'transactions.reverse', 'kyc.approve', 'fraud.resolve', 'reports.export', 'api.manage', 'staff.invite', 'staff.manage', 'permission.manage'], isCustom: false },
  { name: 'Platform Administrator', inheritsFrom: 'Super Administrator', description: 'Responsible for core infrastructure, APIs, and staff security controls.', permissionGroups: ['Platform', 'Engineering', 'Executive'], directPermissions: ['settings.update', 'api.manage', 'staff.invite', 'staff.manage', 'permission.manage'], isCustom: false },
  { name: 'Operations Manager', description: 'Manages core wallet, transaction, card processing pipelines and operational staff.', permissionGroups: ['Operations', 'Support'], directPermissions: ['users.write', 'wallets.freeze', 'cards.issue', 'cards.freeze', 'transactions.reverse'], isCustom: false },
  { name: 'Operations Agent', description: 'Performs day-to-day user profile updates and standard card inquiries.', permissionGroups: ['Support'], directPermissions: ['users.read', 'users.write'], isCustom: false },
  { name: 'Compliance Manager', description: 'Leads legal audits, regulatory filings, and oversees escalated compliance workflows.', permissionGroups: ['Compliance', 'Executive'], directPermissions: ['users.read', 'kyc.approve', 'reports.export', 'permission.manage'], isCustom: false },
  { name: 'Compliance Officer', description: 'Validates daily KYC queue items and flags potential AML screening anomalies.', permissionGroups: ['Compliance'], directPermissions: ['users.read', 'kyc.approve'], isCustom: false },
  { name: 'Fraud Manager', description: 'Designs real-time velocity policies and handles major card freeze triggers.', permissionGroups: ['Fraud', 'Executive'], directPermissions: ['users.read', 'wallets.freeze', 'cards.freeze', 'fraud.resolve', 'reports.export'], isCustom: false },
  { name: 'Fraud Analyst', description: 'Investigates flagged alerts, chargeback requests, and behavioral trends.', permissionGroups: ['Fraud'], directPermissions: ['users.read', 'cards.freeze', 'fraud.resolve'], isCustom: false },
  { name: 'Finance Manager', description: 'Authorizes settlement overrides, large manual corrections, and corporate accounting reports.', permissionGroups: ['Finance', 'Executive'], directPermissions: ['users.read', 'wallets.credit', 'wallets.debit', 'transactions.refund', 'reports.export'], isCustom: false },
  { name: 'Finance Officer', description: 'Performs ledger reconciliation checks and initiates standard customer refunds.', permissionGroups: ['Finance'], directPermissions: ['users.read', 'transactions.refund'], isCustom: false },
  { name: 'Treasury Manager', description: 'Balances external reserve bank pools and monitors financial sweep status.', permissionGroups: ['Finance'], directPermissions: ['reports.export', 'wallets.credit'], isCustom: false },
  { name: 'Support Manager', description: 'Configures SLA schedules, custom chat macros, and reviews agent chat feedback.', permissionGroups: ['Support', 'Executive'], directPermissions: ['users.read', 'users.write', 'reports.export'], isCustom: false },
  { name: 'Support Agent', description: 'Responds to customer queries, answers tickets, and provides portal feedback.', permissionGroups: ['Support'], directPermissions: ['users.read'], isCustom: false },
  { name: 'Security Analyst', description: 'Manages IP allowlists, password entropy guidelines, and MFA configurations.', permissionGroups: ['Platform'], directPermissions: ['settings.update', 'permission.manage'], isCustom: false },
  { name: 'Developer', description: 'Configures sandbox APIs, tests integrations, and analyzes system log traces.', permissionGroups: ['Engineering'], directPermissions: ['settings.update'], isCustom: false },
  { name: 'Auditor', description: 'Read-only access to all reports, ledger tables, and compliance timeline histories.', permissionGroups: [], directPermissions: ['users.read', 'reports.export'], isCustom: false },
  { name: 'Read Only Analyst', description: 'Restricted dashboard access to check transaction histories and operational charts.', permissionGroups: [], directPermissions: ['users.read'], isCustom: false },
];

export const SEED_TEAMS: IAMTeam[] = [
  { id: 'TEAM-001', name: 'Executive Council', department: 'Executive', manager: 'Alexandra Vance', members: ['EMP-101', 'EMP-102', 'EMP-103'], createdDate: '2023-01-01' },
  { id: 'TEAM-002', name: 'Fintech User Support', department: 'Support', manager: 'Jonathan Vance', members: ['EMP-403', 'EMP-404', 'EMP-405'], createdDate: '2024-05-12' },
  { id: 'TEAM-003', name: 'AML Screening Squad', department: 'Compliance', manager: 'Eleanor Sterling', members: ['EMP-201', 'EMP-202', 'EMP-203'], createdDate: '2023-09-18' },
  { id: 'TEAM-004', name: 'Chargeback Investigators', department: 'Fraud', manager: 'Victor Sterling', members: ['EMP-301', 'EMP-302'], createdDate: '2024-02-14' },
  { id: 'TEAM-005', name: 'Ledger Balancing Desk', department: 'Finance', manager: 'Sarah Jenkins', members: ['EMP-501', 'EMP-502'], createdDate: '2024-01-10' },
];

export const SEED_ACCESS_POLICIES: IAMAccessPolicy[] = [
  { id: 'POL-001', name: 'Standard Business Hours Strict Enforcement', type: 'Business Hours', description: 'Restricts non-manager staff from executing modifications (write actions) outside 07:00 - 20:00 UTC.', config: { startHour: '07:00', endHour: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], exemptRoles: ['Super Administrator', 'CEO', 'Executive Team'] }, isEnabled: true },
  { id: 'POL-002', name: 'OFAC Sanctioned Country Block', type: 'Country Restriction', description: 'Blocks access attempts originating from restricted regions, sanction lists, and high-risk zones.', config: { blockedCountries: ['RU', 'KP', 'IR', 'SY', 'CU'], alertChannel: '#security-alerts' }, isEnabled: true },
  { id: 'POL-003', name: 'HQ IP Range Validation', type: 'IP Allow List', description: 'Enforces high-privilege operations (e.g. key issuance, permissions editing) to occur only from corporate VPN IP subnets.', config: { allowList: ['102.164.88.*', '12.44.180.22'], blockMismatches: true }, isEnabled: true },
  { id: 'POL-004', name: 'Enforce Trusted Workspace Devices', type: 'Device Trust', description: 'Prevents credentials from signing in on mobile/desktop devices without certified enterprise security certificates.', config: { requireCert: true, allowUnknownWithMfa: false }, isEnabled: false },
  { id: 'POL-005', name: 'Risk-Based Step-Up MFA Challenge', type: 'Risk-Based Auth', description: 'Triggers automatic hardware token / authenticator verification when logging in from a new city or abnormal hours.', config: { sensitivity: 'High', action: 'Step-up MFA' }, isEnabled: true },
  { id: 'POL-006', name: 'Inactive Operator Automatic Session Logoff', type: 'Session Timeout', description: 'Automatically invalidates administrative browser sessions after 15 minutes of inactivity.', config: { timeoutMinutes: 15 }, isEnabled: true }
];

export const SEED_STAFF: StaffMember[] = [
  {
    id: 'EMP-101',
    fullName: 'Alexandra Vance',
    username: 'alexandra.vance',
    email: 'tilok.mania@gmail.com', // Assigned to user's real email so it matches active agent context
    department: 'Executive',
    team: 'Executive Council',
    jobTitle: 'CEO',
    role: 'CEO',
    status: 'Active',
    mfaEnabled: true,
    mfaType: 'Hardware Security Key',
    lastLogin: '2026-07-10 01:45',
    lastActivity: '2026-07-10 02:19',
    manager: 'Board of Directors',
    phone: '+1 (555) 019-2831',
    startDate: '2023-01-01',
    assignedGroups: ['Executive', 'Platform'],
    customPermissions: ['users.read', 'users.write', 'wallets.freeze', 'permission.manage'],
    devices: [
      { id: 'DEV-8812', name: 'Corporate MacBook Pro M3 Max', type: 'Desktop', os: 'macOS Sonoma', browser: 'Safari', lastIp: '102.164.88.10', lastActive: '2026-07-10 02:19', status: 'Trusted', riskScore: 1 },
      { id: 'DEV-8813', name: 'CEO iPhone 17 Pro', type: 'Mobile', os: 'iOS 19.4', browser: 'Safari Mobile', lastIp: '102.164.88.10', lastActive: '2026-07-10 02:15', status: 'Trusted', riskScore: 1 }
    ],
    sessions: [
      { id: 'SES-91822', deviceId: 'DEV-8812', location: 'Singapore, Downtown Core', browser: 'Safari 19.1', os: 'macOS', ipAddress: '102.164.88.10', loginTime: '2026-07-10 01:45', lastActivity: '2026-07-10 02:19', isCurrent: true }
    ],
    loginHistory: [
      { id: 'LH-1092', timestamp: '2026-07-10 01:45', status: 'Success', country: 'Singapore', city: 'Singapore', device: 'Corporate MacBook Pro M3 Max', browser: 'Safari 19.1', ip: '102.164.88.10', riskScore: 0.01 },
      { id: 'LH-1091', timestamp: '2026-07-09 09:12', status: 'Success', country: 'Singapore', city: 'Singapore', device: 'Corporate MacBook Pro M3 Max', browser: 'Safari 19.1', ip: '102.164.88.10', riskScore: 0.01 }
    ],
    securityEvents: [
      { id: 'SEC-101', timestamp: '2026-07-08 14:12', severity: 'Info', event: 'MFA_REGISTRATION_UPDATE', details: 'Registered secondary backup Hardware Security Key YubiKey 5C', ip: '102.164.88.10' }
    ]
  },
  {
    id: 'EMP-201',
    fullName: 'Eleanor Sterling',
    username: 'eleanor.sterling',
    email: 'eleanor.sterling@walletpro.com',
    department: 'Compliance',
    team: 'AML Screening Squad',
    jobTitle: 'Compliance Officer',
    role: 'Compliance Officer',
    status: 'Active',
    mfaEnabled: true,
    mfaType: 'Authenticator App',
    lastLogin: '2026-07-10 00:12',
    lastActivity: '2026-07-10 01:54',
    manager: 'Alexandra Vance',
    phone: '+1 (555) 304-2094',
    startDate: '2023-09-18',
    assignedGroups: ['Compliance'],
    customPermissions: ['kyc.approve'],
    devices: [
      { id: 'DEV-7701', name: 'Workplace ThinkPad X1 Carbon', type: 'Desktop', os: 'Windows 11', browser: 'Chrome', lastIp: '102.164.88.15', lastActive: '2026-07-10 01:54', status: 'Trusted', riskScore: 2 }
    ],
    sessions: [
      { id: 'SES-88203', deviceId: 'DEV-7701', location: 'London, UK', browser: 'Chrome 125.0', os: 'Windows 11', ipAddress: '102.164.88.15', loginTime: '2026-07-10 00:12', lastActivity: '2026-07-10 01:54', isCurrent: false }
    ],
    loginHistory: [
      { id: 'LH-2001', timestamp: '2026-07-10 00:12', status: 'Success', country: 'United Kingdom', city: 'London', device: 'Workplace ThinkPad X1 Carbon', browser: 'Chrome 125.0', ip: '102.164.88.15', riskScore: 0.05 }
    ],
    securityEvents: []
  },
  {
    id: 'EMP-301',
    fullName: 'Victor Sterling',
    username: 'vsterl',
    email: 'victor.sterling@walletpro.com',
    department: 'Fraud',
    team: 'Chargeback Investigators',
    jobTitle: 'Fraud Lead Analyst',
    role: 'Fraud Manager',
    status: 'Active',
    mfaEnabled: true,
    mfaType: 'Authenticator App',
    lastLogin: '2026-07-10 01:10',
    lastActivity: '2026-07-10 02:12',
    manager: 'Marcus Cole',
    phone: '+1 (555) 902-1823',
    startDate: '2024-02-14',
    assignedGroups: ['Fraud', 'Operations'],
    customPermissions: ['wallets.freeze', 'cards.freeze'],
    devices: [
      { id: 'DEV-3010', name: 'MacBook Air - Victor', type: 'Desktop', os: 'macOS Sequoia', browser: 'Chrome', lastIp: '184.22.90.114', lastActive: '2026-07-10 02:12', status: 'Trusted', riskScore: 3 }
    ],
    sessions: [
      { id: 'SES-30101', deviceId: 'DEV-3010', location: 'Chicago, US', browser: 'Chrome 124.0', os: 'macOS', ipAddress: '184.22.90.114', loginTime: '2026-07-10 01:10', lastActivity: '2026-07-10 02:12', isCurrent: false }
    ],
    loginHistory: [
      { id: 'LH-3001', timestamp: '2026-07-10 01:10', status: 'Success', country: 'United States', city: 'Chicago', device: 'MacBook Air - Victor', browser: 'Chrome 124.0', ip: '184.22.90.114', riskScore: 0.12 }
    ],
    securityEvents: [
      { id: 'SEC-301', timestamp: '2026-07-09 17:34', severity: 'Warning', event: 'GEO_IMPOSSIBLE_TRAVEL_PASS', details: 'Successful sign-in from Chicago, US. Flagged by Risk scoring as travel bypass approved.', ip: '184.22.90.114' }
    ]
  },
  {
    id: 'EMP-403',
    fullName: 'Jonathan Vance',
    username: 'jvance',
    email: 'jonathan.vance@walletpro.com',
    department: 'Support',
    team: 'Fintech User Support',
    jobTitle: 'Support Team Manager',
    role: 'Support Manager',
    status: 'Active',
    mfaEnabled: true,
    mfaType: 'SMS',
    lastLogin: '2026-07-09 08:30',
    lastActivity: '2026-07-09 17:40',
    manager: 'Marcus Cole',
    phone: '+1 (555) 441-2940',
    startDate: '2024-05-12',
    assignedGroups: ['Support'],
    customPermissions: [],
    devices: [
      { id: 'DEV-4040', name: 'Office iMac 24"', type: 'Desktop', os: 'macOS Big Sur', browser: 'Chrome', lastIp: '102.164.88.20', lastActive: '2026-07-09 17:40', status: 'Trusted', riskScore: 2 }
    ],
    sessions: [],
    loginHistory: [
      { id: 'LH-4001', timestamp: '2026-07-09 08:30', status: 'Success', country: 'Singapore', city: 'Singapore', device: 'Office iMac 24"', browser: 'Chrome 124.0', ip: '102.164.88.20', riskScore: 0.05 }
    ],
    securityEvents: []
  },
  {
    id: 'EMP-501',
    fullName: 'Sarah Jenkins',
    username: 'sjenkins',
    email: 'sarah.jenkins@walletpro.com',
    department: 'Finance',
    team: 'Ledger Balancing Desk',
    jobTitle: 'Head of Ledger Control',
    role: 'Finance Manager',
    status: 'Suspended',
    mfaEnabled: true,
    mfaType: 'Authenticator App',
    lastLogin: '2026-07-05 10:15',
    lastActivity: '2026-07-05 12:45',
    manager: 'Alexandra Vance',
    phone: '+1 (555) 781-9923',
    startDate: '2024-01-10',
    assignedGroups: ['Finance'],
    customPermissions: ['users.read', 'wallets.credit', 'transactions.refund'],
    devices: [
      { id: 'DEV-5050', name: 'Home iMac 27"', type: 'Desktop', os: 'macOS Monterey', browser: 'Safari', lastIp: '112.94.10.88', lastActive: '2026-07-05 12:45', status: 'Blocked', riskScore: 9 }
    ],
    sessions: [],
    loginHistory: [
      { id: 'LH-5001', timestamp: '2026-07-05 10:15', status: 'Success', country: 'Singapore', city: 'Singapore', device: 'Home iMac 27"', browser: 'Safari', ip: '112.94.10.88', riskScore: 0.45 },
      { id: 'LH-5002', timestamp: '2026-07-05 09:30', status: 'Failed', country: 'Russia', city: 'Moscow', device: 'Unknown Linux Box', browser: 'Firefox', ip: '95.24.120.14', riskScore: 9.8, failureReason: 'Invalid Password' }
    ],
    securityEvents: [
      { id: 'SEC-501', timestamp: '2026-07-05 09:31', severity: 'Critical', event: 'BRUTE_FORCE_TRIGGERED', details: 'Brute force attempts detected from Moscow, RU against user sjenkins. Suspended account for security precautions.', ip: '95.24.120.14' }
    ]
  },
  {
    id: 'EMP-602',
    fullName: 'Davin Miller',
    username: 'davin.miller',
    email: 'davin.miller@walletpro.com',
    department: 'Engineering',
    team: 'Infrastructure Security Core',
    jobTitle: 'Principal Platform Arch',
    role: 'Developer',
    status: 'Locked',
    mfaEnabled: false,
    mfaType: 'None',
    lastLogin: '2026-07-09 23:14',
    lastActivity: '2026-07-09 23:59',
    manager: 'Alexandra Vance',
    phone: '+1 (555) 102-4022',
    startDate: '2023-04-12',
    assignedGroups: ['Engineering'],
    customPermissions: ['settings.update', 'api.manage'],
    devices: [
      { id: 'DEV-6060', name: 'Personal Laptop', type: 'Desktop', os: 'Ubuntu 24.04', browser: 'Firefox', lastIp: '204.14.88.9', lastActive: '2026-07-09 23:59', status: 'Unknown', riskScore: 8 }
    ],
    sessions: [],
    loginHistory: [
      { id: 'LH-6001', timestamp: '2026-07-09 23:14', status: 'Success', country: 'Vietnam', city: 'Hanoi', device: 'Personal Laptop', browser: 'Firefox', ip: '204.14.88.9', riskScore: 0.85 },
      { id: 'LH-6002', timestamp: '2026-07-09 23:12', status: 'Failed', country: 'Vietnam', city: 'Hanoi', device: 'Personal Laptop', browser: 'Firefox', ip: '204.14.88.9', riskScore: 0.85, failureReason: 'MFA Verification Timeout' }
    ],
    securityEvents: [
      { id: 'SEC-602', timestamp: '2026-07-09 23:15', severity: 'Warning', event: 'PASSWORD_COMPROMISE_SUSPECT', details: 'Account logged in from uncertified country without standard Hardware key. Automatically locked account.', ip: '204.14.88.9' }
    ]
  }
];

export const SEED_INVITATIONS: IAMInvitation[] = [
  { id: 'INV-4412', email: 'fintech-officer@walletpro.com', department: 'Operations', role: 'Operations Agent', expiryDate: '2026-07-17 00:00', status: 'Pending', invitedBy: 'tilok.mania@gmail.com', invitedAt: '2026-07-10 01:22', auditTrail: [{ timestamp: '2026-07-10 01:22', action: 'INVITE_CREATED', user: 'tilok.mania@gmail.com', details: 'Sent invitation email to fintech-officer@walletpro.com with role Operations Agent' }] },
  { id: 'INV-4390', email: 'reg-officer@walletpro.com', department: 'Compliance', role: 'Compliance Officer', expiryDate: '2026-07-15 12:00', status: 'Pending', invitedBy: 'tilok.mania@gmail.com', invitedAt: '2026-07-08 12:00', auditTrail: [{ timestamp: '2026-07-08 12:00', action: 'INVITE_CREATED', user: 'tilok.mania@gmail.com', details: 'Sent invitation email to reg-officer@walletpro.com with role Compliance Officer' }] },
  { id: 'INV-3910', email: 'developer1@walletpro.com', department: 'Engineering', role: 'Developer', expiryDate: '2026-07-01 00:00', status: 'Expired', invitedBy: 'alexandra.vance@walletpro.com', invitedAt: '2026-06-24 00:00', auditTrail: [{ timestamp: '2026-06-24 00:00', action: 'INVITE_CREATED', user: 'alexandra.vance@walletpro.com', details: 'Sent invitation email to developer1@walletpro.com with role Developer' }, { timestamp: '2026-07-01 00:01', action: 'INVITE_EXPIRED', user: 'System', details: 'Invitation expired automatically after 7 days.' }] },
  { id: 'INV-3210', email: 'auditor.lead@walletpro.com', department: 'Compliance', role: 'Auditor', expiryDate: '2026-06-20 00:00', status: 'Accepted', invitedBy: 'alexandra.vance@walletpro.com', invitedAt: '2026-06-13 00:00', auditTrail: [{ timestamp: '2026-06-13 00:00', action: 'INVITE_CREATED', user: 'alexandra.vance@walletpro.com', details: 'Sent invitation email to auditor.lead@walletpro.com' }, { timestamp: '2026-06-14 10:14', action: 'INVITE_ACCEPTED', user: 'auditor.lead@walletpro.com', details: 'Invitation accepted and account registered.' }] },
  { id: 'INV-2884', email: 'ex-contractor@walletpro.com', department: 'Support', role: 'Support Agent', expiryDate: '2026-05-12 00:00', status: 'Cancelled', invitedBy: 'alexandra.vance@walletpro.com', invitedAt: '2026-05-05 00:00', auditTrail: [{ timestamp: '2026-05-05 00:00', action: 'INVITE_CREATED', user: 'alexandra.vance@walletpro.com', details: 'Sent invitation email to ex-contractor@walletpro.com' }, { timestamp: '2026-05-06 14:02', action: 'INVITE_CANCELLED', user: 'alexandra.vance@walletpro.com', details: 'Revoked invitation prior to client response.' }] },
];

export const SEED_ACCESS_REVIEWS: IAMAccessReview[] = [
  {
    id: 'REV-001',
    title: 'Q2 2026 Compliance & AML Privilege Recertification',
    reviewer: 'Eleanor Sterling',
    dueDate: '2026-07-25',
    status: 'In Progress',
    scope: 'All active employees in Compliance and Fraud departments',
    certifiedCount: 3,
    revokedCount: 1,
    totalItems: 8,
    history: [
      { employeeId: 'EMP-201', employeeName: 'Eleanor Sterling', permission: 'kyc.approve', action: 'Certified', timestamp: '2026-07-08 09:15', reviewer: 'Eleanor Sterling', reason: 'Required for active KYC verification duty.' },
      { employeeId: 'EMP-301', employeeName: 'Victor Sterling', permission: 'wallets.freeze', action: 'Certified', timestamp: '2026-07-08 09:17', reviewer: 'Eleanor Sterling', reason: 'Critical for high-risk card security enforcement.' },
      { employeeId: 'EMP-301', employeeName: 'Victor Sterling', permission: 'users.write', action: 'Revoked', timestamp: '2026-07-08 09:18', reviewer: 'Eleanor Sterling', reason: 'Unnecessary modification privilege for risk screening.' }
    ]
  },
  {
    id: 'REV-002',
    title: 'HQ System Keys & Platform Administrator Sweep',
    reviewer: 'Alexandra Vance',
    dueDate: '2026-07-05',
    status: 'Completed',
    scope: 'Employees holding the Super Admin or Platform Admin role',
    certifiedCount: 2,
    revokedCount: 1,
    totalItems: 3,
    history: [
      { employeeId: 'EMP-101', employeeName: 'Alexandra Vance', permission: 'permission.manage', action: 'Certified', timestamp: '2026-07-04 11:20', reviewer: 'Alexandra Vance', reason: 'CEO primary ownership' },
      { employeeId: 'EMP-602', employeeName: 'Davin Miller', permission: 'api.manage', action: 'Revoked', timestamp: '2026-07-04 11:25', reviewer: 'Alexandra Vance', reason: 'Revoked due to security incident investigation.' }
    ]
  }
];

export const SEED_APPROVAL_WORKFLOWS: IAMApprovalWorkflow[] = [
  {
    id: 'WRK-4401',
    actionType: 'Create Platform Administrator',
    requestedBy: 'alexandra.vance',
    requestedAt: '2026-07-10 01:10',
    status: 'Pending Approval',
    details: { employeeName: 'Robert Vance', username: 'robert.vance', email: 'rvance@walletpro.com', department: 'Platform' },
    approvers: [
      { name: 'Diana Prince', status: 'Approved', timestamp: '2026-07-10 01:40' },
      { name: 'Marcus Cole', status: 'Pending' }
    ]
  },
  {
    id: 'WRK-4299',
    actionType: 'Disable MFA',
    requestedBy: 'eleanor.sterling@walletpro.com',
    requestedAt: '2026-07-09 14:22',
    status: 'Rejected',
    details: { targetEmployeeId: 'EMP-403', targetEmployeeName: 'Jonathan Vance', reason: 'Phone lost on personal travel. Need emergency SMS reset.' },
    approvers: [
      { name: 'Alexandra Vance', status: 'Rejected', timestamp: '2026-07-09 15:10' }
    ]
  },
  {
    id: 'WRK-4100',
    actionType: 'Approve Settlement Overrides',
    requestedBy: 'finance-lead@walletpro.com',
    requestedAt: '2026-07-08 10:00',
    status: 'Approved',
    details: { limitIncrease: 'USD 5,000,000 sweep to Reserve Account A', overrideCode: 'SWEEP-OVERRIDE-A' },
    approvers: [
      { name: 'Alexandra Vance', status: 'Approved', timestamp: '2026-07-08 10:15' }
    ]
  }
];

export const SEED_AUDIT_LOGS: IAMAuditLog[] = [
  { id: 'IAM-AUD-9921', timestamp: '2026-07-10 02:15:10', actor: 'tilok.mania@gmail.com', action: 'SUSPEND_STAFF', target: 'EMP-501 (Sarah Jenkins)', where: '102.164.88.10 (Singapore)', prevValue: 'Active', newValue: 'Suspended', reason: 'Triggered preventive lock following multi-factor fail log' },
  { id: 'IAM-AUD-9910', timestamp: '2026-07-10 01:24:05', actor: 'tilok.mania@gmail.com', action: 'UPDATE_ACCESS_POLICY', target: 'HQ IP Range Validation', where: '102.164.88.10 (Singapore)', prevValue: 'isEnabled: false', newValue: 'isEnabled: true', reason: 'Enforce strict VPN policies during audit week' },
  { id: 'IAM-AUD-9892', timestamp: '2026-07-09 21:12:44', actor: 'eleanor.sterling@walletpro.com', action: 'CERTIFY_PRIVILEGE', target: 'EMP-201 (Eleanor Sterling)', where: '102.164.88.15 (London)', prevValue: 'kyc.approve: Pending Review', newValue: 'kyc.approve: Certified', reason: 'Q2 Periodic recertification sweep' },
  { id: 'IAM-AUD-9840', timestamp: '2026-07-09 15:10:02', actor: 'alexandra.vance', action: 'REJECT_WORKFLOW', target: 'WRK-4299 (Disable MFA for EMP-403)', where: '102.164.88.10 (Singapore)', prevValue: 'Pending Approval', newValue: 'Rejected', reason: 'Policy strictly prohibits MFA disabling without photo identity verification.' }
];

export const DEFAULT_PASSWORD_POLICY: IAMPasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  expirationDays: 90,
  preventReuseCount: 5,
  allowTemporaryPasswords: true
};
