import { apiRequest } from './api';

export function getSpotifyProfile() {
  return apiRequest('/spotify/profile');
}