import axios from 'axios';
import { AuthResponse, NotificationPreferences, Subscription, User } from '../types';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export const subscriptionService = {
  getAll: () => api.get('/subscriptions'),
  getRenewals: () => api.get('/subscriptions/renewals'),
  getStats: () => api.get('/subscriptions/stats'),
  updateAutoRenewal: (id: string, autoRenew: boolean) => 
    api.patch(`/subscriptions/${id}/auto-renewal`, { autoRenew }),
  getById: (id: string) => api.get(`/subscriptions/${id}`),

    create: (data: Omit<Subscription, '_id'>) => api.post('/subscriptions', {
      name: data.name,
      price: Number(data.price),
      billingCycle: data.billingCycle,
      startDate: data.startDate,
      nextBillingDate: data.nextBillingDate,
      category: data.category,
      description: data.description || '',
      website: data.website || '',
      status: 'active',
      autoRenew: true,
      duration: data.duration
    }),
  update: (id: string, data: { name?: string; price?: number; duration?: number }) => api.put(`/subscriptions/${id}`, data),
  delete: (id: string) => api.delete(`/subscriptions/${id}`),
};

export const authService = {
  signIn: (credentials: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', credentials),
    
  signUp: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const errorData = error.response.data;
        throw new Error(
          errorData.message || 
          errorData.errors?.[0]?.msg || 
          'Invalid registration data'
        );
      }
      throw error;
    }
  },
    
  verifyEmail: (token: string) => 
    api.get(`/auth/verify-email/${token}`),
    
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
    
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
};

export const reminderService = {
  getAll: () => api.get('/reminders'),
  create: (data: { title: string; description: string; date: string }) => api.post('/reminders', data),
  update: (id: string, data: { title?: string; description?: string; date?: string }) => api.put(`/reminders/${id}`, data),
  delete: (id: string) => api.delete(`/reminders/${id}`),
  getUpcoming: () => api.get('/reminders/upcoming'),
  snooze: (id: string, duration: number) => 
    api.post(`/reminders/${id}/snooze`, { duration })
};

export const userService = {
  updateProfile: (data: Partial<User>) => api.put('/users/profile', data),
  updateSettings: (settings: Record<string, unknown>) => api.put('/users/settings', settings),
  updateNotifications: (preferences: NotificationPreferences) => 
    api.put('/users/notifications', preferences)
};

export default api;