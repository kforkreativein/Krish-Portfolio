create table if not exists tools (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,
  emoji text,
  icon_url text default null,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamp default now()
);

alter table tools enable row level security;

drop policy if exists "Public read" on tools;
drop policy if exists "Admin all" on tools;

create policy "Public read" on tools for select using (true);
create policy "Admin all" on tools for all using (true);

-- Seed default tools
insert into tools (name, category, emoji, sort_order) values
  ('Premiere Pro', 'Video', '🎬', 1),
  ('After Effects', 'Video', '✨', 2),
  ('Photoshop', 'Design', '📸', 3),
  ('Instagram', 'Social', '📱', 4),
  ('ChatGPT', 'AI', '🤖', 5),
  ('Heygen', 'AI Avatar', '🎭', 6),
  ('Eleven Labs', 'AI Voice', '🔊', 7),
  ('Higgsfield', 'AI Video', '🎥', 8),
  ('Meta Ads', 'Marketing', '📊', 9);
