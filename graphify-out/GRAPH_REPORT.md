# Krish Portfolio - Codebase Knowledge Graph

**Corpus:** React 18 + Vite + Tailwind CSS portfolio  
**Total Files Analyzed:** 40+  
**Generated:** 2026-04-28

---

## 🎯 Core Architecture

### System Components (Communities)

#### 1. **UI Component System** (Atomic Design)
- **Button** → Base interactive element (accent color, disabled states)
- **SectionLabel** → "WHAT I DO" typography 
- **SectionTitle** → Dual-line headings (dim + bold)
- **Cursor** → Custom pointer tracking (dot + ring)
- **ThemeToggle** → Dark/Light mode switch (bottom-fixed)
- **ReelCard** → Project video preview (hover scale, modal trigger)
- **PhoneCard** → Mobile-first testimonial layout
- **VideoPlayer** → Embedded Vimeo/YouTube controller
- **FloatingCTA** → Persistent "Let's Talk" button

**Relations:**
- All components use Tailwind design tokens (`--accent`, `--bg-*`, `--text-*`)
- Button component drives all CTAs (semantic cohesion)
- ThemeToggle ← useTheme hook (dual provider pattern)
- Cursor has pointer-events: none (non-interactive by design)

#### 2. **Layout System**
- **Navbar** → Fixed top navigation (branding + links + auth status)
- **Footer** → Multi-section (contact info, live clock, hero name, social links)
- **App.jsx** → Router + theme provider + modal orchestration
- **ContactModal** → Global modal (triggered by all CTAs)

**Data Flow:** App.jsx → openModal prop → any CTA button → ContactModal

#### 3. **Section Components** (Page Sections)
- **Hero** → Headline + subtext + dual CTA + right-side visual
- **Services** → Auto-cycling accordion (4s dwell, viewport detection)
- **Work** → Bento grid of project cards (6 projects from DB)
- **Showreel** → Video embed + title overlay
- **Clients** → Logo carousel or list
- **Instagram** → Feed preview integration
- **Process** → Timeline or step-by-step flow
- **Testimonials** → Quote cards (stars, author, role)
- **CTA** → Final conversion push
- **Different** → Brand differentiation section
- **Tools** → Tech stack/services showcase

**Animation Pattern:** All sections use `whileInView + stagger + fadeUp` (Framer Motion)

