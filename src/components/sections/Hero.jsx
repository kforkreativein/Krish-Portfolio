import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { stagger, fadeUp } from '../../constants/animations'
import useCounter from '../../hooks/useCounter'
import { useHero, useSettings } from '../../hooks/useContent'
import Button from '../ui/Button'

const HeroBadge = ({ text }) => (
    <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-bg-2 border border-border-strong rounded-full px-3 py-1.5 mb-6 opacity-80 backdrop-blur-sm shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="text-[10px] sm:text-[11px] text-text font-body uppercase tracking-wider font-semibold opacity-90">{text || "Available for New Projects"}</span>
    </motion.div>
)

const HeroTitle = ({ part1, part2, part3 }) => {
    return (
        <div
            className="font-heading font-extrabold text-[clamp(40px,11vw,56px)] md:text-[56px] lg:text-[clamp(40px,6vw,80px)] leading-[1.0] md:leading-[0.9] tracking-[-0.04em] mb-6 flex flex-col items-center md:items-start text-center md:text-left w-full"
            style={{ fontFamily: "'Syne', 'Space Grotesk', sans-serif", fontStretch: 'expanded' }}
        >
            <motion.div variants={fadeUp} custom={{ delay: 0.05 }} className="w-full">
                <span className="inline text-transparent bg-clip-text bg-gradient-to-r from-black/40 to-black/60 dark:from-white/40 dark:to-white/60">{part1 || 'I Make Your Brand'}</span>{' '}
                <span className="inline text-black dark:text-white">{part2 || 'Impossible to Scroll Past'}</span>{' '}
                <span className="inline text-accent">{part3 || 'with AI + Video'}</span>
            </motion.div>
        </div>
    )
}

const StatItem = ({ value, label }) => {
    const { count, ref } = useCounter(value)
    return (
        <div ref={ref} className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-[clamp(24px,7vw,32px)] sm:text-[24px] font-heading font-bold text-accent mb-0.5">
                {count}+
            </span>
            <span className="text-[10px] sm:text-[11px] font-body uppercase tracking-widest text-text-muted">{label}</span>
        </div>
    )
}

const HeroStats = ({ heroData }) => {
    const statsConfig = heroData ? [
        { value: heroData.stat_clients, label: 'Clients' },
        { value: heroData.stat_years, label: 'Years Exp.' },
        { value: heroData.stat_videos, label: 'Videos' },
        { value: heroData.stat_ai_systems, label: 'AI Systems' },
    ] : []

    return (
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:flex md:justify-start gap-6 md:gap-8 lg:gap-10 mt-6 md:mt-[48px] w-full max-w-[600px]">
            {(statsConfig || []).map((stat, i) => (
                <StatItem key={i} value={stat.value} label={stat.label} />
            ))}
        </motion.div>
    )
}

const HeroStatsSkeleton = () => (
    <div className="grid grid-cols-2 lg:flex md:justify-start gap-6 md:gap-8 lg:gap-10 mt-6 md:mt-[48px] w-full max-w-[600px]">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
                <div className="h-6 w-12 bg-bg-3 rounded animate-pulse" />
                <div className="h-3 w-16 bg-bg-3 rounded animate-pulse" />
            </div>
        ))}
    </div>
)

const HeroPhotoCard = ({ imageUrl, cardName, cardBadge, cardLocation }) => (
    <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col glass-strong rounded-[24px] overflow-hidden w-full max-w-[280px] md:w-[240px] lg:w-[280px] mx-auto shrink-0 shadow-2xl"
    >
        {/* Photo area — 16:9 */}
        <div className="relative overflow-hidden bg-bg" style={{ aspectRatio: '9/16', borderRadius: '16px 16px 0 0' }}>
            {imageUrl ? (
                <img
                    src={`${imageUrl}?width=800&quality=80&format=webp`}
                    alt="Krish Chhatrala"
                    width={280}
                    height={498}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                    fetchpriority="high"
                />
            ) : (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ background: 'linear-gradient(160deg, #131313 0%, #1a2a1a 50%, #0d1a0d 100%)' }}
                >
                    <Camera size={28} className="text-text-muted" strokeWidth={1.5} />
                    <p className="text-[11px] text-text-dim mt-2">Add photo from admin</p>
                </div>
            )}
        </div>

        {/* Info bar */}
        <div className="border-t border-border px-5 py-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2 md:gap-3">
                <span className="font-heading font-bold text-[15px] text-text leading-none">{cardName || 'Krish Chhatrala'}</span>
                <span
                    className="inline-flex items-center gap-1.5 text-[9px] md:text-[7px] font-bold text-accent uppercase tracking-widest rounded-full border border-accent-border px-2.5 py-1 md:px-2 md:py-1 whitespace-nowrap"
                    style={{ backgroundColor: 'var(--accent-dim)' }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    {cardBadge || 'Open to Projects'}
                </span>
            </div>
            <p className="text-[12px] text-text-muted font-body">{cardLocation || 'Vadodara, Gujarat 🇮🇳'}</p>
        </div>
    </motion.div>
)

