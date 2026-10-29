import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import ChatPage from './pages/ChatPage';
import LeaderHubPage from './pages/LeaderHubPage';

function AppContent() {
  const { activePage, setActivePage } = useContext(AppContext);

  return (
    <div className="min-h-screen relative selection:bg-purple-500 selection:text-white flex flex-col justify-between">

      {/* ── Layer 1: Fixed nebula wallpaper (Design.md §1.2) ── */}
      <div className="bg-nebula-fixed" aria-hidden="true" />

      {/* ── Layer 2: Animated colour gradient wash over nebula ── */}
      <div className="bg-gradient-animated fixed inset-0 z-[-1]" aria-hidden="true" />

      {/* Global Ambient Background Orbs — Design.md §1.1 Cosmic Palette */}
      {/* Nebula Purple: #2D0B5A — slow spin for nebula movement (Design.md §4) */}
      <div className="fixed top-[-10%] left-[15%] w-[520px] h-[520px] rounded-full pointer-events-none z-0 animate-spin-slow" style={{background:'radial-gradient(circle, rgba(45,11,90,0.55) 0%, transparent 70%)', filter:'blur(80px)'}} />
      <div className="fixed top-[10%] left-[50%] w-96 h-96 rounded-full blur-[140px] pointer-events-none z-0" style={{background:'rgba(45,11,90,0.35)'}} />
      <div className="fixed bottom-10 right-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none z-0" style={{background:'rgba(0,210,255,0.06)'}} />

      {/* App Content Wrap */}
      <div className="relative z-10 flex-1">

        {/* Sticky Navbar */}
        <Navbar />

        {/* View Router */}
        <main className="mt-2">
          {activePage === 'home'      && <HomePage />}
          {activePage === 'login'     && <LoginPage />}
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'chat'      && <ChatPage />}
          {activePage === 'leader'    && <LeaderHubPage />}
          {activePage === 'profile'   && <ProfilePage />}
          {activePage === 'admin'     && <AdminPanelPage />}
        </main>

      </div>

      {/* Global Glass Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/60 backdrop-blur-md py-6 px-4 text-center text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">TeamUp Hackathon Platform</span>
            <span>— Glassmorphic Spec-Driven App</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setActivePage('home')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => setActivePage('dashboard')} className="hover:text-white transition-colors">Dashboard</button>
            <button onClick={() => setActivePage('chat')} className="hover:text-white transition-colors">Squad Chat</button>
            <button onClick={() => setActivePage('login')} className="hover:text-white transition-colors">Sign In</button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
