import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stagger, fadeUp } from '../../constants/animations'
import SectionTitle from '../ui/SectionTitle'
import SectionLabel from '../ui/SectionLabel'
import { useServices } from '../../hooks/useContent'

const serviceGradients = [
    'linear-gradient(135deg, #111e22, #173740)',
    'linear-gradient(135deg, #201a0a, #423011)',
    'linear-gradient(135deg, #1f1122, #3b1740)',
    'linear-gradient(135deg, #221111, #401717)',
]

const ServicesSkeleton = () => (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mt-[52px]">
        <div className="w-full lg:w-[60%] flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="py-8">
                    <div className="h-8 w-48 bg-bg-3 rounded animate-pulse" />
                </div>
            ))}
        </div>
        <div className="w-full lg:w-[40%]">
            <div className="w-full aspect-[4/5] rounded-[24px] bg-bg-3 animate-pulse" />
        </div>
    </div>
)

export default function Services({ siteContent }) {
    const [openIndex, setOpenIndex] = useState(0)
    const { data: servicesData, loading } = useServices()

    const headingLines = siteContent?.services_heading ? siteContent?.services_heading?.split('\n') : ["Services", "I Offer"]

    return (
        <section id="services" className="bg-bg-2 px-[var(--pad-side)] relative overflow-hidden" style={{ paddingTop: 'var(--pad-services-t)', paddingBottom: 'var(--pad-services-b)' }}>
            {/* Radial Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full z-0 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--accent-dim), transparent 70%)', transform: 'translate(30%, -30%)' }} />

            <div className="max-w-[1440px] mx-auto relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={stagger}
                    className="mb-12"
                >
                    <motion.div variants={fadeUp} className="mb-6">
                        <SectionLabel>What I Do</SectionLabel>
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <SectionTitle dim={headingLines[0]} bold={headingLines[1] || ''} />
                    </motion.div>
                </motion.div>

                {loading ? <ServicesSkeleton /> : (
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={stagger}
                        className="flex flex-col md:flex-row md:justify-between gap-8 md:gap-12 lg:gap-20 mt-[32px] md:mt-[52px]"
                    >
                        {/* Left Column: Accordion */}
                        <div className="w-full md:w-[60%] lg:w-[60%] flex flex-col flex-1">
                            {(servicesData || []).map((service, index) => {
                                const isOpen = openIndex === index
                                const points = service.bullet_points || service.bullets || []
                                const tags = Array.isArray(service.tags)
                                    ? service.tags
                                    : (typeof service.tags === 'string'
                                        ? service.tags.split(',').map((t) => t.trim()).filter(Boolean)
                                        : [])
                                return (
                                    <motion.div
                                        key={service.id || `${service?.number || index}-${service?.title || 'service'}`}
                                        variants={fadeUp}
                                        className="py-2"
                                    >
                                        <button
                                            onClick={() => setOpenIndex(index)}
                                            className="w-full py-5 md:py-8 flex items-center justify-between group text-left min-h-[44px]"
                                        >
                                            <div className="flex items-center gap-6">
                                                <span className="font-heading text-[14px] text-text-dim w-6">
                                                    {service.number || `0${index + 1} `}
                                                </span>
                                                <h3 className={`font-heading font-bold text-[20px] lg:text-[clamp(20px,4vw,40px)] leading-none transition-colors duration-300 ${isOpen ? 'text-accent' : 'text-text group-hover:text-text-muted'}`}>
                                                    {service.title}
                                                </h3>
                                            </div>

                                            <motion.div
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                className={`w-11 h-11 rounded-full flex items-center justify-center border transition-colors duration-300 shrink-0 ${isOpen ? 'border-accent text-accent' : 'border-strong text-text group-hover:bg-white/5'}`}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M6 9l6 6 6-6" />
                                                </svg>
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pb-8 pl-12 pr-4">
                                                        {service?.description && (
                                                            <p className="font-body text-[14px] md:text-[15px] leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                                                                {service.description}
                                                            </p>
                                                        )}
                                                        {(tags || []).length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {(tags || []).map((tag, tagIndex) => (
                                                                    <span
                                                                        key={`${service.id || index}-tag-${tagIndex}`}
                                                                        className="text-[11px] font-body px-2.5 py-1 rounded-full border border-border bg-bg-3 text-text-muted"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <ul className="flex flex-col gap-3">
                                                            {(points || []).map((point, i) => (
                                                                <li key={i} className="flex items-start gap-3">
                                                                    <span className="text-accent text-[18px] leading-tight">·</span>
                                                                    <span className="font-body text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{point}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )
                            })}
                        </div>

                        {/* Right Column: Sticky Visual Panel */}
                        <div className="hidden md:block md:w-[35%] lg:w-[40%] shrink-0">
                            <div className="sticky top-32 w-full aspect-[4/5] md:aspect-auto md:h-[320px] lg:aspect-[4/5] lg:h-auto rounded-[24px] overflow-hidden shadow-2xl glass">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={openIndex}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                                        className="absolute inset-0 flex items-center justify-center group"
                                        style={{ background: serviceGradients[openIndex % serviceGradients.length] }}
                                    >
                                        {servicesData[openIndex]?.image_url ? (
                                            <img
                                                src={servicesData[openIndex].image_url}
                                                alt={servicesData[openIndex].title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="bg-bg/20 backdrop-blur-md border border-white/10 p-6 rounded-[20px] transition-transform duration-500 group-hover:scale-105">
                                                <span className="font-heading font-bold text-white text-[24px] tracking-tight opacity-90 drop-shadow-lg">
                                                    Visual {openIndex + 1} Placeholder
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    )
}
