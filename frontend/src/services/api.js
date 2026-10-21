import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sv_token');
      localStorage.removeItem('sv_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Product Services ───
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories/all'),
};

// ─── Auth Services ───
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getStyleProfile: () => api.get('/users/me/style-profile'),
  getLoyalty: () => api.get('/users/me/loyalty'),
};

// ─── Order Services ───
export const orderService = {
  place: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  track: (id) => api.get(`/orders/${id}/track`),
};

// ─── Analytics Services ───
export const analyticsService = {
  getSales: () => api.get('/analytics/sales'),
  getTrends: () => api.get('/analytics/trends'),
  getCategories: () => api.get('/analytics/categories'),
  getInventory: () => api.get('/analytics/inventory-summary'),
  getKPIs: () => api.get('/analytics/kpis'),
};

// ─── AI Services ───
export const aiService = {
  recommend: (data) => api.post('/ai/recommend', data),
  chat: (message) => api.get('/ai/chat', { params: { message } }),
};

export default api;
