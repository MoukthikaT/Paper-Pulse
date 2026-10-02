// Canonical API Base URL resolution for local development and production deployments
const DEFAULT_PROD_API = 'https://paper-pulse-s516.onrender.com';
const DEFAULT_DEV_API = 'http://localhost:5000';

const rawApiUrl = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? DEFAULT_PROD_API
    : DEFAULT_DEV_API
);

export const API_BASE = `${rawApiUrl.replace(/\/+$/, '').replace(/\/api\/?$/, '')}/api`;

export default API_BASE;

