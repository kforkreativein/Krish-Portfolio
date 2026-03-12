import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSettings, useSiteContent } from './hooks/useContent'
import { ThemeProvider } from './hooks/useTheme.jsx'
import Cursor from './components/ui/Cursor'
import ThemeToggle from './components/ui/ThemeToggle'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

import Hero from './components/sections/Hero'
import ContactModal from './components/ui/ContactModal'
import FloatingCTA from './components/ui/FloatingCTA'

import Services from './components/sections/Services'
import Work from './components/sections/Work'
import Showreel from './components/sections/Showreel'
import Process from './components/sections/Process'
import Testimonials from './components/sections/Testimonials'
import CTA from './components/sections/CTA'
import Different from './components/sections/Different'
import Tools from './components/sections/Tools'
import LogoStrip from './components/sections/LogoStrip'

import Admin from './pages/Admin'
import ProjectDetail from './pages/ProjectDetail'
import ProjectPage from './pages/ProjectPage'

const DEFAULT_THEME = {
  theme_accent_light: '#0A68FF',
  theme_accent_dark: '#CCFF00',
  theme_bg_light: '#FAFAFA',
  theme_bg_dark: '#080808',
  theme_text_light: '#0A0A0A',
  theme_text_dark: '#EDE9E3',
  theme_secondary_text_light: '#4B5563',
  theme_secondary_text_dark: '#A1A1AA',
  theme_btn_filled_text_light: '#FFFFFF',
  theme_btn_filled_text_dark: '#000000',
  theme_btn_ghost_text_light: '#000000',
  theme_btn_ghost_text_dark: '#FFFFFF',
}

const normalizeHex = (value, fallback) => {
  const raw = (value || '').toString().trim()
  const valid = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)
  if (!valid) return fallback
  if (raw.length === 4) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toUpperCase()
  }
  return raw.toUpperCase()
}

