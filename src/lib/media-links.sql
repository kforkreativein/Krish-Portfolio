-- Media links columns for projects table
alter table projects add column if not exists drive_url text default null;
alter table projects add column if not exists instagram_url text default null;
alter table projects add column if not exists youtube_url text default null;
alter table projects add column if not exists profile_url text default null;

-- Showreel link settings
insert into settings (key, value) values
  ('showreel_youtube_url', ''),
  ('showreel_drive_url', '')
on conflict (key) do nothing;
