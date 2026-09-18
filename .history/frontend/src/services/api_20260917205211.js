const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  fetch("http://localhost:5000/api/health")
    .then(response => response.json())
    .then(data => {
        console.log("Backend response:", data);
    })
    .catch(error => {
        console.error("Backend connection failed:", error);
    });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}