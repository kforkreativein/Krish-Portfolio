# MASTER PROMPT — Full-Stack Portfolio Website with Admin CMS

Use this prompt exactly with Claude Code or Antigravity. It builds a complete, production-ready portfolio website with a full backend admin panel. No coding knowledge required after setup — everything is editable from the admin dashboard.

---

## WHAT YOU ARE BUILDING

A professional portfolio website for a creative freelancer (video editor, designer, marketer, etc.) with:

1. **A public-facing homepage** with multiple sections: Navbar, Hero, About, Tools, Clients Marquee, Services, Work/Projects carousel, Showreel video, Process steps, Testimonials, CTA, Footer
2. **Individual project pages** at `/work/[slug]` showing reels, description, results, services
3. **A full admin dashboard** at `/admin` — password-protected, no coding needed to update anything on the site
4. **A contact lead capture system** — visitors submit inquiries, admin sees them in a table
5. **Dark/light theme** toggle with fully customizable colors from admin
6. **100% editable from admin** — every word, image, color, section order, and setting

---

## TECH STACK

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion
- **Database + Storage**: Supabase (free tier works)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Deployment**: Vercel (free)

---

## STEP 1 — PROJECT SETUP

```bash
npm create vite@latest my-portfolio -- --template react
cd my-portfolio
npm install
npm install @supabase/supabase-js framer-motion react-router-dom lucide-react tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Create a `.env` file in the root:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_PASSWORD=your_chosen_password
```

---

## STEP 2 — SUPABASE DATABASE SETUP

Go to your Supabase project → SQL Editor → run this entire SQL:

```sql
-- SITE CONTENT (single row config for all text/colors/settings)
create table if not exists site_content (
  id int primary key default 1,
  -- Hero
  hero_badge text,
  hero_heading_part1 text default 'I Make Your Brand',
  hero_heading_part2 text default 'Impossible to Scroll Past',
  hero_heading_part3 text default 'with AI + Video',
  hero_subheading text,
  hero_primary_cta text default 'Let''s Talk',
  hero_secondary_cta text default 'View My Work',
  hero_bottom_stats text,
  hero_card_name text,
  hero_card_badge text,
  hero_card_location text,
  -- About/Different
  diff_heading text,
  diff_text text,
  about_cta_text text,
  -- Services
  services_heading text,
  -- Work
  work_heading text,
  work_label text,
  -- Showreel
  showreel_heading text,
  showreel_title text,
  showreel_subtext text,
  showreel_video_url text,
  showreel_youtube_url text,
  -- Process
  process_heading text,
  -- Testimonials
  testimonials_heading text,
  -- CTA
  cta_heading text,
  cta_subheading text,
  cta_pills jsonb default '[]',
  level_up_cta_text text default 'Let''s Talk',
  -- Footer
  footer_big_text text,
  footer_text text,
  -- Navbar
  nav_logo_text text default 'Portfolio.',
  nav_status_text text default 'Available for work',
  nav_cta_text text default 'Contact',
  nav_cta_text_mobile text default 'Let''s Talk',
  nav_icon_url text,
  -- Global
  favicon_url text,
  floating_cta_text text default 'Let''s Talk',
  floating_cta_link text,
  marquee_heading text,
  tools_heading text,
  -- Theme colors
  theme_accent_light text default '#0A68FF',
  theme_accent_dark text default '#CCFF00',
  theme_bg_light text default '#FAFAFA',
  theme_bg_dark text default '#080808',
  theme_text_light text default '#0A0A0A',
  theme_text_dark text default '#EDE9E3',
  theme_secondary_text_light text default '#4B5563',
  theme_secondary_text_dark text default '#A1A1AA',
  theme_btn_filled_text_light text default '#FFFFFF',
  theme_btn_filled_text_dark text default '#000000',
  theme_btn_ghost_text_light text default '#000000',
  theme_btn_ghost_text_dark text default '#FFFFFF',
  -- Dynamic social links
  dynamic_social_links jsonb default '[]',
  -- Section layout
  section_order jsonb default '["hero","different","tools","marquee","services","work","showreel","process","testimonials","cta"]',
  hidden_sections jsonb default '[]'
);

insert into site_content (id) values (1) on conflict (id) do nothing;

-- SETTINGS (key-value pairs for media URLs, links, SEO, padding)
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text,
  created_at timestamptz default now()
);

-- SERVICES
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  number text,
  title text not null,
  description text,
  tags text[],
  bullet_points text[],
  image_url text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- PROJECTS
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  category text,
  title text not null,
  slug text unique,
  description text,
  full_description text,
  full_content text,
  results text,
  services_provided text[],
  gradient text,
  emoji text,
  thumbnail_url text,
  video_url text,
  youtube_url text,
  drive_url text,
  instagram_url text,
  profile_url text,
  featured_reel_id uuid,
  gallery_urls text[],
  client_name text,
  role text,
  is_active boolean default true,
  is_cta boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- PROJECT REELS (videos linked to projects)
create table if not exists project_reels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text,
  caption text,
  video_url text,
  youtube_url text,
  drive_url text,
  instagram_url text,
  thumbnail_url text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- TESTIMONIALS
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author_name text,
  author_role text,
  author_initial text,
  photo_url text,
  stars int default 5,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- CLIENTS (for logo marquee strip)
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  logo_url text,
  logo_light_url text,
  logo_dark_url text,
  logo_bw_url text,
  use_bw boolean default false,
  use_same_logo boolean default true,
  is_active boolean default true,
  is_cta boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- TOOLS / STACK
create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  emoji text,
  icon_url text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- PROCESS STEPS
create table if not exists process_steps (
  id uuid primary key default gen_random_uuid(),
  step_number text,
  title text not null,
  description text,
  icon_light_url text,
  icon_dark_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- LEADS (contact form submissions)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  project_type text,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY (allow public read, authenticated write via anon key)
alter table site_content enable row level security;
alter table settings enable row level security;
alter table services enable row level security;
alter table projects enable row level security;
alter table project_reels enable row level security;
alter table testimonials enable row level security;
alter table clients enable row level security;
alter table tools enable row level security;
alter table process_steps enable row level security;
alter table leads enable row level security;

-- Public read policies
create policy "Public read" on site_content for select using (true);
create policy "Public read" on settings for select using (true);
create policy "Public read" on services for select using (true);
create policy "Public read" on projects for select using (true);
create policy "Public read" on project_reels for select using (true);
create policy "Public read" on testimonials for select using (true);
create policy "Public read" on clients for select using (true);
create policy "Public read" on tools for select using (true);
create policy "Public read" on process_steps for select using (true);
create policy "Public read" on leads for select using (true);

-- Full access for anon (admin panel uses anon key with password protection)
create policy "Anon write" on site_content for all using (true);
create policy "Anon write" on settings for all using (true);
create policy "Anon write" on services for all using (true);
create policy "Anon write" on projects for all using (true);
create policy "Anon write" on project_reels for all using (true);
create policy "Anon write" on testimonials for all using (true);
create policy "Anon write" on clients for all using (true);
create policy "Anon write" on tools for all using (true);
create policy "Anon write" on process_steps for all using (true);
create policy "Anon write" on leads for all using (true);
```

