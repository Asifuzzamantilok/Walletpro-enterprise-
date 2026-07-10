export type KYCApplicationStatus = 
  | 'Pending Review' 
  | 'Approved' 
  | 'Rejected' 
  | 'More Info Requested' 
  | 'Escalated' 
  | 'Suspended';

export type KYCPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type KYCVerificationLevel = 'Level 1 (Basic)' | 'Level 2 (Full ID)' | 'Level 3 (Enhanced)';
export type AccountTier = 'Tier 1' | 'Tier 2' | 'Tier 3 (VIP)';

export interface KYCDocument {
  type: 'Passport' | 'Government ID' | 'Driving License' | 'Utility Bill' | 'Bank Statement';
  status: 'Verified' | 'Pending' | 'Rejected';
  imageUrl: string;
  issueDate?: string;
  expiryDate?: string;
  documentNumber?: string;
  imageQualityScore: number; // 0 to 100
  unreadableText: boolean;
  glareDetected: boolean;
  cornersCutOff: boolean;
}

export interface ReviewerNote {
  id: string;
  author: string;
  timestamp: string;
  note: string;
}

export interface KYCApplication {
  id: string; // e.g. KYC-2026-9812
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId: string; // e.g. CUST-5512
  country: string;
  accountTier: AccountTier;
  submissionDate: string;
  status: KYCApplicationStatus;
  riskScore: number; // 0 - 100
  riskLevel: KYCPriority;
  verificationLevel: KYCVerificationLevel;
  assignedReviewer: string;
  slaTimeLeftSeconds: number; // count down
  priority: KYCPriority;
  passportNumber?: string;
  nationalId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  documents: KYCDocument[];
  selfieUrl: string;
  livenessResult: 'Passed' | 'Failed' | 'Inconclusive';
  livenessConfidence: number; // percentage
  amlResults: {
    status: 'Clean' | 'Match Found' | 'Under Review';
    matchesCount: number;
    watchlistName?: string;
    matchScore?: number;
    adverseMediaCount: number;
    falsePositiveStatus?: 'Pending' | 'Dismissed - False Positive' | 'Confirmed Match';
  };
  sanctionsResults: {
    status: 'Clean' | 'Match Found' | 'Under Review';
    matchesCount: number;
    matchScore?: number;
    watchlistName?: string;
    falsePositiveStatus?: 'Pending' | 'Dismissed - False Positive' | 'Confirmed Match';
  };
  pepResults: {
    status: 'Clean' | 'Match Found' | 'Under Review';
    matchesCount: number;
    matchScore?: number;
    pepCategory?: string;
    falsePositiveStatus?: 'Pending' | 'Dismissed - False Positive' | 'Confirmed Match';
  };
  reviewerNotes: ReviewerNote[];
  auditTimeline: AuditTimelineEntry[];
}

export interface AuditTimelineEntry {
  id: string;
  reviewer: string;
  action: string;
  timestamp: string;
  reason: string;
  previousStatus: string;
  newStatus: string;
}

export interface ComplianceCase {
  id: string; // CASE-2026-0034
  applicationId?: string;
  customerName: string;
  customerId: string;
  investigator: string;
  status: 'Open' | 'Under Investigation' | 'Escalated' | 'Resolved' | 'Closed';
  priority: KYCPriority;
  createdDate: string;
  updatedDate: string;
  subject: string;
  evidence: {
    id: string;
    type: string; // e.g. "Passport Copy", "IP Logs", "Suspicious Tx"
    fileName: string;
    uploadedBy: string;
    timestamp: string;
    size: string;
  }[];
  internalNotes: ReviewerNote[];
  timeline: {
    id: string;
    timestamp: string;
    event: string;
    performedBy: string;
    details: string;
  }[];
  resolution?: string;
  resolutionReason?: string;
}

export interface ComplianceNotification {
  id: string;
  type: 'customer' | 'internal' | 'escalation' | 'expired' | 'sla_breach';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  applicationId?: string;
  caseId?: string;
}

export interface KYCStats {
  pendingReviews: number;
  documentsSubmittedToday: number;
  approvedToday: number;
  rejectedToday: number;
  averageReviewTimeMinutes: number;
  highRiskCustomersCount: number;
  amlAlertsCount: number;
  sanctionMatchesCount: number;
  pepMatchesCount: number;
  manualReviewsCount: number;
}
