import { apiRequest } from './api';

export function login(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function register(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export function getSpotifyOAuthUrl(apiBaseUrl = import.meta.env.VITE_API_BASE_URL) {
  if (typeof apiBaseUrl !== "string" || !apiBaseUrl.trim()) {
    throw new Error("Music Vault API base URL is not configured.");
  }

  return `${apiBaseUrl.trim().replace(/\/+$/, "")}/auth/spotify`;
}

export function startSpotifyOAuth() {
  window.location.href = getSpotifyOAuthUrl();
}
