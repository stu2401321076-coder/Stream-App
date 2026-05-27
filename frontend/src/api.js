const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: (url) => request(url),
  post: (url, body) =>
    request(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (url, body) =>
    request(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (url) => request(url, { method: 'DELETE' }),
};

export const auth = {
  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  },
  register: async (name, email, password, extra = {}) => {
    const data = await api.post('/auth/register', { name, email, password, ...extra });
    setToken(data.token);
    setUser(data.user);
    return data;
  },
  logout: () => clearToken(),
  isAuthenticated: () => !!getToken(),
  me: () => api.get('/auth/me'),
  getUser,
};

export const movies = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, v);
    });
    return api.get(`/movies?${qs}`);
  },
  get: (id) => api.get(`/movies/${id}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
  getStreamToken: (id) => api.get(`/movies/${id}/stream-token`),
  streamUrl: (id, token) => `${API_BASE}/movies/${id}/stream?token=${token}`,
  posterUrl: (filePath) => {
    if (!filePath) return null;
    const idx = filePath.indexOf('uploads/');
    return idx >= 0 ? '/' + filePath.slice(idx) : null;
  },
};

export const reviews = {
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, v);
    });
    return api.get(`/reviews?${qs}`);
  },
  get: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};