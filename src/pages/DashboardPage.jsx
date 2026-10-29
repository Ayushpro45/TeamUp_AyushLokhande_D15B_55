import React, { useEffect, useMemo, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import TeamCard from '../components/TeamCard';
import TeamDetailModal from '../components/TeamDetailModal';
import CreateTeamModal from '../components/CreateTeamModal';
import { Search, Filter, PlusCircle, Sparkles, Layers, Check, RefreshCw, AlertTriangle, Lock, Mail, User, CheckCircle2, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

// ─── Skeleton loading card ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-20 rounded-full bg-white/10" />
          <div className="h-5 w-36 rounded-lg bg-white/15" />
          <div className="h-3 w-full rounded-full bg-white/10" />
          <div className="h-3 w-3/4 rounded-full bg-white/10" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/10 shrink-0" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-24 rounded-full bg-white/10" />
        <div className="h-6 w-20 rounded-full bg-white/10" />
      </div>
      <div className="h-9 w-full rounded-xl bg-white/10 mt-2" />
    </div>
  );
}

const CATEGORIES = [
  'All',
  'AI / ML',
  'AI / Sustainability',
  'AR/VR / Health',
  'DevTools / Open Source',
  'Web3 / Blockchain',
  'HealthTech',
  'Sustainability',
];

