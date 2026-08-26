-- Column names/shape match the SQL the n8n workflows already execute
-- (n8n/Multimodal RAG Quiz Workflow.json, .../Vector SubWorkflow.json) — see docs/DATA.md.
-- folder_id/file_id are Supabase uuids here, replacing the Google Drive ids the
-- prototype workflows currently use; the workflows' Drive nodes still need updating
-- to write these uuids instead (see docs/ARCHITECTURE.md "Known gaps").
create table public.study_vectors (
  id bigserial primary key,
  folder_id uuid not null references public.directories(id) on delete cascade,
  topic_name text not null,
  file_id uuid not null references public.files(id) on delete cascade,
  file_name text not null,
  content text not null,
  -- 384 dims = sentence-transformers/all-MiniLM-L6-v2. Both the ingestion path and the
  -- chat query-embedding path must use this same model — see docs/DATA.md "Embedding dimension".
  embedding vector(384) not null,
  created_at timestamptz not null default now(),
  unique (file_id)
);

create index study_vectors_folder_id_idx on public.study_vectors(folder_id);

create index study_vectors_embedding_idx on public.study_vectors
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

alter table public.study_vectors enable row level security;

-- Read-only for end users; n8n writes via the Postgres service role, which
-- bypasses RLS by design (this table is populated by the ingestion pipeline,
-- not directly by users) — see docs/DATA.md.
create policy "Users can view vectors in their own directories"
on public.study_vectors for select
using (
  exists (
    select 1 from public.directories d
    where d.id = study_vectors.folder_id and d.user_id = auth.uid()
  )
);

-- Folder-isolated similarity search RPC. This is the enforcement point for
-- folder isolation: every chat/quiz retrieval must go through this function
-- (or an equivalent folder_id-scoped query) and must never search across directories.
-- Replaces the raw SQL currently inlined in the n8n "Folder Isolated Vector RPC Search" node:
--   SELECT content FROM study_vectors WHERE folder_id = $1 ORDER BY embedding <=> $2::vector LIMIT 5
create or replace function public.match_directory_chunks(
  p_folder_id uuid,
  p_query_embedding vector(384),
  p_match_count int default 5
)
returns table (content text, file_name text, similarity float)
language sql
stable
security definer
set search_path = public
as $$
  select content, file_name, 1 - (embedding <=> p_query_embedding) as similarity
  from public.study_vectors
  where folder_id = p_folder_id
  order by embedding <=> p_query_embedding
  limit p_match_count;
$$;
