# MASTER PROMPT — Rebuild Krish Portfolio Exactly

Use this prompt with Claude Code. Build the exact same portfolio website as the current Krish Chhatrala portfolio in this workspace, with the same structure, section order, visual language, animations, custom cursor behavior, reel system, project detail pages, and admin CMS. The result must feel like a faithful rebuild of the existing site, not a generic portfolio template.

The site is for Krish Chhatrala, a Video Editor and AI Marketing Expert based in Vadodara, India. The goal is to generate PAN India and international leads through the contact form. Use the real brand data, real sections, and real content patterns already present in this repository. Do not invent placeholder copy.

---

## HARD REQUIREMENTS

1. Recreate the current website as closely as possible from the live repo structure and data model.
2. Build a production-ready admin panel with password gate and editable content for all major sections.
3. Use React 18, Vite, Tailwind CSS, Framer Motion, React Router, and Supabase.
4. Keep the custom cursor, dark portfolio aesthetic, section spacing, and CTA style consistent with the current site.
5. Build the exact reel UX for vertical Instagram-style media at 9:16.
6. Use the same sections, same order, same tone, same contact info, and same conversion-first structure.
7. Include a CLAUDE.md file in the root of the project during setup so the repo is self-documenting for future Claude Code sessions.
8. Do not add a pricing section.
9. Do not use TypeScript.
10. Do not use UI libraries like shadcn/ui, MUI, Chakra, Radix, or similar.

---

## VISUAL / BRAND TARGET

Match the current portfolio direction:

- Mostly black / near-black backgrounds
- High-contrast text
- Accent color driven by theme variables, not hardcoded values
- Rounded cards with restrained radius, never above 24px on cards
- Custom cursor with dot and ring
- Strong editorial typography
- Animated but not noisy
- Heavy use of reel cards, logo strips, and content-rich section blocks
- Premium, cinematic, creator-led feel

The site should not look like a generic agency template. It should look like Krish’s actual portfolio.

---

## WHAT TO BUILD

Build these parts exactly:

1. Public homepage with sections in this order unless hidden from admin:
   - Navbar
   - Hero
   - Different / About / Positioning
   - Tools
   - Clients marquee / logo strip
   - Services
   - Work / Selected Reels
   - Showreel
   - Process
   - Testimonials
   - CTA
   - Footer
2. Individual project pages at `/work/[slug]`.
3. Admin dashboard at `/admin`.
4. Contact lead capture flow.
5. Theme toggle with persisted state.
6. Fully editable content from admin.
7. A root `CLAUDE.md` file that captures project rules, content sources, and build order.

---

## CONTENT AND DATA SOURCE RULES

Use the repository’s existing content and structure as the source of truth:

- `docs/CONTENT.md`
- `docs/BRAND.md`
- `docs/DESIGN.md`
- `docs/SECTIONS.md`
- `docs/COMPONENTS.md`
- `docs/INTERACTIONS.md`
- `docs/STACK.md`
- `docs/RULES.md`
- `docs/PROJECTS.md`
- `portfolio_clients_data.md`
- existing Supabase schema and seed files in `supabase-setup/`

If any content appears in the repo, reuse it. Do not replace it with generic marketing copy.

---

## DESIGN SYSTEM REQUIREMENTS

Implement the current design system faithfully:

- Dark-first interface with subtle depth
- Theme variables for accent, background, text, muted text, borders, and button text
- Tailwind utility-driven layout with CSS variables for theme tokens
- Framer Motion for section reveal, stagger, and hover polish
- Global custom cursor and hover state behavior
- Smooth but restrained transitions
- Responsive layout that works on desktop and mobile
- Horizontal reel scrolling with snap behavior where the current site uses it

Do not reimagine the brand. Rebuild the existing one.

---

## CURRENT SITE BEHAVIOR TO MATCH

The homepage should reproduce the current behavior:

- Navbar with compact centered navigation and a primary `Let’s Talk` CTA.
- Hero section with the current copy and visual hierarchy.
- Services section with auto-cycling behavior that activates only when the section is in view.
- Work section titled `Selected Reels` / `Portfolio` style presentation with vertical 9:16 reel cards.
- Video and reel cards that feel like Instagram reels, not landscape thumbnails.
- A footer with reduced bottom padding and the existing contact treatment.
- CTA buttons and cards should use the same visual style and interaction language currently used in the repo.

Recreate the reel experience carefully:

- Preserve the 9:16 card shape.
- Keep reel media centered.
- Avoid black flashes on hover.
- Avoid layout cropping that hides the subject or text overlays.
- Use the same hover and autoplay behavior as the existing site, but make it stable and polished.

---

## ASSET AND CONTENT GUIDANCE

Use the project’s real assets and local references where appropriate:

- `Assets/Images/`
- `Assets/Videos/`
- project assets already referenced from Supabase or storage

Use the portfolio client identities already present in the data files and screenshots. Do not invent new brands.

The build should include the current portfolio clients and project examples such as:

- Devi Bar
- Hemali Kevalia
- Krish Computer
- Mithun Bar
- Freelance Video Production
- AI Films / AI Marketing style projects

Keep the current tone of each project page aligned with the provided content.

---

## SUPABASE SETUP

Create a full Supabase-backed CMS with the following tables and behaviors:

- `site_content`
- `settings`
- `services`
- `projects`
- `project_reels`
- `testimonials`
- `clients`
- `tools`
- `process_steps`
- `leads`

Requirements:

- Public read access for frontend data.
- Admin writes through the CMS.
- Strong foreign key relationships for project reels.
- Admin can edit content, re-order content, toggle visibility, and manage URLs.
- Storage bucket for media uploads.
- Media fields for thumbnails, videos, Instagram URLs, YouTube URLs, and Google Drive URLs where needed.

