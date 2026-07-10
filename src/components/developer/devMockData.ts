export interface DevApiKey {
  id: string;
  name: string;
  keyMasked: string;
  scopes: string[];
  status: 'ACTIVE' | 'DISABLED' | 'EXPIRED';
  created: string;
  expires: string;
  lastUsed: string;
  callsToday: number;
}

export interface DevOAuthClient {
  id: string;
  name: string;
  clientId: string;
  clientSecretMasked: string;
  redirectUris: string[];
  scopes: string[];
  status: 'ACTIVE' | 'SUSPENDED';
  created: string;
  lastUsed: string;
}

export interface DevWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  signingSecret: string;
  status: 'ACTIVE' | 'DISABLED';
  retryPolicy: {
    maxAttempts: number;
    backoffRate: string;
  };
  created: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  url: string;
  status: 'SUCCESS' | 'FAILED';
  statusCode: number;
  latencyMs: number;
  timestamp: string;
  payload: string;
  response: string;
  attempts: number;
}

export interface ApiEndpoint {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  version: 'v1' | 'v2' | 'v3-beta';
  authentication: 'API Key' | 'OAuth Bearer' | 'Public';
  status: 'STABLE' | 'BETA' | 'DEPRECATED';
  owner: string;
  documentation: string;
  deprecationDate?: string;
  avgLatencyMs: number;
  successRate: number;
  requestsToday: number;
}

export interface DevSecret {
  id: string;
  key: string;
  valueMasked: string;
  environment: 'production' | 'staging' | 'sandbox';
  updatedBy: string;
  lastUpdated: string;
  version: number;
}

export interface EnvVariable {
  id: string;
  key: string;
  valueMasked: string;
  environment: 'production' | 'staging' | 'sandbox';
  lastUpdated: string;
}

export interface QueueJob {
  id: string;
  queueName: string;
  taskName: string;
  payloadSummary: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  processingTimeMs?: number;
  timestamp: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  schedule: string;
  status: 'SCHEDULED' | 'RUNNING' | 'IDLE' | 'FAILED';
  lastRun: string;
  durationMs: number;
  failureReason?: string;
  retriesLeft: number;
}

export interface BackgroundWorker {
  id: string;
  name: string;
  status: 'ONLINE' | 'IDLE' | 'OFFLINE';
  threadPoolSize: number;
  activeThreads: number;
  memoryUsageMb: number;
  cpuUsagePct: number;
  jobsProcessed: number;
}

export interface MarketplaceIntegration {
  id: string;
  name: string;
  category: 'Payment Gateways' | 'SMS Providers' | 'Email Providers' | 'KYC Providers' | 'Card Processors' | 'Banking Partners' | 'Cloud Storage' | 'Analytics' | 'Identity Providers';
  status: 'ACTIVE' | 'CONNECTED' | 'PENDING' | 'DISABLED';
  provider: string;
  lastSync: string;
  logoColor: string;
}

export interface EventBusMessage {
  id: string;
  eventName: string;
  publisher: string;
  payload: string;
  status: 'ACKNOWLEDGED' | 'RETRYING' | 'DLQ';
  subscribers: number;
  timestamp: string;
}

export interface DevLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  type: 'API' | 'WEBHOOK' | 'WORKER' | 'APP';
  correlationId: string;
  message: string;
  latencyMs?: number;
  statusCode?: number;
}

export interface ServiceRegistryNode {
  id: string;
  name: string;
  version: string;
  owner: string;
  status: 'UP' | 'DOWN';
  healthScore: number;
  latencyMs: number;
  replicas: number;
}

export interface RateLimitRule {
  id: string;
  target: string;
  limit: string;
  violationsToday: number;
  blockedClientsCount: number;
}

export interface RateLimitViolation {
  id: string;
  clientIp: string;
  endpoint: string;
  timestamp: string;
  blockedDurationSec: number;
}

export interface DeploymentHistoryEntry {
  id: string;
  version: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';
  deployedBy: string;
  commitHash: string;
  notes: string;
}