export default function DashboardPage() {
  const { 
    isCreateModalOpen, 
    setIsCreateModalOpen, 
    selectedTeamId, 
    setSelectedTeamId,
    setActivePage,
    teams, 
    loading, 
    hasFetched, 
    bookmarks, 
    createTeam, 
    manageJoinRequest,
    toggleBookmark 
  } = useContext(AppContext);
  const { isLoggedIn, user } = useAuthContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Debounce search so filtering only triggers 300ms after the user stops typing
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Since loading is handled by context, we don't need to refetch on mount here
  // removed useEffect(() => refetch(), [refetch])

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const q = debouncedSearch.toLowerCase();
      const matchesSearch =
        !q ||
        team.title.toLowerCase().includes(q) ||
        team.tagline.toLowerCase().includes(q) ||
        team.rolesNeeded.some((role) => role.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'All' ||
        team.category.includes(selectedCategory) ||
        selectedCategory.includes(team.category);

      const matchesBookmark = !showBookmarksOnly || bookmarks.includes(team.id);

      return matchesSearch && matchesCategory && matchesBookmark;
    });
  }, [teams, debouncedSearch, selectedCategory, showBookmarksOnly, bookmarks]);

  const activeTeamForModal = useMemo(
    () => teams.find((t) => (t.id || t._id) === selectedTeamId) || null,
    [teams, selectedTeamId]
  );

  // Find all pending join requests for teams created by the logged-in user (e.g. Deepak)
  const pendingRequests = useMemo(() => {
    if (!user || !teams) return [];
    const list = [];
    teams.forEach((team) => {
      const isLeader =
        (team.createdBy?._id && String(team.createdBy._id) === String(user.id)) ||
        (team.createdBy && String(team.createdBy) === String(user.id)) ||
        (team.createdBy?.email && team.createdBy.email.toLowerCase() === user.email?.toLowerCase()) ||
        (team.leaderName && team.leaderName.toLowerCase() === user.name?.toLowerCase());

      if (isLeader && Array.isArray(team.joinRequests)) {
        team.joinRequests.forEach((req) => {
          if (req.status === 'pending') {
            list.push({ team, request: req });
          }
        });
      }
    });
    return list;
  }, [teams, user]);

  const isSearching = searchQuery !== debouncedSearch;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">

      {/* Dashboard Top Header Bar */}
      <div className="glass-box rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Live Hackathon Roster
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Squad Finder Dashboard
            </h1>
            <p className="text-slate-200 text-sm sm:text-base mt-1 font-normal">
              Filter by match score, required tech skills, or category to claim your spot.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isLoggedIn) {
                setActivePage('login');
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="self-start md:self-auto px-5 py-3 rounded-xl btn-primary font-bold text-sm shadow-xl animate-pulse-glow flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            {isLoggedIn ? (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>List Your Project</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-purple-200" />
                <span>Sign In to List Project</span>
              </>
            )}
          </button>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex flex-col md:flex-row items-center gap-4 pt-2 border-t border-white/15">

          {/* Search Field */}
          <div className="relative w-full md:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
              {isSearching ? (
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
            <input
              type="text"
              id="dashboard-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role (e.g. Computer Vision, Unity, Fullstack), title, or tech stack…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
            />
          </div>

          {/* Bookmarks Filter Toggle */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                showBookmarksOnly
                  ? 'bg-pink-500/30 border-pink-400 text-pink-200'
                  : 'bg-slate-950/70 border-white/20 text-slate-300 hover:text-white'
              }`}
            >
              <span>Saved ({bookmarks.length})</span>
              {showBookmarksOnly && <Check className="w-3.5 h-3.5 text-pink-300" />}
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-900/50 border border-purple-400/40'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Leader Notifications: Pending Squad Applications ─────────────── */}
      {pendingRequests.length > 0 && (
        <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-900/90 backdrop-blur-xl p-6 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <Mail className="w-5 h-5 text-purple-300 animate-bounce" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Incoming Squad Join Requests
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-500/30 text-pink-300 text-xs font-black border border-pink-500/40">
                    {pendingRequests.length} New
                  </span>
                </h2>
                <p className="text-xs text-purple-200">
                  Review and accept hackers wanting to join your hackathon squad.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(({ team, request }) => {
              const applicant = request.user || {};
              const applicantId = applicant._id || request.user;
              return (
                <div
                  key={request._id || applicantId}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                        Squad: {team.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending Review
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {applicant.name || 'Applicant'}
                      <span className="text-xs font-normal text-slate-400">({applicant.email || 'Hacker'})</span>
                    </h4>
                    {request.role && (
                      <p className="text-xs text-purple-200">
                        Applying for: <strong className="text-white">{request.role}</strong>
                      </p>
                    )}
                    {request.note && (
                      <p className="text-xs text-slate-300 italic bg-black/20 p-2 rounded-lg border border-white/5">
                        "{request.note}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => manageJoinRequest(team._id || team.id, applicantId, 'accepted')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept Hacker
                    </button>
                    <button
                      onClick={() => manageJoinRequest(team._id || team.id, applicantId, 'rejected')}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-200 text-slate-300 text-xs font-semibold transition-all border border-white/10"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* removed error banner since it's not applicable with initial hardcoded context state */}

      {/* Grid Status Header */}
      {!loading && (
        <div className="flex items-center justify-between px-2 text-sm text-slate-300 font-medium">
          <span>
            Showing <strong className="text-white">{filteredTeams.length}</strong> active teams
            {isSearching && <span className="text-purple-400 ml-2 text-xs">• searching…</span>}
          </span>
          <span className="text-xs text-purple-200">Responsive Grid View (1 to 3 columns)</span>
        </div>
      )}

      {/* Loading Skeleton Grid */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Team Cards Grid */}
      {!loading && filteredTeams.length === 0 && hasFetched && (
        <div className="glass-box rounded-3xl p-12 text-center space-y-4">
          <Layers className="w-12 h-12 text-purple-300 mx-auto opacity-70" />
          <h3 className="text-xl font-bold text-white">No Matching Teams Found</h3>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Try adjusting your search keywords or category filters to discover active hackathon projects.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setShowBookmarksOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600/60 hover:bg-purple-600 text-white text-xs font-semibold border border-purple-400/30 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {!loading && filteredTeams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onSelectTeam={(t) => setSelectedTeamId(t.id)}
              onToggleBookmark={toggleBookmark}
              isBookmarked={bookmarks.includes(team.id)}
            />
          ))}
        </div>
      )}

      {/* Team Detail Modal */}
      {selectedTeamId && activeTeamForModal && (
        <TeamDetailModal
          team={activeTeamForModal}
          onClose={() => setSelectedTeamId(null)}
        />
      )}

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <CreateTeamModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreateTeam={createTeam}
        />
      )}

    </div>
  );
}
