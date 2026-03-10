# SECTIONS.md — Page Structure & Section Specs

## Page Order

1.  Navbar (fixed)
2.  Hero
3.  [Marquee]
4.  Services
5.  [Marquee]
6.  Selected Work
7.  [Marquee]
8.  Showreel
9.  [Marquee]
10. Clients
11. [Marquee]
12. Instagram
13. [Marquee]
14. Process
15. [Marquee]
16. Testimonials
17. [Marquee]
18. CTA
19. Footer
20. Contact Modal (global — triggered by any "Let's Talk" button)

---

## 1. Navbar

Layout:  fixed top, full width, flex row space-between
Left:    Logo "Krish." — dot in accent
Center:  Nav links — About · Work · Services · Contact
Right:   "Let's Talk" button — accent filled pill — opens Contact Modal

Scroll behavior:
  Default:      transparent background, no border
  After 40px:   bg rgba(8,8,8,0.93) + backdrop-filter blur(18px)
                + bottom border rgba(255,255,255,0.055)
  Transition:   all 0.4s ease

Mobile (< 900px): hide nav links, keep logo + Let's Talk button

---

## 2. Hero

Layout:  min-height 100vh, flex column, justify-content flex-end
Grid:    1fr 268px, gap 52px (text left, photo card right)
Padding: 108px container-padding bottom

Background layers:
  1. Base #080808
  2. Noise texture (fixed, opacity 0.03)
  3. Line grid 72px, masked radial top-right
  4. Radial green glow 700px, top-right, animated pulse

Left content:
  - "Available for New Projects" pill badge
  - Hero title (3 lines, display size)
  - Subtitle: "Video Editor & AI Marketing Expert"
  - Description paragraph (max-width 450px)
  - Two CTA buttons: "Let's Talk" (primary) + "View My Work" (ghost)
  - Stats row: 4 animated counters

Right content:
  - Photo card (bg-3, border, border-radius 24px)
  - AI-generated face placeholder (swap for real photo later)
  - Name, location, "Open to Projects" pill

Animations (Framer Motion, staggered):
  Badge:       fadeUp 0.9s delay 0s
  Title:       fadeUp 0.9s delay 0.07s
  Description: fadeUp 0.9s delay 0.15s
  Buttons:     fadeUp 0.9s delay 0.22s
  Stats:       fadeUp 0.9s delay 0.28s
  Photo card:  fadeUp 0.9s delay 0.10s
  Counters:    0 to target when stats row enters viewport

---

## 3. Marquee (reusable component)

Props:      bg (hex string)
Behavior:   pause on hover
Used as:    visual divider between every section

---

## 4. Services

Background: #0c0c0c
Padding:    108px 52px
Grid:       3 x 2 cards, gap 14px, margin-top 52px

Service card anatomy:
  - Number (01-06): top-left, muted Syne 11px
  - Icon: 52px square, bg rgba(255,255,255,0.06), border-radius 14px
  - Title: Syne 19px 700
  - Description: DM Sans 13px muted, line-height 1.78
  - Tags: small pills bottom
  - Arrow: top-right, hidden by default, accent circle black icon

Card hover (Framer Motion whileHover):
  - y: -6px
  - border-color: accent-border
  - background: #1a1a1a
  - Icon background: #C8F13B
  - Arrow: slides in from top-right, opacity 0 to 1
  Transition: 0.35s ease

---

## 5. Selected Work — Bento Grid

Background: #080808
Padding:    108px 52px
Header:     label + title left, "See All" link right

CSS Grid layout (12 columns, gap 14px):
  Card A: col 1-8,   row 1-3 — large hero card (Krish Wellness)
  Card B: col 8-13,  row 1-2 — medium (Krish Computer)
  Card C: col 8-13,  row 2-3 — medium (Sparsh Beauty)
  Card D: col 1-5,   row 3-4 — small (Aeon Shoes)
  Card E: col 5-9,   row 3-4 — small (Animated Short Film)
  Card F: col 9-13,  row 3-4 — CTA card (Your Brand)

Card hover behavior:
  - Dark overlay gradient fades in (opacity 0 to 1)
  - Category + title slides up (y: 12 to 0)
  - Arrow icon appears top-right (accent bg, black icon)
  - Card lifts: y -5px
  Info HIDDEN by default — reveals only on hover

