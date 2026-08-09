-- Extensions the platform relies on. Runs once, when the data volume is first
-- created. pgvector backs candidate embedding search; the tables that use it
-- are owned by the ingestion and ranking verticals.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
