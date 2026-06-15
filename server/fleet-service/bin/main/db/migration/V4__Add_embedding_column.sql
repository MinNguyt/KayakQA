-- Add embedding column for vector similarity search (RAG chatbot)
ALTER TABLE vehicles ADD COLUMN embedding TEXT;
