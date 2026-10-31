import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Role } from '../types';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('ENGINEER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      error('Please complete all registration fields');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      success('Account registered successfully! Welcome to IncidentFlow.');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111411] flex flex-col items-center justify-center p-4 selection:bg-[#a2aa83]/30">
      <div className="w-full max-w-sm space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#121316] border border-[#343c32] mb-2 shadow-subtle">
            <span className="font-mono text-xs font-bold text-[#dce1d8]">IF</span>
          </div>
          <h1 className="text-lg font-semibold text-[#e8ebe4] tracking-tight">
            Create IncidentFlow Account
          </h1>
          <p className="text-xs text-[#818b7e]">
            Operator access for production incident triage
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-[#191d19] border border-[#30372f] rounded-[6px] p-5 shadow-modal space-y-3.5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#818b7e] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#818b7e] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-[#111411] border border-[#30372f] hover:border-[#3c453a] focus:border-[#a2aa83] rounded-[5px] text-xs text-[#dce1d8] placeholder-[#818b7e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#818b7e] mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#818b7e] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="jordan@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-[#111411] border border-[#30372f] hover:border-[#3c453a] focus:border-[#a2aa83] rounded-[5px] text-xs text-[#dce1d8] placeholder-[#818b7e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#818b7e] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#818b7e] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-[#111411] border border-[#30372f] hover:border-[#3c453a] focus:border-[#a2aa83] rounded-[5px] text-xs text-[#dce1d8] placeholder-[#818b7e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#818b7e] mb-1">
                Platform Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('ENGINEER')}
                  className={`h-8 px-2 rounded-[5px] text-xs font-medium border transition-colors cursor-pointer ${
                    role === 'ENGINEER'
                      ? 'bg-[#242a23] border-[#a2aa83] text-[#e8ebe4]'
                      : 'bg-[#111411] border-[#30372f] text-[#818b7e] hover:text-[#dce1d8]'
                  }`}
                >
                  Engineer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`h-8 px-2 rounded-[5px] text-xs font-medium border transition-colors cursor-pointer ${
                    role === 'ADMIN'
                      ? 'bg-[#242a23] border-[#a2aa83] text-[#e8ebe4]'
                      : 'bg-[#111411] border-[#30372f] text-[#818b7e] hover:text-[#dce1d8]'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-8 mt-2 font-medium"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-3 h-3" />}
            >
              Complete Registration
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#818b7e]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#dce1d8] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
