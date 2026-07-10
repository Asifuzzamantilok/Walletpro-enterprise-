import React, { useState, useMemo } from 'react';
import { 
  Network, Activity, RefreshCw, Cpu, Calendar, Plus, 
  CheckCircle, Play, AlertCircle, RefreshCcw
} from 'lucide-react';
import { 
  QueueJob, BackgroundJob, BackgroundWorker, EventBusMessage 
} from './devMockData';

interface DevEventBusQueuesJobsProps {
  isDarkMode: boolean;
  eventMessages: EventBusMessage[];
  setEventMessages: React.Dispatch<React.SetStateAction<EventBusMessage[]>>;
  queueJobs: QueueJob[];
  setQueueJobs: React.Dispatch<React.SetStateAction<QueueJob[]>>;
  bgJobs: BackgroundJob[];
  setBgJobs: React.Dispatch<React.SetStateAction<BackgroundJob[]>>;
  workers: BackgroundWorker[];
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  activeSubTab: string;
}

export function DevEventBusQueuesJobs({
  isDarkMode,
  eventMessages,
  setEventMessages,
  queueJobs,
  setQueueJobs,
  bgJobs,
  setBgJobs,
  workers,
  onToast,
  activeSubTab
}: DevEventBusQueuesJobsProps) {
  
  // ACTIVE QUEUE TAB
  const [activeQueueFilter, setActiveQueueFilter] = useState<'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'>('PENDING');

  // EVENT BUS ACTIONS
  const handleRedriveDlq = (id: string) => {
    onToast('Re-driving DLQ Event', `Re-publishing event message ${id} back to routing topic...`, 'info');
    
    setTimeout(() => {
      setEventMessages(prev => prev.map(m => {
        if (m.id === id) {
          onToast('DLQ Succeeded', 'Event acknowledged successfully on re-drive dispatch', 'success');
          return { ...m, status: 'ACKNOWLEDGED' as any };
        }
        return m;
      }));
    }, 1200);
  };

  // QUEUE ACTIONS
  const handleRetryQueueJob = (id: string) => {
    onToast('Retrying Queue Task', `Restarting job sequence ${id}...`, 'info');

    // Move state to RUNNING then COMPLETED
    setQueueJobs(prev => prev.map(job => {
      if (job.id === id) {
        return { ...job, status: 'RUNNING', retryCount: job.retryCount + 1 };
      }
      return job;
    }));

    setTimeout(() => {
      setQueueJobs(prev => prev.map(job => {
        if (job.id === id) {
          onToast('Job Succeeded', `Task ${job.taskName} successfully settled.`, 'success');
          return { ...job, status: 'COMPLETED', processingTimeMs: 142 };
        }
        return job;
      }));
    }, 1500);
  };

  // CRON ACTION
  const handleRunCronNow = (id: string) => {
    setBgJobs(prev => prev.map(j => {
      if (j.id === id) {
        onToast('Cron Task Triggered', `Forcing execution of cron task: ${j.name}`, 'success');
        return { ...j, status: 'RUNNING' as any, lastRun: new Date().toISOString() };
      }
      return j;
    }));

    setTimeout(() => {
      setBgJobs(prev => prev.map(j => {
        if (j.id === id) {
          onToast('Cron Task Finished', `Task ${j.name} executed successfully.`, 'success');
          return { ...j, status: 'IDLE' as any, durationMs: Math.floor(100 + Math.random() * 500) };
        }
        return j;
      }));
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* ==================================== */}
      {/* 1. EVENT BUS (KAFKA / RABBIT) */}
      {/* ==================================== */}
      {activeSubTab === 'dev-event-bus' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-500" /> Kafka Event Bus Hub
            </h2>
            <p className="text-xs opacity-75">Peering logs of multi-topic events published across various system microservices</p>
          </div>

          <div className="space-y-4 mt-4">
            {eventMessages.map(msg => (
              <div key={msg.id} className="p-4 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-400">{msg.eventName}</span>
                    <span className="text-[10px] opacity-50">Topic Node</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      msg.status === 'ACKNOWLEDGED' ? 'bg-emerald-500/10 text-emerald-500' :
                      msg.status === 'RETRYING' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {msg.status}
                    </span>
                    <span className="opacity-50">Subs: {msg.subscribers}</span>
                    <span className="opacity-50">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-[10px] opacity-50 block mb-0.5">Publisher Source</span>
                    <div className="text-[11px] font-semibold text-slate-300">{msg.publisher}</div>
                  </div>

                  <div>
                    <span className="text-[10px] opacity-50 block mb-0.5">Serialized JSON Payload</span>
                    <pre className="p-1.5 rounded bg-slate-950 text-slate-400 text-[10px] overflow-x-auto whitespace-pre">
                      {msg.payload}
                    </pre>
                  </div>
                </div>

                {msg.status === 'DLQ' && (
                  <div className="mt-3 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                    <span className="text-[10px] text-rose-500 font-sans flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Blocked in Dead Letter Queue due to sub-service timeout
                    </span>
                    <button 
                      onClick={() => handleRedriveDlq(msg.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-[11px] font-bold"
                    >
                      <RefreshCcw className="w-3 h-3" /> Re-drive DLQ Event
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 2. QUEUE MONITOR */}
      {/* ==================================== */}
      {activeSubTab === 'dev-queues' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> Active Redis Queue Monitor
              </h2>
              <p className="text-xs opacity-75">Status tracking of background ledger operations, compliance checks and sync queues</p>
            </div>

            <div className="flex gap-1">
              {(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'] as const).map(status => {
                const count = queueJobs.filter(j => j.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setActiveQueueFilter(status)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase flex items-center gap-1 ${
                      activeQueueFilter === status ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{status}</span>
                    <span className="bg-slate-900 px-1 rounded text-[10px] font-black">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 opacity-60">
                  <th className="py-2">Task Sequence ID</th>
                  <th className="py-2">Queue Name</th>
                  <th className="py-2">Active Task Method</th>
                  <th className="py-2">Payload Summary</th>
                  <th className="py-2 font-mono">Retries</th>
                  <th className="py-2">Dispatch Time</th>
                  {activeQueueFilter === 'FAILED' && <th className="py-2 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {queueJobs.filter(j => j.status === activeQueueFilter).map(job => (
                  <tr key={job.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 font-bold text-slate-300">{job.id}</td>
                    <td className="py-3">{job.queueName}</td>
                    <td className="py-3 font-sans font-bold text-blue-400">{job.taskName}</td>
                    <td className="py-3 max-w-xs truncate opacity-75">{job.payloadSummary}</td>
                    <td className="py-3">{job.retryCount}</td>
                    <td className="py-3 opacity-60">{new Date(job.timestamp).toLocaleTimeString()}</td>
                    {activeQueueFilter === 'FAILED' && (
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => handleRetryQueueJob(job.id)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-[10px]"
                        >
                          Retry Job
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 3. BACKGROUND JOBS */}
      {/* ==================================== */}
      {activeSubTab === 'dev-bg-jobs' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-500" /> Background Worker Jobs
            </h2>
            <p className="text-xs opacity-75">Daemon schedules executing data pruning, indexing and daily rate audits</p>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 opacity-60">
                  <th className="py-2">Job Name</th>
                  <th className="py-2">Schedule (Cron)</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Last Execution Run</th>
                  <th className="py-2">State</th>
                  <th className="py-2 text-right">Manually Fire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {bgJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 font-sans font-bold text-slate-300">{job.name}</td>
                    <td className="py-3 text-emerald-500">{job.schedule}</td>
                    <td className="py-3">{(job.durationMs / 1000).toFixed(2)}s</td>
                    <td className="py-3 text-[10px] opacity-70">{new Date(job.lastRun).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-bold ${
                        job.status === 'RUNNING' ? 'bg-blue-500/15 text-blue-500 animate-pulse' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleRunCronNow(job.id)}
                        className="p-1 rounded hover:bg-slate-800/40 text-blue-400"
                        title="Run Cron Job Now"
                      >
                        <Play className="w-3.5 h-3.5" />
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
      {/* 4. BACKGROUND WORKERS */}
      {/* ==================================== */}
      {activeSubTab === 'dev-workers' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" /> Active Kubernetes Replica Workers
            </h2>
            <p className="text-xs opacity-75">Runtime monitoring of isolated cluster worker pods handling background tasks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {workers.map(wk => (
              <div key={wk.id} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} font-mono text-xs`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-sans font-bold text-slate-200">{wk.name}</span>
                  <span className={`w-2 h-2 rounded-full ${wk.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="opacity-60 font-sans">Thread Allocation</span>
                    <span>{wk.activeThreads} / {wk.threadPoolSize} active</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${(wk.activeThreads / wk.threadPoolSize) * 100}%` }} />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="opacity-60 font-sans">CPU load</span>
                    <span>{wk.cpuUsagePct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: `${wk.cpuUsagePct}%` }} />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span className="opacity-60 font-sans">RAM Usage</span>
                    <span>{wk.memoryUsageMb} MB</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-slate-800/40 text-[10px]">
                    <span className="opacity-60 font-sans">Total Jobs Executed</span>
                    <span className="font-bold text-slate-300">{wk.jobsProcessed.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* 5. CRON SCHEDULER */}
      {/* ==================================== */}
      {activeSubTab === 'dev-cron-jobs' && (
        <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Active Cron Scheduler Daemon
            </h2>
            <p className="text-xs opacity-75">Configured intervals firing system actions. Click Execute to trigger run-to-completion cycles</p>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 opacity-60">
                  <th className="py-2">Cron Variable Key</th>
                  <th className="py-2">Syntax Expression</th>
                  <th className="py-2">Interval</th>
                  <th className="py-2">Next Scheduled Run</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono opacity-95">
                {[
                  { name: 'INDEX_VACUUM', syntax: '0 2 * * *', interval: 'Daily 2:00 AM', next: 'Tomorrow 2:00 AM', id: 'bj-1' },
                  { name: 'SESSION_GC', syntax: '*/15 * * * *', interval: 'Every 15 Minutes', next: 'In 8 minutes', id: 'bj-2' },
                  { name: 'FX_SYNC', syntax: '0 */4 * * *', interval: 'Every 4 Hours', next: 'In 2 hours', id: 'bj-3' }
                ].map(cron => (
                  <tr key={cron.name} className="hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 font-bold text-blue-400">{cron.name}</td>
                    <td className="py-3 text-emerald-400">{cron.syntax}</td>
                    <td className="py-3">{cron.interval}</td>
                    <td className="py-3 opacity-70">{cron.next}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleRunCronNow(cron.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300"
                      >
                        Fire Trigger
                      </button>
                    </td>
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
