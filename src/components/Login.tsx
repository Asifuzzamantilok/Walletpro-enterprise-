import React, { useState } from 'react';
import { authApi } from '../api/auth';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ACTIVE_ROLE_KEY } from '../api/client';
import { Shield, Lock, Mail, Eye, EyeOff, Terminal, AlertCircle, RefreshCw } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onToast: (title: string, message: string, type: 'success' | 'warning' | 'info') => void;
}

export function Login({ onLoginSuccess, onToast }: LoginProps) {
  const [email, setEmail] = useState('admin@walletpro.com');
  const [password, setPassword] = useState('AdminSecurePass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Clear any existing stale credentials before attempting a new login
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
    localStorage.removeItem('walletpro_user');

    try {
      // Call auth endpoint
      const data = await authApi.login({ email, password });
      
      // Store credentials securely
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
      localStorage.setItem(ACTIVE_ROLE_KEY, data.user.role);
      localStorage.setItem('walletpro_user', JSON.stringify(data.user));

      onToast('Welcome back, ' + data.user.name, 'Authenticated successfully as ' + data.user.role + '.', 'success');
      
      // Notify parent component to refresh state and render workspace
      onLoginSuccess(data.accessToken, data.user);
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;

      if (status === 401) {
        console.warn('Authentication attempt failed: Invalid credentials');
        setErrorMessage('Invalid email or password.');
        onToast('Authentication Failed', 'Invalid email or password.', 'warning');
      } else if (status === 403) {
        console.error('Access Forbidden:', err);
        setErrorMessage(serverMsg || 'Your account is currently suspended or lacks access permissions.');
        onToast('Access Forbidden', 'Your account does not have authorization.', 'warning');
      } else if (status === 429) {
        console.error('Rate Limit Exceeded:', err);
        setErrorMessage('Too many authentication attempts. Please wait a few minutes before trying again.');
        onToast('Rate Limit Exceeded', 'Please try again later.', 'warning');
      } else if (status >= 500) {
        console.error('Server Error:', err);
        setErrorMessage(serverMsg || 'Enterprise authentication server is currently experiencing issues. Please try again later.');
        onToast('Server Error', 'Please try again shortly.', 'warning');
      } else {
        console.error('Connection Error:', err);
        setErrorMessage(serverMsg || 'Unable to connect to the authentication gateway. Please check your network.');
        onToast('Connection Error', 'Authentication server is unreachable.', 'warning');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-screen w-screen h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 translate-y-1/2" />
      
      {/* Visual background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 relative z-10 animate-fade-in flex flex-col">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-3 shadow-inner shadow-indigo-500/5">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white font-display">WalletPro Enterprise</h1>
          <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-mono">Administrative Control Console</p>
        </div>

        {/* Error panel */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex gap-2 text-xs text-red-300 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enterprise Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                placeholder="email@walletpro.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gateway Password</label>
              <span className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">Forgot Credentials?</span>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer border border-indigo-500/20 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Decrypting Gateway...</span>
              </>
            ) : (
              <span>Decrypt & Connect Console</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