#### 4. **Data & State Management**
- **constants/data.js** → Static site content (hero text, services, process steps, testimonials)
- **constants/animations.js** → Reusable animation variants (fadeUp, stagger, etc.)
- **constants/socialIcons.jsx** → Icon mapping utility
- **hooks/useContent.js** → Fetch site_content, services, projects, testimonials from Supabase
- **hooks/useTheme.jsx** → Dark/light mode context + localStorage persistence
- **hooks/useCounter.js** → Stat counter animations
- **hooks/useCursor.js** → Custom cursor tracking logic
- **hooks/useScrollLock.js** → Prevent scroll when modal open
- **contexts/** → Theme provider setup

#### 5. **Database Schema (Supabase)**
```
┌─────────────────────────────────────────────────────────────┐
│                       Public Tables                         │
├─────────────────────────────────────────────────────────────┤
│ hero                    │ title_line1, subtitle, stat_*     │
│ services                │ number, title, description, tags  │
│ projects                │ category, title, slug, client_*   │
│ project_reels          │ project_id (FK), video_url, title  │
│ testimonials           │ quote, author_name, author_role    │
│ clients                │ name, type, logo_url, is_cta       │
│ leads                  │ name, email, phone, project_type   │
│ site_content           │ dynamic content (hero, footer, etc)│
│ settings               │ key-value pairs (email, URLs, etc) │
└─────────────────────────────────────────────────────────────┘
```

**Key Foreign Keys:**
- project_reels.project_id → projects.id (ON DELETE CASCADE)
- All tables: RLS enabled (public read, admin all)

---

## 🔄 Data Flow Patterns

### Hero Section Flow
```
App.jsx
  ├─→ useContent(useHero)
  │     └─→ Supabase.site_content (id=1)
  └─→ Hero.jsx
       ├─→ Display: title_line1, title_line2, subtitle
       ├─→ CTA: "Let's Talk" → openModal
       └─→ Animation: whileInView (fadeUp + stagger)
```

### Services Section Flow (Auto-Cycling)
```
Services.jsx
  ├─→ useServices hook
  │     └─→ Supabase.services (sort_order ASC)
  ├─→ IntersectionObserver (section in viewport)
  ├─→ setInterval(4000) → rotate openIndex
  └─→ {isOpen && <accordion>}
       ├─→ Description + tags + bullets
       └─→ Right panel: sticky gradient + image

State: openIndex (0-3), isInView (boolean)
Behavior: Auto-advance every 4s when in viewport, stop when scrolled away
```

### Projects / Work Section
```
Work.jsx (Bento Grid)
  ├─→ useContent(useProjects)
  │     └─→ Supabase.projects (is_active=true, sort_order)
  ├─→ Map 6 projects → ReelCard
  │     ├─→ Thumbnail image
  │     ├─→ Category badge
  │     ├─→ Client name + role
  │     └─→ Hover: scale 1.05, show CTA
  └─→ Click → navigate(/work/slug) or modal

Database: projects table (category, emoji, title, slug, description, full_description, services_provided[], thumbnail_url)
```

### Admin Panel (Projects Management)
```
Admin.jsx → Projects Tab
  ├─→ ProjectsList (read + edit + delete)
  │     ├─→ Filter by is_active
  │     ├─→ Sort by sort_order
  │     └─→ Edit → ProjectForm modal
  ├─→ ProjectForm
  │     ├─→ Fields: category, title, slug, client_name, role, description, full_description, services_provided
  │     ├─→ Media: thumbnail_url, video_url (upload or paste URL)
  │     └─→ Save → Supabase.upsert
  └─→ ReelsManager (per project)
       ├─→ Add/edit/delete project reels
       ├─→ video_url (supports direct URL or Google Drive)
       └─→ Auto-preview with convertGoogleDriveLink()
```

---

## 🎨 Design System Nodes

### Tailwind Config Tokens
```
Colors (Light Mode):
  --accent: #0A68FF (blue)
  --bg: #FAFAFA (almost-white)
  --text: #0a0a0a (almost-black)

Colors (Dark Mode):
  --accent: #CCFF00 (neon yellow)
  --bg: #080808 (deep black)
  --text: #ede9e3 (off-white)

Typography:
  Font Family: Barlow, Barlow Condensed
  --font-heading: Barlow Condensed 900
  --font-body: Barlow 400-600

Global:
  * { cursor: none }  ← Custom cursor replaces default
  scrollbar: 3px wide (minimal)
```

### Component Props (Key Interfaces)
```
Button
  → variant?: 'primary' | 'secondary' | 'ghost'
  → size?: 'sm' | 'md' | 'lg'
  → onClick: () => void
  → disabled?: boolean

SectionLabel
  → children: string

SectionTitle
  → dim: string (gray text)
  → bold: string (accent text)

ReelCard
  → project: Project object
  → onClick: () => void
  → onCTAClick: (projectId) => void

ContactModal
  → isOpen: boolean
  → onClose: () => void
  → projectType?: string (optional pre-fill)
```

---

## 🔗 Cross-File Dependencies (Surprising Connections)

### 1. **Custom Cursor System** (Isolated Component)
- **useCursor.js** → Tracks mouse globally
- **Cursor.jsx** → Renders dot + ring (pointer-events: none)
- **globals.css** → `* { cursor: none }` (enables custom)
- **ThemeToggle.jsx** ← Removed inline `cursor: pointer` to maintain consistency
- **Admin.jsx** → Also disables default cursor (consistent UX in admin)

**Why This Matters:** Cursor is a brand identity element - every interactive zone respects it.

### 2. **Theme Persistence**
- **useTheme.jsx** → localStorage.setItem('theme')
- **App.jsx** → Wraps with `<ThemeProvider>`
- **globals.css** → `.dark` class selector
- **ThemeToggle.jsx** → Reads theme context, triggers toggle
- **Footer.jsx** → Uses theme for conditional colors

**State Graph:**
```
localStorage 'theme' key
  ↓ (on mount)
useTheme hook initializes
  ↓
App.jsx sets <html class="dark|light">
  ↓
globals.css re-evaluates :root CSS vars
  ↓
All components re-render with new colors (automatic)
```

### 3. **Contact Conversion Funnel**
```
Navbar "Let's Talk" button
          ↓
     openModal = true
          ↓
  ContactModal.jsx renders
          ↓
   User fills form:
   - name, email, phone
   - project_type
   - optional message
          ↓
   Supabase.leads.insert()
          ↓
   Email trigger (external: Zapier/Make)
          ↓
   Krish notified → "Hot Lead" label
```

**All CTAs trigger same modal:** Hero, Services CTA, Work card, different section, testimonials, floating CTA.

### 4. **Mobile Responsiveness**
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Every section:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Fonts:** `text-[clamp(20px,4vw,40px)]` (fluid typography)
- **Padding:** `px-[var(--pad-side)]` (responsive gutters)
- **Hover:** `hidden md:block` (disable on mobile)

### 5. **Animation Library Integration**
- **Framer Motion:** `whileInView`, `animate`, `transition`
- **Variants pattern:** Every section uses `stagger + fadeUp`
- **Trigger:** Viewport intersection (30% visible)
- **No scroll-trigger library needed** — just Framer Motion built-ins

---

## 🚀 God Nodes (Most Central Concepts)

1. **App.jsx** — Router, theme orchestration, modal state
2. **Supabase (Database)** — Single source of truth for all dynamic content
3. **useContent.js** — Data fetching facade (abstracts Supabase queries)
4. **ContactModal** — Conversion point (all CTAs funnel here)
5. **Services.jsx** — Only auto-cycling component (complex state machine)
6. **Cursor.jsx + useCursor.js** — Brand identity (non-standard UX)

---

## 📊 Suggested Exploration Questions

1. **"How does a user click 'Let's Talk' and end up in Supabase?"**
   - Traces: Button → openModal → ContactModal → leads.insert()
   - Crosses communities: UI, state management, database

2. **"Why does the Services section pause when I scroll away?"**
   - Involves: IntersectionObserver, React hooks, auto-cycling logic
   - Shows: Clever performance optimization (LCP improvement)

3. **"What breaks if Supabase goes down?"**
   - Analytics: All `useContent` hooks fail → fallback data?
   - Risk assessment: No fallback detected (ask about graceful degradation)

4. **"How does dark mode work without Redux?"**
   - Shows: Context API sufficiency, localStorage for persistence
   - Pattern: Could be template for state management elsewhere

5. **"Why is the custom cursor so important for brand?"**
   - Design decision: Cursor is interactive feedback
   - Trade-off: Accessibility (some users disable custom cursors)

---

## 🎯 Actionable Insights

### ✅ Strengths
- Clean component hierarchy (atomic design pattern)
- Zero external UI library (all Tailwind + Framer)
- Centralized data fetching (useContent pattern)
- Mobile-first responsive (clamp fonts, flexible grid)
- Theme system is elegant (CSS custom properties)

### ⚠️ Potential Issues
1. **No error boundaries** — If Supabase fails, entire app could crash
2. **No loading states** — Users see blank sections during fetch
3. **Services section**: Auto-cycling could be jarring UX (some users might want manual control)
4. **Admin panel security**: No visible auth guard (assuming JWT in headers)
5. **Google Drive videos**: CORS prevents direct playback (users must use direct upload)

### 💡 Opportunities
1. Add skeleton loaders during Supabase fetch
2. Implement error fallback content
3. Add "pause auto-cycle" button to Services section
4. Consider cached data hydration (faster paint)
5. Add analytics tracking (which CTA gets most clicks?)

---

## 📦 Outputs Generated

- **graph.json** — Structured node/edge representation
- **GRAPH_REPORT.md** — This file (audit trail + recommendations)
- **Token Usage** — Estimated extraction cost

---

**Graph exploration complete.** Run `/graphify query "question"` to traverse the graph, or ask for code-specific deep dives.
