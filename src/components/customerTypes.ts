import { LucideIcon } from 'lucide-react';

export type WalletStatus = 'Active' | 'Frozen' | 'Suspended';
export type KYCStatus = 'Verified' | 'Pending' | 'Rejected' | 'Not Submitted';
export type AccountTier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'VIP';

export interface CustomerWallet {
  id: string;
  currency: string;
  balance: number;
  isPrimary: boolean;
  status: 'Active' | 'Frozen';
}

export interface CustomerCard {
  id: string;
  cardNumber: string;
  cardType: 'Virtual' | 'Physical';
  expiry: string;
  status: 'Active' | 'Blocked';
  limit: number;
}

export interface CustomerTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: 'Settled' | 'Pending' | 'Refunded' | 'Failed';
  type: 'Inflow' | 'Outflow';
}

export interface CustomerSupportTicket {
  id: string;
  subject: string;
  status: 'Open' | 'Resolved' | 'In Progress';
  priority: 'High' | 'Medium' | 'Low';
  createdDate: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'Registration' | 'Login' | 'Password' | 'KYC' | 'Transaction' | 'Card' | 'Support' | 'Fraud' | 'Admin';
  performedBy?: string;
}

export interface CustomerDocument {
  id: string;
  name: string;
  type: 'Passport' | 'Utility Bill' | 'Selfie';
  status: 'Approved' | 'Pending' | 'Rejected';
  url: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  walletStatus: WalletStatus;
  kycStatus: KYCStatus;
  riskScore: number;
  accountTier: AccountTier;
  totalBalance: number;
  primaryCurrency: string;
  lastLogin: string;
  lastTransaction: string;
  registrationDate: string;
  referralStatus: 'Active' | 'Inactive';
  assignedAgent: string;
  photoUrl: string;
  wallets: CustomerWallet[];
  cards: CustomerCard[];
  transactions: CustomerTransaction[];
  beneficiaries: string[];
  bankAccounts: string[];
  devices: string[];
  sessions: string[];
  documents: CustomerDocument[];
  supportTickets: CustomerSupportTicket[];
  fraudSignals: string[];
  timeline: TimelineEvent[];
  notes: string;
  securitySettings: {
    twoFactorEnabled: boolean;
    biometricsEnabled: boolean;
    withdrawalLimit: number;
  };
}
