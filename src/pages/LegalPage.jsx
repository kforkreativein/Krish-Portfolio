import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const pages = {
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'June 23, 2026',
    content: `
## Overview

This privacy policy explains how Krish Chhatrala ("I", "me") collects, uses, and protects your personal information when you visit krishchhatrala.live.

## Information I Collect

**Contact form data:** When you fill out the contact or enquiry form I collect your name, email address, phone number (optional), and project details. This information is used solely to respond to your enquiry.

**Usage data:** This website uses Vercel Analytics — a privacy-focused, cookie-free analytics service by Vercel Inc. It collects anonymous page-view counts and performance metrics to help me understand how visitors use the site. No personally identifiable information is collected by analytics.

**Web3Forms:** When you submit the contact form, your data may be processed by Web3Forms to deliver the form submission to my email. Web3Forms processes data as a service provider. See the [Web3Forms privacy policy](https://web3forms.com/privacy) for details.

**Cookies:** This site uses only essential, functional local storage (e.g. to remember your cookie consent choice). No advertising or tracking cookies are set without your consent.

## How I Use Your Information

- To respond to your project enquiry within 24 hours
- To send you requested project updates or proposals
- To improve website performance using anonymous analytics

I do not sell, rent, or share your personal information with third parties for marketing purposes.

## Data Retention

Contact form submissions are retained for up to 12 months and then deleted. You may request deletion at any time (see "Your Rights" below).

## Your Rights (GDPR)

If you are in the European Economic Area or UK, you have the right to:

- **Access** the personal data I hold about you
- **Rectify** inaccurate data
- **Erase** your data ("right to be forgotten")
- **Restrict** processing of your data
- **Object** to processing
- **Data portability**

To exercise any right, email: **kforkreativein@gmail.com** — I will respond within 30 days.

## International Transfers

This website is operated from India. If you access it from the EU/UK, your data is processed in India. I rely on your consent and the necessity of performing a contract as legal bases for this transfer.

## Security

I take reasonable technical measures to protect your data. Form submissions are encrypted in transit (HTTPS/TLS) and stored in access-controlled systems.

## Changes

I may update this policy occasionally. The "last updated" date at the top reflects the most recent revision. Continued use of the site after changes constitutes acceptance.

## Contact

For any privacy-related questions: **kforkreativein@gmail.com**
    `,
  },
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'June 23, 2026',
    content: `
## Acceptance

By accessing or using krishchhatrala.live ("this site") you agree to these terms. If you do not agree, please leave the site.

## Services

This site is a portfolio and marketing website for Krish Chhatrala, a freelance video editor and AI marketing expert based in Vadodara, India. Services described (video editing, social media management, AI automation, graphic design) are subject to separate engagement agreements.

## Intellectual Property

All content on this site — including text, images, videos, graphics, and code — is the intellectual property of Krish Chhatrala unless otherwise stated. You may not reproduce, distribute, or use any content without prior written permission.

Client work (e.g., project case studies) is displayed with permission of the respective clients or as portfolio examples only.

## Disclaimers

This site is provided "as is" without warranties of any kind. I do not warrant that the site will be uninterrupted, error-free, or free of viruses. Results shown in case studies and testimonials are specific to those clients and not a guarantee of similar results.

## Limitation of Liability

To the fullest extent permitted by applicable law, Krish Chhatrala shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of this site or services enquired through it.

## Governing Law

These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Vadodara, Gujarat, India.

## Contact

Questions? Email: **kforkreativein@gmail.com**
    `,
  },
  accessibility: {
    title: 'Accessibility Statement',
    lastUpdated: 'June 23, 2026',
    content: `
## Commitment

Krish Chhatrala is committed to making krishchhatrala.live accessible to all users, including those with disabilities. I aim to conform to WCAG 2.1 Level AA guidelines.

## Current Status

I have made the following accessibility efforts:

- **Keyboard navigation:** All interactive elements are reachable and operable via keyboard
- **Screen readers:** Semantic HTML landmarks (nav, main, section, footer), ARIA labels, and roles are used throughout
- **Focus indicators:** Visible focus rings are present on all interactive elements
- **Motion:** The site respects the "prefers-reduced-motion" system setting
- **Touch:** Interactive elements meet minimum 44×44px touch target sizes on mobile
- **Text contrast:** Body text meets WCAG AA contrast ratios
- **Images:** All meaningful images have descriptive alt text
- **Skip to content:** A skip-navigation link is available at the top of each page

## Known Limitations

- Some decorative animations (grain overlay, cursor) are present on desktop but disabled on mobile/reduced-motion preferences
- Video content in the showreel section does not currently have captions

## Feedback

If you experience any accessibility barriers, please contact me:

- **Email:** kforkreativein@gmail.com
- **WhatsApp:** +91 97246 90118

I aim to respond to accessibility feedback within 5 business days and resolve issues within 30 days.

## Technical Specification

This site is built with React 18, Tailwind CSS, and Framer Motion. Tested with VoiceOver (macOS/iOS) and keyboard navigation.
    `,
  },
}

