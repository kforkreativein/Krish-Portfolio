// ─── Stats ────────────────────────────────────────────────────────────────────

export const stats = [
  { value: 20, suffix: '+', label: 'Clients' },
  { value: 3, suffix: '+', label: 'Years Exp.' },
  { value: 100, suffix: '+', label: 'Videos' },
  { value: 5, suffix: '+', label: 'AI Systems' },
]

// ─── Services ─────────────────────────────────────────────────────────────────

export const services = [
  {
    id: 'video-editing',
    number: '01',
    icon: '🎬',
    title: 'Video Editing',
    description:
      'Cinematic edits, Reels, YouTube videos, and motion graphics that hook viewers in the first 3 seconds. Every frame is intentional. Every cut has a reason.',
    tags: ['Premiere Pro', 'After Effects', 'Reels', 'YT Shorts'],
  },
  {
    id: 'social-media',
    number: '02',
    icon: '📱',
    title: 'Social Media Management',
    description:
      'Full-stack management — content calendar, captions, scheduling, analytics, and a growth strategy built around your brand. Not just posting. Growing.',
    tags: ['Instagram', 'Facebook', 'LinkedIn', 'Strategy'],
  },
  {
    id: 'ai-automation',
    number: '03',
    icon: '🤖',
    title: 'AI Automation',
    description:
      'AI avatars, voice cloning, automated content pipelines, and ChatGPT-powered lead gen systems. Your brand running 24/7 — without you in the room.',
    tags: ['Heygen', 'Eleven Labs', 'ChatGPT', 'Claude'],
  },
  {
    id: 'graphic-design',
    number: '04',
    icon: '🎨',
    title: 'Graphic Design',
    description:
      'Brand identity, social graphics, thumbnails, and posters. Visual content so sharp it makes people stop mid-scroll and actually look at what your brand has to say.',
    tags: ['Canva AI', 'Figma', 'Branding'],
  },

]

// ─── Projects (Bento Grid) ────────────────────────────────────────────────────

export const projects = [
  {
    id: 'wellness',
    size: 'hero',
    category: 'Social Media · AI Avatar · Automation',
    title: 'Krish Wellness Center',
    description:
      'Full social media management + AI avatar built with Heygen & Eleven Labs. Scripted an 80-minute Hinglish content system with 50+ chapters for fully automated video output.',
    gradient: 'linear-gradient(135deg, #071a10 0%, #0e3320 40%, #1a5232 70%, #2d6a4f 100%)',
    emoji: '🌿',
    video_url: 'https://cdn.pixabay.com/video/2023/10/26/186632-878544974_large.mp4',
    isCTA: false,
  },
  {
    id: 'computer',
    size: 'medium',
    category: 'Social Media · Web Development',
    title: 'Krish Computer',
    description:
      'Social strategy, product captions & Shopify redesign for a 15-year-old Vadodara tech retail brand.',
    gradient: 'linear-gradient(135deg, #0d0d1f, #16213e, #1a1a40)',
    emoji: '💻',
    isCTA: false,
  },
  {
    id: 'sparsh',
    size: 'medium',
    category: 'Social Media Growth',
    title: 'Sparsh Beauty Salon',
    description:
      'Instagram & Facebook management — doubled organic reach, drove real walk-in clients from content alone.',
    gradient: 'linear-gradient(135deg, #1a0a0a, #2d1010, rgba(255,92,53,0.12))',
    emoji: '💅',
    isCTA: false,
  },
  {
    id: 'aeon',
    size: 'small',
    category: 'Brand Campaign',
    title: 'Aeon Shoes — The Martian Architect',
    description: 'Sci-fi brand campaign & creative direction — The Martian Architect.',
    gradient: 'linear-gradient(135deg, #120820, #3d1058, #7b2fa8)',
    emoji: '👟',
    isCTA: false,
  },
  {
    id: 'shortfilm',
    size: 'small',
    category: 'Video Production',
    title: 'Animated Short Film',
    description: 'Animated short film — character design & AI voiceovers.',
    gradient: 'linear-gradient(135deg, #0a0a18, #0e1a30, #1a2840)',
    emoji: '🎬',
    isCTA: false,
  },
  {
    id: 'cta',
    size: 'small',
    category: null,
    title: 'Your Brand Could Be Here',
    description: "Let's create something scroll-stopping together.",
    gradient: null,
    emoji: '✦',
    isCTA: true,
  },
]

// ─── Clients ──────────────────────────────────────────────────────────────────

export const clients = [
  {
    id: 'wellness',
    emoji: '🌿',
    name: 'Krish Wellness',
    type: 'Nutrition & Lifestyle',
    isCTA: false,
  },
  {
    id: 'computer',
    emoji: '💻',
    name: 'Krish Computer',
    type: 'Tech Retail · Since 2008',
    isCTA: false,
  },
  {
    id: 'sparsh',
    emoji: '💅',
    name: 'Sparsh Beauty',
    type: 'Beauty & Wellness',
    isCTA: false,
  },
  {
    id: 'aeon',
    emoji: '👟',
    name: 'Aeon Shoes',
    type: 'Footwear Brand',
    isCTA: false,
  },
  {
    id: 'next',
    emoji: '✦',
    name: 'Your Brand?',
    type: 'Could be next →',
    isCTA: true,
  },
]

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const testimonials = [
  {
    id: 'hemali',
    quote:
      'Krish completely transformed our social media. Instagram engagement went up 3x in two months. The AI avatar he built is like having a digital version of me available 24/7.',
    name: 'Hemali Kevalia',
    role: 'Wellness Coach · Krish Wellness Center',
    initial: 'H',
  },
  {
    id: 'mehul',
    quote:
      'Product posts are clear, captions are on point, and the Shopify site looks super professional. Sales have noticeably improved since working with Krish.',
    name: 'Mehul Chhatrala',
    role: 'Founder · Krish Computer',
    initial: 'M',
  },
  {
    id: 'sparsh',
    quote:
      'Finally someone who gets local business. Our salon reach doubled and we started getting real walk-ins from Instagram. Always on time with that extra creative touch.',
    name: 'Sparsh Salon Team',
    role: 'Beauty Salon · Vadodara',
    initial: 'S',
  },
]

// ─── Process Steps ────────────────────────────────────────────────────────────

export const processSteps = [
  {
    id: 'discovery',
    number: '01',
    title: 'Discovery Call',
    description:
      'We talk about your brand, goals, and audience. No fluff — clarity first, execution second.',
  },
  {
    id: 'strategy',
    number: '02',
    title: 'Strategy & Plan',
    description:
      'I build a custom content or editing strategy tailored to your platform, niche, and growth targets.',
  },
  {
    id: 'execute',
    number: '03',
    title: 'Create & Execute',
    description:
      'High-quality content, edits, and AI systems — delivered on time with obsessive attention to detail.',
  },
  {
    id: 'scale',
    number: '04',
    title: 'Review & Scale',
    description:
      'Track results, optimize from data, and scale what works. Growth is a system, not a one-time thing.',
  },
]