// SEED DATASETS
export const SEED_DEV_API_KEYS: DevApiKey[] = [
  {
    id: 'key-1',
    name: 'Production Core API Key',
    keyMasked: 'wp_live_9f82••••••••••••••••3a81',
    scopes: ['wallets:read', 'wallets:write', 'transactions:read', 'transactions:write'],
    status: 'ACTIVE',
    created: '2026-01-15T08:00:00Z',
    expires: '2027-01-15T08:00:00Z',
    lastUsed: '2026-07-10T06:45:00Z',
    callsToday: 142095
  },
  {
    id: 'key-2',
    name: 'Partner Integration Key - Barclays',
    keyMasked: 'wp_live_1b83••••••••••••••••7c22',
    scopes: ['transactions:read', 'kyc:verify'],
    status: 'ACTIVE',
    created: '2026-03-22T10:30:00Z',
    expires: '2027-03-22T10:30:00Z',
    lastUsed: '2026-07-10T07:01:12Z',
    callsToday: 82150
  },
  {
    id: 'key-3',
    name: 'Temporary Compliance Script Key',
    keyMasked: 'wp_live_5d29••••••••••••••••9f88',
    scopes: ['wallets:read', 'kyc:verify'],
    status: 'DISABLED',
    created: '2026-05-10T14:15:00Z',
    expires: '2026-06-10T14:15:00Z',
    lastUsed: '2026-06-09T23:59:12Z',
    callsToday: 0
  }
];

export const SEED_DEV_OAUTH_CLIENTS: DevOAuthClient[] = [
  {
    id: 'oauth-1',
    name: 'WalletPro Mobile App Suite',
    clientId: 'cid_mobile_app_771822',
    clientSecretMasked: 'sh_sec_••••••••••••••••109a',
    redirectUris: ['walletpro://oauth/callback', 'https://walletpro.io/mobile/callback'],
    scopes: ['openid', 'profile', 'wallets:read', 'transactions:read', 'cards:manage'],
    status: 'ACTIVE',
    created: '2025-10-01T09:00:00Z',
    lastUsed: '2026-07-10T07:05:00Z'
  },
  {
    id: 'oauth-2',
    name: 'Enterprise Treasury Sync Portal',
    clientId: 'cid_treasury_portal_3391',
    clientSecretMasked: 'sh_sec_••••••••••••••••f82d',
    redirectUris: ['https://treasury.partner-net.com/callback'],
    scopes: ['wallets:read', 'wallets:write', 'transactions:read', 'transactions:write'],
    status: 'ACTIVE',
    created: '2026-02-14T11:20:00Z',
    lastUsed: '2026-07-10T06:12:00Z'
  }
];

export const SEED_DEV_WEBHOOKS: DevWebhook[] = [
  {
    id: 'wh-1',
    name: 'Stripe Ledger Sync Webhook',
    url: 'https://api.merchant-corp.com/v1/walletpro-events',
    events: ['wallet.balance_updated', 'transaction.completed', 'card.frozen'],
    signingSecret: 'whsec_99a8b71d22c33e44f55a66b77',
    status: 'ACTIVE',
    retryPolicy: { maxAttempts: 5, backoffRate: 'Exponential (2x)' },
    created: '2026-01-20T10:00:00Z'
  },
  {
    id: 'wh-2',
    name: 'Accounting ERP Feed Webhook',
    url: 'https://erp-gateway.internal.net/hooks/walletpro',
    events: ['transaction.completed', 'deposit.matched'],
    signingSecret: 'whsec_11e22f33b44c55a66d77e88ff',
    status: 'ACTIVE',
    retryPolicy: { maxAttempts: 3, backoffRate: 'Linear (30s)' },
    created: '2026-04-05T15:30:00Z'
  }
];

export const SEED_WEBHOOK_DELIVERIES: WebhookDelivery[] = [
  {
    id: 'del-1',
    webhookId: 'wh-1',
    event: 'transaction.completed',
    url: 'https://api.merchant-corp.com/v1/walletpro-events',
    status: 'SUCCESS',
    statusCode: 200,
    latencyMs: 142,
    timestamp: '2026-07-10T06:59:12Z',
    payload: JSON.stringify({ event: 'transaction.completed', transaction_id: 'tx_992109', amount: 1500, currency: 'USD' }, null, 2),
    response: JSON.stringify({ received: true, code: 'OK_200' }, null, 2),
    attempts: 1
  },
  {
    id: 'del-2',
    webhookId: 'wh-1',
    event: 'wallet.balance_updated',
    url: 'https://api.merchant-corp.com/v1/walletpro-events',
    status: 'FAILED',
    statusCode: 504,
    latencyMs: 3000,
    timestamp: '2026-07-10T06:30:00Z',
    payload: JSON.stringify({ event: 'wallet.balance_updated', wallet_id: 'W-CONSUMER-1', balance: 4120.50 }, null, 2),
    response: 'Gateway Timeout Error (Merchant backend did not respond in 3000ms)',
    attempts: 3
  }
];

