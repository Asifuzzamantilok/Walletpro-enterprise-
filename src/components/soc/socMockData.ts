export interface LiveSecurityEvent {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  eventType: string;
  user: string;
  role: string;
  country: string;
  ipAddress: string;
  device: string;
  status: 'BLOCKED' | 'ALLOWED' | 'FLAGGED' | 'CHALLENGED';
  correlationId: string;
  details: string;
}

export interface SecurityAlert {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Brute Force' | 'Impossible Travel' | 'Credential Stuffing' | 'Data Exfiltration' | 'Privilege Escalation' | 'API Threat' | 'Policy Violation';
  affectedUser: string;
  affectedResource: string;
  riskScore: number;
  status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'CLOSED_RESOLVED' | 'CLOSED_FALSE_POSITIVE';
  assignedAnalyst: string;
  createdTime: string;
  description: string;
}

export interface ThreatIntelIP {
  ipAddress: string;
  threatScore: number;
  category: 'Spam/Botnet' | 'Malicious Host' | 'Tor Exit Node' | 'VPN Endpoint' | 'Phishing Host';
  lastActive: string;
  country: string;
  status: 'BLOCKED' | 'MONITORED' | 'ACTIVE_ATTACK';
  asn: string;
  isp: string;
}

export interface ThreatIntelDevice {
  deviceId: string;
  deviceFingerprint: string;
  threatScore: number;
  os: string;
  browser: string;
  lastUser: string;
  status: 'BLOCKED' | 'MONITORED' | 'FLAGGED';
}

export interface ActiveSession {
  id: string;
  user: string;
  role: string;
  ipAddress: string;
  country: string;
  device: string;
  browser: string;
  os: string;
  createdTime: string;
  lastActiveTime: string;
  riskScore: number;
  status: 'ACTIVE' | 'SUSPICIOUS' | 'REVOKED';
  timeline: { time: string; action: string; location: string }[];
}

export interface DeviceRecord {
  id: string;
  fingerprint: string;
  user: string;
  os: string;
  browser: string;
  status: 'TRUSTED' | 'UNKNOWN' | 'BLOCKED';
  riskScore: number;
  lastActive: string;
}

export interface IpRecord {
  ip: string;
  status: 'KNOWN' | 'BLOCKED' | 'ALLOWLISTED';
  asn: string;
  isp: string;
  country: string;
  vpn: boolean;
  tor: boolean;
  city: string;
}

export interface ApiThreatEvent {
  id: string;
  timestamp: string;
  apiKeyId: string;
  endpoint: string;
  ipAddress: string;
  errorType: 'Rate Limit Exceeded' | 'Unauthorized Scope' | 'Invalid Key Signature' | 'Mass Allocation Attempt';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'BLOCKED' | 'RATE_LIMITED' | 'LOGGED';
}

export interface IncidentRecord {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'OPEN' | 'CONTAINED' | 'RESOLVED' | 'POST_MORTEM_COMPLETED';
  assignedOwner: string;
  affectedSystems: string[];
  evidence: string[];
  createdTime: string;
  resolvedTime?: string;
  timeline: { timestamp: string; note: string; author: string }[];
  postmortem?: string;
}

export interface VulnerabilityAlert {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Configuration' | 'Certificate' | 'Dependency' | 'Policy Missing';
  description: string;
  recommendation: string;
  remediationSLA: string;
  status: 'OPEN' | 'PATCHED' | 'EXEMPT';
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'Session' | 'Password' | 'MFA' | 'IP' | 'Device' | 'Geo';
  value: string;
  status: 'ENABLED' | 'DISABLED';
}

