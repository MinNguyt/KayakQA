-- Flyway migration V1__Create_bus_companies_table.sql
-- Creates the bus_companies table for the fleet service

CREATE TABLE IF NOT EXISTS bus_companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(50) NOT NULL,
    image VARCHAR(255),
    logo_url VARCHAR(255) NOT NULL DEFAULT '',
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    address VARCHAR(255) NOT NULL,
    markdown_content TEXT,
    markdown_html TEXT,
    descriptions TEXT,
    is_active INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_company_name (company_name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