export const SEED_API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'ep-1',
    endpoint: '/api/v2/wallets',
    method: 'GET',
    version: 'v2',
    authentication: 'OAuth Bearer',
    status: 'STABLE',
    owner: 'Wallet Operations Team',
    documentation: 'Retrieves a list of wallets or queries single wallet status details.',
    avgLatencyMs: 34,
    successRate: 99.98,
    requestsToday: 821405
  },
  {
    id: 'ep-2',
    endpoint: '/api/v2/transactions/transfer',
    method: 'POST',
    version: 'v2',
    authentication: 'API Key',
    status: 'STABLE',
    owner: 'Ledger Engine Team',
    documentation: 'Performs dynamic real-time transfer between two internal wallet accounts with atomic locks.',
    avgLatencyMs: 112,
    successRate: 99.82,
    requestsToday: 412050
  },
  {
    id: 'ep-3',
    endpoint: '/api/v3-beta/cards/tokenize',
    method: 'POST',
    version: 'v3-beta',
    authentication: 'API Key',
    status: 'BETA',
    owner: 'Card Services Team',
    documentation: 'Generates secure virtual cards with instant authorization tokenization mappings.',
    avgLatencyMs: 185,
    successRate: 97.40,
    requestsToday: 12400
  },
  {
    id: 'ep-4',
    endpoint: '/api/v1/kyc/check',
    method: 'POST',
    version: 'v1',
    authentication: 'API Key',
    status: 'DEPRECATED',
    owner: 'Compliance Team',
    documentation: 'Legacy compliance checking endpoint. Please migrate to /api/v2/kyc/screening.',
    deprecationDate: '2026-12-31',
    avgLatencyMs: 245,
    successRate: 99.12,
    requestsToday: 3200
  }
];

export const SEED_DEV_SECRETS: DevSecret[] = [
  {
    id: 'sec-s1',
    key: 'GEMINI_API_KEY',
    valueMasked: 'AIzaSy••••••••••••••••w612',
    environment: 'production',
    updatedBy: 'tilok.mania@gmail.com',
    lastUpdated: '2026-06-15T09:12:00Z',
    version: 4
  },
  {
    id: 'sec-s2',
    key: 'STRIPE_SECRET_KEY',
    valueMasked: 'sk_live_••••••••••••••••e8a1',
    environment: 'production',
    updatedBy: 'tilok.mania@gmail.com',
    lastUpdated: '2026-05-10T12:00:00Z',
    version: 2
  },
  {
    id: 'sec-s3',
    key: 'POSTGRES_DB_URL',
    valueMasked: 'postgresql://db_admin:••••••••••••••••@cloudsql-host/walletpro',
    environment: 'production',
    updatedBy: 'ops-deploy@walletpro.io',
    lastUpdated: '2026-07-01T04:30:00Z',
    version: 1
  }
];

export const SEED_ENV_VARIABLES: EnvVariable[] = [
  { id: 'env-1', key: 'NODE_ENV', valueMasked: 'production', environment: 'production', lastUpdated: '2026-01-01' },
  { id: 'env-2', key: 'KAFKA_BROKERS', valueMasked: 'kafka-node-1:9092,kafka-node-2:9092', environment: 'production', lastUpdated: '2026-03-12' },
  { id: 'env-3', key: 'ENABLE_REDIS_CACHE', valueMasked: 'true', environment: 'production', lastUpdated: '2026-04-15' }
];

export const SEED_QUEUE_JOBS: QueueJob[] = [
  { id: 'qj-1', queueName: 'ledger-sync-pool', taskName: 'SyncLedgerToBigQuery', payloadSummary: '{batch_id: "bq_88291", records: 2500}', status: 'PENDING', retryCount: 0, timestamp: '2026-07-10T07:06:55Z' },
  { id: 'qj-2', queueName: 'notifications-pool', taskName: 'DispatchPushNotification', payloadSummary: '{user_id: "u-9912", title: "Balance Alert"}', status: 'RUNNING', retryCount: 1, processingTimeMs: 450, timestamp: '2026-07-10T07:07:00Z' },
  { id: 'qj-3', queueName: 'card-token-pool', taskName: 'RegisterVirtualToken', payloadSummary: '{card_id: "c-44219", provider: "VISA"}', status: 'COMPLETED', retryCount: 0, processingTimeMs: 185, timestamp: '2026-07-10T07:04:12Z' },
  { id: 'qj-4', queueName: 'kyc-aml-checkers', taskName: 'ScreenPepSanctionList', payloadSummary: '{applicant_name: "Tilok Mania"}', status: 'FAILED', retryCount: 3, processingTimeMs: 1200, timestamp: '2026-07-10T06:55:00Z' }
];

