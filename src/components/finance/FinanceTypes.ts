export interface FinanceSettlement {
  id: string;
  batchId: string;
  bankName: string;
  currency: string;
  grossAmount: number;
  fees: number;
  netAmount: number;
  status: 'Completed' | 'Pending' | 'Failed' | 'Paused';
  settlementDate: string;
  completedDate: string | null;
  failureReason: string | null;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  currency: string;
  currentBalance: number;
  availableBalance: number;
  settlementBalance: number;
  reserveBalance: number;
  status: 'Active' | 'Under Review' | 'Disconnected' | 'Locked';
}

export interface FinanceAuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
  referenceId: string;
  amount?: number;
  currency?: string;
}

export interface FeeConfig {
  id: string;
  name: string;
  category: 'transaction' | 'card' | 'withdrawal' | 'transfer' | 'fx' | 'platform';
  value: string;
  type: 'Percentage' | 'Flat' | 'Tiered';
  currency?: string;
  lastUpdated: string;
  updatedBy: string;
}

export interface FeeHistoryItem {
  id: string;
  timestamp: string;
  feeName: string;
  action: string;
  modifiedBy: string;
  previousValue: string;
  newValue: string;
}

export interface ReconciliationSource {
  id: string;
  name: string;
  type: 'Internal Ledger' | 'Bank Settlement' | 'Payment Provider' | 'External Account';
  matchedCount: number;
  unmatchedCount: number;
  pendingCount: number;
  exceptionsCount: number;
  varianceAmount: number;
  status: 'Balanced' | 'Unreconciled' | 'Pending Run' | 'Variance Found';
  lastRun: string;
}

export interface FinancialReport {
  id: string;
  title: string;
  type: 'Profit Summary' | 'Revenue Summary' | 'Settlement Report' | 'Fee Report' | 'Reserve Report' | 'Liquidity Report' | 'Bank Position Report' | 'Outstanding Liability Report';
  reportingPeriod: string;
  generatedAt: string;
  generatedBy: string;
  fileSize: string;
  status: 'Ready' | 'Generating' | 'Failed';
}
