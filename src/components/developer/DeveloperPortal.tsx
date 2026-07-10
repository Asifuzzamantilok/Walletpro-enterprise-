import React, { useState, useEffect } from 'react';
import { 
  SEED_DEV_API_KEYS, SEED_DEV_OAUTH_CLIENTS, SEED_DEV_WEBHOOKS,
  SEED_WEBHOOK_DELIVERIES, SEED_API_ENDPOINTS, SEED_DEV_SECRETS,
  SEED_ENV_VARIABLES, SEED_QUEUE_JOBS, SEED_BACKGROUND_JOBS,
  SEED_BACKGROUND_WORKERS, SEED_MARKETPLACE_INTEGRATIONS,
  SEED_EVENT_BUS_MESSAGES, SEED_DEV_LOGS, SEED_SERVICE_REGISTRY,
  SEED_RATE_LIMIT_RULES, SEED_RATE_LIMIT_VIOLATIONS, SEED_DEPLOYMENT_HISTORY,
  DevApiKey, DevOAuthClient, DevWebhook, WebhookDelivery, ApiEndpoint,
  DevSecret, EnvVariable, QueueJob, BackgroundJob, BackgroundWorker,
  MarketplaceIntegration, EventBusMessage, DevLog, ServiceRegistryNode,
  RateLimitRule, RateLimitViolation, DeploymentHistoryEntry
} from './devMockData';

import { DevDashboardOverview } from './DevDashboardOverview';
import { DevApiMgmtExplorerDocs } from './DevApiMgmtExplorerDocs';
import { DevKeysOAuthWebhooks } from './DevKeysOAuthWebhooks';
import { DevSandboxMarketplace } from './DevSandboxMarketplace';
import { DevEventBusQueuesJobs } from './DevEventBusQueuesJobs';
import { DevLogsTracingHealthRegistry } from './DevLogsTracingHealthRegistry';
import { DevAnalyticsHistoryReleases } from './DevAnalyticsHistoryReleases';

interface DeveloperPortalProps {
  activeTab: string; // e.g. dev-overview, dev-api-mgmt, dev-api-keys, etc.
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  isDarkMode?: boolean;
}

