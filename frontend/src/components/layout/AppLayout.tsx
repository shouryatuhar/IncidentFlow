import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertCircle,
  Server,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '../common/Button';
import { CreateIncidentModal } from '../incidents/CreateIncidentModal';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/incidents', label: 'Incidents', icon: AlertCircle },
    { to: '/services', label: 'Services', icon: Server },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  // Derive current page title for the header bar
  const currentNav = navItems.find((item) => location.pathname.startsWith(item.to));
  const pageTitle = location.pathname.includes('/incidents/')
    ? 'Incident Detail'
    : currentNav?.label || 'Overview';

  return (
    <div className="flex min-h-screen bg-[#08090a] text-[#f4f4f5] font-sans antialiased">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-56 bg-[#0d0e11] border-r border-[#1f2127] flex flex-col transition-transform duration-150 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Selector */}
        <div className="h-11 px-3 border-b border-[#1f2127] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-[4px] bg-[#1a1b20] border border-[#2a2c34] flex items-center justify-center shrink-0">
              <span className="font-mono text-[10px] font-bold text-[#ededed]">IF</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-semibold text-[#f4f4f5] tracking-tight truncate">
                IncidentFlow
              </span>
              <span className="text-[10px] text-[#71717a] font-mono">v1</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded text-[#71717a] hover:text-[#f4f4f5] lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: Declare Incident */}
        <div className="p-2.5">
          <button
            onClick={() => {
              setIsCreateIncidentOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] bg-[#16171b] hover:bg-[#1d1f25] border border-[#24262d] text-xs font-medium text-[#ededed] transition-colors shadow-subtle group cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-[#f87171]" />
              <span>New Incident</span>
            </span>
            <kbd className="text-[10px] font-mono text-[#71717a] group-hover:text-[#a1a1aa] bg-[#101114] border border-[#22242a] px-1 py-0.2 rounded">
              C
            </kbd>
          </button>
        </div>

        {/* Section Label */}
        <div className="px-3 pt-2 pb-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#71717a]">
            Workspace
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-[5px] text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#18191e] text-[#f4f4f5]'
                      : 'text-[#8a8f98] hover:text-[#e4e4e7] hover:bg-[#121316]'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Account Section at Bottom */}
        <div className="p-2.5 border-t border-[#1f2127] bg-[#0d0e11]">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-[5px] hover:bg-[#15161a] transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-full bg-[#1c1d22] border border-[#2b2d35] flex items-center justify-center font-bold text-[10px] text-[#ededed] shrink-0 font-mono">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-[#ededed] truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-[10px] text-[#71717a] font-mono leading-none mt-0.5">
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1 rounded text-[#71717a] hover:text-[#f87171] hover:bg-[#1f2026] transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-56">
        {/* Top Header Bar */}
        <header className="h-11 px-4 sm:px-6 border-b border-[#1f2127] flex items-center justify-between bg-[#08090a] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#15161a] lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#71717a]">IncidentFlow</span>
              <span className="text-[#52525b]">/</span>
              <span className="font-medium text-[#f4f4f5]">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Plus className="w-3 h-3 text-[#f87171]" />}
              onClick={() => setIsCreateIncidentOpen(true)}
            >
              Declare Incident
            </Button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 w-full max-w-7xl mx-auto">
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
