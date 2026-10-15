import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Lock, Mail, ArrowRight, ShieldCheck, Wrench } from 'lucide-react';

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
    <div className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center p-4 selection:bg-[#5e6ad2]/30">
      <div className="w-full max-w-sm space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#121316] border border-[#26282f] mb-2 shadow-subtle">
            <span className="font-mono text-xs font-bold text-[#ededed]">IF</span>
          </div>
          <h1 className="text-lg font-semibold text-[#f4f4f5] tracking-tight">
            IncidentFlow
          </h1>
          <p className="text-xs text-[#71717a]">
            DevOps incident management platform for engineering teams
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-5 shadow-modal space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#71717a] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="engineer@incidentflow.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-[#08090a] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] placeholder-[#71717a] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#71717a] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-[#08090a] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] placeholder-[#71717a] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-8 mt-1 font-medium"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-3 h-3" />}
            >
              Sign In to IncidentFlow
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-3 border-t border-[#1f2127] space-y-2">
            <div className="text-center space-y-0.5">
              <span className="text-[10px] font-mono text-[#71717a] block uppercase tracking-wider">
                Demo Accounts
              </span>
              <p className="text-[11px] text-[#52525b]">
                Pre-configured evaluation credentials with full interactive access
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@incidentflow.dev')}
                className="flex items-center justify-center gap-1.5 h-7 bg-[#15161a] hover:bg-[#1f2026] border border-[#22242a] rounded-[5px] text-xs font-medium text-[#d4d4d8] hover:text-[#ffffff] transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 text-[#c084fc]" />
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('engineer@incidentflow.dev')}
                className="flex items-center justify-center gap-1.5 h-7 bg-[#15161a] hover:bg-[#1f2026] border border-[#22242a] rounded-[5px] text-xs font-medium text-[#d4d4d8] hover:text-[#ffffff] transition-colors cursor-pointer"
              >
                <Wrench className="w-3 h-3 text-[#818cf8]" />
                Engineer Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#71717a]">
          Need an account?{' '}
          <Link to="/register" className="text-[#ededed] hover:underline font-medium">
            Register new operator
          </Link>
        </p>
      </div>
    </div>
  );
};
