import React, { useState } from 'react';
import { 
  Lock, Key, Globe, Clock, ShieldCheck, ShieldAlert, Monitor, AlertTriangle,
  Plus, Trash2, Check, RefreshCw, Layers, Shield, HelpCircle, X
} from 'lucide-react';

interface IamAccessPoliciesProps {
  onAddAuditLog: (action: string, target: string, prevValue: string, newValue: string, reason: string) => void;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function IamAccessPolicies({ onAddAuditLog, onToast }: IamAccessPoliciesProps) {
  // 1. Access Policies State
  const [policies, setPolicies] = useState({
    businessHours: { enabled: true, start: '07:00', end: '21:00', timezone: 'UTC', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    countryRestrictions: { enabled: true, allowed: ['GB', 'US', 'DE', 'FR', 'CA', 'SG'], blocked: ['RU', 'KP', 'IR', 'SY'] },
    ipAllowList: { enabled: true, cidrs: ['192.168.1.0/24', '10.0.0.0/8', '203.0.113.50/32'] },
    deviceTrust: { enabled: true, level: 'High' },
    riskBasedAuth: { enabled: true, level: 'Standard' },
    sessionTimeout: { maxDuration: 480, idleTimeout: 30 }
  });

  // 2. MFA Management State
  const [mfaConfig, setMfaConfig] = useState({
    enforceMfa: true,
    authenticatorApp: true,
    hardwareKey: true,
    smsFallback: false,
    emailFallback: false
  });
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  // 3. Password Policies State
  const [passPolicy, setPassPolicy] = useState({
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    expirationDays: 90,
    historySize: 5
  });

  // State helpers
  const [newCidr, setNewCidr] = useState('');
  const [newCountry, setNewCountry] = useState('');

  // Policy handlers
  const handleTogglePolicy = (key: keyof typeof policies) => {
    const prevVal = policies[key].enabled ? 'Enabled' : 'Disabled';
    const newVal = !policies[key].enabled ? 'Enabled' : 'Disabled';
    
    setPolicies(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled
      }
    }));

