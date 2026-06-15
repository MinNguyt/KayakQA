-- Flyway migration V1__Create_users_table.sql
-- Creates the users table for the identity service

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(30),
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    age INT,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_active INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
