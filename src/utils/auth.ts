// Enterprise Role-Based Access Control (RBAC) & Authorization Engine for WalletPro

export type UserRole =
  | 'Super Administrator'
  | 'Platform Administrator'
  | 'CEO'
  | 'Executive Team'
  | 'Operations Manager'
  | 'Operations Agent'
  | 'Compliance Manager'
  | 'Compliance Officer'
  | 'Fraud Manager'
  | 'Fraud Analyst'
  | 'Finance Manager'
  | 'Finance Officer'
  | 'Treasury Manager'
  | 'Support Manager'
  | 'Support Agent'
  | 'Security Analyst'
  | 'Developer'
  | 'Auditor'
  | 'Read Only Analyst';

// Hierarchy score to prevent privilege escalation
export const ROLE_AUTHORITY_SCORES: Record<UserRole, number> = {
  'Super Administrator': 100,
  'CEO': 95,
  'Executive Team': 90,
  'Platform Administrator': 90,
  'Operations Manager': 80,
  'Compliance Manager': 80,
  'Fraud Manager': 80,
  'Finance Manager': 80,
  'Treasury Manager': 80,
  'Support Manager': 80,
  'Security Analyst': 70,
  'Developer': 70,
  'Compliance Officer': 65,
  'Fraud Analyst': 65,
  'Finance Officer': 65,
  'Operations Agent': 60,
  'Support Agent': 60,
  'Auditor': 50,
  'Read Only Analyst': 10,
};

// Check if a creator role is authorized to assign a target role
export const canAssignRole = (creatorRole: string, targetRole: string): boolean => {
  if (creatorRole === 'Super Administrator') return true;
  if (targetRole === 'Super Administrator') return false; // Only Super Admins can assign Super Administrator

  const creatorScore = ROLE_AUTHORITY_SCORES[creatorRole as UserRole] || 0;
  const targetScore = ROLE_AUTHORITY_SCORES[targetRole as UserRole] || 0;

  // No user may assign a role equal to or higher than their own authority
  return creatorScore > targetScore;
};

// Check if role is authorized to view a specific navigation group/workspace
export const isAuthorizedForWorkspace = (role: string, groupName: string): boolean => {
  const normalizedRole = role as UserRole;
  if (normalizedRole === 'Super Administrator' || normalizedRole === 'CEO' || normalizedRole === 'Executive Team') return true;

  switch (groupName) {
    case 'Executive':
      return true; // All authenticated employees can view executive dashboard / system indicators
    case 'Business Intelligence':
      return [
        'Platform Administrator',
        'Operations Manager',
        'Compliance Manager',
        'Fraud Manager',
        'Finance Manager',
        'Support Manager',
        'Compliance Officer',
        'Developer',
        'Operations Agent',
        'Auditor',
      ].includes(normalizedRole);
    case 'Identity & Access':
      return [
        'Platform Administrator',
        'Security Analyst',
        'Auditor',
        'Operations Manager',
        'Compliance Manager',
        'Fraud Manager',
        'Finance Manager',
        'Support Manager',
        'Developer',
      ].includes(normalizedRole);
    case 'Security Operations':
      return ['Platform Administrator', 'Security Analyst', 'Auditor', 'Read Only Analyst'].includes(normalizedRole);
    case 'Operations':
      return [
        'Platform Administrator',
        'Operations Manager',
        'Operations Agent',
        'Compliance Manager',
        'Compliance Officer',
        'Fraud Manager',
        'Fraud Analyst',
        'Finance Officer',
        'Treasury Manager',
        'Support Manager',
        'Auditor',
        'Read Only Analyst',
      ].includes(normalizedRole);
    case 'Compliance':
      return ['Compliance Manager', 'Compliance Officer', 'Auditor', 'Read Only Analyst'].includes(normalizedRole);
    case 'Risk':
      return ['Fraud Manager', 'Fraud Analyst', 'Compliance Officer', 'Auditor', 'Read Only Analyst'].includes(normalizedRole);
    case 'Finance':
      return ['Finance Manager', 'Finance Officer', 'Treasury Manager', 'Auditor', 'Read Only Analyst'].includes(normalizedRole);
    case 'Support':
      return [
        'Operations Manager',
        'Operations Agent',
        'Compliance Manager',
        'Compliance Officer',
        'Fraud Analyst',
        'Finance Officer',
        'Support Manager',
        'Support Agent',
        'Developer',
        'Read Only Analyst',
      ].includes(normalizedRole);
    case 'Platform':
    case 'Platform Administration':
      return ['Platform Administrator', 'Developer'].includes(normalizedRole);
    case 'Developer Portal':
    case 'Developers':
      return ['Platform Administrator', 'Developer'].includes(normalizedRole);
    default:
      return false;
  }
};

