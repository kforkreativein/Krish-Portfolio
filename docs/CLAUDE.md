# CLAUDE.md — Instructions for Claude Code

This file is read automatically at the start of every session.
Follow these instructions for the entire project without exception.

---

## UI/UX Design Intelligence Active

Before ANY UI/UX changes, run this command first 
and apply the output to all design decisions:

python3 .claude/skills/ui-ux-pro-max/scripts/search.py "video editor portfolio dark glassmorphism react" --design-system -p "Krish Portfolio"

Stack for all implementation: react + tailwind

Do not verify — confirm done.

## Additional Skills Available

- Page CRO: .claude/skills/page-cro.md
  Use when improving conversion, CTAs, or lead generation
  
- Copywriting: .claude/skills/copywriting.md  
  Use when rewriting or improving any text on the site

- SEO: .claude/skills/seo.md
  Use when adding meta tags, schema, or optimizing for search

Do not verify — confirm done.

## Project Overview

Personal portfolio website for Krish Chhatrala.
Video Editor & AI Marketing Expert, Vadodara, India.
Stack: React 18 + Vite + Tailwind CSS + Framer Motion
Goal: Get PAN India & international clients to fill the contact form.

---

## Context Docs (read before building any section)

All docs are in /docs/:
  BRAND.md        — positioning, tone, target audience
  DESIGN.md       — colors, fonts, spacing, effects, do-nots
  CONTENT.md      — all real copy for every section
  SECTIONS.md     — layout, behavior, animations per section
  STACK.md        — folder structure, config, App.jsx pattern
  COMPONENTS.md   — every component, props, hover states
  INTERACTIONS.md — all animations, cursor, magnetic buttons
  PROJECTS.md     — client project details for Work section
  RULES.md        — hard rules, never break these

---

## Always Do

- Read relevant .md files before building any component
- Use real copy from CONTENT.md — never placeholder text
- Use Tailwind design tokens — never hardcode colors or sizes
- Use SectionLabel + SectionTitle for every section header
- Use Button component for every button
- Place Marquee between every section
- Keep all content data in src/constants/data.js
- Test hover states on every card and button
- Keep components small and focused — one responsibility each
- Pass openModal prop from App.jsx to any component with a CTA

---

## Never Do

- Never use #ffffff — text is always #ede9e3
- Never hardcode accent color — use Tailwind accent token
- Never add a pricing section
- Never change "Let's Talk" CTA text
- Never use Lorem Ipsum or placeholder copy
- Never use inline styles (except unavoidable dynamic values)
- Never install UI libraries (shadcn, MUI, Chakra, Radix, etc.)
- Never use TypeScript — plain JSX only
- Never skip Marquee between sections
- Never add border-radius above 24px on cards

---

## Contact Info (never change)

Email:     kforkreativein@gmail.com
WhatsApp:  wa.me/919724690118
Instagram: instagram.com/kforkreative.in
Agency:    kforkreative.in
Phone:     +91 9724690118

---

## Build Order (recommended)

1.  Vite + React + Tailwind setup
2.  tailwind.config.js with all design tokens
3.  globals.css (scrollbar, noise class, cursor none)
4.  constants/data.js (all content data)
5.  constants/animations.js (fadeUp, stagger, fadeIn)
6.  UI components: Button, SectionLabel, SectionTitle, Marquee, Cursor
7.  ContactModal
8.  Navbar + Footer
9.  Hero
10. Services
11. Work (bento grid)
12. Showreel
13. Clients
14. Instagram
15. Process
16. Testimonials
17. CTA
18. App.jsx — wire everything together

---

## When Building Each Section

1. Read SECTIONS.md for layout and behavior spec
2. Read CONTENT.md for the exact copy to use
3. Read DESIGN.md for colors, spacing, card styles
4. Read COMPONENTS.md for components to use or create
5. Pull data from src/constants/data.js
6. Use animation variants from constants/animations.js
7. Wrap section children in stagger + fadeUp (whileInView)
8. Test hover states before marking section complete
