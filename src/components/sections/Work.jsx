import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionTitle from '../ui/SectionTitle'
import SectionLabel from '../ui/SectionLabel'
import Button from '../ui/Button'
import PhoneCard from '../ui/PhoneCard'
import { useProjects } from '../../hooks/useContent'

export default function Work({ onOpenModal, settings, siteContent }) {
    const navigate = useNavigate()
    const { data: rawProjects, loading } = useProjects()
    const projectsData = rawProjects || []
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const sectionRef = useRef(null)
    const scrollRef = useRef(null)
    const isScrollingProgrammatically = useRef(false)
    const scrollTimeout = useRef(null)
    const hasRunOnce = useRef(false)

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

                // Safety Kill Switch: Global cleanup if section is not visible
                if (!visible) {
                    document.querySelectorAll('video').forEach(v => v.pause())
                }
            },
            { threshold: 0.1 } // More reactive than 0.2
        )

        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
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

    // Auto-scroll: 7s per card, pauses on hover/touch, stops at last slide.
    useEffect(() => {
        let scrollTimer
        let startDelay

        if (isInView && !isPaused && !hasRunOnce.current && projectsData.length > 1) {
            startDelay = setTimeout(() => {
                scrollTimer = setInterval(() => {
                    setActiveIndex(prevIndex => {
                        if (prevIndex >= projectsData.length - 1) {
                            hasRunOnce.current = true
                            clearInterval(scrollTimer)
                            return prevIndex
                        }
                        const next = prevIndex + 1
                        scrollToIndex(next)
                        return next
                    })
                }, 7000)
            }, 1000)
        }

        return () => {
            clearTimeout(startDelay)
            clearInterval(scrollTimer)
        }
    }, [isInView, isPaused, projectsData.length])

    // First-entry init: scroll to card 0 on first visit only.
    useEffect(() => {
        if (!isInView) return
        if (hasRunOnce.current) return   // already completed — keep current position
        if (activeIndex === null) {
            const t = setTimeout(() => {
                setActiveIndex(0)
                scrollToIndex(0)
            }, 50)
            return () => clearTimeout(t)
        }
    }, [isInView])

    const currentIndex = activeIndex

    // Force active slide video playback whenever index or visibility changes.
    useEffect(() => {
        const videos = document.querySelectorAll('.work-video')

        videos.forEach((video, index) => {
            if (index === currentIndex && isInView) {
                video.muted = false
                video.play().catch(() => {
                    video.muted = true
                    video.play().catch((e) => console.log('Complete autoplay block', e))
                })
            } else {
                video.pause()
                video.currentTime = 0
            }
        })
    }, [currentIndex, isInView])

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
                    <div className="flex flex-col md:flex-row md:items-center md:gap-10 lg:gap-12 min-h-0 md:min-h-[620px] lg:min-h-[680px]">

                        {/* Text panel — solid black, never overlays carousel */}
                        <div className="w-full md:w-[38%] lg:w-[40%] md:shrink-0 bg-bg relative z-20 flex flex-col justify-center items-center md:items-start text-center md:text-left mb-10 md:mb-0 md:py-8 lg:py-10 md:pr-4 lg:pr-8">
                            {activeProject && (
                                <div key={activeIndex} className="flex flex-col w-full max-w-[400px] md:max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-5 md:mb-6">
                                        <span className="bg-bg-3 border border-strong rounded-full px-3 py-1 font-body font-medium text-[11px] text-accent tracking-widest uppercase">
                                            {activeProject.category || 'Portfolio'}
                                        </span>
                                    </div>
                                    <h3 className="font-heading font-bold text-[clamp(28px,8vw,40px)] md:text-[clamp(26px,3.5vw,44px)] lg:text-[clamp(28px,4vw,52px)] text-text leading-[1.1] tracking-tight mb-4">
                                        {activeProject.title}
                                    </h3>
                                    <p className="font-body text-[15px] md:text-[16px] text-text-muted leading-[1.7] mb-8">
                                        {activeProject.description}
                                    </p>

                                    <div className="flex flex-col gap-4 w-full md:w-auto">
                                        {activeProject.is_cta ? (
                                            <Button onClick={onOpenModal} className="w-full md:w-auto justify-center font-extrabold">
                                                {settings?.floating_cta_text || siteContent?.floating_cta_text || "Let's Talk"}
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

                        {/* Carousel — contained in its column, no viewport bleed */}
                        <div className="w-full md:w-[62%] lg:w-[60%] md:min-w-0 flex flex-col gap-5 md:gap-6 justify-center [--work-card-half:130px] sm:[--work-card-half:140px] md:[--work-card-half:160px] lg:[--work-card-half:180px]" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
                            <div
                                ref={scrollRef}
                                onScroll={handleScroll}
                                className="flex flex-row overflow-x-auto overscroll-x-contain snap-x snap-mandatory gap-5 sm:gap-6 md:gap-7 lg:gap-8 py-4 md:py-6 w-full pl-[max(0px,calc(50%-var(--work-card-half)))] pr-[max(0px,calc(50%-var(--work-card-half)))] scroll-px-[max(0px,calc(50%-var(--work-card-half)))] no-scrollbar cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-start"
                            >
                                {projectsData.map((project, idx) => (
                                    <div key={project.id || idx} className="flex flex-col items-center snap-center shrink-0">
                                        <PhoneCard
                                            project={project}
                                            idx={idx}
                                            isActive={isInView && activeIndex === idx}
                                            onActivate={scrollToIndex}
                                            onPreviewActivate={setActiveIndex}
                                            onOpenModal={onOpenModal}
                                            settings={settings}
                                            siteContent={siteContent}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center md:justify-end gap-3">
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