// SEED DATA BELOW
export const SEED_LIVE_EVENTS: LiveSecurityEvent[] = [
  {
    id: "evt-001",
    timestamp: "2026-07-10T06:30:11-07:00",
    severity: "LOW",
    eventType: "API.Key.Created",
    user: "alex.mercer@walletpro.com",
    role: "Developer",
    country: "USA",
    ipAddress: "192.168.1.104",
    device: "MacBook Pro (macOS/Safari)",
    status: "ALLOWED",
    correlationId: "corr-f10a-39c2",
    details: "Created read-only sandbox API Key for development testing."
  },
  {
    id: "evt-002",
    timestamp: "2026-07-10T06:31:02-07:00",
    severity: "MEDIUM",
    eventType: "Auth.MFA.Failed",
    user: "sarah.connor@walletpro.com",
    role: "Compliance Officer",
    country: "Canada",
    ipAddress: "198.51.100.22",
    device: "Lenovo ThinkPad (Windows/Chrome)",
    status: "CHALLENGED",
    correlationId: "corr-29db-ae81",
    details: "SMS MFA verification code failed (1st attempt)."
  },
  {
    id: "evt-003",
    timestamp: "2026-07-10T06:32:15-07:00",
    severity: "CRITICAL",
    eventType: "Auth.ImpossibleTravel",
    user: "john.doe@walletpro.com",
    role: "Support Agent",
    country: "Ukraine",
    ipAddress: "93.184.216.34",
    device: "Unknown PC (Linux/Firefox)",
    status: "FLAGGED",
    correlationId: "corr-72e1-ee23",
    details: "Account login detected in Kiev, Ukraine, 15 minutes after active session in New York, USA."
  },
  {
    id: "evt-004",
    timestamp: "2026-07-10T06:33:45-07:00",
    severity: "HIGH",
    eventType: "DB.Query.BulkExport",
    user: "tony.stark@walletpro.com",
    role: "Platform Administrator",
    country: "USA",
    ipAddress: "203.0.113.88",
    device: "iPad Pro (iOS/Safari)",
    status: "ALLOWED",
    correlationId: "corr-bb01-44ac",
    details: "Exported 5,000 KYC records from active datastore. Policy limit triggered."
  },
  {
    id: "evt-005",
    timestamp: "2026-07-10T06:34:20-07:00",
    severity: "HIGH",
    eventType: "API.RateLimit.Breached",
    user: "unauthenticated_partner",
    role: "None",
    country: "China",
    ipAddress: "218.10.22.45",
    device: "PostmanRuntime/7.28.4",
    status: "BLOCKED",
    correlationId: "corr-ff9a-aa11",
    details: "Over 500 requests per minute to /api/v1/settlements endpoint. Automated throttling applied."
  }
];

export const SEED_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: "alt-101",
    severity: "CRITICAL",
    category: "Impossible Travel",
    affectedUser: "john.doe@walletpro.com",
    affectedResource: "User Session (New York -> Kiev)",
    riskScore: 94,
    status: "OPEN",
    assignedAnalyst: "Unassigned",
    createdTime: "2026-07-10T06:32:15-07:00",
    description: "Concurrent session activity across physically distant locales detected within unsafe timeframe. Account has active administrative permissions."
  },
  {
    id: "alt-102",
    severity: "HIGH",
    category: "Brute Force",
    affectedUser: "bruce.wayne@walletpro.com",
    affectedResource: "Auth Gateway /login",
    riskScore: 82,
    status: "INVESTIGATING",
    assignedAnalyst: "Jessica Jones (SecAnalyst)",
    createdTime: "2026-07-10T05:44:00-07:00",
    description: "14 consecutive failed password attempts on bruce.wayne@walletpro.com from multiple IP addresses in the same subnet within 90 seconds."
  },
  {
    id: "alt-103",
    severity: "MEDIUM",
    category: "Policy Violation",
    affectedUser: "clark.kent@walletpro.com",
    affectedResource: "Vault Production Secrets",
    riskScore: 55,
    status: "OPEN",
    assignedAnalyst: "Unassigned",
    createdTime: "2026-07-10T04:12:30-07:00",
    description: "Accessing sensitive platform secrets from an unmanaged, non-VPN IP address (Mobile network)."
  },
  {
    id: "alt-104",
    severity: "HIGH",
    category: "Data Exfiltration",
    affectedUser: "tony.stark@walletpro.com",
    affectedResource: "PostgreSQL Database Cluster",
    riskScore: 78,
    status: "ESCALATED",
    assignedAnalyst: "Steve Rogers (Lead Analyst)",
    createdTime: "2026-07-10T06:33:45-07:00",
    description: "Large volume CSV backup dump of KYC user registers downloaded via operations console. Transfer exceeds standard historical baseline by 300%."
  },
  {
    id: "alt-105",
    severity: "LOW",
    category: "API Threat",
    affectedUser: "api_service_acct_84",
    affectedResource: "API Gateway (/api/v1/cards)",
    riskScore: 28,
    status: "CLOSED_RESOLVED",
    assignedAnalyst: "Diana Prince (SecAnalyst)",
    createdTime: "2026-07-09T22:15:00-07:00",
    description: "Deprecated API endpoint request with high error rate. Handled automatically via deprecation wrapper."
  }
];

