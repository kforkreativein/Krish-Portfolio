import React, { useState, useEffect } from 'react'
import { Mail, Phone, Share2 } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { getSocialIconByName } from '../../constants/socialIcons'

export default function Footer({ onOpenModal, siteContent }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Live Clock Logic
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        month: 'long',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      const parts = formatter.formatToParts(now)
      const getPart = (type) => parts.find(p => p.type === type)?.value || ''
      const formatted = `${getPart('month')} ${getPart('day')}, ${getPart('year')} - ${getPart('hour')}:${getPart('minute')}`
      setTimeStr(formatted)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const v = isDark ? {
    bgWhite: '#0a0a0a',
    bgGray: '#141414',
    border: '#1e1e1e',
    textMain: '#ffffff',
    textMuted: '#555555',
    textKrish: '#ffffff',
    textChhatrala: '#404040',
    iconBorder: '#2a2a2a',
    iconBg: '#181818',
    pillBg: '#1a1a1a',
    pillBorder: '#333333'
  } : {
    bgWhite: '#ffffff',
    bgGray: '#f3f3f3',
    border: '#e5e5e5',
    textMain: '#111111',
    textMuted: '#666666',
    textKrish: '#111111',
    textChhatrala: '#737373',
    iconBorder: '#e0e0e0',
    iconBg: '#ffffff',
    pillBg: '#efefef',
    pillBorder: '#d5d5d5'
  }

  const socialLinks = (siteContent?.dynamic_social_links && siteContent.dynamic_social_links.length > 0)
    ? siteContent.dynamic_social_links
    : [
      { icon: 'Instagram', url: 'https://www.instagram.com/kforkreative', link: 'https://www.instagram.com/kforkreative' },
      { icon: 'Mail', url: 'mailto:kforkreativein@gmail.com', link: 'mailto:kforkreativein@gmail.com' },
      { icon: 'MessageCircle', url: 'https://wa.me/919724690118', link: 'https://wa.me/919724690118' }
    ]

  return (
    <footer style={{ width: '100%', fontFamily: '"Inter", sans-serif' }}>

      {/* SECTION 1 — Contact bar */}
      <div
        className="flex flex-col md:flex md:flex-row md:justify-between md:items-start md:w-full md:flex-nowrap items-center w-full px-6 md:px-12 py-8 md:py-10 gap-8 lg:gap-4 text-center md:text-left"
        style={{
          backgroundColor: v.bgGray,
          borderTop: `1px solid ${v.border}`
        }}
      >
        <div className="flex flex-col items-center md:items-start justify-start gap-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-semibold" style={{ fontFamily: '"Inter", sans-serif' }}>
            <Mail className="w-3 h-3" /> EMAIL -
          </div>
          <a href="mailto:kforkreativein@gmail.com" className="text-lg font-medium tracking-tight text-black dark:text-white hover:text-accent transition-colors" style={{ fontFamily: '"Inter", sans-serif', textDecoration: 'none' }}>
            kforkreativein@gmail.com
          </a>
        </div>
        <div className="flex flex-col items-center md:items-start lg:items-center justify-center gap-3">
          <div className="flex items-center md:items-start lg:items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-semibold" style={{ fontFamily: '"Inter", sans-serif' }}>
            <Phone className="w-3 h-3" /> CALL TODAY -
          </div>
          <a href="tel:+919724690118" className="text-lg font-medium tracking-tight text-black dark:text-white hover:text-accent transition-colors" style={{ fontFamily: '"Inter", sans-serif', textDecoration: 'none' }}>
            +919724690118
          </a>
        </div>
        <div className="flex flex-col items-center md:items-start lg:items-end gap-3 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-semibold"><Share2 className="w-3 h-3" /> SOCIAL :</div>
          <div className="flex items-center justify-center md:justify-start lg:justify-end gap-3">
            {socialLinks.map((social, i) => {
              const SocialIcon = getSocialIconByName(social.icon)

              return (
                <a
                  key={i}
                  href={social.url || social.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-accent hover:text-accent transition-all duration-300"
                  aria-label={`Follow on ${social.icon}`}
                >
                  <SocialIcon className="w-4 h-4" />
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2 — Copyright bar */}
      <div style={{
        backgroundColor: v.bgGray,
        borderTop: `1px solid ${v.border}`,
        padding: '10px 36px',
      }}>
        <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '11px', fontWeight: 400, color: isDark ? '#a1a1aa' : '#666666' }}>© Copyright 2026. All Rights Reserved by Krish Chhatrala</span>
      </div>

      {/* SECTION 3 — Hero name + SECTION 4, 5, 6 */}
      <div style={{
        backgroundColor: v.bgWhite,
        paddingTop: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingLeft: 0,
        paddingRight: 0,
        overflow: 'hidden'
      }}>
        {/* Massive Typography Wrapper */}
        <div className="mt-12 md:mt-16 mb-10 px-4 md:px-12 w-full overflow-hidden flex flex-col items-center">
          <span style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(38px, 12vw, 144px)',
            color: v.textKrish,
            letterSpacing: '-0.05em',
            lineHeight: 1.1,
            display: 'block',
            WebkitFontSmoothing: 'antialiased',
            textRendering: 'geometricPrecision',
            textAlign: 'center'
          }}>
            Krish
          </span>
          <span className="-mt-4 md:-mt-8" style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(36px, 12vw, 142px)',
            color: v.textChhatrala,
            letterSpacing: '-0.05em',
            lineHeight: 1.1,
            display: 'block',
            WebkitFontSmoothing: 'antialiased',
            textRendering: 'geometricPrecision',
            textAlign: 'center'
          }}>
            Chhatrala
          </span>
        </div>

        {/* SECTION 4, 5, 6 Wrapper */}
        <div className="flex flex-col items-center gap-8 mb-10">

          {/* SECTION 4 — Blue dot (REMOVED) */}

          <div className="flex flex-col items-center gap-4">
            <div
              className="bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-neutral-800 px-4 py-1.5 md:px-6 md:py-2.5 rounded-full text-accent font-medium tracking-wide text-xs md:text-sm transition-all duration-300 shadow-sm"
              style={{
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {timeStr || 'Loading...'}
            </div>
            <span style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: '#888888',
              transition: 'color 0.3s'
            }}>
              LOCAL TIME IN VADODARA, INDIA
            </span>
          </div>

          {/* SECTION 6 — Icon row */}
          <div className="flex flex-col items-center mt-2">
            <div className="flex justify-center items-center gap-4 mb-[30px]">
              {socialLinks.map((social, i) => {
                const SocialIcon = getSocialIconByName(social.icon)

                return (
                  <a
                    key={i}
                    href={social.url || social.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md"
                    style={{ border: `1px solid ${v.iconBorder}`, backgroundColor: v.iconBg }}
                    aria-label={`Follow on ${social.icon}`}
                  >
                    <SocialIcon className="w-4 h-4 md:w-5 md:h-5 text-black dark:text-gray-200" />
                  </a>
                )
              })}
            </div>

            {/* SECTION 7 — Centered Bottom nav */}
            <div className="flex items-center gap-2 mb-[60px]">
              <a href="#" style={{ fontFamily: '"Inter", sans-serif', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888888', textDecoration: 'none' }}>HOME</a>
              <span style={{ color: '#888888', fontSize: '10px' }}>•</span>
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888888' }}>CREATED BY KRISH</span>
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
