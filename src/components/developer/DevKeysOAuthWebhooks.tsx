import React, { useState } from 'react';
import { 
  Key, UserCheck, Webhook, ArrowRightLeft, Lock, Settings, 
  Plus, Eye, EyeOff, RefreshCw, Trash2, Check, Copy, AlertTriangle,
  Play
} from 'lucide-react';
import { 
  DevApiKey, DevOAuthClient, DevWebhook, WebhookDelivery, 
  DevSecret, EnvVariable 
} from './devMockData';

interface DevKeysOAuthWebhooksProps {
  isDarkMode: boolean;
  apiKeys: DevApiKey[];
  setApiKeys: React.Dispatch<React.SetStateAction<DevApiKey[]>>;
  oauthClients: DevOAuthClient[];
  setOauthClients: React.Dispatch<React.SetStateAction<DevOAuthClient[]>>;
  webhooks: DevWebhook[];
  setWebhooks: React.Dispatch<React.SetStateAction<DevWebhook[]>>;
  deliveries: WebhookDelivery[];
  setDeliveries: React.Dispatch<React.SetStateAction<WebhookDelivery[]>>;
  secrets: DevSecret[];
  setSecrets: React.Dispatch<React.SetStateAction<DevSecret[]>>;
  envVars: EnvVariable[];
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  activeSubTab: string;
}

