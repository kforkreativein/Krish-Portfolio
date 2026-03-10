-- 1. Add a column for the actual video file
alter table projects add column if not exists video_url text default null;

-- 2. (Optional) Create a storage bucket for videos if you haven't yet
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- 3. Allow public access to watch the videos
create policy "Public Watch Access"
on storage.objects for select
using ( bucket_id = 'videos' );

-- 4. Allow you (Admin) to upload videos
create policy "Admin Upload Videos"
on storage.objects for insert
with check ( bucket_id = 'videos' );
