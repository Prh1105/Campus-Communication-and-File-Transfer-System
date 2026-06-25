import axios from 'axios';

const TOKEN_KEY = 'campus_im_token';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器: 附加 JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器: 统一解包 { code, message, data }
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
      return { ...response, data: body.data, message: body.message };
    }
    return response;
  },
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      '请求失败';
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // 使用 dispatchEvent 通知 AuthContext，避免硬跳转
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(new Error(msg));
  },
);

export default api;
