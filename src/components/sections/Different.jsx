import { motion } from 'framer-motion'
import { stagger, fadeUp } from '../../constants/animations'
import { useSettings } from '../../hooks/useContent'

export default function Different({ siteContent }) {
    const { data: settings } = useSettings()

    const headingLines = siteContent?.diff_heading ? siteContent?.diff_heading?.split('\n') : ["What makes me", "different?"]

    return (
        <section id="different" className="bg-bg px-[var(--pad-side)]" style={{ paddingTop: 'var(--pad-different-t)', paddingBottom: 'var(--pad-different-b)' }}>
            <div className="max-w-[1200px] mx-auto">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={stagger}
                >
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-col md:flex-row items-center md:items-stretch relative gap-10 md:gap-8 lg:gap-[52px]"
                        style={{
                            backgroundColor: 'var(--bg-3)',
                            border: '1px solid var(--border)',
                            borderRadius: '24px',
                            padding: 'clamp(32px, 5vw, 52px)',
                        }}
                    >
                        {/* LEFT SIDE — image area */}
                        <div className="w-full md:w-[45%] flex-shrink-0 relative z-10 flex mb-10 md:mb-0">
                            <div
                                className="w-full h-full min-h-[300px] md:min-h-0 md:max-h-[340px] overflow-hidden rounded-[20px] flex items-center justify-center relative"
                                style={{
                                    backgroundColor: 'var(--bg)',
                                    border: '1px solid var(--border-strong)',
                                    maxHeight: '100%', // Reset
                                }}
                            >
                                {/* Mobile max-height via CSS class, since inline styles don't do media queries easily */}
                                <style>{`
                                    @media (max-width: 767px) {
                                        #different-img-container {
                                            max-height: 260px;
                                            aspect-ratio: 1 / 1;
                                        }
                                        #different-cta-btn {
                                            width: 100%;
                                            min-height: 52px;
                                            justify-content: center;
                                        }
                                    }
                                `}</style>
                                <div id="different-img-container" className="absolute inset-0 w-full h-full flex items-center justify-center">
                                    {settings?.different_photo_url || settings?.avatar_image_url ? (
                                        <img
                                            src={settings?.different_photo_url || settings?.avatar_image_url}
                                            alt="Different"
                                            width={500}
                                            height={340}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{
                                                background: 'var(--bg-2)'
                                            }}
                                        >
                                            <span className="text-accent/50 font-body text-sm tracking-widest uppercase">
                                                Image Placeholder
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE — content */}
                        <div className="w-full md:w-[55%] flex flex-col items-center md:items-start text-center md:text-left justify-center relative z-10">
                            <h2
                                className="font-heading"
                                style={{
                                    fontWeight: 700,
                                    fontSize: 'clamp(24px, 8vw, 48px)',
                                    lineHeight: 1.1,
                                    color: 'var(--text)'
                                }}
                            >
                                {(headingLines || []).map((line, i) => (
                                    <span key={i} className={`block ${i === 0 ? 'mb-1' : 'italic'}`} style={i === 1 ? { color: 'var(--accent)' } : {}}>
                                        {line}
                                    </span>
                                ))}
                            </h2>

                            <p
                                className="font-body max-w-sm md:max-w-[500px] mx-auto md:mx-0"
                                style={{
                                    fontSize: '16px',
                                    color: 'var(--text-muted)',
                                    lineHeight: '1.8',
                                    marginTop: '20px',
                                }}
                            >
                                {siteContent?.diff_text || "I don't just edit videos — I build content systems. Every frame, every caption, every AI automation is engineered to make your brand grow. I think like a strategist and execute like a creative."}
                            </p>

                            <a
                                id="different-cta-btn"
                                href="#work"
                                className="font-body inline-flex items-center justify-center transition-all duration-300"
                                style={{
                                    marginTop: '32px',
                                    border: '1px solid var(--border-strong)',
                                    borderRadius: '100px',
                                    padding: '14px 28px',
                                    color: 'var(--text)',
                                    textDecoration: 'none',
                                    fontSize: '15px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.color = 'var(--accent)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                                    e.currentTarget.style.color = 'var(--text)';
                                }}
                            >
                                {siteContent?.about_cta_text || 'Browse My Work →'}
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
