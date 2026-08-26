-- pgcrypto: gen_random_uuid() for primary keys
create extension if not exists pgcrypto;

-- pgvector: vector column type + similarity search operators for study_vectors
create extension if not exists vector;
