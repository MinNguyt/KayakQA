-- Flyway migration V2__Create_vehicles_table.sql
-- Creates the vehicles table with FK to bus_companies

CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    license_plate VARCHAR(50),
    capacity INT NOT NULL,
    company_id INT,
    featured_image VARCHAR(255) NOT NULL DEFAULT '',
    markdown_content TEXT,
    markdown_html TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_company_id (company_id),
    CONSTRAINT fk_vehicles_company FOREIGN KEY (company_id) REFERENCES bus_companies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