function renderMarkdown(text) {
  const lines = text.trim().split('\n')
  const elements = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl font-bold mt-8 mb-3" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
          {line.replace('## ', '')}
        </h2>
      )
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={key++} className="font-semibold mb-2 text-sm" style={{ color: 'var(--text)' }}>
          {line.slice(2, -2)}
        </p>
      )
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      // inline bold + link parsing
      const parts = []
      let remaining = line
      let pk = 0
      while (remaining.length) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
        const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/)
        if (!boldMatch && !linkMatch) { parts.push(<span key={pk++}>{remaining}</span>); break }
        const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity
        const linkIdx = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity
        if (boldIdx <= linkIdx) {
          if (boldIdx > 0) parts.push(<span key={pk++}>{remaining.slice(0, boldIdx)}</span>)
          parts.push(<strong key={pk++}>{boldMatch[1]}</strong>)
          remaining = remaining.slice(boldIdx + boldMatch[0].length)
        } else {
          if (linkIdx > 0) parts.push(<span key={pk++}>{remaining.slice(0, linkIdx)}</span>)
          parts.push(<a key={pk++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-accent underline">{linkMatch[1]}</a>)
          remaining = remaining.slice(linkIdx + linkMatch[0].length)
        }
      }
      elements.push(
        <p key={key++} className="mb-3 leading-relaxed text-sm" style={{ color: 'var(--text-muted)' }}>
          {parts}
        </p>
      )
    }
  }
  return elements
}

export default function LegalPage({ pageKey }) {
  const page = pages[pageKey]

  useEffect(() => {
    document.title = `${page?.title} — Krish Chhatrala`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.content = `${page?.title} for krishchhatrala.live — Krish Chhatrala, Video Editor & AI Marketing Expert.`
  }, [pageKey, page?.title])

  if (!page) return null

  return (
    <div className="bg-bg min-h-screen text-text font-body">
      <Navbar />
      <main id="main-content" style={{ paddingTop: 'var(--pad-project-t)', paddingBottom: 'var(--pad-project-b)' }}>
        <div className="max-w-[720px] mx-auto px-[var(--pad-side)]">
          <div className="mb-2">
            <Link
              to="/"
              className="text-xs uppercase tracking-widest font-semibold hover:text-accent transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Back to Home
            </Link>
          </div>
          <h1 className="text-[clamp(28px,5vw,48px)] font-extrabold leading-tight tracking-tight mb-2 mt-4" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
            {page.title}
          </h1>
          <p className="text-xs mb-10" style={{ color: 'var(--text-muted)' }}>
            Last updated: {page.lastUpdated}
          </p>
          <div className="prose-like">
            {renderMarkdown(page.content)}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