Add whatever schema helpers are needed to support the actual site, but keep the structure compatible with the existing project files in this repo.

---

## ADMIN PANEL REQUIREMENTS

Build a full admin CMS that can control the entire site.

Must include:

- Password gate before the dashboard loads.
- Layout for content editing.
- CRUD for projects.
- CRUD for project reels.
- CRUD for services.
- CRUD for testimonials.
- CRUD for clients.
- CRUD for tools.
- CRUD for process steps.
- Editing for hero, navbar, footer, CTA, theme colors, section order, and hidden sections.
- Lead submissions table.
- Media upload support.
- Preview states for reel thumbnails and video links.
- Validation for required fields.
- Safe handling for Google Drive video links with user guidance when browser playback is unreliable.

The admin should feel like a real CMS, not a demo form.

---

## PAGE AND COMPONENT REQUIREMENTS

Use the current component architecture style:

- `src/components/layout/Navbar.jsx`
- `src/components/layout/Footer.jsx`
- `src/components/sections/Hero.jsx`
- `src/components/sections/Different.jsx`
- `src/components/sections/Services.jsx`
- `src/components/sections/Work.jsx`
- `src/components/sections/Showreel.jsx`
- `src/components/sections/Process.jsx`
- `src/components/sections/Testimonials.jsx`
- `src/components/sections/CTA.jsx`
- `src/components/sections/Tools.jsx`
- `src/components/sections/LogoStrip.jsx` or marquee equivalent
- `src/components/ui/Button.jsx`
- `src/components/ui/SectionLabel.jsx`
- `src/components/ui/SectionTitle.jsx`
- `src/components/ui/ContactModal.jsx`
- `src/components/ui/Cursor.jsx`
- `src/components/ui/PhoneCard.jsx`
- `src/components/ui/ReelCard.jsx`
- `src/components/ui/VideoPlayer.jsx`
- `src/components/ui/FloatingCTA.jsx`
- `src/components/ui/ThemeToggle.jsx`

Use small, focused components. Keep responsibilities separated.

---

## INTERACTION RULES

Match the current micro-interactions and motion style:

- Section entrance animations with staggered reveal.
- Hover states on buttons, cards, and reels.
- Global custom cursor that remains consistent across interactive elements.
- Services section auto-rotation only while visible in viewport.
- Reel cards autoplay on hover or active state.
- Reel media should feel like a vertical social feed card.
- CTA actions should funnel into the contact modal.

Do not introduce flashy motion that changes the identity of the site.

---

## SEO / STRUCTURED DATA / CRAWLABILITY

Support the site for search and AI crawling:

- Add proper page metadata.
- Add JSON-LD where appropriate.
- Use semantic HTML tags.
- Make the site crawlable and readable by search engines and AI crawlers.
- If robots rules or hosting config are needed, include them.

---

## ROOT CLAUDE.md REQUIREMENT

Create a root `CLAUDE.md` file as part of the build with these responsibilities:

- Project overview.
- Stack details.
- File structure guidance.
- Brand rules.
- Content source files.
- Build order.
- Do and don’t rules.
- Contact details.
- Instructions that the team should read the docs before editing sections.

The `CLAUDE.md` should be concise enough to be useful, but strict enough to prevent drift.

---

## IMPLEMENTATION ORDER

1. Create the project structure.
2. Create `CLAUDE.md` in the repo root.
3. Configure Tailwind and global theme tokens.
4. Set up Supabase client and schema-backed data hooks.
5. Build the shared UI components.
6. Build the layout components.
7. Build homepage sections in the current site order.
8. Build work/project detail routes.
9. Build the admin dashboard.
10. Wire leads and media upload behavior.
11. Add motion, hover states, and responsiveness.
12. Validate the whole app end-to-end.

---

## REQUIRED PROJECT FILES

At minimum, create or wire these files:

```text
CLAUDE.md
src/App.jsx
src/main.jsx
src/constants/data.js
src/constants/animations.js
src/lib/supabase.js
src/styles/globals.css
src/components/layout/Navbar.jsx
src/components/layout/Footer.jsx
src/components/sections/Hero.jsx
src/components/sections/Different.jsx
src/components/sections/Services.jsx
src/components/sections/Work.jsx
src/components/sections/Showreel.jsx
src/components/sections/Process.jsx
src/components/sections/Testimonials.jsx
src/components/sections/CTA.jsx
src/components/sections/Tools.jsx
src/components/ui/Button.jsx
src/components/ui/SectionLabel.jsx
src/components/ui/SectionTitle.jsx
src/components/ui/ContactModal.jsx
src/components/ui/Cursor.jsx
src/components/ui/ReelCard.jsx
src/components/ui/PhoneCard.jsx
src/components/ui/VideoPlayer.jsx
src/components/ui/FloatingCTA.jsx
src/components/ui/ThemeToggle.jsx
src/pages/Admin.jsx
src/pages/ProjectPage.jsx
src/pages/ProjectDetail.jsx
src/hooks/useContent.js
src/hooks/useTheme.jsx
src/hooks/useCursor.js
src/hooks/useScrollLock.js
```

If the current codebase uses a slightly different structure, preserve the intent but make sure the same functionality exists.

---

## FINAL QUALITY BAR

The finished site should:

- Feel like the existing Krish portfolio.
- Use the same copy and section rhythm.
- Have a real admin panel.
- Handle reel media cleanly.
- Be responsive.
- Be production-ready.
- Be editable from the dashboard.
- Be easy for Claude Code to maintain because of the added `CLAUDE.md`.

Build it as one cohesive system, not as disconnected pages.
