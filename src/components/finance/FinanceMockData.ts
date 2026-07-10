import { FinanceSettlement, BankAccount, FinanceAuditLog, FeeConfig, FeeHistoryItem, ReconciliationSource, FinancialReport } from './FinanceTypes';

export const initialBankAccounts: BankAccount[] = [
  {
    id: 'bank-1',
    bankName: 'Silicon Valley Bank (SVB)',
    accountName: 'SVB Primary Operating Cash',
    currency: 'USD',
    currentBalance: 12450280.50,
    availableBalance: 12450280.50,
    settlementBalance: 485000.00,
    reserveBalance: 5000000.00,
    status: 'Active'
  },
  {
    id: 'bank-2',
    bankName: 'Barclays PLC',
    accountName: 'Barclays Euro Clearing Vault',
    currency: 'EUR',
    currentBalance: 4210450.00,
    availableBalance: 3910450.00,
    settlementBalance: 300000.00,
    reserveBalance: 1500000.00,
    status: 'Active'
  },
  {
    id: 'bank-3',
    bankName: 'HSBC Bank UK',
    accountName: 'HSBC Sterling Trust Account',
    currency: 'GBP',
    currentBalance: 1240150.00,
    availableBalance: 1140150.00,
    settlementBalance: 100000.00,
    reserveBalance: 500000.00,
    status: 'Active'
  },
  {
    id: 'bank-4',
    bankName: 'DBS Bank Singapore',
    accountName: 'DBS Asian Liquidity Pool',
    currency: 'SGD',
    currentBalance: 549200.00,
    availableBalance: 549200.00,
    settlementBalance: 0.00,
    reserveBalance: 0.00,
    status: 'Active'
  },
  {
    id: 'bank-5',
    bankName: 'Signature Bank (NY)',
    accountName: 'NY Operational Liquidity',
    currency: 'USD',
    currentBalance: 45000.00,
    availableBalance: 45000.00,
    settlementBalance: 0.00,
    reserveBalance: 0.00,
    status: 'Under Review'
  },
  {
    id: 'bank-6',
    bankName: 'Plaid Clearing Host',
    accountName: 'Automated ACH Transit Account',
    currency: 'USD',
    currentBalance: 12500.00,
    availableBalance: 0.00,
    settlementBalance: 12500.00,
    reserveBalance: 0.00,
    status: 'Disconnected'
  }
];

export const initialFinanceSettlements: FinanceSettlement[] = [
  {
    id: 'SET-2026-B801',
    batchId: 'BATCH-ACH-091A',
    bankName: 'Silicon Valley Bank (SVB)',
    currency: 'USD',
    grossAmount: 450000.00,
    fees: 4500.00,
    netAmount: 445500.00,
    status: 'Completed',
    settlementDate: '2026-07-09 04:00:00',
    completedDate: '2026-07-09 06:15:22',
    failureReason: null
  },
  {
    id: 'SET-2026-B802',
    batchId: 'BATCH-SEPA-812',
    bankName: 'Barclays PLC',
    currency: 'EUR',
    grossAmount: 300000.00,
    fees: 3000.00,
    netAmount: 297000.00,
    status: 'Pending',
    settlementDate: '2026-07-09 08:30:00',
    completedDate: null,
    failureReason: null
  },
  {
    id: 'SET-2026-B803',
    batchId: 'BATCH-CHAPS-99',
    bankName: 'HSBC Bank UK',
    currency: 'GBP',
    grossAmount: 100000.00,
    fees: 1200.00,
    netAmount: 98800.00,
    status: 'Pending',
    settlementDate: '2026-07-09 09:15:00',
    completedDate: null,
    failureReason: null
  },
  {
    id: 'SET-2026-B804',
    batchId: 'BATCH-FAST-334',
    bankName: 'DBS Bank Singapore',
    currency: 'SGD',
    grossAmount: 85000.00,
    fees: 850.00,
    netAmount: 84150.00,
    status: 'Completed',
    settlementDate: '2026-07-08 11:00:00',
    completedDate: '2026-07-08 12:45:10',
    failureReason: null
  },
  {
    id: 'SET-2026-B805',
    batchId: 'BATCH-ACH-090F',
    bankName: 'Plaid Clearing Host',
    currency: 'USD',
    grossAmount: 12500.00,
    fees: 125.00,
    netAmount: 12375.00,
    status: 'Failed',
    settlementDate: '2026-07-07 14:00:00',
    completedDate: null,
    failureReason: 'ACH Cleared Return: Insufficient routing balance at source Plaid transit node.'
  },
  {
    id: 'SET-2026-B806',
    batchId: 'BATCH-ACH-092X',
    bankName: 'Silicon Valley Bank (SVB)',
    currency: 'USD',
    grossAmount: 250000.00,
    fees: 2500.00,
    netAmount: 247500.00,
    status: 'Paused',
    settlementDate: '2026-07-09 10:00:00',
    completedDate: null,
    failureReason: 'Held by Admin Pause instruction during network compliance evaluation.'
  }
];

