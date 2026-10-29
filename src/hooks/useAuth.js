import { useState, useCallback } from 'react';

/**
 * useAuth — simulates an async authentication layer.
 *
 * In a real app, replace the simulated delays with actual API calls.
 *
 * @returns {{
 *   user: Object|null,
 *   loading: boolean,
 *   error: string|null,
 *   login: Function,
 *   signup: Function,
 *   logout: Function,
 * }}
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Simulate an async login request.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<boolean>} true on success
   */
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      // Simulated network delay (replace with real API call)
      await new Promise((res) => setTimeout(res, 1200));

      // Demo: reject a specific "wrong" password to show error UX
      if (password === 'wrong123') {
        throw new Error('Invalid email or password. Please try again.');
      }

      const loggedInUser = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        avatar: email.slice(0, 2).toUpperCase(),
        joinedAt: new Date().toISOString(),
      };
      setUser(loggedInUser);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Simulate an async sign-up request.
   * @param {{ name: string, email: string, password: string }} data
   * @returns {Promise<boolean>} true on success
   */
  const signup = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((res) => setTimeout(res, 1400));

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        avatar: name.slice(0, 2).toUpperCase(),
        joinedAt: new Date().toISOString(),
      };
      setUser(newUser);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  return { user, loading, error, login, signup, logout };
}
