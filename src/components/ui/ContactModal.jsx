import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useScrollLock from '../../hooks/useScrollLock'
import { supabase } from '../../lib/supabase'

const ContactModal = ({ isOpen, onClose }) => {
    useScrollLock(isOpen)

    const [status, setStatus] = useState('idle') // idle, loading, success, error
    const [isMobile, setIsMobile] = useState(false)

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
        if (isOpen) setStatus('idle')
    }, [isOpen])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')

        const fd = new FormData(e.target)
        const { error } = await supabase
            .from('leads')
            .insert([{
                name: fd.get('name'),
                email: fd.get('email'),
                phone: fd.get('phone'),
                project_type: fd.get('projectType'),
            }])

        if (error) {
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
                                <div className="flex flex-col items-center justify-center py-10 text-center relative h-[300px]">
                                    <div className="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center mb-6 text-accent">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <h3 className="text-[22px] font-heading font-bold text-text mb-2">Message Sent</h3>
                                    <p className="text-text-muted font-body">Got it. I'll be in touch within 24 hours.</p>
                                    <button onClick={onClose} className="mt-8 text-accent text-[13px] hover:underline">
                                        Close window
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-body">
                                    <label htmlFor="contact-name" className="sr-only">Your name</label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="Your name"
                                        className="w-full bg-bg-3 border border-strong rounded-[14px] px-[18px] py-[14px] h-[52px] text-[16px] text-text placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors"
                                    />
                                    <label htmlFor="contact-email" className="sr-only">Email address</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="your@email.com"
                                        className="w-full bg-bg-3 border border-strong rounded-[14px] px-[18px] py-[14px] h-[52px] text-[16px] text-text placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors"
                                    />
                                    <label htmlFor="contact-phone" className="sr-only">Phone number</label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        name="phone"
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