export const SEED_BACKGROUND_JOBS: BackgroundJob[] = [
  { id: 'bj-1', name: 'Database Indexes Vacuum', schedule: '0 2 * * * (Daily 2 AM)', status: 'IDLE', lastRun: '2026-07-10T02:00:12Z', durationMs: 45800, retriesLeft: 2 },
  { id: 'bj-2', name: 'Stale Sessions Garbage Collector', schedule: '*/15 * * * * (Every 15m)', status: 'IDLE', lastRun: '2026-07-10T07:00:00Z', durationMs: 1250, retriesLeft: 1 },
  { id: 'bj-3', name: 'FX Daily Rates Synchronizer', schedule: '0 */4 * * * (Every 4 hours)', status: 'RUNNING', lastRun: '2026-07-10T07:07:00Z', durationMs: 34100, retriesLeft: 3 }
];

export const SEED_BACKGROUND_WORKERS: BackgroundWorker[] = [
  { id: 'wk-1', name: 'k8s-pod-worker-primary-6b74f', status: 'ONLINE', threadPoolSize: 16, activeThreads: 4, memoryUsageMb: 412, cpuUsagePct: 18.5, jobsProcessed: 142050 },
  { id: 'wk-2', name: 'k8s-pod-worker-secondary-28f9d', status: 'ONLINE', threadPoolSize: 16, activeThreads: 12, memoryUsageMb: 620, cpuUsagePct: 64.2, jobsProcessed: 99120 },
  { id: 'wk-3', name: 'k8s-pod-worker-replica-ff2a8', status: 'IDLE', threadPoolSize: 8, activeThreads: 0, memoryUsageMb: 185, cpuUsagePct: 1.2, jobsProcessed: 24105 }
];

export const SEED_MARKETPLACE_INTEGRATIONS: MarketplaceIntegration[] = [
  { id: 'int-1', name: 'Stripe Gateway', category: 'Payment Gateways', status: 'ACTIVE', provider: 'Stripe, Inc.', lastSync: '2026-07-10T07:05:00Z', logoColor: '#635BFF' },
  { id: 'int-2', name: 'Twilio SMS Gateway', category: 'SMS Providers', status: 'ACTIVE', provider: 'Twilio Cloud', lastSync: '2026-07-10T06:50:00Z', logoColor: '#F22F46' },
  { id: 'int-3', name: 'SendGrid Email API', category: 'Email Providers', status: 'ACTIVE', provider: 'Twilio SendGrid', lastSync: '2026-07-10T07:00:00Z', logoColor: '#009DDC' },
  { id: 'int-4', name: 'Onfido KYC Screening', category: 'KYC Providers', status: 'CONNECTED', provider: 'Onfido Tech Ltd', lastSync: '2026-07-10T06:00:00Z', logoColor: '#3C414F' },
  { id: 'int-5', name: 'Plaid Core API', category: 'Banking Partners', status: 'ACTIVE', provider: 'Plaid Technologies', lastSync: '2026-07-10T06:15:00Z', logoColor: '#000000' },
  { id: 'int-6', name: 'AWS S3 Asset Store', category: 'Cloud Storage', status: 'CONNECTED', provider: 'Amazon Web Services', lastSync: '2026-07-09T23:00:00Z', logoColor: '#FF9900' }
];

export const SEED_EVENT_BUS_MESSAGES: EventBusMessage[] = [
  { id: 'eb-1', eventName: 'user.created', publisher: 'auth-service', payload: '{"user_id": "u-9912", "email": "test@m.com"}', status: 'ACKNOWLEDGED', subscribers: 3, timestamp: '2026-07-10T07:05:12Z' },
  { id: 'eb-2', eventName: 'card.authorized', publisher: 'card-service', payload: '{"card_id": "c-1002", "amount": 420.00}', status: 'RETRYING', subscribers: 2, timestamp: '2026-07-10T07:06:40Z' },
  { id: 'eb-3', eventName: 'compliance.fraud_alert', publisher: 'risk-engine', payload: '{"rule_triggered": "velocity_limit", "user_id": "u-882"}', status: 'DLQ', subscribers: 4, timestamp: '2026-07-10T06:40:00Z' }
];

