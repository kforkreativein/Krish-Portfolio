import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings, useSiteContent } from '../../hooks/useContent'
import { useTheme } from '../../hooks/useTheme'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#different' },
  { label: 'Services', href: '/#services' },
  { label: 'Work', href: '/#work' },
  { label: 'Contact', href: '/contact' },
]

function MobileDrawer({ isOpen, onClose, onOpenModal, navLogoText, ctaText }) {
  const drawerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length) focusable[0].focus()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[190] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          {/* Drawer */}
          <motion.nav
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed top-0 right-0 bottom-0 z-[195] w-[280px] flex flex-col"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderLeft: '1px solid var(--border-strong)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
                {navLogoText}
              </span>
              <button
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 48, height: 48,
                  color: 'var(--text-muted)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <div className="flex flex-col gap-1 px-4 py-4 flex-1">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={onClose}
                  className="flex items-center rounded-xl px-4 hover:bg-white/5 transition-colors"
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 600,
                    fontSize: 16,
                    color: 'var(--text)',
                    textDecoration: 'none',
                    minHeight: 52,
                  }}
                >
                  {label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="px-4 pb-8">
              <button
                onClick={() => { onClose(); onOpenModal() }}
                className="w-full flex items-center justify-center rounded-full font-bold transition-opacity hover:opacity-85"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--btn-colored-text)',
                  border: 'none',
                  cursor: 'pointer',
                  minHeight: 52,
                  fontSize: 15,
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 800,
                }}
              >
                {ctaText}
              </button>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}

export default function Navbar({ onOpenModal, siteContent: siteContentProp }) {
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { data: settings } = useSettings()
  const { data: fetchedSiteContent } = useSiteContent()
  const siteContent = siteContentProp || fetchedSiteContent || {}
  const navIconUrl = siteContent?.nav_icon_url || settings?.avatar_image_url
  const navLogoText = siteContent?.nav_logo_text || 'Krish.'
  const ctaText = settings?.floating_cta_text || siteContent?.floating_cta_text || "Let's Talk"

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  // Lock body scroll when drawer open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <>
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenModal={onOpenModal}
        navLogoText={navLogoText}
        ctaText={ctaText}
      />

      <div
        style={{
          position: 'fixed',
          top: isMobile ? 16 : 20,
          left: 0,
          right: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 200,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          layout
          transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
          onClick={() => scrolled && !isMobile && window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 8 : 0,
            borderRadius: 100,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            pointerEvents: 'auto',
            maxWidth: isMobile ? 'calc(100vw - 32px)' : 'min(600px, calc(100vw - 32px))',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-strong)',
            padding: isMobile ? '5px' : (scrolled ? '8px 16px 8px 8px' : '8px 8px 8px 8px'),
            cursor: (scrolled && !isMobile) ? 'pointer' : 'default',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          {/* Logo and Avatar */}
          <a
            href="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              pointerEvents: 'auto',
              minHeight: 44,
            }}
            aria-label={`${navLogoText} Home`}
          >
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {navIconUrl ? (
                <img
                  src={navIconUrl}
                  alt="Profile photo"
                  width={32}
                  height={32}
                  loading="eager"
                  decoding="sync"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    display: 'block',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--bg-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  👨🏻‍💻
                </div>
              )}
            </div>
            <span
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: isMobile ? 13 : 14,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                paddingRight: isMobile ? 6 : 8,
                paddingLeft: isMobile ? 0 : 4,
              }}
            >
              {navLogoText}
            </span>
          </a>

          {/* Mobile: hamburger button */}
          {isMobile && (
            <button
              onClick={(e) => { e.stopPropagation(); setDrawerOpen(true) }}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              style={{
                flexShrink: 0,
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                borderRadius: 100,
                width: 48,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            </button>
          )}

          {/* Desktop Expanded: nav links + contact */}
          {!isMobile && (
            <AnimatePresence mode="wait">
              {!scrolled && (
                <motion.div
                  key="full"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {(navLinks || []).map(({ label, href }, i) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                        <a
                          href={href}
                          style={{
                            fontFamily: 'inherit',
                            fontSize: 14,
                            color: 'var(--text-subtle)',
                            textDecoration: 'none',
                            padding: '0 14px',
                            whiteSpace: 'nowrap',
                            transition: 'color 0.2s',
                            minHeight: 44,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          onMouseEnter={e => (e.target.style.color = 'var(--text)')}
                          onMouseLeave={e => (e.target.style.color = 'var(--text-subtle)')}
                        >
                          {label}
                        </a>
                        {i < navLinks.length - 1 && (
                          <span style={{ color: 'var(--text-ultra-dim)', fontSize: 10 }}>·</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenModal() }}
                    style={{
                      flexShrink: 0,
                      background: 'var(--text)',
                      color: 'var(--bg)',
                      fontWeight: 800,
                      borderRadius: 100,
                      padding: '10px 22px',
                      fontSize: 13,
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      marginLeft: 8,
                      minHeight: 44,
                      transition: 'transform 0.2s, opacity 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {ctaText}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Desktop Compact: available for work */}
          {!isMobile && (
            <AnimatePresence mode="wait">
              {scrolled && (
                <motion.div
                  key="compact"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <span style={{ fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', paddingLeft: 12 }}>
                    {siteContent?.nav_status_text || "Available for work"}
                  </span>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      flexShrink: 0,
                      boxShadow: '0 0 10px var(--accent)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </>
  )
}
