import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Radio, Lock, Mail, ArrowRight, ShieldCheck, Wrench } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      success('Logged in successfully');
      navigate(from, { replace: true });
    } catch (err: any) {
      error(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500/30">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 shadow-xl shadow-rose-950/60 mb-2">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
            Incident<span className="text-rose-400">Flow</span>
          </h1>
          <p className="text-xs text-slate-400">
            DevOps incident management platform for engineering teams
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="engineer@incidentflow.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 mt-2 font-semibold shadow-md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to IncidentFlow
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
                Demo Accounts
              </span>
              <p className="text-[11px] text-slate-500">
                Pre-configured evaluation credentials with full interactive access
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@incidentflow.dev')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('engineer@incidentflow.dev')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-blue-400" />
                Engineer Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Need an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Register new operator
          </Link>
        </p>
      </div>
    </div>
  );
};