const Hero = ({ onOpenModal, siteContent, settings: settingsProp }) => {
    const { data: heroData, loading: heroLoading } = useHero()
    const { data: settingsFetched } = useSettings()
    const settings = settingsProp || settingsFetched

    const cardImageUrl = settings?.hero_photo_url || null
    console.log('[Hero] settings:', settings, '→ cardImageUrl:', cardImageUrl)

    return (
        <section id="hero" className="relative w-full min-h-[80vh] flex items-center px-[var(--pad-side)] overflow-hidden" style={{ paddingTop: 'var(--pad-hero-t)', paddingBottom: 'var(--pad-hero-b)' }}>
            {/* Background layers */}
            <div className="absolute inset-0 z-0 bg-bg" />

            {settings?.hero_bg_url && (
                <div
                    className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-opacity duration-1000 mix-blend-screen"
                    style={{
                        backgroundImage: `url(${settings.hero_bg_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            )}

            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay dark:opacity-[0.03] opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            <div className="absolute inset-0 z-0 opacity-[0.015] dark:opacity-[0.015] opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)', backgroundSize: '72px 72px', maskImage: 'radial-gradient(ellipse at top right, black 40%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at top right, black 40%, transparent 70%)' }} />
            <div className="absolute -top-[100px] -right-[100px] w-[600px] h-[600px] rounded-full z-0 pointer-events-none opacity-50 dark:opacity-100" style={{ background: 'radial-gradient(circle, var(--accent-dim), transparent 60%)', animation: 'glowPulse 8s ease-in-out infinite' }} />
            <div className="absolute -bottom-[100px] -left-[100px] w-[400px] h-[400px] rounded-full z-0 pointer-events-none opacity-30 dark:opacity-100" style={{ background: 'radial-gradient(circle, rgba(160,100,255,0.03), transparent 60%)' }} />

            {/* Content */}
            <motion.div
                className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between md:justify-center gap-8 md:gap-16 lg:gap-16 lg:justify-between"
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {/* Left: text content */}
                <div className="flex flex-col items-center md:items-start justify-center flex-1 min-w-0 w-full md:max-w-[55%] lg:max-w-[55vw] text-center md:text-left">
                    <div className="self-center md:self-start">
                        <HeroBadge text={siteContent?.hero_badge} />
                    </div>
                    <HeroTitle
                        part1={siteContent?.hero_heading_part1}
                        part2={siteContent?.hero_heading_part2}
                        part3={siteContent?.hero_heading_part3}
                    />

                    <motion.div variants={fadeUp} custom={{ delay: 0.20 }} className="max-w-[500px] mt-2">
                        <p className="text-[16px] md:text-sm font-body leading-[1.8] mb-8 md:pr-4 mx-auto md:mx-0 text-text-muted">
                            {siteContent?.hero_subheading || "From Reels that stop thumbs to AI avatars that sell while you sleep — I build content systems for brands that want to grow fast."}
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp} custom={{ delay: 0.25 }} className="flex flex-col gap-4 w-full md:w-auto">
                        <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-[10px] md:gap-4 w-full md:w-auto">
                            <Button onClick={onOpenModal} className="w-full md:w-auto justify-center px-2 py-1 text-[10px] md:px-7 md:py-3.5 md:text-base font-extrabold" style={{ minHeight: 26 }}>
                                {settings?.floating_cta_text || siteContent?.floating_cta_text || "Let's Talk"}
                            </Button>
                            <Button variant="ghost" href="#work" className="w-full md:w-auto justify-center px-2 py-1 text-[10px] md:px-7 md:py-3.5 md:text-base" style={{ minHeight: 26 }}>
                                {siteContent?.hero_secondary_cta || 'View My Work'}
                            </Button>
                        </div>

                        {/* Redesigned Hero Bottom Stats - Relocated & Parsed */}
                        {siteContent?.hero_bottom_stats && (
                            <div className="mt-2 md:mt-4 flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-10">
                                {siteContent.hero_bottom_stats.split('•').map((segment, i) => {
                                    const trimmed = segment.trim();
                                    const firstSpace = trimmed.indexOf(' ');
                                    const value = firstSpace !== -1 ? trimmed.substring(0, firstSpace) : trimmed;
                                    const label = firstSpace !== -1 ? trimmed.substring(firstSpace + 1) : '';

                                    return (
                                        <div key={i} className="flex flex-col items-start gap-0">
                                            <span
                                                className="text-xl md:text-2xl font-heading font-extrabold tracking-tighter"
                                                style={{
                                                    color: 'var(--accent)',
                                                    fontFamily: "'Syne', 'Space Grotesk', sans-serif",
                                                    fontStretch: 'expanded'
                                                }}
                                            >
                                                {value}
                                            </span>
                                            <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right: photo card — shows stacked below on mobile, side by side on md+ */}
                <div className="flex items-center justify-center w-full md:w-auto shrink-0 mt-1 md:mt-3">
                    <HeroPhotoCard
                        imageUrl={cardImageUrl}
                        cardName={siteContent?.hero_card_name}
                        cardBadge={siteContent?.hero_card_badge}
                        cardLocation={siteContent?.hero_card_location}
                    />
                </div>
            </motion.div>

            <style>{`
        @keyframes glowPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }
      `}</style>
        </section>
    )
}

export default Hero
