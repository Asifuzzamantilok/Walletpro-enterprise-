import React, { useState } from 'react';
import { 
  TrendingUp, AlertTriangle, GitBranch, History, ClipboardList,
  Edit, Save, Plus, ArrowRight, Server, FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Cell, PieChart, Pie
} from 'recharts';
import { DeploymentHistoryEntry } from './devMockData';

interface DevAnalyticsHistoryReleasesProps {
  isDarkMode: boolean;
  deployments: DeploymentHistoryEntry[];
  setDeployments: React.Dispatch<React.SetStateAction<DeploymentHistoryEntry[]>>;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  activeSubTab: string;
}

export function DevAnalyticsHistoryReleases({
  isDarkMode,
  deployments,
  setDeployments,
  onToast,
  activeSubTab
}: DevAnalyticsHistoryReleasesProps) {
  
  // RELEASE NOTES EDIT STATE
  const [releaseNotes, setReleaseNotes] = useState([
    { version: 'v2.4.12', date: '2026-07-10', type: 'Feature', text: 'Enabled atomic wallet index optimizations and microservice auto-scaling peer adjustments.' },
    { version: 'v2.4.11', date: '2026-07-01', type: 'Performance', text: 'Upgraded Redis cache pipeline parameters to decrease core ledger query speed from 60ms to 22ms.' },
    { version: 'v2.4.10', date: '2026-06-15', type: 'Security', text: 'Mandated secure Bearer JWT scopes and introduced blocked-clients IP ban triggers in the API gateway.' }
  ]);

  const [notesDraft, setNotesDraft] = useState('');
  const [notesVersion, setNotesVersion] = useState('');
  const [notesType, setNotesType] = useState('Feature');

  const handleAddReleaseNotes = () => {
    if (!notesVersion || !notesDraft) {
      onToast('Validation Error', 'Version tag and text are required', 'warning');
      return;
    }
    const newNote = {
      version: notesVersion,
      date: new Date().toISOString().split('T')[0],
      type: notesType,
      text: notesDraft
    };
    setReleaseNotes(prev => [newNote, ...prev]);
    setNotesVersion('');
    setNotesDraft('');
    onToast('Release Notes Updated', `Changelog entry for ${notesVersion} added successfully.`, 'success');
  };

  // RECHARTS STYLE
  const tooltipStyle = {
    background: isDarkMode ? '#0f172a' : '#ffffff',
    borderColor: isDarkMode ? '#334155' : '#cbd5e1',
    color: isDarkMode ? '#f8fafc' : '#0f172a',
    borderRadius: '8px'
  };

  const chartColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 text-left">
      {/* ==================================== */}
      {/* 1. API ANALYTICS */}
      {/* ==================================== */}
      {activeSubTab === 'dev-api-analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-sm font-bold mb-4">Top Endpoint Throughput (Calls/Sec Today)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'GET /wallets', volume: 821 },
                  { name: 'POST /transfer', volume: 412 },
                  { name: 'POST /cards', volume: 124 },
                  { name: 'GET /transactions', volume: 382 },
                  { name: 'POST /kyc', volume: 32 }
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} opacity={0.3} />
                  <XAxis type="number" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                  <YAxis type="category" dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} width={100} fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="volume" name="Throughput (RPS)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-sm font-bold mb-4">API Version Traffic Distribution</h3>
            <div className="h-64 flex flex-col justify-between">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Version v2 (Stable)', value: 85 },
                      { name: 'Version v1 (Legacy)', value: 12 },
                      { name: 'Version v3 (Beta)', value: 3 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartColors.slice(0, 3).map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-[11px] font-mono opacity-70 flex justify-between border-t border-slate-800/40 pt-2">
                <span>Core target: v2</span>
                <span className="text-blue-500 font-bold">85% migrated to v2</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 2. ERROR ANALYTICS */}
      {/* ==================================== */}
      {activeSubTab === 'dev-error-analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-1.5 text-rose-500">
              <AlertTriangle className="w-4 h-4" /> Top Error Response Codes (Occurrences/Hour)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'ERR_INSUFFICIENT_FUNDS', count: 185, fill: '#ef4444' },
                  { name: 'ERR_AUTH_EXPIRED', count: 94, fill: '#f59e0b' },
                  { name: 'ERR_RATE_LIMIT_EXCEEDED', count: 42, fill: '#3b82f6' },
                  { name: 'ERR_ROUTING_TIMEOUT', count: 18, fill: '#8b5cf6' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} opacity={0.3} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={8} />
                  <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                    {[
                      { fill: '#ef4444' },
                      { fill: '#f59e0b' },
                      { fill: '#3b82f6' },
                      { fill: '#8b5cf6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-sm font-bold mb-4">Error Trend Analysis (Last 24 Hours)</h3>
            <div className="p-4 bg-slate-950 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="opacity-60 font-sans">1. Source Wallet Locking Retries</span>
                <span className="text-emerald-500">Normal (0.01%)</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="opacity-60 font-sans">2. Twilio Outbound Peer Timeout</span>
                <span className="text-amber-500">Elevated (1.40%)</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="opacity-60 font-sans">3. PostgreSQL Database Connection Leak</span>
                <span className="text-emerald-500">0 Leaks detected</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60 font-sans">4. Kafka Consumer Lag Threshold</span>
                <span className="text-emerald-500">Lag &lt; 2 ms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 3. VERSION MANAGEMENT */}
      {/* ==================================== */}
      {activeSubTab === 'dev-version-mgmt' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-500" /> API Versioning & Deprecation Schedule
            </h2>
            <p className="text-xs opacity-75">Maintain REST endpoints and audit official sunset schedules across legacy versions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              { tag: 'v2.0 (Stable)', date: 'N/A', status: 'ACTIVE', desc: 'Default production API standard utilizing bearer tokens and microsecond synchronization clocks.' },
              { tag: 'v1.0 (Legacy)', date: 'Dec 31, 2026', status: 'DEPRECATED', desc: 'Pre-atomic transaction API endpoints. Recommended migration documentation available.' },
              { tag: 'v3.0 (Beta)', date: 'TBD', status: 'STAGING_ONLY', desc: 'Support for federated distributed multi-ledger transactions and real-time streaming sockets.' }
            ].map(ver => (
              <div key={ver.tag} className={`p-4 rounded-xl border border-slate-800 font-mono text-xs flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{ver.tag}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-bold ${
                      ver.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' :
                      ver.status === 'DEPRECATED' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'
                    }`}>
                      {ver.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-sans opacity-70 mt-3">{ver.desc}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-800/40 text-[10px] opacity-60 flex justify-between">
                  <span>Sunset Target:</span>
                  <span className="font-bold">{ver.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 4. DEPLOYMENT HISTORY */}
      {/* ==================================== */}
      {activeSubTab === 'dev-deployment' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <History className="w-4 h-4 text-blue-500" /> Platform Deployment Pipeline History
            </h2>
            <p className="text-xs opacity-75">Audit trail of automated Cloud Run deployments, Docker container compiles and rolled-back commits</p>
          </div>

          <div className="space-y-4 mt-4">
            {deployments.map(dep => (
              <div key={dep.id} className="p-4 rounded-xl border border-slate-850 font-mono text-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      dep.status === 'SUCCESS' ? 'bg-emerald-500' :
                      dep.status === 'FAILED' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                    }`} />
                    <span className="font-bold text-slate-300">{dep.version}</span>
                    <span className="opacity-50">({dep.commitHash})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded ${
                      dep.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                      dep.status === 'FAILED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {dep.status}
                    </span>
                    <span className="opacity-60">{new Date(dep.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-[11px] font-sans opacity-70 mb-2">{dep.notes}</p>
                
                <div className="flex justify-between items-center text-[10px] opacity-50 pt-2 border-t border-slate-900">
                  <span>Deployed by: {dep.deployedBy}</span>
                  {dep.status === 'ROLLED_BACK' && (
                    <span className="text-amber-500">Rollback triggered automatically due to health checks degradation.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 5. RELEASE NOTES (CHANGELOG) */}
      {/* ==================================== */}
      {activeSubTab === 'dev-releases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-5 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-500" /> Platform Release Changelogs
              </h2>
              <p className="text-xs opacity-75">Documented platform features, security patches, and latency upgrades</p>
            </div>

            <div className="space-y-4">
              {releaseNotes.map(note => (
                <div key={note.version} className="p-4 rounded-xl border border-slate-850 font-mono text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-blue-500 font-mono text-sm">{note.version}</span>
                      <span className="text-[10px] opacity-40">{note.date}</span>
                    </div>

                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-bold ${
                      note.type === 'Feature' ? 'bg-emerald-500/15 text-emerald-500' :
                      note.type === 'Performance' ? 'bg-blue-500/15 text-blue-500' : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {note.type}
                    </span>
                  </div>
                  <p className="font-sans text-xs opacity-85 leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Release changelog editor */}
          <div className={`p-4 rounded-xl border space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-semibold opacity-60 uppercase block">Changelog Markdown Writer</span>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] opacity-60 block mb-0.5">Release Version tag</label>
                <input 
                  type="text" 
                  value={notesVersion}
                  onChange={(e) => setNotesVersion(e.target.value)}
                  placeholder="v2.4.13"
                  className="w-full p-2 rounded-lg border text-xs bg-transparent border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] opacity-60 block mb-0.5">Classification Type</label>
                <select 
                  value={notesType}
                  onChange={(e) => setNotesType(e.target.value)}
                  className="w-full p-2 rounded-lg border text-xs bg-transparent border-slate-700 font-mono"
                >
                  <option value="Feature">Feature Update</option>
                  <option value="Performance">Performance Tuning</option>
                  <option value="Security">Security Advisory</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] opacity-60 block mb-0.5">Changelog Body Draft</label>
                <textarea 
                  rows={4}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Summarize compiler and route upgrades..."
                  className="w-full p-2 rounded-lg border text-xs bg-transparent border-slate-700 focus:outline-none"
                />
              </div>

              <button 
                onClick={handleAddChangelog => handleAddReleaseNotes()}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Publish Changelog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
