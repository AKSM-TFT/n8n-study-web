# Architecture

## Tech stack
| Layer | Choice |
|---|---|
| Client (`client/`) | React 19 + TypeScript + Vite, Tailwind CSS v4 (`@tailwindcss/vite`), built as a PWA |
| Server (`server/`) | Node.js + Express + TypeScript — thin CRUD/auth-proxy layer only |
| Database | Supabase Postgres (+ `pgvector`) — one instance for app data and embeddings |
| Auth | Supabase Auth (email/password) |
| File storage | Supabase Storage |
| AI / automation | n8n — owns all embedding generation, RAG chat, quiz generation |
| LLM / embeddings runtime | Ollama (local, `llama3.2`) for chat answers; Hugging Face Inference API for embeddings and image-to-text |

The server deliberately does **no** AI work. It validates the Supabase session, does directory/file CRUD against Postgres/Storage, and forwards chat/quiz requests to n8n webhooks so n8n's URL and credentials never reach the browser. See `docs/PRODUCT.md` for the feature/route breakdown and `docs/DATA.md` for the schema.

## System overview

```mermaid
flowchart LR
    subgraph ClientApp["client/ — React PWA"]
        FE["React PWA"]
    end
    subgraph ServerApp["server/ — Node.js / Express"]
        API["CRUD + auth-proxy API"]
    end
    subgraph Supabase
        SBAuth["Auth"]
        SBDB["Postgres + pgvector"]
        SBStorage["Storage"]
    end
    subgraph n8n["n8n"]
        Ingest["Ingestion workflow\n(embeds uploaded files)"]
        Chat["Chat webhook\n(RAG over one directory)"]
        Quiz["Quiz webhook\n(generates quiz)"]
    end
    HF["Hugging Face Inference API\n(embeddings, image-to-text)"]
    Ollama["Ollama (llama3.2)"]

    FE -->|Supabase JS SDK: login/register| SBAuth
    FE -->|JWT| API
    API -->|service role| SBDB
    API -->|service role| SBStorage
    API -->|proxy chat/quiz requests| Chat
    API -->|proxy quiz requests| Quiz
    SBStorage -.->|polled for new files| Ingest
    Ingest --> HF
    Ingest -->|insert vector rows| SBDB
    Chat -->|query embedding| HF
    Chat -->|folder-isolated vector search| SBDB
    Chat --> Ollama
    Quiz -->|folder-isolated vector search| SBDB
    Quiz --> Ollama
```

## How the app runs

**Client** (`client/`):
```
cd client
npm run dev       # Vite dev server
npm run build      # tsc -b + production build
npm run lint
npm run preview
```

**Server** (`server/` — directory exists, Express app not yet scaffolded inside it): a standard Express + TypeScript app with its own `package.json`/`tsconfig.json`, independent of the client's Vite/TS config.

**n8n**: the two workflows in `n8n/` are imported into a running n8n instance (self-hosted or cloud) and activated. They call out to Postgres, Hugging Face, and a local Ollama instance (currently `http://host.docker.internal:11434`, i.e. n8n running in Docker reaching Ollama on the host).

**Environment variables** (target — none of this is wired up yet):
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — client (public)
- `SUPABASE_SERVICE_ROLE_KEY` — server only, never shipped to the client
- `N8N_CHAT_WEBHOOK_URL`, `N8N_QUIZ_WEBHOOK_URL` — server only, the Express layer's targets when proxying
- Hugging Face API key and Ollama host are n8n credentials/config, not app env vars

## Directory structure

Current repo root:
```
client/         # Vite React app (moved from repo root)
server/         # empty — Express app not yet scaffolded
n8n/            # exported n8n workflow JSON
docs/           # this documentation
README.md
```

Target, once the server and PWA scaffolding exist:
```
client/
  src/
    pages/        # Landing, Login, Register, Directory, Chat, Quiz
    components/
    lib/          # supabase client, api client
  public/
    manifest.json
    service-worker (or Vite PWA plugin output)
server/
  src/
    routes/     # directories, files, chat (proxy), quiz (proxy)
    middleware/ # supabase JWT verification
  package.json
  tsconfig.json
n8n/
docs/
README.md
```

## Auth flow

