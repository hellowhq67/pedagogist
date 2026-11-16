insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'practice-recordings',
  'practice-recordings',
  false,
  52428800,
  array['audio/webm', 'audio/mp4', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/aac']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload own practice recordings" on storage.objects;
create policy "Users upload own practice recordings"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'practice-recordings'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users read own practice recordings" on storage.objects;
drop policy if exists "Authenticated can read practice recordings" on storage.objects;
create policy "Users read own practice recordings"
on storage.objects for select to authenticated
using (
  bucket_id = 'practice-recordings'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users delete own practice recordings" on storage.objects;
create policy "Users delete own practice recordings"
on storage.objects for delete to authenticated
using (
  bucket_id = 'practice-recordings'
  and (storage.foldername(name))[1] = auth.uid()::text
);
