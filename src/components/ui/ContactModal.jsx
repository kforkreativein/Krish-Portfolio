import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useScrollLock from '../../hooks/useScrollLock'
import { supabase } from '../../lib/contentApi'

const ContactModal = ({ isOpen, onClose }) => {
    useScrollLock(isOpen)

    const [status, setStatus] = useState('idle') // idle, loading, success, error
    const [isMobile, setIsMobile] = useState(false)
    const [submittedName, setSubmittedName] = useState('')
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check, { passive: true })
        return () => window.removeEventListener('resize', check)
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    useEffect(() => {
        if (isOpen) {
            setStatus('idle')
            setSubmittedName('')
            setCountdown(5)
        }
    }, [isOpen])

    // Auto-close countdown after success
    useEffect(() => {
        if (status !== 'success') return
        setCountdown(5)
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    onClose()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [status])

    const handleSubmit = async (e) => {
        e.preventDefault()

        const COOLDOWN_MS = 60_000
        const lastSubmit = Number(localStorage.getItem('contact_last_submit') || 0)
        if (Date.now() - lastSubmit < COOLDOWN_MS) {
            const secsLeft = Math.ceil((COOLDOWN_MS - (Date.now() - lastSubmit)) / 1000)
            alert(`Please wait ${secsLeft}s before submitting again.`)
            return
        }

        setStatus('loading')

        const fd = new FormData(e.target)
        const name = fd.get('name')
        setSubmittedName(name?.split(' ')[0] || '')
        const lead = {
            name,
            email: fd.get('email'),
            phone: fd.get('phone'),
            project_type: fd.get('projectType'),
            created_at: new Date().toISOString(),
        }

        localStorage.setItem('contact_last_submit', String(Date.now()))
        let notified = false

        // 1. Web3Forms — email notification (requires VITE_WEB3FORMS_KEY in .env)
        const web3Key = import.meta.env.VITE_WEB3FORMS_KEY
        if (web3Key) {
            try {
                await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_key: web3Key,
                        subject: `New portfolio lead: ${lead.name}`,
                        ...lead,
                    }),
                })
                notified = true
            } catch (err) {
                console.warn('[ContactModal] Web3Forms error:', err)
            }
        }

        // 2. Save to local leads.json via contentApi (no-op in production)
        const { error } = await supabase.from('leads').insert([lead])

        if (error && !notified) {
            setStatus('error')
        } else {
            setStatus('success')
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.25 } }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-[32px]"
                    />
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
                        <motion.div
                            initial={isMobile ? { opacity: 1, y: '100%' } : { opacity: 0, y: 60, scale: 0.96 }}
                            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
                            exit={isMobile ? { opacity: 1, y: '100%' } : { opacity: 0, y: 40, scale: 0.97 }}
                            transition={isMobile ? { type: 'spring', stiffness: 400, damping: 40 } : { type: 'spring', stiffness: 300, damping: 30 }}
                            className="w-full sm:w-full sm:max-w-[520px] md:max-w-[480px] lg:max-w-[520px] glass-strong border-0 sm:border border-strong rounded-t-[20px] sm:rounded-[20px] lg:rounded-[24px] p-6 sm:p-8 md:p-10 lg:p-12 pointer-events-auto relative shadow-none sm:shadow-2xl overflow-y-auto max-h-[90vh] sm:max-h-none"
                        >
                            {/* Drag Handle — mobile only */}
                            <div className="flex justify-center mb-4 sm:hidden">
                                <div className="w-10 h-1 rounded-full opacity-40" style={{ backgroundColor: 'var(--text-dim)' }} />
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-text-dim hover:text-text transition-colors"
                                aria-label="Close modal"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="mb-8">
                                <div className="flex items-center gap-2.5 mb-2">
                                    <div className="w-[18px] h-[1px] bg-accent" />
                                    <span className="uppercase text-[10px] sm:text-[11px] tracking-[0.15em] text-accent font-semibold font-body">Contact</span>
                                </div>
                                <h2 className="text-[34px] md:text-[42px] font-heading font-extrabold leading-[1.05] tracking-[-0.035em]">
                                    <span className="text-text-dim block">Start a</span>
                                    <span className="text-text block">Project</span>
                                </h2>
                                <p className="mt-4 text-text-muted text-[15px] sm:text-[16px] max-w-[420px] font-body leading-[1.8]">
                                    Tell me about your brand. I'll get back within 24 hours.
                                </p>
                            </div>

                            {status === 'success' ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    {/* Animated checkmark */}
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                                        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 relative"
                                        style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
                                    >
                                        <div className="absolute inset-0 rounded-full border-2 border-accent opacity-40" />
                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </motion.div>

                                    {/* Heading */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h3 className="text-[28px] font-heading font-extrabold text-text leading-tight mb-2">
                                            {submittedName ? `Got it, ${submittedName}!` : 'Message Received!'}
                                        </h3>
                                        <p className="text-text-muted font-body text-[15px] leading-relaxed max-w-[320px] mx-auto">
                                            I'll review your project and get back to you <span className="text-text font-medium">within 24 hours.</span>
                                        </p>
                                    </motion.div>

                                    {/* Divider */}
                                    <motion.div
                                        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                                        transition={{ delay: 0.35 }}
                                        className="w-full h-px bg-border my-7"
                                    />

                                    {/* WhatsApp CTA */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="w-full flex flex-col gap-3"
                                    >
                                        <p className="text-text-dim text-[12px] uppercase tracking-widest font-body mb-1">Want a faster reply?</p>
                                        <a
                                            href="https://wa.me/919724690118?text=Hi%20Krish%2C%20I%20just%20submitted%20the%20contact%20form%20and%20wanted%20to%20connect."
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2.5 h-[50px] rounded-[100px] font-heading font-bold text-[15px] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-lg"
                                            style={{ background: '#25D366', color: '#fff' }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                            Message on WhatsApp
                                        </a>
                                        <button
                                            onClick={onClose}
                                            className="w-full h-[50px] rounded-[100px] border border-strong font-heading font-bold text-[15px] text-text-muted hover:text-text hover:border-text-muted transition-all duration-300"
                                        >
                                            Close — auto closing in {countdown}s
                                        </button>
                                    </motion.div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-body">
                                    <label htmlFor="contact-name" className="sr-only">Your name</label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        name="name"
                                        required
                                        maxLength={100}
                                        placeholder="Your name"
                                        className="w-full bg-bg-3 border border-strong rounded-[14px] px-[18px] py-[14px] h-[52px] text-[16px] text-text placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors"
                                    />
                                    <label htmlFor="contact-email" className="sr-only">Email address</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        name="email"
                                        required
                                        maxLength={200}
                                        placeholder="your@email.com"
                                        className="w-full bg-bg-3 border border-strong rounded-[14px] px-[18px] py-[14px] h-[52px] text-[16px] text-text placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors"
                                    />
                                    <label htmlFor="contact-phone" className="sr-only">Phone number</label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        name="phone"
                                        maxLength={20}
                                        placeholder="+91 98765 43210"
                                        className="w-full bg-bg-3 border border-strong rounded-[14px] px-[18px] py-[14px] h-[52px] text-[16px] text-text placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors"
                                    />
                                    <div className="relative">
                                        <label htmlFor="contact-project-type" className="sr-only">Project type</label>
                                        <select
                                            id="contact-project-type"
                                            name="projectType"
                                            required
                                            defaultValue=""
                                            className="w-full bg-bg-3 border border-strong rounded-[14px] px-[18px] py-[14px] text-text appearance-none focus:border-accent focus:outline-none transition-colors"
                                        >
                                            <option value="" disabled className="text-text-dim">Project Type</option>
                                            <option value="video-editing">Video Editing</option>
                                            <option value="social-media">Social Media Management</option>
                                            <option value="ai-automation">AI Automation</option>
                                            <option value="graphic-design">Graphic Design</option>
                                            <option value="full-package">Full Package (Multiple Services)</option>
                                        </select>
                                        <div className="absolute right-[18px] top-[18px] pointer-events-none text-text-dim">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="mt-4 w-full bg-accent text-black font-bold h-[50px] rounded-[100px] flex items-center justify-center hover:-translate-y-[2px] hover:shadow-[0_12px_32px_rgba(200,241,59,0.28)] transition-all duration-400 ease-[ease] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                    >
                                        {status === 'loading' ? 'Sending...' : 'Send It →'}
                                    </button>
                                    {status === 'error' && (
                                        <p className="text-red-500 text-[13px] text-center mt-2">Something went wrong. Email me at kforkreativein@gmail.com</p>
                                    )}
                                </form>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ContactModal
