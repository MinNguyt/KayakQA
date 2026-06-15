import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// Custom metrics
const ticketsFetched = new Counter('tickets_fetched');
const errorRate = new Rate('errors');
const ticketResponseTime = new Trend('ticket_response_time', true);

// Booking-specific metrics
const bookingSuccess = new Counter('booking_success');
const bookingFailed = new Counter('booking_failed');
const bookingLocked = new Counter('booking_locked');  // Tracks when seat is locked by another user
const bookingResponseTime = new Trend('booking_response_time', true);

// Test configuration for concurrent booking
const TEST_SCHEDULE_ID = 1;
const TEST_SEAT_ID = 38;
const TEST_PRICE = 100000;

// Test configuration
export const options = {
    scenarios: {
        // Concurrent booking test - 3 users try to book the same seat
        concurrent_booking: {
            executor: 'shared-iterations',
            vus: 3,
            iterations: 3,
            maxDuration: '30s',
            startTime: '0s',
            gracefulStop: '5s',
            tags: { test_type: 'concurrent_booking' },
            exec: 'concurrentBookingTest',
        },
        // Smoke test - verify the endpoint works
        smoke: {
            executor: 'constant-vus',
            vus: 1,
            duration: '30s',
            startTime: '35s',
            gracefulStop: '5s',
            tags: { test_type: 'smoke' },
        },
        // Load test - normal load conditions
        load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 10 },   // Ramp up to 10 users
                { duration: '10s', target: 10 },   // Stay at 10 users
                { duration: '10s', target: 10 },   // Ramp up to 20 users
                { duration: '10s', target: 10 },   // Stay at 20 users
                { duration: '10s', target: 0 },    // Ramp down to 0
            ],
            startTime: '70s',
            gracefulStop: '10s',
            tags: { test_type: 'load' },
        },
        // Stress test - push the system to its limits
        // stress: {
        //     executor: 'ramping-vus',
        //     startVUs: 0,
        //     stages: [
        //         { duration: '2m', target: 50 },   // Ramp up to 50 users
        //         { duration: '5m', target: 50 },   // Stay at 50 users
        //         { duration: '2m', target: 100 },  // Ramp up to 100 users
        //         { duration: '5m', target: 100 },  // Stay at 100 users
        //         { duration: '2m', target: 0 },    // Ramp down to 0
        //     ],
        //     startTime: '10m',
        //     gracefulStop: '30s',
        //     tags: { test_type: 'stress' },
        // },
    },
    thresholds: {
        'http_req_duration': ['p(95)<500', 'p(99)<1000'],    // 95% of requests should be below 500ms
        'http_req_failed': ['rate<0.01'],                     // Error rate should be below 1%
        'errors': ['rate<0.05'],                              // Custom error rate threshold
        'ticket_response_time': ['p(90)<400', 'avg<200'],     // Custom response time thresholds
        'booking_success': ['count<=1'],                      // Only 1 booking should succeed (due to locking)
    },
};

// Configuration - Update these values based on your environment
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const API_GATEWAY_URL = __ENV.API_GATEWAY_URL || `${BASE_URL}/api`;

