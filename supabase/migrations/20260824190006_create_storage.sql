-- Private bucket for uploaded topic files. Path convention:
-- {user_id}/{directory_id}/{file_id}-{original_name} — see docs/DATA.md.
insert into storage.buckets (id, name, public)
values ('topic-files', 'topic-files', false)
on conflict (id) do nothing;

create policy "Users can view their own topic files"
on storage.objects for select
using (
  bucket_id = 'topic-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can upload their own topic files"
on storage.objects for insert
with check (
  bucket_id = 'topic-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own topic files"
on storage.objects for delete
using (
  bucket_id = 'topic-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);
