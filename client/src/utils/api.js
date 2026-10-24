const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('niroga_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  health: () => apiFetch('/api/health'),
  chat: (message, language, history) =>
    apiFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language, history }),
    }),
  soap: (description) =>
    apiFetch('/api/soap', {
      method: 'POST',
      body: JSON.stringify({ description }),
    }),
  clinics: (district, q = '', type = '') => {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (q) params.append('q', q);
    if (type && type !== 'All') params.append('type', type);
    const queryStr = params.toString();
    return apiFetch(`/api/clinics${queryStr ? `?${queryStr}` : ''}`);
  },
  visits: {
    list: (worker, district) =>
      apiFetch(
        `/api/visits${
          worker
            ? `?worker=${encodeURIComponent(worker)}`
            : district
            ? `?district=${encodeURIComponent(district)}`
            : ''
        }`
      ),
    create: (data) =>
      apiFetch('/api/visits', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  stats: (period = 'all') => apiFetch(`/api/stats?period=${encodeURIComponent(period)}`),
  auth: {
    login: (username, password) =>
      apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    me: () => apiFetch('/api/auth/me'),
  },
};
