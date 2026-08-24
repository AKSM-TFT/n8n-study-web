# Data Model

All data lives in one Supabase project: Postgres (relational + `pgvector`), Supabase Auth, and Supabase Storage. This doc defines the target schema and reconciles it against the columns/queries the existing n8n workflows already assume (extracted directly from `n8n/*.json`, not guessed) — see the migration notes at the bottom.

This schema is implemented as executable SQL in [`supabase/migrations/`](../supabase/migrations). If you change something here, update the corresponding migration (or add a new one — never edit an already-applied migration file) so this doc and the real database don't drift apart.

## Conventions
- Primary keys: `uuid default gen_random_uuid()`.
- Every table scoped to a user (directly or via `directory_id`) has Row-Level Security enabled — RLS is the real access boundary, the server's JWT check is a second gate, not a substitute.
- Timestamps: `created_at timestamptz default now()`, `updated_at` where rows are mutable.

## Auth
`auth.users` — managed entirely by Supabase Auth. No custom `profiles` table is needed for the MVP feature set (Landing, Login/Register, Directory, Chat, Quiz) since nothing beyond email + password is displayed today; add one later only if profile fields (display name, avatar) become a real requirement.

## Relational schema

### `directories`
One row per topic/"directory" a user creates. A directory holds files only — never nested directories — so there is no parent/child self-reference here by design.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid pk` | |
| `user_id` | `uuid` | references `auth.users(id)`, not null |
| `name` | `text` | not null |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

RLS: `user_id = auth.uid()` for all operations.

### `files`
One row per uploaded file within a directory. Tracks the ingestion pipeline's status so the Directory page can show "processing / processed / failed."

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid pk` | |
| `directory_id` | `uuid` | references `directories(id)` on delete cascade, not null |
| `storage_path` | `text` | path within the Supabase Storage bucket, not null |
| `original_name` | `text` | not null |
| `mime_type` | `text` | not null |
| `status` | `text` | `'pending' \| 'processing' \| 'processed' \| 'failed'`, default `'pending'` |
| `created_at` | `timestamptz` | |

RLS: via join — user may access a row only if `directory_id` belongs to a directory they own.

### `study_vectors` (embeddings — the table the existing n8n workflows already read/write)
This table's shape comes directly from the SQL embedded in `n8n/Multimodal RAG Quiz Workflow.json` and `... - Vector SubWorkflow.json` (`INSERT INTO study_vectors (folder_id, topic_name, file_id, file_name, content, embedding) ... ON CONFLICT (file_id) DO NOTHING`, and reads filtered by `folder_id`). The target schema keeps the same table/column names so the workflows keep working, but repoints the id-shaped columns at Supabase's own uuids instead of Google Drive ids:

| Column | Type | Notes |
|---|---|---|
| `id` | `bigserial pk` | not referenced by n8n today, but needed as a real primary key |
| `folder_id` | `uuid` | references `directories(id)` — **was** the Google Drive folder id (text); see migration notes |
| `topic_name` | `text` | denormalized copy of `directories.name`, kept because the existing "Fetch Available Topics" query reads it directly without a join |
| `file_id` | `uuid` | references `files(id)`, **unique** — the existing insert relies on `ON CONFLICT (file_id) DO NOTHING` as its idempotency guard for the 5-minute re-poll |
| `file_name` | `text` | denormalized copy of `files.original_name` |
| `content` | `text` | extracted PDF text or image-to-text transcription for this chunk |
| `embedding` | `vector(384)` | see "Embedding dimension" below — must match whatever model produces both indexing and query vectors |
| `created_at` | `timestamptz` | |

Indexes: `unique (file_id)` (already relied upon by the insert), `create index on study_vectors using ivfflat (embedding vector_cosine_ops)` for the similarity search, plus a plain index on `folder_id` since every read filters by it first.

RLS: via join on `folder_id -> directories.user_id = auth.uid()`. The n8n workflows write via the Postgres **service role** (bypasses RLS by design — this is the ingestion pipeline, not a user session).

