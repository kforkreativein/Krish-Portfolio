# INTERACTIONS.md — Animations & Interactions

## Library: Framer Motion

---

## Shared Variants (constants/animations.js)

export const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
}

export const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
}

Usage pattern on every section:
  <motion.div
    variants={stagger}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.1 }}
  >
    <motion.div variants={fadeUp}>content</motion.div>
  </motion.div>

---

## Custom Cursor (useCursor.js)

Two elements: dot (direct follow) + ring (lerp lag follow)
Ring lerp: rx += (mouseX - rx) * 0.12  — in requestAnimationFrame loop

On mouseenter any a / button:
  dot  scale to 16px
  ring opacity to 0.1

On mouseleave:
  dot  scale to 8px
  ring opacity to 0.4

Mount only on window.matchMedia('(pointer: fine)').matches

---

## Magnetic Buttons

All primary + ghost buttons.

On mousemove within button bounds:
  x offset = (cursorX - buttonCenterX) * 0.25
  y offset = (cursorY - buttonCenterY) * 0.25
  button.style.transform = translate(xOffset, yOffset)

On mouseleave:
  transform: translate(0, 0)
  transition: transform 0.4s ease

Strength: 0.25 (25% of cursor offset from center)

---

## Animated Counters (useCounter.js)

Trigger: IntersectionObserver on stats row (once only)
Duration: ~1000ms
Easing: easeOut
Method: requestAnimationFrame, Math.floor for display
Format: count + suffix (e.g. "20" + "+")

---

## Scroll Lock (useScrollLock.js)

const useScrollLock = (isLocked) => {
  useEffect(() => {
    document.body.style.overflow = isLocked ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isLocked])
}

---

## Contact Modal Animation

AnimatePresence wraps modal.

Backdrop:
  initial: { opacity: 0 }
  animate: { opacity: 1, transition: { duration: 0.25 } }
  exit:    { opacity: 0 }

Modal:
  initial: { opacity: 0, y: 60, scale: 0.96 }
  animate: { opacity: 1, y: 0, scale: 1 }
  exit:    { opacity: 0, y: 40, scale: 0.97 }
  transition: { type: 'spring', stiffness: 300, damping: 30 }

---

## Hero Title Entrance

Each line animates with staggered fadeUp:
  Line 1 "Video":       delay 0.07s
  Line 2 "Editor":      delay 0.14s
  Line 3 "& AI Expert": delay 0.21s
  Badge:                delay 0s
  Description:          delay 0.28s
  Buttons:              delay 0.35s
  Stats:                delay 0.42s
  Photo card:           delay 0.10s

---

## Navbar Scroll Behavior

useEffect scroll listener — scrollY > 40 toggles scrolled state
CSS transition: background + backdrop-filter + border-color — all 0.4s ease

---

## Bento Card Hover (Work section)

whileHover on card container:   { y: -5 }, transition 0.35s
Overlay div:   opacity 0 to 1   on parent hover
Info block:    { opacity:0, y:12 } to { opacity:1, y:0 } on parent hover
Arrow icon:    { opacity:0, scale:0.7 } to { opacity:1, scale:1 }

---

## Service Card Hover

whileHover on card: { y: -6, borderColor: accentBorder, background: '#1a1a1a' }
Icon: background becomes #C8F13B on parent hover
Arrow: { x:6, y:-6, opacity:0 } to { x:0, y:0, opacity:1 }

---

## Glow Orb Pulse (Hero + CTA)

Pure CSS — not Framer Motion (better performance for looping):

@keyframes glowPulse {
  0%, 100% { transform: scale(1);    opacity: 1;   }
  50%       { transform: scale(1.08); opacity: 0.7; }
}
animation: glowPulse 7s ease-in-out infinite

---

## Page Load

Wrap page content in motion.div:
  initial: { opacity: 0 }
  animate: { opacity: 1, transition: { duration: 0.4 } }
Clean dark fade-in on first load.

---

## Easing Reference

All reveals:         [0.22, 1, 0.36, 1]  (custom ease-out curve)
Modal spring:        stiffness 300, damping 30
Button reset:        0.4s ease
Card hover:          0.35s ease
Navbar transition:   0.4s ease
Glow pulse:          7s ease-in-out (CSS)
