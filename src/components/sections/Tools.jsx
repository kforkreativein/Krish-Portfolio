import { motion } from 'framer-motion'
import { stagger, fadeUp } from '../../constants/animations'
import { useTools } from '../../hooks/useContent'
import { Film, Layers, Share2, Bot, UserCircle, Mic, Play, TrendingUp, Wrench } from 'lucide-react'

const categoryIconMap = {
    'VIDEO': Film,
    'DESIGN': Layers,
    'SOCIAL': Share2,
    'AI': Bot,
    'AI AVATAR': UserCircle,
    'AI VOICE': Mic,
    'AI VIDEO': Play,
    'MARKETING': TrendingUp,
}

function ToolIcon({ tool }) {
    if (tool.icon_url) {
        return <img src={tool.icon_url} alt={tool.name} className="w-[28px] h-[28px] object-contain" />
    }
    const cat = (tool.category || '').toUpperCase().trim()
    const Icon = categoryIconMap[cat] || Wrench
    return <Icon size={22} strokeWidth={1.75} className="text-text-muted" />
}

const ToolsSkeleton = () => (
    <div className="flex flex-wrap justify-center gap-[12px] w-full max-w-[900px]">
        {[...Array(9)].map((_, i) => (
            <div
                key={i}
                className="w-[200px] h-[58px] rounded-[14px] bg-bg-3 animate-pulse shrink-0"
                style={{
                    border: '1px solid var(--border)'
                }}
            />
        ))}
    </div>
)

export default function Tools({ siteContent }) {
    const { data: toolsData, loading } = useTools()
    const headingLines = siteContent?.tools_heading ? siteContent?.tools_heading?.split('\n') : ['Tools I', 'Work With']
    const uniqueTools = (toolsData || []).filter((tool, index, all) => {
        const key = tool?.id || `${tool?.name || ''}-${tool?.category || ''}`
        return all.findIndex((candidate) => {
            const candidateKey = candidate?.id || `${candidate?.name || ''}-${candidate?.category || ''}`
            return candidateKey === key
        }) === index
    })

    return (
        <section id="stack" className="bg-bg-2 px-[var(--pad-side)]" style={{ paddingTop: 'var(--pad-stack-t)', paddingBottom: 'var(--pad-stack-b)' }}>
            <div className="max-w-[1200px] mx-auto flex flex-col items-center">
                <div style={{ marginBottom: '52px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            width: '28px',
                            height: '2px',
                            background: 'var(--accent)'
                        }} />
                        <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: 'var(--accent)',
                            fontFamily: 'Syne, sans-serif'
                        }}>
                            Stack
                        </span>
                    </div>
                    <div style={{ lineHeight: 1.1 }}>
                        <div style={{
                            fontSize: 'clamp(40px, 6vw, 88px)',
                            fontWeight: '800',
                            fontFamily: 'Syne, sans-serif',
                            color: 'var(--text)',
                            display: 'block'
                        }} className="text-[#2D2D2D] dark:text-[#FFFFF0]">
                            {headingLines[0]}
                        </div>
                        <div style={{
                            fontSize: 'clamp(40px, 6vw, 88px)',
                            fontWeight: '800',
                            fontFamily: 'Syne, sans-serif',
                            color: 'var(--text)',
                            display: 'block'
                        }} className="text-[#2D2D2D] dark:text-[#FFFFF0]">
                            {headingLines[1] || ''}
                        </div>
                    </div>
                </div>

                {loading ? <ToolsSkeleton /> : (
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.04
                                }
                            }
                        }}
                        className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-[10px] md:gap-[12px] w-full md:max-w-[900px]"
                    >
                        {(uniqueTools || []).map((tool) => (
                            <motion.div
                                key={tool.id || `${tool?.name || 'tool'}-${tool?.category || 'uncategorized'}`}
                                variants={fadeUp}
                                whileHover={{ y: -3 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="flex items-center gap-[10px] rounded-[14px] px-[14px] md:px-[16px] lg:px-[20px] py-[12px] lg:py-[14px] transition-all duration-200 cursor-pointer min-w-0 md:min-w-[160px] lg:min-w-[200px]"
                                style={{
                                    backgroundColor: 'var(--glass-bg)',
                                    border: '1px solid var(--border)',
                                    flex: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--accent-border)';
                                    e.currentTarget.style.backgroundColor = 'var(--accent-dim)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
                                }}
                            >
                                <div className="w-[28px] h-[28px] md:w-[36px] md:h-[36px] flex items-center justify-center shrink-0">
                                    <ToolIcon tool={tool} />
                                </div>
                                <span className="font-body text-[12px] md:text-[13px] lg:text-[14px] font-medium text-text truncate">{tool.name}</span>
                                <span className="hidden md:block font-body text-[9px] md:text-[10px] text-text-muted uppercase tracking-wider ml-auto pl-2 md:pl-4 whitespace-nowrap">{tool.category}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    )
}
