import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext(null);

const API = `${API_BASE}/auth`;
const TOKEN_KEY = 'teamup_token';

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);   // { id, name, email, avatar, role, ... }
  const [token, setToken]         = useState(() => localStorage.getItem(TOKEN_KEY));
  const [authLoading, setAuthLoading] = useState(true); // true while restoring session
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(false);  // true during login/signup call

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setAuthLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token is stale/invalid — clear it
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      } catch {
        // Network error — keep token, try again next time
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed.');
        return false;
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch {
      setError('Network error. Please check your connection.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Signup ────────────────────────────────────────────────────────────────
  const signup = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed.');
        return false;
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return true;
    } catch {
      setError('Network error. Please check your connection.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Update Profile (bio, skills, name) ────────────────────────────────────
  const updateProfile = useCallback(async ({ bio, skills, name }) => {
    if (!token) return { success: false, message: 'Not authenticated.' };
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio, skills, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to update profile.');
        return { success: false, message: data.message };
      }
      setUser(data.user);
      return { success: true, user: data.user, message: data.message };
    } catch {
      setError('Network error. Please try again.');
      return { success: false, message: 'Network error.' };
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const isLoggedIn = !!user;
  const isAdmin    = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, token, authLoading, loading, error, isLoggedIn, isAdmin, login, signup, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
