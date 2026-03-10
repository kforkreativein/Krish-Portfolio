# RULES.md — Hard Rules for Claude Code

These rules are non-negotiable. Follow every single one in every file.

---

## Content Rules

- Navbar logo: "Krish" only — never "Krish Chhatrala" or "K for Kreative"
- Email: kforkreativein@gmail.com — never any other email address
- WhatsApp link: wa.me/919724690118
- Instagram: instagram.com/kforkreative.in
- Agency site: kforkreative.in
- Primary CTA text: "Let's Talk" — not "Contact Me", "Hire Me", "Get a Quote"
- NO pricing section anywhere on the site — ever
- NO "I am passionate about" or similar generic copy
- NO Lorem Ipsum or placeholder text — use real copy from CONTENT.md

---

## Design Rules

- Accent color: #C8F13B — never change, never approximate
- Text color: #ede9e3 — NEVER use pure #ffffff anywhere
- Dark backgrounds only: #080808, #0c0c0c, #131313, #1a1a1a
- Card border-radius: 24px — not 20px, not 16px, not 28px
- Button border-radius: 100px (pill) — always, no exceptions
- Sections separated by Marquee strips ONLY — no 1px divider lines
- Max 2-3 accent elements visible on screen at once
- No gradient text anywhere on the site
- No colored section backgrounds — dark variants only
- Noise texture overlay must always be present (fixed, opacity 0.03)
- No drop shadows except shadow-accent on hovered buttons
- No border-radius on section container elements

---

## Component Rules

- All copy data lives in src/constants/data.js — never hardcoded in JSX
- SectionLabel + SectionTitle must be used for every section header
- Button component must be used for every button — no raw styled buttons
- Marquee component placed between every section — not optional
- Custom cursor: only mount on pointer:fine devices (not touch)
- Contact form lives in ContactModal only — never build a separate contact page
- ContactModal triggered globally — openModal prop passed from App.jsx

---

## Animation Rules

- All scroll animations: whileInView with viewport={{ once: true, amount: 0.1 }}
- Ease curve for all reveals: [0.22, 1, 0.36, 1]
- No bouncy spring animations — smooth only
- No looping animations except glow pulse and marquee
- Glow pulse duration: 7s — never faster
- Cursor ring lerp factor: 0.12 — never change

---

## Code Quality Rules

- No inline styles — Tailwind classes only (except unavoidable dynamic values)
- No CSS files per component — globals.css + Tailwind only
- No TypeScript — plain JavaScript JSX only
- No external UI libraries — no shadcn, no MUI, no Chakra, no Radix
- No TODO comments in delivered code
- All images must have alt attributes
- All form inputs must have proper labels (accessibility)
- All external links: target="_blank" rel="noopener noreferrer"
