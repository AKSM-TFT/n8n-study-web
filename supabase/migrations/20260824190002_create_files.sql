create table public.files (
  id uuid primary key default gen_random_uuid(),
  directory_id uuid not null references public.directories(id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'processed', 'failed')),
  created_at timestamptz not null default now()
);

create index files_directory_id_idx on public.files(directory_id);

alter table public.files enable row level security;

create policy "Users can view files in their own directories"
on public.files for select
using (
  exists (
    select 1 from public.directories d
    where d.id = files.directory_id and d.user_id = auth.uid()
  )
);

create policy "Users can insert files into their own directories"
on public.files for insert
with check (
  exists (
    select 1 from public.directories d
    where d.id = files.directory_id and d.user_id = auth.uid()
  )
);

create policy "Users can update files in their own directories"
on public.files for update
using (
  exists (
    select 1 from public.directories d
    where d.id = files.directory_id and d.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.directories d
    where d.id = files.directory_id and d.user_id = auth.uid()
  )
);

create policy "Users can delete files in their own directories"
on public.files for delete
using (
  exists (
    select 1 from public.directories d
    where d.id = files.directory_id and d.user_id = auth.uid()
  )
);