export const SEED_THREAT_IPS: ThreatIntelIP[] = [
  {
    ipAddress: "185.220.101.4",
    threatScore: 88,
    category: "Tor Exit Node",
    lastActive: "2026-07-10T06:22:11-07:00",
    country: "Germany",
    status: "MONITORED",
    asn: "AS12345",
    isp: "Tor Project Hosting"
  },
  {
    ipAddress: "45.132.22.110",
    threatScore: 95,
    category: "Malicious Host",
    lastActive: "2026-07-10T06:34:20-07:00",
    country: "China",
    status: "BLOCKED",
    asn: "AS4134",
    isp: "China Telecom"
  },
  {
    ipAddress: "198.51.100.155",
    threatScore: 72,
    category: "VPN Endpoint",
    lastActive: "2026-07-10T05:10:00-07:00",
    country: "USA",
    status: "MONITORED",
    asn: "AS2500",
    isp: "NordVPN S.A."
  },
  {
    ipAddress: "93.184.216.34",
    threatScore: 91,
    category: "Phishing Host",
    lastActive: "2026-07-10T06:32:15-07:00",
    country: "Ukraine",
    status: "ACTIVE_ATTACK",
    asn: "AS15169",
    isp: "Kiev Web Systems"
  }
];

export const SEED_THREAT_DEVICES: ThreatIntelDevice[] = [
  {
    deviceId: "dev-f2910-bc22",
    deviceFingerprint: "fp_chrome_win10_canvas_x1920_77d2a",
    threatScore: 84,
    os: "Windows 10",
    browser: "Chrome 114.0",
    lastUser: "bruce.wayne@walletpro.com",
    status: "MONITORED"
  },
  {
    deviceId: "dev-xx991-ff11",
    deviceFingerprint: "fp_linux_firefox_headless_puppeteer_21a",
    threatScore: 99,
    os: "Linux x86_64",
    browser: "Firefox (Headless)",
    lastUser: "john.doe@walletpro.com",
    status: "BLOCKED"
  }
];

export const SEED_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: "sess-88a2-11bc",
    user: "tony.stark@walletpro.com",
    role: "Platform Administrator",
    ipAddress: "203.0.113.88",
    country: "USA",
    device: "iPad Pro",
    browser: "Safari 16.2",
    os: "iOS 16",
    createdTime: "2026-07-10T04:15:00-07:00",
    lastActiveTime: "2026-07-10T06:35:10-07:00",
    riskScore: 24,
    status: "ACTIVE",
    timeline: [
      { time: "04:15", action: "Multi-factor authentication approved", location: "New York, USA" },
      { time: "05:00", action: "Viewed Database clusters metrics", location: "New York, USA" },
      { time: "06:33", action: "Bulk KYC database report exported", location: "New York, USA" }
    ]
  },
  {
    id: "sess-77b1-aa23",
    user: "john.doe@walletpro.com",
    role: "Support Agent",
    ipAddress: "93.184.216.34",
    country: "Ukraine",
    device: "Unknown PC",
    browser: "Firefox 112.0",
    os: "Linux Ubuntu",
    createdTime: "2026-07-10T06:32:15-07:00",
    lastActiveTime: "2026-07-10T06:34:00-07:00",
    riskScore: 95,
    status: "SUSPICIOUS",
    timeline: [
      { time: "06:32", action: "Bypassed geo-fencing verification using manual proxy", location: "Kiev, Ukraine" },
      { time: "06:33", action: "Modified 2 user wallets status", location: "Kiev, Ukraine" }
    ]
  },
  {
    id: "sess-11aa-99ff",
    user: "sarah.connor@walletpro.com",
    role: "Compliance Officer",
    ipAddress: "198.51.100.22",
    country: "Canada",
    device: "Lenovo ThinkPad",
    browser: "Chrome 115.0",
    os: "Windows 11",
    createdTime: "2026-07-10T05:30:00-07:00",
    lastActiveTime: "2026-07-10T06:31:02-07:00",
    riskScore: 12,
    status: "ACTIVE",
    timeline: [
      { time: "05:30", action: "Logged in via corporate Single Sign On", location: "Toronto, Canada" },
      { time: "05:45", action: "Audited KYC pending registrations", location: "Toronto, Canada" }
    ]
  }
];

