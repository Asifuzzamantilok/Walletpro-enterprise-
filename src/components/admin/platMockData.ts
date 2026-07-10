export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  gradualRollout: number; // 0 to 100
  environments: string[]; // ['dev', 'staging', 'prod']
  lastUpdated: string;
}

export interface BusinessRule {
  id: string;
  category: string;
  name: string;
  key: string;
  value: string;
  unit: string;
  description: string;
}

export interface WalletConfig {
  id: string;
  walletType: string;
  minBalance: number;
  maxBalance: number;
  dailyLimit: number;
  dormancyMonths: number;
  dormancyFee: number;
}

export interface CardProgramConfig {
  id: string;
  programName: string;
  dailySpendLimit: number;
  singleTxLimit: number;
  atmWithdrawalLimit: number;
  virtualCardEnabled: boolean;
  physicalCardEnabled: boolean;
  expiryMonths: number;
}

export interface FeeRule {
  id: string;
  name: string;
  type: 'transfer' | 'card' | 'atm' | 'withdrawal' | 'fx' | 'merchant';
  fixedAmount: number;
  percentageRate: number;
  currency: string;
  minFee: number;
  maxFee: number;
}

export interface ExchangeRate {
  id: string;
  currencyCode: string;
  name: string;
  rateVsUsd: number;
  provider: string;
  manualOverride: boolean;
  lastSync: string;
  status: 'SYNCHRONIZED' | 'MANUAL' | 'OUT_OF_SYNC';
}

export interface CountryRegionRule {
  id: string;
  countryCode: string;
  countryName: string;
  status: 'SUPPORTED' | 'RESTRICTED';
  supportedLanguages: string[];
  supportedCurrencies: string[];
  localTaxRate: number;
  customRulesCount: number;
}

export interface NotificationTemplate {
  id: string;
  type: 'email' | 'sms' | 'push';
  name: string;
  trigger: string;
  subject?: string;
  content: string;
  variables: string[];
  lastModified: string;
}

export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  lastRun: string;
  nextRun: string;
  avgDurationMs: number;
}

export interface SystemService {
  id: string;
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  latencyMs: number;
  availability: number; // e.g. 99.98
  healthScore: number; // 0 to 100
}

export interface StorageFile {
  id: string;
  name: string;
  category: 'document' | 'media' | 'system';
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface BackupPoint {
  id: string;
  name: string;
  timestamp: string;
  sizeBytes: number;
  status: 'COMPLETED' | 'FAILED' | 'RESTORING';
  checksum: string;
}

export interface PlatAuditLog {
  id: string;
  actor: string;
  action: string;
  oldValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
  approved: boolean;
  approvedBy?: string;
}

// INITIAL SEED DATA
export const SEED_FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'flag-1', name: 'Biometric Login Enforcement', key: 'auth.biometric.mandatory', description: 'Enforce biometric setups for all administrative consoles', enabled: true, gradualRollout: 100, environments: ['dev', 'staging', 'prod'], lastUpdated: '2026-07-01T12:00:00Z' },
  { id: 'flag-2', name: 'Instant Settlement Routing', key: 'settlement.instant.routing', description: 'Route high-tier settlements through secondary fast corridors', enabled: false, gradualRollout: 10, environments: ['dev', 'staging'], lastUpdated: '2026-07-05T09:30:00Z' },
  { id: 'flag-3', name: 'Generative AI Support Co-pilot', key: 'support.ai.copilot', description: 'Enable smart suggestions for tier-1 support agents', enabled: true, gradualRollout: 50, environments: ['dev', 'staging', 'prod'], lastUpdated: '2026-07-09T15:45:00Z' },
  { id: 'flag-4', name: 'Dynamic FX Hedging Layer', key: 'finance.fx.dynamic_hedge', description: 'Real-time liquidity buffer management for cross-border currency pools', enabled: false, gradualRollout: 0, environments: ['dev'], lastUpdated: '2026-07-08T11:15:00Z' },
  { id: 'flag-5', name: 'Virtual Card Apple Pay Provisions', key: 'card.apple_pay.virtual', description: 'Allow newly provisioned virtual cards to immediately link with Apple Wallet', enabled: true, gradualRollout: 80, environments: ['staging', 'prod'], lastUpdated: '2026-07-02T16:20:00Z' }
];

