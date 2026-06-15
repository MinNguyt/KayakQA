-- Add embedding columns for vector similarity search (RAG chatbot)
ALTER TABLE stations ADD COLUMN embedding TEXT;
ALTER TABLE routes ADD COLUMN embedding TEXT;