export const SEED_DEV_LOGS: DevLog[] = [
  { id: 'log-1', timestamp: '2026-07-10T07:06:55Z', level: 'INFO', type: 'API', correlationId: 'c-88a2-f901', message: 'GET /api/v2/wallets - 200 OK - Agent Request authenticated via OAuth Bearer token', latencyMs: 24, statusCode: 200 },
  { id: 'log-2', timestamp: '2026-07-10T07:06:12Z', level: 'WARN', type: 'API', correlationId: 'c-11b9-a281', message: 'POST /api/v2/transactions/transfer - 400 Bad Request - Parameter `destination_wallet` must be a valid account routing string', latencyMs: 15, statusCode: 400 },
  { id: 'log-3', timestamp: '2026-07-10T07:05:01Z', level: 'ERROR', type: 'WORKER', correlationId: 'c-90c4-b441', message: 'Kafka broker connection lost. Attempting auto-reconnection loop node k8s-broker-2:9092. Thread blocked.', statusCode: 500 },
  { id: 'log-4', timestamp: '2026-07-10T07:04:12Z', level: 'INFO', type: 'WEBHOOK', correlationId: 'c-22f3-1002', message: 'Webhook dispatch event `transaction.completed` to https://api.merchant-corp.com/v1/walletpro-events - Status 200 OK', latencyMs: 185, statusCode: 200 }
];

export const SEED_SERVICE_REGISTRY: ServiceRegistryNode[] = [
  { id: 'srv-1', name: 'api-gateway-service', version: 'v2.4.1', owner: 'DevOps & Routing Team', status: 'UP', healthScore: 100, latencyMs: 4, replicas: 3 },
  { id: 'srv-2', name: 'auth-identity-service', version: 'v1.8.12', owner: 'IAM Platform Team', status: 'UP', healthScore: 98, latencyMs: 12, replicas: 2 },
  { id: 'srv-3', name: 'wallet-ledger-engine', version: 'v3.0.4', owner: 'Core Ledger Team', status: 'UP', healthScore: 100, latencyMs: 22, replicas: 4 },
  { id: 'srv-4', name: 'card-processing-agent', version: 'v1.12.0', owner: 'Card Services Team', status: 'UP', healthScore: 95, latencyMs: 45, replicas: 2 },
  { id: 'srv-5', name: 'risk-screening-service', version: 'v2.0.1', owner: 'Risk & Fraud Engineering', status: 'UP', healthScore: 99, latencyMs: 85, replicas: 3 }
];

export const SEED_RATE_LIMIT_RULES: RateLimitRule[] = [
  { id: 'rl-1', target: 'Core API Gateway (/api/v2/*)', limit: '1,000 requests / minute / Client IP', violationsToday: 142, blockedClientsCount: 4 },
  { id: 'rl-2', target: 'Atomic Transfers endpoint (/api/v2/transactions/transfer)', limit: '60 requests / minute / Wallet Account', violationsToday: 11, blockedClientsCount: 1 },
  { id: 'rl-3', target: 'Compliance Screen checks (/api/v2/kyc/*)', limit: '200 requests / minute / Org Key', violationsToday: 0, blockedClientsCount: 0 }
];

export const SEED_RATE_LIMIT_VIOLATIONS: RateLimitViolation[] = [
  { id: 'v-1', clientIp: '185.190.140.22', endpoint: '/api/v2/wallets', timestamp: '2026-07-10T07:05:12Z', blockedDurationSec: 300 },
  { id: 'v-2', clientIp: '45.112.98.11', endpoint: '/api/v2/transactions/transfer', timestamp: '2026-07-10T06:50:00Z', blockedDurationSec: 600 },
  { id: 'v-3', clientIp: '99.201.12.85', endpoint: '/api/v2/wallets', timestamp: '2026-07-10T06:12:00Z', blockedDurationSec: 300 }
];

export const SEED_DEPLOYMENT_HISTORY: DeploymentHistoryEntry[] = [
  {
    id: 'dep-1',
    version: 'prod-v2.4.12',
    timestamp: '2026-07-10T04:00:00Z',
    status: 'SUCCESS',
    deployedBy: 'tilok.mania@gmail.com',
    commitHash: '8e1bf90a',
    notes: 'Optimized ledger index queries & updated card tokenization security layers.'
  },
  {
    id: 'dep-2',
    version: 'prod-v2.4.11',
    timestamp: '2026-07-01T02:30:00Z',
    status: 'SUCCESS',
    deployedBy: 'ops-deploy@walletpro.io',
    commitHash: 'c90bf211',
    notes: 'Merged regional routing optimizations for UK/Europe IBAN networks.'
  },
  {
    id: 'dep-3',
    version: 'prod-v2.4.10-patch1',
    timestamp: '2026-06-25T11:45:00Z',
    status: 'ROLLED_BACK',
    deployedBy: 'ops-deploy@walletpro.io',
    commitHash: 'd214a790',
    notes: 'Security patch upgrade rollback due to Kafka deadlocks during screening sync.'
  }
];
