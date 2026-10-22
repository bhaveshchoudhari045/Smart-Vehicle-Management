// Small fetch wrapper for the Spring Boot REST API (proxied through Vite at /api).

const TOKEN_KEY = 'ab_token';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the Java backend is running on port 8080.', 0);
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    // A 401 while holding a token means the session is gone (e.g. backend restarted).
    if (res.status === 401 && token && onUnauthorized) onUnauthorized();
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (fullName, email, password) =>
    request('/auth/register', { method: 'POST', body: { fullName, email, password } }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  dashboard: () => request('/dashboard'),

  vehicles: () => request('/vehicles'),
  createVehicle: (v) => request('/vehicles', { method: 'POST', body: v }),
  updateVehicle: (id, v) => request(`/vehicles/${id}`, { method: 'PUT', body: v }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),

  inventory: () => request('/inventory'),
  receiveDelivery: (id, quantity) => request(`/inventory/${id}/delivery`, { method: 'POST', body: { quantity } }),
  recordSale: (id, quantity) => request(`/inventory/${id}/sale`, { method: 'POST', body: { quantity } }),

  enquiries: () => request('/enquiries'),
  createEnquiry: (payload) => request('/enquiries', { method: 'POST', body: payload }),
  updateEnquiryStatus: (id, status) => request(`/enquiries/${id}/status`, { method: 'PATCH', body: { status } }),
};
