-- Modify distance_km and estimated_duration_hours columns from INT to VARCHAR
ALTER TABLE routes MODIFY COLUMN distance_km VARCHAR(50) NOT NULL;
ALTER TABLE routes MODIFY COLUMN estimated_duration_hours VARCHAR(50) NOT NULL;
