const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('passenger_token');
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
  if (options.body && typeof options.body === 'object') {
    opts.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try { const data = await res.json(); errMsg = data.message || errMsg; } catch {}
    throw new Error(errMsg);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const api = {
  // Auth
  register: (body) => apiFetch('/auth/passenger/register', { method: 'POST', body }),
  login: (body) => apiFetch('/auth/passenger/login', { method: 'POST', body }),

  // Routes
  getRoutes: () => apiFetch('/routes'),
  getRoute: (id) => apiFetch(`/routes/${id}`),

  // Trips - passenger view
  getTrips: () => apiFetch('/trips'),
  getTrip: (id) => apiFetch(`/trips/${id}`),

  // Complaints
  submitComplaint: (body) => apiFetch('/complaints', { method: 'POST', body }),

  // Notifications
  getNotifications: () => apiFetch('/notifications'),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PUT' }),
};

export default api;