const hexToRgb = (hex) => {
  const clean = (hex || '').replace('#', '')
  const num = Number.parseInt(clean, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

const rgba = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const adjustHex = (hex, amount) => {
  const { r, g, b } = hexToRgb(hex)
  const clamp = (value) => Math.max(0, Math.min(255, value))
  const nr = clamp(r + amount)
  const ng = clamp(g + amount)
  const nb = clamp(b + amount)
  return `#${[nr, ng, nb].map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

const normalizeSectionName = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')

function Portfolio({ onOpenModal }) {
  const { data: settings, loading: settingsLoading } = useSettings()
  const { data: siteContent, loading: siteContentLoading } = useSiteContent()

  useEffect(() => {
    if (settings?.meta_title) {
      document.title = settings.meta_title
    }
    if (settings?.meta_description) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = 'description'
        document.head.appendChild(meta)
      }
      meta.content = settings.meta_description
    }
  }, [settings?.meta_title, settings?.meta_description])

  if (settingsLoading || siteContentLoading) {
    return <div className="min-h-screen bg-bg text-text flex items-center justify-center">Loading...</div>
  }

  const defaultSectionOrder = ['hero', 'different', 'tools', 'marquee', 'services', 'work', 'showreel', 'process', 'testimonials', 'cta']
  const sectionOrder = (Array.isArray(siteContent?.section_order) && siteContent?.section_order?.length > 0)
    ? (siteContent?.section_order || defaultSectionOrder)
    : defaultSectionOrder

  const renderSection = (sectionName, key) => {
    const normalized = normalizeSectionName(sectionName)
    switch (normalized) {
      case 'hero':
        return <Hero key={key} siteContent={siteContent} settings={settings} onOpenModal={onOpenModal} />
      case 'different':
      case 'about':
        return <Different key={key} siteContent={siteContent} />
      case 'tools':
        return <Tools key={key} siteContent={siteContent} />
      case 'clients':
      case 'marquee':
      case 'logos':
      case 'clientsmarquee':
        return <LogoStrip key={key} siteContent={siteContent} />
      case 'services':
        return <Services key={key} siteContent={siteContent} />
      case 'work':
      case 'projects':
      case 'portfolio':
        return <Work key={key} onOpenModal={onOpenModal} settings={settings} siteContent={siteContent} />
      case 'showreel':
        return <Showreel key={key} siteContent={siteContent} />
      case 'process':
        return <Process key={key} siteContent={siteContent} />
      case 'testimonials':
        return <Testimonials key={key} siteContent={siteContent} />
      case 'cta':
      case 'levelup':
      case 'level_up':
      case 'levelupcta':
        return <CTA key={key} siteContent={siteContent} settings={settings} onOpenModal={onOpenModal} />
      default:
        return null
    }
  }

  return (
    <motion.div
      className="bg-bg min-h-screen text-text font-body"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grain-overlay" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      <Navbar onOpenModal={onOpenModal} siteContent={siteContent} />

      <main>
        {(sectionOrder || [])
          .filter(sectionKey => {
            const hidden = Array.isArray(siteContent?.hidden_sections) ? siteContent.hidden_sections : []
            return !hidden.includes(sectionKey)
          })
          .map((sectionKey, idx) => {
            try {
              const key = `${sectionKey}-${idx}`
              return renderSection(sectionKey, key)
            } catch (e) {
              console.error('[Portfolio] Section render error:', sectionKey, e)
              return null
            }
          })}
      </main>

      <Footer siteContent={siteContent} />
    </motion.div>
  )
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  const { data: globalSiteContent } = useSiteContent()
  const { data: settings } = useSettings()

  useEffect(() => {
    if (!globalSiteContent?.favicon_url) return
    let link = document.querySelector("link[rel*='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = globalSiteContent.favicon_url
  }, [globalSiteContent?.favicon_url])

  useEffect(() => {
    const accentLight = normalizeHex(globalSiteContent?.theme_accent_light, DEFAULT_THEME.theme_accent_light)
    const accentDark = normalizeHex(globalSiteContent?.theme_accent_dark, DEFAULT_THEME.theme_accent_dark)
    const bgLight = normalizeHex(globalSiteContent?.theme_bg_light, DEFAULT_THEME.theme_bg_light)
    const bgDark = normalizeHex(globalSiteContent?.theme_bg_dark, DEFAULT_THEME.theme_bg_dark)
    const textLight = normalizeHex(globalSiteContent?.theme_text_light, DEFAULT_THEME.theme_text_light)
    const textDark = normalizeHex(globalSiteContent?.theme_text_dark, DEFAULT_THEME.theme_text_dark)
    const textSecondaryLight = normalizeHex(globalSiteContent?.theme_secondary_text_light, DEFAULT_THEME.theme_secondary_text_light)
    const textSecondaryDark = normalizeHex(globalSiteContent?.theme_secondary_text_dark, DEFAULT_THEME.theme_secondary_text_dark)
    const btnFilledLight = normalizeHex(globalSiteContent?.theme_btn_filled_text_light, DEFAULT_THEME.theme_btn_filled_text_light)
    const btnFilledDark = normalizeHex(globalSiteContent?.theme_btn_filled_text_dark, DEFAULT_THEME.theme_btn_filled_text_dark)
    const btnGhostLight = normalizeHex(globalSiteContent?.theme_btn_ghost_text_light, DEFAULT_THEME.theme_btn_ghost_text_light)
    const btnGhostDark = normalizeHex(globalSiteContent?.theme_btn_ghost_text_dark, DEFAULT_THEME.theme_btn_ghost_text_dark)

    let styleEl = document.getElementById('dynamic-theme-vars')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'dynamic-theme-vars'
      document.head.appendChild(styleEl)
    }

    styleEl.textContent = `
      :root {
        --bg: ${bgLight};
        --bg-2: ${adjustHex(bgLight, -10)};
        --bg-3: ${adjustHex(bgLight, -20)};
        --bg-4: ${adjustHex(bgLight, -30)};
        --text: ${textLight};
        --text-muted: ${textSecondaryLight};
        --text-dim: ${rgba(textLight, 0.55)};
        --text-subtle: ${rgba(textLight, 0.6)};
        --text-ultra-dim: ${rgba(textLight, 0.2)};
        --text-secondary: ${textSecondaryLight};
        --btn-colored-text: ${btnFilledLight};
        --btn-normal-text: ${btnGhostLight};
        --border: ${rgba(textLight, 0.12)};
        --border-strong: ${rgba(textLight, 0.18)};
        --accent-color: ${accentLight};
        --accent-primary: var(--accent-color, ${accentLight});
        --accent: var(--accent-color, ${accentLight});
        --accent-dim: ${rgba(accentLight, 0.08)};
        --accent-border: ${rgba(accentLight, 0.25)};
      }
      .dark {
        --bg: ${bgDark};
        --bg-2: ${adjustHex(bgDark, 6)};
        --bg-3: ${adjustHex(bgDark, 12)};
        --bg-4: ${adjustHex(bgDark, 18)};
        --text: ${textDark};
        --text-muted: ${textSecondaryDark};
        --text-dim: ${rgba(textDark, 0.5)};
        --text-subtle: ${rgba(textDark, 0.6)};
        --text-ultra-dim: ${rgba(textDark, 0.2)};
        --text-secondary: ${textSecondaryDark};
        --btn-colored-text: ${btnFilledDark};
        --btn-normal-text: ${btnGhostDark};
        --border: ${rgba(textDark, 0.055)};
        --border-strong: ${rgba(textDark, 0.1)};
        --accent-color: ${accentDark};
        --accent-primary: var(--accent-color, ${accentDark});
        --accent: var(--accent-color, ${accentDark});
        --accent-dim: ${rgba(accentDark, 0.07)};
        --accent-border: ${rgba(accentDark, 0.16)};
      }

      :root {
        --pad-side: ${settings?.pad_side_mob || '20px'};
        --pad-hero-t: ${settings?.pad_hero_t_mob || '95px'};
        --pad-hero-b: ${settings?.pad_hero_b_mob || '16px'};
        --pad-different-t: ${settings?.pad_different_t_mob || '110px'};
        --pad-different-b: ${settings?.pad_different_b_mob || '110px'};
        --pad-services-t: ${settings?.pad_services_t_mob || '70px'};
        --pad-services-b: ${settings?.pad_services_b_mob || '70px'};
        --pad-work-t: ${settings?.pad_work_t_mob || '60px'};
        --pad-work-b: ${settings?.pad_work_b_mob || '60px'};
        --pad-process-t: ${settings?.pad_process_t_mob || '56px'};
        --pad-process-b: ${settings?.pad_process_b_mob || '65px'};
        --pad-clients-t: ${settings?.pad_clients_t_mob || '45px'};
        --pad-clients-b: ${settings?.pad_clients_b_mob || '45px'};
        --pad-stack-t: ${settings?.pad_stack_t_mob || '55px'};
        --pad-stack-b: ${settings?.pad_stack_b_mob || '45px'};
        --pad-showreel-t: ${settings?.pad_showreel_t_mob || '56px'};
        --pad-showreel-b: ${settings?.pad_showreel_b_mob || '56px'};
        --pad-testimonials-t: ${settings?.pad_testimonials_t_mob || '55px'};
        --pad-testimonials-b: ${settings?.pad_testimonials_b_mob || '65px'};
        --pad-cta-t: ${settings?.pad_cta_t_mob || '70px'};
        --pad-cta-b: ${settings?.pad_cta_b_mob || '70px'};
        --pad-project-t: ${settings?.pad_project_t_mob || '100px'};
        --pad-project-b: ${settings?.pad_project_b_mob || '60px'};
        --pad-admin-t: ${settings?.pad_admin_t_mob || '80px'};
        --pad-admin-b: ${settings?.pad_admin_b_mob || '128px'};
      }

      @media (min-width: 768px) {
        :root {
          --pad-side: ${settings?.pad_side_tab || '32px'};
          --pad-hero-t: ${settings?.pad_hero_t_tab || '110px'};
          --pad-hero-b: ${settings?.pad_hero_b_tab || '24px'};
          --pad-different-t: ${settings?.pad_different_t_tab || '28px'};
          --pad-different-b: ${settings?.pad_different_b_tab || '100px'};
          --pad-services-t: ${settings?.pad_services_t_tab || '70px'};
          --pad-services-b: ${settings?.pad_services_b_tab || '70px'};
          --pad-work-t: ${settings?.pad_work_t_tab || '65px'};
          --pad-work-b: ${settings?.pad_work_b_tab || '65px'};
          --pad-process-t: ${settings?.pad_process_t_tab || '72px'};
          --pad-process-b: ${settings?.pad_process_b_tab || '80px'};
          --pad-clients-t: ${settings?.pad_clients_t_tab || '30px'};
          --pad-clients-b: ${settings?.pad_clients_b_tab || '30px'};
          --pad-stack-t: ${settings?.pad_stack_t_tab || '65px'};
          --pad-stack-b: ${settings?.pad_stack_b_tab || '55px'};
          --pad-showreel-t: ${settings?.pad_showreel_t_tab || '108px'};
          --pad-showreel-b: ${settings?.pad_showreel_b_tab || '108px'};
          --pad-testimonials-t: ${settings?.pad_testimonials_t_tab || '50px'};
          --pad-testimonials-b: ${settings?.pad_testimonials_b_tab || '80px'};
          --pad-cta-t: ${settings?.pad_cta_t_tab || '80px'};
          --pad-cta-b: ${settings?.pad_cta_b_tab || '100px'};
          --pad-project-t: ${settings?.pad_project_t_tab || '120px'};
          --pad-project-b: ${settings?.pad_project_b_tab || '80px'};
          --pad-admin-t: ${settings?.pad_admin_t_tab || '56px'};
          --pad-admin-b: ${settings?.pad_admin_b_tab || '128px'};
        }
      }

      @media (min-width: 1024px) {
        :root {
          --pad-side: ${settings?.pad_side_desk || '52px'};
          --pad-hero-t: ${settings?.pad_hero_t_desk || '120px'};
          --pad-hero-b: ${settings?.pad_hero_b_desk || '24px'};
          --pad-different-t: ${settings?.pad_different_t_desk || '26px'};
          --pad-different-b: ${settings?.pad_different_b_desk || '115px'};
          --pad-services-t: ${settings?.pad_services_t_desk || '110px'};
          --pad-services-b: ${settings?.pad_services_b_desk || '110px'};
          --pad-work-t: ${settings?.pad_work_t_desk || '90px'};
          --pad-work-b: ${settings?.pad_work_b_desk || '110px'};
          --pad-process-t: ${settings?.pad_process_t_desk || '100px'};
          --pad-process-b: ${settings?.pad_process_b_desk || '100px'};
          --pad-clients-t: ${settings?.pad_clients_t_desk || '35px'};
          --pad-clients-b: ${settings?.pad_clients_b_desk || '35px'};
          --pad-stack-t: ${settings?.pad_stack_t_desk || '110px'};
          --pad-stack-b: ${settings?.pad_stack_b_desk || '85px'};
          --pad-showreel-t: ${settings?.pad_showreel_t_desk || '108px'};
          --pad-showreel-b: ${settings?.pad_showreel_b_desk || '108px'};
          --pad-testimonials-t: ${settings?.pad_testimonials_t_desk || '75px'};
          --pad-testimonials-b: ${settings?.pad_testimonials_b_desk || '100px'};
          --pad-cta-t: ${settings?.pad_cta_t_desk || '110px'};
          --pad-cta-b: ${settings?.pad_cta_b_desk || '110px'};
          --pad-project-t: ${settings?.pad_project_t_desk || '120px'};
          --pad-project-b: ${settings?.pad_project_b_desk || '80px'};
          --pad-admin-t: ${settings?.pad_admin_t_desk || '56px'};
          --pad-admin-b: ${settings?.pad_admin_b_desk || '128px'};
        }
      }
    `
  }, [
    globalSiteContent,
    settings,
  ])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Cursor />
        <ThemeToggle />
        <ContactModal isOpen={isModalOpen} onClose={closeModal} />
        <FloatingCTA onOpenModal={openModal} settings={settings} />
        <Routes>
          <Route path="/" element={<Portfolio onOpenModal={openModal} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/work/:slug" element={<ProjectPage onOpenModal={openModal} settings={settings} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App