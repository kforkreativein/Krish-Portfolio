import { motion } from 'framer-motion'
import { stagger, fadeUp } from '../../constants/animations'
import SectionTitle from '../ui/SectionTitle'
import SectionLabel from '../ui/SectionLabel'
import { useTestimonials } from '../../hooks/useContent'

const TestimonialCard = ({ quote, author_name, author_role, author_initial, photo_url, stars = 5 }) => {
    return (
        <motion.div
            variants={fadeUp}
            className="glass border border-border-strong rounded-[24px] p-5 md:p-8 flex flex-col h-full group hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_0_32px_rgba(200,241,59,0.08)] transition-all duration-300 relative z-10"
        >
            <div className="flex items-start justify-between mb-6">
                <span className="font-heading font-extrabold text-[48px] text-accent leading-none opacity-40 select-none font-serif">
                    "
                </span>
                <div className="flex gap-1" role="img" aria-label={`${stars} stars`}>
                    {[...Array(stars)].map((_, i) => (
                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-accent">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    ))}
                </div>
            </div>

            <p className="font-body text-[15px] md:text-[13px] text-text-muted leading-[1.85] mb-8 flex-1 italic">
                {quote}
            </p>

            <div className="flex items-center gap-4 mt-auto">
                {photo_url ? (
                    <img src={photo_url} alt={author_name} width={42} height={42} className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-full object-cover border border-strong shrink-0" />
                ) : (
                    <div className="w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-full border border-strong flex items-center justify-center shrink-0 bg-gradient-to-br from-bg-4 to-bg-2">
                        <span className="font-heading font-bold text-[14px] text-text">
                            {author_initial}
                        </span>
                    </div>
                )}

                <div className="flex flex-col">
                    <span className="font-heading font-bold text-[15px] text-text mb-0.5">{author_name}</span>
                    <span className="font-body text-[12px] text-text-dim">{author_role}</span>
                </div>
            </div>
        </motion.div>
    )
}

const TestimonialsSkeleton = () => (
    <div className="flex gap-6 overflow-hidden mt-10">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-bg-3 rounded-[24px] w-[340px] shrink-0 h-[280px] animate-pulse" />
        ))}
    </div>
)

const Testimonials = ({ siteContent }) => {
    const { data: testimonialsData, loading } = useTestimonials()

    const headingLines = siteContent?.testimonials_heading ? siteContent?.testimonials_heading?.split('\n') : ["What", "Clients Say"]

    // Build a non-mutating list for marquee padding.
    const baseItems = Array.isArray(testimonialsData) ? testimonialsData : []
    const scrollItems = [...baseItems]
    if (baseItems.length > 0 && baseItems.length < 6) {
        const dummyNeeded = 6 - baseItems.length
        for (let i = 0; i < dummyNeeded; i++) {
            const base = baseItems[i % baseItems.length]
            scrollItems.push({
                ...base,
                id: `${base?.id || 'testimonial'}-dummy-${i}`
            })
        }
    }

    // Duplicate string of elements to fulfill infinite loop width math
    const infiniteArray = [...scrollItems, ...scrollItems, ...scrollItems, ...scrollItems]

    return (
        <section id="testimonials" className="bg-bg-2 overflow-hidden relative" style={{ paddingTop: 'var(--pad-testimonials-t)', paddingBottom: 'var(--pad-testimonials-b)' }}>
            {/* Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full z-0 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(200,241,59,0.04), transparent 70%)' }} />

            <div className="w-full relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                    className="mb-12 px-5 md:px-8 lg:px-[52px] max-w-[1440px] mx-auto"
                >
                    <motion.div variants={fadeUp} className="mb-6">
                        <SectionLabel>Social Proof</SectionLabel>
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <SectionTitle dim={headingLines[0]} bold={headingLines[1] || ''} />
                    </motion.div>
                </motion.div>

                {loading ? (
                    <div className="px-5 md:px-8 lg:px-[52px] max-w-[1440px] mx-auto">
                        <TestimonialsSkeleton />
                    </div>
                ) : (
                    <>
                        {/* Mobile: single column stacked grid */}
                        <div className="block md:hidden px-5 mt-10">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.1 }}
                                variants={stagger}
                                className="grid gap-4"
                            >
                                {(testimonialsData || []).map((testimonial, i) => (
                                    <div key={testimonial.id || `testimonial-${i}`}>
                                        <TestimonialCard {...testimonial} />
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Desktop: marquee scroll */}
                        <div className="hidden md:flex relative w-full overflow-hidden group">
                            {/* Fading Edges */}
                            <div className="absolute left-0 top-0 bottom-0 w-[120px] bg-gradient-to-r from-bg-2 to-transparent z-20 pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-[120px] bg-gradient-to-l from-bg-2 to-transparent z-20 pointer-events-none" />

                            <div className="flex w-max animate-testimonial-scroll gap-6 whitespace-nowrap px-4 hover:pause-none py-4">
                                {(infiniteArray || []).map((testimonial, i) => (
                                    <div key={`${testimonial.id || i}-${i}`} className="w-[280px] sm:w-[340px] shrink-0 whitespace-normal">
                                        <TestimonialCard {...testimonial} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
        @keyframes testimonial-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-25% - 6px)); }
        }
        .animate-testimonial-scroll {
          animation: testimonial-scroll 45s linear infinite;
        }
      `}</style>
        </section>
    )
}

export default Testimonials
