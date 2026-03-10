# STACK.md — Technical Stack & Project Structure

## Core Stack

Framework:  React 18 + Vite
Styling:    Tailwind CSS v3
Animations: Framer Motion
Routing:    React Router v6 (for future project detail pages)
Icons:      Lucide React
Fonts:      Google Fonts (Syne + DM Sans)
Form:       React state only — backend to be connected later
Deployment: TBD — build output in /dist via npm run build

---

## Setup Commands

# 1. Scaffold
npm create vite@latest krish-portfolio -- --template react

# 2. Install
cd krish-portfolio
npm install
npm install framer-motion react-router-dom lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

---

## Folder Structure

krish-portfolio/
  public/
    favicon.ico
  src/
    assets/
      photo.jpg               (swap in real photo here)
    components/
      layout/
        Navbar.jsx
        Footer.jsx
      ui/
        Button.jsx
        SectionLabel.jsx
        SectionTitle.jsx
        Marquee.jsx
        Cursor.jsx
        ContactModal.jsx
      sections/
        Hero.jsx
        Services.jsx
        Work.jsx
        Showreel.jsx
        Clients.jsx
        Instagram.jsx
        Process.jsx
        Testimonials.jsx
        CTA.jsx
    hooks/
      useCursor.js
      useCounter.js
      useScrollLock.js
    constants/
      data.js
      animations.js
    styles/
      globals.css
    App.jsx
    main.jsx
  docs/
    BRAND.md
    DESIGN.md
    CONTENT.md
    SECTIONS.md
    STACK.md
    COMPONENTS.md
    INTERACTIONS.md
    PROJECTS.md
    RULES.md
    CLAUDE.md
  CLAUDE.md              (copy at root — Claude Code reads this automatically)
  index.html
  tailwind.config.js
  vite.config.js
  postcss.config.js

---

## tailwind.config.js

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080808',
          2: '#0c0c0c',
          3: '#131313',
          4: '#1a1a1a',
        },
        accent: {
          DEFAULT: '#C8F13B',
          dim: 'rgba(200, 241, 59, 0.07)',
          border: 'rgba(200, 241, 59, 0.16)',
          glow: 'rgba(200, 241, 59, 0.065)',
        },
        text: {
          DEFAULT: '#ede9e3',
          muted: '#888888',
          dim: '#555555',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.055)',
          strong: 'rgba(255, 255, 255, 0.10)',
        },
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card:  '24px',
        btn:   '100px',
        tag:   '6px',
        pill:  '100px',
        input: '14px',
      },
      boxShadow: {
        accent:    '0 12px 32px rgba(200, 241, 59, 0.28)',
        'accent-lg': '0 16px 48px rgba(200, 241, 59, 0.22)',
      },
    },
  },
  plugins: [],
}

---

## globals.css

@tailwind base;
@tailwind components;
@tailwind utilities;

* { cursor: none; }

::-webkit-scrollbar { width: 2px; }
::-webkit-scrollbar-thumb { background: #C8F13B; border-radius: 2px; }

.noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
  opacity: 0.03;
}

html { scroll-behavior: smooth; }

*:focus-visible {
  outline: 2px solid #C8F13B;
  outline-offset: 2px;
}

---

## App.jsx Structure

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      <Cursor />
      <div className="noise" aria-hidden="true" />
      <ContactModal isOpen={isModalOpen} onClose={closeModal} />

      <Navbar onOpenModal={openModal} />
      <main>
        <Hero onOpenModal={openModal} />
        <Marquee bg="#0c0c0c" />
        <Services />
        <Marquee bg="#080808" />
        <Work onOpenModal={openModal} />
        <Marquee bg="#0c0c0c" />
        <Showreel />
        <Marquee bg="#080808" />
        <Clients />
        <Marquee bg="#0c0c0c" />
        <Instagram />
        <Marquee bg="#080808" />
        <Process />
        <Marquee bg="#0c0c0c" />
        <Testimonials />
        <Marquee bg="#080808" />
        <CTA onOpenModal={openModal} />
      </main>
      <Footer />
    </>
  )
}

---

## State Management

No Redux or Zustand needed.
Global state: isModalOpen (bool) — lifted to App.jsx, passed as props.
openModal function passed to: Navbar, Hero, Work (CTA card), CTA section, Footer.

---

## Build & Deploy

Development:  npm run dev
Production:   npm run build  (outputs to /dist)
Preview:      npm run preview

Deploy options:
  Netlify: drag /dist to netlify.com/drop
           OR connect GitHub for auto-deploy
  Vercel:  connect GitHub, auto-detects Vite, zero config

---

## Naming Conventions

Components: PascalCase  (ServiceCard.jsx, BentoCard.jsx)
Hooks:      camelCase   (useCursor.js, useCounter.js)
Constants:  camelCase   (data.js, animations.js)
Classes:    Tailwind only — no custom class names except in globals.css