export const SEED_BUSINESS_RULES: BusinessRule[] = [
  { id: 'rule-1', category: 'Transfer Limits', name: 'Standard Transfer Limit', key: 'limits.transfer.standard', value: '10000', unit: 'USD', description: 'Maximum amount for standard client bank-transfers' },
  { id: 'rule-2', category: 'Withdrawal Limits', name: 'Daily ATM Withdrawal Cap', key: 'limits.withdrawal.atm_daily', value: '2000', unit: 'USD', description: 'Maximum cumulative ATM withdrawals per calendar day' },
  { id: 'rule-3', category: 'Deposit Limits', name: 'ACH Auto-deposit Maximum', key: 'limits.deposit.ach_max', value: '50000', unit: 'USD', description: 'Maximum amount allowed for self-initiated ACH deposits' },
  { id: 'rule-4', category: 'Velocity Rules', name: 'Hourly Transaction Count Cap', key: 'velocity.tx_count.hourly', value: '15', unit: 'transactions', description: 'Trigger review if user surpasses transactions count in one hour' },
  { id: 'rule-5', category: 'Risk Thresholds', name: 'Sanctions Match Severity Trigger', key: 'risk.screening.match_trigger', value: '0.85', unit: 'score', description: 'Similarity ratio threshold for manual screening triggers' },
  { id: 'rule-6', category: 'Settlement Windows', name: 'End-of-Day Settlement Time', key: 'settlement.eod.cutoff', value: '16:30', unit: 'UTC', description: 'Time of final day routing batches lock' }
];

export const SEED_WALLET_CONFIGS: WalletConfig[] = [
  { id: 'w-c-1', walletType: 'Standard Consumer', minBalance: 0, maxBalance: 100000, dailyLimit: 5000, dormancyMonths: 12, dormancyFee: 5.00 },
  { id: 'w-c-2', walletType: 'Premium Tier VIP', minBalance: 10, maxBalance: 1000000, dailyLimit: 50000, dormancyMonths: 24, dormancyFee: 0.00 },
  { id: 'w-c-3', walletType: 'Enterprise Merchant Corporate', minBalance: 100, maxBalance: 10000000, dailyLimit: 500000, dormancyMonths: 36, dormancyFee: 25.00 }
];

export const SEED_CARD_PROGRAMS: CardProgramConfig[] = [
  { id: 'c-p-1', programName: 'Classic Visa Consumer', dailySpendLimit: 5000, singleTxLimit: 1500, atmWithdrawalLimit: 500, virtualCardEnabled: true, physicalCardEnabled: true, expiryMonths: 36 },
  { id: 'c-p-2', programName: 'Corporate Platinum Master', dailySpendLimit: 25000, singleTxLimit: 10000, atmWithdrawalLimit: 2000, virtualCardEnabled: true, physicalCardEnabled: true, expiryMonths: 48 },
  { id: 'c-p-3', programName: 'Virtual Only Fast-Track', dailySpendLimit: 1500, singleTxLimit: 500, atmWithdrawalLimit: 0, virtualCardEnabled: true, physicalCardEnabled: false, expiryMonths: 12 }
];

