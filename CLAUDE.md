# n8n-study-web

A study-tool PWA. Users register/log in, create per-topic "directories" (like Claude Desktop's Projects), and upload files (PDFs, images) into a directory. n8n embeds those files into a shared Postgres vector store, scoped per directory. From a directory, users can chat about the topic (RAG over their own uploaded files) or generate an AI quiz sourced from the topic's content plus online sources.

## Documentation map
Read the relevant doc before working in that area — this file is an index, not a duplicate of their content:

- **`docs/ARCHITECTURE.md`** — tech stack, how the app runs (dev commands, env vars), directory structure, auth flow, and flowcharts for the file-ingestion and chat pipelines (traced from the actual n8n workflow JSON). Also lists known gaps between the existing n8n workflows and the target architecture (Drive→Supabase Storage migration, an embedding-model dimension mismatch, missing quiz workflow) — check this before assuming the workflows in `n8n/` are already correct.
- **`docs/DESIGN.md`** — the design system: palette, type, spacing, component conventions, and an explicit list of AI-slop patterns (gradient backgrounds, glassmorphism, pill-everything, generic hero sections) to avoid. Follow this for any UI work.
- **`docs/DATA.md`** — full Supabase schema: relational tables (`directories`, `files`, `chat_messages`, `quizzes`, `quiz_questions`), the `study_vectors` embeddings table (grounded in the SQL the n8n workflows already execute), the folder-isolated search RPC, Storage bucket layout, and RLS notes.
- **`docs/PRODUCT.md`** — product description, the route table (`/`, `/login`, `/register`, `/directories`, `/directories/:id/chat`, `/directories/:id/quiz`), and a feature index mapping each feature to where it lives and how it's implemented.

## Architecture at a glance
- **Client** (`client/`) — React 19 + TypeScript + Vite + Tailwind CSS v4, PWA.
- **Server** (`server/`) — Node.js + Express + TypeScript, thin CRUD/auth-proxy layer only. It must **not** duplicate any embedding or LLM logic — that lives in n8n.
- **Data / Auth / Storage** — Supabase (Postgres + pgvector, Auth, Storage).
- **AI / automation** — n8n, calling Ollama and Hugging Face for embeddings/LLM/vision.

## Key constraints
- A directory holds files only — never nested folders. Enforce in UI and API (see `docs/PRODUCT.md`).
- Chat and quiz retrieval must stay folder-isolated — never leak embeddings across directories (see the RPC in `docs/DATA.md`).
- The server is CRUD/auth/proxy only; AI/embedding work belongs in n8n.

## Existing n8n workflows (`n8n/`)
Two workflow exports already exist and encode real pipeline decisions — full trace in `docs/ARCHITECTURE.md`. Short version: a schedule trigger polls a (currently Google Drive) topic folder every 5 minutes, extracts text/OCRs new files, embeds them, and inserts them into a Postgres `study_vectors` table; a webhook handles RAG chat by embedding the query, running a folder-isolated vector search, and calling Ollama. Read `docs/ARCHITECTURE.md`'s "Known gaps" section before building against these — the file-storage backend and embedding model are not yet consistent with the target Supabase-based architecture.

## Dev commands (client, from `client/`)
- `cd client && npm run dev` — start Vite dev server
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run lint` — run eslint
- `npm run preview` — preview the production build

`server/` exists but is empty — no Express app or commands yet (see `docs/ARCHITECTURE.md` for the target `server/` layout).

## Current state
Only the Vite React template is implemented today, under `client/` (`client/src/App.tsx`, `client/src/main.tsx`, Tailwind wired via `client/vite.config.ts`). Everything else described above and in `docs/` is the target architecture to build toward, not current state.