export function DeveloperPortal({
  activeTab,
  onToast,
  isDarkMode = true
}: DeveloperPortalProps) {
  
  // PERSISTENT DATA ENGINES LOADED FROM LOCAL STORAGE
  const [apiKeys, setApiKeys] = useState<DevApiKey[]>(() => {
    const saved = localStorage.getItem('wp_dev_api_keys');
    return saved ? JSON.parse(saved) : SEED_DEV_API_KEYS;
  });

  const [oauthClients, setOauthClients] = useState<DevOAuthClient[]>(() => {
    const saved = localStorage.getItem('wp_dev_oauth_clients');
    return saved ? JSON.parse(saved) : SEED_DEV_OAUTH_CLIENTS;
  });

  const [webhooks, setWebhooks] = useState<DevWebhook[]>(() => {
    const saved = localStorage.getItem('wp_dev_webhooks');
    return saved ? JSON.parse(saved) : SEED_DEV_WEBHOOKS;
  });

  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>(() => {
    const saved = localStorage.getItem('wp_dev_webhook_deliveries');
    return saved ? JSON.parse(saved) : SEED_WEBHOOK_DELIVERIES;
  });

  const [endpoints] = useState<ApiEndpoint[]>(SEED_API_ENDPOINTS);

  const [secrets, setSecrets] = useState<DevSecret[]>(() => {
    const saved = localStorage.getItem('wp_dev_secrets');
    return saved ? JSON.parse(saved) : SEED_DEV_SECRETS;
  });

  const [envVars] = useState<EnvVariable[]>(SEED_ENV_VARIABLES);

  const [queueJobs, setQueueJobs] = useState<QueueJob[]>(() => {
    const saved = localStorage.getItem('wp_dev_queue_jobs');
    return saved ? JSON.parse(saved) : SEED_QUEUE_JOBS;
  });

  const [bgJobs, setBgJobs] = useState<BackgroundJob[]>(() => {
    const saved = localStorage.getItem('wp_dev_bg_jobs');
    return saved ? JSON.parse(saved) : SEED_BACKGROUND_JOBS;
  });

  const [workers] = useState<BackgroundWorker[]>(SEED_BACKGROUND_WORKERS);

  const [marketplace, setMarketplace] = useState<MarketplaceIntegration[]>(() => {
    const saved = localStorage.getItem('wp_dev_marketplace');
    return saved ? JSON.parse(saved) : SEED_MARKETPLACE_INTEGRATIONS;
  });

  const [eventMessages, setEventMessages] = useState<EventBusMessage[]>(() => {
    const saved = localStorage.getItem('wp_dev_event_messages');
    return saved ? JSON.parse(saved) : SEED_EVENT_BUS_MESSAGES;
  });

  const [logs, setLogs] = useState<DevLog[]>(() => {
    const saved = localStorage.getItem('wp_dev_logs');
    return saved ? JSON.parse(saved) : SEED_DEV_LOGS;
  });

  const [services, setServices] = useState<ServiceRegistryNode[]>(SEED_SERVICE_REGISTRY);
  const [rateRules, setRateRules] = useState<RateLimitRule[]>(SEED_RATE_LIMIT_RULES);
  const [violations, setViolations] = useState<RateLimitViolation[]>(SEED_RATE_LIMIT_VIOLATIONS);

  const [deployments, setDeployments] = useState<DeploymentHistoryEntry[]>(() => {
    const saved = localStorage.getItem('wp_dev_deployments');
    return saved ? JSON.parse(saved) : SEED_DEPLOYMENT_HISTORY;
  });

  // SYNCHRONIZE STATE PERSISTENCE ON CHANGES
  useEffect(() => {
    localStorage.setItem('wp_dev_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('wp_dev_oauth_clients', JSON.stringify(oauthClients));
  }, [oauthClients]);

  useEffect(() => {
    localStorage.setItem('wp_dev_webhooks', JSON.stringify(webhooks));
  }, [webhooks]);

  useEffect(() => {
    localStorage.setItem('wp_dev_webhook_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('wp_dev_secrets', JSON.stringify(secrets));
  }, [secrets]);

  useEffect(() => {
    localStorage.setItem('wp_dev_queue_jobs', JSON.stringify(queueJobs));
  }, [queueJobs]);

  useEffect(() => {
    localStorage.setItem('wp_dev_bg_jobs', JSON.stringify(bgJobs));
  }, [bgJobs]);

  useEffect(() => {
    localStorage.setItem('wp_dev_marketplace', JSON.stringify(marketplace));
  }, [marketplace]);

  useEffect(() => {
    localStorage.setItem('wp_dev_event_messages', JSON.stringify(eventMessages));
  }, [eventMessages]);

  useEffect(() => {
    localStorage.setItem('wp_dev_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('wp_dev_deployments', JSON.stringify(deployments));
  }, [deployments]);

  // CATEGORIZE ROUTING TABS
  const isOverview = activeTab === 'dev-overview' || activeTab === 'dev-monitoring';
  
  const isApiDocsOrExplorer = [
    'dev-api-mgmt', 'dev-explorer', 'dev-docs', 'dev-sdks'
  ].includes(activeTab);

  const isCredentialsOrSecrets = [
    'dev-api-keys', 'dev-oauth', 'dev-webhooks', 
    'dev-webhook-deliveries', 'dev-secrets', 'dev-env-vars'
  ].includes(activeTab);

  const isSandboxOrMarketplace = [
    'dev-sandbox', 'dev-marketplace'
  ].includes(activeTab);

  const isQueueOrBus = [
    'dev-event-bus', 'dev-queues', 'dev-bg-jobs', 'dev-workers', 'dev-cron-jobs'
  ].includes(activeTab);

  const isLogsHealthLimits = [
    'dev-logs', 'dev-tracing', 'dev-service-registry', 
    'dev-microservices', 'dev-health', 'dev-rate-limits'
  ].includes(activeTab);

  const isAnalyticsHistoryReleases = [
    'dev-api-analytics', 'dev-error-analytics', 
    'dev-version-mgmt', 'dev-deployment', 'dev-releases'
  ].includes(activeTab);

  return (
    <div className={`w-full min-h-screen ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Tab Contents dispatcher */}
      {isOverview && (
        <DevDashboardOverview 
          isDarkMode={isDarkMode}
          endpoints={endpoints}
          apiKeys={apiKeys}
          oauthClients={oauthClients}
          webhooks={webhooks}
          queueJobs={queueJobs}
          bgJobs={bgJobs}
          workers={workers}
          services={services}
          onToast={onToast}
        />
      )}

      {isApiDocsOrExplorer && (
        <DevApiMgmtExplorerDocs 
          isDarkMode={isDarkMode}
          endpoints={endpoints}
          onToast={onToast}
          activeSubTab={activeTab}
        />
      )}

      {isCredentialsOrSecrets && (
        <DevKeysOAuthWebhooks 
          isDarkMode={isDarkMode}
          apiKeys={apiKeys}
          setApiKeys={setApiKeys}
          oauthClients={oauthClients}
          setOauthClients={setOauthClients}
          webhooks={webhooks}
          setWebhooks={setWebhooks}
          deliveries={deliveries}
          setDeliveries={setDeliveries}
          secrets={secrets}
          setSecrets={setSecrets}
          envVars={envVars}
          onToast={onToast}
          activeSubTab={activeTab}
        />
      )}

      {isSandboxOrMarketplace && (
        <DevSandboxMarketplace 
          isDarkMode={isDarkMode}
          marketplace={marketplace}
          setMarketplace={setMarketplace}
          onToast={onToast}
          activeSubTab={activeTab}
        />
      )}

      {isQueueOrBus && (
        <DevEventBusQueuesJobs 
          isDarkMode={isDarkMode}
          eventMessages={eventMessages}
          setEventMessages={setEventMessages}
          queueJobs={queueJobs}
          setQueueJobs={setQueueJobs}
          bgJobs={bgJobs}
          setBgJobs={setBgJobs}
          workers={workers}
          onToast={onToast}
          activeSubTab={activeTab}
        />
      )}

      {isLogsHealthLimits && (
        <DevLogsTracingHealthRegistry 
          isDarkMode={isDarkMode}
          logs={logs}
          setLogs={setLogs}
          services={services}
          setServices={setServices}
          rateRules={rateRules}
          setRateRules={setRateRules}
          violations={violations}
          setViolations={setViolations}
          onToast={onToast}
          activeSubTab={activeTab}
        />
      )}

      {isAnalyticsHistoryReleases && (
        <DevAnalyticsHistoryReleases 
          isDarkMode={isDarkMode}
          deployments={deployments}
          setDeployments={setDeployments}
          onToast={onToast}
          activeSubTab={activeTab}
        />
      )}

    </div>
  );
}
