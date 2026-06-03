const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('driver_token');
}

async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`;
  const token = getToken();
  const opts = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    opts.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try { const data = await res.json(); errMsg = data.message || errMsg; } catch {}
    throw new Error(errMsg);
  }
  // Handle empty responses
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const api = {
  // Auth
  verifyToken: (accessToken) => apiFetch('/drivers/verify-token', { method: 'POST', body: { accessToken } }),
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: { email, password } }),

  // Trips
  getMyTrips: () => apiFetch('/trips/my-trips'),
  getTrip: (id) => apiFetch(`/trips/${id}`),
  startTrip: (id, body) => apiFetch(`/trips/${id}/start`, { method: 'POST', body }),
  endTrip: (id) => apiFetch(`/trips/${id}/end`, { method: 'POST' }),
  updateTripProgress: (id, body) => apiFetch(`/trips/${id}/progress`, { method: 'PUT', body }),
  reportDelay: (id, delayMinutes) => apiFetch(`/trips/${id}/delay`, { method: 'PUT', body: { delayMinutes } }),
  updateSeats: (id, availableSeats) => apiFetch(`/trips/${id}/seats`, { method: 'PUT', body: { availableSeats } }),
  adjustTime: (id, adjustedDuration) => apiFetch(`/trips/${id}/time`, { method: 'PUT', body: { adjustedDuration } }),

  // Routes
  getRoutes: () => apiFetch('/routes'),
  getRoute: (id) => apiFetch(`/routes/${id}`),

  // Complaints
  getMyComplaints: () => apiFetch('/complaints/my'),
  submitComplaint: (body) => apiFetch('/complaints', { method: 'POST', body }),

  // Notifications
  getNotifications: () => apiFetch('/notifications'),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PUT' }),

  // Driver profile
  getProfile: () => apiFetch('/drivers/profile'),
  updateProfile: (body) => apiFetch('/drivers/profile', { method: 'PUT', body }),
};

export default api;
