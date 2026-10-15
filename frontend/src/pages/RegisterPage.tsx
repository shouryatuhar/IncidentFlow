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
    <div className="min-h-screen bg-[#08090a] flex flex-col items-center justify-center p-4 selection:bg-[#5e6ad2]/30">
      <div className="w-full max-w-sm space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#121316] border border-[#26282f] mb-2 shadow-subtle">
            <span className="font-mono text-xs font-bold text-[#ededed]">IF</span>
          </div>
          <h1 className="text-lg font-semibold text-[#f4f4f5] tracking-tight">
            Create IncidentFlow Account
          </h1>
          <p className="text-xs text-[#71717a]">
            Operator access for production incident triage
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-5 shadow-modal space-y-3.5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#71717a] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-[#08090a] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] placeholder-[#71717a] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#71717a] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="jordan@company.com"
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-8 pl-8 pr-2.5 bg-[#08090a] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] placeholder-[#71717a] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
                Platform Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('ENGINEER')}
                  className={`h-8 px-2 rounded-[5px] text-xs font-medium border transition-colors cursor-pointer ${
                    role === 'ENGINEER'
                      ? 'bg-[#18191e] border-[#5e6ad2] text-[#f4f4f5]'
                      : 'bg-[#08090a] border-[#1f2127] text-[#71717a] hover:text-[#ededed]'
                  }`}
                >
                  Engineer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`h-8 px-2 rounded-[5px] text-xs font-medium border transition-colors cursor-pointer ${
                    role === 'ADMIN'
                      ? 'bg-[#18191e] border-[#5e6ad2] text-[#f4f4f5]'
                      : 'bg-[#08090a] border-[#1f2127] text-[#71717a] hover:text-[#ededed]'
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
        <p className="text-center text-xs text-[#71717a]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#ededed] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
