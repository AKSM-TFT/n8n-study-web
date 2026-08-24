create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  directory_id uuid not null references public.directories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_directory_id_idx on public.chat_messages(directory_id);

alter table public.chat_messages enable row level security;

create policy "Users can view their own chat messages"
on public.chat_messages for select
using (auth.uid() = user_id);

create policy "Users can insert their own chat messages"
on public.chat_messages for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own chat messages"
on public.chat_messages for delete
using (auth.uid() = user_id);
