// Base API configuration for Bus Booking application
export const API_BASE_URL = 'http://localhost:8080/api';

// API endpoints
export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
    CONFIRM_RESET_PASSWORD: '/auth/reset-password/confirm',
    VERIFY_RECOVERY_INFO: '/auth/verify-recovery-info',

    // User management
    USERS: '/users',
    USER_PROFILE: '/users/:id',
    CREATE_USER: '/users',
    DELETE_USER: '/users/:id',

    // Bus companies
    BUS_COMPANIES: '/bus-companies',
    BUS_COMPANY_DETAILS: '/bus-companies/:id',
    CREATE_BUS_COMPANY: '/bus-companies',
    UPDATE_BUS_COMPANY: '/bus-companies/:id',
    DELETE_BUS_COMPANY: '/bus-companies/:id',

    // Routes
    ROUTES: '/routes',
    ROUTE_DETAILS: '/routes/:id',
    CREATE_ROUTE: '/routes',
    UPDATE_ROUTE: '/routes/:id',
    DELETE_ROUTE: '/routes/:id',

    // Stations
    STATIONS: '/stations',
    STATION_DETAILS: '/stations/:id',
    CREATE_STATION: '/stations',
    UPDATE_STATION: '/stations/:id',
    DELETE_STATION: '/stations/:id',

    // Cars/Vehicles
    CARS: '/vehicles',
    CAR_DETAILS: '/vehicles/:id',
    CARS_BY_COMPANY: '/vehicles', // Used with query param
    CREATE_CAR: '/vehicles',
    UPDATE_CAR: '/vehicles/:id',
    DELETE_CAR: '/vehicles/:id',

    // Seats
    SEATS: '/seats',
    SEAT_DETAILS: '/seats/vehicle/:id',
    SEATS_BY_VEHICLE: '/seats/vehicle/:vehicleId',
    CREATE_SEAT: '/seats',
    UPDATE_SEAT: '/seats/:id',
    DELETE_SEAT: '/seats/:id',

    // Tickets
    TICKETS: '/tickets/history',
    TICKET_DETAILS: '/tickets/:id',
    CREATE_TICKET: '/tickets',
    UPDATE_TICKET: '/tickets/:id',
    DELETE_TICKET: '/tickets/:id',
    GET_ROUTES: '/routes',
    GET_BUSES_BY_ROUTE: '/vehicle-schedules', // Closest match for buses by route is schedules
    GET_AVAILABLE_SEATS: '/seats/vehicle/:busId/available',
    BOOK_TICKET: '/tickets/booking',
    CANCEL_TICKET: '/tickets/cancel/:ticketId',
    CHECK_PAYMENT_STATUS: '/tickets/payment/status/:ticketId',
    TICKET_HISTORY: '/tickets/history',
    SEARCH_TICKET: '/tickets/search',
    GET_TICKETS_BY_STATUS: '/tickets/history_status/:status',
    GET_CANCELLED_TICKETS: '/tickets/cancel_ticket/list',
    ADMIN_CANCEL_TICKET: '/tickets/cancel_ticket/add/:ticketId',
    DELETE_CANCELLED_TICKET: '/tickets/cancel_ticket/delete/:ticketId',

    // Ticket Orders
    TICKET_ORDERS: '/ticket-orders',
    TICKET_ORDER_DETAILS: '/ticket-orders/:id',
    CREATE_TICKET_ORDER: '/ticket-orders',
    UPDATE_TICKET_ORDER: '/ticket-orders/:id',
    DELETE_TICKET_ORDER: '/ticket-orders/:id',

    // Bus Reviews
    BUS_REVIEWS: '/bus-reviews',
    BUS_REVIEW_DETAILS: '/bus-reviews/:id',
    CREATE_BUS_REVIEW: '/bus-reviews',
    UPDATE_BUS_REVIEW: '/bus-reviews/:id',
    DELETE_BUS_REVIEW: '/bus-reviews/:id',

    // Banners
    BANNERS: '/banners',
    BANNER_DETAILS: '/banners/:id',
    CREATE_BANNER: '/banners',
    UPDATE_BANNER: '/banners/:id',
    DELETE_BANNER: '/banners/:id',

    // Payment Providers
    PAYMENT_PROVIDERS: '/payment-providers',
    PAYMENT_PROVIDER_DETAILS: '/payment-providers/:id',
    CREATE_PAYMENT_PROVIDER: '/payment-providers',
    UPDATE_PAYMENT_PROVIDER: '/payment-providers/:id',
    DELETE_PAYMENT_PROVIDER: '/payment-providers/:id',

    // Vehicle Schedules
    VEHICLE_SCHEDULES: '/vehicle-schedules',
    VEHICLE_SCHEDULE_DETAILS: '/vehicle-schedules/:id',
    CREATE_VEHICLE_SCHEDULE: '/vehicle-schedules',
    UPDATE_VEHICLE_SCHEDULE: '/vehicle-schedules/:id',
    DELETE_VEHICLE_SCHEDULE: '/vehicle-schedules/:id',

    // Seat availability by bus (ticket module)
    SEATS_BY_BUS_AVAILABILITY: '/seats/vehicle/:busId/available',

    // Special endpoints
    GET_BUS_REVIEWS: '/getBus_review',
    GET_STATION_PASSENGERS: '/getstationpassenger',
    GET_STATUS_TICKETS: '/getStatusTicket',
    GET_PAYMENT_PROVIDERS: '/getPaymentProvider',
    GET_REVENUES: '/revenues',
    GET_CUSTOMERS: '/get-customer',
    FIND_ARRIVAL: '/search',
    GET_POPULAR_STATIONS: '/get-popular-station',
    GET_POPULAR_ROUTES: '/getPopularRoute',
    GET_TOP_REVIEWS: '/getTopReview',
    GET_DISCOUNT_BANNERS: '/getDiscountBanner',

    // Health check
    HEALTH_CHECK: '/health-check',

    // File uploads
    UPLOADS: '/uploads'
};

// HTTP methods
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
};

// API response status codes
export const API_STATUS = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