Then go to Supabase → Storage → Create a new bucket called `portfolio-media`, set it to **Public**.

---

## STEP 3 — FILE STRUCTURE

Build exactly this file structure:

```
src/
  components/
    layout/
      Navbar.jsx
      Footer.jsx
    sections/
      Hero.jsx
      Different.jsx
      Services.jsx
      Work.jsx
      Showreel.jsx
      Process.jsx
      Tools.jsx
      Testimonials.jsx
      LogoStrip.jsx
      CTA.jsx
    ui/
      Button.jsx
      PhoneCard.jsx
      ReelCard.jsx
      ContactModal.jsx
      Cursor.jsx
      FloatingCTA.jsx
      SectionLabel.jsx
      SectionTitle.jsx
      ThemeToggle.jsx
      Skeleton.jsx
  constants/
    animations.js
    data.js
    socialIcons.jsx
  hooks/
    useContent.js
    useTheme.jsx
    useScrollLock.js
    useCursor.js
  lib/
    supabase.js
  pages/
    Admin.jsx
    ProjectPage.jsx
  styles/
    globals.css
  utils/
    videoUtils.js
    imageUtils.js
    whatsapp.jsx
  App.jsx
  main.jsx
index.html
vite.config.js
tailwind.config.js
server.js
```

---

## STEP 4 — FULL IMPLEMENTATION SPEC

### `src/lib/supabase.js`
- Initialize Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Export an `uploadFile(fileName, file)` function that uploads to the `portfolio-media` bucket and returns the public URL

### `src/hooks/useContent.js`
Create these custom hooks using Supabase:
- `useSettings()` — fetches all rows from `settings` table, returns them as a flat key-value map object
- `useSiteContent()` — fetches row id=1 from `site_content`
- `useProjects()` — fetches active projects ordered by sort_order, includes nested `project_reels` via join
- `useServices()` — fetches active services ordered by sort_order
- `useTestimonials()` — fetches active testimonials ordered by sort_order
- `useClients()` — fetches active clients ordered by sort_order
- `useTools()` — fetches active tools ordered by sort_order
- `useProcessSteps()` — fetches process_steps ordered by sort_order
- Each hook returns `{ data, loading, error }`

