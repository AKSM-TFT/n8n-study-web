create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  directory_id uuid not null references public.directories(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create index quizzes_directory_id_idx on public.quizzes(directory_id);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  choices jsonb not null,
  correct_answer text not null,
  explanation text,
  source_url text,
  created_at timestamptz not null default now()
);

create index quiz_questions_quiz_id_idx on public.quiz_questions(quiz_id);

alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;

create policy "Users can view quizzes in their own directories"
on public.quizzes for select
using (
  exists (
    select 1 from public.directories d
    where d.id = quizzes.directory_id and d.user_id = auth.uid()
  )
);

create policy "Users can create quizzes in their own directories"
on public.quizzes for insert
with check (
  exists (
    select 1 from public.directories d
    where d.id = quizzes.directory_id and d.user_id = auth.uid()
  )
);

create policy "Users can delete quizzes in their own directories"
on public.quizzes for delete
using (
  exists (
    select 1 from public.directories d
    where d.id = quizzes.directory_id and d.user_id = auth.uid()
  )
);

create policy "Users can view quiz questions in their own directories"
on public.quiz_questions for select
using (
  exists (
    select 1 from public.quizzes q
    join public.directories d on d.id = q.directory_id
    where q.id = quiz_questions.quiz_id and d.user_id = auth.uid()
  )
);

create policy "Users can create quiz questions in their own directories"
on public.quiz_questions for insert
with check (
  exists (
    select 1 from public.quizzes q
    join public.directories d on d.id = q.directory_id
    where q.id = quiz_questions.quiz_id and d.user_id = auth.uid()
  )
);
