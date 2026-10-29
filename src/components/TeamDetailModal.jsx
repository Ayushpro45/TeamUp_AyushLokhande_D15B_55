import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import {
  X, Users, Sparkles, CheckCircle2, Shield, Calendar, ArrowRight,
  MessageSquare, Send, Check, User, Clock, AlertCircle, Lock
} from 'lucide-react';
import TeamChat from './TeamChat';

export default function TeamDetailModal({ team, onClose }) {
  const { joinTeam, requestJoin, manageJoinRequest, setActivePage } = useContext(AppContext);
  const { user, isLoggedIn } = useAuthContext();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'chat'
  const [applicantRole, setApplicantRole] = useState(team?.rolesNeeded?.[0] || '');
  const [note, setNote] = useState('');
  const [applied, setApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!team) return null;

  // Determine if the current viewer is the leader of this team
  const isLeader = Boolean(
    user &&
    ((team.createdBy?._id && String(team.createdBy._id) === String(user.id)) ||
     (team.createdBy && String(team.createdBy) === String(user.id)) ||
     (team.createdBy?.email && team.createdBy.email.toLowerCase() === user.email.toLowerCase()) ||
     (team.leaderName && team.leaderName.toLowerCase() === user.name?.toLowerCase()))
  );

  // Check if current user is an accepted member
  const isMember = Boolean(
    user &&
    Array.isArray(team.members) &&
    team.members.some(
      (m) =>
        (m?._id && String(m._id) === String(user.id)) ||
        (m?.id && String(m.id) === String(user.id)) ||
        (m && String(m) === String(user.id)) ||
        (m?.email && user.email && m.email.toLowerCase() === user.email.toLowerCase())
    )
  );

  const isEnrolled = isLeader || isMember || user?.role === 'admin';

  // Compile list of currently enrolled members (Leader + accepted members)
  const enrolledMembersList = useMemo(() => {
    const list = [];
    const leaderItem = {
      id: team.createdBy?._id || team.createdBy || 'leader',
      name: team.createdBy?.name || team.leaderName || 'Team Leader',
      email: team.createdBy?.email || team.leaderEmail || '',
      avatar: team.createdBy?.avatar || team.leaderAvatar || (team.leaderName ? team.leaderName.substring(0, 2).toUpperCase() : 'TL'),
      skills: team.createdBy?.skills || [],
      bio: team.createdBy?.bio || '',
      isLeader: true,
      role: 'Team Leader',
    };
    list.push(leaderItem);

    if (Array.isArray(team.members)) {
      team.members.forEach((m) => {
        const mid = m?._id ? String(m._id) : m?.id ? String(m.id) : String(m);
        const isLeaderSelf =
          (team.createdBy?._id && String(team.createdBy._id) === mid) ||
          (team.createdBy && String(team.createdBy) === mid) ||
          (m?.email && team.createdBy?.email && m.email.toLowerCase() === team.createdBy.email.toLowerCase()) ||
          (m?.name && team.leaderName && m.name.toLowerCase() === team.leaderName.toLowerCase());

        if (!isLeaderSelf) {
          const req = Array.isArray(team.joinRequests)
            ? team.joinRequests.find(
                (r) =>
                  (r.user?._id ? String(r.user._id) : String(r.user)) === mid &&
                  r.status === 'accepted'
              )
            : null;

          list.push({
            id: mid,
            name: m?.name || 'Enrolled Member',
            email: m?.email || '',
            avatar: m?.avatar || (m?.name ? m.name.substring(0, 2).toUpperCase() : 'EM'),
            skills: m?.skills || [],
            role: req?.role || 'Squad Member',
            isLeader: false,
          });
        }
      });
    }

    return list;
  }, [team]);

  // Check if current user already submitted a request
  const existingRequest = useMemo(() => {
    if (!user || !team.joinRequests) return null;
    return team.joinRequests.find(
      (r) =>
        (r.user?._id && String(r.user._id) === String(user.id)) ||
        (r.user && String(r.user) === String(user.id)) ||
        (r.user?.email && r.user.email.toLowerCase() === user.email.toLowerCase())
    );
  }, [team.joinRequests, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onClose();
      setActivePage('login');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    const res = await requestJoin(team.id || team._id, applicantRole, note);
    setIsSubmitting(false);
    if (res.success) {
      setApplied(true);
      joinTeam(team.id || team._id);
    } else {
      setErrorMessage(res.message || 'Failed to submit application.');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    await manageJoinRequest(team.id || team._id, userId, newStatus);
  };

  const pendingRequestsCount = (team.joinRequests || []).filter((r) => r.status === 'pending').length;
  const currentMembersCount = team.membersCount || (Array.isArray(team.members) ? team.members.length : 1);
  const maxCapacity = team.maxMembers || 4;
  const isFull = currentMembersCount >= maxCapacity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Glass Container */}
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 relative space-y-6 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 border border-white/20 text-slate-300 hover:text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
              {team.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {team.matchScore} Match Score
            </span>
            {isLeader && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold border border-purple-400/40 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Your Squad (Leader)
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">{team.title}</h2>
          <p className="text-base text-purple-100 font-medium leading-relaxed">{team.tagline}</p>
        </div>

        {/* Tab Switcher: Overview vs Real-Time Chat */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-purple-600/40 border border-purple-400 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Overview & Roles
            {isLeader && pendingRequestsCount > 0 && (
              <span className="ml-1 px-2 py-0.2 rounded-full bg-pink-500 text-white text-[10px] font-black">
                {pendingRequestsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-400 text-white shadow-lg shadow-purple-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Live Squad Chat</span>
            {!isLoggedIn ? (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-400/30 flex items-center gap-0.5 ml-1">
                <Lock className="w-2.5 h-2.5" /> Sign in
              </span>
            ) : !isEnrolled ? (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 text-[10px] font-semibold border border-amber-400/20 flex items-center gap-0.5 ml-1">
                <Lock className="w-2.5 h-2.5" /> Members
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {activeTab === 'chat' ? (
          <TeamChat
            team={team}
            onAuthAction={onClose}
            onSwitchToOverview={() => setActiveTab('overview')}
          />
        ) : (
          <>
            {/* Project Overview */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Project Description</h4>
              <p className="text-sm text-slate-200 leading-relaxed">{team.description || team.tagline}</p>
              
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Hackathon</span>
                  <span className="font-semibold text-white">{team.hackathonName || 'Global AI Hackathon'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Size</span>
                  <span className="font-semibold text-white">{team.membersCount} / {team.maxMembers} Members</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Team Lead</span>
                  <span className="font-semibold text-white">{team.leaderName}</span>
                </div>
              </div>
            </div>

            {/* Open Roles Needed */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Open Roles & Tech Stack</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {team.rolesNeeded.map((role, idx) => (
                  <div key={idx} className="bg-white/10 border border-white/20 p-3.5 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{role}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 text-[11px] font-semibold">
                      Required
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Enrolled Squad Members Roster (Leader & Accepted Teammates) ─── */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Enrolled Squad Members ({enrolledMembersList.length} / {team.maxMembers})</span>
                </h4>
                {isLeader ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[10px] font-bold">
                    👑 Squad Lead Controls
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                    Verified Roster
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {enrolledMembersList.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white/5 border border-white/10 hover:border-purple-400/30 transition-all p-3.5 rounded-2xl flex items-start gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md ${
                      member.isLeader
                        ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 shadow-purple-600/30 border border-purple-400/40'
                        : 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-600/20 border border-emerald-400/30'
                    }`}>
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white leading-tight truncate">
                          {member.name}
                        </span>
                        {member.isLeader ? (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 text-[10px] font-bold border border-purple-400/30 flex items-center gap-0.5">
                            <Shield className="w-2.5 h-2.5" /> Lead
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                            {member.role || 'Member'}
                          </span>
                        )}
                      </div>
                      {member.email && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{member.email}</span>
                        </p>
                      )}
                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {member.skills.slice(0, 3).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] text-slate-300 border border-white/10 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {enrolledMembersList.length === 1 && (
                <p className="text-xs text-slate-400 py-1 italic text-center">
                  Only the team leader is currently enrolled. When you accept join requests below, new members will be added here.
                </p>
              )}
            </div>

            {/* ─── LEADER VIEW: Manage Join Requests ─────────────────────────── */}
            {isLeader ? (
              <div className="rounded-2xl bg-purple-950/40 border border-purple-500/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Incoming Squad Applications ({team.joinRequests?.length || 0})
                  </h4>
                  {pendingRequestsCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                      {pendingRequestsCount} Pending Action
                    </span>
                  )}
                </div>

                {(!team.joinRequests || team.joinRequests.length === 0) ? (
                  <p className="text-xs text-slate-400 py-3 text-center italic">
                    No join requests yet. When developers apply to join your squad, they will appear here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {team.joinRequests.map((req, idx) => {
                      const applicant = req.user || {};
                      const applicantId = applicant._id || req.user;
                      return (
                        <div
                          key={req._id || idx}
                          className="bg-slate-900/80 border border-white/10 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{applicant.name || 'Applicant'}</span>
                              <span className="text-xs text-slate-400">({applicant.email || 'Hacker'})</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                req.status === 'accepted'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : req.status === 'rejected'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}>
                                {req.status.toUpperCase()}
                              </span>
                            </div>
                            {req.role && (
                              <p className="text-xs text-purple-200">
                                Applied for: <strong className="text-white">{req.role}</strong>
                              </p>
                            )}
                            {req.note && (
                              <p className="text-xs text-slate-300 italic">"{req.note}"</p>
                            )}
                          </div>

                          {req.status === 'pending' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleStatusChange(applicantId, 'accepted')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-md shadow-emerald-600/30"
                              >
                                <Check className="w-3.5 h-3.5" /> Accept
                              </button>
                              <button
                                onClick={() => handleStatusChange(applicantId, 'rejected')}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-slate-300 font-semibold text-xs transition-all"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* ─── APPLICANT VIEW: Apply Section ───────────────────────────── */
              <>
                {existingRequest ? (
                  <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-400/30 text-center space-y-2">
                    <Clock className="w-8 h-8 text-indigo-400 mx-auto" />
                    <h4 className="text-base font-bold text-white">Application Already Submitted</h4>
                    <p className="text-xs text-indigo-200">
                      Your join request for this squad is currently{' '}
                      <span className="font-bold uppercase text-white px-2 py-0.5 rounded bg-indigo-500/30">
                        {existingRequest.status}
                      </span>.
                    </p>
                  </div>
                ) : applied ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                    <h4 className="text-lg font-bold text-white">Application Sent to {team.leaderName}!</h4>
                    <p className="text-xs text-emerald-100">The team leader has received your request and can review it on their dashboard.</p>
                  </div>
                ) : isFull ? (
                  <div className="p-6 rounded-2xl bg-amber-500/15 border border-amber-400/35 text-center space-y-2">
                    <Users className="w-9 h-9 text-amber-400 mx-auto" />
                    <h4 className="text-base font-bold text-white">Squad is Currently Full</h4>
                    <p className="text-xs text-amber-200/90 max-w-md mx-auto leading-relaxed">
                      This squad has reached its maximum capacity of {maxCapacity} members ({currentMembersCount}/{maxCapacity}). New applications are paused until a spot opens up.
                    </p>
                    <p className="text-[11px] text-slate-400 pt-1">
                      If the team leader or administrator removes a teammate, applications will reopen automatically.
                    </p>
                  </div>
                ) : !isLoggedIn ? (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                    <Lock className="w-8 h-8 text-purple-300 mx-auto" />
                    <h4 className="text-base font-bold text-white">Sign In to Join this Squad</h4>
                    <p className="text-xs text-slate-300">
                      Create an account or log in to submit your application directly to {team.leaderName}.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        setActivePage('login');
                      }}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30"
                    >
                      Sign In to Apply
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-300" />
                      Apply to Join Squad
                    </h4>

                    {errorMessage && (
                      <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-200">Select Role You are Applying For</label>
                      <select
                        value={applicantRole}
                        onChange={(e) => setApplicantRole(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        {team.rolesNeeded.map((role, idx) => (
                          <option key={idx} value={role} className="bg-slate-900 text-white">
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-200">Brief Introduction / GitHub Link</label>
                      <textarea
                        rows={3}
                        required
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Hey! I have experience with React, Python, and PyTorch. Check out my GitHub: github.com/hacker..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                    </button>
                  </form>
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