// Test users for authentication
// In production, you would use real JWT tokens or generate them
const testUsers = [
    { id: 1, token: __ENV.USER_TOKEN_1 || 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzAzOTEzODQsImV4cCI6MTc3MDQ4MTM4NH0.zB1pa--PDmAvNZSSDWP9tcrJrm70VrPEa3iMne9Rqmc' },
    { id: 2, token: __ENV.USER_TOKEN_2 || 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0IiwiZW1haWwiOiJ1c2VyMUBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MDM5MjUzNSwiZXhwIjoxNzcwNDgyNTM1fQ.8uS55uhXNOIQxTjZyCyrEXuxSDaUtsvLdCd1agYmOuA' },
    { id: 3, token: __ENV.USER_TOKEN_3 || 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwiZW1haWwiOiJ1c2VyMkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MDM5MjU3MCwiZXhwIjoxNzcwNDgyNTcwfQ.H5P1XdEi8nAuyctBm-DIBDLV1DmuxSD4O7Ymfs2kEPE' },
];

// Helper function to get a random test user
function getRandomUser() {
    return testUsers[Math.floor(Math.random() * testUsers.length)];
}

// Helper function to create authenticated headers
function getAuthHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

// Helper function to get user by VU index (for concurrent booking test)
function getUserByIndex(index) {
    return testUsers[index % testUsers.length];
}

// ============================================================
// CONCURRENT BOOKING TEST
// Tests race condition: 3 users try to book the same seat
// Expected: Only 1 should succeed, others should fail with lock error
// ============================================================
export function concurrentBookingTest(data) {
    // Each VU gets a different user (VU 0 = User 1, VU 1 = User 2, VU 2 = User 3)
    const vuIndex = __VU - 1;  // __VU is 1-indexed
    const user = getUserByIndex(vuIndex);
    const headers = getAuthHeaders(user.token);

    console.log(`\n========================================`);
    console.log(`[VU ${__VU}] User ${user.id} attempting to book seat ${TEST_SEAT_ID} on schedule ${TEST_SCHEDULE_ID}`);
    console.log(`========================================`);

    group('Concurrent Booking Test', function () {
        const bookingPayload = JSON.stringify({
            schedule_id: TEST_SCHEDULE_ID,
            seat_id: TEST_SEAT_ID,
            price: TEST_PRICE,
        });

        const startTime = Date.now();
        const response = http.post(`${API_GATEWAY_URL}/tickets/booking`, bookingPayload, {
            headers: headers,
            tags: { name: 'CreateBooking', user_id: user.id.toString() },
            timeout: '30s',
        });
        const duration = Date.now() - startTime;

        // Record response time
        bookingResponseTime.add(duration);

        console.log(`[VU ${__VU}] User ${user.id} - Response Status: ${response.status}`);
        console.log(`[VU ${__VU}] User ${user.id} - Response Time: ${duration}ms`);
        console.log(`[VU ${__VU}] User ${user.id} - Response Body: ${response.body}`);

        // Parse response
        let responseBody;
        try {
            responseBody = JSON.parse(response.body);
        } catch (e) {
            console.error(`[VU ${__VU}] Failed to parse response: ${e.message}`);
            responseBody = {};
        }

        // Check if booking was successful
        const isSuccess = response.status === 200 && responseBody.success === true;
        const isLocked = response.status === 500 &&
            (responseBody.message?.includes('locked') ||
                responseBody.message?.includes('already booked') ||
                response.body?.includes('locked') ||
                response.body?.includes('already booked'));

        // Validate response
        check(response, {
            'booking request completed': (r) => r.status === 200 || r.status === 500 || r.status === 400,
            'response has body': (r) => r.body && r.body.length > 0,
        });

        if (isSuccess) {
            bookingSuccess.add(1);
            console.log(`[VU ${__VU}] ✅ User ${user.id} SUCCESSFULLY booked the seat!`);
            console.log(`[VU ${__VU}] Ticket ID: ${responseBody.responseObject?.id || 'N/A'}`);
        } else if (isLocked) {
            bookingLocked.add(1);
            console.log(`[VU ${__VU}] 🔒 User ${user.id} - Seat is LOCKED by another user`);
        } else {
            bookingFailed.add(1);
            console.log(`[VU ${__VU}] ❌ User ${user.id} - Booking FAILED: ${responseBody.message || response.body}`);
        }
    });

    // Small delay to ensure all VUs have started
    sleep(0.1);
}

// Setup function - runs once before the test
export function setup() {
    console.log('Starting load test for Ticket Service - Get User Tickets & Concurrent Booking');
    console.log(`Target URL: ${API_GATEWAY_URL}/tickets/user/me`);
    console.log(`Booking URL: ${API_GATEWAY_URL}/tickets/booking`);
    console.log(`Test Schedule ID: ${TEST_SCHEDULE_ID}, Seat ID: ${TEST_SEAT_ID}`);

    // Verify endpoint is accessible with a simple health check
    const healthCheck = http.get(`${BASE_URL}/actuator/health`, {
        timeout: '10s',
    });

    if (healthCheck.status !== 200) {
        console.warn(`Health check returned status ${healthCheck.status}`);
    }

    return { startTime: new Date().toISOString() };
}

// Main test function
export default function (data) {
    const user = getRandomUser();
    const headers = getAuthHeaders(user.token);
    group('Get User Tickets', function () {
        // Test 1: Get user's tickets
        const startTime = Date.now();
        const response = http.get(`${API_GATEWAY_URL}/tickets/user/me`, {
            headers: headers,
            tags: { name: 'GetUserTickets' },
            timeout: '30s',
        });
        // console.log("res", response);
        const duration = Date.now() - startTime;

        // Record custom metrics
        ticketResponseTime.add(duration);

        // Validate response
        const success = check(response, {
            'status is 200': (r) => r.status === 200,
            'response has data': (r) => {
                try {
                    const body = JSON.parse(r.body);
                    // console.log("body", body);
                    return body.responseObject !== undefined;
                } catch (e) {
                    return false;
                }
            },
            'response has success flag': (r) => {
                try {
                    const body = JSON.parse(r.body);
                    return body.success === true;
                } catch (e) {
                    return false;
                }
            },
            'response time < 500ms': (r) => r.timings.duration < 500,
            'response time < 1000ms': (r) => r.timings.duration < 1000,
        });

        if (success) {
            ticketsFetched.add(1);
        } else {
            errorRate.add(1);
            console.log(`Request failed: Status ${response.status}, Body: ${response.body}`);
        }

        // Log response details for debugging (only on errors or in debug mode)
        if (response.status !== 200) {
            console.error(`Error fetching tickets for user ${user.id}: ${response.status} - ${response.body}`);
        }
    });


    // Simulate user think time between requests
    sleep(Math.random() * 2 + 1); // 1-3 seconds
}

// Teardown function - runs once after the test
export function teardown(data) {
    console.log('Load test completed');
    console.log(`Test started at: ${data.startTime}`);
    console.log(`Test ended at: ${new Date().toISOString()}`);
}

// Handle summary output
export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        './summary.json': JSON.stringify(data),
        './summary.html': htmlReport(data),
    };
}

// Text summary helper
function textSummary(data, opts) {
    const indent = opts.indent || '  ';
    let output = '\n';

    output += '='.repeat(60) + '\n';
    output += ' LOAD TEST SUMMARY - GET USER TICKETS\n';
    output += '='.repeat(60) + '\n\n';

    // Add basic metrics
    if (data.metrics) {
        output += `${indent}Total Requests: ${data.metrics.http_reqs?.values?.count || 'N/A'}\n`;
        output += `${indent}Failed Requests: ${data.metrics.http_req_failed?.values?.rate ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) + '%' : 'N/A'}\n`;
        output += `${indent}Avg Response Time: ${data.metrics.http_req_duration?.values?.avg?.toFixed(2) || 'N/A'}ms\n`;
        output += `${indent}95th Percentile: ${data.metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms\n`;
        output += `${indent}99th Percentile: ${data.metrics.http_req_duration?.values?.['p(99)']?.toFixed(2) || 'N/A'}ms\n`;
        output += `${indent}Tickets Fetched: ${data.metrics.tickets_fetched?.values?.count || 'N/A'}\n`;
    }

    output += '\n' + '='.repeat(60) + '\n';

    return output;
}

// HTML Report helper
function htmlReport(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Load Test Report - Get User Tickets</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        .metric { display: inline-block; background: #f8f9fa; padding: 15px 25px; margin: 10px; border-radius: 8px; border-left: 4px solid #4CAF50; }
        .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .success { border-left-color: #4CAF50; }
        .warning { border-left-color: #ff9800; }
        .error { border-left-color: #f44336; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #4CAF50; color: white; }
        tr:hover { background: #f5f5f5; }
        .timestamp { color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1> Load Test Report - Ticket Service</h1>
        <p class="timestamp">Generated at: ${new Date().toISOString()}</p>
        
        <h2> Key Metrics</h2>
        <div class="metrics">
            <div class="metric success">
                <div class="metric-label">Total Requests</div>
                <div class="metric-value">${data.metrics?.http_reqs?.values?.count || 'N/A'}</div>
            </div>
            <div class="metric ${(data.metrics?.http_req_failed?.values?.rate || 0) < 0.01 ? 'success' : 'error'}">
                <div class="metric-label">Error Rate</div>
                <div class="metric-value">${((data.metrics?.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%</div>
            </div>
            <div class="metric ${(data.metrics?.http_req_duration?.values?.avg || 0) < 200 ? 'success' : 'warning'}">
                <div class="metric-label">Avg Response Time</div>
                <div class="metric-value">${(data.metrics?.http_req_duration?.values?.avg || 0).toFixed(2)}ms</div>
            </div>
            <div class="metric">
                <div class="metric-label">95th Percentile</div>
                <div class="metric-value">${(data.metrics?.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms</div>
            </div>
        </div>
        
        <h2>📋 Thresholds</h2>
        <table>
            <tr><th>Threshold</th><th>Status</th></tr>
            ${Object.entries(data.thresholds || {}).map(([name, threshold]) => `
                <tr>
                    <td>${name}</td>
                    <td style="color: ${threshold.ok ? '#4CAF50' : '#f44336'}">${threshold.ok ? '✅ PASSED' : '❌ FAILED'}</td>
                </tr>
            `).join('')}
        </table>
    </div>
</body>
</html>`;
}
