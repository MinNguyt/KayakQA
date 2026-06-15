-- Add embedding column for vector similarity search (RAG chatbot)
ALTER TABLE vehicle_schedules ADD COLUMN embedding TEXT;
