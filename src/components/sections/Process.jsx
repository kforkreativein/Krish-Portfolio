import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stagger, fadeUp } from '../../constants/animations'
import SectionTitle from '../ui/SectionTitle'
import SectionLabel from '../ui/SectionLabel'
import { useProcessSteps } from '../../hooks/useContent'
import { useTheme } from '../../hooks/useTheme'

const defaultProcessSteps = [
    { id: 'discovery', number: '01', title: 'Discovery Call', description: 'We talk about your brand, goals, and audience. No fluff — clarity first.', icon_light_url: '', icon_dark_url: '' },
    { id: 'strategy', number: '02', title: 'Strategy & Plan', description: 'A custom content or editing strategy built around your platform and growth targets.', icon_light_url: '', icon_dark_url: '' },
    { id: 'execute', number: '03', title: 'Create & Execute', description: 'High-quality content and edits delivered on time with obsessive attention to detail.', icon_light_url: '', icon_dark_url: '' },
    { id: 'scale', number: '04', title: 'Review & Scale', description: 'Track results, optimize from data, and scale what works. Growth is a system.', icon_light_url: '', icon_dark_url: '' }
]

const ProcessCard = ({ number, title, description, iconLightUrl, iconDarkUrl, isActive, theme }) => {
    const iconSrc = theme === 'dark'
        ? (iconLightUrl || iconDarkUrl)
        : (iconDarkUrl || iconLightUrl)

    return (
        <motion.div
            variants={fadeUp}
            className={`glass border rounded-[24px] p-6 md:p-[28px] lg:p-10 min-h-0 md:min-h-[260px] flex flex-col group hover:-translate-y-1 hover:border-accent/40 hover:shadow-accent transition-all duration-700 z-10 relative
                ${isActive ? 'border-accent shadow-accent scale-[1.01]' : 'border-border scale-100'}
            `}
        >
            <div className="flex justify-between items-start mb-8">
                <div className="glass px-3 py-1 rounded-[100px] flex items-center justify-center">
                    <span className="font-heading font-bold text-[11px] tracking-widest text-gray-400">{number}</span>
                </div>

                <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center bg-accent/10 border transition-all duration-700 group-hover:scale-110 
                        ${isActive ? 'border-accent/30 scale-110' : 'border-white/5 scale-100'}
                    `}
                >
                    {iconSrc ? (
                        <img src={iconSrc} alt={`${title} icon`} width={24} height={24} className="w-6 h-6 object-contain" />
                    ) : (
                        <span className="w-2 h-2 rounded-full bg-accent" />
                    )}
                </div>
            </div>

            <div className="mt-auto relative z-10">
                <h3 className="font-heading font-bold text-[18px] text-text mb-2 tracking-tight">
                    {title}
                </h3>
                <p className="font-body text-[13px] text-text-muted leading-[1.65]">
                    {description}
                </p>
            </div>

            {/* Active Glow Backdrop */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 rounded-[24px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle at top right, var(--accent-dim), transparent 60%)' }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    )
}

const Process = ({ siteContent }) => {
    const { data: stepsData } = useProcessSteps()
    const { theme } = useTheme()
    const [activeIndex, setActiveIndex] = useState(0)

    const steps = (stepsData && stepsData.length > 0) ? stepsData : defaultProcessSteps
    const headingLines = siteContent?.process_heading ? siteContent?.process_heading?.split('\n') : ["My", "Process"]

    useEffect(() => {
        if (steps.length === 0) return
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % steps.length)
        }, 2000)

        return () => clearInterval(interval)
    }, [steps.length])

    return (
        <section id="process" className="bg-bg px-[var(--pad-side)] relative overflow-hidden" style={{ paddingTop: 'var(--pad-process-t)', paddingBottom: 'var(--pad-process-b)' }}>
            {/* Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full z-0 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--accent-dim), transparent 70%)' }} />

            <div className="max-w-[1440px] mx-auto relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                    className="mb-16"
                >
                    <motion.div variants={fadeUp} className="mb-6">
                        <SectionLabel>How It Works</SectionLabel>
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <SectionTitle dim={headingLines[0]} bold={headingLines[1] || ''} />
                    </motion.div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-[14px]"
                >
                    {(steps || []).map((step, index) => (
                        <ProcessCard
                            key={step.id || `${step.step_number || step.number}-${index}`}
                            number={step.step_number || step.number}
                            title={step.title}
                            description={step.description}
                            iconLightUrl={step.icon_light_url}
                            iconDarkUrl={step.icon_dark_url}
                            isActive={index === activeIndex}
                            theme={theme}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default Process
