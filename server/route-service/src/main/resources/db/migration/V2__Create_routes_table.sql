-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    departure_station_id INT NOT NULL,
    arrival_station_id INT NOT NULL,
    distance_km INT NOT NULL,
    estimated_duration_hours INT NOT NULL,
    is_active INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (departure_station_id) REFERENCES stations(id) ON DELETE CASCADE,
    FOREIGN KEY (arrival_station_id) REFERENCES stations(id) ON DELETE CASCADE,
    INDEX idx_routes_departure (departure_station_id),
    INDEX idx_routes_arrival (arrival_station_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