    onToast('Policy Shifted', `Access control parameter ${String(key)} is now ${newVal}.`, 'info');
    onAddAuditLog(`policy.toggle.${String(key)}`, 'Access Policies', prevVal, newVal, 'Administrative security rule adjustments');
  };

  const handleAddCidr = () => {
    if (!newCidr) return;
    setPolicies(prev => ({
      ...prev,
      ipAllowList: {
        ...prev.ipAllowList,
        cidrs: [...prev.ipAllowList.cidrs, newCidr]
      }
    }));
    onToast('IP CIDR Appended', `Network path ${newCidr} has been cataloged.`, 'success');
    onAddAuditLog('policy.ip_add', 'IP Allow List', 'List updated', newCidr, 'Network perimeter hardening');
    setNewCidr('');
  };

  const handleRemoveCidr = (cidr: string) => {
    setPolicies(prev => ({
      ...prev,
      ipAllowList: {
        ...prev.ipAllowList,
        cidrs: prev.ipAllowList.cidrs.filter(c => c !== cidr)
      }
    }));
    onToast('IP CIDR Removed', `Network path ${cidr} detached from allow list.`, 'warning');
    onAddAuditLog('policy.ip_remove', 'IP Allow List', cidr, 'Deleted', 'Network perimeter policy revision');
  };

  const handleAddBlockedCountry = () => {
    if (!newCountry) return;
    const countryUpper = newCountry.toUpperCase();
    if (policies.countryRestrictions.blocked.includes(countryUpper)) return;
    setPolicies(prev => ({
      ...prev,
      countryRestrictions: {
        ...prev.countryRestrictions,
        blocked: [...prev.countryRestrictions.blocked, countryUpper]
      }
    }));
    onToast('Country Blacklisted', `${countryUpper} appended to geographic restrictions blocklist.`, 'warning');
    onAddAuditLog('policy.geo_add', 'Geographic Rules', 'Updated', countryUpper, 'Geofencing parameters adjusted');
    setNewCountry('');
  };

  const handleRemoveBlockedCountry = (country: string) => {
    setPolicies(prev => ({
      ...prev,
      countryRestrictions: {
        ...prev.countryRestrictions,
        blocked: prev.countryRestrictions.blocked.filter(c => c !== country)
      }
    }));
    onToast('Country Restored', `${country} detached from geographic restrictions blocklist.`, 'success');
    onAddAuditLog('policy.geo_remove', 'Geographic Rules', country, 'Restored', 'Geofencing parameters revised');
  };

  // MFA Handlers
  const handleToggleMfaConfig = (key: keyof typeof mfaConfig) => {
    const prevVal = mfaConfig[key] ? 'On' : 'Off';
    const newVal = !mfaConfig[key] ? 'On' : 'Off';
    setMfaConfig(prev => ({ ...prev, [key]: !prev[key] }));
    onToast('MFA Setup Updated', `Multi-factor mechanism ${String(key)} is now ${newVal}.`, 'info');
    onAddAuditLog(`mfa.toggle.${String(key)}`, 'MFA Security config', prevVal, newVal, 'Adjusting workforce sign-in protocols');
  };

  const generateRecoveryCodes = () => {
    const codes = Array.from({ length: 8 }, () => Math.floor(100000 + Math.random() * 900000).toString());
    setGeneratedCodes(codes);
    onToast('Backup Codes Generated', 'Emergency disaster recovery bypass tokens updated.', 'success');
  };

  // PassPolicy Handlers
  const handleUpdatePassPolicy = (key: keyof typeof passPolicy, val: any) => {
    const prevVal = JSON.stringify(passPolicy[key]);
    setPassPolicy(prev => ({ ...prev, [key]: val }));
    onToast('Password Policy Adjusted', `Rule ${String(key)} has been altered to ${val}.`, 'success');
    onAddAuditLog(`policy.password.${String(key)}`, 'Password Rules', prevVal, String(val), 'Corporate compliance password parameter adjust');
  };

  return (
    <div id="iam-policies-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      {/* Column 1: Access Policies (Geofencing, IP Allow Lists, Business Hours) */}
      <div className="space-y-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Dynamic Access Controls</h3>
            <p className="text-[11px] text-slate-400">Apply perimeter guardrails based on geography, IP path, and office hours.</p>
          </div>

          {/* Business Hours Policy */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">Office Business Hours Constraint</span>
              </div>
              <button
                onClick={() => handleTogglePolicy('businessHours')}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${policies.businessHours.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${policies.businessHours.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            
            {policies.businessHours.enabled && (
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 pt-1 border-t border-slate-200/50">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Shift Starts</span>
                  <input
                    type="time"
                    value={policies.businessHours.start}
                    onChange={(e) => setPolicies(prev => ({ ...prev, businessHours: { ...prev.businessHours, start: e.target.value } }))}
                    className="w-full mt-0.5 p-1 border rounded bg-white text-[11px]"
                  />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Shift Closes</span>
                  <input
                    type="time"
                    value={policies.businessHours.end}
                    onChange={(e) => setPolicies(prev => ({ ...prev, businessHours: { ...prev.businessHours, end: e.target.value } }))}
                    className="w-full mt-0.5 p-1 border rounded bg-white text-[11px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* IP Allow List */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700">IP Whitelist / VPN Perimeter</span>
              </div>
              <button
                onClick={() => handleTogglePolicy('ipAllowList')}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${policies.ipAllowList.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${policies.ipAllowList.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {policies.ipAllowList.enabled && (
              <div className="space-y-2 pt-1 border-t border-slate-200/50 text-[11px]">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="E.g., 198.51.100.0/24"
                    value={newCidr}
                    onChange={(e) => setNewCidr(e.target.value)}
                    className="flex-1 p-1.5 border rounded bg-white font-mono text-[10px]"
                  />
                  <button
                    onClick={handleAddCidr}
                    className="bg-blue-600 text-white font-bold px-2 rounded hover:bg-blue-700 cursor-pointer text-[10px]"
                  >
                    Add
                  </button>
                </div>
                
                <div className="max-h-24 overflow-y-auto space-y-1 bg-white p-2 rounded border border-slate-100">
                  {policies.ipAllowList.cidrs.map(c => (
                    <div key={c} className="flex justify-between items-center bg-slate-50 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-600 border border-slate-100">
                      <span>{c}</span>
                      <button 
                        onClick={() => handleRemoveCidr(c)} 
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Geographic Blocklist */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Geographic Restriction Blocklist</span>
              </div>
              <button
                onClick={() => handleTogglePolicy('countryRestrictions')}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${policies.countryRestrictions.enabled ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${policies.countryRestrictions.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {policies.countryRestrictions.enabled && (
              <div className="space-y-2 pt-1 border-t border-slate-200/50 text-[11px]">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter ISO country code (e.g., KP)"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    maxLength={2}
                    className="flex-1 p-1.5 border rounded bg-white font-mono text-[10px]"
                  />
                  <button
                    onClick={handleAddBlockedCountry}
                    className="bg-emerald-600 text-white font-bold px-2 rounded hover:bg-emerald-700 cursor-pointer text-[10px]"
                  >
                    Block
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-1 bg-white p-2 rounded border border-slate-100 max-h-24 overflow-y-auto">
                  {policies.countryRestrictions.blocked.map(cn => (
                    <span key={cn} className="text-[10px] font-mono bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-1">
                      {cn}
                      <button 
                        onClick={() => handleRemoveBlockedCountry(cn)} 
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Column 2: MFA Regulations & Disaster Recovery */}
      <div className="space-y-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Multi-Factor Authentications</h3>
            <p className="text-[11px] text-slate-400">Configure global authentication challenges and cryptographic keys.</p>
          </div>

          <div className="space-y-3.5">
            {/* Global Mandate */}
            <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">Mandatory MFA Enrollment</span>
                <span className="text-[10px] text-slate-400">Force all directory members to bind an MFA device on signup.</span>
              </div>
              <button
                onClick={() => handleToggleMfaConfig('enforceMfa')}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${mfaConfig.enforceMfa ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${mfaConfig.enforceMfa ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Allowed Authentication Channels */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allowed Authentication Protocols</span>
              
              <div className="divide-y divide-slate-100 border rounded-lg overflow-hidden bg-slate-50 text-xs">
                {[
                  { key: 'authenticatorApp', name: 'Software OTP Apps (Google Authenticator, Duo)', desc: 'Generate high-entropy SHA256 rotating secret codes.' },
                  { key: 'hardwareKey', name: 'FIDO2 / WebAuthn Hardware Keys', desc: 'Secure USB/NFC hardware key signatures.' },
                  { key: 'smsFallback', name: 'SMS Mobile OTP Fallback', desc: 'Send rotating code via cellular gateway (not recommended).' },
                  { key: 'emailFallback', name: 'Email Passcode Override', desc: 'Verify via registered workspace mailbox.' }
                ].map((item) => (
                  <div key={item.key} className="p-3 flex items-start justify-between gap-3 text-left">
                    <div>
                      <span className="font-bold text-slate-700 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{item.desc}</span>
                    </div>
                    <button
                      onClick={() => handleToggleMfaConfig(item.key as any)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 mt-0.5 ${mfaConfig[item.key as keyof typeof mfaConfig] ? 'bg-blue-600' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${mfaConfig[item.key as keyof typeof mfaConfig] ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Disaster Recovery codes */}
            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Emergency Recovery Bypass</span>
              <p className="text-[10px] text-slate-500">Generate high-security break-glass recovery tokens for emergency administrative lockouts.</p>
              
              <button
                onClick={generateRecoveryCodes}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate Bypass Codes
              </button>

              {generatedCodes.length > 0 && (
                <div className="grid grid-cols-2 gap-1 bg-white p-2.5 rounded border border-amber-200/80 font-mono text-[10px] text-slate-600 text-center">
                  {generatedCodes.map((c, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 py-0.5 rounded font-bold">
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Password Policies */}
      <div className="space-y-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Workforce Password Guidelines</h3>
            <p className="text-[11px] text-slate-400">Implement NIST SP 800-63B standards on corporate directory accounts.</p>
          </div>

          <div className="space-y-4 text-xs font-semibold text-slate-600">
            {/* Minimum Length */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-700">Minimum Character Length</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{passPolicy.minLength} chars</span>
              </div>
              <input
                type="range"
                min="8"
                max="24"
                value={passPolicy.minLength}
                onChange={(e) => handleUpdatePassPolicy('minLength', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Expiration Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-700">Forced Password Expiry Interval</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{passPolicy.expirationDays} days</span>
              </div>
              <input
                type="range"
                min="30"
                max="180"
                step="30"
                value={passPolicy.expirationDays}
                onChange={(e) => handleUpdatePassPolicy('expirationDays', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Password History Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-700">Reuse Prevention History Size</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{passPolicy.historySize} passwords</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={passPolicy.historySize}
                onChange={(e) => handleUpdatePassPolicy('historySize', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Character Requirements */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Complexity Requirements</span>
              
              {[
                { key: 'requireUppercase', label: 'Require Uppercase Letters (A-Z)' },
                { key: 'requireLowercase', label: 'Require Lowercase Letters (a-z)' },
                { key: 'requireNumbers', label: 'Require Numerical Characters (0-9)' },
                { key: 'requireSymbols', label: 'Require Special Characters (!@#$%^&*)' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-600 font-medium">{item.label}</span>
                  <button
                    onClick={() => handleUpdatePassPolicy(item.key as any, !passPolicy[item.key as keyof typeof passPolicy])}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${passPolicy[item.key as keyof typeof passPolicy] ? 'bg-blue-600' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${passPolicy[item.key as keyof typeof passPolicy] ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Security Note */}
            <div className="p-3 bg-blue-50 text-blue-800 rounded-lg flex items-start gap-2 text-[10px] leading-relaxed font-semibold">
              <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5 text-blue-600" />
              <div>
                NIST SP 800-63B warns against arbitrary complexity rules without multi-factor tokens. Combining 12+ character lengths with enforced MFA provides optimal workforce threat defense.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
