import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { stats, services, projects, testimonials, clients } from '../constants/data'

const dedupeById = (items = [], fallbackPrefix = 'item') => {
  const seen = new Set()
  return (items || []).filter((item, index) => {
    const key = item?.id || `${fallbackPrefix}-${item?.name || item?.title || index}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ─── useSettings ─────────────────────────────────────────────────────────────

export function useSettings() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('settings')
        .select('*')

      if (!err && rows) {
        // Convert array of {key, value} objects into a single {key: value} object
        const settingsMap = rows.reduce((acc, row) => {
          acc[row.key] = row.value
          return acc
        }, {})
        console.log('[useSettings] fetched:', settingsMap)
        setData(settingsMap)
      } else if (err) {
        console.error('[useSettings] error:', err)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { data, loading }
}

// ─── useHero ─────────────────────────────────────────────────────────────────

export function useHero() {
  const fallback = {
    stat_clients: stats[0].value,
    stat_years: stats[1].value,
    stat_videos: stats[2].value,
    stat_ai_systems: stats[3].value,
  }

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('hero')
        .select('*')
        .limit(1)
        .single()

      if (err) {
        setError(err)
        setData(fallback)
      } else {
        setData(rows)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { data, loading, error }
}

// ─── useServices ─────────────────────────────────────────────────────────────

export function useServices() {
  const fallback = services.map((s, i) => ({
    id: s.id,
    number: s.number,
    title: s.title,
    description: s.description,
    tags: s.tags,
    bullet_points: s.tags || [],
    is_active: true,
    sort_order: i,
  }))

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (err) {
        setError(err)
        setData(fallback)
      } else {
        const normalized = dedupeById((rows || []).map((row) => ({
          ...row,
          bullet_points: row.bullet_points || row.bullets || [],
        })), 'service')
        setData(normalized.length > 0 ? normalized : fallback)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { data, loading, error }
}

// ─── useProjects ─────────────────────────────────────────────────────────────

export function useProjects() {
  const fallback = projects.map((p, i) => ({
    id: p.id,
    category: p.category,
    title: p.title,
    description: p.description,
    gradient: p.gradient,
    emoji: p.emoji,
    is_cta: p.isCTA,
    is_active: true,
    sort_order: i,
  }))

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('projects')
        .select('*, project_reels(*)')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      console.log("Fetched Projects (Hook):", rows)

      if (err) {
        setError(err)
        setData(fallback)
      } else {
        const uniqueRows = dedupeById(rows || [], 'project')
        setData(uniqueRows.length > 0 ? uniqueRows : fallback)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { data, loading, error }
}

// ─── useTestimonials ─────────────────────────────────────────────────────────

export function useTestimonials() {
  const fallback = testimonials.map((t, i) => ({
    id: t.id,
    quote: t.quote,
    author_name: t.name,
    author_role: t.role,
    author_initial: t.initial,
    stars: 5,
    is_active: true,
    sort_order: i,
  }))

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (err) {
        setError(err)
        setData(fallback)
      } else {
        const uniqueRows = dedupeById(rows || [], 'testimonial')
        setData(uniqueRows.length > 0 ? uniqueRows : fallback)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { data, loading, error }
}

// ─── useClients ──────────────────────────────────────────────────────────────

export function useClients() {
  const fallback = clients.map((c, i) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    logo_url: null,
    is_cta: c.isCTA,
    is_active: true,
    sort_order: i,
  }))

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('clients')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (err) {
        setError(err)
        setData(fallback)
      } else {
        const uniqueRows = dedupeById(rows || [], 'client')
        setData(uniqueRows.length > 0 ? uniqueRows : fallback)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { data, loading, error }
}

// ─── useTools ────────────────────────────────────────────────────────────────

export function useTools() {
  const fallback = [
    { id: 't1', emoji: '🎬', name: 'Premiere Pro', category: 'Video', sort_order: 1 },
    { id: 't2', emoji: '✨', name: 'After Effects', category: 'Video', sort_order: 2 },
    { id: 't3', emoji: '📸', name: 'Photoshop', category: 'Design', sort_order: 3 },
    { id: 't4', emoji: '📱', name: 'Instagram', category: 'Social', sort_order: 4 },
    { id: 't5', emoji: '🤖', name: 'ChatGPT', category: 'AI', sort_order: 5 },
    { id: 't6', emoji: '🎭', name: 'Heygen', category: 'AI Avatar', sort_order: 6 },
    { id: 't7', emoji: '🔊', name: 'Eleven Labs', category: 'AI Voice', sort_order: 7 },
    { id: 't8', emoji: '🎥', name: 'Higgsfield', category: 'AI Video', sort_order: 8 },
    { id: 't9', emoji: '📊', name: 'Meta Ads', category: 'Marketing', sort_order: 9 },
  ]

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('tools')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (err) {
        setError(err)
        setData(fallback)
      } else {
        const uniqueRows = dedupeById(rows || [], 'tool')
        setData(uniqueRows.length > 0 ? uniqueRows : fallback)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { data, loading, error }
}

// ─── useSiteContent ──────────────────────────────────────────────────────────

export function useSiteContent() {
  const fallback = null

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', 1)
        .single()

      if (err) {
        console.error('[useSiteContent] error:', err)
        setError(err)
        setData(fallback)
      } else {
        console.log('[useSiteContent] hidden_sections from DB:', rows?.hidden_sections)
        setData(rows || fallback)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { data, loading, error }
}

// ─── useProcessSteps ─────────────────────────────────────────────────────────

export function useProcessSteps() {
  const fallback = []

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('process_steps')
        .select('*')
        .order('sort_order', { ascending: true })

      if (err) {
        console.error('[useProcessSteps] error:', err)
        setError(err)
        setData(fallback)
      } else {
        setData(dedupeById(rows || fallback, 'process-step'))
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { data, loading, error }
}
