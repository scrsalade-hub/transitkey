const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('operator_token');
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

// Helper to extract array from API responses that may be {key: [...]} or [...]
function toArray(data, key) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
}

export const api = {
  // Auth
  register: (body) => apiFetch('/auth/operator/register', { method: 'POST', body }),
  login: (body) => apiFetch('/auth/operator/login', { method: 'POST', body }),

  // Drivers
  getDrivers: () => apiFetch('/drivers'),
  createDriver: (body) => apiFetch('/drivers/create', { method: 'POST', body }),

  // Routes
  getRoutes: () => apiFetch('/routes'),
  createRoute: (body) => apiFetch('/routes', { method: 'POST', body }),

  // Trips
  getTrips: () => apiFetch('/trips'),
  getTrip: (id) => apiFetch(`/trips/${id}`),

  // Complaints
  getComplaints: () => apiFetch('/complaints'),
  updateComplaint: (id, body) => apiFetch(`/complaints/${id}`, { method: 'PUT', body }),

  // Notifications
  getNotifications: () => apiFetch('/notifications'),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PUT' }),

  // Revenue
  getRevenueSummary: () => apiFetch('/revenue/summary'),
  getRevenueByRoute: () => apiFetch('/revenue/by-route'),
};

export default api;
