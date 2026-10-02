// Dynamic API Base URL resolution for both local development and production deployments (e.g., Vercel)
export const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}/api`
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? '/api'
      : 'http://localhost:5000/api');

export default API_BASE;
