import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { API_BASE } from '../config';

export const AppContext = createContext();

// Helper to get auth token
const getToken = () => localStorage.getItem('teamup_token');

export function AppProvider({ children }) {
  // UI State
  const [activePage, setActivePage] = useState('home');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Data State — strictly from database, no fake mock teams
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  // Load active teams from REST API
  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch(`${API_BASE}/teams`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTeams(data.map((item) => ({ ...item, id: item._id || item.id })));
          } else {
            setTeams([]);
          }
        } else {
          setTeams([]);
        }
      } catch (err) {
        console.error('Failed to load teams from backend:', err);
        setTeams([]);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    }
    fetchTeams();
  }, []);

  const handleOpenTeamDetailsFromHome = (teamId) => {
    setSelectedTeamId(teamId);
    setActivePage('dashboard');
  };

  const handleOpenCreateModal = () => {
    setActivePage('dashboard');
    setIsCreateModalOpen(true);
  };

  // ── Create Team (requires auth token) ─────────────────────────────────────
  const createTeam = useCallback(async (newTeam) => {
    const token = getToken();
    if (!token) {
      return { success: false, message: 'Please sign in to list your project.' };
    }
    try {
      const res = await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTeam),
      });
      const data = await res.json();
      if (res.ok) {
        const savedTeam = data.team || data;
        const formattedTeam = { ...savedTeam, id: savedTeam._id || savedTeam.id };
        setTeams((prev) => [formattedTeam, ...prev]);
        return { success: true, team: formattedTeam };
      }
      return { success: false, message: data.message || 'Failed to create team.' };
    } catch (err) {
      console.error('Error creating team:', err);
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  // ── Delete Team — Admin only (requires auth token) ─────────────────────────
  const deleteTeam = useCallback(async (teamId) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/admin/teams/${teamId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTeams((prev) => prev.filter((t) => (t._id || t.id) !== teamId));
        return { success: true };
      }
      const data = await res.json();
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Network error.' };
    }
  }, []);

  // ── Request to Join a Team (requires auth token) ───────────────────────────
  const requestJoin = useCallback(async (teamId, role = '', note = '') => {
    const token = getToken();
    if (!token) {
      return { success: false, message: 'Please sign in to apply to join a squad.' };
    }
    try {
      const res = await fetch(`${API_BASE}/teams/${teamId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role, note }),
      });
      const data = await res.json();
      if (res.ok && data.team) {
        const updated = { ...data.team, id: data.team._id || data.team.id };
        setTeams((prev) => prev.map((t) => ((t._id || t.id) === (updated._id || updated.id) ? updated : t)));
      }
      return { success: res.ok, message: data.message };
    } catch (err) {
      return { success: false, message: 'Network error.' };
    }
  }, []);

  // ── Manage Join Request (Team Leader accepts/rejects) ──────────────────────
  const manageJoinRequest = useCallback(async (teamId, userId, status) => {
    const token = getToken();
    if (!token) {
      return { success: false, message: 'Please sign in to manage join requests.' };
    }
    try {
      const res = await fetch(`${API_BASE}/teams/${teamId}/join/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.team) {
        const updated = { ...data.team, id: data.team._id || data.team.id };
        setTeams((prev) => prev.map((t) => ((t._id || t.id) === (updated._id || updated.id) ? updated : t)));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Network error.' };
    }
  }, []);

  // ── Remove Member (Team Leader or Admin removes a teammate) ───────────────
  const removeMember = useCallback(async (teamId, userId) => {
    const token = getToken();
    if (!token) {
      return { success: false, message: 'Please sign in to manage squad members.' };
    }
    try {
      const res = await fetch(`${API_BASE}/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.team) {
        const updated = { ...data.team, id: data.team._id || data.team.id };
        setTeams((prev) => prev.map((t) => ((t._id || t.id) === (updated._id || updated.id) ? updated : t)));
        return { success: true, message: data.message, team: updated };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  // ── Join Team (fallback) ───────────────────────────────────────────────────
  const joinTeam = useCallback((teamId) => {
    setTeams((prevTeams) =>
      prevTeams
        .map((team) => {
          if ((team._id || team.id) === teamId) return { ...team, membersCount: team.membersCount + 1 };
          return team;
        })
    );
  }, []);

  const toggleBookmark = useCallback((id) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        // UI State & Actions
        activePage,
        setActivePage,
        authMode,
        setAuthMode,
        isCreateModalOpen,
        setIsCreateModalOpen,
        selectedTeamId,
        setSelectedTeamId,
        handleOpenTeamDetailsFromHome,
        handleOpenCreateModal,
        // Data State & Actions
        teams,
        loading,
        hasFetched,
        bookmarks,
        createTeam,
        deleteTeam,
        requestJoin,
        manageJoinRequest,
        removeMember,
        joinTeam,
        toggleBookmark,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