// Check if role is authorized to access a granular tab
export const isAuthorizedForTab = (role: string, tabId: string): boolean => {
  const normalizedRole = role as UserRole;
  if (normalizedRole === 'Super Administrator' || normalizedRole === 'CEO' || normalizedRole === 'Executive Team') return true;

  // Handle common modules
  if (tabId === 'dashboard') return true;

  if (tabId.startsWith('plat-')) {
    return ['Platform Administrator', 'Developer'].includes(normalizedRole);
  }

  if (tabId.startsWith('sec-')) {
    return ['Platform Administrator', 'Security Analyst', 'Auditor', 'Read Only Analyst'].includes(normalizedRole);
  }

  if (tabId.startsWith('dev-')) {
    return ['Platform Administrator', 'Developer'].includes(normalizedRole);
  }

  if (tabId.startsWith('bi-')) {
    const biMap: Record<string, string[]> = {
      'Platform Administrator': ['bi-executive-dashboard', 'bi-operational-analytics'],
      'Operations Manager': [
        'bi-executive-dashboard',
        'bi-operational-analytics',
        'bi-customer-analytics',
        'bi-transaction-analytics',
        'bi-wallet-analytics',
        'bi-card-analytics',
        'bi-support-analytics',
        'bi-custom-reports',
        'bi-scheduled-reports',
      ],
      'Finance Manager': [
        'bi-executive-dashboard',
        'bi-revenue-analytics',
        'bi-treasury-analytics',
        'bi-wallet-analytics',
        'bi-card-analytics',
        'bi-custom-reports',
        'bi-scheduled-reports',
      ],
      'Compliance Manager': [
        'bi-executive-dashboard',
        'bi-customer-analytics',
        'bi-compliance-analytics',
        'bi-custom-reports',
        'bi-scheduled-reports',
      ],
      'Fraud Manager': [
        'bi-executive-dashboard',
        'bi-transaction-analytics',
        'bi-fraud-analytics',
        'bi-custom-reports',
        'bi-scheduled-reports',
      ],
      'Support Manager': [
        'bi-executive-dashboard',
        'bi-support-analytics',
        'bi-customer-analytics',
        'bi-custom-reports',
        'bi-scheduled-reports',
      ],
      'Compliance Officer': [
        'bi-executive-dashboard',
        'bi-customer-analytics',
        'bi-compliance-analytics',
        'bi-custom-reports',
      ],
      'Developer': ['bi-executive-dashboard', 'bi-operational-analytics', 'bi-custom-reports'],
      'Operations Agent': ['bi-executive-dashboard', 'bi-customer-analytics', 'bi-support-analytics'],
      'Auditor': [
        'bi-executive-dashboard',
        'bi-compliance-analytics',
        'bi-fraud-analytics',
        'bi-treasury-analytics',
        'bi-custom-reports',
      ],
    };
    return (biMap[normalizedRole] || []).includes(tabId);
  }

  if (tabId.startsWith('iam-')) {
    if (['Platform Administrator'].includes(normalizedRole)) return true;
    if (normalizedRole === 'Security Analyst') {
      return [
        'iam-dashboard',
        'iam-staff',
        'iam-roles',
        'iam-permission-groups',
        'iam-permissions',
        'iam-access-policies',
        'iam-mfa-management',
        'iam-sessions',
        'iam-devices',
        'iam-login-history',
        'iam-password-policies',
        'iam-access-reviews',
        'iam-audit-logs',
      ].includes(tabId);
    }
    if (normalizedRole === 'Auditor') {
      return [
        'iam-dashboard',
        'iam-staff',
        'iam-departments',
        'iam-teams',
        'iam-roles',
        'iam-permission-groups',
        'iam-permissions',
        'iam-access-policies',
        'iam-audit-logs',
      ].includes(tabId);
    }
    if (
      normalizedRole === 'Operations Manager' ||
      normalizedRole === 'Compliance Manager' ||
      normalizedRole === 'Fraud Manager' ||
      normalizedRole === 'Finance Manager' ||
      normalizedRole === 'Support Manager'
    ) {
      return [
        'iam-dashboard',
        'iam-staff',
        'iam-invitations',
        'iam-departments',
        'iam-teams',
        'iam-access-reviews',
        'iam-sessions',
        'iam-devices',
        'iam-login-history',
      ].includes(tabId);
    }
    // Everyone else gets Dashboard, Directory, Sessions, Devices
    return ['iam-dashboard', 'iam-staff', 'iam-sessions', 'iam-devices'].includes(tabId);
  }

  // Workspaces specific tabs
  switch (normalizedRole) {
    case 'Platform Administrator':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'customers',
        'wallets',
        'transactions',
        'cards',
        'settlements',
        'refunds',
      ].includes(tabId);

    case 'Operations Manager':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'customers',
        'wallets',
        'transactions',
        'cards',
        'settlements',
        'refunds',
        'limits',
        'card-orders',
        'card-transactions',
        'card-limits',
        'card-controls',
        'card-security',
        'support-dashboard',
        'tickets',
        'support-cases',
        'live-chat',
        'customer-communication',
        'escalations',
        'knowledge-base',
        'macros',
        'sla-management',
      ].includes(tabId);

    case 'Operations Agent':
      return [
        'dashboard',
        'customers',
        'wallets',
        'transactions',
        'cards',
        'settlements',
        'refunds',
        'limits',
        'card-orders',
        'card-transactions',
        'card-limits',
        'card-controls',
        'card-security',
        'support-dashboard',
        'tickets',
        'support-cases',
        'live-chat',
        'customer-communication',
        'escalations',
        'knowledge-base',
        'macros',
        'sla-management',
      ].includes(tabId);

    case 'Compliance Manager':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'customers',
        'wallets',
        'kyc-queue',
        'identity-verification',
        'aml-screening',
        'sanctions-screening',
        'pep-screening',
        'compliance-cases',
      ].includes(tabId);

    case 'Compliance Officer':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'customers',
        'wallets',
        'transactions',
        'cards',
        'kyc-queue',
        'identity-verification',
        'aml-screening',
        'sanctions-screening',
        'pep-screening',
        'compliance-cases',
        'alerts',
        'investigations',
        'support-dashboard',
        'tickets',
        'support-cases',
        'live-chat',
        'customer-communication',
        'escalations',
        'knowledge-base',
        'macros',
        'sla-management',
      ].includes(tabId);

    case 'Fraud Manager':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'transactions',
        'cards',
        'fraud-dashboard',
        'fraud-alerts',
        'risk-monitoring',
        'investigations',
        'fraud-cases',
        'frozen-accounts',
        'velocity-rules',
        'aml-risk',
        'behavior-analytics',
        'watchlists',
        'fraud-center',
        'alerts',
      ].includes(tabId);

    case 'Fraud Analyst':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'transactions',
        'cards',
        'fraud-dashboard',
        'fraud-alerts',
        'risk-monitoring',
        'investigations',
        'fraud-cases',
        'frozen-accounts',
        'velocity-rules',
        'aml-risk',
        'behavior-analytics',
        'watchlists',
        'fraud-center',
        'alerts',
        'support-dashboard',
        'tickets',
        'support-cases',
        'live-chat',
        'customer-communication',
        'escalations',
        'knowledge-base',
        'macros',
        'sla-management',
      ].includes(tabId);

    case 'Finance Manager':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'treasury-dashboard',
        'treasury-liquidity',
        'treasury-settlements',
        'treasury-reconciliation',
        'treasury-revenue',
        'treasury-fees',
        'treasury-reserve-accounts',
        'treasury-bank-accounts',
        'treasury-accounting',
        'treasury-financial-reports',
        'treasury',
      ].includes(tabId);

    case 'Finance Officer':
    case 'Treasury Manager':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'treasury-dashboard',
        'treasury-liquidity',
        'treasury-settlements',
        'treasury-reconciliation',
        'treasury-revenue',
        'treasury-fees',
        'treasury-reserve-accounts',
        'treasury-bank-accounts',
        'treasury-accounting',
        'treasury-financial-reports',
        'treasury',
        'support-dashboard',
        'tickets',
        'support-cases',
        'live-chat',
        'customer-communication',
        'escalations',
        'knowledge-base',
        'macros',
        'sla-management',
      ].includes(tabId);

    case 'Support Manager':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'customers',
        'support-dashboard',
        'tickets',
        'support-cases',
        'live-chat',
        'customer-communication',
        'escalations',
        'knowledge-base',
        'macros',
        'sla-management',
      ].includes(tabId);

    case 'Support Agent':
      return [
        'dashboard',
        'support-dashboard',
        'tickets',
        'support-cases',
        'live-chat',
        'customer-communication',
        'escalations',
        'knowledge-base',
        'macros',
        'sla-management',
      ].includes(tabId);

    case 'Developer':
      return [
        'dashboard',
        'audit',
        'support-dashboard',
        'tickets',
        'support-cases',
        'live-chat',
        'customer-communication',
        'escalations',
        'knowledge-base',
        'macros',
        'sla-management',
      ].includes(tabId);

    case 'Security Analyst':
      return ['dashboard', 'analytics', 'reports', 'audit'].includes(tabId);

    case 'Auditor':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'kyc-queue',
        'identity-verification',
        'aml-screening',
        'sanctions-screening',
        'pep-screening',
        'compliance-cases',
        'fraud-dashboard',
        'fraud-alerts',
        'risk-monitoring',
        'investigations',
        'fraud-cases',
        'frozen-accounts',
        'velocity-rules',
        'aml-risk',
        'behavior-analytics',
        'watchlists',
        'fraud-center',
        'alerts',
        'treasury-dashboard',
        'treasury-liquidity',
        'treasury-settlements',
        'treasury-reconciliation',
        'treasury-revenue',
        'treasury-fees',
        'treasury-reserve-accounts',
        'treasury-bank-accounts',
        'treasury-accounting',
        'treasury-financial-reports',
        'treasury',
      ].includes(tabId);

    case 'Read Only Analyst':
      return [
        'dashboard',
        'analytics',
        'reports',
        'audit',
        'customers',
        'wallets',
        'transactions',
        'cards',
        'settlements',
        'refunds',
        'kyc-queue',
        'identity-verification',
        'aml-screening',
        'sanctions-screening',
        'pep-screening',
        'compliance-cases',
        'fraud-dashboard',
        'fraud-alerts',
        'risk-monitoring',
        'investigations',
        'fraud-cases',
        'frozen-accounts',
        'velocity-rules',
        'aml-risk',
        'behavior-analytics',
        'watchlists',
        'fraud-center',
        'alerts',
        'treasury-dashboard',
        'treasury-liquidity',
        'treasury-settlements',
        'treasury-reconciliation',
        'treasury-revenue',
        'treasury-fees',
        'treasury-reserve-accounts',
        'treasury-bank-accounts',
        'treasury-accounting',
        'treasury-financial-reports',
        'treasury',
        'support-dashboard',
        'tickets',
        'support-cases',
        'live-chat',
        'customer-communication',
        'escalations',
        'knowledge-base',
        'macros',
        'sla-management',
      ].includes(tabId);

    default:
      return false;
  }
};

