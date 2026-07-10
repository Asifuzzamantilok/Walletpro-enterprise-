import React, { useState } from 'react';
import { 
  Shield, Key, Layers, Plus, Edit, Trash2, Check, X, ChevronRight, HelpCircle, AlertTriangle
} from 'lucide-react';
import { IAMRole, IAMPermission, IAMPermissionGroup } from './iamMockData';

interface IamRolePermissionProps {
  roles: IAMRole[];
  permissions: IAMPermission[];
  permissionGroups: IAMPermissionGroup[];
  onAddRole: (newRole: IAMRole) => void;
  onUpdateRole: (roleName: string, updates: Partial<IAMRole>) => void;
  onAddAuditLog: (action: string, target: string, prevValue: string, newValue: string, reason: string) => void;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function IamRolePermission({ 
  roles, permissions, permissionGroups, onAddRole, onUpdateRole, onAddAuditLog, onToast 
}: IamRolePermissionProps) {
  
  // Selected state
  const [selectedRole, setSelectedRole] = useState<IAMRole | null>(roles[0] || null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'roles' | 'groups' | 'permissions'>('roles');

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleInherits, setNewRoleInherits] = useState('');
  const [selectedGroupsForNewRole, setSelectedGroupsForNewRole] = useState<string[]>([]);
  const [selectedPermissionsForNewRole, setSelectedPermissionsForNewRole] = useState<string[]>([]);

  // Toggle group selection for role creation
  const handleToggleGroupForNew = (groupName: string) => {
    setSelectedGroupsForNewRole(prev => 
      prev.includes(groupName) ? prev.filter(g => g !== groupName) : [...prev, groupName]
    );
  };

  // Toggle permission selection for role creation
  const handleTogglePermissionForNew = (permName: string) => {
    setSelectedPermissionsForNewRole(prev => 
      prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]
    );
  };

