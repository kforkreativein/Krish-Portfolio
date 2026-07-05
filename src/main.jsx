import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { inject as injectAnalytics } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'

// Load analytics only after user has given consent
function initAnalytics() {
  const consent = localStorage.getItem('cookie_consent')
  if (consent === 'accepted') {
    injectAnalytics({ mode: 'production' })
    injectSpeedInsights()
  }
}

// Init on load (if already consented) and when consent is granted in-tab or another tab
initAnalytics()
window.addEventListener('storage', (e) => {
  if (e.key === 'cookie_consent' && e.newValue === 'accepted') initAnalytics()
})
window.addEventListener('cookie-consent-accepted', initAnalytics)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Remove initial loader after React mounts
setTimeout(() => {
  const loader = document.getElementById('initial-loader')
  if (loader) {
    loader.style.opacity = '0'
    setTimeout(() => loader.remove(), 400)
  }
}, 100)
