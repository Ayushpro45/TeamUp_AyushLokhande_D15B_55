import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import TeamChat from '../components/TeamChat';
import {
  MessageSquare, Users, Sparkles, Radio, Lock, LogIn,
  UserPlus, ShieldAlert, ShieldCheck, ChevronRight, UserCheck
} from 'lucide-react';

export default function ChatPage() {
  const { teams, setActivePage, setAuthMode } = useContext(AppContext);
  const { user, isLoggedIn } = useAuthContext();

  // Helper to determine if the user is enrolled in a given squad
  const isUserEnrolled = (t) => {
    if (!user || !t) return false;
    if (user.role === 'admin') return true;
    const uid = String(user.id || user._id || '');
    const isLeader = Boolean(
      (t.createdBy?._id && String(t.createdBy._id) === uid) ||
      (t.createdBy && String(t.createdBy) === uid) ||
      (t.leaderEmail && user.email && t.leaderEmail.toLowerCase() === user.email.toLowerCase()) ||
      (t.leaderName && user.name && t.leaderName.toLowerCase() === user.name.toLowerCase())
    );
    const isMember = Boolean(
      Array.isArray(t.members) &&
      t.members.some((m) => {
        const mid = m?._id ? String(m._id) : m?.id ? String(m.id) : String(m);
        return mid === uid || (m?.email && user.email && m.email.toLowerCase() === user.email.toLowerCase());
      })
    );
    return isLeader || isMember;
  };

  const mySquads = useMemo(() => teams.filter(isUserEnrolled), [teams, user]);
  const otherSquads = useMemo(() => teams.filter((t) => !isUserEnrolled(t)), [teams, user]);

  const [selectedTeamId, setSelectedTeamId] = useState(
    mySquads[0]?.id || mySquads[0]?._id || teams[0]?.id || teams[0]?._id || 'general'
  );

  // Auto-switch to user's enrolled squad on load
  useEffect(() => {
    if (mySquads.length > 0) {
      const alreadySelectedMine = mySquads.some((s) => (s.id || s._id) === selectedTeamId);
      if (!alreadySelectedMine) {
        setSelectedTeamId(mySquads[0].id || mySquads[0]._id);
      }
    }
  }, [mySquads]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedTeam = teams.find((t) => (t.id || t._id) === selectedTeamId) || teams[0] || {
    id: 'general',
    title: 'Hackathon General Lounge',
    hackathonName: 'Global Hackathon 2026',
    leaderName: 'Lead Organizer',
  };

  const handleNavigateAuth = (mode = 'login') => {
    if (setAuthMode) setAuthMode(mode);
    if (setActivePage) setActivePage('login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          WebSockets Real-Time Communication
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Live Hackathon Squad Chat
        </h1>
        <p className="text-sm text-purple-200 max-w-xl mx-auto">
          Private, real-time messaging exclusively for enrolled members and team leads of hackathon projects.
        </p>
      </div>

      {!isLoggedIn ? (
        /* ── Restricted State for Ordinary / Unregistered Visitors ── */
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-purple-950/50 via-slate-900/80 to-slate-950/90 border border-purple-500/30 backdrop-blur-xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/40 border border-purple-400/40">
              <Lock className="w-10 h-10 text-white" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" /> Registered Members Only
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Squad Chat is Restricted
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Ordinary visitors cannot participate in squad discussions. To protect team privacy and avoid spam, only verified hackers who have signed in to their profile can join discussions for the squads they belong to.
              </p>
            </div>

            {/* CTAs */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleNavigateAuth('login')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-purple-400/30"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Your Profile</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigateAuth('signup')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-purple-300" />
                <span>Create Registered Profile</span>
              </button>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Enrolled Members Only</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <span>WebSocket Real-Time Sync</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-pink-400" />
                <span>Team Leader Collaboration</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Authenticated User State ── */
        <div className="space-y-6">
          {/* Squad Status & Room Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-200 font-semibold">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Select Squad Chat Room:</span>
              </div>
              <p className="text-xs text-slate-400">
                You are enrolled in <span className="text-emerald-400 font-bold">{mySquads.length}</span> of {teams.length} hackathon squads.
              </p>
            </div>

            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {mySquads.length > 0 && (
                <optgroup label="✅ Your Enrolled Squads (Can Chat)">
                  {mySquads.map((t) => (
                    <option key={t.id || t._id} value={t.id || t._id} className="bg-slate-900 text-white font-medium">
                      🟢 {t.title} — ({t.hackathonName || 'Hackathon'})
                    </option>
                  ))}
                </optgroup>
              )}
              {otherSquads.length > 0 && (
                <optgroup label="🔒 Other Platform Squads (Members Only)">
                  {otherSquads.map((t) => (
                    <option key={t.id || t._id} value={t.id || t._id} className="bg-slate-900 text-slate-400">
                      🔒 {t.title} [Not Enrolled]
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Real-Time Team Chat Component (Enforces enrollment internally) */}
          <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-2xl">
            <TeamChat team={selectedTeam} />
          </div>
        </div>
      )}
    </div>
  );
}