export const initialReconciliationSources: ReconciliationSource[] = [
  {
    id: 'recon-1',
    name: 'Internal Ledger Core vs SVB Bank Feed',
    type: 'Internal Ledger',
    matchedCount: 14850,
    unmatchedCount: 2,
    pendingCount: 15,
    exceptionsCount: 1,
    varianceAmount: 3450.25,
    status: 'Variance Found',
    lastRun: '2026-07-09 23:00:00'
  },
  {
    id: 'recon-2',
    name: 'Barclays EUR Clearing vs Stripe Provider API',
    type: 'Payment Provider',
    matchedCount: 8421,
    unmatchedCount: 0,
    pendingCount: 4,
    exceptionsCount: 0,
    varianceAmount: 0.00,
    status: 'Balanced',
    lastRun: '2026-07-09 22:30:00'
  },
  {
    id: 'recon-3',
    name: 'HSBC Sterling Trust vs CHAPS Wire Settlement',
    type: 'Bank Settlement',
    matchedCount: 3241,
    unmatchedCount: 0,
    pendingCount: 18,
    exceptionsCount: 0,
    varianceAmount: 0.00,
    status: 'Balanced',
    lastRun: '2026-07-09 20:00:00'
  },
  {
    id: 'recon-4',
    name: 'DBS SGD Liquidity Pool vs Merchant Clearing API',
    type: 'External Account',
    matchedCount: 1109,
    unmatchedCount: 1,
    pendingCount: 2,
    exceptionsCount: 1,
    varianceAmount: 850.00,
    status: 'Variance Found',
    lastRun: '2026-07-09 18:45:00'
  }
];

export const initialFeeConfigs: FeeConfig[] = [
  {
    id: 'fee-1',
    name: 'Standard Transaction fee',
    category: 'transaction',
    value: '1.5% + $0.30',
    type: 'Percentage',
    currency: 'USD',
    lastUpdated: '2026-01-15 08:30:00',
    updatedBy: 'Chief Financial Officer'
  },
  {
    id: 'fee-2',
    name: 'Card Issuance Flat fee',
    category: 'card',
    value: '$5.00',
    type: 'Flat',
    currency: 'USD',
    lastUpdated: '2026-03-01 10:00:00',
    updatedBy: 'Operations Director'
  },
  {
    id: 'fee-3',
    name: 'Standard Wire Withdrawal fee',
    category: 'withdrawal',
    value: '$15.00',
    type: 'Flat',
    currency: 'USD',
    lastUpdated: '2026-02-12 11:30:00',
    updatedBy: 'Treasury Manager'
  },
  {
    id: 'fee-4',
    name: 'Internal Peer Wallet Transfer fee',
    category: 'transfer',
    value: 'Free',
    type: 'Percentage',
    lastUpdated: '2025-12-01 09:00:00',
    updatedBy: 'Platform Architect'
  },
  {
    id: 'fee-5',
    name: 'FX Currency Markup fee',
    category: 'fx',
    value: '1.20%',
    type: 'Percentage',
    lastUpdated: '2026-06-20 14:15:00',
    updatedBy: 'Treasury Specialist'
  },
  {
    id: 'fee-6',
    name: 'Platform Merchant Settlement fee',
    category: 'platform',
    value: '0.10%',
    type: 'Percentage',
    lastUpdated: '2026-05-10 16:45:00',
    updatedBy: 'Finance Lead'
  }
];

export const initialFeeHistory: FeeHistoryItem[] = [
  {
    id: 'FHL-901',
    timestamp: '2026-06-20 14:15:00',
    feeName: 'FX Currency Markup fee',
    action: 'Adjusted rate',
    modifiedBy: 'Treasury Specialist',
    previousValue: '1.00%',
    newValue: '1.20%'
  },
  {
    id: 'FHL-902',
    timestamp: '2026-05-10 16:45:00',
    feeName: 'Platform Merchant Settlement fee',
    action: 'Adjusted rate',
    modifiedBy: 'Finance Lead',
    previousValue: '0.05%',
    newValue: '0.10%'
  },
  {
    id: 'FHL-903',
    timestamp: '2026-03-01 10:00:00',
    feeName: 'Card Issuance Flat fee',
    action: 'Implemented card fee',
    modifiedBy: 'Operations Director',
    previousValue: '$0.00',
    newValue: '$5.00'
  }
];

