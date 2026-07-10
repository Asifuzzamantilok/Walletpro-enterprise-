export type IssueType = 'Logic Bleed' | 'Auth Leak' | 'Optimization' | 'Structure' | 'PCI Leak' | 'Dependency';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type FindingStatus = 'Pending' | 'Optimizing' | 'Optimized';

export interface AuditFinding {
  id: string;
  filePath: string;
  issueType: IssueType;
  severity: Severity;
  loc: string;
  recommendation: string;
  codeBad: string;
  codeGood: string;
  description: string;
  status: FindingStatus;
  category: 'code' | 'security' | 'database' | 'architecture';
}

export interface RoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  subtitle: string;
  status: 'active' | 'pending' | 'completed';
  description: string;
  businessValue: string;
  filesAffected: string[];
  componentsAffected: string[];
  estimatedComplexity: 'High' | 'Medium' | 'Low';
  riskLevel: 'High' | 'Medium' | 'Low';
}

export interface TreasuryBalance {
  id: string;
  currency: string;
  amount: number;
  symbol: string;
  bank: string;
  trend: number[];
}

export interface TransactionFlow {
  id: string;
  date: string;
  counterparty: string;
  currency: string;
  amount: number;
  type: 'Inflow' | 'Outflow' | 'Settlement';
  status: 'Settled' | 'Pending' | 'Failed';
}

export interface RiskRule {
  id: string;
  name: string;
  category: 'Compliance' | 'PCI-DSS' | 'Access Control' | 'Rate Limiting';
  description: string;
  status: 'Compliant' | 'Non-Compliant' | 'Warning';
  lastChecked: string;
}

export interface DevConsoleFile {
  id: string;
  name: string;
  path: string;
  language: string;
  issuesCount: number;
  content: string;
}
