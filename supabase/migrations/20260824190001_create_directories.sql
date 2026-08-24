create table public.directories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index directories_user_id_idx on public.directories(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_directories_updated_at
before update on public.directories
for each row
execute function public.set_updated_at();

alter table public.directories enable row level security;

create policy "Users can view their own directories"
on public.directories for select
using (auth.uid() = user_id);

create policy "Users can create their own directories"
on public.directories for insert
with check (auth.uid() = user_id);

create policy "Users can update their own directories"
on public.directories for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own directories"
on public.directories for delete
using (auth.uid() = user_id);
