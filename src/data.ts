import { AuditFinding, RoadmapPhase, TreasuryBalance, TransactionFlow, RiskRule, DevConsoleFile } from './types';

export const initialFindings: AuditFinding[] = [
  {
    id: 'find-1',
    filePath: '/src/components/WalletTable.tsx',
    issueType: 'Logic Bleed',
    severity: 'High',
    loc: '1,420 LOC',
    recommendation: 'Refactor Hooks',
    description: 'The components are performing in-line calculation of complex balance aggregations, direct local storage state changes, and client-side transaction calculations without validating against cryptographic ledgers.',
    category: 'architecture',
    status: 'Pending',
    codeBad: `// WalletTable.tsx (BAD: In-line logic and state manipulation)
export default function WalletTable() {
  const [wallets, setWallets] = useState([]);
  
  useEffect(() => {
    // Bleeding database-like operations directly on client
    fetch('/api/wallets')
      .then(res => res.json())
      .then(data => {
        const aggregated = data.map(w => {
          let balance = w.initialBalance;
          w.transactions.forEach(tx => {
            if (tx.type === 'Inflow') balance += tx.amount;
            else balance -= tx.amount;
          });
          return { ...w, computedBalance: balance };
        });
        setWallets(aggregated);
      });
  }, []);
  
  const handleDirectTransfer = (fromId, toId, amount) => {
    // Modifying state locally without server authoritative sync
    const next = [...wallets];
    const source = next.find(w => w.id === fromId);
    const dest = next.find(w => w.id === toId);
    source.computedBalance -= amount;
    dest.computedBalance += amount;
    setWallets(next);
    // Silent API post with no transaction tokens
    fetch('/api/transfer-direct', { method: 'POST', body: JSON.stringify({ fromId, toId, amount }) });
  };
  
  return (/* ... */);
}`,
    codeGood: `// WalletTable.tsx (GOOD: Pure representation, state separation)
import { useWalletLedger } from '@/src/hooks/useWalletLedger';
import { WalletCard } from './WalletCard';

export default function WalletTable() {
  // Leverage specialized query hooks with cache-invalidation
  const { wallets, transfer, isLoading, error } = useWalletLedger();

  if (isLoading) return <WalletSkeleton />;
  if (error) return <WalletError error={error} />;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {wallets.map((wallet) => (
        <WalletCard 
          key={wallet.id} 
          wallet={wallet} 
          onTransfer={(toId, amt) => transfer(wallet.id, toId, amt)} 
        />
      ))}
    </div>
  );
}`
  },
  {
    id: 'find-2',
    filePath: '/src/pages/Admin/Settings.tsx',
    issueType: 'Auth Leak',
    severity: 'Critical',
    loc: 'Medium complexity',
    recommendation: 'Implement RBAC',
    description: 'Settings panel displays API credentials and access configurations before evaluating granular role policies, relying solely on standard authenticated checks.',
    category: 'security',
    status: 'Pending',
    codeBad: `// Settings.tsx (BAD: Role check inside render block)
export default function Settings() {
  const { user } = useAuth(); // Only verifies is-logged-in

  return (
    <div>
      <h1>Enterprise Settings</h1>
      {/* SECURITY LEAK: Component is rendered, credentials loaded into memory */}
      <div className="bg-red-50 p-4">
        <h3>Master API Key</h3>
        <input type="password" value="sk_live_9a8f273be829aa" disabled />
        <button onClick={revealKey}>Reveal Private Key</button>
      </div>
    </div>
  );
}`,
    codeGood: `// Settings.tsx (GOOD: Guarded via Higher-Order Role Check)
import { withAccessControl } from '@/src/components/guards/withAccessControl';
import { PermissionScope } from '@/src/types/auth';

function SettingsPanel() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-display">System Settings</h1>
      <MasterKeyManager />
    </div>
  );
}

// Secure with rigid role-based access control at route levels
export default withAccessControl(SettingsPanel, {
  requiredPermission: PermissionScope.ADMIN_WRITE,
  fallback: <ForbiddenFallback />
});`
  },
  {
    id: 'find-3',
    filePath: '/src/api/transactions/index.ts',
    issueType: 'Optimization',
    severity: 'High',
    loc: 'Critical scope',
    recommendation: 'Resolve N+1 Queries',
    description: 'Transaction details endpoint resolves nested counterparties individually per log record instead of utilizing a joined query, causing high database resource consumption during peak volume.',
    category: 'database',
    status: 'Pending',
    codeBad: `// api/transactions.ts (BAD: N+1 DB Queries inside map)
app.get('/api/transactions', async (req, res) => {
  const transactions = await prisma.transaction.findMany();
  
  // CRITICAL N+1 ISSUE: Resolves profile query for EACH record sequentially
  const enriched = await Promise.all(
    transactions.map(async (tx) => {
      const userProfile = await prisma.userProfile.findUnique({
        where: { userId: tx.counterpartyId }
      });
      return { ...tx, counterparty: userProfile.name };
    })
  );
  
  return res.json(enriched);
});`,
    codeGood: `// api/transactions.ts (GOOD: Relational Joining and Indexing)
app.get('/api/transactions', async (req, res) => {
  // Query joined records instantly utilizing pre-compiled indices
  const enriched = await prisma.transaction.findMany({
    include: {
      counterpartyProfile: {
        select: {
          name: true,
          status: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  
  return res.json(enriched);
});`
  },
  {
    id: 'find-4',
    filePath: '/src/lib/prisma/schema.prisma',
    issueType: 'Structure',
    severity: 'Medium',
    loc: 'Standard scope',
    recommendation: 'Verify Indices',
    description: 'Prisma schema lacks composite indexes on common high-throughput filter criteria such as transaction status, type, and source bank combo.',
    category: 'database',
    status: 'Optimized',
    codeBad: `model Transaction {
  id        String   @id @default(uuid())
  amount    Decimal
  currency  String
  status    String
  userId    String
  createdAt DateTime @default(now())
  // No custom index for frequent querying
}`,
    codeGood: `model Transaction {
  id        String   @id @default(uuid())
  amount    Decimal
  currency  String
  status    String
  userId    String
  createdAt DateTime @default(now())

  // HIGH PERFORMANCE: Created composite index for wallet analytics
  @@index([userId, status, createdAt])
  @@index([status, createdAt])
}`
  },
  {
    id: 'find-5',
    filePath: '/src/context/AuthContext.tsx',
    issueType: 'PCI Leak',
    severity: 'Critical',
    loc: 'High severity',
    recommendation: 'Mask Card Data',
    description: 'Legacy payment logger writes complete credit card payload details to client diagnostic consoles and cloud telemetry records before stripping CVV strings.',
    category: 'security',
    status: 'Pending',
    codeBad: `// AuthContext.tsx (BAD: Unsafe payload debugging logs)
function handlePaymentSubmission(cardPayload) {
  // LEAK WARNING: Writes full payload directly to debug logger
  console.log("Processing direct transaction: ", cardPayload);
  
  telemetry.logEvent("pay_submit", {
    cardNumber: cardPayload.number,
    cvv: cardPayload.cvv,
    expiry: cardPayload.expiry
  });
  
  return gateway.submit(cardPayload);
}`,
    codeGood: `// AuthContext.tsx (GOOD: Tokens and Masked logs)
function handlePaymentSubmission(cardPayload) {
  // Mask card data and strip CVV immediately at capture level
  const maskedNumber = cardPayload.number.slice(-4).padStart(16, '*');
  
  telemetry.logEvent("pay_submit", {
    cardNumberMasked: maskedNumber,
    expiry: cardPayload.expiry
    // Never persist or log CVV payload fields
  });
  
  return gateway.submitSecureToken(cardPayload.tokenizedPayload);
}`
  }
];

