# DESIGN.md — Visual Design System

## Design Philosophy

Dark, minimal, editorial. Feels like a high-end international creative studio.
NOT cluttered. NOT busy. NOT generic freelancer portfolio.
Every element earns its place. White space is intentional.
The lime green accent is used sparingly — it should feel electric when it appears.
Sections flow into each other, separated ONLY by marquee strips — no hard dividers.

---

## Color Tokens

// tailwind.config.js
colors: {
  bg: {
    DEFAULT: '#080808',   // main background
    2:       '#0c0c0c',   // alternate sections
    3:       '#131313',   // cards
    4:       '#1a1a1a',   // card hover state
  },
  accent: {
    DEFAULT: '#C8F13B',
    dim:     'rgba(200, 241, 59, 0.07)',
    border:  'rgba(200, 241, 59, 0.16)',
    glow:    'rgba(200, 241, 59, 0.065)',
  },
  text: {
    DEFAULT: '#ede9e3',   // warm white — NEVER use pure #ffffff
    muted:   '#888888',
    dim:     '#555555',
  },
  border: {
    DEFAULT: 'rgba(255, 255, 255, 0.055)',
    strong:  'rgba(255, 255, 255, 0.10)',
  }
}

Accent usage rules:
- Use on: labels, hover highlights, CTAs, counters, section labels
- Maximum 2-3 accent elements visible on screen at once
- NEVER use as background for large areas
- The lime pop only works because it's rare on screen

---

## Typography

Google Fonts: Syne (400,600,700,800) + DM Sans (300,400,500,italic)

fontFamily: {
  heading: ['Syne', 'sans-serif'],
  body:    ['DM Sans', 'sans-serif'],
}

Type Scale:
  display | clamp(56px,9vw,122px)  | 800 | Syne    | Hero title
  h1      | clamp(34px,4.5vw,60px) | 800 | Syne    | Section titles
  h2      | 22px                   | 700 | Syne    | Card titles
  h3      | 18px                   | 700 | Syne    | Sub-headings
  label   | 10-11px                | 600 | DM Sans | Section labels
  body    | 15-16px                | 400 | DM Sans | Paragraphs
  small   | 12-13px                | 400 | DM Sans | Card descriptions
  micro   | 10-11px                | 500 | DM Sans | Tags, pills

Typography Rules:
- Hero title: letter-spacing -0.045em, line-height 0.88
- Section titles: TWO LINES
  Line 1: dim muted word (#555)
  Line 2: bold white word (#ede9e3)
- Section labels: ALL CAPS, letter-spacing 0.15em, accent color,
  preceded by 18px x 1px accent decorative line
- Body: line-height 1.8, color #888
- NEVER use #ffffff — always #ede9e3

Hero Title Style:
  Line 1 "Video"      — solid fill #ede9e3
  Line 2 "Editor"     — outlined only (-webkit-text-stroke, no fill)
  Line 3 "& AI Expert" — AI Expert in accent #C8F13B

---

## Spacing System

section:      108px   // top/bottom padding
section-sm:   72px    // smaller sections
container:    52px    // left/right padding
container-sm: 24px    // mobile

---

## Border Radius

card:  24px    // all cards
btn:   100px   // all buttons — always pill
tag:   6px     // skill tags
pill:  100px   // status pills
input: 14px    // form inputs

---

## Shadows & Glows

shadow-accent:    0 12px 32px rgba(200,241,59,0.28)
shadow-accent-lg: 0 16px 48px rgba(200,241,59,0.22)

Radial glow (hero + CTA):
  700px x 700px, absolute positioned
  background: radial-gradient(circle, rgba(200,241,59,0.065), transparent 68%)
  animation: glowPulse 7s ease-in-out infinite
  keyframes: scale 1 to 1.08, opacity 1 to 0.7 at 50%

---

## Section Order with Marquee Separators

Hero          #080808
[Marquee]
Services      #0c0c0c
[Marquee]
Work          #080808
[Marquee]
Showreel      #0c0c0c
[Marquee]
Clients       #080808
[Marquee]
Instagram     #0c0c0c
[Marquee]
Process       #080808
[Marquee]
Testimonials  #0c0c0c
[Marquee]
CTA           #080808
Footer        #080808

---

## Visual Effects

Noise/Grain: fixed, z-index 1000, pointer-events none, opacity 0.03, SVG fractal noise
Background Grid (hero): 72px grid lines, opacity 0.018, radial mask top-right

---

## Custom Cursor

Dot:  8px, fill #C8F13B, z-index 9999
Ring: 34px, border 1px solid rgba(200,241,59,0.5), z-index 9998
Ring lerp: rx += (mouseX - rx) * 0.12 — in requestAnimationFrame loop
Hover links/buttons: dot scale 16px, ring opacity 0.1
Touch devices: do not mount cursor

---

## Do Not

- No #ffffff anywhere — use #ede9e3
- No colored backgrounds — dark only
- No border-radius above 24px on cards
- No gradient text
- No stock photos
- No more than 2-3 accent elements visible at once
- No hard divider lines — marquee only
- No bouncy animations — smooth curves only
