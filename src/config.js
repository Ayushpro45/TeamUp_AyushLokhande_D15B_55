const envApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;

const HOSTNAME =
  typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'localhost';

const isProduction =
  typeof window !== 'undefined' &&
  window.location.hostname &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

// In production (Render or Vercel), use the live Render backend URL
// In local development, fall back to http://localhost:5001
export const BACKEND_URL = envApiUrl
  ? envApiUrl.replace(/\/$/, '')
  : isProduction
  ? 'https://teamup-ayushlokhande-d15b-55.onrender.com'
  : `http://${HOSTNAME}:5001`;

export const API_BASE = `${BACKEND_URL}/api`;