Supabase Auth issues the session; the server never sees a password, only verifies the JWT on each request.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as React PWA
    participant SB as Supabase Auth
    participant API as Express API
    participant DB as Postgres (RLS)

    U->>FE: submits login/register form
    FE->>SB: supabase.auth.signIn/signUp
    SB-->>FE: session (JWT + refresh token)
    FE->>FE: store session (supabase-js handles this)
    FE->>API: request with Authorization: Bearer <JWT>
    API->>SB: verify JWT (supabase-js admin / JWKS)
    API->>DB: query using verified user id
    DB-->>API: rows (also protected by Postgres RLS as defense in depth)
    API-->>FE: JSON response
```

Row-Level Security in Postgres is the actual data boundary (see `docs/DATA.md`); the Express layer's JWT check is a second gate, not the only one.

## Data flow: file ingestion (embedding pipeline)

This is what the existing `n8n/Multimodal RAG Quiz Workflow.json` + `... - Vector SubWorkflow.json` already implement, traced directly from the workflow JSON:

```mermaid
sequenceDiagram
    participant Cron as Schedule Trigger (every 5 min)
    participant Drive as File storage (currently Google Drive — see Known gaps)
    participant PG as Postgres (study_vectors)
    participant Sub as Vector sub-workflow
    participant HF as Hugging Face

    Cron->>Drive: list topic folders
    loop each topic folder
        Cron->>Drive: list files in folder
        Cron->>PG: SELECT file_id FROM study_vectors WHERE folder_id = $1
        Cron->>Cron: diff → unprocessed files only
        alt folder has unprocessed files
            Cron->>Sub: call sub-workflow per file
            Sub->>Drive: download file
            alt PDF
                Sub->>Sub: extract text
            else image
                Sub->>Sub: base64-encode
                Sub->>HF: image-to-text (vision chat completion)
            end
            Sub->>HF: generate embedding for extracted content
            Sub->>PG: INSERT INTO study_vectors (... ) ON CONFLICT (file_id) DO NOTHING
        end
    end
```

Today this is **poll-based** (every 5 minutes), not triggered instantly on upload. A future improvement is to have the server call an n8n webhook right after a Supabase Storage upload completes, instead of waiting on the poll — not yet implemented.

## Data flow: chat (RAG)

```mermaid
sequenceDiagram
    participant FE as React PWA
    participant API as Express API
    participant N8N as n8n chat webhook
    participant HF as Hugging Face (query embedding)
    participant PG as Postgres (study_vectors)
    participant Ollama as Ollama (llama3.2)

    FE->>API: POST /directories/:id/chat { message }
    API->>N8N: POST /webhook/chat-session { folder_id, message }
    N8N->>HF: embed the user message
    N8N->>PG: SELECT content FROM study_vectors WHERE folder_id = $1 ORDER BY embedding <=> $2 LIMIT 5
    N8N->>N8N: format retrieved chunks into a prompt
    N8N->>Ollama: /api/generate (context + question)
    Ollama-->>N8N: answer
    N8N-->>API: { reply }
    API-->>FE: { reply }
```

The vector search is scoped to a single `folder_id`, so one directory's chat can never see another directory's content — this isolation must be preserved in any future refactor.

## Known gaps between the existing n8n workflows and the target architecture
These are real, verified by reading the workflow JSON — not guesses — and should be resolved as part of building the app, not treated as already-correct:

1. **File storage is still Google Drive.** The ingestion workflow lists/downloads files from a hardcoded Google Drive folder. The target architecture uses Supabase Storage. The Drive nodes (`Search files and folders`, `Get Files In Topic Folder`, `Download File`) need to be replaced with Supabase Storage equivalents, and `folder_id`/`file_id` need to become Supabase `directories.id` / `files.id` (uuid) instead of Drive object IDs (string).
2. **Embedding model mismatch.** File ingestion embeds content with `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions), but the chat path embeds the user's query with `sentence-transformers/all-mpnet-base-v2` (768 dimensions). A pgvector column has a fixed dimension, so these two paths currently cannot share one vector space correctly — one of them must change. Standardize on a single model (recommend `all-MiniLM-L6-v2`, 384-dim, since that's what's already used for indexing) before wiring this up against a real `vector(384)` column.
3. **No chat history persistence.** The n8n chat webhook is stateless per request (embed → search → answer, no memory). If the Chat page needs visible history, that's an app-side concern (see `chat_messages` table in `docs/DATA.md`), not something n8n currently provides.
4. **Quiz generation workflow doesn't exist yet.** Only the RAG chat and ingestion pipelines are built. The quiz workflow (generate questions from a directory's embedded content plus online sources) still needs to be authored in n8n.
