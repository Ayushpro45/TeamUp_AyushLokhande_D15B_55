import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import {
  Users, Sparkles, Menu, X, ArrowRight,
  LayoutDashboard, Home, LogIn, PlusCircle,
  ShieldCheck, UserCircle, LogOut, ChevronDown, MessageSquare,
  Crown
} from 'lucide-react';

export default function Navbar() {
  const { activePage, setActivePage, handleOpenCreateModal, teams } = useContext(AppContext);
  const { user, isLoggedIn, isAdmin, logout } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Helper to determine if current user is leader of at least one squad
  const isTeamLeader = Boolean(
    user && (
      isAdmin ||
      (Array.isArray(teams) && teams.some((t) => {
        const uid = String(user.id || user._id || '');
        const cId = t.createdBy?._id ? String(t.createdBy._id) : String(t.createdBy || '');
        const isCreator = cId === uid;
        const isEmailMatch = t.leaderEmail && user.email && t.leaderEmail.toLowerCase() === user.email.toLowerCase();
        const isNameMatch = t.leaderName && user.name && t.leaderName.toLowerCase() === user.name.toLowerCase();
        return isCreator || isEmailMatch || isNameMatch;
      }))
    )
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setActivePage('home');
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Build nav items based on role
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Squad Chat', icon: MessageSquare },
    ...(isTeamLeader ? [{ id: 'leader', label: 'Leader Hub', icon: Crown, isLeaderTab: true }] : []),
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldCheck }] : []),
    ...(!isLoggedIn ? [{ id: 'login', label: 'Sign In', icon: LogIn }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2 transition-all duration-300">
      <div className="max-w-[1200px] mx-auto rounded-2xl glass-box px-4 sm:px-6 py-3.5 flex items-center justify-between">

        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-purple-400/60 rounded-xl p-1 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform duration-300">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-indigo-200 bg-clip-text text-transparent">
                TeamUp
              </span>
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-purple-200/80 -mt-1">
              Hackathon Matcher
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  isActive
                    ? item.isLeaderTab
                      ? 'bg-gradient-to-r from-amber-500/80 to-orange-600/80 text-white shadow-md shadow-amber-900/50 border border-amber-400/60 font-semibold'
                      : 'bg-purple-600/60 text-white shadow-md shadow-purple-900/50 border border-purple-400/40 font-semibold'
                    : item.isLeaderTab
                    ? 'text-amber-200 hover:text-white hover:bg-amber-500/20'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.isLeaderTab ? 'text-amber-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          {/* CTA — only for non-admin users on dashboard */}
          {!isAdmin && activePage === 'dashboard' && (
            <button
              onClick={isLoggedIn ? handleOpenCreateModal : () => handleNavClick('login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <PlusCircle className="w-4 h-4" />
              Create Team
            </button>
          )}
          {!isAdmin && activePage !== 'dashboard' && !isLoggedIn && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              Explore Teams
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Avatar Dropdown — shown when logged in */}
          {isLoggedIn && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
                aria-label="User menu"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${isAdmin ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
                  {user?.avatar || user?.name?.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white hidden lg:block">
                  {user?.name?.split(' ')[0]}
                </span>
                {isAdmin && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 hidden lg:block">
                    ADMIN
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl glass-box border border-white/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  {isTeamLeader && (
                    <button
                      onClick={() => handleNavClick('leader')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-200 hover:bg-amber-500/15 hover:text-white transition-all text-left font-semibold border-b border-white/5"
                    >
                      <Crown className="w-4 h-4 text-amber-400" />
                      Leader Hub
                    </button>
                  )}
                  {!isAdmin && (
                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-all text-left"
                    >
                      <UserCircle className="w-4 h-4 text-purple-300" />
                      My Profile
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 rounded-xl bg-white/10 border border-white/20 text-slate-200 hover:text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/20 shadow-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? item.isLeaderTab
                        ? 'bg-amber-600/60 text-white border border-amber-400/50 font-semibold'
                        : 'bg-purple-600/60 text-white border border-purple-400/40 font-semibold'
                      : item.isLeaderTab
                      ? 'text-amber-200 hover:bg-amber-500/20'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.isLeaderTab ? 'text-amber-400' : 'text-purple-300'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isAdmin ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
                    {user?.avatar || user?.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user?.name}</p>
                    <p className="text-xs text-slate-400">{isAdmin ? 'Administrator' : 'Member'}</p>
                  </div>
                </div>
                {!isAdmin && (
                  <button
                    onClick={() => handleNavClick('profile')}
                    className="w-full flex items-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-semibold text-sm"
                  >
                    <UserCircle className="w-4 h-4 text-purple-300" />
                    My Profile
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-primary font-semibold shadow-lg"
              >
                Browse All Teams
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