export const initialRoadmap: RoadmapPhase[] = [
  {
    id: 'phase-1',
    phaseNumber: 1,
    title: 'Enterprise Design System',
    subtitle: 'Core primitives and tokenized scales',
    status: 'active',
    description: 'Establish standard design foundations with a polished Glassmorphic/Frosted Glass theme, typography sets (Space Grotesk & Inter), high-contrast data components, and responsive utility scales.',
    businessValue: 'Eliminate 80% of frontend style duplication, increase UI consistency by 100%, and establish reliable baseline for high-density pages.',
    filesAffected: ['/src/index.css', '/src/App.tsx', '/index.html'],
    componentsAffected: ['Buttons', 'Cards', 'Sidebar', 'Header', 'Layouts'],
    estimatedComplexity: 'Low',
    riskLevel: 'Low'
  },
  {
    id: 'phase-2',
    phaseNumber: 2,
    title: 'App Shell & Command Palette',
    subtitle: 'Context-aware sidebars and workspace triggers',
    status: 'pending',
    description: 'Introduce an immersive, keyboard-friendly command palette (⌘+K) supporting quick navigation, searching audit files, and running global actions, backed by beautiful sidebar menus.',
    businessValue: 'Improves operations team workflow speeds by 40% with fast navigation and instantaneous system searches.',
    filesAffected: ['/src/components/CommandPalette.tsx', '/src/components/Sidebar.tsx'],
    componentsAffected: ['CommandMenu', 'Shell', 'KeyboardShortcuts'],
    estimatedComplexity: 'Medium',
    riskLevel: 'Low'
  },
  {
    id: 'phase-3',
    phaseNumber: 3,
    title: 'Executive Treasury Flow',
    subtitle: 'Real-time multi-currency ledger monitors',
    status: 'pending',
    description: 'Integrate dynamic, gorgeous data charts (Recharts) portraying liquidity trends, ledger aggregates, multi-currency bank details, and an interactive settle-funds simulator.',
    businessValue: 'Enables high-level executive treasury oversight and reduces transaction visibility delays from 24 hours to sub-seconds.',
    filesAffected: ['/src/pages/Treasury.tsx', '/src/components/TreasuryLedger.tsx'],
    componentsAffected: ['CurrencyCards', 'LiquidityChart', 'SettlementSimulator'],
    estimatedComplexity: 'High',
    riskLevel: 'Medium'
  },
  {
    id: 'phase-4',
    phaseNumber: 4,
    title: 'Risk & Compliance Module',
    subtitle: 'Anti-fraud controls and audit logs',
    status: 'pending',
    description: 'Deploy real-time threat analysis grids, automated compliance checklists, PCI-DSS compliance logs, and a code-level PCI threat scanner for client-facing source code.',
    businessValue: 'Keeps platform audit-ready for PCI-DSS compliance, flagging critical card-leak warnings before build processes execute.',
    filesAffected: ['/src/pages/RiskFraud.tsx', '/src/components/RiskRules.tsx'],
    componentsAffected: ['ThreatScanner', 'ComplianceList', 'AlertLog'],
    estimatedComplexity: 'Medium',
    riskLevel: 'Medium'
  },
  {
    id: 'phase-5',
    phaseNumber: 5,
    title: 'Developer Console & Live Scanner',
    subtitle: 'Dry-run refactoring engine',
    status: 'pending',
    description: 'Deploy an interactive IDE interface allowing developers to scan active source-code files, view diff logs, run automated security refactors, and review system configurations.',
    businessValue: 'Fosters dev productivity, automates 60% of recurring code structure issues, and provides interactive, secure diagnostic tooling.',
    filesAffected: ['/src/pages/DeveloperConsole.tsx', '/src/components/CodeDiff.tsx'],
    componentsAffected: ['FileSelector', 'CodeWorkspace', 'LiveRefactorEngine'],
    estimatedComplexity: 'High',
    riskLevel: 'Low'
  }
];

