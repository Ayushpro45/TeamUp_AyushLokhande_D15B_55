import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import {
  Bookmark, Users, Trophy, Briefcase, Trash2,
  UserPlus, CheckCircle2, Lock,
} from 'lucide-react';

export default function TeamCard({ team, onSelectTeam, onToggleBookmark, isBookmarked }) {
  const { deleteTeam, requestJoin, setActivePage } = useContext(AppContext);
  const { isLoggedIn, isAdmin, user } = useAuthContext();

  const isOwnTeam =
    isLoggedIn &&
    user &&
    (team.createdBy?._id === user.id ||
      team.createdBy === user.id ||
      team.leaderName === user.name);

  const currentCount = team.membersCount || (Array.isArray(team.members) ? team.members.length : 1);
  const isFull = currentCount >= team.maxMembers;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${team.title}"? This cannot be undone.`)) return;
    await deleteTeam(team._id || team.id);
  };

  const handleJoin = async (e) => {
    e.stopPropagation();
    const result = await requestJoin(team._id || team.id);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message || 'Could not send join request.');
    }
  };

  const handleGuestJoin = (e) => {
    e.stopPropagation();
    setActivePage('login');
  };

  return (
    <article
      className="group relative glass-box rounded-3xl p-6 flex flex-col gap-4 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(139,92,246,0.25)] hover:-translate-y-1 cursor-pointer border border-white/10 hover:border-purple-400/40 focus-within:border-purple-400/40"
      onClick={() => onSelectTeam(team)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelectTeam(team)}
      aria-label={`View team ${team.title}`}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300 bg-purple-500/10 border border-purple-400/20 px-2 py-0.5 rounded-full">
              {team.category}
            </span>
            {team.matchScore && (
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                ⚡ {team.matchScore} match
              </span>
            )}
          </div>
          <h3 className="text-lg font-extrabold text-white leading-tight truncate group-hover:text-purple-100 transition-colors">
            {team.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{team.tagline}</p>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(team.id || team._id); }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark team'}
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
            isBookmarked
              ? 'bg-pink-500/25 border-pink-400/50 text-pink-300'
              : 'bg-white/5 border-white/15 text-slate-400 hover:text-pink-300 hover:bg-pink-500/10'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-pink-400' : ''}`} />
        </button>
      </div>

      {/* Meta Row */}
      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
        <span className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          {team.hackathonName}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          {team.membersCount}/{team.maxMembers} members
        </span>
      </div>

      {/* Roles Needed */}
      {team.rolesNeeded?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {team.rolesNeeded.map((role) => (
            <span
              key={role}
              className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/25 text-indigo-200"
            >
              <Briefcase className="w-2.5 h-2.5" />
              {role}
            </span>
          ))}
        </div>
      )}

      {/* Leader */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/10">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
          {team.createdBy?.avatar || team.leaderAvatar || 'TU'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {team.createdBy?.name || team.leaderName || 'Team Leader'}
          </p>
          <p className="text-[10px] text-slate-400">Team Leader</p>
        </div>
      </div>

      {/* ── Action Button — role-aware ─────────────────────────────── */}
      <div onClick={(e) => e.stopPropagation()}>

        {/* Admin: Delete button */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-xs font-bold hover:bg-red-500/25 hover:text-red-200 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Team
          </button>
        )}

        {/* User (own team): badge */}
        {!isAdmin && isLoggedIn && isOwnTeam && (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Your Team
          </div>
        )}

        {/* User (not own team, not full): join button */}
        {!isAdmin && isLoggedIn && !isOwnTeam && !isFull && (
          <button
            onClick={handleJoin}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl btn-primary text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Request to Join
          </button>
        )}

        {/* User (not own team, full): full badge */}
        {!isAdmin && isLoggedIn && !isOwnTeam && isFull && (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold cursor-not-allowed">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Squad Full ({currentCount}/{team.maxMembers})
          </div>
        )}

        {/* Guest: sign in to join */}
        {!isLoggedIn && (
          <button
            onClick={handleGuestJoin}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/15 text-slate-300 text-xs font-bold hover:bg-white/10 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <Lock className="w-3.5 h-3.5" />
            Sign In to Join
          </button>
        )}
      </div>
    </article>
  );
}