export const SEED_FEE_RULES: FeeRule[] = [
  { id: 'fee-1', name: 'Domestic Peer Transfer Fee', type: 'transfer', fixedAmount: 0.25, percentageRate: 0.00, currency: 'USD', minFee: 0.25, maxFee: 5.00 },
  { id: 'fee-2', name: 'International Wire Processing Fee', type: 'transfer', fixedAmount: 15.00, percentageRate: 0.005, currency: 'USD', minFee: 15.00, maxFee: 150.00 },
  { id: 'fee-3', name: 'Premium Virtual Card Issue', type: 'card', fixedAmount: 0.00, percentageRate: 0.00, currency: 'USD', minFee: 0.00, maxFee: 0.00 },
  { id: 'fee-4', name: 'Physical Card Delivery Fee', type: 'card', fixedAmount: 9.99, percentageRate: 0.00, currency: 'USD', minFee: 9.99, maxFee: 9.99 },
  { id: 'fee-5', name: 'Out-of-Network ATM Surcharge', type: 'atm', fixedAmount: 2.50, percentageRate: 0.01, currency: 'USD', minFee: 2.50, maxFee: 10.00 },
  { id: 'fee-6', name: 'Cross Border FX Conversion Markup', type: 'fx', fixedAmount: 0.00, percentageRate: 0.012, currency: 'USD', minFee: 0.00, maxFee: 250.00 },
  { id: 'fee-7', name: 'Standard Merchant Inward Rate', type: 'merchant', fixedAmount: 0.15, percentageRate: 0.024, currency: 'USD', minFee: 0.15, maxFee: 1000.00 }
];

export const SEED_EXCHANGE_RATES: ExchangeRate[] = [
  { id: 'rate-1', currencyCode: 'EUR', name: 'Euro', rateVsUsd: 1.085, provider: 'OANDA Core Sync', manualOverride: false, lastSync: '2026-07-10T06:50:00Z', status: 'SYNCHRONIZED' },
  { id: 'rate-2', currencyCode: 'GBP', name: 'British Pound Sterling', rateVsUsd: 1.282, provider: 'Bloomberg Terminal Engine', manualOverride: false, lastSync: '2026-07-10T06:48:00Z', status: 'SYNCHRONIZED' },
  { id: 'rate-3', currencyCode: 'CAD', name: 'Canadian Dollar', rateVsUsd: 0.732, provider: 'OANDA Core Sync', manualOverride: false, lastSync: '2026-07-10T06:45:00Z', status: 'SYNCHRONIZED' },
  { id: 'rate-4', currencyCode: 'JPY', name: 'Japanese Yen', rateVsUsd: 0.00621, provider: 'Bloomberg Terminal Engine', manualOverride: true, lastSync: '2026-07-10T01:00:00Z', status: 'MANUAL' },
  { id: 'rate-5', currencyCode: 'AUD', name: 'Australian Dollar', rateVsUsd: 0.665, provider: 'OANDA Core Sync', manualOverride: false, lastSync: '2026-07-10T05:30:00Z', status: 'OUT_OF_SYNC' }
];

export const SEED_COUNTRIES: CountryRegionRule[] = [
  { id: 'country-1', countryCode: 'US', countryName: 'United States', status: 'SUPPORTED', supportedLanguages: ['EN', 'ES'], supportedCurrencies: ['USD'], localTaxRate: 0.00, customRulesCount: 4 },
  { id: 'country-2', countryCode: 'GB', countryName: 'United Kingdom', status: 'SUPPORTED', supportedLanguages: ['EN'], supportedCurrencies: ['GBP', 'EUR'], localTaxRate: 0.20, customRulesCount: 2 },
  { id: 'country-3', countryCode: 'DE', countryName: 'Germany', status: 'SUPPORTED', supportedLanguages: ['DE', 'EN'], supportedCurrencies: ['EUR'], localTaxRate: 0.19, customRulesCount: 3 },
  { id: 'country-4', countryCode: 'KP', countryName: 'North Korea', status: 'RESTRICTED', supportedLanguages: [], supportedCurrencies: [], localTaxRate: 0, customRulesCount: 0 },
  { id: 'country-5', countryCode: 'IR', countryName: 'Iran', status: 'RESTRICTED', supportedLanguages: [], supportedCurrencies: [], localTaxRate: 0, customRulesCount: 0 },
  { id: 'country-6', countryCode: 'SG', countryName: 'Singapore', status: 'SUPPORTED', supportedLanguages: ['EN', 'ZH'], supportedCurrencies: ['SGD', 'USD'], localTaxRate: 0.09, customRulesCount: 1 }
];

