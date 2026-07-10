import React, { useState } from 'react';
import { 
  Check, X, FileText, AlertTriangle, ShieldCheck, CheckCircle2, Clock,
  Search, Shield, Eye, HelpCircle, Layers, Clipboard, AlertCircle
} from 'lucide-react';
import { IAMApprovalWorkflow, IAMAccessReview, IAMAuditLog } from './iamMockData';

interface IamWorkflowsLogsProps {
  workflows: IAMApprovalWorkflow[];
  reviews: IAMAccessReview[];
  auditLogs: IAMAuditLog[];
  onUpdateWorkflow: (id: string, updates: Partial<IAMApprovalWorkflow>) => void;
  onUpdateReview: (id: string, updates: Partial<IAMAccessReview>) => void;
  onAddAuditLog: (action: string, target: string, prevValue: string, newValue: string, reason: string) => void;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function IamWorkflowsLogs({
  workflows, reviews, auditLogs, onUpdateWorkflow, onUpdateReview, onAddAuditLog, onToast
}: IamWorkflowsLogsProps) {

  const [activeSubTab, setActiveSubTab] = useState<'workflows' | 'reviews' | 'logs'>('workflows');
  
  // Dialog state for approval/rejection
  const [selectedWorkflow, setSelectedWorkflow] = useState<IAMApprovalWorkflow | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<'Approved' | 'Rejected' | null>(null);
  const [decisionReason, setDecisionReason] = useState('');

  // Logs filters state
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('All');
  const [selectedDetailedLog, setSelectedDetailedLog] = useState<IAMAuditLog | null>(null);

  // Filters
  const logActions = ['All', ...new Set(auditLogs.map(l => l.action.split('.')[0]))];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.target.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.reason.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.id.toLowerCase().includes(logSearch.toLowerCase());
    
    const matchesAction = logActionFilter === 'All' || log.action.startsWith(logActionFilter);

    return matchesSearch && matchesAction;
  });

  // Target resource extractor
  const getWorkflowTarget = (wf: IAMApprovalWorkflow): string => {
    if (!wf) return 'Platform';
    return wf.details.targetEmployeeName || wf.details.employeeName || wf.details.limitIncrease || 'System Policy';
  };

  // Execute decision
  const handleWorkflowDecision = (wf: IAMApprovalWorkflow, decision: 'Approved' | 'Rejected') => {
    setSelectedWorkflow(wf);
    setApprovalDecision(decision);
    setDecisionReason('');
  };

  const confirmWorkflowDecision = () => {
    if (!selectedWorkflow || !approvalDecision) return;

    onUpdateWorkflow(selectedWorkflow.id, {
      status: approvalDecision,
      approvers: selectedWorkflow.approvers.map(app => 
        app.status === 'Pending' ? { name: 'Super Administrator', status: approvalDecision, timestamp: new Date().toISOString() } : app
      )
    });

    onToast(
      `Workflow ${approvalDecision}`,
      `Security request for "${selectedWorkflow.actionType}" is now ${approvalDecision.toLowerCase()}.`,
      approvalDecision === 'Approved' ? 'success' : 'warning'
    );

    const target = getWorkflowTarget(selectedWorkflow);

    // Append to Audit Trail
    onAddAuditLog(
      `workflow.${approvalDecision.toLowerCase()}`,
      target,
      'Pending',
      approvalDecision,
      decisionReason || 'Dual administrative maker-checker clearance'
    );

    setSelectedWorkflow(null);
    setApprovalDecision(null);
  };

  // Review recertification
  const handleReviewCertification = (rev: IAMAccessReview, decision: 'Certified' | 'Revoked') => {
    const empName = rev.history[0]?.employeeName || 'All Staff';
    const perm = rev.history[0]?.permission || 'Assigned Privileges';

    onUpdateReview(rev.id, {
      status: decision === 'Certified' ? 'Completed' : 'Overdue',
      reviewer: 'Super Administrator'
    });

    onToast(
      `Access ${decision}`,
      `Employee privileges for ${empName} have been ${decision.toLowerCase()}.`,
      decision === 'Certified' ? 'success' : 'warning'
    );

    onAddAuditLog(
      `review.${decision.toLowerCase()}`,
      empName,
      'Pending Audit',
      decision,
      `Quarterly entitlement campaign certification: ${perm}`
    );
  };

  return (
    <div id="iam-workflows-logs-container" className="space-y-6">
      {/* Sub tabs selection */}
      <div className="flex border-b border-slate-200 text-xs font-bold text-slate-500 gap-4 mb-2">
        {[
          { id: 'workflows', label: 'Maker-Checker Approvals', count: workflows.filter(w => w.status === 'Pending Approval').length },
          { id: 'reviews', label: 'Quarterly Access Reviews', count: reviews.filter(r => r.status === 'In Progress').length },
          { id: 'logs', label: 'Global Security Audit Logs', count: auditLogs.length }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as any)}
            className={`pb-2.5 transition-all border-b-2 cursor-pointer ${activeSubTab === t.id ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent hover:text-slate-700'}`}
          >
            {t.label} <span className="ml-1 bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded text-[9px] font-semibold">{t.count}</span>
          </button>
        ))}
      </div>

      {/* 1. Workflows Pipeline Tab */}
      {activeSubTab === 'workflows' && (
        <div className="space-y-4 text-left">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">maker-checker dual approvals pipeline</h3>
            <p className="text-[10px] text-slate-400">High-risk administrative operations require multi-party signature authentication before executing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map(wf => {
              const target = getWorkflowTarget(wf);
              return (
                <div 
                  key={wf.id} 
                  id={`workflow-${wf.id}`}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow transition-shadow"
                >
                  <div>
                    <div className="flex justify-between items-start pb-2 border-b border-slate-100 mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{wf.id}</span>
                        <h4 className="text-xs font-bold text-slate-800">{wf.actionType}</h4>
                      </div>
                      <div>
                        {wf.status === 'Pending Approval' && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Pending Sig
                          </span>
                        )}
                        {wf.status === 'Approved' && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-500" />
                            Approved
                          </span>
                        )}
                        {wf.status === 'Rejected' && (
                          <span className="text-[9px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <X className="w-3 h-3 text-red-500" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-600 font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Initiator:</span>
                        <span>{wf.requestedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Object:</span>
                        <span className="font-mono text-xs">{target}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Scope Impact:</span>
                        <span className="text-red-600">HIGH-RISK PARALLEL OVERLAY</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium italic mt-2 p-2 bg-slate-50 border border-slate-100 rounded leading-relaxed">
                        " Security trigger initiated via administrative maker protocol. Pending secondary clearance checker signature. "
                      </p>
                    </div>
                  </div>

                  {wf.status === 'Pending Approval' && (
                    <div className="mt-4 pt-3 border-t border-slate-50 flex gap-2 justify-end">
                      <button
                        onClick={() => handleWorkflowDecision(wf, 'Rejected')}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2.5 py-1.5 rounded text-[10px] transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject Sig
                      </button>
                      <button
                        onClick={() => handleWorkflowDecision(wf, 'Approved')}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded text-[10px] transition-all cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve & Execute
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Access Reviews Tab */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-4 text-left">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quarterly entitlement certification campaigns</h3>
            <p className="text-[10px] text-slate-400">Continuous auditing of active directory roles to confirm adherence to minimal-privilege policies.</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-3 px-4 text-left">Campaign Name</th>
                    <th className="py-3 px-4 text-left">Employee Under Review</th>
                    <th className="py-3 px-4 text-left">Role/Privilege Audited</th>
                    <th className="py-3 px-4 text-left">Campaign Expiration</th>
                    <th className="py-3 px-4 text-left">Certification Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {reviews.map(rev => {
                    const empName = rev.history[0]?.employeeName || 'All Staff';
                    const perm = rev.history[0]?.permission || 'Assigned Privileges';
                    const dept = 'Compliance'; // default department

                    return (
                      <tr key={rev.id} className="hover:bg-slate-50/20 transition-all">
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{rev.title}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">{rev.id}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{empName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{dept}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          <span className="font-mono text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                            {perm}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          <span className="font-mono text-slate-400">{new Date(rev.dueDate).toLocaleDateString()}</span>
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          {rev.status === 'In Progress' && (
                            <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                              Review Needed
                            </span>
                          )}
                          {rev.status === 'Completed' && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                              Recertified Approved
                            </span>
                          )}
                          {rev.status === 'Overdue' && (
                            <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-200 font-bold line-through">
                              Access Revoked
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {rev.status === 'In Progress' ? (
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleReviewCertification(rev, 'Revoked')}
                                className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                              >
                                Revoke Access
                              </button>
                              <button
                                onClick={() => handleReviewCertification(rev, 'Certified')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer shadow-sm"
                              >
                                Certify Access
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Reviewed by {rev.reviewer}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Global Security Logs Tab */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4 text-left">
          {/* Logs Header & Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search audit events by Actor, target object, or reason..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none placeholder-slate-400 shadow-inner bg-slate-50/50"
              />
            </div>
            
            <div className="flex flex-col text-left gap-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400">Event Class</span>
              <select 
                value={logActionFilter} 
                onChange={(e) => setLogActionFilter(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-xs font-semibold text-slate-600"
              >
                {logActions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Audit Logs Table (2/3) */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4 text-left">Event Signature ID</th>
                      <th className="py-3 px-4 text-left">Security Actor</th>
                      <th className="py-3 px-4 text-left">Action Triggered</th>
                      <th className="py-3 px-4 text-left">Target Resource</th>
                      <th className="py-3 px-4 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-mono">
                          No audit telemetry log records match current search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map(log => {
                        const isSelected = selectedDetailedLog?.id === log.id;
                        return (
                          <tr 
                            key={log.id} 
                            onClick={() => setSelectedDetailedLog(log)}
                            className={`hover:bg-blue-50/25 cursor-pointer transition-all ${isSelected ? 'bg-blue-50/50 font-semibold border-l-2 border-l-blue-600' : ''}`}
                          >
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-400 text-left">{log.id}</td>
                            <td className="py-3 px-4 text-slate-700 font-bold text-left">{log.actor}</td>
                            <td className="py-3 px-4 text-left">
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-700 text-left">{log.target}</td>
                            <td className="py-3 px-4 font-mono text-slate-400 text-left">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Log Side Panel (1/3) */}
            <div className="xl:col-span-1">
              {selectedDetailedLog ? (
                <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4 text-xs font-semibold text-slate-600">
                  <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Telemetry Payload</span>
                      <h4 className="font-bold text-slate-800">Event Details</h4>
                    </div>
                    <button 
                      onClick={() => setSelectedDetailedLog(null)}
                      className="p-1 rounded hover:bg-slate-50 text-slate-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-left">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Event Hash Code</span>
                        <span className="font-mono text-slate-700 block text-[10px] break-all">{selectedDetailedLog.id}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Operator Account</span>
                        <span className="text-slate-700 block">{selectedDetailedLog.actor}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Action Type</span>
                        <span className="font-mono text-[10px] text-blue-600 block">{selectedDetailedLog.action}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Target Resource</span>
                        <span className="text-slate-700 block font-mono">{selectedDetailedLog.target}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/50 p-2 border border-slate-100 rounded text-left">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Previous Value</span>
                        <span className="text-slate-600 font-mono truncate block">{selectedDetailedLog.prevValue || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">New Assigned Value</span>
                        <span className="text-emerald-700 font-mono truncate block">{selectedDetailedLog.newValue || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1 text-left">Administrative Justification</span>
                      <p className="p-2.5 bg-blue-50 text-blue-800 rounded border border-blue-100 font-semibold leading-relaxed text-[10px] text-left">
                        "{selectedDetailedLog.reason}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono space-y-1 text-left">
                      <div className="flex justify-between">
                        <span>Terminal/Context:</span>
                        <span>{selectedDetailedLog.where}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs font-semibold h-64 flex flex-col justify-center items-center">
                  <Clipboard className="w-10 h-10 text-slate-300 mb-2" />
                  Select an audit telemetry payload signature from the left-hand grid to dissect the cryptographic actor properties.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Workflow Override Maker-Checker Confirmation Modal */}
      {selectedWorkflow && approvalDecision && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-left">
            <div className="flex items-center gap-3 text-emerald-600 mb-3">
              <Shield className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider">{approvalDecision} Decision Signature</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              You are completing a dual-signature (maker-checker) approval checklist for <b>{selectedWorkflow.actionType}</b> on <b>{getWorkflowTarget(selectedWorkflow)}</b>. This overrides active compliance safety triggers. Please write a mandatory certification note.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Decision Certification Notes</label>
                <textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="E.g., Verified supervisor request ticket SUP-801. Action approved under operational governance standard 4."
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded bg-slate-50 h-20 outline-none text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  onClick={() => {
                    setSelectedWorkflow(null);
                    setApprovalDecision(null);
                  }}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 font-semibold rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmWorkflowDecision}
                  disabled={!decisionReason.trim()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded cursor-pointer shadow-sm"
                >
                  Verify Dual Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
