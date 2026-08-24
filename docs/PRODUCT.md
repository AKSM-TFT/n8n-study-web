# Product

## What this is
A study tool for people learning from their own material. You create a directory per topic, drop in your PDFs/images (lecture slides, scanned notes, textbook pages), and the app embeds them so you can chat with your own material and generate quizzes from it — instead of re-reading everything or making flashcards by hand.

Target user: a student or self-learner with a pile of files for one subject who wants to ask questions against exactly that material (not the open internet) and test themselves on it.

## Non-goals (explicitly out of scope for now)
- Nested folders within a directory — a directory holds files only. This is a deliberate constraint, not a missing feature.
- Multi-user collaboration on a shared directory — directories are single-owner (`user_id` on the row, see `docs/DATA.md`).
- Editing/annotating the source files themselves — files are inputs to embedding, not documents you work on in-app.

## Routes and what lives there

| Route | Page | Auth required | Purpose |
|---|---|---|---|
| `/` | Landing | no | Entry point: explains the product, links to Login/Register. |
| `/login` | Login | no | Email/password sign-in via Supabase Auth. |
| `/register` | Register | no | Account creation via Supabase Auth. |
| `/directories` | Directory | yes | List, create, and delete topic directories; upload files into a directory; see each file's ingestion status (pending/processing/processed/failed). |
| `/directories/:directoryId/chat` | Chat | yes | Ask questions about the selected directory's material; answers are retrieved only from that directory's embedded content (folder-isolated RAG). |
| `/directories/:directoryId/quiz` | Quiz | yes | Generate and take a quiz drawn from the directory's material plus online sources; see which answers were right/wrong. |

Everything under `/directories/*` requires an authenticated session and requires the directory in the URL to belong to the current user (enforced by Postgres RLS — see `docs/DATA.md`).

## Feature index
A quick "where do I find X" map, cross-referenced to the docs that define how it works.

| Feature | Where | Implementation reference |
|---|---|---|
| Create a topic | Directory page, "New directory" action | `directories` table — `docs/DATA.md` |
| Upload a file to a topic | Directory page, inside a directory | Supabase Storage `topic-files` bucket, `files` table — `docs/DATA.md` |
| File processing status (pending/processing/processed/failed) | Directory page, per-file badge | `files.status`, populated as the ingestion workflow processes each file — `docs/ARCHITECTURE.md` (ingestion sequence) |
| Delete a directory | Directory page | Cascades to its `files` and `study_vectors` rows — `docs/DATA.md` |
| Ask a question about a topic | Chat page | n8n chat webhook, folder-isolated vector search — `docs/ARCHITECTURE.md` (chat sequence) |
| Chat history | Chat page | `chat_messages` table — `docs/DATA.md` (app-side addition; n8n's chat webhook itself is stateless) |
| Generate a quiz | Quiz page, "Generate quiz" action | n8n quiz workflow (not yet built — see `docs/ARCHITECTURE.md` known gaps), writes to `quizzes`/`quiz_questions` — `docs/DATA.md` |
| Take a quiz / see right vs. wrong answers | Quiz page | `quiz_questions.correct_answer`, feedback styled per `docs/DESIGN.md` (status colors, not iconography) |
| Sign up / log in | Register / Login pages | Supabase Auth — `docs/ARCHITECTURE.md` (auth flow) |

## Constraints that shape the product (not just the code)
- **A directory only contains files.** No subfolders, no reorganizing files across directories after upload. This keeps "what can this chat see" always obvious to the user: the directory *is* the scope.
- **Chat and quiz answers are grounded in the selected directory only**, never mixed with another directory's material — this is both a correctness requirement and a trust feature (a user should be able to rely on "this only knows what I put in here").
- **Files are inputs, not editable documents.** Once uploaded, a file is either being processed or has been embedded; the product does not offer in-app document editing.
