import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
    : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartpark_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages & handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    // Automatically log out if token is expired or unauthorized
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // localStorage.removeItem('smartpark_token');
      // localStorage.removeItem('smartpark_user');
    }

    return Promise.reject(new Error(message));
  }
);

// API Service Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const vehicleAPI = {
  getVehicles: () => api.get('/vehicles'),
  getVehicleById: (id) => api.get(`/vehicles/${id}`),
  addVehicle: (vehicleData) => api.post('/vehicles', vehicleData),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`)
};

export const parkingAPI = {
  getAvailability: () => api.get('/parking/availability'),
  getFloors: () => api.get('/parking/floors'),
  getSlots: (params) => api.get('/parking/slots', { params }),
  requestAllocation: (data) => api.post('/parking/allocate', data),
  vehicleEntry: (data) => api.post('/parking/entry', data),
  lookupExit: (identifier) => api.post('/parking/exit-lookup', { identifier }),
  vehicleExit: (data) => api.post('/parking/exit', data)
};

export const ticketAPI = {
  getTicket: (id) => api.get(`/tickets/${id}`),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  searchTickets: (query) => api.get('/tickets/search', { params: { query } })
};

export const paymentAPI = {
  createOrder: (ticketId) => api.post('/payments/create-order', { ticketId }),
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData),
  getHistory: () => api.get('/payments/history'),
  getReceipt: (receiptId) => api.get(`/payments/receipt/${receiptId}`)
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getRates: () => api.get('/admin/rates'),
  updateRate: (data) => api.put('/admin/rates', data),
  createFloor: (data) => api.post('/admin/floors', data),
  updateFloor: (id, data) => api.put(`/admin/floors/${id}`, data),
  deleteFloor: (id) => api.delete(`/admin/floors/${id}`),
  createSlot: (data) => api.post('/admin/slots', data),
  updateSlot: (id, data) => api.put(`/admin/slots/${id}`, data),
  deleteSlot: (id) => api.delete(`/admin/slots/${id}`)
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  createAnnouncement: (data) => api.post('/notifications/announcement', data)
};

export default api;
