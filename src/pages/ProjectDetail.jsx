import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PhoneCard from '../components/ui/PhoneCard'

export default function ProjectDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const scrollContainerRef = useRef(null);

    const reels = project?.project_reels || [];

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // 1. Fetch Project independently
                const { data: projData, error: projErr } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('slug', slug)
                    .single()

                if (projErr || !projData) {
                    console.error('Error fetching project:', projErr)
                    navigate('/')
                    return
                }

                // 2. Fetch Reels independently to avoid join crash
                const { data: reelsData } = await supabase
                    .from('project_reels')
                    .select('*')
                    .eq('project_id', projData.id)
                    .order('sort_order', { ascending: true })

                projData.project_reels = reelsData || []
                setProject(projData)
            } catch (err) {
                console.error('Failed to load:', err)
                navigate('/')
            } finally {
                setLoading(false)
            }
        }
        fetchProject()
    }, [slug, navigate])

    useEffect(() => {
        if (reels.length <= 1 || isPaused) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % reels.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [reels.length, isPaused]);

    useEffect(() => {
        if (scrollContainerRef.current && reels.length > 0) {
            const activeChild = scrollContainerRef.current.children[activeIndex];
            if (activeChild) {
                activeChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeIndex, reels.length]);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="text-accent font-body tracking-widest uppercase text-sm animate-pulse">Loading Project...</div>
            </div>
        )
    }

    if (!project) return null

    const { client_name, role, title, full_content, gallery_urls } = project

    return (
        <div className="bg-bg min-h-screen text-text font-body">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="max-w-[1200px] mx-auto px-5 md:px-8">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-text-muted hover:text-text transition-colors mb-12 text-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Back
                    </button>

                    <div className="border-b border-strong pb-12 mb-12">
                        <h1 className="font-heading font-bold text-[clamp(40px,6vw,72px)] md:text-[64px] text-text leading-[1] tracking-tight mb-8">
                            {title}
                        </h1>
                        <div className="flex flex-wrap gap-x-16 gap-y-6">
                            <div>
                                <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Client</p>
                                <p className="font-medium">{client_name || project.category}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Role</p>
                                <p className="font-medium">{role || 'Creative Direction'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Auto-scrolling Carousel */}
                    {reels.length > 0 && (
                        <div className="-mx-5 md:-mx-12 mt-8 mb-20">
                            <div
                                ref={scrollContainerRef}
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                                className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 md:gap-8 pt-6 pb-10 px-5 md:px-12 w-full items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                            >
                                {reels.map((reel, idx) => (
                                    <PhoneCard
                                        key={reel.id || idx}
                                        project={{
                                            ...project,
                                            video_url: reel.video_url,
                                            thumbnail_url: reel.thumbnail_url,
                                            source_url: reel.instagram_url || reel.video_url,
                                            instagram_url: reel.instagram_url
                                        }}
                                        isActive={activeIndex === idx}
                                        idx={idx}
                                        onActivate={setActiveIndex}
                                    />
                                ))}
                                <div className="shrink-0 w-1 md:w-4"></div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 lg:gap-24 mb-24">
                        <div>
                            <h2 className="font-heading font-bold text-[clamp(28px,4vw,40px)] text-text leading-[1.1] tracking-tight">
                                Project Overview
                            </h2>
                        </div>
                        <div className="font-body text-[16px] md:text-[18px] text-text-muted leading-[1.8] tracking-wide max-w-3xl whitespace-pre-wrap">
                            {full_content || project.description}
                        </div>
                    </div>

                    {/* Gallery */}
                    {gallery_urls && gallery_urls.length > 0 && (
                        <div className="flex flex-col gap-12">
                            <h2 className="font-heading font-bold text-[32px]">Gallery</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {gallery_urls.map((url, i) => (
                                    <div key={i} className="rounded-[16px] overflow-hidden border border-strong bg-bg-2">
                                        <img src={url} alt={`Gallery ${i + 1}`} width={800} height={1000} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}