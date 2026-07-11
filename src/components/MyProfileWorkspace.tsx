import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Camera, Shield, Bell, Eye, EyeOff, Key, Monitor, Smartphone, Globe, 
  Clock, CheckCircle, AlertCircle, Plus, Trash2, KeyRound, Lock, Info, 
  Sparkles, RefreshCw, AlertTriangle, ChevronRight, ShieldCheck, FileText,
  Activity, Laptop, Moon, Sun, Settings
} from 'lucide-react';

interface MyProfileWorkspaceProps {
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
  activeRole: string;
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (theme: 'light' | 'dark' | 'system') => void;
}

export function MyProfileWorkspace({ 
  onToast, 
  activeRole,
  themePreference,
  setThemePreference 
}: MyProfileWorkspaceProps) {
  // Tabs: personal, appearance, notifications, security, activity
  const [activeSubSection, setActiveSubSection] = useState<'personal' | 'appearance' | 'notifications' | 'security' | 'activity'>('personal');

  // PERSONAL INFORMATION STATE
  const [displayName, setDisplayName] = useState('Tilok Mania');
  const [email, setEmail] = useState('tilok.mania@gmail.com');
  const [phone, setPhone] = useState('+44 20 7946 0912');
  const [language, setLanguage] = useState('en-GB');
  const [timezone, setTimezone] = useState('Europe/London');
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  // Profile Picture Upload
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // NOTIFICATION PREFERENCES STATE
  const [notifConfig, setNotifConfig] = useState({
    system: true,
    compliance: true,
    fraud: true,
    security: true,
    operations: true,
    payments: false,
    support: true,
    channels: {
      email: true,
      push: true,
      slack: false,
      sms: false
    }
  });

  // SECURITY SECTION STATES
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 2FA state
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [show2faSetup, setShow2faSetup] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // API Tokens state
  const [apiTokens, setApiTokens] = useState([
    { id: 'tok_1', name: 'ReadOnly Auditor Key', token: 'wp_live_...9a12b', created: '2026-06-15', status: 'Active' },
    { id: 'tok_2', name: 'Slack Alerts Integrator', token: 'wp_live_...77c3e', created: '2026-07-02', status: 'Active' }
  ]);
  const [newTokenName, setNewTokenName] = useState('');
  const [generatedTokenString, setGeneratedTokenString] = useState<string | null>(null);

  // Immutable recent sessions & connected devices
  const [recentSessions] = useState([
    { id: 's1', ip: '82.165.91.12', device: 'Chrome / macOS (Apple Silicon)', location: 'London, United Kingdom', current: true, time: 'Active Now' },
    { id: 's2', ip: '188.40.103.45', device: 'Safari / iPhone 15 Pro', location: 'London, United Kingdom', current: false, time: '2 hours ago' },
    { id: 's3', ip: '82.165.91.12', device: 'Firefox / Windows 11 Enterprise', location: 'London, United Kingdom', current: false, time: '2 days ago' }
  ]);

  const [connectedDevices] = useState([
    { id: 'd1', name: 'Workplace MacBook Pro', type: 'laptop', status: 'Online', lastActive: 'Active Now' },
    { id: 'd2', name: 'Tilok\'s Personal iPhone', type: 'phone', status: 'Online', lastActive: '5 mins ago' }
  ]);

  // Activity history state (Personal log of operations)
  const [userActivityLog, setUserActivityLog] = useState<any[]>([
    { id: 'act-1', action: 'Account Login', details: 'Successful login verified with active MFA', timestamp: 'Today, 06:01 AM', severity: 'info' },
    { id: 'act-2', action: 'Theme Modified', details: 'Adjusted global layout workspace appearance settings', timestamp: 'Today, 05:48 AM', severity: 'info' },
    { id: 'act-3', action: 'API Token Created', details: 'Generated ReadOnly Auditor Key credentials', timestamp: 'Yesterday, 11:22 AM', severity: 'warning' },
    { id: 'act-4', action: 'MFA Setup Checked', details: 'Validated active authenticator certificate rotation', timestamp: '3 days ago', severity: 'info' }
  ]);

  // Handle Drag & Drop for Profile Image
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAvatarPreview(event.target.result as string);
            onToast('Profile Picture Updated', 'New image asset loaded as transient profile preview.', 'success');
          }
        };
        reader.readAsDataURL(file);
      } else {
        onToast('Invalid Asset Type', 'Please provide a valid image file (PNG/JPG).', 'warning');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
          onToast('Profile Picture Updated', 'New image asset loaded as transient profile preview.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save personal info handler
  const handleSavePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPersonal(true);
    setTimeout(() => {
      setIsSavingPersonal(false);
      onToast('Profile Synced Successfully', 'Personal configuration changes committed to storage database.', 'success');
      
      // Log this activity
      setUserActivityLog(prev => [
        {
          id: `act-${Date.now()}`,
          action: 'Profile Updated',
          details: 'Committed name, language, or timezone edits',
          timestamp: 'Just Now',
          severity: 'info'
        },
        ...prev
      ]);
    }, 800);
  };

  // Generate API Token handler
  const handleGenerateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) {
      onToast('Validation Error', 'Please supply a recognizable label name for the token.', 'warning');
      return;
    }
    const fakeTokenStr = `wp_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const newToken = {
      id: `tok_${Date.now()}`,
      name: newTokenName,
      token: `${fakeTokenStr.substring(0, 10)}...${fakeTokenStr.substring(fakeTokenStr.length - 5)}`,
      created: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    setApiTokens(prev => [...prev, newToken]);
    setGeneratedTokenString(fakeTokenStr);
    setNewTokenName('');
    onToast('API Secret Generated', 'Ensure to copy your API token now. It will not be shown again.', 'success');

    setUserActivityLog(prev => [
      {
        id: `act-${Date.now()}`,
        action: 'Token Provisioned',
        details: `Generated live credentials for system: ${newToken.name}`,
        timestamp: 'Just Now',
        severity: 'warning'
      },
      ...prev
    ]);
  };

  const handleRevokeToken = (id: string, name: string) => {
    setApiTokens(prev => prev.filter(t => t.id !== id));
    onToast('Credentials Revoked', `Token API access for ${name} has been securely terminated.`, 'info');
    setUserActivityLog(prev => [
      {
        id: `act-${Date.now()}`,
        action: 'Token Terminated',
        details: `Revoked live access permissions for ${name}`,
        timestamp: 'Just Now',
        severity: 'warning'
      },
      ...prev
    ]);
  };

  // Toggle 2FA Handler
  const handleVerifyOtp = () => {
    if (otpCode.length !== 6 || isNaN(Number(otpCode))) {
      onToast('Invalid Passcode', 'Please input a valid 6-digit verification code.', 'warning');
      return;
    }
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setIs2faEnabled(true);
      setShow2faSetup(false);
      setOtpCode('');
      onToast('MFA Authenticated', 'Secure Two-Factor Authentication policy fully activated.', 'success');
      setUserActivityLog(prev => [
        {
          id: `act-${Date.now()}`,
          action: 'MFA Status Changed',
          details: 'Activated multi-factor verification policy safeguards',
          timestamp: 'Just Now',
          severity: 'success'
        },
        ...prev
      ]);
    }, 1000);
  };

  const handleDisable2fa = () => {
    setIs2faEnabled(false);
    onToast('Security Status Warn', 'Two-factor Authentication has been disabled for this credential profile.', 'warning');
  };

  // Password update handler
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      onToast('Incomplete Password Fields', 'All credentials fields are mandatory.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      onToast('Mismatching Passwords', 'The specified new passwords do not correspond.', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      onToast('Complexity Deficit', 'Passwords must contain at least 8 characters for compliant security standards.', 'warning');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onToast('Passwords Updated', 'Cryptographic account secrets cycled successfully.', 'success');
      setUserActivityLog(prev => [
        {
          id: `act-${Date.now()}`,
          action: 'Password Modified',
          details: 'Account authentication secret securely hashed and rotated',
          timestamp: 'Just Now',
          severity: 'success'
        },
        ...prev
      ]);
    }, 1200);
  };

  // Check RBAC protection helper
  const isSuperAdmin = activeRole === 'Super Administrator';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl text-slate-900 tracking-tight">My Profile &amp; Settings</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
              Personal Workspace
            </span>
          </div>
          <p className="text-xs text-slate-500">Configure your personal preferences, cycle secrets, manage active sessions, and review recent activity logs.</p>
        </div>
        
        {/* RBAC Visual Banner */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono text-xs">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Authorized Identity</span>
            <span className="text-slate-800 font-bold">{activeRole}</span>
          </div>
        </div>
      </div>

      {/* Main Profile Layout split: Sidebar menu + Main panel */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Segment Menu */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-3 mb-2 block">
              My Settings
            </span>
            
            {[
              { id: 'personal', label: 'Personal Information', icon: User },
              { id: 'appearance', label: 'Layout & Appearance', icon: Laptop },
              { id: 'notifications', label: 'Notification Rules', icon: Bell },
              { id: 'security', label: 'Security & Access', icon: Shield },
              { id: 'activity', label: 'Activity Audit Log', icon: Activity },
            ].map(tab => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubSection(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all text-left cursor-pointer ${
                    activeSubSection === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Delineate Organizational Boundaries (Requirement 6) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>System Settings</span>
            </div>
            
            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-slate-200 bg-white/50 space-y-1">
                <span className="text-[10px] font-bold text-slate-800 tracking-tight block">Organization Directory</span>
                <p className="text-[10px] text-slate-400 leading-normal">Company-wide accounts and structural directory mappings.</p>
                <div className="pt-1">
                  {isSuperAdmin ? (
                    <span className="text-[9px] font-bold text-blue-600 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Fully Authorized Manager
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-max">
                      <Lock className="w-2.5 h-2.5" /> Read-Only Compliance Limit
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white/50 space-y-1">
                <span className="text-[10px] font-bold text-slate-800 tracking-tight block">Platform Administration</span>
                <p className="text-[10px] text-slate-400 leading-normal">Configure global networks, server routing, and TLS secrets.</p>
                <div className="pt-1 font-semibold text-[9px] text-slate-500">
                  {isSuperAdmin ? 'Managed via Administration Center' : 'Access Restricted'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Panel Workspace */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* 1. PERSONAL INFORMATION SUBSECTION */}
                {activeSubSection === 'personal' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-display font-bold text-base text-slate-800 tracking-tight">Personal Information</h2>
                      <p className="text-[11px] text-slate-400">Update display name, contact phone, and account localization parameters.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* Avatar drag & drop */}
                      <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Profile Photo</span>
                        
                        <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`relative w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all ${
                            isDragging 
                              ? 'border-blue-500 bg-blue-50/50 scale-105' 
                              : avatarPreview ? 'border-slate-300' : 'border-slate-200 bg-white'
                          }`}
                        >
                          {avatarPreview ? (
                            <img 
                              src={avatarPreview} 
                              alt="Avatar Preview" 
                              className="w-full h-full rounded-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-center space-y-1 p-2">
                              <User className="w-8 h-8 text-slate-400 mx-auto" />
                              <span className="text-[9px] text-slate-400 font-bold block">No Photo</span>
                            </div>
                          )}

                          <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105">
                            <Camera className="w-4 h-4" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileSelect} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                        <p className="text-[9px] text-slate-400 text-center mt-3 max-w-[160px] leading-relaxed">
                          Drag and drop an image asset here, or click upload to set profile avatar.
                        </p>
                      </div>

                      {/* Info Form */}
                      <form onSubmit={handleSavePersonalInfo} className="md:col-span-8 grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Full Display Name</label>
                          <input 
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2.5 outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                            required
                          />
                        </div>

                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Corporate Email Address</label>
                          <input 
                            type="email"
                            value={email}
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold rounded-lg p-2.5 text-slate-500 cursor-not-allowed"
                            title="Corporate email addresses are managed and provisioned by IT directory administrators."
                          />
                        </div>

                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contact Phone Number</label>
                          <input 
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2.5 outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                            required
                          />
                        </div>

                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">System Display Language</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2.5 outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                          >
                            <option value="en-GB">English (United Kingdom)</option>
                            <option value="en-US">English (United States)</option>
                            <option value="fr-FR">Français (France)</option>
                            <option value="de-DE">Deutsch (Deutschland)</option>
                          </select>
                        </div>

                        <div className="col-span-2 space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Operational Time Zone</label>
                          <div className="relative">
                            <select
                              value={timezone}
                              onChange={(e) => setTimezone(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2.5 pl-9 outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-800 appearance-none"
                            >
                              <option value="Europe/London">Europe/London (GMT/BST - Local)</option>
                              <option value="UTC">UTC (Universal Coordinated Time)</option>
                              <option value="America/New_York">America/New_York (EST/EDT)</option>
                              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                            </select>
                            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                          </div>
                        </div>

                        <div className="col-span-2 pt-2 text-right">
                          <button
                            type="submit"
                            disabled={isSavingPersonal}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-all disabled:opacity-50 inline-flex items-center gap-2"
                          >
                            {isSavingPersonal ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Syncing Database...
                              </>
                            ) : (
                              'Save Configuration'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* 2. APPEARANCE SUBSECTION (Requirement 1) */}
                {activeSubSection === 'appearance' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-display font-bold text-base text-slate-800 tracking-tight">Workspace Appearance</h2>
                      <p className="text-[11px] text-slate-400">Select your preferred user-interface theme mode. Theme selection is personal and saved dynamically.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      
                      {/* Light mode */}
                      <div 
                        onClick={() => {
                          setThemePreference('light');
                          onToast('Workspace Preference Updated', 'Standard Light view mode has been selected.', 'success');
                        }}
                        className={`border rounded-2xl p-4 flex flex-col justify-between h-40 cursor-pointer transition-all hover:border-slate-300 ${
                          themePreference === 'light' 
                            ? 'border-blue-500 ring-2 ring-blue-500/10 bg-slate-50/40' 
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                            <Sun className="w-4 h-4" />
                          </div>
                          {themePreference === 'light' && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Light Mode</span>
                          <span className="text-[10px] text-slate-400 leading-normal">High-contrast slate accents over white backgrounds. Optimized for daytime productivity.</span>
                        </div>
                      </div>

                      {/* Dark Mode */}
                      <div 
                        onClick={() => {
                          setThemePreference('dark');
                          onToast('Workspace Preference Updated', 'Tactical Night view mode has been selected.', 'success');
                        }}
                        className={`border rounded-2xl p-4 flex flex-col justify-between h-40 cursor-pointer transition-all hover:border-slate-300 ${
                          themePreference === 'dark' 
                            ? 'border-blue-500 ring-2 ring-blue-500/10 bg-slate-50/40' 
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center font-bold">
                            <Moon className="w-4 h-4" />
                          </div>
                          {themePreference === 'dark' && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Dark Mode</span>
                          <span className="text-[10px] text-slate-400 leading-normal">Deep slate canvases reducing blue emissions. Ideal for monitoring terminals.</span>
                        </div>
                      </div>

                      {/* System mode */}
                      <div 
                        onClick={() => {
                          setThemePreference('system');
                          onToast('Workspace Preference Updated', 'System Follow Device mode has been configured.', 'success');
                        }}
                        className={`border rounded-2xl p-4 flex flex-col justify-between h-40 cursor-pointer transition-all hover:border-slate-300 ${
                          themePreference === 'system' 
                            ? 'border-blue-500 ring-2 ring-blue-500/10 bg-slate-50/40' 
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            <Monitor className="w-4 h-4" />
                          </div>
                          {themePreference === 'system' && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">System (Follow Device)</span>
                          <span className="text-[10px] text-slate-400 leading-normal">Harmonizes with browser settings. Smoothly adapts dynamically.</span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 3. NOTIFICATION PREFERENCES */}
                {activeSubSection === 'notifications' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-display font-bold text-base text-slate-800 tracking-tight">Notification Preferences</h2>
                      <p className="text-[11px] text-slate-400">Configure which categories of event updates you receive and control active message delivery streams.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                      {/* Left: Category Subscriptions */}
                      <div className="md:col-span-7 space-y-4">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Enabled Alert Categories</span>
                        
                        {[
                          { key: 'system', title: 'System Infrastructure Alerts', desc: 'Hardware spike notifications, latency alerts, server migrations.' },
                          { key: 'compliance', title: 'Compliance & Audit Warnings', desc: 'Scheduled reviews, customer flags, watchlists alerts.' },
                          { key: 'fraud', title: 'Fraud & Velocity Detections', desc: 'Threshold exceedances, suspicious activity triggers, blocks.' },
                          { key: 'security', title: 'Identity & Access Controls', desc: 'New login alerts, credential rotators, active session terminations.' },
                          { key: 'operations', title: 'Fintech Operations Updates', desc: 'Ledger reconciliations, payout statuses, refunds logs.' },
                          { key: 'payments', title: 'Clearing & Settlement Run Summaries', desc: 'FedWire triggers, daily volume reports (often noisy).' },
                          { key: 'support', title: 'Support & Escalation Ticket Assignments', desc: 'New tickets assigned to compliance officer.' }
                        ].map(category => (
                          <div key={category.key} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-200/50">
                            <div className="space-y-0.5 max-w-[80%]">
                              <span className="text-xs font-bold text-slate-800 block">{category.title}</span>
                              <span className="text-[10px] text-slate-400 leading-normal block">{category.desc}</span>
                            </div>
                            <button
                              onClick={() => {
                                setNotifConfig(prev => ({
                                  ...prev,
                                  [category.key]: !((prev as any)[category.key])
                                }));
                                onToast('Alert Settings Updated', `${category.title} subscription toggled.`, 'info');
                              }}
                              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                (notifConfig as any)[category.key] ? 'bg-blue-600' : 'bg-slate-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  (notifConfig as any)[category.key] ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Right: Delivery channels */}
                      <div className="md:col-span-5 space-y-4">
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Message Delivery Channels</span>
                          
                          {[
                            { key: 'email', title: 'Corporate Email Inbox' },
                            { key: 'push', title: 'Browser Push Notifications' },
                            { key: 'slack', title: 'Corporate Slack Webhooks' },
                            { key: 'sms', title: 'SMS Direct Telemetry' }
                          ].map(channel => (
                            <div key={channel.key} className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-slate-700">{channel.title}</span>
                              <button
                                onClick={() => {
                                  setNotifConfig(prev => ({
                                    ...prev,
                                    channels: {
                                      ...prev.channels,
                                      [channel.key]: !((prev.channels as any)[channel.key])
                                    }
                                  }));
                                  onToast('Channel Strategy Configured', `${channel.title} channel setting saved.`, 'info');
                                }}
                                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  (notifConfig.channels as any)[channel.key] ? 'bg-blue-600' : 'bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    (notifConfig.channels as any)[channel.key] ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SECURITY & ACCESS SUBSECTION */}
                {activeSubSection === 'security' && (
                  <div className="space-y-8">
                    
                    {/* Password change form */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="font-display font-bold text-base text-slate-800 tracking-tight">Rotate Credentials</h2>
                        <p className="text-[11px] text-slate-400">Regular rotations of authentication secrets protect cryptographic signing boundaries.</p>
                      </div>

                      <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Current */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPass.current ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2.5 pr-9 outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* New */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">New Password</label>
                          <div className="relative">
                            <input
                              type={showPass.new ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2.5 pr-9 outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPass.confirm ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2.5 pr-9 outline-none focus:bg-white focus:border-blue-500 transition-all text-slate-800"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="col-span-1 md:col-span-3 text-right">
                          <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{isChangingPassword ? 'Rehashing Cipher...' : 'Rotate Password'}</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Two factor Authenticator */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                          <h2 className="font-display font-bold text-base text-slate-800 tracking-tight flex items-center gap-2">
                            <span>Two-Factor Authentication (2FA)</span>
                            {is2faEnabled ? (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                            ) : (
                              <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">OFF</span>
                            )}
                          </h2>
                          <p className="text-[11px] text-slate-400">Protects active operations from simple credentials hijack vectors.</p>
                        </div>
                        {is2faEnabled && (
                          <button
                            onClick={handleDisable2fa}
                            className="text-red-600 hover:text-red-700 font-semibold text-xs transition-all cursor-pointer"
                          >
                            Disable 2FA
                          </button>
                        )}
                      </div>

                      {!is2faEnabled && !show2faSetup && (
                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-4">
                          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="space-y-2 flex-1">
                            <span className="text-xs font-bold text-slate-800 block">Activate Multi-Factor Shield</span>
                            <p className="text-[11px] text-slate-500 leading-normal">
                              Secure your compliance officer credentials profile by enforcing a unique dynamic cipher on every login run.
                            </p>
                            <button
                              onClick={() => setShow2faSetup(true)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-md shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Lock className="w-3 h-3" />
                              Configure 2FA MFA
                            </button>
                          </div>
                        </div>
                      )}

                      {show2faSetup && (
                        <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 flex flex-col md:flex-row gap-6">
                          <div className="w-36 h-36 bg-white border border-slate-200 rounded-lg p-2 shrink-0 flex items-center justify-center">
                            {/* Simple simulated QR */}
                            <div className="grid grid-cols-6 gap-0.5 w-full h-full opacity-80">
                              {Array.from({ length: 36 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`rounded-sm ${
                                    (i * 3 + 7) % 5 === 0 || i % 4 === 0 || i < 6 || i > 30 ? 'bg-slate-900' : 'bg-white'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4 flex-1">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-800 block">Setup Google Authenticator / Duo</span>
                              <p className="text-[10px] text-slate-500 leading-normal">
                                1. Scan the simulated QR code with your security device app.<br />
                                2. Input the generated 6-digit verification code below to bind credentials.
                              </p>
                            </div>

                            <div className="flex gap-2 max-w-xs">
                              <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="bg-white border border-slate-200 text-center text-sm font-mono font-bold rounded-lg p-2 outline-none w-28 focus:border-blue-500"
                              />
                              <button
                                onClick={handleVerifyOtp}
                                disabled={isVerifyingOtp}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                              >
                                {isVerifyingOtp ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Verify'
                                )}
                              </button>
                              <button
                                onClick={() => setShow2faSetup(false)}
                                className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* API Tokens */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3">
                        <h2 className="font-display font-bold text-base text-slate-800 tracking-tight">Personal API Secrets</h2>
                        <p className="text-[11px] text-slate-400">Generate developer keys for personal read-only programmatic operations audits.</p>
                      </div>

                      <div className="space-y-4">
                        <form onSubmit={handleGenerateToken} className="flex gap-2 max-w-md">
                          <input
                            type="text"
                            placeholder="e.g. Audit Script Server"
                            value={newTokenName}
                            onChange={(e) => setNewTokenName(e.target.value)}
                            className="flex-1 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2 outline-none focus:bg-white focus:border-blue-500"
                          />
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Generate Token
                          </button>
                        </form>

                        {generatedTokenString && (
                          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg text-xs space-y-1 font-mono">
                            <span className="font-bold text-[10px] uppercase block">CRITICAL SECRET - COPY NOW</span>
                            <span className="font-bold select-all block text-slate-900 text-xs break-all bg-white p-2 rounded border border-amber-200">{generatedTokenString}</span>
                            <span className="text-[9px] opacity-70 block leading-normal pt-1">
                              This token will be permanently obfuscated after you refresh this page context.
                            </span>
                          </div>
                        )}

                        <div className="overflow-x-auto border border-slate-100 rounded-xl">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                <th className="px-4 py-2.5">Token Label</th>
                                <th className="px-4 py-2.5">Key Hash</th>
                                <th className="px-4 py-2.5">Created Date</th>
                                <th className="px-4 py-2.5">Permissions</th>
                                <th className="px-4 py-2.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold">
                              {apiTokens.map(tok => (
                                <tr key={tok.id} className="text-slate-700">
                                  <td className="px-4 py-3">{tok.name}</td>
                                  <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{tok.token}</td>
                                  <td className="px-4 py-3 text-slate-500">{tok.created}</td>
                                  <td className="px-4 py-3">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] uppercase font-bold">read:only</span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => handleRevokeToken(tok.id, tok.name)}
                                      className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors cursor-pointer"
                                      title="Revoke Token Access"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Sessions & Devices */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recent Sessions</span>
                        <div className="space-y-2">
                          {recentSessions.map(sess => (
                            <div key={sess.id} className="p-3 bg-slate-50/50 border border-slate-200/50 rounded-xl flex items-start gap-3">
                              <Monitor className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 block truncate">{sess.device}</span>
                                  {sess.current && (
                                    <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">CURRENT</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 block">{sess.ip} • {sess.location}</span>
                                <span className="text-[9px] text-slate-400 font-mono block">{sess.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Connected Devices</span>
                        <div className="space-y-2">
                          {connectedDevices.map(dev => (
                            <div key={dev.id} className="p-3 bg-slate-50/50 border border-slate-200/50 rounded-xl flex items-start gap-3">
                              {dev.type === 'laptop' ? (
                                <Laptop className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              ) : (
                                <Smartphone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              )}
                              <div className="space-y-0.5 flex-1">
                                <span className="text-xs font-bold text-slate-800 block">{dev.name}</span>
                                <span className="text-[10px] text-slate-500 block">Status: {dev.status}</span>
                                <span className="text-[9px] text-slate-400 block">Last Active: {dev.lastActive}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 5. USER AUDIT ACTIVITY HISTORIES */}
                {activeSubSection === 'activity' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-display font-bold text-base text-slate-800 tracking-tight">Recent Activity History</h2>
                      <p className="text-[11px] text-slate-400">Immutable operations log tracking recent settings mutations initiated under your credentials.</p>
                    </div>

                    <div className="space-y-3 max-w-3xl">
                      {userActivityLog.map(act => (
                        <div key={act.id} className="p-3 bg-slate-50/40 border border-slate-200/50 rounded-xl flex gap-3.5 items-start">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                            act.severity === 'success' ? 'bg-emerald-500' : act.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          
                          <div className="space-y-0.5 flex-1">
                            <span className="text-xs font-bold text-slate-800 block">{act.action}</span>
                            <span className="text-[11px] text-slate-500 block">{act.details}</span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {act.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Secure Footer Indicator */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>E2EE SHA-256 Storage Integrity Verified</span>
              </span>
              <span>Audit ID: {Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            
          </div>
        </div>

      </div>

    </div>
  );
}
