import React, { useState } from 'react';
import { 
  Building, Users, Mail, Clock, ShieldAlert, CheckCircle2, Plus, Trash2, 
  Trash, Send, X, Laptop, Monitor, Smartphone, Cpu, ShieldCheck
} from 'lucide-react';
import { IAMInvitation, IAMSession, IAMDevice, StaffMember } from './iamMockData';

interface IamInfrastructureProps {
  invitations: IAMInvitation[];
  sessions: IAMSession[];
  devices: IAMDevice[];
  staff: StaffMember[];
  onAddInvitation: (inv: IAMInvitation) => void;
  onUpdateInvitation: (id: string, updates: Partial<IAMInvitation>) => void;
  onAddAuditLog: (action: string, target: string, prevValue: string, newValue: string, reason: string) => void;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function IamInfrastructure({
  invitations, sessions, devices, staff, onAddInvitation, onUpdateInvitation, onAddAuditLog, onToast
}: IamInfrastructureProps) {

  const [activeSubTab, setActiveSubTab] = useState<'invitations' | 'departments' | 'teams'>('invitations');
  
  // Invitation Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Operations Agent');
  const [inviteDept, setInviteDept] = useState('Operations');
  const [inviteExpiry, setInviteExpiry] = useState('72'); // hours

  // Teams State
  const [teamsList, setTeamsList] = useState([
    { id: 'TEAM-OPS-A', name: 'Fiat Liquidity Team', department: 'Operations', manager: 'Marcus Vance', members: 4 },
    { id: 'TEAM-COMP-B', name: 'AML Screening Unit', department: 'Compliance', manager: 'Elena Rostova', members: 3 },
    { id: 'TEAM-FRAUD-C', name: 'Chargeback Dispute Squad', department: 'Fraud', manager: 'Sarah Jenkins', members: 5 },
    { id: 'TEAM-FIN-D', name: 'Corporate Reconciliation', department: 'Finance', manager: 'David Miller', members: 3 }
  ]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDept, setNewTeamDept] = useState('Operations');
  const [newTeamManager, setNewTeamManager] = useState('');

  // Dispatch Invitation
  const handleSendInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      onToast('Validation Failed', 'Please input a valid work email address.', 'warning');
      return;
    }

