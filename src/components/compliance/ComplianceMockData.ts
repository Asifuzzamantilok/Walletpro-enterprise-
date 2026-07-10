import { KYCApplication, ComplianceCase, ComplianceNotification } from './ComplianceTypes';

export const initialKYCApplications: KYCApplication[] = [
  {
    id: 'KYC-2026-0412',
    customerName: 'Marcus Aurelius Vance',
    customerEmail: 'm.vance@vancetech.co',
    customerPhone: '+1 (555) 014-9812',
    customerId: 'CUST-8021',
    country: 'United States',
    accountTier: 'Tier 3 (VIP)',
    submissionDate: '2026-07-09 01:22:15',
    status: 'Pending Review',
    riskScore: 28,
    riskLevel: 'Low',
    verificationLevel: 'Level 3 (Enhanced)',
    assignedReviewer: 'Sarah Jenkins',
    slaTimeLeftSeconds: 14200, // ~4 hours
    priority: 'High',
    passportNumber: 'N4819208A',
    address: {
      street: '1200 San Pablo Ave, Apt 4C',
      city: 'Berkeley',
      state: 'CA',
      postalCode: '94706',
      country: 'United States'
    },
    documents: [
      {
        type: 'Passport',
        status: 'Pending',
        imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=60', // Placeholder but realistic portrait/document styling
        issueDate: '2022-04-10',
        expiryDate: '2032-04-09',
        documentNumber: 'N4819208A',
        imageQualityScore: 96,
        unreadableText: false,
        glareDetected: false,
        cornersCutOff: false
      },
      {
        type: 'Utility Bill',
        status: 'Pending',
        imageUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600&auto=format&fit=crop&q=60',
        issueDate: '2026-06-15',
        documentNumber: 'UTIL-2026-981',
        imageQualityScore: 88,
        unreadableText: false,
        glareDetected: true,
        cornersCutOff: false
      }
    ],
    selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    livenessResult: 'Passed',
    livenessConfidence: 99.4,
    amlResults: {
      status: 'Clean',
      matchesCount: 0,
      adverseMediaCount: 0
    },
    sanctionsResults: {
      status: 'Clean',
      matchesCount: 0
    },
    pepResults: {
      status: 'Clean',
      matchesCount: 0
    },
    reviewerNotes: [
      {
        id: 'note-1',
        author: 'Sarah Jenkins',
        timestamp: '2026-07-09 01:45:00',
        note: 'Primary liveness passed with exceptional score. Facial mapping is a 98% match with Passport page photo. Utility bill address matches the submitted home address exactly.'
      }
    ],
    auditTimeline: [
      {
        id: 'aud-1',
        reviewer: 'System Core',
        action: 'Application Submitted',
        timestamp: '2026-07-09 01:22:15',
        reason: 'User submitted full Level 3 onboarding package through custom portal.',
        previousStatus: 'None',
        newStatus: 'Pending Review'
      },
      {
        id: 'aud-2',
        reviewer: 'Sarah Jenkins',
        action: 'Assign Reviewer',
        timestamp: '2026-07-09 01:40:22',
        reason: 'Manually claimed from high-tier priority queue.',
        previousStatus: 'Pending Review',
        newStatus: 'Pending Review'
      }
    ]
  },
  {
    id: 'KYC-2026-0399',
    customerName: 'Dimitri Karpov',
    customerEmail: 'dkarpov@karpovholding.ru',
    customerPhone: '+7 (903) 481-2290',
    customerId: 'CUST-3912',
    country: 'Russian Federation',
    accountTier: 'Tier 3 (VIP)',
    submissionDate: '2026-07-08 14:15:33',
    status: 'Escalated',
    riskScore: 82,
    riskLevel: 'Critical',
    verificationLevel: 'Level 3 (Enhanced)',
    assignedReviewer: 'David Miller',
    slaTimeLeftSeconds: -2200, // SLA Breached
    priority: 'Critical',
    passportNumber: 'RU7791823',
    address: {
      street: 'Tverskaya St, Building 14, Apt 82',
      city: 'Moscow',
      state: 'Moscow Region',
      postalCode: '125009',
      country: 'Russian Federation'
    },
    documents: [
      {
        type: 'Passport',
        status: 'Verified',
        imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=60',
        issueDate: '2019-11-12',
        expiryDate: '2029-11-11',
        documentNumber: 'RU7791823',
        imageQualityScore: 92,
        unreadableText: false,
        glareDetected: false,
        cornersCutOff: false
      },
      {
        type: 'Bank Statement',
        status: 'Rejected',
        imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=60',
        issueDate: '2026-05-30',
        documentNumber: 'BS-RU-992',
        imageQualityScore: 54,
        unreadableText: true,
        glareDetected: true,
        cornersCutOff: true
      }
    ],
    selfieUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    livenessResult: 'Inconclusive',
    livenessConfidence: 61.2,
    amlResults: {
      status: 'Match Found',
      matchesCount: 2,
      watchlistName: 'OFAC SDN List / EU Consolidated Sanctions',
      matchScore: 94,
      adverseMediaCount: 4,
      falsePositiveStatus: 'Pending'
    },
    sanctionsResults: {
      status: 'Match Found',
      matchesCount: 1,
      matchScore: 97,
      watchlistName: 'OFAC Russian Oligarch Entities',
      falsePositiveStatus: 'Pending'
    },
    pepResults: {
      status: 'Clean',
      matchesCount: 0
    },
    reviewerNotes: [
      {
        id: 'note-2',
        author: 'David Miller',
        timestamp: '2026-07-08 16:30:11',
        note: 'Escalated to L3 compliance officers. Russian PEP screening flags are clear, matching OFAC list entry for Karpov Holdings (specifically associated with targeted sanctions). Bank statement image is severely blurred with corners cut off. Requesting manual source of wealth documentation.'
      }
    ],
    auditTimeline: [
      {
        id: 'aud-3',
        reviewer: 'System Core',
        action: 'Application Submitted',
        timestamp: '2026-07-08 14:15:33',
        reason: 'Onboarding submission from Russian-routed IP address.',
        previousStatus: 'None',
        newStatus: 'Pending Review'
      },
      {
        id: 'aud-4',
        reviewer: 'David Miller',
        action: 'Escalate Review',
        timestamp: '2026-07-08 16:35:00',
        reason: 'Watchlist matching score above risk tolerance threshold (95% match rating). Needs senior investigator review.',
        previousStatus: 'Pending Review',
        newStatus: 'Escalated'
      }
    ]
  },
  {
    id: 'KYC-2026-0391',
    customerName: 'Yuki Tanaka',
    customerEmail: 'yuki.tanaka@tokyotech.jp',
    customerPhone: '+81 (90) 1234-5678',
    customerId: 'CUST-2189',
    country: 'Japan',
    accountTier: 'Tier 2',
    submissionDate: '2026-07-08 11:42:00',
    status: 'Approved',
    riskScore: 12,
    riskLevel: 'Low',
    verificationLevel: 'Level 2 (Full ID)',
    assignedReviewer: 'Sarah Jenkins',
    slaTimeLeftSeconds: 0,
    priority: 'Medium',
    passportNumber: 'TR8819022',
    address: {
      street: '2-1-1 Nihonbashi, Chuo-ku',
      city: 'Tokyo',
      state: 'Tokyo Prefecture',
      postalCode: '103-0027',
      country: 'Japan'
    },
    documents: [
      {
        type: 'Government ID',
        status: 'Verified',
        imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=60',
        issueDate: '2023-01-15',
        expiryDate: '2033-01-14',
        documentNumber: 'JP-ID-881290',
        imageQualityScore: 98,
        unreadableText: false,
        glareDetected: false,
        cornersCutOff: false
      }
    ],
    selfieUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    livenessResult: 'Passed',
    livenessConfidence: 99.8,
    amlResults: {
      status: 'Clean',
      matchesCount: 0,
      adverseMediaCount: 0
    },
    sanctionsResults: {
      status: 'Clean',
      matchesCount: 0
    },
    pepResults: {
      status: 'Clean',
      matchesCount: 0
    },
    reviewerNotes: [
      {
        id: 'note-3',
        author: 'Sarah Jenkins',
        timestamp: '2026-07-08 13:02:15',
        note: 'Approved. Perfect Japanese Government Card scanned. Biometrics matched instantly with 100% confidence. Clear screening lists.'
      }
    ],
    auditTimeline: [
      {
        id: 'aud-5',
        reviewer: 'System Core',
        action: 'Application Submitted',
        timestamp: '2026-07-08 11:42:00',
        reason: 'User submitted documents.',
        previousStatus: 'None',
        newStatus: 'Pending Review'
      },
      {
        id: 'aud-6',
        reviewer: 'Sarah Jenkins',
        action: 'Approve Application',
        timestamp: '2026-07-08 13:02:15',
        reason: 'All checks passed with no risk indicators.',
        previousStatus: 'Pending Review',
        newStatus: 'Approved'
      }
    ]
  },
  {
    id: 'KYC-2026-0382',
    customerName: 'Alejandro Gomez',
    customerEmail: 'alejandro.g@gomezcorp.co',
    customerPhone: '+57 (311) 982-1209',
    customerId: 'CUST-1044',
    country: 'Colombia',
    accountTier: 'Tier 1',
    submissionDate: '2026-07-07 10:30:19',
    status: 'More Info Requested',
    riskScore: 45,
    riskLevel: 'Medium',
    verificationLevel: 'Level 2 (Full ID)',
    assignedReviewer: 'Alex Wong',
    slaTimeLeftSeconds: 0,
    priority: 'Medium',
    nationalId: 'CC-109283120',
    address: {
      street: 'Calle 72 # 5-12, Piso 9',
      city: 'Bogota',
      state: 'Cundinamarca',
      postalCode: '110221',
      country: 'Colombia'
    },
    documents: [
      {
        type: 'Government ID',
        status: 'Rejected',
        imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=60',
        issueDate: '2020-05-15',
        documentNumber: 'CC-109283120',
        imageQualityScore: 42,
        unreadableText: true,
        glareDetected: true,
        cornersCutOff: true
      }
    ],
    selfieUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    livenessResult: 'Passed',
    livenessConfidence: 95.1,
    amlResults: {
      status: 'Clean',
      matchesCount: 0,
      adverseMediaCount: 0
    },
    sanctionsResults: {
      status: 'Clean',
      matchesCount: 0
    },
    pepResults: {
      status: 'Clean',
      matchesCount: 0
    },
    reviewerNotes: [
      {
        id: 'note-4',
        author: 'Alex Wong',
        timestamp: '2026-07-07 14:22:10',
        note: 'Requested re-submission. The photo of the Colombian "Cedula de Ciudadania" is heavily obscured by overhead desk lamp glare. The national ID number and hologram are completely illegible.'
      }
    ],
    auditTimeline: [
      {
        id: 'aud-7',
        reviewer: 'System Core',
        action: 'Application Submitted',
        timestamp: '2026-07-07 10:30:19',
        reason: 'Basic package submitted.',
        previousStatus: 'None',
        newStatus: 'Pending Review'
      },
      {
        id: 'aud-8',
        reviewer: 'Alex Wong',
        action: 'Request More Information',
        timestamp: '2026-07-07 14:22:10',
        reason: 'Government ID photo quality is below acceptable readability standards.',
        previousStatus: 'Pending Review',
        newStatus: 'More Info Requested'
      }
    ]
  },
  {
    id: 'KYC-2026-0371',
    customerName: 'Fatima Al-Sayed',
    customerEmail: 'fatima.as@gulfcapital.ae',
    customerPhone: '+971 (50) 881-2201',
    customerId: 'CUST-5512',
    country: 'United Arab Emirates',
    accountTier: 'Tier 3 (VIP)',
    submissionDate: '2026-07-06 09:12:11',
    status: 'Approved',
    riskScore: 19,
    riskLevel: 'Low',
    verificationLevel: 'Level 3 (Enhanced)',
    assignedReviewer: 'David Miller',
    slaTimeLeftSeconds: 0,
    priority: 'Low',
    passportNumber: 'UAE8910221',
    address: {
      street: 'Al Meydan Rd, Nad Al Sheba, Villa 41',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '00000',
      country: 'United Arab Emirates'
    },
    documents: [
      {
        type: 'Passport',
        status: 'Verified',
        imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=60',
        issueDate: '2021-08-11',
        expiryDate: '2031-08-10',
        documentNumber: 'UAE8910221',
        imageQualityScore: 97,
        unreadableText: false,
        glareDetected: false,
        cornersCutOff: false
      },
      {
        type: 'Bank Statement',
        status: 'Verified',
        imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=60',
        issueDate: '2026-06-01',
        documentNumber: 'BS-HSBC-2291',
        imageQualityScore: 93,
        unreadableText: false,
        glareDetected: false,
        cornersCutOff: false
      }
    ],
    selfieUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    livenessResult: 'Passed',
    livenessConfidence: 99.9,
    amlResults: {
      status: 'Clean',
      matchesCount: 0,
      adverseMediaCount: 0
    },
    sanctionsResults: {
      status: 'Clean',
      matchesCount: 0
    },
    pepResults: {
      status: 'Clean',
      matchesCount: 0
    },
    reviewerNotes: [
      {
        id: 'note-5',
        author: 'David Miller',
        timestamp: '2026-07-06 11:35:44',
        note: 'Approved. Sovereign bank statements provided showing high liquidity. High-quality facial biometrics validation. Clear Sanctions screening.'
      }
    ],
    auditTimeline: [
      {
        id: 'aud-9',
        reviewer: 'System Core',
        action: 'Application Submitted',
        timestamp: '2026-07-06 09:12:11',
        reason: 'Submitted.',
        previousStatus: 'None',
        newStatus: 'Pending Review'
      },
      {
        id: 'aud-10',
        reviewer: 'David Miller',
        action: 'Approve Application',
        timestamp: '2026-07-06 11:35:44',
        reason: 'Passed L3 scrutiny with high liquidity and full verification.',
        previousStatus: 'Pending Review',
        newStatus: 'Approved'
      }
    ]
  },
  {
    id: 'KYC-2026-0355',
    customerName: 'Elijah Mbata',
    customerEmail: 'e.mbata@nigeriaconstruct.ng',
    customerPhone: '+234 (803) 119-9210',
    customerId: 'CUST-0812',
    country: 'Nigeria',
    accountTier: 'Tier 2',
    submissionDate: '2026-07-05 13:14:02',
    status: 'Rejected',
    riskScore: 94,
    riskLevel: 'Critical',
    verificationLevel: 'Level 2 (Full ID)',
    assignedReviewer: 'David Miller',
    slaTimeLeftSeconds: 0,
    priority: 'High',
    passportNumber: 'NG8812903',
    address: {
      street: '22 Broad Street, Marina',
      city: 'Lagos',
      state: 'Lagos State',
      postalCode: '100221',
      country: 'Nigeria'
    },
    documents: [
      {
        type: 'Passport',
        status: 'Rejected',
        imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=60',
        issueDate: '2018-02-12',
        expiryDate: '2028-02-11',
        documentNumber: 'NG8812903',
        imageQualityScore: 89,
        unreadableText: false,
        glareDetected: false,
        cornersCutOff: false
      }
    ],
    selfieUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    livenessResult: 'Failed',
    livenessConfidence: 12.5,
    amlResults: {
      status: 'Match Found',
      matchesCount: 1,
      watchlistName: 'Nigeria EFCC High-Value Suspect List',
      matchScore: 88,
      adverseMediaCount: 8,
      falsePositiveStatus: 'Confirmed Match'
    },
    sanctionsResults: {
      status: 'Clean',
      matchesCount: 0
    },
    pepResults: {
      status: 'Clean',
      matchesCount: 0
    },
    reviewerNotes: [
      {
        id: 'note-6',
        author: 'David Miller',
        timestamp: '2026-07-05 15:40:00',
        note: 'APPLICATION REJECTED & BLACKLISTED. Onboarding failed liveness scan. Frame injections detected during standard video check. Additionally, screening flagged a confirmed high-risk match in Nigeria EFCC watchlists for financial embezzlement. Marked risk level as critical and blacklisted client profile.'
      }
    ],
    auditTimeline: [
      {
        id: 'aud-11',
        reviewer: 'System Core',
        action: 'Application Submitted',
        timestamp: '2026-07-05 13:14:02',
        reason: 'Basic submission package.',
        previousStatus: 'None',
        newStatus: 'Pending Review'
      },
      {
        id: 'aud-12',
        reviewer: 'David Miller',
        action: 'Reject Application',
        timestamp: '2026-07-05 15:40:00',
        reason: 'Severe compliance hazard: Biometrics liveness spoof failure + confirmed watchlist record match.',
        previousStatus: 'Pending Review',
        newStatus: 'Rejected'
      }
    ]
  },
  {
    id: 'KYC-2026-0425',
    customerName: 'Robert Fitzroy',
    customerEmail: 'fitzroy@royalnet.uk',
    customerPhone: '+44 (7911) 220011',
    customerId: 'CUST-4411',
    country: 'United Kingdom',
    accountTier: 'Tier 3 (VIP)',
    submissionDate: '2026-07-09 02:05:00',
    status: 'Pending Review',
    riskScore: 55,
    riskLevel: 'Medium',
    verificationLevel: 'Level 3 (Enhanced)',
    assignedReviewer: 'Unassigned',
    slaTimeLeftSeconds: 17800, // ~5 hours
    priority: 'Medium',
    passportNumber: 'UK9912093B',
    address: {
      street: '14 Admiralty Arch Mews, Mall',
      city: 'London',
      state: 'Greater London',
      postalCode: 'SW1A 2WH',
      country: 'United Kingdom'
    },
    documents: [
      {
        type: 'Passport',
        status: 'Pending',
        imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=60',
        issueDate: '2024-03-22',
        expiryDate: '2034-03-21',
        documentNumber: 'UK9912093B',
        imageQualityScore: 99,
        unreadableText: false,
        glareDetected: false,
        cornersCutOff: false
      },
      {
        type: 'Bank Statement',
        status: 'Pending',
        imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=60',
        issueDate: '2026-06-30',
        documentNumber: 'BARC-UK-9023',
        imageQualityScore: 91,
        unreadableText: false,
        glareDetected: false,
        cornersCutOff: false
      }
    ],
    selfieUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    livenessResult: 'Passed',
    livenessConfidence: 98.7,
    amlResults: {
      status: 'Clean',
      matchesCount: 0,
      adverseMediaCount: 0
    },
    sanctionsResults: {
      status: 'Clean',
      matchesCount: 0
    },
    pepResults: {
      status: 'Match Found',
      matchesCount: 1,
      matchScore: 92,
      pepCategory: 'Tier I PEP - Member of Parliament / Royal Commission',
      falsePositiveStatus: 'Pending'
    },
    reviewerNotes: [],
    auditTimeline: [
      {
        id: 'aud-13',
        reviewer: 'System Core',
        action: 'Application Submitted',
        timestamp: '2026-07-09 02:05:00',
        reason: 'VIP User package submitted online.',
        previousStatus: 'None',
        newStatus: 'Pending Review'
      }
    ]
  },
  {
    id: 'KYC-2026-0428',
    customerName: 'Zehra Demir',
    customerEmail: 'z.demir@ankaraholding.tr',
    customerPhone: '+90 (532) 991-8822',
    customerId: 'CUST-3049',
    country: 'Turkey',
    accountTier: 'Tier 2',
    submissionDate: '2026-07-09 02:11:45',
    status: 'Pending Review',
    riskScore: 61,
    riskLevel: 'High',
    verificationLevel: 'Level 2 (Full ID)',
    assignedReviewer: 'Unassigned',
    slaTimeLeftSeconds: 15400, // ~4 hours
    priority: 'High',
    passportNumber: 'TR10928394',
    address: {
      street: 'Ataturk Bulvari No 192, Kat 4',
      city: 'Ankara',
      state: 'Ankara',
      postalCode: '06680',
      country: 'Turkey'
    },
    documents: [
      {
        type: 'Government ID',
        status: 'Pending',
        imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=60',
        issueDate: '2021-02-14',
        expiryDate: '2031-02-13',
        documentNumber: 'TR-ID-10928394',
        imageQualityScore: 94,
        unreadableText: false,
        glareDetected: false,
        cornersCutOff: false
      }
    ],
    selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    livenessResult: 'Passed',
    livenessConfidence: 99.1,
    amlResults: {
      status: 'Clean',
      matchesCount: 0,
      adverseMediaCount: 0
    },
    sanctionsResults: {
      status: 'Match Found',
      matchesCount: 1,
      matchScore: 89,
      watchlistName: 'OFAC Secondary Sanctions Target List',
      falsePositiveStatus: 'Pending'
    },
    pepResults: {
      status: 'Clean',
      matchesCount: 0
    },
    reviewerNotes: [],
    auditTimeline: [
      {
        id: 'aud-14',
        reviewer: 'System Core',
        action: 'Application Submitted',
        timestamp: '2026-07-09 02:11:45',
        reason: 'Basic submission from Turkish IP address.',
        previousStatus: 'None',
        newStatus: 'Pending Review'
      }
    ]
  }
];

