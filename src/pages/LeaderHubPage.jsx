import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import { API_BASE } from '../config';
import {
  Crown, Users, ShieldAlert, ShieldCheck, UserMinus,
  CheckCircle2, XCircle, AlertTriangle, MessageSquare,
  Sparkles, Lock, ArrowRight, UserPlus, Clock, Mail,
  BookOpen, Code2, Trash2, RefreshCw
} from 'lucide-react';

export default function LeaderHubPage() {
  const { teams, setActivePage, removeMember, manageJoinRequest, setIsCreateModalOpen } = useContext(AppContext);
  const { user, token, isLoggedIn, isAdmin } = useAuthContext();

  // Helper to determine if current user is the leader of a given squad
  const isLeaderOf = (t) => {
    if (!user || !t) return false;
    if (isAdmin) return true;
    const uid = String(user.id || user._id || '');
    const cId = t.createdBy?._id ? String(t.createdBy._id) : String(t.createdBy || '');
    const isCreator = cId === uid;
    const isEmailMatch = t.leaderEmail && user.email && t.leaderEmail.toLowerCase() === user.email.toLowerCase();
    const isNameMatch = t.leaderName && user.name && t.leaderName.toLowerCase() === user.name.toLowerCase();
    return isCreator || isEmailMatch || isNameMatch;
  };

  const myLedTeams = useMemo(() => teams.filter(isLeaderOf), [teams, user, isAdmin]);

  const [selectedTeamId, setSelectedTeamId] = useState(myLedTeams[0]?.id || myLedTeams[0]?._id || '');
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }
  const [memberToRemove, setMemberToRemove] = useState(null); // member object to show modal
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-select first led team if none selected
  useEffect(() => {
    if (myLedTeams.length > 0) {
      const exists = myLedTeams.some((t) => (t.id || t._id) === selectedTeamId);
      if (!exists) {
        setSelectedTeamId(myLedTeams[0].id || myLedTeams[0]._id);
      }
    }
  }, [myLedTeams, selectedTeamId]);

  // Fetch populated member data for the selected squad
  const fetchFullTeamDetails = async (teamId) => {
    if (!teamId || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/teams/${teamId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.team) {
        setTeamData(data.team);
      } else {
        // Fallback to team in AppContext
        const fallback = teams.find((t) => (t.id || t._id) === teamId);
        setTeamData(fallback || null);
      }
    } catch (err) {
      console.error('Failed to fetch squad details:', err);
      const fallback = teams.find((t) => (t.id || t._id) === teamId);
      setTeamData(fallback || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeamId && token) {
      fetchFullTeamDetails(selectedTeamId);
    }
  }, [selectedTeamId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle removing a member from the squad
  const handleConfirmRemove = async () => {
    if (!memberToRemove || !selectedTeamId) return;
    setIsProcessing(true);
    setFeedback(null);

    const memberId = memberToRemove._id || memberToRemove.id;
    const memberName = memberToRemove.name || 'Member';

    const result = await removeMember(selectedTeamId, memberId);
    setIsProcessing(false);
    setMemberToRemove(null);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: `${memberName} was successfully removed from the squad.`,
      });
      fetchFullTeamDetails(selectedTeamId);
    } else {
      setFeedback({
        type: 'error',
        message: result.message || `Failed to remove ${memberName}.`,
      });
    }
  };

  // Handle accepting/rejecting a join request
  const handleJoinDecision = async (applicantUserId, applicantName, status) => {
    if (!selectedTeamId) return;
    setIsProcessing(true);
    setFeedback(null);

    const result = await manageJoinRequest(selectedTeamId, applicantUserId, status);
    setIsProcessing(false);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: status === 'accepted'
          ? `Accepted ${applicantName} into the squad!`
          : `Declined join request from ${applicantName}.`,
      });
      fetchFullTeamDetails(selectedTeamId);
    } else {
      setFeedback({
        type: 'error',
        message: result.message || 'Action failed. Please try again.',
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. RESTRICTION GATE: Not signed in
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-slate-950/90 border border-purple-500/30 backdrop-blur-xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/40 border border-purple-400/40">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <div className="relative z-10 max-w-lg mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" /> Authentication Required
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Team Leader Access Only</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Squad management controls are restricted to authenticated hackathon team leaders. Please sign in to your leader profile to manage your team.
            </p>
          </div>
          <div className="relative z-10 pt-2 flex justify-center">
            <button
              onClick={() => setActivePage('login')}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 border border-purple-400/30"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. RESTRICTION GATE: Signed in, but NOT a team leader
  // ─────────────────────────────────────────────────────────────────────────────
  if (myLedTeams.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-slate-950/90 border border-amber-500/30 backdrop-blur-xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-amber-500/30 border border-amber-400/40">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <div className="relative z-10 max-w-lg mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" /> Restricted Tab
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Team Leaders Only</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              You are currently signed in as <strong className="text-white font-semibold">{user.name}</strong>, but you are not registered as the leader of any active hackathon squad.
            </p>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 text-left space-y-2 mt-4">
              <p className="font-semibold text-purple-200 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> How to gain Team Leader access:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Create and post a new hackathon project squad from the Dashboard.</li>
                <li>As the creator, you will automatically be assigned as Squad Leader with full member management privileges.</li>
              </ul>
            </div>
          </div>
          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setActivePage('dashboard');
                if (setIsCreateModalOpen) setIsCreateModalOpen(true);
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-purple-400/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create a Squad on Dashboard</span>
            </button>
            <button
              onClick={() => setActivePage('dashboard')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span>Browse Existing Squads</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. AUTHORIZED TEAM LEADER DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  const currentTeam = myLedTeams.find((t) => (t.id || t._id) === selectedTeamId) || myLedTeams[0];

  // Resolve leader identity to filter out duplicates from the member list
  const leaderId = String(
    teamData?.createdBy?._id ||
    teamData?.createdBy?.id ||
    teamData?.createdBy ||
    currentTeam?.createdBy?._id ||
    currentTeam?.createdBy?.id ||
    currentTeam?.createdBy ||
    user?.id ||
    user?._id ||
    ''
  ).toLowerCase();

  const leaderEmail = (
    teamData?.createdBy?.email ||
    currentTeam?.createdBy?.email ||
    currentTeam?.leaderEmail ||
    user?.email ||
    ''
  ).toLowerCase();

  const leaderName = (
    teamData?.createdBy?.name ||
    currentTeam?.createdBy?.name ||
    currentTeam?.leaderName ||
    user?.name ||
    ''
  ).toLowerCase();

  const isLeaderMember = (m) => {
    if (!m) return false;
    const mId = String(m._id || m.id || m).toLowerCase();
    const mEmail = m.email ? String(m.email).toLowerCase() : '';
    const mName = m.name ? String(m.name).toLowerCase() : '';

    if (leaderId && mId === leaderId) return true;
    if (leaderEmail && mEmail === leaderEmail) return true;
    if (leaderName && mName === leaderName) return true;
    return false;
  };

  const rawMembers = Array.isArray(teamData?.members)
    ? teamData.members
    : Array.isArray(currentTeam?.members)
    ? currentTeam.members
    : [];

  // Exclude the leader from teammatesList so the leader is only displayed once
  const teammatesList = rawMembers.filter((m) => !isLeaderMember(m));

  const pendingRequests = Array.isArray(teamData?.joinRequests)
    ? teamData.joinRequests.filter((r) => r.status === 'pending')
    : Array.isArray(currentTeam?.joinRequests)
    ? currentTeam.joinRequests.filter((r) => r.status === 'pending')
    : [];

  const maxMembers = currentTeam?.maxMembers || 4;
  // Total roster = 1 leader + non-leader teammates
  const currentTotal = 1 + teammatesList.length;
  const isFull = currentTotal >= maxMembers;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Official Team Leader Control Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Squad Management
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Review your roster, manage enrolled members, approve new applications, and keep your winning team on track.
          </p>
        </div>

        {/* Squad Switcher if user leads multiple teams */}
        {myLedTeams.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-900/80 border border-purple-500/30 p-2 rounded-2xl">
            <span className="text-xs font-semibold text-slate-300 pl-2">Managing:</span>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {myLedTeams.map((t) => (
                <option key={t.id || t._id} value={t.id || t._id}>
                  👑 {t.title} ({t.hackathonName || 'Hackathon'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold border ${
          feedback.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
            : 'bg-red-500/15 border-red-500/40 text-red-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Squad Overview & Roster Capacity Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                {currentTeam?.category || 'Hackathon Squad'}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Hackathon: <strong className="text-white">{currentTeam?.hackathonName || 'Global Sprint'}</strong>
              </span>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              {currentTeam?.title}
              <Crown className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl line-clamp-2">
              {currentTeam?.tagline || currentTeam?.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('chat')}
              className="px-4 py-2.5 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/40 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-purple-200" />
              <span>Open Squad Chat</span>
            </button>
            <button
              onClick={() => fetchFullTeamDetails(selectedTeamId)}
              disabled={loading}
              title="Refresh Roster"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 text-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400">Current Roster</p>
            <p className="text-2xl font-black text-white mt-1">
              {currentTotal} <span className="text-sm font-normal text-slate-400">/ {maxMembers}</span>
            </p>
            <p className={`text-[10px] font-bold mt-1 ${isFull ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isFull ? 'Squad Capacity Reached' : `${maxMembers - currentTotal} Open Seat(s)`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400">Pending Applications</p>
            <p className="text-2xl font-black text-purple-200 mt-1">
              {pendingRequests.length}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              {pendingRequests.length > 0 ? 'Review & take action below' : 'No pending requests'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-xs text-slate-400">Target Roles</p>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {(currentTeam?.openRoles || []).map((r, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {typeof r === 'string' ? r : r?.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: ENROLLED MEMBERS MANAGEMENT (WITH REMOVE ACTION) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">Enrolled Members ({currentTotal})</h3>
          </div>
          <span className="text-xs text-slate-400">
            Only the Team Leader can remove members from the active squad.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Team Leader Card (You) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-950 border border-amber-400/30 backdrop-blur-md flex items-start justify-between gap-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 text-base font-black shadow-lg shadow-amber-500/30 border border-amber-300">
                {currentTeam?.leaderAvatar || (currentTeam?.leaderName ? currentTeam.leaderName.substring(0, 2).toUpperCase() : 'TL')}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">
                    {currentTeam?.leaderName || user.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-400/40 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> Leader (You)
                  </span>
                </div>
                {currentTeam?.leaderEmail && (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" /> {currentTeam.leaderEmail}
                  </p>
                )}
                <p className="text-xs text-amber-200/80 font-medium pt-1">
                  Founder & Primary Coordinator
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 font-semibold">
              Permanent Lead
            </span>
          </div>

          {/* Enrolled Teammates (Leader excluded) */}
          {teammatesList.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/15 text-center flex flex-col items-center justify-center space-y-2">
              <Users className="w-8 h-8 text-slate-500" />
              <p className="text-sm font-semibold text-slate-300">No other members enrolled yet</p>
              <p className="text-xs text-slate-400 max-w-xs">
                When hackers apply to your squad and you accept them, they will appear here with member controls.
              </p>
            </div>
          ) : (
            teammatesList.map((m) => {
              const memberId = m._id || m.id || String(m);
              const memberName = m.name || 'Enrolled Member';
              const memberEmail = m.email || '';
              const memberBio = m.bio || '';
              const memberSkills = Array.isArray(m.skills) ? m.skills : [];
              const memberAvatar = m.avatar || (memberName ? memberName.substring(0, 2).toUpperCase() : 'EM');

              return (
                <div
                  key={memberId}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-white/15 backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-purple-400/40 transition-all shadow-md group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-base font-black shadow-md border border-cyan-400/40">
                        {memberAvatar}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-bold text-white">{memberName}</h4>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            Member
                          </span>
                        </div>
                        {memberEmail && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" /> {memberEmail}
                          </p>
                        )}
                        {memberBio && (
                          <p className="text-xs text-slate-300 line-clamp-2 pt-1 italic">
                            "{memberBio}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Remove Member Trigger */}
                    <button
                      onClick={() => setMemberToRemove(m)}
                      disabled={isProcessing}
                      title={`Remove ${memberName} from squad`}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 hover:border-red-500/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>

                  {/* Skills badges */}
                  {memberSkills.length > 0 && (
                    <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Skills:</span>
                      {memberSkills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-200 text-[10px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── SECTION 2: PENDING JOIN APPLICATIONS (ACCEPT / DECLINE) ── */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white">
              Pending Join Applications ({pendingRequests.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Hacker applicants waiting for your decision
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-200">All applications processed!</p>
            <p className="text-xs text-slate-400">
              When hackers apply from the dashboard, their pitch, role, and skills will appear here for 1-click review.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req, idx) => {
              const applicant = req.user || {};
              const applicantId = applicant._id || applicant.id || String(applicant);
              const applicantName = applicant.name || 'Anonymous Hacker';
              const applicantEmail = applicant.email || '';
              const applicantBio = applicant.bio || '';
              const applicantSkills = Array.isArray(applicant.skills) ? applicant.skills : [];
              const targetRole = req.role || 'Contributor';

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-white">{applicantName}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 text-xs font-bold border border-purple-400/30">
                        Target Role: {targetRole}
                      </span>
                      {applicantEmail && (
                        <span className="text-xs text-slate-400">({applicantEmail})</span>
                      )}
                    </div>

                    {req.note && (
                      <p className="text-xs text-amber-200/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-400/20">
                        <strong>Pitch:</strong> "{req.note}"
                      </p>
                    )}

                    {applicantBio && !req.note && (
                      <p className="text-xs text-slate-300">
                        <strong>Bio:</strong> {applicantBio}
                      </p>
                    )}

                    {applicantSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {applicantSkills.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.2 rounded bg-slate-800 text-[10px] text-purple-200 border border-white/10"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleJoinDecision(applicantId, applicantName, 'accepted')}
                      disabled={isProcessing || isFull}
                      title={isFull ? 'Squad capacity is full' : 'Accept into squad'}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 border border-emerald-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={() => handleJoinDecision(applicantId, applicantName, 'rejected')}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:border-red-500/40 border border-white/20 text-slate-200 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL: REMOVE MEMBER CONFIRMATION ── */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-red-500/40 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-400/40 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white">
                Remove {memberToRemove.name || 'Member'}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Are you sure you want to remove <strong className="text-white font-semibold">{memberToRemove.name}</strong> from <span className="text-purple-300 font-bold">{currentTeam?.title}</span>?
              </p>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 text-left space-y-1 mt-2">
                <p className="font-bold flex items-center gap-1 text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Consequences:
                </p>
                <p>• They will be removed from your active squad roster immediately.</p>
                <p>• Their access to the private Squad Chat will be revoked.</p>
                <p>• The team slot will reopen for new applicants.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToRemove(null)}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 border border-red-400/40"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Confirm Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

