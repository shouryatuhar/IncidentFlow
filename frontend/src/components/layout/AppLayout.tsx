import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertCircle,
  Server,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Shield,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { Button } from '../common/Button';
import { CreateIncidentModal } from '../incidents/CreateIncidentModal';

export const AppLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/incidents', label: 'Incidents', icon: AlertCircle },
    { to: '/services', label: 'Services', icon: Server },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-950/50">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 font-mono">
                Incident<span className="text-rose-400">Flow</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block -mt-1 uppercase">
                DevOps Ops
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 py-4">
          <Button
            variant="danger"
            size="sm"
            className="w-full justify-center shadow-md font-medium"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setIsCreateIncidentOpen(true);
              setIsMobileMenuOpen(false);
            }}
          >
            Declare Incident
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Section at Bottom of Sidebar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200 shrink-0 font-mono">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                  {user?.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                      isAdmin
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    <Shield className="w-2.5 h-2.5 mr-0.5" />
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile Header */}
        <header className="h-16 px-4 border-b border-slate-800 flex items-center justify-between lg:hidden bg-slate-900 sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 font-mono font-bold text-sm">
            <span>Incident<span className="text-rose-400">Flow</span></span>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setIsCreateIncidentOpen(true)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Create Incident Modal */}
      <CreateIncidentModal
        isOpen={isCreateIncidentOpen}
        onClose={() => setIsCreateIncidentOpen(false)}
      />
    </div>
  );
};
