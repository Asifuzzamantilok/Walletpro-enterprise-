export type WalletStatus = 'Active' | 'Frozen' | 'Locked';
export type WalletRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type WalletType = 'Enterprise' | 'Customer' | 'Merchant' | 'Settlement' | 'Escrow';

export interface Wallet {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  currency: string;
  walletType: WalletType;
  currentBalance: number;
  availableBalance: number;
  heldBalance: number;
  pendingBalance: number;
  status: WalletStatus;
  riskLevel: WalletRiskLevel;
  riskScore: number;
  country: string;
  accountTier: 'Tier 1' | 'Tier 2' | 'Tier 3 (VIP)';
  createdDate: string;
  updatedDate: string;
  cardsCount: number;
  beneficiariesCount: number;
  bankAccountsCount: number;
}

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed' | 'Reversed' | 'Refunded' | 'Under Review';
export type TransactionType = 'Payment' | 'Transfer' | 'Refund' | 'Payout' | 'Deposit' | 'Sweep';
export type TransactionChannel = 'API' | 'Card' | 'Web' | 'Mobile' | 'ACH' | 'Wire' | 'SWIFT';

export interface Transaction {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  senderWalletId: string;
  receiverWalletId: string;
  currency: string;
  amount: number;
  fee: number;
  status: TransactionStatus;
  channel: TransactionChannel;
  type: TransactionType;
  paymentMethod: string;
  country: string;
  device: string;
  ipAddress: string;
  location: string;
  riskScore: number;
  createdTime: string;
  completedTime: string | null;
  auditTrail: {
    timestamp: string;
    action: string;
    performedBy: string;
    details: string;
  }[];
}

export interface LedgerEntry {
  id: string;
  reference: string;
  account: string;
  walletId: string;
  debit: number;
  credit: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  postingTime: string;
}

export type SettlementStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface Settlement {
  id: string;
  merchantName: string;
  walletId: string;
  currency: string;
  amount: number;
  fee: number;
  destinationBank: string;
  accountNumber: string;
  status: SettlementStatus;
  batchId: string;
  createdTime: string;
  completedTime: string | null;
  errorMessage?: string;
}

export type RefundStatus = 'Pending Approval' | 'Approved' | 'Rejected' | 'Processed';

export interface Refund {
  id: string;
  transactionId: string;
  walletId: string;
  customerName: string;
  currency: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedTime: string;
  reviewedTime: string | null;
  reviewedBy: string | null;
  comments?: string;
}

export interface LimitConfig {
  id: string;
  walletId: string;
  customerName: string;
  currency: string;
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
  cardTxLimit: number;
  withdrawalLimit: number;
  transferLimit: number;
  merchantTxLimit: number;
  updatedAt: string;
}

export type CardStatus = 'Active' | 'Frozen' | 'Expired' | 'Blocked' | 'Pending';
export type CardType = 'Virtual' | 'Physical';
export type CardNetwork = 'Visa' | 'Mastercard' | 'Amex' | 'Discover';

export interface Card {
  id: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cardType: CardType;
  network: CardNetwork;
  status: CardStatus;
  currency: string;
  linkedWalletId: string;
  currentLimit: number;
  availableLimit: number;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  atmLimit: number;
  onlineLimit: number;
  posLimit: number;
  internationalLimit: number;
  country: string;
  issueDate: string;
  lastTransactionDate: string | null;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  pin: string;
  
  // Security Toggles
  onlinePaymentsEnabled: boolean;
  atmEnabled: boolean;
  contactlessEnabled: boolean;
  internationalEnabled: boolean;
  
  // Restrictions
  blockedMerchants: string[];
  blockedCountries: string[];
  blockedCategories: string[];
  
  deviceVerified: boolean;
  deviceModel?: string;
  velocityAlertsCount: number;
  compromisedReason?: string;
}

export interface CardOrder {
  id: string;
  cardId: string;
  customerName: string;
  cardType: CardType;
  deliveryMethod: 'Standard Mail' | 'Express Courier' | 'Digital Provisioning';
  shippingAddress: string;
  status: 'Pending' | 'Printing' | 'Shipped' | 'Delivered' | 'Failed';
  carrier: string;
  trackingNumber: string;
  createdDate: string;
  estimatedDeliveryDate: string;
}

export interface CardTransaction {
  id: string;
  cardId: string;
  maskedCardNumber: string;
  merchantName: string;
  merchantCountry: string;
  merchantCategory: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  status: 'Authorized' | 'Settled' | 'Declined' | 'Reversed';
  riskScore: number;
  authorizationCode: string;
  settlementStatus: 'Pending' | 'Settled' | 'Declined' | 'N/A';
  declineReason?: string;
  createdDate: string;
}

export interface CardFraudAlert {
  id: string;
  cardId: string;
  customerName: string;
  type: 'Suspicious Merchant' | 'Velocity Alert' | 'Country Mismatch' | 'Device Mismatch' | 'Blocked Attempt';
  details: string;
  riskScore: number;
  status: 'Active' | 'Investigated' | 'Dismissed' | 'Card Blocked';
  createdDate: string;
}
