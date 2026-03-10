import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { services, projects, testimonials, clients } from '../constants/data.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Bullets per service (matching visual content in Services section)
const serviceBullets = [
  [
    'Cinematic edits for YouTube, Reels & Shorts',
    'Motion graphics and visual effects',
    'Color grading and sound design',
    'Hook-first editing for maximum retention',
  ],
  [
    'Full content calendar and scheduling',
    'Caption writing and hashtag strategy',
    'Analytics tracking and growth reporting',
    'Platform-specific content strategy',
  ],
  [
    'AI avatar creation with Heygen',
    'Voice cloning with Eleven Labs',
    'Automated content pipelines',
    'ChatGPT-powered lead gen systems',
  ],
  [
    'Brand identity and logo design',
    'Social media graphics and thumbnails',
    'Poster and marketing collateral',
    'Canva AI and Figma workflows',
  ],
]

async function seedHero() {
  const { error } = await supabase.from('hero').insert([{
    stat_clients: 20,
    stat_years: 3,
    stat_videos: 100,
    stat_ai_systems: 5,
  }])
  if (error) console.error('❌ hero:', error.message)
  else console.log('✅ hero seeded')
}

async function seedServices() {
  const rows = services.map((s, i) => ({
    number: s.number,
    title: s.title,
    description: s.description,
    tags: s.tags,
    bullets: serviceBullets[i] || null,
    is_active: true,
    sort_order: i,
  }))
  const { error } = await supabase.from('services').insert(rows)
  if (error) console.error('❌ services:', error.message)
  else console.log('✅ services seeded')
}

async function seedProjects() {
  const rows = projects.map((p, i) => ({
    category: p.category,
    title: p.title,
    description: p.description,
    gradient: p.gradient,
    emoji: p.emoji,
    is_cta: p.isCTA,
    is_active: true,
    sort_order: i,
  }))
  const { error } = await supabase.from('projects').insert(rows)
  if (error) console.error('❌ projects:', error.message)
  else console.log('✅ projects seeded')
}

async function seedTestimonials() {
  const rows = testimonials.map((t, i) => ({
    quote: t.quote,
    author_name: t.name,
    author_role: t.role,
    author_initial: t.initial,
    stars: 5,
    is_active: true,
    sort_order: i,
  }))
  const { error } = await supabase.from('testimonials').insert(rows)
  if (error) console.error('❌ testimonials:', error.message)
  else console.log('✅ testimonials seeded')
}

async function seedClients() {
  const rows = clients.map((c, i) => ({
    name: c.name,
    type: c.type,
    logo_url: null,
    is_cta: c.isCTA,
    is_active: true,
    sort_order: i,
  }))
  const { error } = await supabase.from('clients').insert(rows)
  if (error) console.error('❌ clients:', error.message)
  else console.log('✅ clients seeded')
}

async function main() {
  console.log('🌱 Seeding Supabase...\n')
  await seedHero()
  await seedServices()
  await seedProjects()
  await seedTestimonials()
  await seedClients()
  console.log('\n🎉 Done!')
  process.exit(0)
}

main()