export const SEED_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  { id: 't-1', type: 'email', name: 'Welcome & Onboarding Checkpoint', trigger: 'User.Created', subject: 'Welcome to WalletPro Enterprise Platform', content: 'Dear {{user_name}},\n\nYour enterprise grade financial wallet has been successfully provisioned. Your primary system id is {{account_id}}.\n\nBest Regards,\nWalletPro Admin', variables: ['user_name', 'account_id'], lastModified: '2026-07-01T10:00:00Z' },
  { id: 't-2', type: 'email', name: 'High Risk Login Alert Alert', trigger: 'Auth.AnomalyDetected', subject: '[Alert] Suspicious Action Detected', content: 'Hello {{user_name}},\n\nA login attempt has been intercepted from IP address: {{ip_address}} in country: {{country}}.\n\nIf this was not you, please immediately lock your credentials.', variables: ['user_name', 'ip_address', 'country'], lastModified: '2026-07-09T14:30:00Z' },
  { id: 't-3', type: 'sms', name: 'MFA OTP Challenge code', trigger: 'Auth.MfaTrigger', content: 'WalletPro Security verification code: {{otp_code}}. Expires in 3 minutes. Do NOT share this code.', variables: ['otp_code'], lastModified: '2026-06-20T08:00:00Z' },
  { id: 't-4', type: 'push', name: 'Deposit Complete Notice', trigger: 'Wallet.InboundSuccess', content: 'Success! Inbound deposit of {{amount}} {{currency}} has cleared into Wallet {{wallet_id}}.', variables: ['amount', 'currency', 'wallet_id'], lastModified: '2026-07-05T11:00:00Z' }
];

export const SEED_SCHEDULED_JOBS: ScheduledJob[] = [
  { id: 'job-1', name: 'Daily Ledger Settlement Reconciliation', schedule: '0 0 * * *', status: 'IDLE', lastRun: '2026-07-10T00:00:00Z', nextRun: '2026-07-11T00:00:00Z', avgDurationMs: 45210 },
  { id: 'job-2', name: 'Dormant Account Management Checker', schedule: '0 2 * * *', status: 'IDLE', lastRun: '2026-07-10T02:00:00Z', nextRun: '2026-07-11T02:00:00Z', avgDurationMs: 124500 },
  { id: 'job-3', name: 'Bloomberg Forex Sync Daemon', schedule: '*/15 * * * *', status: 'RUNNING', lastRun: '2026-07-10T06:45:00Z', nextRun: '2026-07-10T07:00:00Z', avgDurationMs: 1250 },
  { id: 'job-4', name: 'Daily Compliance Screening Scan', schedule: '0 3 * * *', status: 'COMPLETED', lastRun: '2026-07-10T03:00:00Z', nextRun: '2026-07-11T03:00:00Z', avgDurationMs: 345600 },
  { id: 'job-5', name: 'Stale Sessions Automatic Sweeper', schedule: '0 * * * *', status: 'FAILED', lastRun: '2026-07-10T06:00:00Z', nextRun: '2026-07-10T07:00:00Z', avgDurationMs: 820 }
];