export const treasuryBalances: TreasuryBalance[] = [
  {
    id: 'bal-1',
    currency: 'USD',
    amount: 14205840.12,
    symbol: '$',
    bank: 'Mercury Bank, US',
    trend: [120, 125, 122, 131, 135, 140, 142]
  },
  {
    id: 'bal-2',
    currency: 'EUR',
    amount: 8120490.50,
    symbol: '€',
    bank: 'Clear Junction, UK',
    trend: [76, 78, 80, 79, 81, 80, 81]
  },
  {
    id: 'bal-3',
    currency: 'SGD',
    amount: 3450912.00,
    symbol: 'S$',
    bank: 'DBS Bank, Singapore',
    trend: [31, 32, 31, 33, 34, 34, 34.5]
  },
  {
    id: 'bal-4',
    currency: 'GBP',
    amount: 1980420.25,
    symbol: '£',
    bank: 'Airwallex, London',
    trend: [16, 17, 18, 17.5, 19, 19.5, 19.8]
  }
];

export const transactionLedger: TransactionFlow[] = [
  {
    id: 'tx-1001',
    date: '2026-07-08 13:20',
    counterparty: 'Stripe Settlement',
    currency: 'USD',
    amount: 450000.00,
    type: 'Settlement',
    status: 'Settled'
  },
  {
    id: 'tx-1002',
    date: '2026-07-08 11:45',
    counterparty: 'Adyen Global Payout',
    currency: 'EUR',
    amount: -120000.00,
    type: 'Outflow',
    status: 'Settled'
  },
  {
    id: 'tx-1003',
    date: '2026-07-08 09:12',
    counterparty: 'Asia Ventures Custody',
    currency: 'SGD',
    amount: 250000.00,
    type: 'Inflow',
    status: 'Settled'
  },
  {
    id: 'tx-1004',
    date: '2026-07-08 08:30',
    counterparty: 'Mercury Treasury Sweep',
    currency: 'USD',
    amount: -300000.00,
    type: 'Outflow',
    status: 'Pending'
  },
  {
    id: 'tx-1005',
    date: '2026-07-08 06:15',
    counterparty: 'Compliance Reserve Fund',
    currency: 'GBP',
    amount: 50000.00,
    type: 'Inflow',
    status: 'Settled'
  },
  {
    id: 'tx-1006',
    date: '2026-07-08 05:00',
    counterparty: 'Unusual Settlement Attempt',
    currency: 'USD',
    amount: 980000.00,
    type: 'Settlement',
    status: 'Failed'
  }
];