#### Folder-isolated search RPC
The existing "Folder Isolated Vector RPC Search" node runs:
```sql
SELECT content FROM study_vectors WHERE folder_id = $1 ORDER BY embedding <=> $2::vector LIMIT 5
```
As a real Supabase RPC function (so app code and n8n both call one definition instead of raw SQL scattered across workflows):
```sql
create or replace function match_directory_chunks(
  p_folder_id uuid,
  p_query_embedding vector(384),
  p_match_count int default 5
)
returns table (content text, file_name text, similarity float)
language sql stable as $$
  select content, file_name, 1 - (embedding <=> p_query_embedding) as similarity
  from study_vectors
  where folder_id = p_folder_id
  order by embedding <=> p_query_embedding
  limit p_match_count;
$$;
```
This is the enforcement point for **folder isolation** — every chat/quiz retrieval must go through this function (or an equivalent `WHERE folder_id = ...`-scoped query) and must never search across directories.

### `chat_messages`
Not present in the current n8n workflow (the chat webhook is stateless — embed, search, answer, forget). Needed app-side if the Chat page shows message history.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid pk` | |
| `directory_id` | `uuid` | references `directories(id)` on delete cascade |
| `user_id` | `uuid` | references `auth.users(id)` |
| `role` | `text` | `'user' \| 'assistant'` |
| `content` | `text` | |
| `created_at` | `timestamptz` | |

RLS: `user_id = auth.uid()`.

### `quizzes` and `quiz_questions`
Not built in n8n yet (see `docs/ARCHITECTURE.md` known gaps) — this is the schema the quiz-generation workflow should write into once it exists.

`quizzes`:
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid pk` | |
| `directory_id` | `uuid` | references `directories(id)` on delete cascade |
| `title` | `text` | |
| `created_at` | `timestamptz` | |

`quiz_questions`:
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid pk` | |
| `quiz_id` | `uuid` | references `quizzes(id)` on delete cascade |
| `question` | `text` | |
| `choices` | `jsonb` | array of option strings |
| `correct_answer` | `text` | |
| `explanation` | `text` | nullable |
| `source_url` | `text` | nullable — citation when the quiz pulls from an online source |

RLS on both: via join back to `directories.user_id = auth.uid()`.

*Not included for MVP:* per-attempt scoring (`quiz_attempts`/`quiz_answers`). Add only when the Quiz page actually needs to persist scores across sessions — see `docs/PRODUCT.md`.

## Storage

One bucket, `topic-files`, private (no public access — files are served through signed URLs the server requests with the service role).

Path convention: `{user_id}/{directory_id}/{file_id}-{original_name}`

This mirrors the Drive structure the current workflow already assumes (one folder per topic containing files only, no subfolders) — see "Migration notes" below. Storage RLS policies restrict `select`/`insert`/`delete` to paths whose first segment equals `auth.uid()`.

## Embedding dimension
The current n8n workflows use **two different embedding models** that don't share a vector space (see `docs/ARCHITECTURE.md` known gaps): `all-MiniLM-L6-v2` (384-dim) for indexing file content, `all-mpnet-base-v2` (768-dim) for embedding the chat query. The schema above picks **`vector(384)`** and standardizes on `all-MiniLM-L6-v2` for both paths — the chat/quiz webhook's query-embedding step must be updated to match before this schema goes live, or similarity search will silently return nothing useful.

## Migration notes (Google Drive/prototype → Supabase)
| Existing n8n concept | Target Supabase equivalent |
|---|---|
| Drive folder id (string, e.g. `1dbh7AH3...`) as `folder_id` | `directories.id` (uuid) |
| Drive folder name as `topic_name` | `directories.name` |
| Drive file id (string) as `file_id` | `files.id` (uuid) |
| Drive file name | `files.original_name` |
| "list folders in root, list files in folder" (Drive query nodes) | list `directories` for the schedule loop; list objects under `topic-files/{user_id}/{directory_id}/` in Storage |
| Hardcoded root Drive folder id in the workflow | removed entirely — directories are just rows in `directories`, no external "root container" needed |
