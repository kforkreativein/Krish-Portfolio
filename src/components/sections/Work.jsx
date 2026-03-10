import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionTitle from '../ui/SectionTitle'
import SectionLabel from '../ui/SectionLabel'
import Button from '../ui/Button'
import PhoneCard from '../ui/PhoneCard'
import { supabase } from '../../lib/supabase'

export default function Work({ onOpenModal, settings }) {
    const navigate = useNavigate()
    const [projectsData, setProjectsData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(true)
    const [isInView, setIsInView] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const sectionRef = useRef(null)
    const scrollRef = useRef(null)
    const isScrollingProgrammatically = useRef(false)
    const scrollTimeout = useRef(null)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const visible = entry.isIntersecting
                setIsInView(visible)
                setIsPaused(!visible)
            },
            { threshold: 0.2 } // Trigger when 20% visible
        )

        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        async function fetchProjects() {
            try {
                setLoading(true)
                // 1. Fetch projects independently
                const { data: projs, error: pErr } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true })

                if (pErr) throw pErr

                // 2. Fetch reels independently to completely avoid the Supabase Join crash
                const { data: reels, error: rErr } = await supabase
                    .from('project_reels')
                    .select('*')

                if (rErr) throw rErr

                // 3. Merge them safely
                if (projs) {
                    const formattedData = projs.map(project => {
                        const projectReels = (reels || []).filter(r => r.project_id === project.id)
                        projectReels.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

                        const featured = project.featured_reel_id
                            ? projectReels.find(r => r.id === project.featured_reel_id)
                            : projectReels[0]

                        return {
                            ...project,
                            project_reels: projectReels,
                            video_url: featured?.video_url || project.video_url,
                            thumbnail_url: featured?.thumbnail_url || project.thumbnail_url,
                            source_url: featured?.instagram_url || featured?.video_url || project.video_url,
                            instagram_url: featured?.instagram_url || project.instagram_url,
                        }
                    })
                    setProjectsData(formattedData)
                }
            } catch (err) {
                console.error("Error fetching projects:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [])

    const handleScroll = () => {
        if (isScrollingProgrammatically.current || !scrollRef.current) return
        const items = scrollRef.current.children
        const containerCenter = scrollRef.current.offsetWidth / 2
        const scrollLeft = scrollRef.current.scrollLeft
        let closestIndex = 0
        let minDistance = Infinity

        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const itemCenter = item.offsetLeft + item.offsetWidth / 2 - scrollLeft
            const distance = Math.abs(containerCenter - itemCenter)
            if (distance < minDistance) {
                minDistance = distance
                closestIndex = i
            }
        }
        if (closestIndex !== activeIndex) setActiveIndex(closestIndex)
    }

    const scrollToIndex = (index) => {
        if (!scrollRef.current) return
        const items = scrollRef.current.children
        if (items[index]) {
            isScrollingProgrammatically.current = true
            setActiveIndex(index)
            const containerWidth = scrollRef.current.offsetWidth
            const cardWidth = items[index].offsetWidth
            const target = items[index].offsetLeft - (containerWidth / 2) + (cardWidth / 2)
            scrollRef.current.scrollTo({ left: target, behavior: 'smooth' })
            clearTimeout(scrollTimeout.current)
            scrollTimeout.current = setTimeout(() => { isScrollingProgrammatically.current = false }, 800)
        }
    }

    useEffect(() => {
        if (!projectsData || projectsData.length === 0 || isPaused || !isInView) return
        const intervalId = setInterval(() => {
            const nextIndex = (activeIndex + 1) % projectsData.length
            scrollToIndex(nextIndex)
        }, 6000)
        return () => clearInterval(intervalId)
    }, [activeIndex, projectsData, isPaused, isInView])

    const activeProject = projectsData && projectsData.length > 0 ? projectsData[activeIndex] : null

    return (
        <section ref={sectionRef} id="work" className="bg-bg px-[var(--pad-side)] relative overflow-hidden" style={{ paddingTop: 'var(--pad-work-t)', paddingBottom: 'var(--pad-work-b)' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full z-0 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--accent-dim), transparent 70%)' }} />

            <div className="max-w-[1440px] mx-auto relative z-10">
                <div className="mb-8 lg:mb-6">
                    <div className="mb-6"><SectionLabel>Portfolio</SectionLabel></div>
                    <div>
                        <SectionTitle dim={isMobile ? "" : "Selected"} bold="Work" />
                        <p className="font-body text-[14px] text-text-muted mt-3">Mostly Reels. Always scroll-stopping.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-accent font-body flex justify-center py-20 animate-pulse">Loading projects directly from database...</div>
                ) : !projectsData || projectsData.length === 0 ? (
                    <div className="text-text-muted font-body flex justify-center py-20">No active projects found. Check database connection.</div>
                ) : (
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-14 lg:gap-8 min-h-[600px]">

                        <div className="w-full lg:w-[40%] flex flex-col justify-center items-center lg:items-start text-center lg:text-left self-center z-20 mb-12 lg:mb-0 transition-opacity duration-300">
                            {activeProject && (
                                <div key={activeIndex} className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                                        <span className="bg-bg-3 border border-strong rounded-full px-3 py-1 font-body font-medium text-[11px] text-accent tracking-widest uppercase">
                                            {activeProject.category || 'Portfolio'}
                                        </span>
                                    </div>
                                    <h3 className="font-heading font-bold text-[clamp(28px,8vw,40px)] md:text-[clamp(28px,4vw,52px)] text-text leading-[1.1] tracking-tight mb-4">
                                        {activeProject.title}
                                    </h3>
                                    <p className="font-body text-[15px] md:text-[16px] text-text-muted leading-[1.7] max-w-[400px] mb-8">
                                        {activeProject.description}
                                    </p>

                                    <div className="flex flex-col gap-4">
                                        {activeProject.is_cta ? (
                                            <Button onClick={onOpenModal} className="w-full md:w-auto justify-center font-extrabold">
                                                {settings?.floating_cta_text || "Let's Talk"}
                                            </Button>
                                        ) : activeProject.slug ? (
                                            <Button onClick={() => navigate(`/work/${activeProject.slug}`)} variant="ghost" className="w-full md:w-auto justify-center">See Full Project →</Button>
                                        ) : (
                                            <Button variant="ghost" disabled className="w-full md:w-auto justify-center" style={{ opacity: 0.4, pointerEvents: 'none' }}>Coming Soon</Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-full lg:w-[60%] flex-col gap-6 flex" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
                            <div ref={scrollRef} onScroll={handleScroll} className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-6 md:gap-8 pb-8 pt-4 px-5 md:px-8 lg:px-[52px] scroll-px-5 md:scroll-px-8 lg:scroll-px-[52px] no-scrollbar cursor-grab active:cursor-grabbing relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {projectsData.map((project, idx) => (
                                    <div key={project.id || idx} className="flex flex-col items-center gap-6">
                                        <PhoneCard project={project} idx={idx} isActive={activeIndex === idx} onActivate={scrollToIndex} onOpenModal={onOpenModal} />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center lg:justify-end gap-3 px-6 lg:px-0">
                                <button onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-strong flex items-center justify-center text-text hover:bg-white/5 hover:border-text transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-strong focus:outline-none">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                                </button>
                                <button onClick={() => scrollToIndex(Math.min(projectsData.length - 1, activeIndex + 1))} disabled={activeIndex === projectsData.length - 1} className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-strong flex items-center justify-center text-text hover:bg-white/5 hover:border-text transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-strong focus:outline-none">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}