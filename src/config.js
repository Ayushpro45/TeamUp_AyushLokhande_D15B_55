const envApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;

const HOSTNAME =
  typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'localhost';

// When deployed on Vercel, VITE_API_URL points to the Render backend (e.g. https://your-backend.onrender.com)
// In local development, it defaults to http://localhost:5001
export const BACKEND_URL = envApiUrl
  ? envApiUrl.replace(/\/$/, '')
  : `http://${HOSTNAME}:5001`;

export const API_BASE = `${BACKEND_URL}/api`;