### `src/hooks/useTheme.jsx`
- React Context that stores `theme` as `'dark'` or `'light'` in localStorage
- Default to `'dark'`
- Adds/removes `.dark` class on `document.documentElement`
- Exports `ThemeProvider` wrapper and `useTheme()` hook

### `src/utils/videoUtils.js`
Export these functions:
- `getVideoType(reel)` — returns `'youtube' | 'direct' | 'drive' | 'instagram' | 'thumbnail'` based on which URL field is present, in that priority order
- `getYouTubeId(url)` — extracts YouTube video ID from any YouTube URL format (watch, youtu.be, shorts, embed)
- `getYouTubeThumbnail(id)` — returns `https://img.youtube.com/vi/${id}/hqdefault.jpg`
- `getYouTubeEmbedUrl(id)` — returns embed URL with `autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0`
- `normalizeDriveUrl(url)` — converts Google Drive share links to `/preview` format

### `src/utils/imageUtils.js`
Export:
- `optimizeImage(url, { width, quality, format })` — appends Supabase transform params only for Supabase-hosted URLs; returns unchanged for external URLs
- Preset functions: `heroImage(url)`, `thumbnailImage(url)`, `logoImage(url)`, `avatarImage(url)`, `toolImage(url)`

### `src/constants/animations.js`
Export Framer Motion variants:
- `fadeUp` — fades in and slides up from 20px
- `fadeIn` — simple opacity fade
- `stagger` — stagger container (staggerChildren: 0.1)
- `slideIn` — slides in from left

### `src/constants/socialIcons.jsx`
Export an array `SOCIAL_ICON_OPTIONS` of icon names from Lucide React (Instagram, Twitter, Youtube, Linkedin, Github, Globe, Mail, Phone, etc.)
Export `getSocialIconByName(name)` — returns the Lucide icon component by string name, falls back to Globe

### `src/styles/globals.css`
- Import Tailwind base, components, utilities
- Import Google Fonts: Syne (weights 400, 700, 800) and DM Sans (weights 400, 500, 600)
- Set CSS custom properties on `:root`: `--bg`, `--bg-2`, `--bg-3`, `--bg-4`, `--text`, `--text-muted`, `--text-dim`, `--accent`, `--border`, `--border-strong`
- Map Tailwind to use these variables: `bg-bg`, `text-text`, `text-text-muted`, `border-border`, `text-accent`, `bg-accent`, `bg-bg-2`, `bg-bg-3`
- Add grain overlay CSS: `.grain-overlay` with a repeating SVG noise pattern, 0.03 opacity, pointer-events none, fixed position
- Add `.noise` class for subtle noise texture
- Add `.hide-scrollbar` to hide scrollbar while keeping scroll behavior
- Add `@keyframes marquee` for infinite scroll animation (translateX from 0 to -50%)
- Add `@keyframes skeleton-pulse` (opacity 1 → 0.4 → 1 over 1.5s)
- Add `@keyframes spin` (0 to 360deg)
- Add `.font-heading` mapped to Syne, `.font-body` mapped to DM Sans
- Add `.glass` for glassmorphism effect

### `tailwind.config.js`
Extend theme with:
- Colors mapped to CSS variables: `bg: 'var(--bg)'`, `text: { DEFAULT: 'var(--text)', muted: 'var(--text-muted)', dim: 'var(--text-dim)' }`, `accent: 'var(--accent)'`, `border: { DEFAULT: 'var(--border)', strong: 'var(--border-strong)' }`, `bg-2: 'var(--bg-2)'`, `bg-3: 'var(--bg-3)'`, `bg-4: 'var(--bg-4)'`
- Font families: `heading: ['Syne', 'sans-serif']`, `body: ['DM Sans', 'sans-serif']`

---

## SECTION COMPONENTS

### `src/components/sections/Hero.jsx`
Props: `siteContent, settings, onOpenModal`

Layout: Two-column on desktop (text left, card right), single column mobile.

