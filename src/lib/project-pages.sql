-- Run this in Supabase SQL editor to add project page support

-- Add new columns to existing projects table
alter table projects add column if not exists slug text default null;
alter table projects add column if not exists full_description text default null;
alter table projects add column if not exists results text default null;
alter table projects add column if not exists services_provided text[] default null;

-- Create project_reels table
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

-- Enable RLS
alter table project_reels enable row level security;

-- Policies
drop policy if exists "Public read" on project_reels;
drop policy if exists "Admin all" on project_reels;
create policy "Public read" on project_reels for select using (true);
create policy "Admin all" on project_reels for all using (true);

-- Seed slugs for existing projects (adjust to match your real titles)
update projects set slug = 'krish-wellness' where title ilike '%wellness%';
update projects set slug = 'krish-computer' where title ilike '%computer%';
update projects set slug = 'sparsh-beauty' where title ilike '%sparsh%';
update projects set slug = 'aeon-shoes' where title ilike '%aeon%';