    const newInvite: IAMInvitation = {
      id: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
      email: inviteEmail,
      role: inviteRole,
      department: inviteDept,
      status: 'Pending',
      invitedAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + parseInt(inviteExpiry) * 60 * 60 * 1000).toISOString(),
      invitedBy: 'Super Administrator',
      auditTrail: []
    };

    onAddInvitation(newInvite);
    onToast('Invitation Dispatched', `A registration handshake token has been dispatched to ${inviteEmail}.`, 'success');
    onAddAuditLog('invitation.send', inviteEmail, 'None', 'Pending', `Invited to join department ${inviteDept} under role ${inviteRole}`);
    
    setInviteEmail('');
  };

  const handleCancelInvitation = (id: string, email: string) => {
    onUpdateInvitation(id, { status: 'Expired' });
    onToast('Invitation Revoked', `Registration token for ${email} has been cancelled.`, 'warning');
    onAddAuditLog('invitation.cancel', email, 'Pending', 'Cancelled', 'Forced invalidation of outstanding link');
  };

  // Create Team
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamManager.trim()) {
      onToast('Validation Failed', 'Please supply a Team Name and Team Manager.', 'warning');
      return;
    }

    const createdTeam = {
      id: `TEAM-${newTeamDept.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: newTeamName,
      department: newTeamDept,
      manager: newTeamManager,
      members: 1
    };

    setTeamsList(prev => [...prev, createdTeam]);
    onToast('Team Desk Registered', `New functional cell "${newTeamName}" established.`, 'success');
    onAddAuditLog('team.create', newTeamName, 'Non-existent', 'Active Team Desk', `Created new team desk under supervisor ${newTeamManager}`);

    setNewTeamName('');
    setNewTeamManager('');
  };

  return (
    <div id="iam-infrastructure-container" className="space-y-6">
      {/* Sub tabs selection */}
      <div className="flex border-b border-slate-200 text-xs font-bold text-slate-500 gap-4 mb-2">
        {[
          { id: 'invitations', label: 'Workforce Onboarding', count: invitations.filter(i => i.status === 'Pending').length },
          { id: 'departments', label: 'Corporate Entity Map', count: 10 },
          { id: 'teams', label: 'Functional Team Desks', count: teamsList.length }
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

      {/* 1. Invitations / Onboarding */}
      {activeSubTab === 'invitations' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
          
          {/* Dispatcher Form */}
          <div className="xl:col-span-1">
            <form onSubmit={handleSendInvitation} className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dispatch operator invitation</h3>
                <p className="text-[10px] text-slate-400">Generate secure signup tokens linked to directory roles</p>
              </div>

              <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Workplace Email</label>
                  <input
                    type="email"
                    placeholder="E.g., name@walletpro.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Directory Group / Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                  >
                    <option value="Operations Agent">Operations Agent</option>
                    <option value="Compliance Officer">Compliance Officer</option>
                    <option value="Fraud Analyst">Fraud Analyst</option>
                    <option value="Finance Officer">Finance Officer</option>
                    <option value="Support Agent">Support Agent</option>
                    <option value="Security Analyst">Security Analyst</option>
                    <option value="Developer">Developer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Department Assignment</label>
                  <select
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Finance">Finance</option>
                    <option value="Support">Support</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Link Expiration Frequency</label>
                  <select
                    value={inviteExpiry}
                    onChange={(e) => setInviteExpiry(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                  >
                    <option value="24">24 Hours (NIST Standard)</option>
                    <option value="72">72 Hours (Default Weekend Buffer)</option>
                    <option value="168">7 Days (Emergency Exception)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors cursor-pointer shadow-sm mt-2"
                >
                  <Send className="w-4 h-4" />
                  Dispatch Handshake Token
                </button>
              </div>
            </form>
          </div>

          {/* Invitation Log Grid */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Invitations Log</h3>
            
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4">Invitee mailbox</th>
                      <th className="py-3 px-4">Target Role</th>
                      <th className="py-3 px-4">Expiration</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {invitations.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/20">
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{inv.email}</span>
                            <span className="text-[9px] font-mono text-slate-400 font-semibold">{inv.id}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700">{inv.role}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{inv.department}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-slate-400">{new Date(inv.expiryDate).toLocaleString()}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {inv.status === 'Pending' && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                              Awaiting Signup
                            </span>
                          )}
                          {inv.status === 'Accepted' && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                              Accepted Joined
                            </span>
                          )}
                          {inv.status === 'Expired' && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                              Cancelled/Expired
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {inv.status === 'Pending' && (
                            <button
                              onClick={() => handleCancelInvitation(inv.id, inv.email)}
                              className="text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Departments list */}
      {activeSubTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          {[
            { name: 'Executive', head: 'CEO Board', staff: staff.filter(s => s.department === 'Executive').length, teams: 1, desc: 'Operational strategic corporate oversight.' },
            { name: 'Operations', head: 'Marcus Vance', staff: staff.filter(s => s.department === 'Operations').length, teams: 2, desc: 'Main transactional and wallet operations desk.' },
            { name: 'Compliance', head: 'Elena Rostova', staff: staff.filter(s => s.department === 'Compliance').length, teams: 1, desc: 'Corporate regulatory screening, PEP, and audits.' },
            { name: 'Fraud', head: 'Sarah Jenkins', staff: staff.filter(s => s.department === 'Fraud').length, teams: 2, desc: 'Disputes, chargebacks, and behavioral risk monitoring.' },
            { name: 'Finance', head: 'David Miller', staff: staff.filter(s => s.department === 'Finance').length, teams: 1, desc: 'General ledger reconciliations and bank settling.' },
            { name: 'Treasury', head: 'CFO Team', staff: staff.filter(s => s.department === 'Treasury').length, teams: 1, desc: 'Corporate liquidity thresholds and reserve holdings.' },
            { name: 'Support', head: 'Robert Chen', staff: staff.filter(s => s.department === 'Support').length, teams: 2, desc: 'Client relations and tier ticketing helpdesk.' },
            { name: 'Engineering', head: 'CTO Office', staff: staff.filter(s => s.department === 'Engineering').length, teams: 3, desc: 'Core infrastructure security development.' },
            { name: 'Platform', head: 'Platform Lead', staff: 2, teams: 1, desc: 'Server environments and API key settings.' },
            { name: 'Security', head: 'Security Chief', staff: 3, teams: 1, desc: 'Perimeter auditing, keys, and policy overrides.' }
          ].map(dept => (
            <div key={dept.name} className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Building className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">{dept.name} Department</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">{dept.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-50 text-[11px] text-slate-500 font-semibold space-y-1 bg-slate-50 p-2 rounded">
                <div className="flex justify-between">
                  <span>Department Head:</span>
                  <span className="text-slate-700">{dept.head}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Personnel:</span>
                  <span className="font-mono text-slate-700">{dept.staff} members</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Team Desks:</span>
                  <span className="font-mono text-slate-700">{dept.teams} deskgroups</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Team desks creation & list */}
      {activeSubTab === 'teams' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
          
          {/* Create Team Form */}
          <div className="xl:col-span-1">
            <form onSubmit={handleCreateTeam} className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Establish team desk</h3>
                <p className="text-[10px] text-slate-400">Register functional subdivisions under parent departments</p>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-600">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Team Identifier Name</label>
                  <input
                    type="text"
                    placeholder="E.g., High-Value Disputes Unit"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Parent Department</label>
                  <select
                    value={newTeamDept}
                    onChange={(e) => setNewTeamDept(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Finance">Finance</option>
                    <option value="Support">Support</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Supervisor Name</label>
                  <input
                    type="text"
                    placeholder="E.g., Sarah Jenkins"
                    value={newTeamManager}
                    onChange={(e) => setNewTeamManager(e.target.value)}
                    required
                    className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors cursor-pointer shadow-sm mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Establish Team Desk
                </button>
              </div>
            </form>
          </div>

          {/* Teams list Grid */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Functional Team Registry</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamsList.map(team => (
                <div key={team.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow transition-shadow text-left">
                  <div className="pb-2 border-b border-slate-100 mb-3 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 font-semibold">{team.id}</span>
                      <h4 className="text-xs font-bold text-slate-800">{team.name}</h4>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-100">
                      {team.department}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600 font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Desk Supervisor:</span>
                      <span>{team.manager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Operators:</span>
                      <span className="font-mono text-slate-800">{team.members} registered</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