Left side:
- Badge pill: `siteContent.hero_badge` text with animated dot
- Heading: Three parts — `hero_heading_part1` in default text color, `hero_heading_part2` in default text color, `hero_heading_part3` in accent color. Large bold font (clamp 40px to 80px). Animate in with fadeUp on mount.
- Subheading: `hero_heading` or `hero_subheading` body text, muted color
- Two buttons side by side: Primary (`hero_primary_cta`, filled accent style, onClick → onOpenModal) and Secondary (`hero_secondary_cta`, ghost/outlined style, scrolls to #work section)
- Stats bar: `hero_bottom_stats` text in small muted font with separator dots

Right side (hidden on mobile):
- Identity card with glassmorphism background
- Avatar image from `settings.hero_photo_url` (or background image), rounded phone shape (9:16 aspect ratio), width ~260px
- Below image: name badge (`hero_card_name`), availability badge (`hero_card_badge`), location text (`hero_card_location`)

Background: optional `settings.hero_bg_url` as full-bleed background image at low opacity.

All animations use Framer Motion `fadeUp` and `stagger` variants.

### `src/components/sections/Different.jsx`
Props: `siteContent`

Two-column layout (image left, text right) on desktop.

- Photo from `settings.different_photo_url` — rounded corners, loading lazy
- Heading from `siteContent.diff_heading` — large bold font with accent word
- Body text from `siteContent.diff_text` — muted, readable line height
- CTA button linking to #work section: `siteContent.about_cta_text`

### `src/components/sections/Services.jsx`
Props: `siteContent`

Uses `useServices()` hook.

- Section heading from `siteContent.services_heading`
- Grid or vertical list of service cards
- Each card: number (large faded), title, description, tags as pills, bullet points list, image (if set)
- Animate cards in with Framer Motion stagger on scroll

### `src/components/sections/Work.jsx`
Props: `onOpenModal, settings, siteContent`

Fetches projects independently from Supabase (do NOT use useProjects hook — fetch directly for featured reel merge logic).

- Section label and heading from siteContent
- Horizontal scroll container with snap scrolling
- For each active project, render a `<PhoneCard>` component
- Featured reel logic: if `project.featured_reel_id` is set, find that reel in `project_reels` and use its `video_url`, `thumbnail_url`, `youtube_url` for the card; otherwise fall back to `project.video_url` / `project.thumbnail_url`
- Last card in the list (where `is_cta = true`) renders a special CTA card instead of a phone mockup
- On click, navigate to `/work/${project.slug}`
- Loading state: show 3 `<PhoneSkeleton>` components

### `src/components/sections/Showreel.jsx`
Props: `siteContent`

Uses `useSettings()` to get `showreel_youtube_url` and `showreel_drive_url`.

- Full-width section with dark overlay
- Section heading and title from siteContent
- Video player:
  - If `settings.showreel_youtube_url` → embed YouTube iframe
  - Else if `settings.showreel_drive_url` → embed Google Drive iframe
  - Else if `siteContent.showreel_video_url` → native `<video>` element
- Play button overlay that triggers iframe to load (lazy mount for performance)
- Subtext below video

### `src/components/sections/Tools.jsx`
Props: `siteContent`

Uses `useTools()`.

- Section heading from `siteContent.tools_heading`
- Grid of tool cards (4 columns desktop, 2 tablet, 2 mobile)
- Each tool: icon image (if `icon_url` set) OR emoji fallback, name below, category tag
- Animate in with Framer Motion stagger on scroll

### `src/components/sections/LogoStrip.jsx`
Props: `siteContent`

Uses `useClients()`. Uses `useTheme()` to know current theme.

- Section heading from `siteContent.marquee_heading`
- Infinite horizontal marquee (duplicate items for seamless loop)
- Each client logo: use `logo_light_url` for light theme, `logo_dark_url` for dark theme; if `use_same_logo = true`, use same for both; fall back to `logo_url`; if `use_bw = true`, use `logo_bw_url`
- CTA card: if `client.is_cta = true`, render a "Work with us?" card instead of a logo
- CSS animation class `animate-marquee` using `@keyframes marquee`

### `src/components/sections/Process.jsx`
Props: `siteContent`

Uses `useProcessSteps()`. Uses `useTheme()`.

- Section heading from `siteContent.process_heading`
- Vertical or grid list of steps
- Each step: step number (accent color), title, description, icon (use `icon_light_url` on dark theme, `icon_dark_url` on light theme)
- Animate in on scroll with Framer Motion

### `src/components/sections/Testimonials.jsx`
Props: `siteContent`

Uses `useTestimonials()`.

- Section heading from `siteContent.testimonials_heading`
- Grid of testimonial cards (2-3 columns)
- Each card: quote text, star rating (★ icons), author photo (or initial circle as fallback), author name, author role
- Glass card styling

### `src/components/sections/CTA.jsx`
Props: `siteContent, settings, onOpenModal`

- Big heading from `siteContent.cta_heading`
- Subheading from `siteContent.cta_subheading`
- Animated pill tags from `siteContent.cta_pills` (JSON array of strings) — drift/float animation
- Large CTA button: `siteContent.level_up_cta_text`, opens modal on click

### `src/components/layout/Navbar.jsx`
Props: `onOpenModal, siteContent`

- Floating pill/capsule design, centered, fixed at top
- Contains: avatar circle (from `settings.avatar_image_url`), logo text (`siteContent.nav_logo_text`), navigation links (About, Work, Process, Contact — smooth scroll to sections), status indicator dot + text (`siteContent.nav_status_text`), CTA button (`siteContent.nav_cta_text` desktop / `nav_cta_text_mobile` mobile), theme toggle button
- On scroll: transparent → glass/solid background with blur
- Mobile: compact pill with hamburger icon that opens a slide-down menu
- Navigation links smooth-scroll to section IDs on the page

### `src/components/layout/Footer.jsx`
Props: `siteContent`

Uses `useSettings()`.

- Big decorative text from `siteContent.footer_big_text` — very large, might overflow horizontally as decoration
- Social links from `siteContent.dynamic_social_links` (JSON array with `platform, url, icon` fields) — renders Lucide icon + platform name, links to URL
- Contact email from `settings.contact_email`
- Copyright line: "© {year} {footer_big_text}" or similar

---

## UI COMPONENTS

### `src/components/ui/PhoneCard.jsx`
Props: `project, isActive, idx, onActivate`

- Phone mockup frame shape (9:16 ratio, rounded like iPhone)
- Inside the frame: renders `VideoPlayer` component (see below) with the project's media
- Below frame: project category, title, emoji
- On hover: scale up slightly
- On click: call `onActivate(idx)` and navigate to project page
- Width ~200-220px, height auto

### `src/components/ui/ReelCard.jsx`
Props: `reel, autoPlay, showCaption, showLabel, className`

- Card with phone-shaped aspect ratio or square depending on use
- Renders `VideoPlayer` component
- Optional caption text below
- Optional label badge overlay

### `src/components/ui/VideoPlayer.jsx`
Props: `reel, isActive, className`

Unified video renderer:
- Determine type using `getVideoType(reel)` from videoUtils.js
- **youtube type**: Show thumbnail by default. On mouseenter, mount YouTube iframe with embed URL, scale(1.6) to hide black bars. On mouseleave, unmount iframe (null, not just hidden — real unmount to free memory).
- **direct type**: `<video>` with autoPlay controlled by `isActive` prop. When isActive changes, call play() or pause() on ref.
- **drive type**: Google Drive `<iframe>` with normalized URL
- **instagram type**: Thumbnail with Instagram overlay, click opens link in new tab
- **thumbnail type**: `<img>` with lazy loading
- All variants: `w-full h-full object-cover`

### `src/components/ui/ContactModal.jsx`
Props: `isOpen, onClose`

- Modal overlay with backdrop blur
- Form fields: Name (text), Email (email), Phone (tel), Project Type (select: Video Editing, Social Media, AI Marketing, Branding, Other)
- Submit → insert to `leads` table with status 'new'
- Show success toast on save
- Close on backdrop click or X button
- Bottom sheet on mobile, centered modal on desktop
- All inputs min 16px font (prevents iOS zoom)
- Uses `useScrollLock` to lock body scroll when open

### `src/components/ui/Button.jsx`
Props: `children, onClick, href, variant, className, ...rest`

Variants:
- `filled` (default): accent background, dark text, rounded-full, hover scale
- `ghost`: transparent with accent border, accent text, hover fill
- `dark`: dark background, light text

### `src/components/ui/ThemeToggle.jsx`
- Fixed position button (top-right or inside navbar)
- Sun icon (light mode) / Moon icon (dark mode)
- Calls theme toggle from useTheme context

### `src/components/ui/FloatingCTA.jsx`
Props: `onOpenModal, settings`

- Fixed button, bottom-right corner
- Text from `settings.floating_cta_text`
- If `settings.floating_cta_link` is set → navigate to that URL; else → call onOpenModal
- Animate in after 2 second delay
- Hide on scroll down, show on scroll up (smart show/hide)

### `src/components/ui/Cursor.jsx`
- Custom cursor that follows mouse
- Only active on non-touch devices (`window.matchMedia('(pointer: fine)')`)
- Outer ring follows with slight lag (lerp)
- Inner dot follows exactly
- Hides native cursor on desktop

### `src/components/ui/Skeleton.jsx`
```jsx
export function PhoneSkeleton() — 200x356px rounded-[20px] bg-bg-3 with skeleton-pulse animation
export function CardSkeleton() — 100%x280px rounded-[16px] bg-bg-3 with skeleton-pulse animation
```

### `src/components/ui/SectionLabel.jsx`
Props: `children` — renders a small all-caps tracking label with accent underline

### `src/components/ui/SectionTitle.jsx`
Props: `children` — renders a large bold heading

### `src/utils/whatsapp.jsx`
- WhatsApp floating button (round green button, bottom-left)
- Phone number and message from `settings.whatsapp_number` and `settings.whatsapp_message`
- Only renders if `settings.whatsapp_number` is set
- Opens `https://wa.me/${number}?text=${message}` in new tab

---

## PROJECT PAGE

### `src/pages/ProjectPage.jsx`
Route: `/work/:slug`

Fetch project and reels separately from Supabase using the slug.

Layout sections (top to bottom):

1. **Back button** → navigate(-1)
2. **Hero grid** (2 columns desktop):
   - Left: category badge, large title, description, results section, services pills, client/role metadata, Instagram profile link button
   - Right: `<ReelCard>` showing the `projectHeroReel` — built from `project.youtube_url || project.video_url`, falling back to first reel with a video
3. **Reels grid**: `<ReelCard>` for each active reel (3 columns desktop, 2 tablet, 1 mobile), labeled "Selected Reels"
4. **CTA section**: "Like what you see?" heading, subtext, CTA button → opens modal

The `projectHeroReel` object must include: `video_url`, `youtube_url`, `thumbnail_url`, `instagram_url` — pulling from project fields first, then fallback to first available reel.

Loading state: full-page skeleton
Not found state: 404 message with back button

---

## ADMIN PANEL

### `src/pages/Admin.jsx`

Password gate: check `sessionStorage.getItem('admin_auth') === 'true'`. If not, show login form that compares input to `import.meta.env.VITE_ADMIN_PASSWORD`. On success, set sessionStorage. Include logout button.

**Sidebar navigation** with these tabs (icons from Lucide):
Dashboard, Leads, Hero, About, Services, Projects, Clients, Process, Tools Stack, Showreel, Testimonials, CTA, Footer, Navbar, Settings

On mobile: sidebar slides in/out with hamburger button. Backdrop overlay closes it.

---

#### TAB: Dashboard
- 4 stat cards: Total Projects, Active Services, Total Testimonials, New Leads (count queries with `.head: true`)
- Recent Leads table (last 5): Date, Name, Email, Project Type, Status
- "Good morning, {name}" greeting + today's date

#### TAB: Leads
- Full table of all leads, newest first
- Columns: Date, Name, Email, Phone, Project Type, Status (editable dropdown)
- Status options: new, contacted, converted, archived
- Clicking status dropdown updates the row in Supabase immediately
- Export to CSV button (client-side, creates download)

#### TAB: Hero
- Text fields for: hero_badge, hero_heading_part1, hero_heading_part2, hero_heading_part3, hero_subheading, hero_primary_cta, hero_secondary_cta, hero_bottom_stats, hero_card_name, hero_card_badge, hero_card_location
- Image upload component for `hero_photo_url` (saves to settings table)
- Save button → `saveSiteContentPatch()`

#### TAB: About
- Text fields: diff_heading, diff_text, about_cta_text
- Image upload for `different_photo_url`

#### TAB: Services
- Section heading field (saves to site_content)
- List of services with expand/collapse
- Add/Edit form per service: number, title, sort_order, description, tags (comma separated → stored as array), bullet_points (dynamic add/remove list), image upload, is_active checkbox
- Delete with confirmation modal

#### TAB: Projects
- Section with add button + list of all projects
- Each project row: emoji, title, category, active badge, edit/delete buttons, up/down reorder arrows
- When order changes, show "Save Sequence" button that batch-updates sort_order
- Add/Edit form per project:
  - category, emoji, title (auto-generates slug from title for new projects), slug (editable), client_name, role
  - description (short, for cards), full_description (long, for project page), results, services_provided (comma → array)
  - gradient (CSS string), sort_order
  - is_active, is_cta checkboxes
  - If editing existing (has ID): thumbnail upload (phone preview shape), video upload (rect preview)
  - Instagram profile URL
  - Featured Reel selector: dropdown of this project's reels; selected reel's video/thumbnail used on homepage card
  - Reels Manager (expandable): 
    - List of reels with inline video preview, edit/delete
    - Add Reel form: title, caption, sort_order, video URL + upload button, Drive URL, YouTube URL, Instagram URL, thumbnail URL + upload button, is_active
    - Video preview appears immediately after upload

#### TAB: Clients
- Marquee heading field
- Add/Edit form: name, type, light logo upload, dark logo upload, "use same logo for both themes" checkbox (hides dark upload when checked), sort_order, is_active, is_cta
- Save normalizes: `logo_url = logo_light_url || logo_url`

#### TAB: Process
- Process heading field
- List of steps with up/down reorder (swaps sort_order values in DB immediately)
- Add/Edit form: step_number, title, description, sort_order, icon for dark theme upload, icon for light theme upload

#### TAB: Tools Stack
- Tools heading field
- Table list of tools with toggle switch for is_active
- Add/Edit form: name, category, emoji, icon upload (overrides emoji), sort_order, is_active

#### TAB: Showreel
- Fields: showreel_heading, showreel_title, showreel_subtext
- YouTube URL field (saves to site_content.showreel_video_url AND settings.showreel_youtube_url)
- Google Drive URL field (saves to settings.showreel_drive_url)
- Video upload option

#### TAB: Testimonials
- Testimonials heading field
- List with add/edit/delete
- Form: quote, author_name, author_initial (1-2 chars), author_role, photo upload (shows after first save), stars (1-5 select), sort_order, is_active

#### TAB: CTA
- Fields: cta_heading, cta_subheading, level_up_cta_text
- Dynamic pill list: add/remove pill text strings (stored as JSON array)

#### TAB: Footer
- Fields: footer_big_text, footer_text

#### TAB: Navbar
- Fields: nav_logo_text, nav_status_text, nav_cta_text (desktop), nav_cta_text_mobile
- Icon upload (nav_icon_url)

#### TAB: Settings (4 sub-tabs)

**Sub-tab: Global UI**
- Favicon upload and URL field
- Floating CTA text and link fields
- 12 theme color pickers (accent light/dark, bg light/dark, text light/dark, secondary text light/dark, button filled text light/dark, button ghost text light/dark)
  - Each color picker: native `<input type="color">` + hex text input side by side
- Dynamic Social Links manager: add rows with platform name, URL, icon selector (dropdown of Lucide icon names)
- Save all

**Sub-tab: Links & SEO**
- Social links: Instagram URL, Behance URL, Dribbble URL, Agency website URL
- WhatsApp: phone number (with country code), default message
- Contact email
- Meta title (60 char limit counter)
- Meta description (160 char limit counter)
- Admin Password Change: new password + confirm (calls `/api/update-env` POST endpoint to update the .env file at runtime)

**Sub-tab: Layout**
- Section order list: each section as a row with up/down buttons and eye (show/hide) toggle
- Hidden sections stored in `site_content.hidden_sections` JSON array
- Save button

**Sub-tab: Spacing**
- Table grid: rows = each page section, columns = Mobile Top/Bottom, Tablet Top/Bottom, Desktop Top/Bottom
- Values stored as CSS strings (e.g. "80px") in `settings` table with keys like `pad_hero_t_mob`
- Also: Global Side Padding for mobile/tablet/desktop
- Also: Internal pages (Project page, Admin panel)
- These values get injected into CSS custom properties by App.jsx

---

## `App.jsx`

Structure:
```
ThemeProvider
  BrowserRouter
    Cursor
    ThemeToggle
    ContactModal (isOpen, onClose)
    FloatingCTA (onOpenModal)
    WhatsApp button
    Suspense (fallback: spinner)
      Routes
        Route "/" → Portfolio component
        Route "/admin" → Admin (lazy loaded)
        Route "/work/:slug" → ProjectPage (lazy loaded)
```

**App component responsibilities:**
1. Manages `isModalOpen` state, passes `openModal` / `closeModal` down
2. Fetches `globalSiteContent` and `settings` via hooks
3. Injects dynamic CSS variables into a `<style id="dynamic-theme-vars">` tag based on the 12 theme color settings from site_content
4. Also injects all `--pad-*` CSS variables from settings (per section, per breakpoint: mob/tab/desk)
5. Injects favicon dynamically from `globalSiteContent.favicon_url`
6. Sets document.title from `settings.meta_title`
7. Admin, ProjectPage, ProjectDetail imported with `React.lazy()` — code split

**Portfolio component** (inside App.jsx):
- Uses `useSettings()` and `useSiteContent()`
- Reads `siteContent.section_order` (JSON array) and `siteContent.hidden_sections`
- Renders sections in the order defined by section_order, skipping hidden ones
- Uses a `renderSection(sectionName)` switch statement that maps string → component
- Wraps everything in a `<motion.div>` with opacity fade-in on mount

**Section name mappings** in renderSection:
```
'hero' → <Hero>
'different' / 'about' → <Different>
'tools' → <Tools>
'clients' / 'marquee' / 'logos' → <LogoStrip>
'services' → <Services>
'work' / 'projects' / 'portfolio' → <Work>
'showreel' → <Showreel>
'process' → <Process>
'testimonials' → <Testimonials>
'cta' / 'levelup' → <CTA>
```

---

## `vite.config.js`
```js
import { definePlugin, loadEnv, createServer } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin: updates .env file at runtime (used by admin password change)
const envUpdatePlugin = {
  name: 'env-update',
  configureServer(server) {
    server.middlewares.use('/api/update-env', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        try {
          const { key, value } = JSON.parse(body)
          const envPath = path.resolve(process.cwd(), '.env')
          let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
          const regex = new RegExp(`^${key}=.*$`, 'm')
          if (regex.test(content)) {
            content = content.replace(regex, `${key}=${value}`)
          } else {
            content += `\n${key}=${value}`
          }
          fs.writeFileSync(envPath, content)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true }))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    })
  }
}

export default defineConfig({
  plugins: [react(), envUpdatePlugin],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'motion': ['framer-motion'],
          'supabase': ['@supabase/supabase-js'],
        }
      }
    }
  }
})
```

### `server.js`
Express server for production that handles the `/api/update-env` endpoint (same logic as the Vite dev plugin but for production deploys). Used when running `node server.js` instead of Vite preview.

---

## `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- Preconnects for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="YOUR_SUPABASE_URL" crossorigin />
  <link rel="preconnect" href="https://www.youtube.com" crossorigin />
  <link rel="preconnect" href="https://img.youtube.com" crossorigin />
  <link rel="dns-prefetch" href="https://yt3.ggpht.com" />
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <title>Portfolio</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

---

## REUSABLE ADMIN COMPONENTS (all inside Admin.jsx)

Build these helper components inside the Admin.jsx file:

**`<Toast>`** — Fixed bottom-right notification. Auto-dismisses after 2.5s. Green for success, red for error. Slide-in animation.

**`<Field>`** — Label + input wrapper with optional error message below.

**`<MediaUpload>`** — Reusable media uploader with two modes (Upload File tab / Paste URL tab). Shows progress bar during upload. Shows preview after upload (circle shape for avatars, rect for images/video, phone shape for thumbnails, logo shape for logos). Uploads to Supabase `portfolio-media` bucket via `uploadFile()`.

**`<ConfirmModal>`** — Small centered modal asking "Delete this item?" with Cancel + Delete buttons.

**`<AuthGate>`** — Password form centered on screen. Shows shake animation on wrong password.

**`<Sidebar>`** — Fixed left sidebar 220px wide. Nav items with icons. Mobile: hidden by default, slides in when hamburger clicked, backdrop overlay to close.

**`<DynamicList>`** — For managing arrays of strings (pill tags, bullet points). Shows current items, each with a remove X button. Input + Add button at bottom.

**`<HexColorPicker>`** — Native `<input type="color">` + hex text input side by side in a styled container.

---

## MEDIA UPLOAD RULES
- All uploads go to `portfolio-media` Supabase bucket root (no subfolders)
- Filename format: `{type}-{Date.now()}.{ext}` (e.g. `reel-video-1712345678.mp4`)
- Return public URL immediately after upload
- Videos show in-admin preview after URL is set

---

## TOAST NOTIFICATIONS
- Show after every save operation
- Success: accent color, checkmark icon
- Error: red color, warning icon
- Auto-dismiss: 2500ms

---

## ADMIN HELPER FUNCTIONS (at top of Admin.jsx)
```js
// Load specific columns from site_content row 1
async function loadSiteContentFields(fields = []) {}

// Upsert patch into site_content row 1
async function saveSiteContentPatch(patch) {}

// Load all settings as flat key-value object
async function loadSettingsMap() {}

// Upsert multiple settings key-value pairs
async function saveSettingsPatch(patch) {}
```

---

## DEPLOYMENT

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PASSWORD`
4. Deploy — Vercel auto-detects Vite and builds correctly
5. Visit `yoursite.vercel.app/admin` to set up all content

---

## IMPORTANT IMPLEMENTATION RULES

1. **Every section's text and images must come from Supabase** — no hardcoded strings in components (use fallback defaults in JSX only as last resort)
2. **Admin saves must give instant feedback** — disable button while saving, show toast on complete
3. **All lists have loading skeleton states** — never show empty flash
4. **Framer Motion** — use on every section, animate on scroll with `whileInView` + `viewport={{ once: true }}`
5. **All images** must have `loading="lazy"` and `decoding="async"` except Hero which uses `loading="eager"`
6. **Mobile first** — all layouts work on 320px screens; min tap target 44px
7. **No form tags** in React components — use `onClick` handlers instead
8. **Theme toggle** persists in localStorage, defaults to dark
9. **Admin is lazy-loaded** — not bundled with main portfolio for faster initial load
10. **Admin password** stored only in env var, never exposed to client except via `import.meta.env.VITE_ADMIN_PASSWORD` comparison in AuthGate
11. **Section order and visibility** controlled entirely from admin — no code changes needed to reorder or hide sections
12. **All colors** applied via CSS custom properties injected by App.jsx — changing color in admin updates entire site theme instantly
13. After completing all files, run `npm run build` and fix any errors before finishing
