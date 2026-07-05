import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useSettings, useSiteContent } from '../hooks/useContent'
import { supabase } from '../lib/contentApi'

export default function ContactPage({ onOpenModal, settings: settingsProp }) {
  const { data: fetchedSettings } = useSettings()
  const { data: siteContent } = useSiteContent()
  const settings = settingsProp || fetchedSettings || {}

  const contactEmail = settings?.contact_email || siteContent?.contact_email || 'kforkreativein@gmail.com'
  const phoneNumber = settings?.whatsapp_number || siteContent?.whatsapp_number || '919724690118'
  const displayPhone = `+${phoneNumber.replace(/\D/g, '')}`
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=Hi%20Krish%2C%20I%27d%20like%20to%20discuss%20a%20project.`

  const [status, setStatus] = useState('idle')
  const [submittedName, setSubmittedName] = useState('')

  useEffect(() => {
    document.title = 'Contact — Krish Chhatrala'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.content = 'Get in touch with Krish Chhatrala — Video Editor & AI Marketing Expert. Email, phone, WhatsApp or submit a project enquiry form. Based in Vadodara, India.'
  }, [])

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
    try {
      const { error } = await supabase.from('leads').insert([lead])
      setStatus(error ? 'error' : 'success')
    } catch {
      setStatus('error')
    }
  }

  const inputCls = "w-full bg-bg-3 border border-strong rounded-[14px] px-[18px] py-[14px] h-[52px] text-[16px] text-text placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors"

  return (
    <div className="bg-bg min-h-screen text-text font-body">
      <Navbar onOpenModal={onOpenModal} siteContent={siteContent} />

      <main id="main-content" style={{ paddingTop: 'var(--pad-project-t)', paddingBottom: 'var(--pad-project-b)' }}>
        <div className="max-w-[1100px] mx-auto px-[var(--pad-side)]">
          <Link
            to="/"
            className="text-xs uppercase tracking-widest font-semibold hover:text-accent transition-colors block mb-6"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back to Home
          </Link>

          <h1 className="text-[clamp(32px,6vw,64px)] font-extrabold leading-tight tracking-[-0.04em] mb-3" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
            Let's Work Together
          </h1>
          <p className="text-base max-w-[520px] leading-relaxed mb-12" style={{ color: 'var(--text-muted)' }}>
            Tell me about your brand and goals. I reply within 24 hours and offer a free discovery call for all new projects.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16">
            {/* Contact form */}
            <div>
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-start gap-4 py-8"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {submittedName ? `Got it, ${submittedName}!` : 'Message received!'}
                  </h2>
                  <p style={{ color: 'var(--text-muted)' }}>I'll review your project and get back to you within 24 hours.</p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full font-bold text-white min-h-[52px] px-8 hover:-translate-y-px transition-all"
                    style={{ background: '#25D366' }}
                  >
                    Message on WhatsApp for faster reply
                  </a>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Project enquiry form">
                  <div>
                    <label htmlFor="contact-name" className="sr-only">Your name</label>
                    <input id="contact-name" type="text" name="name" required maxLength={100} placeholder="Your name" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="sr-only">Email address</label>
                    <input id="contact-email" type="email" name="email" required maxLength={200} placeholder="your@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="sr-only">Phone number</label>
                    <input id="contact-phone" type="tel" name="phone" maxLength={20} placeholder="+91 98765 43210" className={inputCls} />
                  </div>
                  <div className="relative">
                    <label htmlFor="contact-project-type" className="sr-only">Project type</label>
                    <select id="contact-project-type" name="projectType" required defaultValue="" className={inputCls + ' h-auto appearance-none'}>
                      <option value="" disabled>Project Type</option>
                      <option value="video-editing">Video Editing</option>
                      <option value="social-media">Social Media Management</option>
                      <option value="ai-automation">AI Automation</option>
                      <option value="graphic-design">Graphic Design</option>
                      <option value="full-package">Full Package</option>
                    </select>
                    <div className="absolute right-[18px] top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    By submitting, you agree to our{' '}
                    <Link to="/privacy" className="text-accent underline">Privacy Policy</Link>.
                  </p>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full font-bold rounded-full flex items-center justify-center hover:-translate-y-px transition-all disabled:opacity-70 min-h-[52px] text-base"
                    style={{ background: 'var(--accent)', color: 'var(--btn-colored-text)', border: 'none', cursor: 'pointer' }}
                  >
                    {status === 'loading' ? 'Sending…' : 'Send Project Brief →'}
                  </button>
                  {status === 'error' && (
                    <p className="text-red-500 text-sm">Something went wrong. Email me directly at {contactEmail}</p>
                  )}
                </form>
              )}
            </div>

            {/* Contact details sidebar */}
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <h2 className="text-base font-bold uppercase tracking-widest" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-muted)', fontSize: 11 }}>
                  Get in Touch
                </h2>

                {/* Email */}
                <a href={`mailto:${contactEmail}`} className="flex items-start gap-4 group" style={{ textDecoration: 'none' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>Email</p>
                    <p className="text-sm font-medium group-hover:text-accent transition-colors" style={{ color: 'var(--text)' }}>{contactEmail}</p>
                  </div>
                </a>

                {/* Phone */}
                <a href={`tel:${displayPhone}`} className="flex items-start gap-4 group" style={{ textDecoration: 'none' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.57a16 16 0 0 0 6 6l.83-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>Phone</p>
                    <p className="text-sm font-medium group-hover:text-accent transition-colors" style={{ color: 'var(--text)' }}>{displayPhone}</p>
                  </div>
                </a>

                {/* WhatsApp */}
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group" style={{ textDecoration: 'none' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>WhatsApp</p>
                    <p className="text-sm font-medium group-hover:text-accent transition-colors" style={{ color: 'var(--text)' }}>Message for faster reply</p>
                  </div>
                </a>

                <hr style={{ borderColor: 'var(--border)' }} />

                {/* Business hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--bg-3)', color: 'var(--text-muted)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>Business Hours</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Mon – Sat, 10:00 – 19:00 IST</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>I reply to all enquiries within 24 hours</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--bg-3)', color: 'var(--text-muted)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>Location</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Vadodara, Gujarat 🇮🇳</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Available for remote work globally</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer siteContent={siteContent} settings={settings} />
    </div>
  )
}