  // Create role execute
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      onToast('Role Validation Failed', 'Please input a unique Role name.', 'warning');
      return;
    }
    if (roles.some(r => r.name.toLowerCase() === newRoleName.toLowerCase())) {
      onToast('Role Exists', 'A role with this specific name is already registered.', 'warning');
      return;
    }

    const createdRole: IAMRole = {
      name: newRoleName,
      description: newRoleDesc,
      inheritsFrom: newRoleInherits || undefined,
      permissionGroups: selectedGroupsForNewRole,
      directPermissions: selectedPermissionsForNewRole,
      isCustom: true
    };

    onAddRole(createdRole);
    onToast('Role Created', `Custom role "${newRoleName}" registered and active.`, 'success');
    onAddAuditLog('role.create', newRoleName, 'Non-existent', 'Custom Role', `Admin created role inheriting from ${newRoleInherits || 'None'}`);

    // Reset Form
    setNewRoleName('');
    setNewRoleDesc('');
    setNewRoleInherits('');
    setSelectedGroupsForNewRole([]);
    setSelectedPermissionsForNewRole([]);
    setIsCreatingRole(false);
    setSelectedRole(createdRole);
  };

  // Toggle an existing group on selected role
  const handleToggleGroupOnSelected = (groupName: string) => {
    if (!selectedRole) return;
    const isAssigned = selectedRole.permissionGroups.includes(groupName);
    const updatedGroups = isAssigned 
      ? selectedRole.permissionGroups.filter(g => g !== groupName)
      : [...selectedRole.permissionGroups, groupName];

    onUpdateRole(selectedRole.name, { permissionGroups: updatedGroups });
    onToast('Role Group Modified', `Permission group "${groupName}" updated on role "${selectedRole.name}".`, 'info');
    onAddAuditLog('role.update_groups', selectedRole.name, JSON.stringify(selectedRole.permissionGroups), JSON.stringify(updatedGroups), 'Dynamic role structure override');

    setSelectedRole(prev => prev ? { ...prev, permissionGroups: updatedGroups } : null);
  };

  return (
    <div id="iam-roles-permissions-container" className="space-y-6">
      {/* Tab select bar */}
      <div className="flex border-b border-slate-200 text-xs font-bold text-slate-500 gap-4 mb-2">
        {[
          { id: 'roles', label: 'Inheritable RBAC Roles', count: roles.length },
          { id: 'groups', label: 'Reusable Permission Groups', count: permissionGroups.length },
          { id: 'permissions', label: 'Granular API Permissions', count: permissions.length }
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

      {/* Main Section: Roles */}
      {activeSubTab === 'roles' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
          
          {/* Roles Directory List */}
          <div className="xl:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Roles Registry</h3>
                <p className="text-[10px] text-slate-400">Standard and customized enterprise credentials</p>
              </div>
              <button
                onClick={() => setIsCreatingRole(true)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Custom Role
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden max-h-[500px] overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {roles.map(role => {
                  const isSelected = selectedRole?.name === role.name;
                  return (
                    <div
                      key={role.name}
                      onClick={() => {
                        setSelectedRole(role);
                        setIsCreatingRole(false);
                      }}
                      className={`p-3.5 cursor-pointer hover:bg-blue-50/20 transition-all ${isSelected ? 'bg-blue-50/40 border-l-2 border-l-blue-600 font-semibold' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{role.name}</span>
                        {role.isCustom && (
                          <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold uppercase">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-1">{role.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Role Detail View or Custom Role Creation Form */}
          <div className="xl:col-span-2">
            {isCreatingRole ? (
              // Creation Form
              <form onSubmit={handleCreateRole} className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-slate-800">Construct Custom Workforce Role</h3>
                    <p className="text-[11px] text-slate-400">Map custom credentials, inheritances, and boundary overlays.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsCreatingRole(false)}
                    className="p-1 rounded hover:bg-slate-50 text-slate-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Role Identifier Name</label>
                    <input
                      type="text"
                      placeholder="E.g., Junior compliance investigator"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      required
                      className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Inherit Permissions From</label>
                    <select
                      value={newRoleInherits}
                      onChange={(e) => setNewRoleInherits(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                    >
                      <option value="">None (Base Role)</option>
                      {roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Functional Description</label>
                    <input
                      type="text"
                      placeholder="Brief corporate context of this workforce credentials template"
                      value={newRoleDesc}
                      onChange={(e) => setNewRoleDesc(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                    />
                  </div>

                  {/* Assign Permission Groups Checklist */}
                  <div className="space-y-1 md:col-span-2 pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Assign Reusable Permission Groups</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {permissionGroups.map(pg => {
                        const isChecked = selectedGroupsForNewRole.includes(pg.name);
                        return (
                          <div
                            key={pg.name}
                            onClick={() => handleToggleGroupForNew(pg.name)}
                            className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2 select-none transition-all ${isChecked ? 'bg-blue-50 border-blue-200 font-bold' : 'bg-slate-50/50 border-slate-150 hover:bg-slate-50'}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="mt-0.5"
                            />
                            <div className="text-left">
                              <span className="text-[11px] text-slate-700 block leading-tight">{pg.name}</span>
                              <span className="text-[9px] text-slate-400 font-medium block mt-0.5 leading-none">{pg.permissions.length} perms</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreatingRole(false)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 font-semibold rounded hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded cursor-pointer text-xs shadow-sm"
                  >
                    Deploy Custom Role
                  </button>
                </div>
              </form>
            ) : selectedRole ? (
              // Detailed Role View
              <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm text-left space-y-4">
                <div className="pb-3 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{selectedRole.name} Overview</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{selectedRole.description}</p>
                  </div>
                  {selectedRole.inheritsFrom && (
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Inherits From</span>
                      <span className="text-[11px] font-bold text-blue-600 font-mono">{selectedRole.inheritsFrom}</span>
                    </div>
                  )}
                </div>

                {/* Sub components inside details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-600">
                  
                  {/* Permission Groups management inside Selected Role */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Reusable Groups</span>
                    
                    <div className="space-y-1.5">
                      {permissionGroups.map(pg => {
                        const isAssigned = selectedRole.permissionGroups.includes(pg.name);
                        return (
                          <div 
                            key={pg.name}
                            onClick={() => handleToggleGroupOnSelected(pg.name)}
                            className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${isAssigned ? 'bg-indigo-50/50 border-indigo-200 font-bold' : 'bg-slate-50/40 border-slate-100 hover:bg-slate-50 text-slate-400'}`}
                          >
                            <div className="text-left">
                              <span className={`text-[11px] block leading-none ${isAssigned ? 'text-indigo-800' : 'text-slate-500 font-medium'}`}>{pg.name} Group</span>
                              <span className="text-[9px] text-slate-400 block mt-1 font-medium">{pg.permissions.length} compiled rules</span>
                            </div>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isAssigned ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                              {isAssigned && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Inherited compiled granular permissions overview */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compiled Active API Grants</span>
                    
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg max-h-80 overflow-y-auto space-y-3">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Direct Specific Permissions</span>
                        {selectedRole.directPermissions.length === 0 ? (
                          <span className="text-[10px] text-slate-400 font-medium block italic">No direct overlays assigned</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {selectedRole.directPermissions.map(pm => (
                              <span key={pm} className="text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.2 rounded font-bold">
                                {pm}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-200/50 pt-2">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Inherited Permissions from Groups</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedRole.permissionGroups.map(gp => {
                            const groupPerms = permissionGroups.find(p => p.name === gp)?.permissions || [];
                            return groupPerms.map(pm => (
                              <span key={`${gp}-${pm}`} className="text-[9px] font-mono bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-medium">
                                {pm}
                              </span>
                            ));
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs font-semibold h-64 flex flex-col justify-center items-center">
                Select a role from the registry to manage inheritances, overlays, and permissions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permission groups overview tab */}
      {activeSubTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {permissionGroups.map(group => (
            <div key={group.name} id={`group-${group.name}`} className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">{group.name} Group</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Reusable packet of permissions mapping to standard workforce segments.</p>
              </div>

              <div className="pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-mono space-y-1 max-h-28 overflow-y-auto">
                <span className="font-semibold text-slate-500 uppercase block text-[8px] tracking-wider mb-1">Active Rules:</span>
                {group.permissions.map(p => (
                  <div key={p} className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permissions definition lists */}
      {activeSubTab === 'permissions' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-3 px-4">Permission Name</th>
                  <th className="py-3 px-4">System Scope category</th>
                  <th className="py-3 px-4">Functional Capability</th>
                  <th className="py-3 px-4">Security Level Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {permissions.map(pm => {
                  const isHighRisk = ['wallets.freeze', 'api.manage', 'permission.manage', 'wallets.debit'].includes(pm.name);
                  return (
                    <tr key={pm.name} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{pm.name}</td>
                      <td className="py-2.5 px-4 text-slate-500">{pm.category}</td>
                      <td className="py-2.5 px-4 text-slate-600">{pm.description}</td>
                      <td className="py-2.5 px-4">
                        {isHighRisk ? (
                          <span className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase border border-red-100 flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            High Risk Action
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase border border-slate-200 w-max block">
                            Standard
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
      )}
    </div>
  );
}
