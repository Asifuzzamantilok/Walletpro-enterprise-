import { 
  KYCApplication, 
  ComplianceCase, 
  ComplianceNotification, 
  KYCStats,
  KYCApplicationStatus,
  KYCPriority
} from './ComplianceTypes';
import { 
  initialKYCApplications, 
  initialComplianceCases, 
  initialComplianceNotifications 
} from './ComplianceMockData';
import { apiClient } from '../../api/client';

const STORAGE_KEYS = {
  KYC_APPS: 'walletpro_compliance_kyc_apps',
  CASES: 'walletpro_compliance_cases',
  NOTIFS: 'walletpro_compliance_notifications'
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

// Internal transient/persistent cache
let kycApps = getStored<KYCApplication[]>(STORAGE_KEYS.KYC_APPS, initialKYCApplications);
let complianceCases = getStored<ComplianceCase[]>(STORAGE_KEYS.CASES, initialComplianceCases);
let complianceNotifications = getStored<ComplianceNotification[]>(STORAGE_KEYS.NOTIFS, initialComplianceNotifications);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ComplianceService = {
  // KYC Applications
  getKYCApplications: async (): Promise<KYCApplication[]> => {
    try {
      const res = await apiClient.get<KYCApplication[]>('/kyc/applications');
      if (res.data && Array.isArray(res.data)) {
        kycApps = res.data;
        setStored(STORAGE_KEYS.KYC_APPS, kycApps);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend /kyc/applications unavailable, falling back to local state', e);
      await delay(300);
      return [...kycApps];
    }
  },

  getKYCApplicationById: async (id: string): Promise<KYCApplication | null> => {
    try {
      const res = await apiClient.get<KYCApplication>(`/kyc/applications/${id}`);
      return res.data;
    } catch (e) {
      console.warn('Backend /kyc/applications/:id unavailable, falling back to local state', e);
      await delay(150);
      const app = kycApps.find(a => a.id === id);
      return app ? { ...app } : null;
    }
  },

  updateKYCApplicationStatus: async (
    id: string, 
    status: KYCApplicationStatus, 
    reason: string, 
    reviewer: string
  ): Promise<KYCApplication> => {
    try {
      const res = await apiClient.patch<KYCApplication>(`/kyc/applications/${id}/status`, { status, reason, reviewer });
      return res.data;
    } catch (e) {
      console.warn('Backend KYC status patch unavailable, updating local state', e);
      await delay(400);
      const index = kycApps.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Application not found');

      const app = kycApps[index];
      const previousStatus = app.status;

      // Create audit timeline log
      const timelineEntry = {
        id: `aud-${Math.random().toString(36).substr(2, 9)}`,
        reviewer,
        action: `Status changed to ${status}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        reason,
        previousStatus,
        newStatus: status
      };

      const updatedApp = {
        ...app,
        status,
        auditTimeline: [timelineEntry, ...app.auditTimeline]
      };

      kycApps[index] = updatedApp;
      setStored(STORAGE_KEYS.KYC_APPS, kycApps);

      // If approved or rejected, generate secondary notifications/logs
      const notifId = `NOT-${Math.random().toString(36).substr(2, 9)}`;
      const newNotif: ComplianceNotification = {
        id: notifId,
        type: status === 'Escalated' ? 'escalation' : 'internal',
        title: `KYC Status Update: ${updatedApp.customerName}`,
        message: `KYC status transitioned from "${previousStatus}" to "${status}". Reason: ${reason}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        read: false,
        applicationId: id
      };
      complianceNotifications = [newNotif, ...complianceNotifications];
      setStored(STORAGE_KEYS.NOTIFS, complianceNotifications);

      return updatedApp;
    }
  },

  addReviewerNote: async (id: string, noteText: string, author: string): Promise<KYCApplication> => {
    try {
      const res = await apiClient.post<KYCApplication>(`/kyc/applications/${id}/notes`, { note: noteText, author });
      return res.data;
    } catch (e) {
      console.warn('Backend KYC notes unavailable, updating local state', e);
      await delay(250);
      const index = kycApps.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Application not found');

      const app = kycApps[index];
      const newNote = {
        id: `note-${Math.random().toString(36).substr(2, 9)}`,
        author,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        note: noteText
      };

      const updatedApp = {
        ...app,
        reviewerNotes: [...app.reviewerNotes, newNote]
      };

      kycApps[index] = updatedApp;
      setStored(STORAGE_KEYS.KYC_APPS, kycApps);
      return updatedApp;
    }
  },

  assignReviewer: async (id: string, reviewer: string): Promise<KYCApplication> => {
    try {
      const res = await apiClient.post<KYCApplication>(`/kyc/applications/${id}/assign`, { reviewer });
      return res.data;
    } catch (e) {
      console.warn('Backend KYC reviewer assignment unavailable, updating local state', e);
      await delay(200);
      const index = kycApps.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Application not found');

      const app = kycApps[index];
      const updatedApp = {
        ...app,
        assignedReviewer: reviewer,
        auditTimeline: [
          {
            id: `aud-${Math.random().toString(36).substr(2, 9)}`,
            reviewer: 'System',
            action: 'Assign Reviewer',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            reason: `Assigned reviewer modified to ${reviewer}.`,
            previousStatus: app.status,
            newStatus: app.status
          },
          ...app.auditTimeline
        ]
      };

      kycApps[index] = updatedApp;
      setStored(STORAGE_KEYS.KYC_APPS, kycApps);
      return updatedApp;
    }
  },

  changePriority: async (id: string, priority: KYCPriority): Promise<KYCApplication> => {
    try {
      const res = await apiClient.patch<KYCApplication>(`/kyc/applications/${id}/priority`, { priority });
      return res.data;
    } catch (e) {
      console.warn('Backend KYC priority change unavailable, updating local state', e);
      await delay(200);
      const index = kycApps.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Application not found');

      const app = kycApps[index];
      const updatedApp = {
        ...app,
        priority,
        auditTimeline: [
          {
            id: `aud-${Math.random().toString(36).substr(2, 9)}`,
            reviewer: 'System',
            action: 'Change Priority',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            reason: `Priority escalated/changed to ${priority}.`,
            previousStatus: app.status,
            newStatus: app.status
          },
          ...app.auditTimeline
        ]
      };

      kycApps[index] = updatedApp;
      setStored(STORAGE_KEYS.KYC_APPS, kycApps);
      return updatedApp;
    }
  },

  // Compliance Cases
  getComplianceCases: async (): Promise<ComplianceCase[]> => {
    try {
      const res = await apiClient.get<ComplianceCase[]>('/compliance/cases');
      if (res.data && Array.isArray(res.data)) {
        complianceCases = res.data;
        setStored(STORAGE_KEYS.CASES, complianceCases);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend compliance cases unavailable, falling back to local state', e);
      await delay(300);
      return [...complianceCases];
    }
  },

  createComplianceCase: async (caseData: Omit<ComplianceCase, 'id' | 'createdDate' | 'updatedDate' | 'timeline' | 'evidence' | 'internalNotes'> & { applicationId?: string }): Promise<ComplianceCase> => {
    try {
      const res = await apiClient.post<ComplianceCase>('/compliance/cases', caseData);
      return res.data;
    } catch (e) {
      console.warn('Backend compliance cases creation unavailable, updating local state', e);
      await delay(400);
      const newCaseId = `CASE-2026-00${Math.floor(10 + Math.random() * 89)}`;
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const newCase: ComplianceCase = {
        id: newCaseId,
        applicationId: caseData.applicationId,
        customerName: caseData.customerName,
        customerId: caseData.customerId,
        investigator: caseData.investigator || 'Unassigned',
        status: 'Open',
        priority: caseData.priority || 'Medium',
        subject: caseData.subject || 'Standard Compliance Risk Review',
        createdDate: nowStr,
        updatedDate: nowStr,
        evidence: [],
        internalNotes: [],
        timeline: [
          {
            id: `evt-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: nowStr,
            event: 'Case Initialized',
            performedBy: 'Compliance Officer',
            details: `Manual investigation folder established for ${caseData.customerName}.`
          }
        ]
      };

      complianceCases = [newCase, ...complianceCases];
      setStored(STORAGE_KEYS.CASES, complianceCases);

      // Create a notification about new case
      const newNotif: ComplianceNotification = {
        id: `NOT-${Math.random().toString(36).substr(2, 9)}`,
        type: 'internal',
        title: `Case Initiated: ${newCaseId}`,
        message: `A new investigation has been opened for customer ${caseData.customerName}.`,
        timestamp: nowStr,
        read: false,
        caseId: newCaseId
      };
      complianceNotifications = [newNotif, ...complianceNotifications];
      setStored(STORAGE_KEYS.NOTIFS, complianceNotifications);

      return newCase;
    }
  },

  updateComplianceCaseStatus: async (
    caseId: string, 
    status: 'Open' | 'Under Investigation' | 'Escalated' | 'Resolved' | 'Closed',
    resolution?: string,
    resolutionReason?: string,
    author: string = 'Investigator'
  ): Promise<ComplianceCase> => {
    try {
      const res = await apiClient.patch<ComplianceCase>(`/compliance/cases/${caseId}/status`, { status, resolution, resolutionReason, author });
      return res.data;
    } catch (e) {
      console.warn('Backend compliance case status patch unavailable, updating local state', e);
      await delay(350);
      const index = complianceCases.findIndex(c => c.id === caseId);
      if (index === -1) throw new Error('Compliance case not found');

      const c = complianceCases[index];
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const updatedCase = {
        ...c,
        status,
        resolution: resolution || c.resolution,
        resolutionReason: resolutionReason || c.resolutionReason,
        updatedDate: nowStr,
        timeline: [
          {
            id: `evt-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: nowStr,
            event: `Status changed to ${status}`,
            performedBy: author,
            details: resolution ? `Case resolved: ${resolution}. Reason: ${resolutionReason}` : `Status transitioned to ${status}`
          },
          ...c.timeline
        ]
      };

      complianceCases[index] = updatedCase;
      setStored(STORAGE_KEYS.CASES, complianceCases);
      return updatedCase;
    }
  },

  addCaseNote: async (caseId: string, noteText: string, author: string): Promise<ComplianceCase> => {
    try {
      const res = await apiClient.post<ComplianceCase>(`/compliance/cases/${caseId}/notes`, { note: noteText, author });
      return res.data;
    } catch (e) {
      console.warn('Backend compliance case notes unavailable, updating local state', e);
      await delay(200);
      const index = complianceCases.findIndex(c => c.id === caseId);
      if (index === -1) throw new Error('Compliance case not found');

      const c = complianceCases[index];
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const newNote = {
        id: `cn-${Math.random().toString(36).substr(2, 9)}`,
        author,
        timestamp: nowStr,
        note: noteText
      };

      const updatedCase = {
        ...c,
        internalNotes: [...c.internalNotes, newNote],
        updatedDate: nowStr,
        timeline: [
          {
            id: `evt-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: nowStr,
            event: 'Note Added',
            performedBy: author,
            details: 'Internal investigation notes updated.'
          },
          ...c.timeline
        ]
      };

      complianceCases[index] = updatedCase;
      setStored(STORAGE_KEYS.CASES, complianceCases);
      return updatedCase;
    }
  },

  uploadEvidence: async (
    caseId: string, 
    type: string, 
    fileName: string, 
    size: string, 
    uploader: string
  ): Promise<ComplianceCase> => {
    try {
      const res = await apiClient.post<ComplianceCase>(`/compliance/cases/${caseId}/evidence`, { type, fileName, size, uploader });
      return res.data;
    } catch (e) {
      console.warn('Backend compliance evidence upload unavailable, updating local state', e);
      await delay(300);
      const index = complianceCases.findIndex(c => c.id === caseId);
      if (index === -1) throw new Error('Compliance case not found');

      const c = complianceCases[index];
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const newEvidence = {
        id: `ev-${Math.random().toString(36).substr(2, 9)}`,
        type,
        fileName,
        uploadedBy: uploader,
        timestamp: nowStr,
        size
      };

      const updatedCase = {
        ...c,
        evidence: [...c.evidence, newEvidence],
        updatedDate: nowStr,
        timeline: [
          {
            id: `evt-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: nowStr,
            event: 'Evidence Uploaded',
            performedBy: uploader,
            details: `Added new evidence file: ${fileName} (${type})`
          },
          ...c.timeline
        ]
      };

      complianceCases[index] = updatedCase;
      setStored(STORAGE_KEYS.CASES, complianceCases);
      return updatedCase;
    }
  },

  // Notifications
  getComplianceNotifications: async (): Promise<ComplianceNotification[]> => {
    try {
      const res = await apiClient.get<ComplianceNotification[]>('/notifications/compliance');
      if (res.data && Array.isArray(res.data)) {
        complianceNotifications = res.data;
        setStored(STORAGE_KEYS.NOTIFS, complianceNotifications);
        return res.data;
      }
      throw new Error('Invalid response structure');
    } catch (e) {
      console.warn('Backend compliance notifications unavailable, falling back to local state', e);
      await delay(100);
      return [...complianceNotifications];
    }
  },

  markNotificationAsRead: async (id: string): Promise<ComplianceNotification[]> => {
    try {
      await apiClient.post(`/notifications/compliance/${id}/read`);
    } catch (e) {
      console.warn('Backend compliance notification read mark unavailable, updating local state', e);
    }
    complianceNotifications = complianceNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    setStored(STORAGE_KEYS.NOTIFS, complianceNotifications);
    return [...complianceNotifications];
  },

  // Stats computation
  getKYCStats: async (): Promise<KYCStats> => {
    try {
      const res = await apiClient.get<KYCStats>('/kyc/stats');
      return res.data;
    } catch (e) {
      console.warn('Backend KYC stats unavailable, compiling local stats', e);
      await delay(200);
      
      const pendingReviews = kycApps.filter(a => a.status === 'Pending Review').length;
      const approvedToday = kycApps.filter(a => a.status === 'Approved' && a.submissionDate.includes('2026-07-09')).length + 3; // base mock + dynamic
      const rejectedToday = kycApps.filter(a => a.status === 'Rejected' && a.submissionDate.includes('2026-07-09')).length + 1; // base mock
      const documentsSubmittedToday = kycApps.filter(a => a.submissionDate.includes('2026-07-09')).length * 2; // say 2 docs per app average
      
      // Calculate risk metrics
      const highRiskCustomersCount = kycApps.filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical').length;
      const amlAlertsCount = kycApps.filter(a => a.amlResults.status === 'Match Found').length;
      const sanctionMatchesCount = kycApps.filter(a => a.sanctionsResults.status === 'Match Found').length;
      const pepMatchesCount = kycApps.filter(a => a.pepResults.status === 'Match Found').length;
      const manualReviewsCount = kycApps.filter(a => a.status === 'Escalated' || a.status === 'Suspended' || a.status === 'More Info Requested').length;

      return {
        pendingReviews,
        documentsSubmittedToday: documentsSubmittedToday || 4,
        approvedToday: approvedToday || 2,
        rejectedToday: rejectedToday || 1,
        averageReviewTimeMinutes: 18.4, // SLA indicator
        highRiskCustomersCount,
        amlAlertsCount,
        sanctionMatchesCount,
        pepMatchesCount,
        manualReviewsCount
      };
    }
  }
};
