import { BankAccount, FinanceSettlement, ReconciliationSource, FeeConfig, FeeHistoryItem, FinancialReport, FinanceAuditLog } from './FinanceTypes';
import { initialBankAccounts, initialFinanceSettlements, initialReconciliationSources, initialFeeConfigs, initialFeeHistory, initialFinancialReports, initialFinanceAuditLogs, initialFinanceAlerts } from './FinanceMockData';
import { apiClient } from '../../api/client';

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
    try {
      const res = await apiClient.get<BankAccount[]>('/finance/bank-accounts');
      if (res.data && Array.isArray(res.data)) {
        bankAccounts = res.data;
        setStored(STORAGE_KEYS.BANK_ACCOUNTS, bankAccounts);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /finance/bank-accounts unavailable, falling back to local state', e);
      await delay(300);
      return [...bankAccounts];
    }
  },

  updateBankAccountBalance: async (id: string, updates: Partial<BankAccount>, performedBy: string): Promise<BankAccount> => {
    try {
      const res = await apiClient.patch<BankAccount>(`/finance/bank-accounts/${id}`, { updates, performedBy });
      return res.data;
    } catch (e) {
      console.warn('Backend bank account balance update unavailable, updating local state', e);
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
    }
  },

  // SETTLEMENTS
  getSettlements: async (): Promise<FinanceSettlement[]> => {
    try {
      const res = await apiClient.get<FinanceSettlement[]>('/finance/settlements');
      if (res.data && Array.isArray(res.data)) {
        settlements = res.data;
        setStored(STORAGE_KEYS.SETTLEMENTS, settlements);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /finance/settlements unavailable, falling back to local state', e);
      await delay(350);
      return [...settlements];
    }
  },

  updateSettlementStatus: async (id: string, status: FinanceSettlement['status'], performedBy: string, reason?: string): Promise<FinanceSettlement> => {
    try {
      const res = await apiClient.patch<FinanceSettlement>(`/finance/settlements/${id}`, { status, performedBy, reason });
      return res.data;
    } catch (e) {
      console.warn('Backend settlement status update unavailable, updating local state', e);
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
    }
  },

  // RECONCILIATION
  getReconciliationSources: async (): Promise<ReconciliationSource[]> => {
    try {
      const res = await apiClient.get<ReconciliationSource[]>('/finance/reconciliation');
      if (res.data && Array.isArray(res.data)) {
        reconciliationSources = res.data;
        setStored(STORAGE_KEYS.RECONCILIATION, reconciliationSources);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /finance/reconciliation unavailable, falling back to local state', e);
      await delay(300);
      return [...reconciliationSources];
    }
  },

  triggerReconciliation: async (id: string, performedBy: string): Promise<ReconciliationSource> => {
    try {
      const res = await apiClient.post<ReconciliationSource>(`/finance/reconciliation/${id}/trigger`, { performedBy });
      return res.data;
    } catch (e) {
      console.warn('Backend reconciliation trigger unavailable, updating local state', e);
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
    }
  },

  // FEES
  getFeeConfigs: async (): Promise<FeeConfig[]> => {
    try {
      const res = await apiClient.get<FeeConfig[]>('/finance/fees');
      if (res.data && Array.isArray(res.data)) {
        feeConfigs = res.data;
        setStored(STORAGE_KEYS.FEES, feeConfigs);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /finance/fees unavailable, falling back to local state', e);
      await delay(250);
      return [...feeConfigs];
    }
  },

  updateFeeConfig: async (id: string, newValue: string, performedBy: string): Promise<FeeConfig> => {
    try {
      const res = await apiClient.patch<FeeConfig>(`/finance/fees/${id}`, { newValue, performedBy });
      return res.data;
    } catch (e) {
      console.warn('Backend /finance/fees update unavailable, updating local state', e);
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
    }
  },

  getFeeHistory: async (): Promise<FeeHistoryItem[]> => {
    try {
      const res = await apiClient.get<FeeHistoryItem[]>('/finance/fees/history');
      if (res.data && Array.isArray(res.data)) {
        feeHistory = res.data;
        setStored(STORAGE_KEYS.FEE_HISTORY, feeHistory);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /finance/fees/history unavailable, falling back to local state', e);
      await delay(250);
      return [...feeHistory];
    }
  },

  // REPORTS
  getFinancialReports: async (): Promise<FinancialReport[]> => {
    try {
      const res = await apiClient.get<FinancialReport[]>('/reports/financial');
      if (res.data && Array.isArray(res.data)) {
        financialReports = res.data;
        setStored(STORAGE_KEYS.REPORTS, financialReports);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend financial reports unavailable, falling back to local state', e);
      await delay(300);
      return [...financialReports];
    }
  },

  generateFinancialReport: async (type: FinancialReport['type'], period: string, performedBy: string): Promise<FinancialReport> => {
    try {
      const res = await apiClient.post<FinancialReport>('/reports/financial/generate', { type, reportingPeriod: period, performedBy });
      return res.data;
    } catch (e) {
      console.warn('Backend report generation unavailable, updating local state', e);
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
    }
  },

  // AUDIT LOGS
  getAuditLogs: async (): Promise<FinanceAuditLog[]> => {
    try {
      const res = await apiClient.get<FinanceAuditLog[]>('/finance/audit-logs');
      if (res.data && Array.isArray(res.data)) {
        auditLogs = res.data;
        setStored(STORAGE_KEYS.AUDIT_LOGS, auditLogs);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /finance/audit-logs unavailable, falling back to local state', e);
      await delay(200);
      return [...auditLogs];
    }
  },

  // ALERTS
  getAlerts: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/finance/alerts');
      if (res.data && Array.isArray(res.data)) {
        alerts = res.data;
        setStored(STORAGE_KEYS.ALERTS, alerts);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /finance/alerts unavailable, falling back to local state', e);
      await delay(200);
      return [...alerts];
    }
  },

  dismissAlert: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/finance/alerts/${id}`);
      return true;
    } catch (e) {
      console.warn('Backend dismissAlert unavailable, updating local state', e);
      await delay(200);
      alerts = alerts.filter(a => a.id !== id);
      setStored(STORAGE_KEYS.ALERTS, alerts);
      return true;
    }
  }
};
