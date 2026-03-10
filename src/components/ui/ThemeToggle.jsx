import { motion } from 'framer-motion'
import { useTheme } from '../../hooks/useTheme.jsx'

export default function ThemeToggle({ inline = false }) {
    const { theme, toggle } = useTheme()
    const isDark = theme === 'dark'

    return (
        <button
            onClick={toggle}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] shadow-2xl"
            style={{
                width: 60,
                height: 30,
                borderRadius: 100,
                display: 'flex',
                alignItems: 'center',
                padding: 3,
                gap: 0,
                background: 'var(--bg-3)',
                border: '1px solid var(--border-strong)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                cursor: 'pointer',
            }}
        >
            {/* Dark icon slot */}
            <div
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    position: 'relative',
                    zIndex: 1,
                    flexShrink: 0,
                }}
            >
                {isDark && (
                    <motion.div
                        layoutId="theme-pill"
                        className="absolute inset-0 rounded-full bg-accent"
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                )}
                <span style={{ position: 'relative', zIndex: 1, lineHeight: 1, filter: isDark ? 'grayscale(1) brightness(0)' : 'none' }}>🌙</span>
            </div>

            {/* Light icon slot */}
            <div
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    position: 'relative',
                    zIndex: 1,
                    flexShrink: 0,
                }}
            >
                {!isDark && (
                    <motion.div
                        layoutId="theme-pill"
                        className="absolute inset-0 rounded-full bg-accent"
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                )}
                <span style={{ position: 'relative', zIndex: 1, lineHeight: 1, filter: !isDark ? 'brightness(0) invert(1)' : 'none' }}>☀️</span>
            </div>
        </button>
    )
}
