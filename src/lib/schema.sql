-- Hero content
create table hero (
  id uuid default gen_random_uuid() primary key,
  title_line1 text default 'Video',
  title_line2 text default 'Editor',
  title_line3 text default '& AI Expert',
  subtitle text default 'Video Editor & AI Marketing Expert',
  description text default 'I''m Krish — a video editor and AI marketing expert from Vadodara. I build content that makes people stop, watch, and act.',
  stat_clients int default 20,
  stat_years int default 3,
  stat_videos int default 100,
  stat_ai_systems int default 5,
  updated_at timestamp default now()
);
-- Services
create table services (
  id uuid default gen_random_uuid() primary key,
  number text,
  title text,
  description text,
  tags text[],
  bullets text[],
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamp default now()
);
-- Projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  category text,
  title text,
  description text,
  gradient text,
  emoji text,
  is_cta boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamp default now()
);
-- Testimonials
create table testimonials (
  id uuid default gen_random_uuid() primary key,
  quote text,
  author_name text,
  author_role text,
  author_initial text,
  stars int default 5,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamp default now()
);
-- Clients
create table clients (
  id uuid default gen_random_uuid() primary key,
  name text,
  type text,
  logo_url text,
  is_cta boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamp default now()
);
-- Contact form leads
create table leads (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  phone text,
  project_type text,
  status text default 'new',
  created_at timestamp default now()
);
-- Row Level Security
alter table hero enable row level security;
alter table services enable row level security;
alter table projects enable row level security;
alter table testimonials enable row level security;
alter table clients enable row level security;
alter table leads enable row level security;
create policy "Public read" on hero for select using (true);
create policy "Public read" on services for select using (true);
create policy "Public read" on projects for select using (true);
create policy "Public read" on testimonials for select using (true);
create policy "Public read" on clients for select using (true);
create policy "Insert leads" on leads for insert with check (true);
create policy "Update leads" on leads for update using (true);
-- Allow all operations for admin (uses anon key from env)
create policy "Admin all" on hero for all using (true);
create policy "Admin all" on services for all using (true);
create policy "Admin all" on projects for all using (true);
create policy "Admin all" on testimonials for all using (true);
create policy "Admin all" on clients for all using (true);
create policy "Admin leads" on leads for all using (true);

-- Add media fields to existing tables
alter table hero add column if not exists bg_image_url text default null;
alter table projects add column if not exists thumbnail_url text default null;
alter table projects add column if not exists video_url text default null;
alter table clients add column if not exists logo_url text default null;
alter table testimonials add column if not exists photo_url text default null;
alter table services add column if not exists image_url text default null;

-- New table for site-wide settings
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value text,
  updated_at timestamp default now()
);
create policy "Public read settings" on settings for select using (true);
create policy "Admin all settings" on settings for all using (true);
alter table settings enable row level security;

-- Insert default settings
insert into settings (key, value) values
  ('showreel_url', ''),
  ('avatar_image_url', ''),
  ('hero_bg_url', ''),
  ('hero_photo_url', ''),
  ('different_photo_url', ''),
  ('instagram_url', ''),
  ('behance_url', ''),
  ('dribbble_url', ''),
  ('agency_url', ''),
  ('whatsapp_number', ''),
  ('contact_email', ''),
  ('meta_title', 'Krish Chhatrala — Video Editor & AI Expert'),
  ('meta_description', 'Creative Video Editor & AI Automation Specialist based in Vadodara.')
on conflict (key) do nothing;
