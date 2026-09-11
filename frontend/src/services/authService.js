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

export function startSpotifyOAuth() {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/spotify`;
}