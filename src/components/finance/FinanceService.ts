import { BankAccount, FinanceSettlement, ReconciliationSource, FeeConfig, FeeHistoryItem, FinancialReport, FinanceAuditLog } from './FinanceTypes';
import { initialBankAccounts, initialFinanceSettlements, initialReconciliationSources, initialFeeConfigs, initialFeeHistory, initialFinancialReports, initialFinanceAuditLogs, initialFinanceAlerts } from './FinanceMockData';

const STORAGE_KEYS = {
  BANK_ACCOUNTS: 'walletpro_finance_bank_accounts',
  SETTLEMENTS: 'walletpro_finance_settlements',
  RECONCILIATION: 'walletpro_finance_reconciliation',
  FEES: 'walletpro_finance_fees',
  FEE_HISTORY: 'walletpro_finance_fee_history',
  REPORTS: 'walletpro_finance_reports',
  AUDIT_LOGS: 'walletpro_finance_audit_logs',
  ALERTS: 'walletpro_finance_alerts'
};

const getStored = <T>(key: string, defaults: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaults;
  } catch (e) {
    return defaults;
  }
};

const setStored = <T>(key: string, val: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

let bankAccounts = getStored<BankAccount[]>(STORAGE_KEYS.BANK_ACCOUNTS, initialBankAccounts);
let settlements = getStored<FinanceSettlement[]>(STORAGE_KEYS.SETTLEMENTS, initialFinanceSettlements);
let reconciliationSources = getStored<ReconciliationSource[]>(STORAGE_KEYS.RECONCILIATION, initialReconciliationSources);
let feeConfigs = getStored<FeeConfig[]>(STORAGE_KEYS.FEES, initialFeeConfigs);
let feeHistory = getStored<FeeHistoryItem[]>(STORAGE_KEYS.FEE_HISTORY, initialFeeHistory);
let financialReports = getStored<FinancialReport[]>(STORAGE_KEYS.REPORTS, initialFinancialReports);
let auditLogs = getStored<FinanceAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialFinanceAuditLogs);
let alerts = getStored<any[]>(STORAGE_KEYS.ALERTS, initialFinanceAlerts);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const FinanceService = {
  // BANK ACCOUNTS
  getBankAccounts: async (): Promise<BankAccount[]> => {
    await delay(300);
    return [...bankAccounts];
  },

  updateBankAccountBalance: async (id: string, updates: Partial<BankAccount>, performedBy: string): Promise<BankAccount> => {
    await delay(400);
    const index = bankAccounts.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Bank account not found');

    const prevAccount = bankAccounts[index];
    bankAccounts[index] = { ...prevAccount, ...updates };
    setStored(STORAGE_KEYS.BANK_ACCOUNTS, bankAccounts);

    // Audit log
    const logDetails = Object.entries(updates)
      .map(([key, val]) => `${key} changed to ${val}`)
      .join(', ');

    const newLog: FinanceAuditLog = {
      id: `FAUD-${Math.floor(1000 + Math.random() * 8999)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'BANK_ACCOUNT_UPDATE',
      performedBy,
      details: `Modified account ${prevAccount.bankName} (${prevAccount.accountName}): ${logDetails}`,
      referenceId: id
    };
    auditLogs.unshift(newLog);
    setStored(STORAGE_KEYS.AUDIT_LOGS, auditLogs);

    return bankAccounts[index];
  },

  // SETTLEMENTS
  getSettlements: async (): Promise<FinanceSettlement[]> => {
    await delay(350);
    return [...settlements];
  },

  updateSettlementStatus: async (id: string, status: FinanceSettlement['status'], performedBy: string, reason?: string): Promise<FinanceSettlement> => {
    await delay(450);
    const index = settlements.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Settlement batch not found');

    const prevSettlement = settlements[index];
    settlements[index] = {
      ...prevSettlement,
      status,
      completedDate: status === 'Completed' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : prevSettlement.completedDate,
      failureReason: status === 'Failed' ? (reason || 'Unknown clearing failure') : status === 'Paused' ? (reason || 'compliance evaluation') : null
    };
    setStored(STORAGE_KEYS.SETTLEMENTS, settlements);

    // Audit Log
    const newLog: FinanceAuditLog = {
      id: `FAUD-${Math.floor(1000 + Math.random() * 8999)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: `SETTLEMENT_${status.toUpperCase()}`,
      performedBy,
      details: `Settlement Batch ${id} status updated from ${prevSettlement.status} to ${status}. Amount: ${prevSettlement.currency} ${prevSettlement.netAmount.toLocaleString()}`,
      referenceId: id,
      amount: prevSettlement.netAmount,
      currency: prevSettlement.currency
    };
    auditLogs.unshift(newLog);
    setStored(STORAGE_KEYS.AUDIT_LOGS, auditLogs);

    return settlements[index];
  },

  // RECONCILIATION
  getReconciliationSources: async (): Promise<ReconciliationSource[]> => {
    await delay(300);
    return [...reconciliationSources];
  },

  triggerReconciliation: async (id: string, performedBy: string): Promise<ReconciliationSource> => {
    await delay(1200); // Simulate complex match crunching
    const index = reconciliationSources.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Reconciliation source not found');

    const r = reconciliationSources[index];
    r.status = 'Balanced';
    r.varianceAmount = 0.00;
    r.matchedCount += r.unmatchedCount;
    r.unmatchedCount = 0;
    r.exceptionsCount = 0;
    r.lastRun = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setStored(STORAGE_KEYS.RECONCILIATION, reconciliationSources);

    // Audit Log
    const newLog: FinanceAuditLog = {
      id: `FAUD-${Math.floor(1000 + Math.random() * 8999)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'RECONCILIATION_RUN',
      performedBy,
      details: `Executed manual reconciliation match for "${r.name}". All discrepancies balanced successfully.`,
      referenceId: id
    };
    auditLogs.unshift(newLog);
    setStored(STORAGE_KEYS.AUDIT_LOGS, auditLogs);

    return r;
  },

  // FEES
  getFeeConfigs: async (): Promise<FeeConfig[]> => {
    await delay(250);
    return [...feeConfigs];
  },

  updateFeeConfig: async (id: string, newValue: string, performedBy: string): Promise<FeeConfig> => {
    await delay(400);
    const index = feeConfigs.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Fee profile not found');

    const fee = feeConfigs[index];
    const prevValue = fee.value;
    fee.value = newValue;
    fee.lastUpdated = new Date().toISOString().replace('T', ' ').substring(0, 19);
    fee.updatedBy = performedBy;

    setStored(STORAGE_KEYS.FEES, feeConfigs);

    // History Log
    const newHist: FeeHistoryItem = {
      id: `FHL-${Math.floor(1000 + Math.random() * 8999)}`,
      timestamp: fee.lastUpdated,
      feeName: fee.name,
      action: 'Updated override settings',
      modifiedBy: performedBy,
      previousValue: prevValue,
      newValue
    };
    feeHistory.unshift(newHist);
    setStored(STORAGE_KEYS.FEE_HISTORY, feeHistory);

    // Audit Log
    const newLog: FinanceAuditLog = {
      id: `FAUD-${Math.floor(1000 + Math.random() * 8999)}`,
      timestamp: fee.lastUpdated,
      action: 'FEE_OVERRIDE_APPLIED',
      performedBy,
      details: `Adjusted standard platform fee configuration "${fee.name}" value from "${prevValue}" to "${newValue}".`,
      referenceId: id
    };
    auditLogs.unshift(newLog);
    setStored(STORAGE_KEYS.AUDIT_LOGS, auditLogs);

    return fee;
  },

  getFeeHistory: async (): Promise<FeeHistoryItem[]> => {
    await delay(250);
    return [...feeHistory];
  },

  // REPORTS
  getFinancialReports: async (): Promise<FinancialReport[]> => {
    await delay(300);
    return [...financialReports];
  },

  generateFinancialReport: async (type: FinancialReport['type'], period: string, performedBy: string): Promise<FinancialReport> => {
    await delay(1500); // Compiling ledger analytics
    const newReport: FinancialReport = {
      id: `REP-2026-${type.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`,
      title: `${period} ${type} Audited Dossier`,
      type,
      reportingPeriod: period,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      generatedBy: performedBy,
      fileSize: `${(1.5 + Math.random() * 15).toFixed(1)} MB`,
      status: 'Ready'
    };

    financialReports.unshift(newReport);
    setStored(STORAGE_KEYS.REPORTS, financialReports);

    // Audit Log
    const newLog: FinanceAuditLog = {
      id: `FAUD-${Math.floor(1000 + Math.random() * 8999)}`,
      timestamp: newReport.generatedAt,
      action: 'REPORT_GENERATION',
      performedBy,
      details: `Compiled and signed digital ledger report: "${newReport.title}" for reporting scope "${period}".`,
      referenceId: newReport.id
    };
    auditLogs.unshift(newLog);
    setStored(STORAGE_KEYS.AUDIT_LOGS, auditLogs);

    return newReport;
  },

  // AUDIT LOGS
  getAuditLogs: async (): Promise<FinanceAuditLog[]> => {
    await delay(200);
    return [...auditLogs];
  },

  // ALERTS
  getAlerts: async (): Promise<any[]> => {
    await delay(200);
    return [...alerts];
  },

  dismissAlert: async (id: string): Promise<boolean> => {
    await delay(200);
    alerts = alerts.filter(a => a.id !== id);
    setStored(STORAGE_KEYS.ALERTS, alerts);
    return true;
  }
};
