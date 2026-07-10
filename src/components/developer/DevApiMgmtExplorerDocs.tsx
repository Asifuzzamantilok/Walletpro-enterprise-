import React, { useState, useMemo } from 'react';
import { 
  Search, Terminal, BookOpen, HardDrive, Play, Copy, Check,
  Server, Shield, Layers, HelpCircle, FileDown, BookOpen as DocsIcon
} from 'lucide-react';
import { ApiEndpoint } from './devMockData';

interface DevApiMgmtExplorerDocsProps {
  isDarkMode: boolean;
  endpoints: ApiEndpoint[];
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  activeSubTab: string;
}

export function DevApiMgmtExplorerDocs({
  isDarkMode,
  endpoints,
  onToast,
  activeSubTab
}: DevApiMgmtExplorerDocsProps) {
  // SEARCH / FILTERS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // EXPLORER STATE
  const [explorerEndpointId, setExplorerEndpointId] = useState<string>('ep-1');
  const [explorerParams, setExplorerParams] = useState<string>('{"limit": 20, "offset": 0}');
  const [explorerHeaders, setExplorerHeaders] = useState<string>('{\n  "Authorization": "Bearer wp_live_9f82...",\n  "Content-Type": "application/json"\n}');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [explorerResponse, setExplorerResponse] = useState<string | null>(null);
  const [explorerCodeLang, setExplorerCodeLang] = useState<'curl' | 'js' | 'python' | 'go'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  // Filter endpoints
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter(ep => {
      const matchSearch = ep.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ep.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMethod = selectedMethodFilter === 'ALL' || ep.method === selectedMethodFilter;
      const matchStatus = selectedStatusFilter === 'ALL' || ep.status === selectedStatusFilter;
      return matchSearch && matchMethod && matchStatus;
    });
  }, [endpoints, searchTerm, selectedMethodFilter, selectedStatusFilter]);

  const activeExplorerEndpoint = useMemo(() => {
    return endpoints.find(ep => ep.id === explorerEndpointId) || endpoints[0];
  }, [explorerEndpointId, endpoints]);

  // Generate multi-language code snippets
  const codeSnippet = useMemo(() => {
    if (!activeExplorerEndpoint) return '';
    const host = 'https://api.walletpro.io';
    const cleanUrl = `${host}${activeExplorerEndpoint.endpoint}`;
    
    switch (explorerCodeLang) {
      case 'curl':
        return `curl -X ${activeExplorerEndpoint.method} "${cleanUrl}" \\\n  -H "Authorization: Bearer wp_live_••••••••" \\\n  -H "Content-Type: application/json" ${
          activeExplorerEndpoint.method !== 'GET' ? `\\\n  -d '${explorerParams}'` : ''
        }`;
      case 'js':
        return `fetch("${cleanUrl}", {\n  method: "${activeExplorerEndpoint.method}",\n  headers: {\n    "Authorization": "Bearer wp_live_••••••••",\n    "Content-Type": "application/json"\n  }${
          activeExplorerEndpoint.method !== 'GET' ? `,\n  body: JSON.stringify(${explorerParams})` : ''
        }\n})\n.then(res => res.json())\n.then(data => console.log(data));`;
      case 'python':
        return `import requests\n\nurl = "${cleanUrl}"\nheaders = {\n    "Authorization": "Bearer wp_live_••••••••",\n    "Content-Type": "application/json"\n}\n\nresponse = requests.${activeExplorerEndpoint.method.toLowerCase()}(url, headers=headers${
          activeExplorerEndpoint.method !== 'GET' ? `, json=${explorerParams}` : ''
        })\nprint(response.json())`;
      case 'go':
        return `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"io"\n)\n\nfunc main() {\n\tclient := &http.Client{}\n\treq, _ := http.NewRequest("${activeExplorerEndpoint.method}", "${cleanUrl}", nil)\n\treq.Header.Add("Authorization", "Bearer wp_live_••••••••")\n\treq.Header.Add("Content-Type", "application/json")\n\tresp, _ := client.Do(req)\n\tdefer resp.Body.Close()\n\tbody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(body))\n}`;
    }
  }, [activeExplorerEndpoint, explorerCodeLang, explorerParams]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    onToast('Copied to Clipboard', 'Code snippet successfully copied.', 'success');
  };

  const handleExecuteExplorer = () => {
    setIsSendingRequest(true);
    setExplorerResponse(null);
    onToast('Dispatched Request', 'Transmitting sandbox API call...', 'info');

    setTimeout(() => {
      setIsSendingRequest(false);
      try {
        const parsedParams = JSON.parse(explorerParams);
        let mockRes = {};
        if (activeExplorerEndpoint.endpoint.includes('wallets')) {
          mockRes = {
            status: 'SUCCESS',
            timestamp: new Date().toISOString(),
            correlationId: 'c-ep-explorer-' + Math.floor(Math.random() * 10000),
            data: {
              wallets: [
                { id: 'W-CONSUMER-1', currency: 'USD', balance: 4120.50, status: 'ACTIVE' },
                { id: 'W-SAVINGS-2', currency: 'EUR', balance: 12500.00, status: 'ACTIVE' }
              ],
              pagination: { limit: parsedParams.limit || 20, offset: parsedParams.offset || 0, total: 2 }
            }
          };
        } else if (activeExplorerEndpoint.endpoint.includes('transfer')) {
          mockRes = {
            status: 'SUCCESS',
            transactionId: 'tx_' + Math.floor(100000 + Math.random() * 900000),
            correlationId: 'c-tx-dispatch-' + Math.floor(Math.random() * 1000),
            settled: true,
            amount: 2500.00,
            currency: 'USD',
            feeCalculated: 15.00,
            timestamp: new Date().toISOString()
          };
        } else {
          mockRes = {
            status: 'SUCCESS',
            endpoint: activeExplorerEndpoint.endpoint,
            method: activeExplorerEndpoint.method,
            sandbox: true,
            timestamp: new Date().toISOString(),
            data: { message: "Mock response generated safely. No actual ledger balances altered." }
          };
        }
        setExplorerResponse(JSON.stringify(mockRes, null, 2));
        onToast('Response Received', 'Status 200 OK', 'success');
      } catch (err) {
        setExplorerResponse(JSON.stringify({ error: 'INVALID_JSON_PARAMETERS', message: 'Parameters field must be valid JSON' }, null, 2));
        onToast('Execution Failed', 'Status 400 Bad Request', 'warning');
      }
    }, 1200);
  };

  const handleDownloadSDK = (lang: string) => {
    onToast('SDK Download Initialized', `${lang} SDK bundle is now preparing. Compiled binary downloaded directly.`, 'success');
  };

  return (
    <div className="space-y-6 text-left">
      {/* ==================================== */}
      {/* 1. API MANAGEMENT: INVENTORY */}
      {/* ==================================== */}
      {activeSubTab === 'dev-api-mgmt' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <div>
              <h2 className="font-bold text-base">API Inventory & Gateway Routes</h2>
              <p className="text-xs opacity-75">Core REST endpoints registered on public API endpoints with routing latency metrics</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search endpoint..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border text-xs bg-transparent border-slate-700 w-44 focus:outline-none"
                />
              </div>

              {/* Method filter */}
              <select 
                value={selectedMethodFilter}
                onChange={(e) => setSelectedMethodFilter(e.target.value)}
                className="p-1.5 rounded-lg border text-xs bg-transparent border-slate-700"
              >
                <option value="ALL">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              {/* Status Filter */}
              <select 
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="p-1.5 rounded-lg border text-xs bg-transparent border-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="STABLE">STABLE</option>
                <option value="BETA">BETA</option>
                <option value="DEPRECATED">DEPRECATED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 opacity-60">
                  <th className="py-2.5">Endpoint Pattern</th>
                  <th className="py-2.5">Auth Mode</th>
                  <th className="py-2.5">Daily Volume</th>
                  <th className="py-2.5">Avg Latency</th>
                  <th className="py-2.5">Success Rate</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5">Owner / Deprecation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredEndpoints.map(ep => (
                  <tr key={ep.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                          ep.method === 'GET' ? 'bg-emerald-500/15 text-emerald-500' :
                          ep.method === 'POST' ? 'bg-blue-500/15 text-blue-500' :
                          ep.method === 'PUT' ? 'bg-amber-500/15 text-amber-500' : 'bg-rose-500/15 text-rose-500'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="font-mono font-bold">{ep.endpoint}</span>
                        <span className="text-[10px] opacity-50">({ep.version})</span>
                      </div>
                      <p className="text-[10px] opacity-60 mt-0.5">{ep.documentation}</p>
                    </td>
                    <td className="py-3 font-mono">{ep.authentication}</td>
                    <td className="py-3 font-mono">{ep.requestsToday.toLocaleString()}</td>
                    <td className="py-3 font-mono">{ep.avgLatencyMs} ms</td>
                    <td className="py-3 font-mono text-emerald-500">{ep.successRate}%</td>
                    <td className="py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        ep.status === 'STABLE' ? 'bg-emerald-500/15 text-emerald-500' :
                        ep.status === 'BETA' ? 'bg-indigo-500/15 text-indigo-500' : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {ep.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="block opacity-75">{ep.owner}</span>
                      {ep.deprecationDate && (
                        <span className="text-[9px] text-rose-500 block mt-0.5 font-mono">Sunset: {ep.deprecationDate}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 2. API EXPLORER */}
      {/* ==================================== */}
      {activeSubTab === 'dev-explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-5 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <h2 className="font-bold text-base mb-1 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-500" /> Interactive Gateway Sandbox
              </h2>
              <p className="text-xs opacity-75 mb-4">Execute live transactions on sandbox node with test parameters</p>

              <div className="space-y-4">
                {/* Select Endpoint */}
                <div>
                  <label className="text-xs opacity-60 block mb-1 font-semibold">Select Route</label>
                  <select 
                    value={explorerEndpointId}
                    onChange={(e) => setExplorerEndpointId(e.target.value)}
                    className="w-full p-2 rounded-lg border text-xs bg-transparent border-slate-700"
                  >
                    {endpoints.map(ep => (
                      <option key={ep.id} value={ep.id}>
                        [{ep.method}] {ep.endpoint} ({ep.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Headers */}
                <div>
                  <label className="text-xs opacity-60 block mb-1 font-semibold">HTTP Headers (JSON)</label>
                  <textarea 
                    rows={4}
                    value={explorerHeaders}
                    onChange={(e) => setExplorerHeaders(e.target.value)}
                    className="w-full p-2 rounded-lg border text-xs font-mono bg-slate-950 text-slate-300 border-slate-800 focus:outline-none"
                  />
                </div>

                {/* Params */}
                <div>
                  <label className="text-xs opacity-60 block mb-1 font-semibold">Request Body (JSON)</label>
                  <textarea 
                    rows={3}
                    value={explorerParams}
                    onChange={(e) => setExplorerParams(e.target.value)}
                    className="w-full p-2 rounded-lg border text-xs font-mono bg-slate-950 text-slate-300 border-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 flex justify-between">
              <button 
                onClick={handleExecuteExplorer}
                disabled={isSendingRequest}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> {isSendingRequest ? 'Executing Request...' : 'Send Request'}
              </button>
            </div>
          </div>

          {/* Response & Snippets */}
          <div className="flex flex-col gap-4">
            {/* Snippet Picker */}
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold opacity-60">Client SDK Snippet Generator</span>
                <div className="flex gap-1.5">
                  {(['curl', 'js', 'python', 'go'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setExplorerCodeLang(lang)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        explorerCodeLang === lang ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="p-3 rounded bg-slate-950 text-slate-300 text-[11px] font-mono overflow-x-auto text-left whitespace-pre-wrap">
                  {codeSnippet}
                </pre>
                <button 
                  onClick={handleCopyCode}
                  className="absolute right-2 top-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  title="Copy to Clipboard"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Response Viewer */}
            <div className={`flex-1 p-4 rounded-xl border min-h-[220px] flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold opacity-60">Sandbox Response Output</span>
                {explorerResponse && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono text-[10px]">HTTP 200 OK</span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto max-h-[240px] bg-slate-950 rounded p-3 text-left">
                {isSendingRequest ? (
                  <div className="flex items-center justify-center h-full py-12 text-xs font-mono text-blue-500">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Transmitting packet through routing nodes...
                  </div>
                ) : explorerResponse ? (
                  <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre">{explorerResponse}</pre>
                ) : (
                  <div className="text-xs font-mono text-slate-500 text-center py-12">
                    Sandbox idle. Configure parameters on the left and click Send Request.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 3. API DOCUMENTATION */}
      {/* ==================================== */}
      {activeSubTab === 'dev-docs' && (
        <div className={`p-5 rounded-xl border text-left ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-lg">REST API Core Specifications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 border-r border-slate-800/40 pr-4">
              <div className="text-xs font-bold opacity-60 uppercase tracking-wider mb-2">Guide Book</div>
              <button className="w-full text-left p-1.5 rounded hover:bg-slate-800/10 text-xs font-semibold text-blue-500">1. Authentication Protocols</button>
              <button className="w-full text-left p-1.5 rounded hover:bg-slate-800/10 text-xs font-semibold opacity-80">2. Global Rate Limiting</button>
              <button className="w-full text-left p-1.5 rounded hover:bg-slate-800/10 text-xs font-semibold opacity-80">3. JSON Standard Responses</button>
              <button className="w-full text-left p-1.5 rounded hover:bg-slate-800/10 text-xs font-semibold opacity-80">4. Cursor Pagination</button>
              <button className="w-full text-left p-1.5 rounded hover:bg-slate-800/10 text-xs font-semibold opacity-80">5. Error Code Matrix</button>
              <button className="w-full text-left p-1.5 rounded hover:bg-slate-800/10 text-xs font-semibold opacity-80">6. Webhook Signatures</button>
            </div>

            <div className="md:col-span-3 space-y-4">
              <div>
                <h3 className="font-bold text-sm">1. Authentication Protocols</h3>
                <p className="text-xs opacity-85 leading-relaxed mt-1">
                  The WalletPro Enterprise API utilizes Bearer tokens as the primary authorization flow. All request payloads must carry the signature token inside the standard header attribute:
                </p>
                <pre className="p-3 rounded bg-slate-950 text-slate-300 text-[11px] font-mono mt-2 text-left">
                  Authorization: Bearer wp_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-sm">2. Global Rate Limiting</h3>
                <p className="text-xs opacity-85 leading-relaxed mt-1">
                  API endpoints enforce strict traffic limits depending on licensing and API Key scopes. Standard production limits allow:
                </p>
                <ul className="list-disc list-inside text-xs opacity-85 mt-1 space-y-1 pl-2">
                  <li><strong>Core Routes:</strong> 1,000 requests per minute per IP.</li>
                  <li><strong>Transfers:</strong> 60 requests per minute per source account (to prevent double-spend).</li>
                </ul>
                <p className="text-xs opacity-85 mt-2">
                  Violating rate limits triggers a standard <code className="font-mono bg-slate-950 p-0.5 rounded text-amber-500 text-[10px]">HTTP 429 Too Many Requests</code> with cooling period headers.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm">3. Error Code Matrix</h3>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-[11px] font-mono text-left">
                    <thead>
                      <tr className="border-b border-slate-800 opacity-60">
                        <th className="pb-1.5">Error Code</th>
                        <th className="pb-1.5">HTTP Status</th>
                        <th className="pb-1.5">Meaning / Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 opacity-90">
                      <tr>
                        <td className="py-1 text-rose-500">ERR_INSUFFICIENT_FUNDS</td>
                        <td className="py-1">400 Bad Request</td>
                        <td className="py-1">Source wallet balance is lower than transaction amount + fee.</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-rose-500">ERR_AUTH_EXPIRED</td>
                        <td className="py-1">401 Unauthorized</td>
                        <td className="py-1">The supplied API token has passed its expiration threshold.</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-rose-500">ERR_RATE_LIMIT_EXCEEDED</td>
                        <td className="py-1">429 Too Many Requests</td>
                        <td className="py-1">Endpoint request volume exceeded configured threshold.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 4. SDK DOWNLOADS */}
      {/* ==================================== */}
      {activeSubTab === 'dev-sdks' && (
        <div className="space-y-6 text-left">
          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-5 h-5 text-blue-500" />
              <div>
                <h2 className="font-bold text-lg">Official Language Client SDKs</h2>
                <p className="text-xs opacity-75">Deploy pre-built client SDK wrappers for atomic multi-ledger transaction syncing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {[
                { name: 'JavaScript / Node.js', cmd: 'npm install @walletpro/node-sdk', lang: 'JavaScript', size: '1.2 MB', ver: 'v2.4.1' },
                { name: 'TypeScript', cmd: 'npm install @walletpro/ts-sdk', lang: 'TypeScript', size: '1.4 MB', ver: 'v2.4.1' },
                { name: 'Python Client', cmd: 'pip install walletpro-sdk', lang: 'Python', size: '890 KB', ver: 'v1.12.0' },
                { name: 'Go Library', cmd: 'go get github.com/walletpro/sdk-go', lang: 'Go', size: '2.1 MB', ver: 'v2.0.2' },
                { name: 'Flutter Plugin', cmd: 'flutter pub add walletpro_flutter', lang: 'Flutter', size: '1.8 MB', ver: 'v1.0.8' },
                { name: 'Swift Code SDK', cmd: 'SPM: github.com/walletpro/sdk-swift', lang: 'Swift', size: '3.4 MB', ver: 'v1.1.0' }
              ].map((sdk, index) => (
                <div key={index} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{sdk.name}</span>
                      <span className="text-[10px] opacity-60 font-mono">{sdk.ver}</span>
                    </div>
                    <div className="mt-2 relative">
                      <pre className="p-2 rounded bg-slate-950 text-slate-300 font-mono text-[10px] text-left overflow-x-auto whitespace-pre">
                        {sdk.cmd}
                      </pre>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-800/40">
                    <span className="text-[10px] opacity-60 font-mono">Size: {sdk.size}</span>
                    <button 
                      onClick={() => handleDownloadSDK(sdk.lang)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold"
                    >
                      <FileDown className="w-3 h-3" /> Download Tarball
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inactive legacy languages banner */}
            <div className="mt-6 border-t border-slate-800/40 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="opacity-50">Java SDK: <span className="text-amber-500">Not Available Yet</span></div>
              <div className="opacity-50">Kotlin Android: <span className="text-amber-500">Not Available Yet</span></div>
              <div className="opacity-50">C# .NET Client: <span className="text-amber-500">Not Available Yet</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
