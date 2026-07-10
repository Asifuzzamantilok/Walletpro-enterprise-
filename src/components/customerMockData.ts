import { Customer } from './customerTypes';

export const initialCustomers: Customer[] = [
  {
    id: 'CUST-8201',
    fullName: 'Alexander Wright',
    email: 'alex.wright@enterprise.com',
    phone: '+1 (555) 234-5678',
    country: 'United States',
    walletStatus: 'Active',
    kycStatus: 'Verified',
    riskScore: 12,
    accountTier: 'VIP',
    totalBalance: 142500.00,
    primaryCurrency: 'USD',
    lastLogin: '2026-07-08 09:12',
    lastTransaction: '2026-07-07 14:45',
    registrationDate: '2025-01-15',
    referralStatus: 'Active',
    assignedAgent: 'Marcus Vance',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    wallets: [
      { id: 'W-USD-01', currency: 'USD', balance: 125000.00, isPrimary: true, status: 'Active' },
      { id: 'W-EUR-01', currency: 'EUR', balance: 15000.00, isPrimary: false, status: 'Active' },
      { id: 'W-GBP-01', currency: 'GBP', balance: 2500.00, isPrimary: false, status: 'Active' }
    ],
    cards: [
      { id: 'CARD-9012', cardNumber: '•••• •••• •••• 4291', cardType: 'Physical', expiry: '12/29', status: 'Active', limit: 10000 },
      { id: 'CARD-3045', cardNumber: '•••• •••• •••• 8102', cardType: 'Virtual', expiry: '06/28', status: 'Active', limit: 2500 }
    ],
    transactions: [
      { id: 'TX-901', date: '2026-07-07 14:45', description: 'Stripe Settlement Payout', amount: 45000.00, currency: 'USD', status: 'Settled', type: 'Inflow' },
      { id: 'TX-902', date: '2026-07-06 18:22', description: 'AWS Cloud Services Invoicing', amount: -1250.00, currency: 'USD', status: 'Settled', type: 'Outflow' },
      { id: 'TX-903', date: '2026-07-05 11:30', description: 'Wire Transfer Out - HSBC', amount: -15000.00, currency: 'EUR', status: 'Settled', type: 'Outflow' },
      { id: 'TX-904', date: '2026-07-03 09:15', description: 'Card POS Swipe - Apple Store', amount: -2199.00, currency: 'USD', status: 'Settled', type: 'Outflow' }
    ],
    beneficiaries: ['Sarah Jenkins (HSBC)', 'Acme Corporation Billing', 'John Wright'],
    bankAccounts: ['HSBC Corporate Checking ••••4820', 'Chase Savings ••••1192'],
    devices: ['Apple iPhone 15 Pro (iOS 17.4)', 'Apple MacBook Pro M3 (macOS 14.2)'],
    sessions: ['New York, US - 2026-07-08 09:12 (Current)', 'Boston, US - 2026-07-07 10:15'],
    documents: [
      { id: 'DOC-8201A', name: 'US_Passport_Wright.pdf', type: 'Passport', status: 'Approved', url: '#' },
      { id: 'DOC-8201B', name: 'Utility_Bill_June2026.pdf', type: 'Utility Bill', status: 'Approved', url: '#' }
    ],
    supportTickets: [
      { id: 'TKT-1049', subject: 'Increase transaction limit request', status: 'Resolved', priority: 'High', createdDate: '2026-06-20' },
      { id: 'TKT-3091', subject: 'Corporate card courier delays', status: 'Resolved', priority: 'Medium', createdDate: '2026-05-11' }
    ],
    fraudSignals: ['No active warnings', 'Standard commercial user', 'IP Address matches registered ZIP code'],
    timeline: [
      { id: 'EV-101', date: '2026-07-08 09:12', title: 'Successful Session Authentication', description: 'Authorized access from Chrome, macOS via New York residential IP.', category: 'Login' },
      { id: 'EV-102', date: '2026-07-07 14:45', title: 'High-Value Inward Settlement Received', description: 'Credited USD 45,000.00 from Stripe merchant processing.', category: 'Transaction' },
      { id: 'EV-103', date: '2026-06-22', title: 'Corporate Card Activated', description: 'Physical card Ending in 4291 was successfully activated by user.', category: 'Card' },
      { id: 'EV-104', date: '2025-01-16', title: 'KYC Verification Approved', description: 'Identity validated and assigned risk score of 12 (Low).', category: 'KYC', performedBy: 'System Auditor' },
      { id: 'EV-105', date: '2025-01-15', title: 'Core Registration Complete', description: 'User account created using email verification workflow.', category: 'Registration' }
    ],
    notes: 'Primary corporate treasurer for Wright Consulting Group. Extremely high transaction volume, trusted accounts.',
    securitySettings: {
      twoFactorEnabled: true,
      biometricsEnabled: true,
      withdrawalLimit: 150000
    }
  },
  {
    id: 'CUST-4039',
    fullName: 'Elena Rostova',
    email: 'elena.rostova@berlin-tech.de',
    phone: '+49 170 9876543',
    country: 'Germany',
    walletStatus: 'Active',
    kycStatus: 'Verified',
    riskScore: 28,
    accountTier: 'Tier 3',
    totalBalance: 48900.00,
    primaryCurrency: 'EUR',
    lastLogin: '2026-07-08 08:04',
    lastTransaction: '2026-07-08 07:45',
    registrationDate: '2025-04-10',
    referralStatus: 'Inactive',
    assignedAgent: 'Marcus Vance',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    wallets: [
      { id: 'W-EUR-02', currency: 'EUR', balance: 48900.00, isPrimary: true, status: 'Active' }
    ],
    cards: [
      { id: 'CARD-4402', cardNumber: '•••• •••• •••• 9283', cardType: 'Physical', expiry: '09/28', status: 'Active', limit: 5000 }
    ],
    transactions: [
      { id: 'TX-401', date: '2026-07-08 07:45', description: 'SEPA Direct Credit Transfer', amount: 3200.00, currency: 'EUR', status: 'Settled', type: 'Inflow' },
      { id: 'TX-402', date: '2026-07-02 12:11', description: 'Digital Ocean Host Service', amount: -240.00, currency: 'EUR', status: 'Settled', type: 'Outflow' }
    ],
    beneficiaries: ['Lars Schmidt', 'Berlin Energy GmbH'],
    bankAccounts: ['Deutsche Bank IBAN DE76••••9011'],
    devices: ['Samsung Galaxy S24 (Android 14)'],
    sessions: ['Berlin, DE - 2026-07-08 08:04'],
    documents: [
      { id: 'DOC-4039A', name: 'EU_ID_Rostova.jpg', type: 'Passport', status: 'Approved', url: '#' }
    ],
    supportTickets: [],
    fraudSignals: ['No anomalies detected', 'European SEPA trusted participant'],
    timeline: [
      { id: 'EV-401', date: '2026-07-08 08:04', title: 'Successful Session Authentication', description: 'Authorized access from Berlin IP.', category: 'Login' },
      { id: 'EV-402', date: '2026-07-08 07:45', title: 'SEPA Settlement Received', description: 'Credited EUR 3,200.00 via SEPA Instant Clear.', category: 'Transaction' }
    ],
    notes: 'Consulting CTO. Consistent volume, clean transaction ledger history.',
    securitySettings: {
      twoFactorEnabled: true,
      biometricsEnabled: true,
      withdrawalLimit: 50000
    }
  },
  {
    id: 'CUST-9124',
    fullName: 'Yuki Tanaka',
    email: 'yuki.tanaka@tokyo-finance.jp',
    phone: '+81 90 1234 5678',
    country: 'Japan',
    walletStatus: 'Active',
    kycStatus: 'Pending',
    riskScore: 45,
    accountTier: 'Tier 2',
    totalBalance: 810500.00,
    primaryCurrency: 'JPY',
    lastLogin: '2026-07-07 19:40',
    lastTransaction: '2026-07-05 10:20',
    registrationDate: '2026-07-01',
    referralStatus: 'Active',
    assignedAgent: 'Unassigned',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    wallets: [
      { id: 'W-JPY-01', currency: 'JPY', balance: 810500.00, isPrimary: true, status: 'Active' }
    ],
    cards: [
      { id: 'CARD-9041', cardNumber: '•••• •••• •••• 1102', cardType: 'Virtual', expiry: '07/31', status: 'Active', limit: 1000 }
    ],
    transactions: [
      { id: 'TX-701', date: '2026-07-05 10:20', description: 'Initial Wallet Deposit - Card', amount: 810500.00, currency: 'JPY', status: 'Settled', type: 'Inflow' }
    ],
    beneficiaries: [],
    bankAccounts: [],
    devices: ['Sony Xperia 5 (Android 13)'],
    sessions: ['Tokyo, JP - 2026-07-07 19:40'],
    documents: [
      { id: 'DOC-9124A', name: 'Japan_Driver_License.png', type: 'Passport', status: 'Pending', url: '#' }
    ],
    supportTickets: [
      { id: 'TKT-9102', subject: 'KYC Verification backlog update', status: 'Open', priority: 'Medium', createdDate: '2026-07-04' }
    ],
    fraudSignals: ['Foreign currency funding', 'High velocity deposit immediately post registration'],
    timeline: [
      { id: 'EV-701', date: '2026-07-05 10:20', title: 'Wallet Funding Completed', description: 'Deposit of JPY 810,500.00 via debit interface.', category: 'Transaction' },
      { id: 'EV-702', date: '2026-07-04', title: 'KYC Document Uploaded', description: 'Japan Driver License submitted for identity auditing.', category: 'KYC' }
    ],
    notes: 'Awaiting final KYC manual audit due to Japanese localized document validation.',
    securitySettings: {
      twoFactorEnabled: false,
      biometricsEnabled: true,
      withdrawalLimit: 20000
    }
  },
  {
    id: 'CUST-3108',
    fullName: 'Liam O’Connor',
    email: 'liam.oconnor@dublin-net.ie',
    phone: '+353 87 112 3456',
    country: 'Ireland',
    walletStatus: 'Suspended',
    kycStatus: 'Rejected',
    riskScore: 82,
    accountTier: 'Tier 1',
    totalBalance: 420.00,
    primaryCurrency: 'EUR',
    lastLogin: '2026-07-06 23:45',
    lastTransaction: '2026-07-01 15:30',
    registrationDate: '2026-05-18',
    referralStatus: 'Inactive',
    assignedAgent: 'Clarissa Finch',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    wallets: [
      { id: 'W-EUR-03', currency: 'EUR', balance: 420.00, isPrimary: true, status: 'Frozen' }
    ],
    cards: [
      { id: 'CARD-1192', cardNumber: '•••• •••• •••• 5520', cardType: 'Physical', expiry: '06/29', status: 'Blocked', limit: 0 }
    ],
    transactions: [
      { id: 'TX-301', date: '2026-07-01 15:30', description: 'ATM Cash Withdrawal Attempt (Failed)', amount: -500.00, currency: 'EUR', status: 'Failed', type: 'Outflow' }
    ],
    beneficiaries: [],
    bankAccounts: [],
    devices: ['OnePlus 12 (Android 14)'],
    sessions: ['Dublin, IE - 2026-07-06 23:45', 'Unknown IP (VCN VPN) - 2026-07-05 21:30'],
    documents: [
      { id: 'DOC-3108A', name: 'Mismatched_Utility_Bill.pdf', type: 'Utility Bill', status: 'Rejected', url: '#' }
    ],
    supportTickets: [
      { id: 'TKT-3129', subject: 'Account locked restrictions query', status: 'In Progress', priority: 'High', createdDate: '2026-07-02' }
    ],
    fraudSignals: ['Mismatched bill registration addresses', 'Frequent login locations through commercial proxies', 'Failed card transactions patterns'],
    timeline: [
      { id: 'EV-301', date: '2026-07-02', title: 'Manual Suspension Imposed', description: 'Wallet frozen due to rejected address documents and multiple high risk triggers.', category: 'Admin', performedBy: 'Clarissa Finch' },
      { id: 'EV-302', date: '2026-07-01', title: 'KYC Submission Rejected', description: 'Utility bill name and address fail matching with database entries.', category: 'KYC' }
    ],
    notes: 'Flagged for multiple compliance fails. Standard KYC addresses mismatched. Proceed with high caution.',
    securitySettings: {
      twoFactorEnabled: true,
      biometricsEnabled: false,
      withdrawalLimit: 0
    }
  },
  {
    id: 'CUST-1194',
    fullName: 'Amara Diop',
    email: 'amara.diop@dakar-pay.sn',
    phone: '+221 77 555 1234',
    country: 'Senegal',
    walletStatus: 'Active',
    kycStatus: 'Verified',
    riskScore: 19,
    accountTier: 'Tier 3',
    totalBalance: 2450000.00,
    primaryCurrency: 'XOF',
    lastLogin: '2026-07-08 05:40',
    lastTransaction: '2026-07-06 14:15',
    registrationDate: '2025-09-01',
    referralStatus: 'Active',
    assignedAgent: 'Unassigned',
    photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
    wallets: [
      { id: 'W-XOF-01', currency: 'XOF', balance: 2450000.00, isPrimary: true, status: 'Active' }
    ],
    cards: [
      { id: 'CARD-8801', cardNumber: '•••• •••• •••• 6602', cardType: 'Physical', expiry: '10/29', status: 'Active', limit: 2000 }
    ],
    transactions: [
      { id: 'TX-501', date: '2026-07-06 14:15', description: 'International Inbound Transfer', amount: 850000.00, currency: 'XOF', status: 'Settled', type: 'Inflow' }
    ],
    beneficiaries: ['Dakar Trade Corp'],
    bankAccounts: ['Orabank Senegal ••••9912'],
    devices: ['Apple iPad Air (iPadOS 17.1)'],
    sessions: ['Dakar, SN - 2026-07-08 05:40'],
    documents: [
      { id: 'DOC-1194A', name: 'National_ID_Diop.pdf', type: 'Passport', status: 'Approved', url: '#' }
    ],
    supportTickets: [],
    fraudSignals: ['No active warnings'],
    timeline: [
      { id: 'EV-501', date: '2026-07-08 05:40', title: 'Successful Session Authentication', description: 'Authorized access from Dakar, SN.', category: 'Login' }
    ],
    notes: 'Highly active West African regional merchant operations.',
    securitySettings: {
      twoFactorEnabled: true,
      biometricsEnabled: true,
      withdrawalLimit: 100000
    }
  },
  {
    id: 'CUST-5510',
    fullName: 'Sophia Martinez',
    email: 'sophia.martinez@bogota-fin.co',
    phone: '+57 312 908 1111',
    country: 'Colombia',
    walletStatus: 'Frozen',
    kycStatus: 'Verified',
    riskScore: 71,
    accountTier: 'Tier 2',
    totalBalance: 125000.00,
    primaryCurrency: 'COP',
    lastLogin: '2026-07-07 15:30',
    lastTransaction: '2026-07-07 11:45',
    registrationDate: '2026-02-12',
    referralStatus: 'Inactive',
    assignedAgent: 'Clarissa Finch',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    wallets: [
      { id: 'W-COP-01', currency: 'COP', balance: 125000.00, isPrimary: true, status: 'Frozen' }
    ],
    cards: [
      { id: 'CARD-7721', cardNumber: '•••• •••• •••• 3349', cardType: 'Virtual', expiry: '04/28', status: 'Blocked', limit: 0 }
    ],
    transactions: [
      { id: 'TX-601', date: '2026-07-07 11:45', description: 'Refund to Card Merchant', amount: 75000.00, currency: 'COP', status: 'Settled', type: 'Inflow' },
      { id: 'TX-602', date: '2026-07-05 13:00', description: 'Card POS Swipe - Unrecognized Colombia POS', amount: -210000.00, currency: 'COP', status: 'Refunded', type: 'Outflow' }
    ],
    beneficiaries: [],
    bankAccounts: [],
    devices: ['Apple iPhone 14 (iOS 16.5)'],
    sessions: ['Cali, CO - 2026-07-07 15:30', 'Bogota, CO - 2026-07-07 11:45'],
    documents: [
      { id: 'DOC-5510A', name: 'Cedula_Martinez.pdf', type: 'Passport', status: 'Approved', url: '#' }
    ],
    supportTickets: [
      { id: 'TKT-5521', subject: 'Card unauthorized transaction claim', status: 'In Progress', priority: 'High', createdDate: '2026-07-06' }
    ],
    fraudSignals: ['Suspicious concurrent login locations', 'Chargeback initiated for Colombiano POS'],
    timeline: [
      { id: 'EV-601', date: '2026-07-07 15:30', title: 'Self-Service Block Triggered', description: 'User called in reporting fraud, support locked the wallet.', category: 'Support' },
      { id: 'EV-602', date: '2026-07-07 11:45', title: 'Chargeback Refund Processed', description: 'Admin approved credit refund of COP 75,000.00 for disputed invoice.', category: 'Admin', performedBy: 'Clarissa Finch' }
    ],
    notes: 'Compromised card dispute active. User reported phone thief cloned device. Support froze card and pending further secure callback validation.',
    securitySettings: {
      twoFactorEnabled: true,
      biometricsEnabled: true,
      withdrawalLimit: 0
    }
  }
];
