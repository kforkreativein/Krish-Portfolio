import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings, useSiteContent } from '../../hooks/useContent'
import { useTheme } from '../../hooks/useTheme'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#different' },
  { label: 'Services', href: '/#services' },
  { label: 'Work', href: '/#work' },
]

export default function Navbar({ onOpenModal, siteContent: siteContentProp }) {
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { data: settings } = useSettings()
  const { data: fetchedSiteContent } = useSiteContent()
  const siteContent = siteContentProp || fetchedSiteContent || {}
  const navIconUrl = siteContent?.nav_icon_url || settings?.avatar_image_url
  const navLogoText = siteContent?.nav_logo_text || 'Krish.'

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

  return (
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
          background: isMobile ? 'var(--glass-bg)' : 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: isMobile ? '1px solid var(--border-strong)' : '1px solid var(--border-strong)',
          padding: isMobile ? '5px' : (scrolled ? '8px 16px 8px 8px' : '8px 8px 8px 8px'),
          cursor: (scrolled && !isMobile) ? 'pointer' : 'default',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        {/* Logo and Avatar clickable */}
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
          }}
          aria-label={`${navLogoText} Home`}
        >
          {/* Avatar */}
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

        {/* Mobile: always show Let's Talk button only */}
        {isMobile && (
          <button
            onClick={(e) => { e.stopPropagation(); onOpenModal() }}
            className="bg-accent hover:opacity-80 transition-opacity"
            style={{
              flexShrink: 0,
              color: isDark ? '#000000' : '#ffffff',
              fontWeight: 800,
              fontFamily: 'Syne, sans-serif',
              borderRadius: 100,
              padding: '4px 12px',
              fontSize: 11,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 32,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {settings?.floating_cta_text || siteContent?.floating_cta_text || "Let's Talk"}
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
                    transition: 'transform 0.2s, opacity 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {settings?.floating_cta_text || siteContent?.floating_cta_text || "Let's Talk"}
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
  )
}