// Check if role has action permission
export const hasActionPermission = (role: string, action: string): boolean => {
  const normalizedRole = role as UserRole;
  if (normalizedRole === 'Super Administrator') return true;

  // Read only role has absolutely zero write permissions
  if (normalizedRole === 'Read Only Analyst' || normalizedRole === 'Auditor') {
    return false;
  }

  switch (action) {
    case 'staff.create':
    case 'staff.suspend':
    case 'staff.delete':
      return [
        'Platform Administrator',
        'Operations Manager',
        'Compliance Manager',
        'Fraud Manager',
        'Finance Manager',
        'Support Manager',
        'CEO',
        'Executive Team',
      ].includes(normalizedRole);

    case 'kyc.approve':
      return ['Compliance Manager', 'Compliance Officer', 'CEO', 'Executive Team'].includes(normalizedRole);

    case 'wallet.freeze':
      return [
        'Platform Administrator',
        'Fraud Manager',
        'Fraud Analyst',
        'Compliance Manager',
        'Compliance Officer',
        'CEO',
        'Executive Team',
      ].includes(normalizedRole);

    case 'transaction.reverse':
      return ['Finance Manager', 'Finance Officer', 'Treasury Manager', 'Operations Manager', 'CEO', 'Executive Team'].includes(normalizedRole);

    case 'card.issue':
      return ['Operations Manager', 'Operations Agent', 'CEO', 'Executive Team'].includes(normalizedRole);

    case 'report.export':
      // Only Managers, security, or executives can export corporate records
      return [
        'Platform Administrator',
        'Operations Manager',
        'Compliance Manager',
        'Fraud Manager',
        'Finance Manager',
        'Treasury Manager',
        'Support Manager',
        'Security Analyst',
        'CEO',
        'Executive Team',
      ].includes(normalizedRole);

    case 'settings.modify':
      return ['Platform Administrator', 'CEO', 'Executive Team'].includes(normalizedRole);

    case 'api.generate_key':
    case 'api.delete_key':
      return ['Platform Administrator', 'Developer', 'CEO', 'Executive Team'].includes(normalizedRole);

    default:
      return false;
  }
};

// Log authorization failures in localStorage
export interface AuthFailureLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  reason: string;
}

export const logAuthorizationFailure = (
  user: string,
  role: string,
  action: string,
  resource: string,
  reason: string
) => {
  try {
    const logsKey = 'walletpro_auth_failures_log';
    const existing = localStorage.getItem(logsKey);
    const logs: AuthFailureLog[] = existing ? JSON.parse(existing) : [];

    const newFailure: AuthFailureLog = {
      id: `AUTH-FAIL-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      resource,
      reason,
    };

    logs.unshift(newFailure);
    // Keep max 100 entries
    localStorage.setItem(logsKey, JSON.stringify(logs.slice(0, 100)));

    // Also dispatch a custom event to update any active UI listening to logs
    window.dispatchEvent(new CustomEvent('walletpro_auth_failures_updated'));
  } catch (e) {
    console.error('Failed to log authorization failure:', e);
  }
};
