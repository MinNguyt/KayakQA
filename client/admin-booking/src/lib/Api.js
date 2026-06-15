import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8080/api'; // Adjust this to your backend URL

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API SeCvice
export const authAPI = {
    // Login user
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },

    // Logout user
    logout: async () => {
        try {
            const response = await apiClient.post('/auth/logout');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Logout failed');
        }
    },

    // Register user
    register: async (userData) => {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    },

    // Reset password
    resetPassword: async (email) => {
        try {
            const response = await apiClient.post('/auth/reset-password', { email });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Password reset failed');
        }
    },

    // Confirm reset password
    confirmResetPassword: async (token, newPassword) => {
        try {
            const response = await apiClient.post('/auth/reset-password/confirm', {
                token,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Password reset confirmation failed');
        }
    },

    // Get current user profile
    getProfile: async () => {
        try {
            const response = await apiClient.get('/auth/profile');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch profile');
        }
    },
};

// Bus Company API Service
export const busCompanyAPI = {
    // Get all bus companies with pagination, search, and sorting
    getCompanies: async (params = {}) => {
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'company_name',
            order = 'asc'
        } = params;

        try {
            const response = await apiClient.get('/bus-companies', {
                params: { page, limit, search, sortBy, order }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch bus companies');
        }
    },

    // Get single bus company by ID
    getCompany: async (id) => {
        try {
            const response = await apiClient.get(`/bus-companies/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch bus company');
        }
    },

    // Create new bus company
    createCompany: async (formData) => {
        try {
            const response = await apiClient.post('/bus-companies', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create bus company');
        }
    },

    // Update bus company
    updateCompany: async (id, formData) => {
        try {
            const response = await apiClient.put(`/bus-companies/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update bus company');
        }
    },

    // Delete bus company
    deleteCompany: async (id) => {
        try {
            const response = await apiClient.delete(`/bus-companies/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete bus company');
        }
    },
};

// Station API Service
export const stationAPI = {
    // Get all stations with pagination, search, and sorting
    getStations: async (params = {}) => {
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'name',
            order = 'asc'
        } = params;

        try {
            const response = await apiClient.get('/stations', {
                params: { page, limit, search, sortBy, order }
            });
            // Handle new ApiResponse format: { success, data: { results, total } }
            const responseData = response.data;
            if (responseData.success && responseData.data) {
                return {
                    success: true,
                    stations: responseData.data.results || [],
                    total: responseData.data.total || 0
                };
            }
            // Fallback for legacy format
            return responseData;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch stations');
        }
    },

    // Get single station by ID
    getStation: async (id) => {
        try {
            const response = await apiClient.get(`/stations/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch station');
        }
    },

    // Create new station
    createStation: async (formData) => {
        try {
            const response = await apiClient.post('/stations', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create station');
        }
    },

    // Update station
    updateStation: async (id, formData) => {
        try {
            const response = await apiClient.put(`/stations/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update station');
        }
    },

    // Delete station
    deleteStation: async (id) => {
        try {
            const response = await apiClient.delete(`/stations/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete station');
        }
    },
};

// Statistics API Service (for dashboard cards)
export const statisticsAPI = {
    // Get bus company statistics
    getBusCompanyStats: async () => {
        try {
            // Fetch all companies without pagination to get accurate statistics
            const response = await apiClient.get('/bus-companies', {
                params: { page: 1, limit: 1000 }
            });
            const companies = response.data?.responseObject || response.data?.data || [];

            return {
                totalCompanies: companies.length,
                activeCompanies: companies.filter(c => c.status !== 'inactive').length,
                recentCompanies: companies.filter(c => {
                    const createdDate = new Date(c.created_at);
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    return createdDate > oneMonthAgo;
                }).length,
                totalRevenue: companies.reduce((sum, company) => sum + (company.revenue || 0), 0)
            };
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
            return {
                totalCompanies: 0,
                activeCompanies: 0,
                recentCompanies: 0,
                totalRevenue: 0
            };
        }
    },

    // Get station statistics
    getStationStats: async () => {
        try {
            // Fetch all stations without pagination to get accurate statistics
            const response = await apiClient.get('/stations', {
                params: { page: 1, limit: 1000 }
            });
            const stations = response.data?.responseObject || response.data?.data || [];

            return {
                totalStations: stations.length,
                recentStations: stations.filter(s => {
                    const createdDate = new Date(s.created_at);
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    return createdDate > oneMonthAgo;
                }).length,
                stationsWithImages: stations.filter(s => s.image).length,
                stationsWithWallpapers: stations.filter(s => s.wallpaper).length
            };
        } catch (error) {
            console.error('Failed to fetch station statistics:', error);
            return {
                totalStations: 0,
                recentStations: 0,
                stationsWithImages: 0,
                stationsWithWallpapers: 0
            };
        }
    },
};

// Routes API Service
export const routesAPI = {
    // Get all routes with pagination, search, and sorting
    getRoutes: async (params = {}) => {
        const {
            page = 1,
            limit = 10,
            departure_station_id,
            arrival_station_id,
            sortBy = 'created_at',
            order = 'desc'
        } = params;

        try {
            const response = await apiClient.get('/routes', {
                params: {
                    page,
                    limit,
                    departure_station_id,
                    arrival_station_id,
                    sortBy,
                    order
                }
            });
            // Handle new ApiResponse format: { success, data: { results, total } }
            const responseData = response.data;
            if (responseData.success && responseData.data) {
                return {
                    success: true,
                    routes: responseData.data.results || [],
                    total: responseData.data.total || 0
                };
            }
            // Fallback for legacy format
            return responseData;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch routes');
        }
    },

    // Get single route by ID
    getRoute: async (id) => {
        try {
            const response = await apiClient.get(`/routes/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch route');
        }
    },

    // Create new route
    createRoute: async (routeData) => {
        try {
            const response = await apiClient.post('/routes', routeData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create route');
        }
    },

    // Update route
    updateRoute: async (id, routeData) => {
        try {
            const response = await apiClient.put(`/routes/${id}`, routeData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update route');
        }
    },

    // Delete route
    deleteRoute: async (id) => {
        try {
            const response = await apiClient.delete(`/routes/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete route');
        }
    },
};

// Cars API Service
export const carsAPI = {
    getCars: async (params = {}) => {
        const { page = 1, limit = 10, search = '', sortBy = 'id', order = 'asc', company_id } = params;
        try {
            const response = await apiClient.get('/vehicles', {
                params: { page, limit, search, sortBy, order, company_id }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch cars');
        }
    },

    getCar: async (id) => {
        try {
            const response = await apiClient.get(`/vehicles/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch car');
        }
    },

    createCar: async (payload) => {
        try {
            const response = await apiClient.post('/vehicles', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw new Error(error.response?.data?.message || 'Failed to create car');
        }
    },

    updateCar: async (id, payload) => {
        try {
            const response = await apiClient.put(`/vehicles/${id}`, payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update car');
        }
    },

    uploadFeaturedImage: async (id, file) => {
        const formData = new FormData();
        formData.append('featured_image', file);
        try {
            const response = await apiClient.post(`/vehicles/${id}/featured-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to upload image');
        }
    },

    deleteCar: async (id) => {
        try {
            const response = await apiClient.delete(`/vehicles/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete car');
        }
    },

    popularGarage: async () => {
        try {
            const response = await apiClient.get('/vehicles/popular-garage');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch popular garages');
        }
    },
};

// Seats API Service
export const seatsAPI = {
    getSeats: async () => {
        try {
            const response = await apiClient.get('/seats');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch seats');
        }
    },

    getSeatsByCar: async (carId) => {
        try {
            const response = await apiClient.get(`/seats/vehicle/${carId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch seats');
        }
    },

    deleteSeatsByCar: async (carId) => {
        try {
            const response = await apiClient.delete(`/seats/vehicle/${carId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete seats');
        }
    },

    generateSeatsByCar: async (carId, payload) => {
        try {
            const response = await apiClient.post(`/seats/vehicle/${carId}/generate`, payload);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to generate seats');
        }
    },
};

// Vehicle Schedules API Service
export const vehicleSchedulesAPI = {
    getSchedules: async (params = {}) => {
        const { page = 1, limit = 50, routeId, busId, status, sortBy = 'id:asc' } = params;
        try {
            const response = await apiClient.get('/vehicle-schedules', {
                params: { page, limit, routeId, busId, status, sortBy }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch schedules');
        }
    },

    createSchedule: async (payload) => {
        try {
            const response = await apiClient.post('/vehicle-schedules', payload);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create schedule');
        }
    },

    updateSchedule: async (id, payload) => {
        try {
            const response = await apiClient.put(`/vehicle-schedules/${id}`, payload);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update schedule');
        }
    },

    deleteSchedule: async (id) => {
        try {
            const response = await apiClient.delete(`/vehicle-schedules/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete schedule');
        }
    },
};

// Ticket API Service
export const ticketAPI = {
    // Get all tickets with pagination, search, and sorting
    getTickets: async (params = {}) => {
        const {
            page = 1,
            limit = 10,
            search = '',
            sortBy = 'created_at',
            order = 'desc',
            status
        } = params;

        try {
            const response = await apiClient.get('/tickets/history', {
                params: { page, limit, search, sortBy, order, status }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
        }
    },

    // Get ticket by ID
    getTicket: async (id) => {
        try {
            const response = await apiClient.get(`/tickets/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch ticket');
        }
    },

    // Book ticket
    bookTicket: async (ticketData) => {
        try {
            const response = await apiClient.post('/tickets/booking', ticketData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to book ticket');
        }
    },

    // Cancel ticket
    cancelTicket: async (ticketId, reason) => {
        try {
            const response = await apiClient.put(`/tickets/cancel/${ticketId}`, { reason });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to cancel ticket');
        }
    },

    // Check payment status
    checkPaymentStatus: async (ticketId) => {
        try {
            const response = await apiClient.get(`/tickets/payment/status/${ticketId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to check payment status');
        }
    },

    // Search ticket by ID and phone
    searchTicket: async (ticketId, phoneNumber) => {
        try {
            const response = await apiClient.get('/tickets/search', {
                params: { ticketId, phoneNumber }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to search ticket');
        }
    },

    // Get tickets by status
    getTicketsByStatus: async (status) => {
        try {
            const response = await apiClient.get(`/tickets/history_status/${status}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch tickets by status');
        }
    },

    // Get cancelled tickets
    getCancelledTickets: async () => {
        try {
            const response = await apiClient.get('/tickets/cancel_ticket/list');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch cancelled tickets');
        }
    },

    // Admin cancel ticket
    adminCancelTicket: async (ticketId, reason) => {
        try {
            const response = await apiClient.put(`/tickets/cancel_ticket/add/${ticketId}`, { reason });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to cancel ticket');
        }
    },

    // Delete cancelled ticket
    deleteCancelledTicket: async (ticketId, reason) => {
        try {
            const response = await apiClient.put(`/tickets/cancel_ticket/delete/${ticketId}`, { reason });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete cancelled ticket');
        }
    },
};

// User API Service
export const userAPI = {
    // Get all users with pagination, search, and sorting
    getUsers: async (params = {}) => {
        const {
            page = 1,
            limit = 10,
            email = '',
            sortBy = 'id:asc'
        } = params;

        try {
            const response = await apiClient.get('/users', {
                params: { page, limit, email, sortBy }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch users');
        }
    },

    // Get single user by ID
    getUser: async (id) => {
        try {
            const response = await apiClient.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user');
        }
    },

    // Create new user
    createUser: async (userData) => {
        try {
            const response = await apiClient.post('/users', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create user');
        }
    },

    // Update user
    updateUser: async (id, userData) => {
        try {
            const response = await apiClient.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update user');
        }
    },

    // Delete user
    deleteUser: async (id) => {
        try {
            const response = await apiClient.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete user');
        }
    },
};

export default apiClient;
