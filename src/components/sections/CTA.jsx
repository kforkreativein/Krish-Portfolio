import { motion } from 'framer-motion'
import { stagger, fadeUp } from '../../constants/animations'
import Button from '../ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { useSettings } from '../../hooks/useContent'

const floatingTags = [
    { text: 'Low Engagement? Fixed', top: '10%', left: '-10%', rotate: -6, isAccent: false },
    { text: 'No Content Strategy', top: '65%', left: '-5%', rotate: 4, isAccent: true },
    { text: 'Videos Not Converting', top: '80%', left: '20%', rotate: -3, isAccent: false },
    { text: 'No Time to Edit', top: '15%', right: '-8%', rotate: 5, isAccent: false },
    { text: 'Inconsistent Posting', top: '75%', right: '15%', rotate: -5, isAccent: false },
    { text: 'Need AI Automation', top: '50%', right: '-12%', rotate: 8, isAccent: true },
]

export default function CTA({ onOpenModal, siteContent, settings: settingsProp }) {
    const { theme } = useTheme()
    const { data: settingsFetched } = useSettings()
    const settings = settingsProp || settingsFetched

    const headingLines = siteContent?.cta_heading ? siteContent?.cta_heading?.split('\n') : ["Your Competitors Are Already", "Using AI Content"]
    const pills = ((siteContent?.cta_pills || []).length > 0) ? (siteContent?.cta_pills || []).map((p, i) => ({
        text: p,
        top: ['5%', '70%', '85%', '10%', '80%', '45%'][i % 6],
        left: ['2%', '5%', '15%', null, null, null][i % 6],
        right: [null, null, null, '2%', '10%', '5%'][i % 6],
        rotate: [-6, 4, -3, 5, -5, 8][i % 6],
        isAccent: i === 1 || i === 5
    })) : floatingTags.map(tag => ({
        ...tag,
        left: tag.left === '-10%' ? '2%' : tag.left === '-5%' ? '5%' : tag.left,
        right: tag.right === '-8%' ? '2%' : tag.right === '-12%' ? '5%' : tag.right,
        top: tag.top === '10%' ? '5%' : tag.top === '15%' ? '10%' : tag.top,
    }))

    return (
        <section id="cta" className="relative bg-bg px-[var(--pad-side)] overflow-hidden flex items-center justify-center text-center" style={{ paddingTop: 'var(--pad-cta-t)', paddingBottom: 'var(--pad-cta-b)' }}>
            {/* Radial Glow Background */}
            <div
                className="absolute w-[800px] h-[800px] rounded-full z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, var(--accent-dim), transparent 68%)',
                    animation: 'glowPulse 7s ease-in-out infinite',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}
            />

            <div className="relative z-10 w-full max-w-[1000px] mx-auto">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                    className="glass-strong rounded-[24px] p-8 sm:p-12 md:p-[72px] flex flex-col items-center justify-center relative shadow-2xl"
                >
                    <motion.h2
                        variants={fadeUp}
                        className="font-heading font-extrabold text-[clamp(32px,9vw,52px)] md:text-[clamp(40px,6vw,80px)] leading-[1] tracking-[-0.04em] mb-6 mt-4"
                    >
                        <span className="text-text-muted block">{headingLines[0]}</span>
                        <span className="text-text block">{headingLines[1] || ''}</span>
                    </motion.h2>

                    <motion.p
                        variants={fadeUp}
                        className="font-body text-[15px] md:text-[18px] leading-[1.7] max-w-[480px] mb-12 text-center"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        {siteContent?.cta_subheading || "Don't get left behind. Let's build your content system today."}
                    </motion.p>

                    <motion.div variants={fadeUp} className="relative z-20 w-full sm:w-auto">
                        <Button onClick={onOpenModal} className="w-full sm:w-auto px-[8px] py-[3px] text-[10px] sm:px-10 sm:py-4 sm:text-lg font-extrabold border border-white/10" style={{ minHeight: 24 }}>
                            {settings?.floating_cta_text || "Let's Talk"}
                        </Button>
                    </motion.div>

                    {/* Floating Tags (hidden on mobile) */}
                    <div className="hidden md:block absolute inset-0 pointer-events-none overflow-visible">
                        {(pills || []).map((tag, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: tag.rotate }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.6, delay: 0.3 + (i * 0.1), ease: [0.22, 1, 0.36, 1] }}
                                className={`absolute px-4 py-2 rounded-full font-body text-[12px] font-medium whitespace-nowrap shadow-lg ${tag.isAccent ? 'bg-accent text-white dark:text-black' : ''}`}
                                style={{
                                    top: tag.top,
                                    left: tag.left,
                                    right: tag.right,
                                    color: tag.isAccent ? (theme === 'dark' ? '#000000' : '#ffffff') : (theme === 'dark' ? '#cccccc' : '#444444'),
                                    background: tag.isAccent ? 'var(--accent)' : 'var(--glass-bg)',
                                    border: tag.isAccent ? 'none' : '1px solid var(--border-strong)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                }}
                            >
                                {tag.text}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <style>{`
        @keyframes glowPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.7; }
        }
`}</style>
        </section>
    )
}
