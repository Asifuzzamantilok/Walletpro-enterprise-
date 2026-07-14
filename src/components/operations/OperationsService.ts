import { Wallet, Transaction, LedgerEntry, Settlement, Refund, LimitConfig, WalletStatus, WalletRiskLevel, WalletType, TransactionStatus, SettlementStatus, Card, CardOrder, CardTransaction, CardFraudAlert, CardStatus, CardType, CardNetwork } from './OperationsTypes';
import { initialWallets, initialTransactions, initialLedgerEntries, initialSettlements, initialRefunds, initialLimits, initialCards, initialCardOrders, initialCardTransactions, initialCardFraudAlerts } from './OperationsMockData';
import { apiClient } from '../../api/client';

// Helper to load/save state from localStorage to persist action results during active session
const STORAGE_KEYS = {
  WALLETS: 'walletpro_ops_wallets',
  TRANSACTIONS: 'walletpro_ops_transactions',
  LEDGER: 'walletpro_ops_ledger',
  SETTLEMENTS: 'walletpro_ops_settlements',
  REFUNDS: 'walletpro_ops_refunds',
  LIMITS: 'walletpro_ops_limits',
  CARDS: 'walletpro_ops_cards',
  CARD_ORDERS: 'walletpro_ops_card_orders',
  CARD_TRANSACTIONS: 'walletpro_ops_card_transactions',
  CARD_FRAUD_ALERTS: 'walletpro_ops_card_fraud_alerts'
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

// Initialize persistent state
let wallets = getStored<Wallet[]>(STORAGE_KEYS.WALLETS, initialWallets);
let transactions = getStored<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
let ledgerEntries = getStored<LedgerEntry[]>(STORAGE_KEYS.LEDGER, initialLedgerEntries);
let settlements = getStored<Settlement[]>(STORAGE_KEYS.SETTLEMENTS, initialSettlements);
let refunds = getStored<Refund[]>(STORAGE_KEYS.REFUNDS, initialRefunds);
let limits = getStored<LimitConfig[]>(STORAGE_KEYS.LIMITS, initialLimits);
let cards = getStored<Card[]>(STORAGE_KEYS.CARDS, initialCards);
let cardOrders = getStored<CardOrder[]>(STORAGE_KEYS.CARD_ORDERS, initialCardOrders);
let cardTransactions = getStored<CardTransaction[]>(STORAGE_KEYS.CARD_TRANSACTIONS, initialCardTransactions);
let cardFraudAlerts = getStored<CardFraudAlert[]>(STORAGE_KEYS.CARD_FRAUD_ALERTS, initialCardFraudAlerts);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const OperationsService = {
  // WALLETS
  getWallets: async (): Promise<Wallet[]> => {
    try {
      const res = await apiClient.get<Wallet[]>('/wallets');
      if (res.data && Array.isArray(res.data)) {
        // Keep localized cache synced
        wallets = res.data;
        setStored(STORAGE_KEYS.WALLETS, wallets);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /wallets unavailable, falling back to local state', e);
      await delay(350); // Simulate network round-trip
      return [...wallets];
    }
  },

  updateWalletStatus: async (walletId: string, status: WalletStatus): Promise<Wallet> => {
    try {
      const res = await apiClient.patch<Wallet>(`/wallets/${walletId}/status`, { status });
      return res.data;
    } catch (e) {
      console.warn('Backend /wallets/:id/status unavailable, updating local state', e);
      await delay(400);
      const index = wallets.findIndex(w => w.id === walletId);
      if (index === -1) throw new Error('Wallet not found');
      
      wallets[index] = {
        ...wallets[index],
        status,
        updatedDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      
      // Add transaction audit logs
      const relatedTx = transactions.filter(t => t.senderWalletId === walletId || t.receiverWalletId === walletId);
      relatedTx.forEach(tx => {
        tx.auditTrail.unshift({
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: `Wallet ${status}`,
          performedBy: 'System Administrator',
          details: `Wallet status changed to ${status} by admin decision.`
        });
      });

      setStored(STORAGE_KEYS.WALLETS, wallets);
      setStored(STORAGE_KEYS.TRANSACTIONS, transactions);
      return wallets[index];
    }
  },

  adjustWalletBalance: async (
    walletId: string, 
    type: 'Credit' | 'Debit', 
    amount: number, 
    note: string
  ): Promise<Wallet> => {
    try {
      const res = await apiClient.post<Wallet>(`/wallets/${walletId}/adjust`, { type, amount, note });
      return res.data;
    } catch (e) {
      console.warn('Backend /wallets/:id/adjust unavailable, updating local state', e);
      await delay(500);
      const index = wallets.findIndex(w => w.id === walletId);
      if (index === -1) throw new Error('Wallet not found');

      const wallet = wallets[index];
      let change = amount;
      if (type === 'Debit') {
        if (wallet.availableBalance < amount) {
          throw new Error(`Insufficient available funds. Required: ${amount} ${wallet.currency}`);
        }
        change = -amount;
      }

      const prevCurrent = wallet.currentBalance;
      const prevAvail = wallet.availableBalance;
      const nextCurrent = prevCurrent + change;
      const nextAvail = prevAvail + change;

      wallets[index] = {
        ...wallet,
        currentBalance: nextCurrent,
        availableBalance: nextAvail,
        updatedDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      // Insert Ledger Entry
      const ledgerRef = `ADJ-${Math.floor(10000 + Math.random() * 90000)}`;
      const ledgerAccount = type === 'Credit' ? '2100 - Balance Inbound Adjust' : '2200 - Balance Outbound Adjust';
      
      const newEntry: LedgerEntry = {
        id: `LEDGER-${Math.floor(10000 + Math.random() * 90000)}`,
        reference: ledgerRef,
        account: ledgerAccount,
        walletId: wallet.id,
        debit: type === 'Debit' ? amount : 0,
        credit: type === 'Credit' ? amount : 0,
        currency: wallet.currency,
        balanceBefore: prevCurrent,
        balanceAfter: nextCurrent,
        postingTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      ledgerEntries.unshift(newEntry);

      // Insert Transaction Record
      const newTx: Transaction = {
        id: `TX-${Math.floor(80000 + Math.random() * 9000)}`,
        reference: ledgerRef,
        customerName: wallet.customerName,
        customerEmail: wallet.customerEmail,
        senderWalletId: type === 'Debit' ? wallet.id : 'SYSTEM-TREASURY',
        receiverWalletId: type === 'Credit' ? wallet.id : 'SYSTEM-REVENUE',
        currency: wallet.currency,
        amount: amount,
        fee: 0,
        status: 'Completed',
        channel: 'API',
        type: type === 'Credit' ? 'Deposit' : 'Payout',
        paymentMethod: 'Administrative Adjustment',
        country: wallet.country,
        device: 'Admin Portal Core',
        ipAddress: '127.0.0.1',
        location: 'Internal System Adjust',
        riskScore: 5,
        createdTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        completedTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        auditTrail: [
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            action: 'Adjustment Applied',
            performedBy: 'System Administrator',
            details: `Manual balance adjustment: ${type} of ${amount} ${wallet.currency}. Note: ${note}`
          }
        ]
      };
      transactions.unshift(newTx);

      // Update Limits used if applicable
      const limIndex = limits.findIndex(l => l.walletId === walletId);
      if (limIndex !== -1 && type === 'Debit') {
        limits[limIndex].dailyUsed += amount;
        limits[limIndex].monthlyUsed += amount;
        setStored(STORAGE_KEYS.LIMITS, limits);
      }

      setStored(STORAGE_KEYS.WALLETS, wallets);
      setStored(STORAGE_KEYS.LEDGER, ledgerEntries);
      setStored(STORAGE_KEYS.TRANSACTIONS, transactions);

      return wallets[index];
    }
  },

  flagWallet: async (walletId: string, riskLevel: WalletRiskLevel, score: number): Promise<Wallet> => {
    try {
      const res = await apiClient.post<Wallet>(`/wallets/${walletId}/flag`, { riskLevel, riskScore: score });
      return res.data;
    } catch (e) {
      console.warn('Backend /wallets/:id/flag unavailable, updating local state', e);
      await delay(350);
      const index = wallets.findIndex(w => w.id === walletId);
      if (index === -1) throw new Error('Wallet not found');

      wallets[index] = {
        ...wallets[index],
        riskLevel,
        riskScore: score,
        updatedDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      setStored(STORAGE_KEYS.WALLETS, wallets);
      return wallets[index];
    }
  },

  transferFunds: async (
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    currency: string,
    description: string
  ): Promise<{ source: Wallet; target: Wallet }> => {
    try {
      const res = await apiClient.post<{ source: Wallet; target: Wallet }>('/wallets/transfer', {
        fromWalletId,
        toWalletId,
        amount,
        currency,
        description
      });
      return res.data;
    } catch (e) {
      console.warn('Backend /wallets/transfer unavailable, updating local state', e);
      await delay(600);
      const sourceIdx = wallets.findIndex(w => w.id === fromWalletId);
      const targetIdx = wallets.findIndex(w => w.id === toWalletId);

      if (sourceIdx === -1) throw new Error('Source wallet not found');
      if (targetIdx === -1) throw new Error('Recipient wallet not found');

      const source = wallets[sourceIdx];
      const target = wallets[targetIdx];

      if (source.currency !== currency || target.currency !== currency) {
        throw new Error(`Cross-currency internal transfer not supported yet. Currency must be ${source.currency}`);
      }

      if (source.availableBalance < amount) {
        throw new Error(`Insufficient funds in source wallet. Available: ${source.availableBalance} ${currency}`);
      }

      if (source.status !== 'Active') {
        throw new Error(`Source wallet is currently ${source.status.toUpperCase()} and cannot perform transfers.`);
      }

      // Process balances
      const sourcePrev = source.currentBalance;
      const targetPrev = target.currentBalance;

      source.currentBalance -= amount;
      source.availableBalance -= amount;
      source.updatedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

      target.currentBalance += amount;
      target.availableBalance += amount;
      target.updatedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Create Ledger entries
      const ref = `TXF-${Math.floor(10000 + Math.random() * 90000)}`;
      const ledgerAccount = '1100 - Customer Deposits (Asset)';

      const sourceLedger: LedgerEntry = {
        id: `LEDGER-${Math.floor(10000 + Math.random() * 90000)}`,
        reference: ref,
        account: ledgerAccount,
        walletId: source.id,
        debit: amount,
        credit: 0,
        currency: currency,
        balanceBefore: sourcePrev,
        balanceAfter: source.currentBalance,
        postingTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      const targetLedger: LedgerEntry = {
        id: `LEDGER-${Math.floor(10000 + Math.random() * 90000)}`,
        reference: ref,
        account: ledgerAccount,
        walletId: target.id,
        debit: 0,
        credit: amount,
        currency: currency,
        balanceBefore: targetPrev,
        balanceAfter: target.currentBalance,
        postingTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      ledgerEntries.unshift(sourceLedger, targetLedger);

      // Create Transaction
      const newTx: Transaction = {
        id: `TX-${Math.floor(80000 + Math.random() * 9000)}`,
        reference: ref,
        customerName: source.customerName,
        customerEmail: source.customerEmail,
        senderWalletId: source.id,
        receiverWalletId: target.id,
        currency,
        amount,
        fee: 0,
        status: 'Completed',
        channel: 'Web',
        type: 'Transfer',
        paymentMethod: 'Internal Transfer',
        country: source.country,
        device: 'Admin Portal Core',
        ipAddress: '127.0.0.1',
        location: 'Internal System Transfer',
        riskScore: 10,
        createdTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        completedTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        auditTrail: [
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            action: 'Transfer Completed',
            performedBy: 'System Administrator',
            details: `Manual funds transfer: ${amount} ${currency} from ${source.id} to ${target.id}. Note: ${description}`
          }
        ]
      };
      transactions.unshift(newTx);

      setStored(STORAGE_KEYS.WALLETS, wallets);
      setStored(STORAGE_KEYS.LEDGER, ledgerEntries);
      setStored(STORAGE_KEYS.TRANSACTIONS, transactions);

      return { source, target };
    }
  },

  // TRANSACTIONS
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const res = await apiClient.get<Transaction[]>('/transactions');
      if (res.data && Array.isArray(res.data)) {
        transactions = res.data;
        setStored(STORAGE_KEYS.TRANSACTIONS, transactions);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /transactions unavailable, falling back to local state', e);
      await delay(300);
      return [...transactions];
    }
  },

  updateTransactionStatus: async (
    txId: string, 
    status: TransactionStatus, 
    performedBy: string, 
    notes: string = ''
  ): Promise<Transaction> => {
    try {
      const res = await apiClient.patch<Transaction>(`/transactions/${txId}/status`, { status, notes, performedBy });
      return res.data;
    } catch (e) {
      console.warn('Backend /transactions/:id/status unavailable, updating local state', e);
      await delay(450);
      const index = transactions.findIndex(t => t.id === txId);
      if (index === -1) throw new Error('Transaction not found');

      const tx = transactions[index];
      const prevStatus = tx.status;
      tx.status = status;
      tx.completedTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      tx.auditTrail.unshift({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        action: `Status Update: ${status}`,
        performedBy,
        details: `Changed from ${prevStatus} to ${status}. Details: ${notes}`
      });

      // If transaction status changes to Reversed or Refunded, return balances
      if ((status === 'Reversed' || status === 'Refunded') && prevStatus === 'Completed') {
        const senderIdx = wallets.findIndex(w => w.id === tx.senderWalletId);
        const receiverIdx = wallets.findIndex(w => w.id === tx.receiverWalletId);

        if (senderIdx !== -1) {
          wallets[senderIdx].currentBalance += tx.amount;
          wallets[senderIdx].availableBalance += tx.amount;
          wallets[senderIdx].updatedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }

        if (receiverIdx !== -1) {
          wallets[receiverIdx].currentBalance -= tx.amount;
          wallets[receiverIdx].availableBalance -= tx.amount;
          wallets[receiverIdx].updatedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
        
        // Post reversal ledger entries
        const reversalRef = `REV-${tx.id}`;
        const revEntry1: LedgerEntry = {
          id: `LEDGER-${Math.floor(10000 + Math.random() * 90000)}`,
          reference: reversalRef,
          account: '1100 - Customer Deposits (Asset)',
          walletId: tx.senderWalletId,
          debit: 0,
          credit: tx.amount, // Credit back
          currency: tx.currency,
          balanceBefore: senderIdx !== -1 ? wallets[senderIdx].currentBalance - tx.amount : 0,
          balanceAfter: senderIdx !== -1 ? wallets[senderIdx].currentBalance : 0,
          postingTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        ledgerEntries.unshift(revEntry1);
        
        setStored(STORAGE_KEYS.WALLETS, wallets);
        setStored(STORAGE_KEYS.LEDGER, ledgerEntries);
      }

      setStored(STORAGE_KEYS.TRANSACTIONS, transactions);
      return tx;
    }
  },

  // LEDGER
  getLedger: async (): Promise<LedgerEntry[]> => {
    try {
      const res = await apiClient.get<LedgerEntry[]>('/transactions/ledger');
      if (res.data && Array.isArray(res.data)) {
        ledgerEntries = res.data;
        setStored(STORAGE_KEYS.LEDGER, ledgerEntries);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /transactions/ledger unavailable, falling back to local state', e);
      await delay(250);
      return [...ledgerEntries];
    }
  },

  // SETTLEMENTS
  getSettlements: async (): Promise<Settlement[]> => {
    try {
      const res = await apiClient.get<Settlement[]>('/transactions/settlements');
      if (res.data && Array.isArray(res.data)) {
        settlements = res.data;
        setStored(STORAGE_KEYS.SETTLEMENTS, settlements);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /transactions/settlements unavailable, falling back to local state', e);
      await delay(300);
      return [...settlements];
    }
  },

  updateSettlementStatus: async (settlementId: string, status: SettlementStatus): Promise<Settlement> => {
    try {
      const res = await apiClient.patch<Settlement>(`/transactions/settlements/${settlementId}`, { status });
      return res.data;
    } catch (e) {
      console.warn('Backend /transactions/settlements/:id unavailable, updating local state', e);
      await delay(400);
      const index = settlements.findIndex(s => s.id === settlementId);
      if (index === -1) throw new Error('Settlement not found');

      settlements[index] = {
        ...settlements[index],
        status,
        completedTime: status === 'Completed' || status === 'Failed' 
          ? new Date().toISOString().replace('T', ' ').substring(0, 19) 
          : null
      };

      setStored(STORAGE_KEYS.SETTLEMENTS, settlements);
      return settlements[index];
    }
  },

  // REFUNDS
  getRefunds: async (): Promise<Refund[]> => {
    try {
      const res = await apiClient.get<Refund[]>('/transactions/refunds');
      if (res.data && Array.isArray(res.data)) {
        refunds = res.data;
        setStored(STORAGE_KEYS.REFUNDS, refunds);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /transactions/refunds unavailable, falling back to local state', e);
      await delay(250);
      return [...refunds];
    }
  },

  processRefundAction: async (
    refundId: string, 
    status: 'Approved' | 'Rejected', 
    reviewer: string, 
    comments: string
  ): Promise<Refund> => {
    try {
      const res = await apiClient.post<Refund>(`/transactions/refunds/${refundId}/process`, { status, comments, reviewer });
      return res.data;
    } catch (e) {
      console.warn('Backend refund processing unavailable, updating local state', e);
      await delay(450);
      const index = refunds.findIndex(r => r.id === refundId);
      if (index === -1) throw new Error('Refund record not found');

      const refund = refunds[index];
      refund.status = status === 'Approved' ? 'Processed' : 'Rejected';
      refund.reviewedTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
      refund.reviewedBy = reviewer;
      refund.comments = comments;

      // If approved, update underlying transaction
      if (status === 'Approved') {
        try {
          await OperationsService.updateTransactionStatus(
            refund.transactionId, 
            'Refunded', 
            reviewer, 
            `Refund ${refundId} approved: ${comments}`
          );
        } catch (e) {
          // Underling transaction might not exist in local mock list, that's fine
        }
      }

      setStored(STORAGE_KEYS.REFUNDS, refunds);
      return refund;
    }
  },

  createRefundRequest: async (
    transactionId: string,
    walletId: string,
    customerName: string,
    currency: string,
    amount: number,
    reason: string
  ): Promise<Refund> => {
    try {
      const res = await apiClient.post<Refund>('/transactions/refunds', {
        transactionId,
        walletId,
        customerName,
        currency,
        amount,
        reason
      });
      return res.data;
    } catch (e) {
      console.warn('Backend refund creation unavailable, updating local state', e);
      await delay(400);
      const newRefund: Refund = {
        id: `REFUND-${Math.floor(500 + Math.random() * 500)}`,
        transactionId,
        walletId,
        customerName,
        currency,
        amount,
        reason,
        status: 'Pending Approval',
        requestedTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        reviewedTime: null,
        reviewedBy: null
      };

      refunds.unshift(newRefund);
      setStored(STORAGE_KEYS.REFUNDS, refunds);
      return newRefund;
    }
  },

  // LIMITS
  getLimits: async (): Promise<LimitConfig[]> => {
    try {
      const res = await apiClient.get<LimitConfig[]>('/wallets/limits');
      if (res.data && Array.isArray(res.data)) {
        limits = res.data;
        setStored(STORAGE_KEYS.LIMITS, limits);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /wallets/limits unavailable, falling back to local state', e);
      await delay(250);
      return [...limits];
    }
  },

  updateLimits: async (limitId: string, fields: Partial<LimitConfig>): Promise<LimitConfig> => {
    try {
      const res = await apiClient.patch<LimitConfig>(`/wallets/limits/${limitId}`, fields);
      return res.data;
    } catch (e) {
      console.warn('Backend patch limits unavailable, updating local state', e);
      await delay(350);
      const index = limits.findIndex(l => l.id === limitId);
      if (index === -1) throw new Error('Limit profile not found');

      limits[index] = {
        ...limits[index],
        ...fields,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      setStored(STORAGE_KEYS.LIMITS, limits);
      return limits[index];
    }
  },

  // CARDS OPERATIONAL SUITE
  getCards: async (): Promise<Card[]> => {
    try {
      const res = await apiClient.get<Card[]>('/cards');
      if (res.data && Array.isArray(res.data)) {
        cards = res.data;
        setStored(STORAGE_KEYS.CARDS, cards);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /cards unavailable, falling back to local state', e);
      await delay(300);
      return [...cards];
    }
  },

  getCardOrders: async (): Promise<CardOrder[]> => {
    try {
      const res = await apiClient.get<CardOrder[]>('/cards/orders');
      if (res.data && Array.isArray(res.data)) {
        cardOrders = res.data;
        setStored(STORAGE_KEYS.CARD_ORDERS, cardOrders);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /cards/orders unavailable, falling back to local state', e);
      await delay(250);
      return [...cardOrders];
    }
  },

  getCardTransactions: async (): Promise<CardTransaction[]> => {
    try {
      const res = await apiClient.get<CardTransaction[]>('/cards/transactions');
      if (res.data && Array.isArray(res.data)) {
        cardTransactions = res.data;
        setStored(STORAGE_KEYS.CARD_TRANSACTIONS, cardTransactions);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /cards/transactions unavailable, falling back to local state', e);
      await delay(250);
      return [...cardTransactions];
    }
  },

  getCardFraudAlerts: async (): Promise<CardFraudAlert[]> => {
    try {
      const res = await apiClient.get<CardFraudAlert[]>('/cards/fraud-alerts');
      if (res.data && Array.isArray(res.data)) {
        cardFraudAlerts = res.data;
        setStored(STORAGE_KEYS.CARD_FRAUD_ALERTS, cardFraudAlerts);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /cards/fraud-alerts unavailable, falling back to local state', e);
      await delay(200);
      return [...cardFraudAlerts];
    }
  },

  issueCard: async (newCardFields: Partial<Card>, shippingAddress?: string): Promise<Card> => {
    try {
      const res = await apiClient.post<Card>('/cards/issue', { newCardFields, shippingAddress });
      return res.data;
    } catch (e) {
      console.warn('Backend /cards/issue unavailable, updating local state', e);
      await delay(600);
      const id = `C-${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`;
      const network = newCardFields.network || 'Visa';
      
      // Generate card number based on network
      let cardNum = '';
      if (network === 'Visa') {
        cardNum = '4' + Array.from({length: 15}, () => Math.floor(Math.random() * 10)).join('');
      } else if (network === 'Mastercard') {
        cardNum = '5' + Math.floor(1 + Math.random() * 4) + Array.from({length: 14}, () => Math.floor(Math.random() * 10)).join('');
      } else if (network === 'Amex') {
        cardNum = '37' + Array.from({length: 13}, () => Math.floor(Math.random() * 10)).join('');
      } else {
        cardNum = '6' + Array.from({length: 15}, () => Math.floor(Math.random() * 10)).join('');
      }

      const createdTimeStr = new Date().toISOString().replace('T', ' ').substring(0, 10);
      const expiryYear = (parseInt(new Date().getFullYear().toString().substring(2)) + 4).toString();
      const expiryMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const expiryStr = `${expiryMonth}/${expiryYear}`;

      const newCard: Card = {
        id,
        cardNumber: cardNum,
        cvv: String(Math.floor(100 + Math.random() * 899)),
        expiryDate: expiryStr,
        customerName: newCardFields.customerName || 'Acme Global Inc.',
        customerEmail: newCardFields.customerEmail || 'finance@acmeglobal.com',
        customerPhone: newCardFields.customerPhone || '+1 (555) 019-2834',
        cardType: newCardFields.cardType || 'Virtual',
        network,
        status: newCardFields.status || 'Active',
        currency: newCardFields.currency || 'USD',
        linkedWalletId: newCardFields.linkedWalletId || 'W-ENT-9021',
        currentLimit: newCardFields.currentLimit || 5000,
        availableLimit: newCardFields.currentLimit || 5000,
        dailyLimit: newCardFields.dailyLimit || 1000,
        weeklyLimit: newCardFields.weeklyLimit || 3000,
        monthlyLimit: newCardFields.monthlyLimit || 10000,
        atmLimit: newCardFields.cardType === 'Physical' ? 500 : 0,
        onlineLimit: newCardFields.onlineLimit || 5000,
        posLimit: newCardFields.posLimit || 2000,
        internationalLimit: newCardFields.internationalLimit || 2000,
        country: newCardFields.country || 'United States',
        issueDate: createdTimeStr,
        lastTransactionDate: null,
        riskLevel: 'Low',
        riskScore: 10,
        pin: newCardFields.pin || String(Math.floor(1000 + Math.random() * 8999)),
        onlinePaymentsEnabled: true,
        atmEnabled: newCardFields.cardType === 'Physical',
        contactlessEnabled: newCardFields.cardType === 'Physical',
        internationalEnabled: true,
        blockedMerchants: [],
        blockedCountries: [],
        blockedCategories: [],
        deviceVerified: false,
        velocityAlertsCount: 0
      };

      cards.unshift(newCard);
      setStored(STORAGE_KEYS.CARDS, cards);

      // If it's physical, create a CardOrder record
      if (newCard.cardType === 'Physical') {
        const newOrder: CardOrder = {
          id: `CO-${Math.floor(1000 + Math.random() * 8999)}`,
          cardId: id,
          customerName: newCard.customerName,
          cardType: 'Physical',
          deliveryMethod: 'Express Courier',
          shippingAddress: shippingAddress || '100 Pine St, San Francisco, CA 94111, USA',
          status: 'Pending',
          carrier: 'DHL Express',
          trackingNumber: `DHL${Math.floor(100000000 + Math.random() * 899999999)}`,
          createdDate: createdTimeStr,
          estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 10)
        };
        cardOrders.unshift(newOrder);
        setStored(STORAGE_KEYS.CARD_ORDERS, cardOrders);
      }

      return newCard;
    }
  },

  updateCardStatus: async (cardId: string, status: CardStatus, note?: string): Promise<Card> => {
    try {
      const res = await apiClient.patch<Card>(`/cards/${cardId}/status`, { status, note });
      return res.data;
    } catch (e) {
      console.warn('Backend card status update unavailable, updating local state', e);
      await delay(350);
      const index = cards.findIndex(c => c.id === cardId);
      if (index === -1) throw new Error('Card not found');

      cards[index] = {
        ...cards[index],
        status,
        compromisedReason: note || cards[index].compromisedReason
      };

      setStored(STORAGE_KEYS.CARDS, cards);
      return cards[index];
    }
  },

  updateCardLimits: async (cardId: string, fields: Partial<Card>): Promise<Card> => {
    try {
      const res = await apiClient.patch<Card>(`/cards/${cardId}/limits`, fields);
      return res.data;
    } catch (e) {
      console.warn('Backend card limits update unavailable, updating local state', e);
      await delay(400);
      const index = cards.findIndex(c => c.id === cardId);
      if (index === -1) throw new Error('Card not found');

      cards[index] = {
        ...cards[index],
        ...fields
      };

      setStored(STORAGE_KEYS.CARDS, cards);
      return cards[index];
    }
  },

  updateCardSecurity: async (cardId: string, fields: Partial<Card>): Promise<Card> => {
    try {
      const res = await apiClient.patch<Card>(`/cards/${cardId}/security`, fields);
      return res.data;
    } catch (e) {
      console.warn('Backend card security update unavailable, updating local state', e);
      await delay(350);
      const index = cards.findIndex(c => c.id === cardId);
      if (index === -1) throw new Error('Card not found');

      cards[index] = {
        ...cards[index],
        ...fields
      };

      setStored(STORAGE_KEYS.CARDS, cards);
      return cards[index];
    }
  },

  updateCardRestrictions: async (
    cardId: string,
    blockedMerchants: string[],
    blockedCountries: string[],
    blockedCategories: string[]
  ): Promise<Card> => {
    try {
      const res = await apiClient.patch<Card>(`/cards/${cardId}/restrictions`, { blockedMerchants, blockedCountries, blockedCategories });
      return res.data;
    } catch (e) {
      console.warn('Backend card restrictions update unavailable, updating local state', e);
      await delay(400);
      const index = cards.findIndex(c => c.id === cardId);
      if (index === -1) throw new Error('Card not found');

      cards[index] = {
        ...cards[index],
        blockedMerchants,
        blockedCountries,
        blockedCategories
      };

      setStored(STORAGE_KEYS.CARDS, cards);
      return cards[index];
    }
  },

  regenerateCard: async (cardId: string): Promise<Card> => {
    try {
      const res = await apiClient.post<Card>(`/cards/${cardId}/regenerate`);
      return res.data;
    } catch (e) {
      console.warn('Backend card regeneration unavailable, updating local state', e);
      await delay(500);
      const index = cards.findIndex(c => c.id === cardId);
      if (index === -1) throw new Error('Card not found');

      const network = cards[index].network;
      let cardNum = '';
      if (network === 'Visa') {
        cardNum = '4' + Array.from({length: 15}, () => Math.floor(Math.random() * 10)).join('');
      } else if (network === 'Mastercard') {
        cardNum = '5' + Math.floor(1 + Math.random() * 4) + Array.from({length: 14}, () => Math.floor(Math.random() * 10)).join('');
      } else if (network === 'Amex') {
        cardNum = '37' + Array.from({length: 13}, () => Math.floor(Math.random() * 10)).join('');
      } else {
        cardNum = '6' + Array.from({length: 15}, () => Math.floor(Math.random() * 10)).join('');
      }

      const expiryYear = (parseInt(new Date().getFullYear().toString().substring(2)) + 4).toString();
      const expiryMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const expiryStr = `${expiryMonth}/${expiryYear}`;

      cards[index] = {
        ...cards[index],
        cardNumber: cardNum,
        cvv: String(Math.floor(100 + Math.random() * 899)),
        expiryDate: expiryStr,
        status: 'Active'
      };

      setStored(STORAGE_KEYS.CARDS, cards);
      return cards[index];
    }
  }
};