export const initialFinancialReports: FinancialReport[] = [
  {
    id: 'REP-2026-Q2P',
    title: 'Q2 2026 Profitability Summary Statement',
    type: 'Profit Summary',
    reportingPeriod: 'Q2 2026 (April - June)',
    generatedAt: '2026-07-01 09:00:00',
    generatedBy: 'Chief Financial Officer',
    fileSize: '4.8 MB',
    status: 'Ready'
  },
  {
    id: 'REP-2026-M06R',
    title: 'June 2026 Gross Revenue Ledger Statement',
    type: 'Revenue Summary',
    reportingPeriod: 'June 2026 (06/01 - 06/30)',
    generatedAt: '2026-07-01 10:30:00',
    generatedBy: 'Finance Lead',
    fileSize: '12.4 MB',
    status: 'Ready'
  },
  {
    id: 'REP-2026-W27S',
    title: 'Week 27 Platform Settlement Clearing Audit',
    type: 'Settlement Report',
    reportingPeriod: 'Week 27 2026 (07/01 - 07/07)',
    generatedAt: '2026-07-08 17:00:00',
    generatedBy: 'Treasury Specialist',
    fileSize: '8.2 MB',
    status: 'Ready'
  },
  {
    id: 'REP-2026-LIQ09',
    title: 'July 9 Liquidity Forecasting & Currency Model',
    type: 'Liquidity Report',
    reportingPeriod: 'Live Snap - 2026-07-09',
    generatedAt: '2026-07-09 18:00:00',
    generatedBy: 'Treasury Manager',
    fileSize: '1.2 MB',
    status: 'Ready'
  }
];

export const initialFinanceAuditLogs: FinanceAuditLog[] = [
  {
    id: 'FAUD-8801',
    timestamp: '2026-07-09 23:00:00',
    action: 'RECONCILIATION_RUN',
    performedBy: 'tilok.mania@gmail.com',
    details: 'Initiated Barclays Primary clearing reconciliation run against internal ledger cache. Variance balanced successfully.',
    referenceId: 'recon-1'
  },
  {
    id: 'FAUD-8802',
    timestamp: '2026-07-09 21:15:30',
    action: 'SWEEP_SETTLEMENT',
    performedBy: 'tilok.mania@gmail.com',
    details: 'Initiated liquidity sweep of USD 150,000.00 from primary SVB vault to ACH transit ledger.',
    referenceId: 'SET-2026-B801',
    amount: 150000,
    currency: 'USD'
  },
  {
    id: 'FAUD-8803',
    timestamp: '2026-07-09 19:40:00',
    action: 'RESERVE_ADJUSTMENT',
    performedBy: 'tilok.mania@gmail.com',
    details: 'Adjusted primary SVB Dollar Reserve Account buffer upwards by USD 500,000.00 to offset peak merchant settlement liabilities.',
    referenceId: 'bank-1',
    amount: 50000,
    currency: 'USD'
  },
  {
    id: 'FAUD-8804',
    timestamp: '2026-07-08 11:30:10',
    action: 'FEE_OVERRIDE_APPLIED',
    performedBy: 'System Administrator',
    details: 'Overrode Standard Transaction Fee to 0.95% + $0.15 for high-volume enterprise customer W-ENT-9021 (Acme Global Inc.).',
    referenceId: 'fee-1'
  }
];

export const initialFinanceAlerts = [
  {
    id: 'al-1',
    severity: 'High',
    title: 'Low USD Liquidity Buffer',
    description: 'Operational USD account at Signature Bank (NY) has dropped below $100k threshold. Current: $45,000.00',
    timestamp: '5 mins ago'
  },
  {
    id: 'al-2',
    severity: 'Medium',
    title: 'Barclays EUR Reconciliation Mismatch',
    description: 'Internal Double-Entry Ledger reports a $3,450.25 positive variance against feed Barclay primary statement.',
    timestamp: '1 hour ago'
  },
  {
    id: 'al-3',
    severity: 'Critical',
    title: 'ACH Outbound Clearing Failure',
    description: 'Batch BATCH-ACH-090F failed network settlement on Plaid node. Error code return ACH_NODE_UNAVAILABLE.',
    timestamp: '2 hours ago'
  },
  {
    id: 'al-4',
    severity: 'Low',
    title: 'Plaid API Heartbeat Warning',
    description: 'Network gateway reporting intermittent ping times (>1500ms). Live feed lag warning.',
    timestamp: '4 hours ago'
  }
];