Card F (CTA):
  - accent-dim background, accent border
  - Centered: icon + title + subtitle + "Let's Talk" button
  - Button opens Contact Modal

Tablet breakpoint (< 1024px): 2-column grid
Mobile (< 900px): single column

---

## 6. Showreel

Background: #0c0c0c
Padding:    108px 52px

Container:  aspect-ratio 16/9, border-radius 24px, border, bg #000

Placeholder state:
  - Dark gradient background
  - Animated radial glow behind play button
  - 76px accent circle play button
  - Hover: play button scale 1.1, glow intensifies

Active state (after URL):
  - YouTube iframe fills container (autoplay)

Input row (always visible below):
  - URL text input + "Load Video" button
  - Parses youtu.be/ and ?v= patterns for video ID

---

## 7. Clients

Background: #080808
Padding:    72px 52px

Layout: flex-wrap row of client cards

Client card:
  - bg-3, border, border-radius 24px, centered content
  - Emoji + name + type
  - hover: y -3px + accent border

Last card ("Your Brand?"):
  - accent-dim bg, accent border, name in accent color
  - Soft CTA nudge

---

## 8. Instagram

Background: #0c0c0c
Padding:    108px 52px

Header row:
  Left:  section label + Instagram handle (with IG icon)
  Right: "Follow" button — accent filled

Grid: 4 x 2, gap 10px, aspect-ratio 1:1 cards
  - Each card: unique gradient bg + emoji
  - Hover: scale 1.025 + dark overlay + "View Post" text

Note below: Elfsight embed instructions

---

## 9. Process

Background: #080808
Padding:    108px 52px

Layout: 4-column row
Connecting line: accent color, 1px, runs between step numbers
  (absolute, top: 27px, left: 76px, right: 76px, z-index 0)

Each step:
  - Number circle: 54px, bg #080808, border accent, Syne 800 accent text
  - Title: Syne 700 16px
  - Description: DM Sans 13px muted

Mobile: 2 x 2 grid, hide connecting line

---

## 10. Testimonials

Background: #0c0c0c
Padding:    108px 52px

Layout: 3-column grid, gap 14px

Testimonial card:
  - bg-3, border, border-radius 24px, padding 28px
  - Large quote mark (accent, Georgia font)
  - 5 stars (accent)
  - Quote text (13px, #9a9a9a, line-height 1.85)
  - Author row: gradient avatar (initials) + name + role
  - Hover: accent border

---

## 11. CTA

Background: #080808
Padding:    120px 52px
Alignment:  center

Background:  large radial glow centered (800px circle, accent)

Content:
  - Section label (centered)
  - Large title: "Ready to" + "Grow?" (Grow in accent)
  - Subtitle paragraph (max-width 420px)
  - "Start a Project" button — opens Contact Modal
  - Email ghost button — mailto link

---

## 12. Footer

Background: #080808
Padding:    32px 52px
Border-top: 1px solid rgba(255,255,255,0.055)
Layout:     flex row space-between

Left:   Logo "Krish." + separator + "2025 · Vadodara, India"
Right:  Links: Instagram · Agency · Email + WhatsApp pill button
Bottom: "Designed & built by Krish Chhatrala" (centered, micro, muted)

---

## 13. Contact Modal (Global Component)

Trigger:    any "Let's Talk" or "Start a Project" button
Backdrop:   rgba(0,0,0,0.85) + backdrop-filter blur(8px)
            Click backdrop to close

Modal:
  bg: #0c0c0c, border: border-strong, border-radius: 24px
  max-width: 520px, centered, padding: 48px

Animation (Framer Motion):
  Backdrop: opacity 0 to 1, duration 0.25s
  Modal:    y:60 opacity:0 scale:0.96 to y:0 opacity:1 scale:1
            spring: stiffness 300, damping 30

Close triggers:
  - Click backdrop
  - Press Escape
  - Click X button

Body scroll locked when modal is open (useScrollLock hook)

States: idle / loading / success / error

Form fields:
  1. Name*
  2. Email*
  3. Phone / WhatsApp
  4. Project Type* (dropdown)

Submit: console.log for now — backend to be connected later
Success: show checkmark + "Got it. I'll be in touch within 24 hours."