export const SEED_SYSTEM_SERVICES: SystemService[] = [
  { id: 'srv-1', name: 'Platform Authentication Gateway', status: 'OPERATIONAL', latencyMs: 24, availability: 99.99, healthScore: 100 },
  { id: 'srv-2', name: 'Double Entry Ledger Engine', status: 'OPERATIONAL', latencyMs: 15, availability: 100.00, healthScore: 100 },
  { id: 'srv-3', name: 'Visa/Mastercard Card Gateway', status: 'DEGRADED', latencyMs: 412, availability: 99.85, healthScore: 82 },
  { id: 'srv-4', name: 'Kafka Messaging Notification Hub', status: 'OPERATIONAL', latencyMs: 8, availability: 99.98, healthScore: 98 },
  { id: 'srv-5', name: 'Elasticsearch Audit Collector', status: 'OPERATIONAL', latencyMs: 45, availability: 99.95, healthScore: 95 }
];

export const SEED_STORAGE_FILES: StorageFile[] = [
  { id: 'file-1', name: 'compliance_report_q2_2026.pdf', category: 'document', sizeBytes: 5242880, mimeType: 'application/pdf', uploadedAt: '2026-07-02T14:00:00Z', uploadedBy: 'System.Daemon' },
  { id: 'file-2', name: 'brand_logo_full_res.png', category: 'media', sizeBytes: 1572864, mimeType: 'image/png', uploadedAt: '2026-06-15T09:12:00Z', uploadedBy: 'Jessica.Jones' },
  { id: 'file-3', name: 'redis_database_dump_july.rdb', category: 'system', sizeBytes: 214748364, mimeType: 'application/octet-stream', uploadedAt: '2026-07-01T01:00:00Z', uploadedBy: 'Backup.Service' },
  { id: 'file-4', name: 'kyc_passport_extract_user91.jpg', category: 'document', sizeBytes: 256100, mimeType: 'image/jpeg', uploadedAt: '2026-07-10T05:22:00Z', uploadedBy: 'Support.Rep.1' }
];

export const SEED_BACKUPS: BackupPoint[] = [
  { id: 'bk-1', name: 'Hourly DB Snapshot - 2026-07-10 06:00', timestamp: '2026-07-10T06:00:00Z', sizeBytes: 1245184000, status: 'COMPLETED', checksum: 'sha256-f8a48b8c2e...' },
  { id: 'bk-2', name: 'Nightly Core System State - 2026-07-10 01:00', timestamp: '2026-07-10T01:00:00Z', sizeBytes: 10451840000, status: 'COMPLETED', checksum: 'sha256-a94b8c2e1f...' },
  { id: 'bk-3', name: 'Pre-deployment Cold Backup - 2026-07-09', timestamp: '2026-07-09T22:00:00Z', sizeBytes: 10441020000, status: 'COMPLETED', checksum: 'sha256-3c22b91ff2...' },
  { id: 'bk-4', name: 'Emergency Restore Attempt - Failed Instance', timestamp: '2026-07-05T14:12:00Z', sizeBytes: 9481220000, status: 'FAILED', checksum: 'N/A' }
];

export const SEED_AUDIT_LOGS: PlatAuditLog[] = [
  { id: 'aud-pl-1', actor: 'tilok.mania@gmail.com', action: 'GlobalSettings.Update', oldValue: 'WalletPro Admin v1', newValue: 'WalletPro Enterprise Admin Panel', reason: 'Update system metadata brand names', timestamp: '2026-07-10T06:00:00Z', approved: true, approvedBy: 'Super Administrator' },
  { id: 'aud-pl-2', actor: 'tilok.mania@gmail.com', action: 'FeatureFlag.Toggle', oldValue: 'AI Copilot [DISABLED]', newValue: 'AI Copilot [ENABLED]', reason: 'Provision smart replies on tier 1 dashboard', timestamp: '2026-07-10T06:12:00Z', approved: true, approvedBy: 'Super Administrator' },
  { id: 'aud-pl-3', actor: 'tilok.mania@gmail.com', action: 'BusinessRule.UpdateValue', oldValue: 'Daily Limit: 10000', newValue: 'Daily Limit: 15000', reason: 'Raise liquidity ceilings per operational parameters', timestamp: '2026-07-10T06:22:00Z', approved: true, approvedBy: 'Finance Manager' }
];
