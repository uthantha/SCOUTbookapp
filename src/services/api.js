import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sb_token');
      localStorage.removeItem('sb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  completeGoogleAuth: async (tempToken, role, password = null) => {
    const response = await api.post('/auth/google/complete', { 
      temp_token: tempToken, 
      role,
      password 
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetCode: async (email, code) => {
    const response = await api.post('/auth/verify-reset-code', { email, code });
    return response.data;
  },

  resetPassword: async (resetToken, newPassword) => {
    const response = await api.post('/auth/reset-password', { 
      resetToken, 
      newPassword 
    });
    return response.data;
  },
};

// Profile API functions
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  getProfileById: async (userId) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  searchPlayers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/profile/search/players?${params}`);
    return response.data;
  },

  searchScouts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/profile/search/scouts?${params}`);
    return response.data;
  },

  getLeaderboard: async (sport = null) => {
    const params = sport ? `?sport=${sport}` : '';
    const response = await api.get(`/profile/leaderboard${params}`);
    return response.data;
  },

  incrementProfileView: async (userId) => {
    const response = await api.post(`/profile/${userId}/view`);
    return response.data;
  }
};

export default api;

// Opportunities API functions
export const opportunitiesAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/opportunities?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/opportunities/${id}`);
    return response.data;
  },

  create: async (opportunityData) => {
    const response = await api.post('/opportunities', opportunityData);
    return response.data;
  },

  getMyOpportunities: async () => {
    const response = await api.get('/opportunities/scout/my-opportunities');
    return response.data;
  },

  apply: async (opportunityId, coverLetter) => {
    const response = await api.post(`/opportunities/${opportunityId}/apply`, { coverLetter });
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/opportunities/player/my-applications');
    return response.data;
  },

  getApplications: async (opportunityId) => {
    const response = await api.get(`/opportunities/${opportunityId}/applications`);
    return response.data;
  },

  delete: async (opportunityId) => {
    const response = await api.delete(`/opportunities/${opportunityId}`);
    return response.data;
  },

  update: async (opportunityId, opportunityData) => {
    const response = await api.put(`/opportunities/${opportunityId}`, opportunityData);
    return response.data;
  }
};

// Tournaments API functions
export const tournamentsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/tournaments?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },

  create: async (tournamentData) => {
    const response = await api.post('/tournaments', tournamentData);
    return response.data;
  },

  getMyTournaments: async () => {
    const response = await api.get('/tournaments/user/my-tournaments');
    return response.data;
  },

  register: async (tournamentId, registrationData) => {
    const response = await api.post(`/tournaments/${tournamentId}/register`, registrationData);
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await api.get('/tournaments/user/my-registrations');
    return response.data;
  },

  getRegistrations: async (tournamentId) => {
    const response = await api.get(`/tournaments/${tournamentId}/registrations`);
    return response.data;
  }
};
