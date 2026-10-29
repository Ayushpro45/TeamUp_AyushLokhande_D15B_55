import React, { useEffect, useState, useRef, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';
import {
  Send, MessageSquare, Users, Sparkles, Shield, User,
  Lock, LogIn, UserPlus, ShieldAlert, ShieldCheck, AlertCircle, Radio,
  Clock, UserCheck, ArrowRight
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import { BACKEND_URL, API_BASE } from '../config';

// Dedicated Royal Gold / Amber palette for Platform Administrators
const ADMIN_PALETTE = {
  name: 'admin-gold',
  nameColor: 'text-amber-300 font-extrabold',
  avatarBg: 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600',
  avatarText: 'text-slate-950 font-black',
  avatarBorder: 'border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
  bubbleBg: 'bg-amber-950/45 border-amber-400/50 text-amber-50 shadow-lg shadow-amber-950/40',
  pillBg: 'bg-amber-500/25 text-amber-200 border-amber-400/60',
};

// 8 Vivid, mutually-exclusive color families (No duplicate hues)
const DISTINCT_PALETTES = [
  // 1. Electric Cyan (Bright neon cyan)
  {
    name: 'cyan',
    nameColor: 'text-cyan-300',
    avatarBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
    avatarText: 'text-white font-black',
    avatarBorder: 'border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.35)]',
    bubbleBg: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-50 shadow-lg shadow-cyan-950/40',
    pillBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50',
  },
  // 2. Hot Pink / Magenta (Vivid magenta)
  {
    name: 'pink',
    nameColor: 'text-pink-300',
    avatarBg: 'bg-gradient-to-tr from-pink-500 to-rose-600',
    avatarText: 'text-white font-black',
    avatarBorder: 'border-pink-400/60 shadow-[0_0_10px_rgba(236,72,153,0.35)]',
    bubbleBg: 'bg-pink-950/40 border-pink-500/40 text-pink-50 shadow-lg shadow-pink-950/40',
    pillBg: 'bg-pink-500/20 text-pink-200 border-pink-400/50',
  },
  // 3. Neon Emerald (Pure bright green)
  {
    name: 'emerald',
    nameColor: 'text-emerald-300',
    avatarBg: 'bg-gradient-to-tr from-emerald-500 to-green-600',
    avatarText: 'text-white font-black',
    avatarBorder: 'border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.35)]',
    bubbleBg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-50 shadow-lg shadow-emerald-950/40',
    pillBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50',
  },
  // 4. Flame Coral / Red-Orange (Bright neon coral)
  {
    name: 'coral',
    nameColor: 'text-rose-300',
    avatarBg: 'bg-gradient-to-tr from-rose-500 to-red-600',
    avatarText: 'text-white font-black',
    avatarBorder: 'border-rose-400/60 shadow-[0_0_10px_rgba(244,63,94,0.35)]',
    bubbleBg: 'bg-rose-950/40 border-rose-500/40 text-rose-50 shadow-lg shadow-rose-950/40',
    pillBg: 'bg-rose-500/20 text-rose-200 border-rose-400/50',
  },
  // 5. Electric Violet / Indigo (Deep luminous violet)
  {
    name: 'violet',
    nameColor: 'text-violet-300',
    avatarBg: 'bg-gradient-to-tr from-violet-600 to-indigo-700',
    avatarText: 'text-white font-black',
    avatarBorder: 'border-violet-400/60 shadow-[0_0_10px_rgba(139,92,246,0.35)]',
    bubbleBg: 'bg-violet-950/40 border-violet-500/40 text-violet-50 shadow-lg shadow-violet-950/40',
    pillBg: 'bg-violet-500/20 text-violet-200 border-violet-400/50',
  },
  // 6. Bright Lime / Chartreuse (Distinct electric lime)
  {
    name: 'lime',
    nameColor: 'text-lime-300',
    avatarBg: 'bg-gradient-to-tr from-lime-500 to-emerald-600',
    avatarText: 'text-slate-950 font-black',
    avatarBorder: 'border-lime-400/60 shadow-[0_0_10px_rgba(163,230,53,0.35)]',
    bubbleBg: 'bg-lime-950/40 border-lime-500/40 text-lime-50 shadow-lg shadow-lime-950/40',
    pillBg: 'bg-lime-500/20 text-lime-200 border-lime-400/50',
  },
  // 7. Sky / Sapphire (Bright sky blue)
  {
    name: 'sky',
    nameColor: 'text-sky-300',
    avatarBg: 'bg-gradient-to-tr from-sky-500 to-indigo-600',
    avatarText: 'text-white font-black',
    avatarBorder: 'border-sky-400/60 shadow-[0_0_10px_rgba(14,165,233,0.35)]',
    bubbleBg: 'bg-sky-950/40 border-sky-500/40 text-sky-50 shadow-lg shadow-sky-950/40',
    pillBg: 'bg-sky-500/20 text-sky-200 border-sky-400/50',
  },
  // 8. Sunset Orange (Warm deep orange)
  {
    name: 'orange',
    nameColor: 'text-orange-300',
    avatarBg: 'bg-gradient-to-tr from-orange-500 to-amber-600',
    avatarText: 'text-white font-black',
    avatarBorder: 'border-orange-400/60 shadow-[0_0_10px_rgba(249,115,22,0.35)]',
    bubbleBg: 'bg-orange-950/40 border-orange-500/40 text-orange-50 shadow-lg shadow-orange-950/40',
    pillBg: 'bg-orange-500/20 text-orange-200 border-orange-400/50',
  },
];

export default function TeamChat({ team, onAuthAction, onSwitchToOverview }) {
  const { user, token, isLoggedIn } = useAuthContext();
  const { setActivePage, setAuthMode, setSelectedTeamId } = useContext(AppContext);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const [showRoster, setShowRoster] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Compile list of currently enrolled roster members for this squad
  const enrolledRoster = useMemo(() => {
    const list = [];
    const leaderItem = {
      id: team?.createdBy?._id || team?.createdBy || 'leader',
      name: team?.createdBy?.name || team?.leaderName || 'Team Leader',
      email: team?.createdBy?.email || team?.leaderEmail || '',
      avatar: team?.createdBy?.avatar || team?.leaderAvatar || (team?.leaderName ? team.leaderName.substring(0, 2).toUpperCase() : 'TL'),
      isLeader: true,
    };
    list.push(leaderItem);

    if (Array.isArray(team?.members)) {
      team.members.forEach((m) => {
        const mid = m?._id ? String(m._id) : m?.id ? String(m.id) : String(m);
        const isLeaderSelf =
          (team?.createdBy?._id && String(team.createdBy._id) === mid) ||
          (team?.createdBy && String(team.createdBy) === mid) ||
          (m?.email && team?.createdBy?.email && m.email.toLowerCase() === team.createdBy.email.toLowerCase()) ||
          (m?.name && team?.leaderName && m.name.toLowerCase() === team.leaderName.toLowerCase());

        if (!isLeaderSelf) {
          list.push({
            id: mid,
            name: m?.name || 'Enrolled Member',
            email: m?.email || '',
            avatar: m?.avatar || (m?.name ? m.name.substring(0, 2).toUpperCase() : 'EM'),
            isLeader: false,
          });
        }
      });
    }

    return list;
  }, [team]);

  // Build a distinct, collision-free color map for every participant in this squad
  const userColorMap = useMemo(() => {
    const map = new Map();

    // Group regular participants (exclude admin who gets ADMIN_PALETTE)
    const participants = [];

    const addParticipant = (id, email, name) => {
      const isAdministrator =
        (name && name.toLowerCase() === 'admin') ||
        (email && email.toLowerCase() === 'admin@teamup.com');

      if (isAdministrator) return;

      const normId = id ? String(id._id || id).trim().toLowerCase() : '';
      const normEmail = email ? String(email).trim().toLowerCase() : '';
      const normName = name ? String(name).trim().toLowerCase() : '';

      if (!normId && !normEmail && !normName) return;

      // Group together if any of id, email, or name match an existing entry
      let found = participants.find(
        (p) =>
          (normId && p.id && p.id === normId) ||
          (normEmail && p.email && p.email === normEmail) ||
          (normName && p.name && p.name === normName)
      );

      if (!found) {
        found = { id: normId, email: normEmail, name: normName };
        participants.push(found);
      } else {
        if (!found.id && normId) found.id = normId;
        if (!found.email && normEmail) found.email = normEmail;
        if (!found.name && normName) found.name = normName;
      }
    };

    // 1. Leader from team object
    if (team?.createdBy) {
      addParticipant(
        team.createdBy._id || team.createdBy.id || team.createdBy,
        team.createdBy.email || team.leaderEmail,
        team.createdBy.name || team.leaderName
      );
    } else if (team?.leaderEmail || team?.leaderName) {
      addParticipant(null, team.leaderEmail, team.leaderName);
    }

    // 2. Members from team roster
    if (Array.isArray(enrolledRoster)) {
      enrolledRoster.forEach((m) => {
        addParticipant(m.id, m.email, m.name);
      });
    }

    // 3. Senders from message history
    if (Array.isArray(messages)) {
      messages.forEach((msg) => {
        const sId = msg.userId || (msg.sender?._id ? msg.sender._id : msg.sender);
        addParticipant(sId, msg.userEmail, msg.username);
      });
    }

    // Deterministically sort regular participants by name so color assignments are rock-solid & stable
    participants.sort((a, b) => {
      const nameA = (a.name || a.email || a.id || '').toLowerCase();
      const nameB = (b.name || b.email || b.id || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // Assign each distinct participant their own mutually exclusive color from DISTINCT_PALETTES
    participants.forEach((p, idx) => {
      const pal = DISTINCT_PALETTES[idx % DISTINCT_PALETTES.length];
      if (p.id) map.set(p.id, pal);
      if (p.email) map.set(p.email, pal);
      if (p.name) map.set(p.name, pal);
    });

    return map;
  }, [team, enrolledRoster, messages]);

  // Lookup helper that guarantees distinct, non-overlapping colors per participant
  const getParticipantPalette = (senderId, senderEmail, senderName, senderRole) => {
    // Platform Administrator gets the dedicated Royal Gold / Amber palette
    const isAdminUser =
      senderRole === 'admin' ||
      (senderName && senderName.toLowerCase() === 'admin') ||
      (senderEmail && senderEmail.toLowerCase() === 'admin@teamup.com');

    if (isAdminUser) {
      return ADMIN_PALETTE;
    }

    const normId = senderId ? String(senderId._id || senderId).trim().toLowerCase() : '';
    const normEmail = senderEmail ? String(senderEmail).trim().toLowerCase() : '';
    const normName = senderName ? String(senderName).trim().toLowerCase() : '';

    if (normId && userColorMap.has(normId)) return userColorMap.get(normId);
    if (normEmail && userColorMap.has(normEmail)) return userColorMap.get(normEmail);
    if (normName && userColorMap.has(normName)) return userColorMap.get(normName);

    return DISTINCT_PALETTES[0];
  };

  // Helper to reliably check if a message belongs to the current logged-in user
  const checkIsMe = (item) => {
    if (!user) return false;
    const uid = String(user.id || user._id || '').toLowerCase();
    const itemSenderId = item.userId
      ? String(item.userId).toLowerCase()
      : item.sender?._id
      ? String(item.sender._id).toLowerCase()
      : item.sender
      ? String(item.sender).toLowerCase()
      : '';

    if (uid && itemSenderId && uid === itemSenderId) return true;
    if (user.email && item.userEmail && user.email.toLowerCase() === item.userEmail.toLowerCase()) return true;
    if (user.name && item.username && user.name.toLowerCase() === item.username.toLowerCase()) return true;
    return false;
  };

  // Determine enrollment: Leader or accepted Member or Admin
  const isLeader = useMemo(() => {
    if (!user || !team) return false;
    const uid = String(user.id || user._id || '');
    return Boolean(
      (team.createdBy?._id && String(team.createdBy._id) === uid) ||
      (team.createdBy && String(team.createdBy) === uid) ||
      (team.createdBy?.email && user.email && team.createdBy.email.toLowerCase() === user.email.toLowerCase()) ||
      (team.leaderEmail && user.email && team.leaderEmail.toLowerCase() === user.email.toLowerCase()) ||
      (team.leaderName && user.name && team.leaderName.toLowerCase() === user.name.toLowerCase())
    );
  }, [user, team]);

  const isMember = useMemo(() => {
    if (!user || !team || !Array.isArray(team.members)) return false;
    const uid = String(user.id || user._id || '');
    return team.members.some((m) => {
      const mid = m?._id ? String(m._id) : m?.id ? String(m.id) : String(m);
      const mEmail = m?.email ? m.email.toLowerCase() : '';
      return mid === uid || (mEmail && user.email && mEmail === user.email.toLowerCase());
    });
  }, [user, team]);

  const isAdmin = user?.role === 'admin';
  const isEnrolled = isLeader || isMember || isAdmin;

  // Check if current user has a pending join request
  const existingRequest = useMemo(() => {
    if (!user || !team || !Array.isArray(team.joinRequests)) return null;
    const uid = String(user.id || user._id || '');
    return team.joinRequests.find((r) => {
      const rUid = r.user?._id ? String(r.user._id) : r.user ? String(r.user) : '';
      const rEmail = r.user?.email ? r.user.email.toLowerCase() : '';
      return (rUid === uid || (rEmail && user.email && rEmail === user.email.toLowerCase())) && r.status === 'pending';
    });
  }, [user, team]);

  // Load persistent message history from MongoDB Atlas on squad or auth change
  useEffect(() => {
    const teamId = team?.id || team?._id;
    if (!teamId || !token || !isLoggedIn || !isEnrolled) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    fetch(`${API_BASE}/teams/${teamId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          // Default initial welcome message if no messages exist yet
          setMessages([
            {
              username: team?.leaderName || 'Team Leader',
              message: `Welcome to the squad! Let's build something epic for ${team?.hackathonName || 'the hackathon'}. 🚀`,
              time: '10:00 AM',
              isLeader: true,
              userRole: 'lead',
              userAvatar: team?.leaderAvatar || (team?.leaderName ? team.leaderName.substring(0, 2).toUpperCase() : 'TL'),
            },
          ]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load squad message history:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [team, token, isLoggedIn, isEnrolled]);

  // Connect to backend Socket.IO only when user is authenticated AND enrolled in this squad
  useEffect(() => {
    if (!isLoggedIn || !token || !isEnrolled) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    setSocketError(null);

    // Pass the JWT token for backend authentication over WebSockets
    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setSocketError(null);
      // Join team-specific room only if enrolled
      const teamId = team?.id || team?._id;
      if (teamId) {
        socket.emit('joinTeam', teamId);
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      setConnected(false);
      setSocketError(err.message || 'Authentication error. Please sign in again.');
    });

    socket.on('chatError', (err) => {
      setSocketError(err.message || 'Failed to send message.');
    });

    socket.on('chatMessage', (data) => {
      setMessages((prev) => {
        if (data._id && prev.some((m) => m._id && String(m._id) === String(data._id))) {
          return prev;
        }
        return [...prev, data];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [team, isLoggedIn, token, isEnrolled]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNavigateAuth = (mode = 'login') => {
    if (setAuthMode) setAuthMode(mode);
    if (onAuthAction) onAuthAction();
    if (setActivePage) setActivePage('login');
  };

  const handleApplyToTeam = () => {
    if (onSwitchToOverview) {
      onSwitchToOverview();
    } else {
      if (setSelectedTeamId) setSelectedTeamId(team?.id || team?._id);
      if (setActivePage) setActivePage('dashboard');
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current || !connected || !isEnrolled) return;

    const socketMessage = {
      teamId: team?.id || team?._id,
      message: message.trim(),
      isLeader,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socketRef.current.emit('chatMessage', socketMessage);
    setMessage('');
  };

  // ─── GATE 1: Ordinary visitors / unauthenticated users CANNOT access chat ───
  if (!isLoggedIn || !user) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-slate-950/90 border border-purple-500/20 backdrop-blur-xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/30 border border-purple-400/40">
          <Lock className="w-8 h-8 text-white" />
        </div>

        <div className="relative z-10 max-w-md mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" /> Registered Members Only
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Squad Chat is Restricted
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Ordinary visitors cannot access or post in squad chats. Sign in to your verified hacker profile or register a new account to join real-time squad discussions.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleNavigateAuth('login')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-purple-400/30"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Your Profile</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateAuth('signup')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-purple-300" />
            <span>Register Hacker Account</span>
          </button>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authenticated Profiles Only
          </span>
          <span className="flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-purple-400" /> WebSockets Real-Time Sync
          </span>
        </div>
      </div>
    );
  }

  // ─── GATE 2: Enrolled in this Squad ONLY (Cannot chat in every team) ───
  if (!isEnrolled) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-900/80 to-slate-950/90 border border-amber-500/20 backdrop-blur-xl p-8 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 border border-amber-400/30">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>

        <div className="relative z-10 max-w-md mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Enrolled Squad Members Only
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Not Enrolled in {team?.title || 'This Squad'}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            You can only chat in squads where you are an enrolled member or the team leader. Users cannot participate in discussions across every hackathon team without joining.
          </p>
        </div>

        {existingRequest ? (
          <div className="relative z-10 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 max-w-md mx-auto text-xs text-amber-200 space-y-1.5">
            <p className="font-bold flex items-center justify-center gap-1.5 text-amber-300 text-sm">
              <Clock className="w-4 h-4 text-amber-400" /> Application Pending Approval
            </p>
            <p className="text-amber-300/80 leading-relaxed">
              You applied for this squad as <strong className="text-white font-semibold">{existingRequest.role || 'Contributor'}</strong>. Once the team leader accepts your join request, squad chat will unlock for you.
            </p>
          </div>
        ) : (
          <div className="relative z-10 pt-2">
            <button
              type="button"
              onClick={handleApplyToTeam}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-2 border border-purple-400/30"
            >
              <UserCheck className="w-4 h-4" />
              <span>Apply to Join {team?.title || 'Squad'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Protected Team Privacy
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" /> Enrolled Hackers Only
          </span>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED & ENROLLED: Active Live Squad Chat UI ───
  return (
    <div className="chat-container space-y-4">
      {/* Real-time Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {team?.title || 'Hackathon Squad'} Discussion
              <span className="text-xs font-normal text-purple-300">({team?.hackathonName || 'Hackathon'})</span>
            </h3>
            <p className={`text-xs font-semibold flex items-center gap-1.5 ${connected ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {connected ? 'Live & Connected' : 'Connecting to Squad Room...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Roster Toggle Button */}
          <button
            type="button"
            onClick={() => setShowRoster((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showRoster
                ? 'bg-purple-600/50 border-purple-400 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900/80 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="View enrolled teammates in this squad"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Roster</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-bold">
              {enrolledRoster.length}
            </span>
          </button>

          {/* Authenticated Profile Card */}
          <div className="flex items-center gap-2.5 bg-slate-900/80 border border-purple-500/30 px-3.5 py-1.5 rounded-xl shadow-inner">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-extrabold text-white shadow">
              {user.avatar || (user.name ? user.name.substring(0, 2).toUpperCase() : 'ME')}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-tight">{user.name}</span>
                {isLeader ? (
                  <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 text-[9px] font-bold border border-purple-400/30 flex items-center gap-0.5">
                    <Shield className="w-2.5 h-2.5" /> Lead
                  </span>
                ) : isAdmin ? (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[9px] font-bold border border-amber-400/30 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> Admin
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30 flex items-center gap-0.5">
                    <UserCheck className="w-2.5 h-2.5" /> Member
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Verified Squad Member
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Enrolled Roster Panel */}
      {showRoster && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 backdrop-blur-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Enrolled Squad Roster ({enrolledRoster.length} / {team?.maxMembers || 4})
            </h4>
            <span className="text-[10px] text-slate-400">
              {isLeader ? '👑 You lead this squad' : 'Confirmed Teammates'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {enrolledRoster.map((m) => {
              const pal = getParticipantPalette(m.id, m.email, m.name, m.role);
              const isCurrentUser =
                (m.id && String(m.id).toLowerCase() === String(user.id || user._id).toLowerCase()) ||
                (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase()) ||
                m.name === user.name;

              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border transition-all ${
                    isCurrentUser ? 'border-purple-400/50 bg-purple-500/10' : `${pal.avatarBorder} hover:bg-white/10`
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold shadow border ${
                      isCurrentUser
                        ? 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white border-purple-300/40'
                        : `${pal.avatarBg} ${pal.avatarText} ${pal.avatarBorder}`
                    }`}
                  >
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate flex items-center gap-1 ${isCurrentUser ? 'text-white' : pal.nameColor}`}>
                      {m.name} {isCurrentUser && <span className="text-[10px] text-purple-300 font-normal">(You)</span>}
                      {m.isLeader && (
                        <span className="text-[9px] text-amber-300 px-1 py-0.2 bg-amber-500/20 rounded border border-amber-400/30">
                          Lead
                        </span>
                      )}
                    </p>
                    {m.email && <p className="text-[10px] text-slate-400 truncate">{m.email}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Socket Error Banner */}
      {socketError && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{socketError}</span>
          </div>
          <button
            onClick={() => handleNavigateAuth('login')}
            className="underline font-bold hover:text-white"
          >
            Re-authenticate
          </button>
        </div>
      )}

      {/* Messages Thread — Spacious, distinct user styling with zero collision */}
      <div className="messages min-h-[320px] max-h-[460px] overflow-y-auto space-y-3.5 p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/10 shadow-inner">
        {messages.map((item, index) => {
          const isMe = checkIsMe(item);
          const pal = getParticipantPalette(
            item.userId || item.sender,
            item.userEmail,
            item.username,
            item.userRole
          );
          const isAdminMsg =
            item.userRole === 'admin' ||
            (item.username && item.username.toLowerCase() === 'admin') ||
            (item.userEmail && item.userEmail.toLowerCase() === 'admin@teamup.com');

          return (
            <div
              key={item._id || index}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-all`}
            >
              {/* Message Sender Header Line */}
              <div className="flex items-center gap-2 mb-1 px-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm border ${
                    isMe
                      ? 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white border-purple-300/40'
                      : `${pal.avatarBg} ${pal.avatarText} ${pal.avatarBorder}`
                  }`}
                  title={item.username || 'User'}
                >
                  {item.userAvatar || (item.username ? item.username.substring(0, 2).toUpperCase() : 'U')}
                </div>

                <span className={`text-xs font-bold flex items-center gap-1.5 ${isMe ? 'text-purple-200' : pal.nameColor}`}>
                  {isMe ? 'You' : item.username || 'Squad Mate'}
                  {isAdminMsg ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold border flex items-center gap-0.5 bg-amber-500/25 text-amber-200 border-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                      <Shield className="w-2.5 h-2.5 text-amber-300" /> Admin
                    </span>
                  ) : item.isLeader ? (
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border flex items-center gap-0.5 ${
                      isMe ? 'bg-purple-500/30 text-purple-200 border-purple-400/40' : pal.pillBg
                    }`}>
                      <Shield className="w-2.5 h-2.5" /> Lead
                    </span>
                  ) : null}
                </span>

                {item.time && (
                  <span className="text-[10px] text-slate-400 font-normal">{item.time}</span>
                )}
              </div>

              {/* Message Bubble Body */}
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed border transition-all ${
                  isMe
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white rounded-tr-none shadow-md shadow-purple-600/25 border-purple-400/30'
                    : `${pal.bubbleBg} rounded-tl-none`
                }`}
              >
                {item.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={sendMessage} className="flex items-center gap-2">
        <input
          type="text"
          placeholder={`Message ${team?.title || 'the squad'}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!connected}
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!connected || !message.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30 border border-purple-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