export function DevKeysOAuthWebhooks({
  isDarkMode,
  apiKeys,
  setApiKeys,
  oauthClients,
  setOauthClients,
  webhooks,
  setWebhooks,
  deliveries,
  setDeliveries,
  secrets,
  setSecrets,
  envVars,
  onToast,
  activeSubTab
}: DevKeysOAuthWebhooksProps) {
  
  // SECRETS/KEYS WORKFLOW STATE
  const [showSecretId, setShowSecretId] = useState<string | null>(null);
  const [rotatedKeyId, setRotatedKeyId] = useState<string | null>(null);
  const [activeSecretEnv, setActiveSecretEnv] = useState<'production' | 'staging' | 'sandbox'>('production');

  // API KEYS ACTIONS
  const handleCreateApiKey = () => {
    const randomHex = Math.floor(Math.random() * 10000000).toString(16);
    const newKey: DevApiKey = {
      id: `key-${apiKeys.length + 1}`,
      name: `Integrator Token - ${new Date().toLocaleDateString()}`,
      keyMasked: `wp_live_${randomHex}••••••••••••••••c6e1`,
      scopes: ['wallets:read', 'transactions:read'],
      status: 'ACTIVE',
      created: new Date().toISOString(),
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: 'Never Used',
      callsToday: 0
    };
    setApiKeys(prev => [newKey, ...prev]);
    onToast('API Key Created', 'New live credentials initialized successfully.', 'success');
  };

  const handleToggleApiKey = (id: string) => {
    setApiKeys(prev => prev.map(k => {
      if (k.id === id) {
        const nextStatus = k.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        onToast('Credential Altered', `API credential ${k.name} set to ${nextStatus}`, 'info');
        return { ...k, status: nextStatus as any };
      }
      return k;
    }));
  };

  const handleRotateApiKey = (id: string) => {
    const randomHex = Math.floor(Math.random() * 10000000).toString(16);
    setApiKeys(prev => prev.map(k => {
      if (k.id === id) {
        onToast('API Key Rotated', `Rotated key values for ${k.name}. Old key invalidated immediately.`, 'success');
        return { 
          ...k, 
          keyMasked: `wp_live_${randomHex}••••••••••••••••e190`,
          created: new Date().toISOString()
        };
      }
      return k;
    }));
  };

  // OAUTH ACTION
  const handleCreateOAuthClient = () => {
    const nextId = `oauth-${oauthClients.length + 1}`;
    const newClient: DevOAuthClient = {
      id: nextId,
      name: `External Auth Integration Client`,
      clientId: `cid_oauth_app_${Math.floor(100000 + Math.random() * 900000)}`,
      clientSecretMasked: 'sh_sec_••••••••••••••••' + Math.floor(1000 + Math.random() * 9000).toString(16),
      redirectUris: ['https://callback.mymerchant.io/oauth'],
      scopes: ['openid', 'profile', 'wallets:read'],
      status: 'ACTIVE',
      created: new Date().toISOString(),
      lastUsed: 'Never'
    };
    setOauthClients(prev => [newClient, ...prev]);
    onToast('OAuth Client Generated', 'New client ID mapped to workspace.', 'success');
  };

  // WEBHOOK ACTION
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const handleCreateWebhook = () => {
    if (!newWebhookUrl) {
      onToast('Validation Error', 'Webhook dispatch endpoint URL is required', 'warning');
      return;
    }
    const newWh: DevWebhook = {
      id: `wh-${webhooks.length + 1}`,
      name: `Live Event Dispatch Hook`,
      url: newWebhookUrl,
      events: ['transaction.completed'],
      signingSecret: 'whsec_' + Math.floor(1000000 + Math.random() * 9000000).toString(16),
      status: 'ACTIVE',
      retryPolicy: { maxAttempts: 5, backoffRate: 'Exponential (2x)' },
      created: new Date().toISOString()
    };
    setWebhooks(prev => [...prev, newWh]);
    setNewWebhookUrl('');
    onToast('Webhook Hooked', 'Subscribed to atomic ledger transaction syncs.', 'success');
  };

  // WEBHOOK REPLAY ACTION
  const handleReplayWebhook = (deliveryId: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;
    onToast('Replaying Webhook', `Dispatching re-delivery for trace ID ${deliveryId}`, 'info');

    setTimeout(() => {
      const replayed: WebhookDelivery = {
        id: `del-replay-${Math.floor(Math.random() * 1000)}`,
        webhookId: delivery.webhookId,
        event: delivery.event,
        url: delivery.url,
        status: 'SUCCESS',
        statusCode: 200,
        latencyMs: Math.floor(45 + Math.random() * 100),
        timestamp: new Date().toISOString(),
        payload: delivery.payload,
        response: '{"replayed": true, "ack": true}',
        attempts: 1
      };
      setDeliveries(prev => [replayed, ...prev]);
      onToast('Replay Succeeded', 'Webhook delivered successfully on second dispatch', 'success');
    }, 1000);
  };

  // SECRET ROTATION ACTION
  const handleRotateSecret = (id: string) => {
    setSecrets(prev => prev.map(s => {
      if (s.id === id) {
        onToast('Secret Rotated', `Production system secret ${s.key} regenerated securely.`, 'success');
        return {
          ...s,
          valueMasked: `${s.key.substring(0, 4)}_secret_rot_••••••••`,
          lastUpdated: new Date().toISOString(),
          version: s.version + 1
        };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6 text-left">
      {/* ==================================== */}
      {/* 1. API KEYS */}
      {/* ==================================== */}
      {activeSubTab === 'dev-api-keys' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-500" /> API Authentication Tokens
              </h2>
              <p className="text-xs opacity-75">Live security credentials authorizing Bearer header calls to external routing networks</p>
            </div>
            <button 
              onClick={handleCreateApiKey}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" /> Generate Token
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 opacity-60">
                  <th className="py-2">Description Name</th>
                  <th className="py-2">Credential Hash</th>
                  <th className="py-2">Scopes Authorized</th>
                  <th className="py-2">Daily Volume</th>
                  <th className="py-2">Expires Threshold</th>
                  <th className="py-2">State</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {apiKeys.map(key => (
                  <tr key={key.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 font-sans font-bold">{key.name}</td>
                    <td className="py-3 font-mono opacity-80">{key.keyMasked}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1 font-sans">
                        {key.scopes.map(sc => (
                          <span key={sc} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-mono">{sc}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 font-mono">{key.callsToday.toLocaleString()} reqs</td>
                    <td className="py-3 text-[10px]">{new Date(key.expires).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-bold ${
                        key.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleToggleApiKey(key.id)}
                          className="px-2 py-1 rounded hover:bg-slate-800/40 text-[10px] font-sans"
                        >
                          {key.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                        </button>
                        <button 
                          onClick={() => handleRotateApiKey(key.id)}
                          className="p-1 rounded hover:bg-slate-800/40 text-blue-400"
                          title="Rotate Keys Securely"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 2. OAUTH CLIENTS */}
      {/* ==================================== */}
      {activeSubTab === 'dev-oauth' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500" /> OAuth 2.0 Integration Clients
              </h2>
              <p className="text-xs opacity-75">Integrate third-party federated logins with compliant WalletPro OAuth protocols</p>
            </div>
            <button 
              onClick={handleCreateOAuthClient}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" /> Provision Client ID
            </button>
          </div>

          <div className="space-y-4">
            {oauthClients.map(cl => (
              <div key={cl.id} className={`p-4 rounded-xl border font-mono text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-sans font-bold text-sm text-blue-500">{cl.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-sans text-[10px] font-bold">{cl.status}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="opacity-60 text-[10px] uppercase">Client ID</div>
                    <div className="bg-slate-900 p-1.5 rounded text-slate-300 font-mono text-[11px] border border-slate-800">{cl.clientId}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="opacity-60 text-[10px] uppercase">Client Secret (Masked)</div>
                    <div className="bg-slate-900 p-1.5 rounded text-slate-300 font-mono text-[11px] border border-slate-800 flex justify-between items-center">
                      <span>{cl.clientSecretMasked}</span>
                      <button 
                        onClick={() => onToast('Sensitive View Masked', 'For developer security, secrets are rotated rather than viewed.', 'info')}
                        className="text-blue-500 hover:underline text-[10px] font-sans"
                      >
                        Rotate Values
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="opacity-60 text-[10px] uppercase mb-1">Redirect URIs Allowed</div>
                    {cl.redirectUris.map(uri => (
                      <div key={uri} className="text-slate-400 text-[11px]">{uri}</div>
                    ))}
                  </div>

                  <div>
                    <div className="opacity-60 text-[10px] uppercase mb-1">Scopes Authorized</div>
                    <div className="flex flex-wrap gap-1">
                      {cl.scopes.map(sc => (
                        <span key={sc} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-sans">{sc}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 3. WEBHOOKS */}
      {/* ==================================== */}
      {activeSubTab === 'dev-webhooks' && (
        <div className={`p-5 rounded-xl border space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Webhook className="w-4 h-4 text-blue-500" /> Active Webhook Hooks
            </h2>
            <p className="text-xs opacity-75">Receive instant event notifications directly on external endpoints on specific transactional cycles</p>
          </div>

          {/* Webhook Registration */}
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <label className="text-xs opacity-75 font-semibold block mb-1">Register New Endpoints</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/v1/hooks"
                className="flex-1 p-2 rounded-lg border text-xs bg-transparent border-slate-700 font-mono"
              />
              <button 
                onClick={handleCreateWebhook}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Register Hook
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {webhooks.map(wh => (
              <div key={wh.id} className="p-4 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div>
                    <span className="font-sans font-bold text-sm text-blue-500">{wh.name}</span>
                    <span className="block text-[11px] opacity-70 mt-0.5">{wh.url}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-sans text-[10px] font-bold">{wh.status}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <div className="opacity-60 text-[10px] uppercase">Signing Secret</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="bg-slate-900 px-1.5 py-1 rounded text-slate-300 font-mono text-[11px]">
                        {showSecretId === wh.id ? wh.signingSecret : 'whsec_••••••••••••••••••••'}
                      </span>
                      <button 
                        onClick={() => setShowSecretId(prev => prev === wh.id ? null : wh.id)}
                        className="p-1 rounded hover:bg-slate-800"
                      >
                        {showSecretId === wh.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="opacity-60 text-[10px] uppercase">Events Dispatched</div>
                    <div className="flex flex-wrap gap-1 mt-1 font-sans">
                      {wh.events.map(ev => (
                        <span key={ev} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">{ev}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="opacity-60 text-[10px] uppercase">Retry Policy</div>
                    <div className="mt-1">
                      <span className="font-bold">{wh.retryPolicy.maxAttempts} attempts</span>
                      <span className="block text-[10px] opacity-60">Backoff: {wh.retryPolicy.backoffRate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 4. WEBHOOK DELIVERIES LOG */}
      {/* ==================================== */}
      {activeSubTab === 'dev-webhook-deliveries' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-500" /> Webhook Deliveries Log
            </h2>
            <p className="text-xs opacity-75">Audit trail of outbound webhook delivery payloads and partner response status codes</p>
          </div>

          <div className="space-y-4 mt-4">
            {deliveries.map(del => (
              <div key={del.id} className="p-4 rounded-xl border border-slate-800/60 text-xs font-mono">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${del.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-bold text-slate-300">{del.event}</span>
                    <span className="opacity-50">({del.id})</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`px-1.5 py-0.5 rounded ${del.status === 'SUCCESS' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
                      HTTP {del.statusCode}
                    </span>
                    <span className="opacity-60">{del.latencyMs} ms</span>
                    <span className="opacity-60">{new Date(del.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <p className="opacity-60 text-[10px] mb-2">Endpoint URL: {del.url}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-[10px] opacity-50 block mb-1">Payload Sent</span>
                    <pre className="p-2.5 rounded bg-slate-950 text-slate-400 text-[10px] overflow-x-auto h-24 overflow-y-auto whitespace-pre">
                      {del.payload}
                    </pre>
                  </div>

                  <div>
                    <span className="text-[10px] opacity-50 block mb-1">Response Headers & Body</span>
                    <pre className="p-2.5 rounded bg-slate-950 text-slate-400 text-[10px] overflow-x-auto h-24 overflow-y-auto whitespace-pre">
                      {del.response}
                    </pre>
                  </div>
                </div>

                {del.status === 'FAILED' && (
                  <div className="mt-3 pt-3 border-t border-slate-800/40 flex justify-between items-center">
                    <span className="text-[10px] text-rose-500 font-sans flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Retried {del.attempts}/5 times. Backoff active.
                    </span>
                    <button 
                      onClick={() => handleReplayWebhook(del.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-[11px] font-bold"
                    >
                      <Play className="w-3 h-3" /> Force Replay Payload
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 5. SECRETS MANAGEMENT */}
      {/* ==================================== */}
      {activeSubTab === 'dev-secrets' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" /> Secrets Vault Store
              </h2>
              <p className="text-xs opacity-75">Central storage of API secrets, private encryption keys, and DB credentials. Never visible to clients</p>
            </div>
            
            <div className="flex gap-2">
              {(['production', 'staging', 'sandbox'] as const).map(env => (
                <button
                  key={env}
                  onClick={() => setActiveSecretEnv(env)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold uppercase ${
                    activeSecretEnv === env ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 opacity-60">
                  <th className="py-2">Secret Variable Key</th>
                  <th className="py-2">Decrypted Secret Value</th>
                  <th className="py-2">Last Modified By</th>
                  <th className="py-2">Last Updated</th>
                  <th className="py-2">Version</th>
                  <th className="py-2 text-right">Vault Key Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {secrets.filter(s => s.environment === activeSecretEnv).map(sec => (
                  <tr key={sec.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 font-bold text-blue-400">{sec.key}</td>
                    <td className="py-3 text-slate-400">{sec.valueMasked}</td>
                    <td className="py-3 font-sans opacity-70">{sec.updatedBy}</td>
                    <td className="py-3 text-[10px]">{new Date(sec.lastUpdated).toLocaleString()}</td>
                    <td className="py-3">v{sec.version}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleRotateSecret(sec.id)}
                        className="px-2 py-1 rounded hover:bg-slate-800 text-[10px] font-semibold text-blue-500 hover:underline"
                      >
                        Rotate Secret
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 6. ENVIRONMENT VARIABLES */}
      {/* ==================================== */}
      {activeSubTab === 'dev-env-vars' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-500" /> Platform Environment Variables
            </h2>
            <p className="text-xs opacity-75">Configurable settings for staging and production runtime environments. Variables are completely masked</p>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 opacity-60">
                  <th className="py-2">Variable Property Key</th>
                  <th className="py-2">Masked Config Value</th>
                  <th className="py-2">Environment Scope</th>
                  <th className="py-2">Last Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono opacity-95">
                {envVars.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 text-emerald-500 font-bold">{ev.key}</td>
                    <td className="py-3 font-mono text-slate-400">{ev.valueMasked}</td>
                    <td className="py-3 uppercase text-[10px]">{ev.environment}</td>
                    <td className="py-3 text-[10px] opacity-70">{ev.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
