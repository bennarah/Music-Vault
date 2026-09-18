import { apiRequest } from './api';

export function generateRecommendations(preferences) {
  return apiRequest('/recommendations', {
    method: 'POST',
    body: JSON.stringify(preferences),
  });
}

export function getRecommendations() {
  return apiRequest('/recommendations');
}