export const riskRules: RiskRule[] = [
  {
    id: 'rule-1',
    name: 'PCI-DSS Data Leak Monitor',
    category: 'PCI-DSS',
    description: 'Scans source files to prevent clear-text storage or logs containing CVVs, track data, or full PAN structures.',
    status: 'Non-Compliant',
    lastChecked: '2 mins ago'
  },
  {
    id: 'rule-2',
    name: 'Endpoint Privilege Verifier',
    category: 'Access Control',
    description: 'Ensures setting and administration controllers are explicitly wrapped in RBAC permission context checkers.',
    status: 'Warning',
    lastChecked: '5 mins ago'
  },
  {
    id: 'rule-3',
    name: 'Database Query Optimizer',
    category: 'Rate Limiting',
    description: 'Flags unindexed schemas and maps N+1 query patterns that strain transaction storage execution.',
    status: 'Warning',
    lastChecked: '10 mins ago'
  },
  {
    id: 'rule-4',
    name: 'Ledger Aggregation Certifier',
    category: 'Compliance',
    description: 'Validates that client wallet balances trace back to authoritative double-entry transaction ledgers.',
    status: 'Compliant',
    lastChecked: '15 mins ago'
  },
  {
    id: 'rule-5',
    name: 'OAuth Session Guard',
    category: 'Access Control',
    description: 'Monitors session persistence and cookies for proper Secure, SameSite, and HttpOnly flag requirements.',
    status: 'Compliant',
    lastChecked: '1 hour ago'
  }
];

export const devFiles: DevConsoleFile[] = [
  {
    id: 'dev-1',
    name: 'WalletTable.tsx',
    path: '/src/components/WalletTable.tsx',
    language: 'typescript',
    issuesCount: 1,
    content: `import React, { useState, useEffect } from 'react';

// IN-LINE BALANCE COMPUTATION RISK (Logic Bleed)
export default function WalletTable() {
  const [wallets, setWallets] = useState([]);
  
  useEffect(() => {
    fetch('/api/wallets')
      .then(res => res.json())
      .then(data => {
        const aggregated = data.map(w => {
          let balance = w.initialBalance;
          w.transactions.forEach(tx => {
            if (tx.type === 'Inflow') balance += tx.amount;
            else balance -= tx.amount;
          });
          return { ...w, computedBalance: balance };
        });
        setWallets(aggregated);
      });
  }, []);

  const handleDirectTransfer = (fromId, toId, amount) => {
    const next = [...wallets];
    const source = next.find(w => w.id === fromId);
    const dest = next.find(w => w.id === toId);
    source.computedBalance -= amount;
    dest.computedBalance += amount;
    setWallets(next);
    
    fetch('/api/transfer-direct', { 
      method: 'POST', 
      body: JSON.stringify({ fromId, toId, amount }) 
    });
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold">Wallets</h2>
      {/* Table list */}
    </div>
  );
}`
  },
  {
    id: 'dev-2',
    name: 'Settings.tsx',
    path: '/src/pages/Admin/Settings.tsx',
    language: 'typescript',
    issuesCount: 1,
    content: `import React from 'react';
import { useAuth } from '@/src/hooks/useAuth';

// MASTER SECRET API KEY EXPOSURE RISK (Auth Leak)
export default function Settings() {
  const { user } = useAuth(); // Logged-in only, lacks RBAC check

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Panel Settings</h1>
      
      <div className="mt-6 p-4 border border-red-200 bg-red-50 rounded">
        <h3 className="text-red-800 font-bold">Master Wallet Credentials</h3>
        <p className="text-xs text-slate-500">Only Admins should view this</p>
        
        <div className="mt-2">
          <label className="text-xs">Master API Key:</label>
          <input 
            type="password" 
            className="w-full p-2 border bg-white" 
            value="sk_live_9a8f273be829aa" 
            readOnly 
          />
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: 'dev-3',
    name: 'AuthContext.tsx',
    path: '/src/context/AuthContext.tsx',
    language: 'typescript',
    issuesCount: 1,
    content: `import React from 'react';

// SECURITY RISK: LOGGING SENSITIVE PAYMENT DATA (PCI Leak)
export function handlePaymentSubmission(cardPayload) {
  // Unsafe console logs written to standard client debug states
  console.log("Processing direct credit transaction: ", cardPayload);
  
  telemetry.logEvent("pay_submit", {
    cardNumber: cardPayload.number,
    cvv: cardPayload.cvv,
    expiry: cardPayload.expiry
  });
  
  return gateway.submit(cardPayload);
}`
  }
];