export const SEED_DEVICES: DeviceRecord[] = [
  {
    id: "dev-01",
    fingerprint: "fp_chrome_mac_safari_00192a",
    user: "alex.mercer@walletpro.com",
    os: "macOS Ventura",
    browser: "Safari 16.0",
    status: "TRUSTED",
    riskScore: 5,
    lastActive: "2026-07-10T06:30:11-07:00"
  },
  {
    id: "dev-02",
    fingerprint: "fp_headless_bot_agent_81f21a",
    user: "john.doe@walletpro.com",
    os: "Linux",
    browser: "Puppeteer (Headless)",
    status: "BLOCKED",
    riskScore: 99,
    lastActive: "2026-07-10T06:32:15-07:00"
  },
  {
    id: "dev-03",
    fingerprint: "fp_windows_edge_corporate_bb71aa",
    user: "sarah.connor@walletpro.com",
    os: "Windows 11",
    browser: "Microsoft Edge 113.0",
    status: "TRUSTED",
    riskScore: 8,
    lastActive: "2026-07-10T05:30:00-07:00"
  }
];

export const SEED_IPS: IpRecord[] = [
  {
    ip: "192.168.1.104",
    status: "ALLOWLISTED",
    asn: "AS123",
    isp: "Corporate IntraNet Local",
    country: "USA",
    vpn: false,
    tor: false,
    city: "New York"
  },
  {
    ip: "45.132.22.110",
    status: "BLOCKED",
    asn: "AS4134",
    isp: "China Telecom",
    country: "China",
    vpn: true,
    tor: false,
    city: "Beijing"
  },
  {
    ip: "185.220.101.4",
    status: "KNOWN",
    asn: "AS12345",
    isp: "Tor Exit Node S.A.",
    country: "Germany",
    vpn: false,
    tor: true,
    city: "Frankfurt"
  }
];

export const SEED_API_THREAT_EVENTS: ApiThreatEvent[] = [
  {
    id: "api-evt-1",
    timestamp: "2026-07-10T06:34:20-07:00",
    apiKeyId: "key_partner_prod_84a",
    endpoint: "/api/v1/settlements",
    ipAddress: "218.10.22.45",
    errorType: "Rate Limit Exceeded",
    severity: "HIGH",
    status: "RATE_LIMITED"
  },
  {
    id: "api-evt-2",
    timestamp: "2026-07-10T05:12:10-07:00",
    apiKeyId: "key_dev_sandbox_771x",
    endpoint: "/api/v1/admin/shutdown",
    ipAddress: "192.168.10.45",
    errorType: "Unauthorized Scope",
    severity: "CRITICAL",
    status: "BLOCKED"
  }
];

