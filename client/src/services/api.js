import axios from 'axios';

// Get base URL from environment or default to local '/api'
let envBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').trim();

// Ensure the base URL ends with '/api'
if (envBaseUrl.startsWith('http')) {
  // Strip trailing slashes
  envBaseUrl = envBaseUrl.replace(/\/+$/, '');
  if (!envBaseUrl.endsWith('/api')) {
    envBaseUrl += '/api';
  }
}

const apiClient = axios.create({
  baseURL: envBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response?.data?.error || {
      message: error.message || 'An unexpected network error occurred',
      code: 'NETWORK_ERROR'
    };
    return Promise.reject(errorPayload);
  }
);

export const api = {
  // Auth
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  getMe: () => apiClient.get('/auth/me'),

  // Profile
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (payload) => apiClient.put('/profile', payload),

  // Discovery & Opportunities
  listOpportunities: (params) => apiClient.get('/opportunities', { params }),
  getOpportunityById: (id) => apiClient.get(`/opportunities/${id}`),
  createOpportunity: (payload) => apiClient.post('/opportunities', payload),
  captureUrl: (url) => apiClient.post('/opportunities/capture-url', { url }),

  // Tracker / My Opportunities
  getMyOpportunities: (params) => apiClient.get('/my-opportunities', { params }),
  trackOpportunity: (payload) => apiClient.post('/my-opportunities', payload),
  updateTrackedOpportunity: (id, payload) => apiClient.patch(`/my-opportunities/${id}`, payload),
  deleteTrackedOpportunity: (id) => apiClient.delete(`/my-opportunities/${id}`),

  // AI Assistant & Copilot
  summarizeOpportunity: (payload) => apiClient.post('/ai/summarize', payload),
  checkEligibility: (opportunityId) => apiClient.post('/ai/eligibility-check', { opportunityId }),
  generateChecklist: (opportunityId) => apiClient.post('/ai/checklist', { opportunityId }),
  copilotChat: (payload) => apiClient.post('/ai/chat', payload),
  getConversations: () => apiClient.get('/ai/conversations'),
  createConversation: (payload) => apiClient.post('/ai/conversations', payload),
  getConversation: (id) => apiClient.get(`/ai/conversations/${id}`),
  deleteConversation: (id) => apiClient.delete(`/ai/conversations/${id}`),
  sendMessage: (id, payload) => apiClient.post(`/ai/conversations/${id}/messages`, payload),
  alignCareer: (opportunityId) => apiClient.post('/ai/align', { opportunityId }),

  // Career Roadmap
  getRoadmap: () => apiClient.get('/roadmap'),
  generateRoadmap: () => apiClient.post('/roadmap/generate'),
  updateRoadmapProgress: (payload) => apiClient.put('/roadmap/progress', payload),

  // Resume Intelligence
  getResume: () => apiClient.get('/resume'),
  uploadResume: (formData) => apiClient.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  confirmResume: (payload) => apiClient.put('/resume/confirm', payload),
  alignResume: (opportunityId) => apiClient.post('/resume/align', { opportunityId }),
  improveResume: (opportunityId) => apiClient.post('/resume/improve', { opportunityId }),

  // Export & Import
  exportData: (format = 'json', scope = 'my-opportunities') => 
    apiClient.get(`/export?format=${format}&scope=${scope}`),
  previewImport: (records) => apiClient.post('/import/preview', { records }),
  confirmImport: (records, onDuplicate = 'skip') => 
    apiClient.post('/import/confirm', { records, onDuplicate }),

  // Notifications
  getNotifications: () => apiClient.get('/notifications'),
  markNotificationRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.patch('/notifications/read-all'),
  getNotificationPreferences: () => apiClient.get('/notifications/preferences'),
  updateNotificationPreferences: (payload) => apiClient.put('/notifications/preferences', payload),

  // Subscriptions & Plans
  getMyPlan: () => apiClient.get('/subscriptions/me'),
  createCheckoutSession: (payload) => apiClient.post('/subscriptions/upgrade', payload),

  // Admin
  getAdminStats: () => apiClient.get('/admin/stats'),
  getAdminUsers: () => apiClient.get('/admin/users'),
  updateUserRole: (id, payload) => apiClient.patch(`/admin/users/${id}`, payload),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getReportedOpportunities: () => apiClient.get('/admin/opportunities/reported'),
  updateOpportunityAdmin: (id, payload) => apiClient.patch(`/admin/opportunities/${id}`, payload),
  deleteOpportunityAdmin: (id) => apiClient.delete(`/admin/opportunities/${id}`)
};
