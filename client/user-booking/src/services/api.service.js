import { API_BASE_URL, API_STATUS, API_ENDPOINTS } from './base.api.url.js';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get auth token from localStorage
    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    // Set auth token to localStorage
    setAuthToken(token) {
        localStorage.setItem('authToken', token);
    }

    // Set user data to localStorage
    setUserData(userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    // Get user data from localStorage
    getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    // Remove auth token from localStorage
    removeAuthToken() {
        localStorage.removeItem('authToken');
    }

    // Remove user data from localStorage
    removeUserData() {
        localStorage.removeItem('userData');
    }

    // Clear all auth data
    clearAuthData() {
        this.removeAuthToken();
        this.removeUserData();
    }

    // Get headers for API requests
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const { includeAuth = true, suppressUnauthorizedRedirect = false, ...rest } = options;
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(includeAuth !== false),
            // Ensure browser includes cookies (for HttpOnly access_token)
            credentials: 'include',
            ...rest,
        };

        try {
            const response = await fetch(url, config);

            // Handle different response statuses
            if (response.status === API_STATUS.UNAUTHORIZED) {
                if (!suppressUnauthorizedRedirect) {
                    this.clearAuthData();
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }
                throw new Error('Unauthorized access');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data, status: response.status };
        } catch (error) {
            console.error('API request failed:', error);
            return {
                success: false,
                error: error.message,
                status: error.status || 500
            };
        }
    }

    // GET request
    async get(endpoint, options = {}) {
        return this.request(endpoint, { method: 'GET', ...options });
    }

    // POST request
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options,
        });
    }

    // PUT request
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options,
        });
    }

    // DELETE request
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { method: 'DELETE', ...options });
    }

    // Upload file
    async uploadFile(endpoint, file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`,
            },
            body: formData,
            credentials: 'include',
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data, status: response.status };
        } catch (error) {
            console.error('File upload failed:', error);
            return {
                success: false,
                error: error.message,
                status: error.status || 500
            };
        }
    }

    // ===== AUTHENTICATION METHODS =====

    // Login
    async login(credentials) {
        return this.post(API_ENDPOINTS.LOGIN, credentials, { includeAuth: false });
    }

    // Register
    async register(userData) {
        return this.post(API_ENDPOINTS.REGISTER, userData, { includeAuth: false });
    }

    // Logout
    async logout() {
        const result = await this.post(API_ENDPOINTS.LOGOUT);
        if (result.success) {
            this.clearAuthData();
        }
        return result;
    }

    // Reset password
    async resetPassword(email) {
        return this.post(API_ENDPOINTS.RESET_PASSWORD, { email }, { includeAuth: false });
    }

    // Confirm reset password
    async confirmResetPassword(userId, newPassword) {
        return this.post(API_ENDPOINTS.CONFIRM_RESET_PASSWORD, { userId, newPassword }, { includeAuth: false });
    }

    // Verify recovery info
    async verifyRecoveryInfo(email, phone) {
        return this.post(API_ENDPOINTS.VERIFY_RECOVERY_INFO, { email, phone }, { includeAuth: false });
    }

    // Get current user profile
    async getCurrentUser() {
        return this.get('/auth/profile', { includeAuth: true });
    }

    // ===== USER MANAGEMENT METHODS =====

    // Get all users
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_ENDPOINTS.USERS}?${queryString}` : API_ENDPOINTS.USERS;
        return this.get(endpoint);
    }

    // Get user by ID
    async getUser(id) {
        return this.get(API_ENDPOINTS.USER_PROFILE.replace(':id', id));
    }

    // Create user
    async createUser(userData) {
        return this.post(API_ENDPOINTS.CREATE_USER, userData);
    }

    // Delete user
    async deleteUser(id) {
        return this.delete(API_ENDPOINTS.DELETE_USER.replace(':id', id));
    }

    // ===== BUS COMPANY METHODS =====

    // Get all bus companies
    async getBusCompanies(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_ENDPOINTS.BUS_COMPANIES}?${queryString}` : API_ENDPOINTS.BUS_COMPANIES;
        return this.get(endpoint);
    }

    // Get bus company by ID
    async getBusCompany(id) {
        return this.get(API_ENDPOINTS.BUS_COMPANY_DETAILS.replace(':id', id));
    }

    // Create bus company
    async createBusCompany(companyData) {
        return this.post(API_ENDPOINTS.CREATE_BUS_COMPANY, companyData);
    }

    // Update bus company
    async updateBusCompany(id, companyData) {
        return this.put(API_ENDPOINTS.UPDATE_BUS_COMPANY.replace(':id', id), companyData);
    }

    // Delete bus company
    async deleteBusCompany(id) {
        return this.delete(API_ENDPOINTS.DELETE_BUS_COMPANY.replace(':id', id));
    }

    // ===== STATION METHODS =====

    // Get all stations
    async getStations(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_ENDPOINTS.STATIONS}?${queryString}` : API_ENDPOINTS.STATIONS;
        return this.get(endpoint);
    }

    // Get station by ID
    async getStation(id) {
        return this.get(API_ENDPOINTS.STATION_DETAILS.replace(':id', id));
    }

    // Create station
    async createStation(stationData) {
        return this.post(API_ENDPOINTS.CREATE_STATION, stationData);
    }

    // Update station
    async updateStation(id, stationData) {
        return this.put(API_ENDPOINTS.UPDATE_STATION.replace(':id', id), stationData);
    }

    // Delete station
    async deleteStation(id) {
        return this.delete(API_ENDPOINTS.DELETE_STATION.replace(':id', id));
    }

    // ===== TICKET METHODS =====

    // Get all tickets
    async getTickets(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_ENDPOINTS.TICKETS}?${queryString}` : API_ENDPOINTS.TICKETS;
        return this.get(endpoint);
    }

    // Get ticket by ID
    async getTicket(id) {
        return this.get(API_ENDPOINTS.TICKET_DETAILS.replace(':id', id));
    }

    // Get ticket routes
    async getTicketRoutes() {
        return this.get(API_ENDPOINTS.GET_ROUTES);
    }

    // Get buses by route (using schedules)
    async getBusesByRoute(routeId) {
        return this.get(`${API_ENDPOINTS.VEHICLE_SCHEDULES}?routeId=${routeId}`);
    }

    // Get available seats
    async getAvailableSeats(busId) {
        return this.get(API_ENDPOINTS.GET_AVAILABLE_SEATS.replace(':busId', busId));
    }

    // Book ticket
    async bookTicket(ticketData) {
        return this.post(API_ENDPOINTS.BOOK_TICKET, ticketData);
    }

    // Cancel ticket - uses PUT /tickets/:id to update status to CANCELLED
    async cancelTicket(ticketId, reason) {
        return this.put(API_ENDPOINTS.UPDATE_TICKET.replace(':id', ticketId), {
            status: 'CANCELLED',
            cancelReason: reason
        }, { includeAuth: true });
    }

    // Search ticket by ID and phone number
    async searchTicket(ticketId, phoneNumber) {
        const params = new URLSearchParams({
            ticketId: ticketId.toString(),
            phoneNumber: phoneNumber
        });
        return this.get(`${API_ENDPOINTS.SEARCH_TICKET}?${params}`, { includeAuth: false });
    }

    // Get ticket by ID (only BOOKED status)
    async getTicketById(ticketId) {
        return this.get(API_ENDPOINTS.TICKET_DETAILS.replace(':id', ticketId), { includeAuth: false });
    }

    // Get all tickets by user ID (only BOOKED status)
    async getTicketsByUserId(userId) {
        return this.get(`/tickets/user/${userId}`, { includeAuth: true });
    }

    // Get current user's tickets (only BOOKED status)
    async getCurrentUserTickets() {
        return this.get('/tickets/user/me', { includeAuth: true });
    }

    // ===== ROUTE METHODS =====

    // Get all routes
    async getRoutes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_ENDPOINTS.ROUTES}?${queryString}` : API_ENDPOINTS.ROUTES;
        return this.get(endpoint);
    }

    // Get route by ID
    async getRoute(id) {
        return this.get(API_ENDPOINTS.ROUTE_DETAILS.replace(':id', id));
    }

    // Create route
    async createRoute(routeData) {
        return this.post(API_ENDPOINTS.CREATE_ROUTE, routeData);
    }

    // Update route
    async updateRoute(id, routeData) {
        return this.put(API_ENDPOINTS.UPDATE_ROUTE.replace(':id', id), routeData);
    }

    // Delete route
    async deleteRoute(id) {
        return this.delete(API_ENDPOINTS.DELETE_ROUTE.replace(':id', id));
    }

    // ===== BUS REVIEW METHODS =====

    // Get all bus reviews
    async getBusReviews(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `${API_ENDPOINTS.BUS_REVIEWS}?${queryString}` : API_ENDPOINTS.BUS_REVIEWS;
        return this.get(endpoint);
    }

    // Get bus review by ID
    async getBusReview(id) {
        return this.get(API_ENDPOINTS.BUS_REVIEW_DETAILS.replace(':id', id));
    }

    // Create bus review
    async createBusReview(reviewData) {
        return this.post(API_ENDPOINTS.CREATE_BUS_REVIEW, reviewData);
    }

    // Update bus review
    async updateBusReview(id, reviewData) {
        return this.put(API_ENDPOINTS.UPDATE_BUS_REVIEW.replace(':id', id), reviewData);
    }

    // Delete bus review
    async deleteBusReview(id) {
        return this.delete(API_ENDPOINTS.DELETE_BUS_REVIEW.replace(':id', id));
    }

    // ===== CAR METHODS =====

    // Get car by ID
    async getCarById(id) {
        return this.get(`/vehicle/${id}`, { includeAuth: false });
    }

    // Get vehicle by ID (for enriching ticket data)
    async getVehicleById(id) {
        return this.get(`/vehicles/${id}`, { includeAuth: false });
    }

    // Get vehicles with optional filters
    async getCars(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/vehicles?${queryString}` : '/vehicles';
        return this.get(endpoint, { includeAuth: false });
    }

    // Get vehicles by company ID
    async getCarsByCompanyId(companyId, params = {}) {
        const queryParams = new URLSearchParams(params);
        if (companyId) {
            queryParams.append('companyId', companyId);
        }
        const endpoint = `${API_ENDPOINTS.CARS}?${queryParams.toString()}`;
        return this.get(endpoint, { includeAuth: false });
    }

    // Get seats by vehicle ID
    async getSeatsByVehicleId(vehicleId) {
        return this.get(`/seats/vehicle/${vehicleId}`, { includeAuth: false });
    }

    // ===== SCHEDULE METHODS =====

    // Get schedule by ID
    async getScheduleById(id) {
        return this.get(API_ENDPOINTS.VEHICLE_SCHEDULE_DETAILS.replace(':id', id), { includeAuth: false });
    }

    // ===== SPECIAL ENDPOINT METHODS =====

    // Get popular stations
    async getPopularStations() {
        return this.get(API_ENDPOINTS.GET_POPULAR_STATIONS);
    }

    // Get popular routes
    async getPopularRoutes() {
        return this.get(API_ENDPOINTS.GET_POPULAR_ROUTES);
    }

    // Get top reviews
    async getTopReviews() {
        return this.get(API_ENDPOINTS.GET_TOP_REVIEWS);
    }

    // Get station passengers
    async getStationPassengers() {
        return this.get(API_ENDPOINTS.GET_STATION_PASSENGERS);
    }

    // Get status tickets
    async getStatusTickets() {
        return this.get(API_ENDPOINTS.GET_STATUS_TICKETS);
    }

    // Get payment providers
    async getPaymentProviders() {
        return this.get(API_ENDPOINTS.GET_PAYMENT_PROVIDERS);
    }

    // Get revenues
    async getRevenues() {
        return this.get(API_ENDPOINTS.GET_REVENUES);
    }

    // Get customers
    async getCustomers() {
        return this.get(API_ENDPOINTS.GET_CUSTOMERS);
    }

    // Find arrival
    async findArrival(searchParams) {
        return this.get(API_ENDPOINTS.FIND_ARRIVAL, { params: searchParams });
    }

    // ===== HEALTH CHECK =====

    // Health check
    async healthCheck() {
        return this.get(API_ENDPOINTS.HEALTH_CHECK, { includeAuth: false });
    }

    // ===== VEHICLE SCHEDULE METHODS =====

    // Get vehicle schedules with filters
    async getVehicleSchedules(params = {}) {
        const queryString = new URLSearchParams(
            Object.entries(params).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    acc[key] = String(value);
                }
                return acc;
            }, {})
        ).toString();

        const endpoint = queryString
            ? `${API_ENDPOINTS.VEHICLE_SCHEDULES}?${queryString}`
            : API_ENDPOINTS.VEHICLE_SCHEDULES;

        return this.get(endpoint);
    }

    // Get one vehicle schedule by id (if needed later)
    async getVehicleSchedule(id) {
        return this.get(API_ENDPOINTS.VEHICLE_SCHEDULE_DETAILS.replace(':id', id));
    }

    // ===== CHATBOT =====
    async sendChatbotMessage(message, userId) {
        return this.post('/chatbot/message', { message, userId }, { includeAuth: true });
    }
}

export default new ApiService();

