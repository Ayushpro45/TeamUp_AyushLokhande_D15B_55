import React, { useEffect, useState, useContext } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { API_BASE } from '../config';
import {
  ShieldCheck, Users, Layers, Trash2, Loader2,
  Mail, Calendar, Sparkles, RefreshCw, UserMinus
} from 'lucide-react';

function StatCard({ label, value, color = 'purple' }) {
  const colors = {
    purple: 'from-purple-600/30 to-indigo-600/20 border-purple-400/20 text-purple-200',
    amber:  'from-amber-600/20 to-orange-600/10 border-amber-400/20 text-amber-200',
  };
  return (
    <div className={`glass-box rounded-2xl p-5 bg-gradient-to-br ${colors[color]} border text-center`}>
      <p className="text-3xl font-extrabold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">{label}</p>
    </div>
  );
}

export default function AdminPanelPage() {
  const { user, token, isAdmin } = useAuthContext();
  const { setActivePage, removeMember } = useContext(AppContext);
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Guard: redirect non-admins
  useEffect(() => {
    if (!isAdmin) setActivePage('home');
  }, [isAdmin, setActivePage]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, tRes] = await Promise.all([
        fetch(`${API_BASE}/admin/users`, { headers: authHeaders }),
        fetch(`${API_BASE}/admin/teams`, { headers: authHeaders }),
      ]);
      if (uRes.ok) { const d = await uRes.json(); setUsers(d.users || []); }
      if (tRes.ok) { const d = await tRes.json(); setTeams(d.teams || []); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]); // eslint-disable-line

  const handleDeleteTeam = async (teamId, teamTitle) => {
    if (!window.confirm(`Delete "${teamTitle}"? This cannot be undone.`)) return;
    const res = await fetch(`${API_BASE}/admin/teams/${teamId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (res.ok) setTeams((prev) => prev.filter((t) => t._id !== teamId));
  };

  const handleRemoveTeamMember = async (teamId, memberId, memberName, teamTitle) => {
    if (!window.confirm(`Remove "${memberName}" from squad "${teamTitle}"? This will reopen a roster spot for new applicants.`)) {
      return;
    }
    const result = await removeMember(teamId, memberId);
    if (result.success) {
      setTeams((prev) =>
        prev.map((t) => {
          if (t._id === teamId) {
            const updatedMembers = Array.isArray(t.members)
              ? t.members.filter((m) => (m._id || m.id || m) !== memberId)
              : [];
            return {
              ...t,
              members: updatedMembers,
              membersCount: updatedMembers.length,
            };
          }
          return t;
        })
      );
    } else {
      alert(result.message || 'Failed to remove member from squad.');
    }
  };

  const handleDeleteUser = async (userId, userName, userEmail) => {
    if (userId === user?.id || userId === user?._id) {
      alert('You cannot delete your own admin account while logged in.');
      return;
    }
    if (!window.confirm(`Delete user "${userName}" (${userEmail}) from the platform? This will also remove any teams created by this user.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        // Refresh teams as well in case the user was creator or member
        const tRes = await fetch(`${API_BASE}/admin/teams`, { headers: authHeaders });
        if (tRes.ok) {
          const tData = await tRes.json();
          setTeams(tData.teams || []);
        }
      } else {
        alert(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Network error while deleting user.');
    }
  };

  const tabs = [
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'teams', label: 'All Teams', icon: Layers },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">

      {/* Header */}
      <div className="glass-box rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold border border-amber-400/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Panel
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Moderation Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Manage all users and teams across the platform.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-slate-200 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <StatCard label="Total Users" value={users.length} color="purple" />
          <StatCard label="Total Teams" value={teams.length} color="amber" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1.5 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              tab === id
                ? 'bg-purple-600/60 text-white shadow-md border border-purple-400/40 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-box rounded-3xl p-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Users Tab ── */}
          {tab === 'users' && (
            <div className="glass-box rounded-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-sm font-bold text-white">{users.length} registered users</h2>
              </div>
              <div className="divide-y divide-white/5">
                {users.length === 0 && (
                  <p className="text-center text-slate-400 py-12 text-sm">No users found.</p>
                )}
                {users.map((u) => (
                  <div key={u._id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${u.role === 'admin' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
                      {u.avatar || u.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' : 'bg-purple-500/20 text-purple-300 border-purple-400/30'}`}>
                        {u.role.toUpperCase()}
                      </span>
                      {u.createdAt && (
                        <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      )}
                      {u._id !== user?.id && u._id !== user?._id ? (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name, u.email)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-xs font-bold hover:bg-red-500/20 hover:text-red-200 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 shrink-0"
                          title={`Delete ${u.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-300/80 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-400/20 shrink-0">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Teams Tab ── */}
          {tab === 'teams' && (
            <div className="glass-box rounded-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-sm font-bold text-white">{teams.length} active teams</h2>
              </div>
              <div className="divide-y divide-white/5">
                {teams.length === 0 && (
                  <p className="text-center text-slate-400 py-12 text-sm">No teams found.</p>
                )}
                {teams.map((t) => (
                  <div key={t._id} className="flex items-start sm:items-center justify-between gap-4 px-6 py-4 hover:bg-white/5 transition-all flex-col sm:flex-row">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-bold text-white truncate">{t.title}</p>
                        {t.membersCount >= t.maxMembers ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                            FULL ({t.membersCount}/{t.maxMembers})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            OPEN ({t.membersCount}/{t.maxMembers})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{t.tagline}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 font-semibold">{t.category}</span>
                        {t.createdBy && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Mail className="w-3 h-3 text-purple-400" />
                            Creator / Lead: <strong className="text-white">{t.createdBy.name}</strong> ({t.createdBy.email})
                          </span>
                        )}
                      </div>

                      {/* Enrolled Squad Teammates with 1-click Admin Remove */}
                      {Array.isArray(t.members) && t.members.length > 0 && (
                        <div className="pt-2 border-t border-white/5 space-y-1.5">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Enrolled Squad Teammates:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {t.members.map((m) => {
                              const mid = m?._id || m?.id || m;
                              const isCreator =
                                (t.createdBy?._id || t.createdBy) === mid ||
                                (m?.email && t.createdBy?.email && m.email.toLowerCase() === t.createdBy.email.toLowerCase());
                              return (
                                <div key={mid} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
                                  <span className="font-semibold text-white">{m?.name || 'Teammate'}</span>
                                  {isCreator ? (
                                    <span className="text-[9px] text-amber-300 font-black px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/30">
                                      Lead
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTeamMember(t._id, mid, m?.name || 'Member', t.title)}
                                      className="text-[10px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-0.5 ml-1 font-semibold"
                                      title={`Remove ${m?.name} to reopen squad slot`}
                                    >
                                      <UserMinus className="w-3 h-3" /> Remove
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTeam(t._id, t.title)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-xs font-bold hover:bg-red-500/20 hover:text-red-200 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Team
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
