-- Run this once in the Supabase SQL editor if saving projects fails with:
-- "Could not find the 'client_name' column of 'projects' in the schema cache"

alter table projects add column if not exists slug text default null;
alter table projects add column if not exists client_name text default null;
alter table projects add column if not exists role text default null;
alter table projects add column if not exists full_content text default null;
alter table projects add column if not exists full_description text default null;
alter table projects add column if not exists results text default null;
alter table projects add column if not exists services_provided text[] default null;
alter table projects add column if not exists thumbnail_url text default null;
alter table projects add column if not exists video_url text default null;
alter table projects add column if not exists drive_url text default null;
alter table projects add column if not exists instagram_url text default null;
alter table projects add column if not exists youtube_url text default null;
alter table projects add column if not exists profile_url text default null;
alter table projects add column if not exists featured_reel_id text default null;
alter table projects add column if not exists gallery_urls text[] default '{}';

create table if not exists project_reels (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text,
  caption text,
  video_url text,
  drive_url text,
  youtube_url text,
  instagram_url text,
  thumbnail_url text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamp default now()
);

alter table project_reels enable row level security;

drop policy if exists "Public read" on project_reels;
drop policy if exists "Admin all" on project_reels;
create policy "Public read" on project_reels for select using (true);
create policy "Admin all" on project_reels for all using (true);

notify pgrst, 'reload schema';