export const initialComplianceCases: ComplianceCase[] = [
  {
    id: 'CASE-2026-0012',
    applicationId: 'KYC-2026-0399',
    customerName: 'Dimitri Karpov',
    customerId: 'CUST-3912',
    investigator: 'David Miller',
    status: 'Under Investigation',
    priority: 'Critical',
    createdDate: '2026-07-08 16:35:00',
    updatedDate: '2026-07-09 01:10:00',
    subject: 'Target Sanctions Match (OFAC Oligarch Associates)',
    evidence: [
      {
        id: 'ev-1',
        type: 'Sanctions Check Report',
        fileName: 'OFAC_SDN_KarpovHolding_Match.pdf',
        uploadedBy: 'System Watchlist Service',
        timestamp: '2026-07-08 14:16:00',
        size: '1.2 MB'
      },
      {
        id: 'ev-2',
        type: 'Corporate Registry',
        fileName: 'Moscow_Registrar_KarpovHolding.pdf',
        uploadedBy: 'David Miller',
        timestamp: '2026-07-08 16:28:00',
        size: '4.5 MB'
      }
    ],
    internalNotes: [
      {
        id: 'cn-note-1',
        author: 'David Miller',
        timestamp: '2026-07-08 16:38:00',
        note: 'Opened case immediately upon receiving high match score. Corporate registrar verifies Dimitri Karpov owns 65% of Karpov Holdings. Sanctions clearly cover entities owned > 50% by SDNs. Escating to high priority.'
      },
      {
        id: 'cn-note-2',
        author: 'Sarah Jenkins',
        timestamp: '2026-07-09 01:10:00',
        note: 'Cross-checked passport signatures. Verified matching biometric fingerprints in Interpol warnings. Prepare for complete account freezing and sovereign reporting.'
      }
    ],
    timeline: [
      {
        id: 'evt-1',
        timestamp: '2026-07-08 16:35:00',
        event: 'Case Created',
        performedBy: 'David Miller',
        details: 'Case automatically initialized based on KYC screening escalation.'
      },
      {
        id: 'evt-2',
        timestamp: '2026-07-08 16:38:00',
        event: 'Evidence Added',
        performedBy: 'David Miller',
        details: 'Uploaded corporate search documents showing ownership structure.'
      },
      {
        id: 'evt-3',
        timestamp: '2026-07-09 01:10:00',
        event: 'Note Added',
        performedBy: 'Sarah Jenkins',
        details: 'Interpol biometric signature checked.'
      }
    ]
  },
  {
    id: 'CASE-2026-0009',
    applicationId: 'KYC-2026-0355',
    customerName: 'Elijah Mbata',
    customerId: 'CUST-0812',
    investigator: 'Sarah Jenkins',
    status: 'Closed',
    priority: 'High',
    createdDate: '2026-07-05 15:42:00',
    updatedDate: '2026-07-06 10:15:00',
    subject: 'Nigeria EFCC Watchlist Record Lock',
    evidence: [
      {
        id: 'ev-3',
        type: 'EFCC Criminal Bulletin',
        fileName: 'EFCC_Arrest_Warrant_Mbata_2024.pdf',
        uploadedBy: 'Sarah Jenkins',
        timestamp: '2026-07-05 15:55:00',
        size: '890 KB'
      }
    ],
    internalNotes: [
      {
        id: 'cn-note-3',
        author: 'Sarah Jenkins',
        timestamp: '2026-07-05 16:00:00',
        note: 'Confirmed match. User matches EFCC bulletin photograph and date of birth exactly. Profile permanently blacklisted.'
      }
    ],
    timeline: [
      {
        id: 'evt-4',
        timestamp: '2026-07-05 15:42:00',
        event: 'Case Initiated',
        performedBy: 'Sarah Jenkins',
        details: 'Case created upon hard rejection.'
      },
      {
        id: 'evt-5',
        timestamp: '2026-07-06 10:15:00',
        event: 'Case Closed',
        performedBy: 'Sarah Jenkins',
        details: 'Marked as Resolved - Permanent Blacklist applied.'
      }
    ],
    resolution: 'Permanent Account Freeze & Blacklist',
    resolutionReason: 'User is on the active EFCC financial embezzlement fugitive list. Photograph and biometrics matched perfectly.'
  }
];

export const initialComplianceNotifications: ComplianceNotification[] = [
  {
    id: 'NOT-001',
    type: 'internal',
    title: 'New VIP Submission',
    message: 'Marcus Aurelius Vance submitted Level 3 VIP onboarding application.',
    timestamp: '2026-07-09 01:22:15',
    read: false,
    applicationId: 'KYC-2026-0412'
  },
  {
    id: 'NOT-002',
    type: 'escalation',
    title: 'Sanctions Escalate',
    message: 'KYC Application KYC-2026-0399 (Dimitri Karpov) automatically escalated to L3 compliance due to 97% OFAC match score.',
    timestamp: '2026-07-08 16:35:00',
    read: false,
    applicationId: 'KYC-2026-0399'
  },
  {
    id: 'NOT-003',
    type: 'sla_breach',
    title: 'SLA Breach Warning',
    message: 'Escalated case CASE-2026-0012 has breached its 4-hour senior response SLA timer.',
    timestamp: '2026-07-09 01:30:00',
    read: false,
    caseId: 'CASE-2026-0012'
  }
];
