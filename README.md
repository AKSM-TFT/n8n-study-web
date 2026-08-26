# n8n-study-web

A study-tool PWA. Create a directory per topic, upload your own files (PDFs, images), and n8n embeds them into a vector store scoped to that directory. Then chat about the topic or generate a quiz — grounded only in what you uploaded.

See `docs/PRODUCT.md` for the full product description, routes, and feature list.

## Repo layout
```
client/   # React + TypeScript + Vite + Tailwind frontend (PWA)
server/   # Node.js + Express + TypeScript backend — CRUD/auth-proxy layer (not yet scaffolded)
n8n/      # exported n8n workflows: file ingestion/embedding, RAG chat
docs/     # architecture, design system, data schema, product docs
```

## Documentation
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — tech stack, how the app runs, directory structure, auth flow, data-flow diagrams
- [`docs/DESIGN.md`](docs/DESIGN.md) — the design system
- [`docs/DATA.md`](docs/DATA.md) — Supabase schema (relational + vector) and storage layout
- [`docs/PRODUCT.md`](docs/PRODUCT.md) — product description, routes, feature index

`CLAUDE.md` is a short index into these docs for AI-assisted development.

## Getting started
The client is the only part scaffolded so far:
```
cd client
npm install
npm run dev
```

`server/` and the PWA manifest/service worker are not yet implemented — see `docs/ARCHITECTURE.md`'s directory structure section for the target layout.
