import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'cookie_consent'

export function getCookieConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export default function CookieConsent({ onConsent }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const existing = getCookieConsent()
    if (!existing) {
      // Small delay so it doesn't flash on top of page load
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    } else {
      onConsent?.(existing)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
    onConsent?.('accepted')
    // Trigger analytics in the same tab via a custom event that main.jsx listens for
    window.dispatchEvent(new CustomEvent('cookie-consent-accepted'))
  }

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected')
    setVisible(false)
    onConsent?.('rejected')
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-[380px] z-[9998] rounded-2xl p-5 shadow-2xl"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
          }}
        >
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
            This site uses{' '}
            <strong style={{ color: 'var(--text)' }}>Vercel Analytics</strong>
            {' '}(privacy-friendly, no ad tracking) to understand how visitors use the site. See our{' '}
            <Link to="/privacy" className="text-accent underline" onClick={reject}>
              Privacy Policy
            </Link>
            .
          </p>
          <div className="flex gap-3">
            <button
              onClick={accept}
              className="flex-1 rounded-full font-bold text-sm transition-opacity hover:opacity-85 min-h-[44px]"
              style={{
                background: 'var(--accent)',
                color: 'var(--btn-colored-text)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Accept
            </button>
            <button
              onClick={reject}
              className="flex-1 rounded-full font-semibold text-sm transition-colors min-h-[44px]"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              Reject
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