export const SEED_INCIDENTS: IncidentRecord[] = [
  {
    id: "inc-201",
    title: "Impossible Travel Credential Compromise",
    severity: "CRITICAL",
    priority: "P0",
    status: "OPEN",
    assignedOwner: "Steve Rogers (Lead Security)",
    affectedSystems: ["User Session", "Support Console DB"],
    evidence: ["IP: 93.184.216.34", "Session Hash: sess-77b1-aa23", "Location: Kiev, UA"],
    createdTime: "2026-07-10T06:32:15-07:00",
    timeline: [
      { timestamp: "06:32", note: "Incident created automatically by SIEM rules engine.", author: "Sec-Engine" },
      { timestamp: "06:35", note: "Steve Rogers assigned as Incident Commander. Quarantined active session.", author: "Steve Rogers" }
    ]
  },
  {
    id: "inc-202",
    title: "SQL Infiltration Brute Attempt",
    severity: "HIGH",
    priority: "P1",
    status: "CONTAINED",
    assignedOwner: "Jessica Jones (SecAnalyst)",
    affectedSystems: ["Auth Gateway", "Edge WAF"],
    evidence: ["IP Subnet: 45.132.22.x", "Failed count: 120/min"],
    createdTime: "2026-07-10T03:10:00-07:00",
    resolvedTime: "2026-07-10T03:45:00-07:00",
    timeline: [
      { timestamp: "03:10", note: "Incident created manually based on alt-102 threshold trigger.", author: "Jessica Jones" },
      { timestamp: "03:22", note: "IP address prefix range 45.132.22.0/24 blacklisted on Cloudflare WAF.", author: "Jessica Jones" },
      { timestamp: "03:45", note: "Threat vectors dropped. Systems marked contained and stable.", author: "Jessica Jones" }
    ],
    postmortem: "Attacker attempted to probe public database authorization interfaces using automated password stuffing. The active WAF policies correctly caught and triggered alert limits."
  }
];

export const SEED_VULNERABILITIES: VulnerabilityAlert[] = [
  {
    id: "vul-1",
    title: "SSL/TLS Certificate Expiration Pending",
    severity: "MEDIUM",
    category: "Certificate",
    description: "The primary reverse proxy wildcard SSL certificate for admin.walletpro.com is scheduled to expire in 14 days.",
    recommendation: "Trigger automatic ACME Let's Encrypt lease renewal workflow in primary Terraform configuration.",
    remediationSLA: "SLA: 5 Days remaining",
    status: "OPEN"
  },
  {
    id: "vul-2",
    title: "Dependency CVE-2023-45139 in Axios Client",
    severity: "HIGH",
    category: "Dependency",
    description: "Axios packages prior to v1.6.0 suffer from dangerous client-side header leak vulnerabilities in cross-origin redirects.",
    recommendation: "Upgrade dev package AXIOS to v1.6.0+ via workspace package registry locks.",
    remediationSLA: "SLA: 2 Days remaining",
    status: "OPEN"
  },
  {
    id: "vul-3",
    title: "Missing Session Timeout Policy Enforcement",
    severity: "HIGH",
    category: "Policy Missing",
    description: "Active Directory security policies do not enforce a maximum session duration for Read-Only analyst consoles, allowing indefinite tokens.",
    recommendation: "Introduce maximum 4-hour absolute token expiration within IdentityAccessCenter session settings.",
    remediationSLA: "SLA: Immediate",
    status: "OPEN"
  }
];

export const SEED_POLICIES: SecurityPolicy[] = [
  {
    id: "pol-1",
    name: "Console Absolute Session Timeout",
    description: "Enforce maximum consecutive token duration for active admin and operator dashboards before requiring re-auth.",
    category: "Session",
    value: "4 Hours (240 minutes)",
    status: "ENABLED"
  },
  {
    id: "pol-2",
    name: "Enterprise Multi-Factor Authentication (MFA)",
    description: "Mandate physical hardware security key (FIDO2/YubiKey) or authenticated TOTP application for all personnel.",
    category: "MFA",
    value: "Hardware Key + TOTP Required",
    status: "ENABLED"
  },
  {
    id: "pol-3",
    name: "Inbound Corporate VPN Geofencing",
    description: "Block all incoming administrative platform requests routed outside corporate certified VPN subnet nodes.",
    category: "IP",
    value: "Subnets: 192.168.1.0/24, 10.0.0.0/8 Only",
    status: "DISABLED"
  },
  {
    id: "pol-4",
    name: "Mandatory Device Fingerprint Integrity",
    description: "Block sessions originating from browsers that exhibit unknown canvas telemetry or headless puppeteer properties.",
    category: "Device",
    value: "Anti-automation signature matching enabled",
    status: "ENABLED"
  }
];
