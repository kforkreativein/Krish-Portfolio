# COMPONENTS.md — Component Library

## UI Components (src/components/ui/)

---

### Button.jsx

Props:
  variant:  'primary' | 'ghost'   (default: 'primary')
  size:     'sm' | 'md' | 'lg'    (default: 'md')
  onClick:  function
  href:     string (renders as <a> if provided)
  icon:     ReactNode (optional left icon)
  children: ReactNode
  magnetic: bool (default: true — applies magnetic hover effect)

Sizes:
  sm: padding 9px 22px,  font-size 11px
  md: padding 13px 26px, font-size 13px
  lg: padding 15px 34px, font-size 14px

Primary styles:
  bg-accent text-black font-bold rounded-btn
  hover: translateY(-2px) + shadow-accent + magnetic pull

Ghost styles:
  border border-strong text-text rounded-btn
  hover: border-accent text-accent + magnetic pull

Magnetic effect: see INTERACTIONS.md

Usage:
  <Button onClick={openModal}>Let's Talk</Button>
  <Button variant="ghost" href="#work">View My Work</Button>

---

### SectionLabel.jsx

Props: children (string)

Renders:
  Flex row, gap 10px, align-items center
  18px x 1px accent div (decorative line)
  Text: uppercase, 10-11px, letter-spacing 0.15em, accent, weight 600

Usage: <SectionLabel>What I Do</SectionLabel>

---

### SectionTitle.jsx

Props:
  dim:  string  (first line — muted)
  bold: string  (second line — white)

Renders two-line heading:
  Line 1: text-text-dim (#555)
  Line 2: text-text (#ede9e3)
  Font: heading (Syne), weight 800
  Size: clamp(34px, 4.5vw, 60px)
  Letter-spacing: -0.035em, line-height: 1.05

Usage: <SectionTitle dim="Selected" bold="Work" />

---

### Marquee.jsx

Props: bg (string, hex color, default '#0c0c0c')

Content: mapped from constants/data.js marqueeItems array
Behavior: CSS animation scroll, pause on hover, accent dot separators

---

### Cursor.jsx

No props.
Two fixed divs: dot (8px accent) + ring (34px accent border)
Uses useCursor hook for position + lerp logic
Mounts only on: window.matchMedia('(pointer: fine)').matches

---

### ContactModal.jsx

Props:
  isOpen:  bool
  onClose: function

Framer Motion AnimatePresence for mount/unmount animation
Backdrop: fixed inset-0, black/85, blur — click to close
Modal: max-w-[520px], centered, bg-bg-2, border-strong, rounded-card, p-12

Animation:
  Backdrop: opacity 0 to 1, duration 0.25s
  Modal:    y:60 opacity:0 scale:0.96 → y:0 opacity:1 scale:1
            spring stiffness:300 damping:30

Form states: idle / loading / success / error
Escape key closes modal
useScrollLock(isOpen) — locks body scroll

Input style: bg-bg-3, border-strong, rounded-input, padding 14px 18px
             focus: border-accent
             placeholder: text-text-dim

---

## Layout Components (src/components/layout/)

---

### Navbar.jsx

Props: onOpenModal (function)

Fixed top, z-50, transparent on load
Scrolled state (> 40px): bg rgba(8,8,8,0.93) + blur + border-bottom
Logo: "Krish" + <span className="text-accent">.</span>
Nav links hidden on mobile < 900px
"Let's Talk" button calls onOpenModal

---

### Footer.jsx

Props: none

Left:   Logo + pipe separator + copyright text
Right:  Text links + WhatsApp pill button (accent-dim bg, accent border)
Bottom: "Designed & built by Krish Chhatrala" (centered micro muted)

---

## Section Components (src/components/sections/)

---

### Hero.jsx

Props: onOpenModal

Sub-components: HeroBadge, HeroTitle, HeroStats, HeroPhotoCard
Background divs: NoiseTexture (fixed), GridOverlay (absolute), GlowOrb (absolute)

HeroStats uses useCounter hook
Each line of HeroTitle animates separately (staggered fadeUp)

---

### Services.jsx

Maps services array from data.js to ServiceCard components

ServiceCard props: number, icon, title, description, tags[]
ServiceCard hover: Framer Motion whileHover (y, border, bg, icon, arrow)

---

### Work.jsx

Props: onOpenModal

Maps projects array from data.js to BentoCard components
CSS Grid 12-column layout (inline style for precise bento positions)

BentoCard props: size, category, title, description, gradient, emoji, isCTA
BentoCard hover: overlay fadeIn + info slideUp + arrow appear (whileHover)
BentoCTA (Card F): accent styled, "Let's Talk" button calls onOpenModal

---

### Showreel.jsx

State: videoId (string | null)
Parses YouTube URL on input submit (Enter key or button click)
Extracts video ID from youtu.be/ or ?v= patterns
Replaces placeholder with <iframe> when videoId is set

---

### Clients.jsx

Maps clients array from data.js to ClientCard components
ClientCard props: emoji, name, type, isCTA

---

### Instagram.jsx

8 hardcoded placeholder post divs (gradient backgrounds)
4x2 grid, hover: scale + overlay
Header: IG handle link + Follow button
Footer note: Elfsight instructions

---

### Process.jsx

Maps processSteps array from data.js to ProcessStep components
Connecting accent line: absolute positioned, z-index 0
ProcessStep props: number, title, description

---

### Testimonials.jsx

Maps testimonials array from data.js to TestimonialCard components
TestimonialCard props: quote, name, role, initial (for avatar)

---

### CTA.jsx

Props: onOpenModal

Centered layout, radial glow background div
"Start a Project" button calls onOpenModal
Email button: mailto:kforkreativein@gmail.com

---

## constants/data.js

Export all arrays:
  services[]      — 6 objects: { id, number, icon, title, description, tags }
  projects[]      — 6 objects: { id, size, category, title, description, gradient, emoji, isCTA }
  clients[]       — 5 objects: { id, emoji, name, type, isCTA }
  testimonials[]  — 3 objects: { id, quote, name, role, initial }
  processSteps[]  — 4 objects: { id, number, title, description }
  marqueeItems[]  — array of strings
  stats[]         — 4 objects: { value, suffix, label }

ALL site copy lives in data.js — never hardcoded in component JSX.

---

## constants/animations.js

export const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

export const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' } }
}
