import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Volume2, VolumeX, Play, Pause, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings, useSiteContent } from '../hooks/useContent'
import { fadeUp, stagger } from '../constants/animations'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ContactModal from '../components/ui/ContactModal'
import Button from '../components/ui/Button'
import ReelCard from '../components/ui/ReelCard'


function LoadingSkeleton() {
    return (
        <div className="bg-bg min-h-screen">
            <div className="max-w-[1200px] mx-auto px-5 md:px-6 pt-[100px] md:pt-[120px] pb-[60px] md:pb-[80px]">
                <div className="h-4 w-24 bg-bg-3 rounded animate-pulse mb-10" />
                <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-start">
                    <div className="flex flex-col gap-4">
                        <div className="h-3 w-20 bg-bg-3 rounded animate-pulse" />
                        <div className="h-16 w-3/4 bg-bg-3 rounded animate-pulse" />
                        <div className="h-4 w-full bg-bg-3 rounded animate-pulse mt-4" />
                        <div className="h-4 w-5/6 bg-bg-3 rounded animate-pulse" />
                        <div className="h-4 w-4/5 bg-bg-3 rounded animate-pulse" />
                    </div>
                    <div className="w-[220px] h-[390px] bg-bg-3 rounded-[20px] animate-pulse shrink-0" />
                </div>
            </div>
        </div>
    )
}

function NotFound({ onBack }) {
    return (
        <div className="bg-bg min-h-screen flex flex-col items-center justify-center text-center px-6">
            <p className="font-heading font-bold text-[80px] text-text-muted leading-none mb-4">404</p>
            <p className="font-body text-[18px] text-text-muted mb-8">Project not found.</p>
            <Button onClick={onBack} variant="ghost">← Go Back</Button>
        </div>
    )
}

export default function ProjectPage({ onOpenModal, settings: settingsProp }) {
    const { slug } = useParams()
    const navigate = useNavigate()
    const { data: settingsFetched } = useSettings()
    const { data: siteContent } = useSiteContent()
    const settings = settingsProp || settingsFetched
    const [project, setProject] = useState(null)
    const [reels, setReels] = useState([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    // const [isModalOpen, setIsModalOpen] = useState(false) // Removed to use global onOpenModal from App.jsx

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('slug', slug)
                .single()

            if (error || !data) {
                setNotFound(true)
                setLoading(false)
                return
            }

            setProject(data)

            const { data: reelData } = await supabase
                .from('project_reels')
                .select('*')
                .eq('project_id', data.id)
                .neq('is_active', false)
                .order('sort_order', { ascending: true })

            setReels(reelData || [])
            setLoading(false)
        }
        load()
    }, [slug])

    if (loading) return (
        <>
            <Navbar onOpenModal={onOpenModal} />
            <LoadingSkeleton />
        </>
    )

    if (notFound) return (
        <>
            <Navbar onOpenModal={onOpenModal} />
            <NotFound onBack={() => navigate(-1)} />
        </>
    )

    const services = project.services_provided || []
    const description = project.full_description || project.full_content || project.description

    const projectHeroReel = project ? {
        id: 'hero',
        project_id: project.id,
        title: project.title || 'Project Showcase',
        caption: project.description || '',
        video_url: project.video_url || reels.find(r => r.video_url)?.video_url || null,
        thumbnail_url: project.thumbnail_url || reels.find(r => r.thumbnail_url)?.thumbnail_url || null,
        instagram_url: project.instagram_url
    } : null;

    return (
        <div className="bg-bg min-h-screen text-text font-body">
            <Navbar onOpenModal={onOpenModal} />

            {/* Hero */}
            <section className="max-w-[1200px] mx-auto px-[var(--pad-side)]" style={{ paddingTop: 'var(--pad-project-t)', paddingBottom: 'var(--pad-project-b)' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 min-h-[44px] font-body text-[14px] text-text-muted hover:text-text transition-colors mb-10 group"
                    aria-label="Go back to previous page"
                >
                    <span className="group-hover:-translate-x-1 transition-transform duration-200 inline-block">←</span>
                    Back
                </button>

                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-start"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    {/* Left Column */}
                    <motion.div variants={fadeUp}>
                        {project.category && (
                            <span className="inline-block font-body text-[12px] font-bold uppercase tracking-[0.2em] text-accent mb-5">
                                {project.category}
                            </span>
                        )}
                        <h1
                            className="font-heading font-extrabold text-text leading-[1.05] mb-7 text-[clamp(28px,8vw,40px)] md:text-[clamp(40px,6vw,80px)]"
                        >
                            {project.title}
                        </h1>

                        {description && (
                            <p className="font-body text-[16px] md:text-[17px] text-text-muted leading-[1.75] mb-8 max-w-[560px]">
                                {description}
                            </p>
                        )}

                        {project.results && (
                            <div className="mb-8">
                                <p className="font-body text-[12px] font-bold uppercase tracking-[0.2em] text-text-dim mb-3">Results</p>
                                <p className="font-body text-[15px] text-text-muted leading-[1.7]">{project.results}</p>
                            </div>
                        )}

                        {services.length > 0 && (
                            <div className="mb-10">
                                <p className="font-body text-[12px] font-bold uppercase tracking-[0.2em] text-text-dim mb-3">Services</p>
                                <div className="flex flex-wrap gap-2">
                                    {(services || []).map((s, i) => (
                                        <span
                                            key={i}
                                            className="font-body text-[12px] text-text-muted border border-border bg-bg-3"
                                            style={{ borderRadius: '100px', padding: '6px 14px' }}
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(project.client_name || project.role) && (
                            <div className="pt-8 border-t border-border flex gap-10">
                                {project.client_name && (
                                    <div>
                                        <p className="font-body text-[11px] font-bold uppercase tracking-[0.15em] text-text-dim mb-1">Client</p>
                                        <p className="font-heading font-semibold text-[15px] text-text">{project.client_name}</p>
                                    </div>
                                )}
                                {project.role && (
                                    <div>
                                        <p className="font-body text-[11px] font-bold uppercase tracking-[0.15em] text-text-dim mb-1">Role</p>
                                        <p className="font-heading font-semibold text-[15px] text-text">{project.role}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {project.profile_url && (
                            <div className="mt-8">
                                <Button
                                    href={project.profile_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Instagram Profile →
                                </Button>
                            </div>
                        )}
                    </motion.div>

                    {/* Right Column — Video / Thumbnail */}
                    <motion.div variants={fadeUp} className="hidden lg:flex justify-center mt-6 lg:mt-0">
                        {projectHeroReel && (
                            <div className="w-full max-w-[280px] lg:max-w-[320px]">
                                <ReelCard
                                    reel={projectHeroReel}
                                    className="rounded-[24px] border-2 border-accent/20 shadow-2xl"
                                    autoPlay={true}
                                    showCaption={false}
                                    showLabel={false}
                                />
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </section>

            {/* Reels Grid */}
            {reels.length > 0 && (
                <section className="max-w-[1200px] mx-auto px-5 py-6 md:py-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={stagger}
                    >
                        <motion.p
                            variants={fadeUp}
                            className="font-body text-[12px] font-bold uppercase tracking-[0.2em] text-text-dim mb-8"
                        >
                            Selected Reels
                        </motion.p>
                        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(reels || []).map(reel => (
                                <ReelCard key={reel.id} reel={reel} />
                            ))}
                        </motion.div>
                    </motion.div>
                </section>
            )}

            {/* CTA */}
            <section className="max-w-[1200px] mx-auto px-5 md:px-6 py-12 md:py-[60px]">
                <div className="bg-bg-2 rounded-[32px] border border-accent/10 py-16 px-8 text-center shadow-[0_0_50px_rgba(204,255,0,0.08)]">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={stagger}
                    >
                        <motion.h2
                            variants={fadeUp}
                            className="font-heading font-extrabold text-text mb-4"
                            style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
                        >
                            Like what you see?
                        </motion.h2>
                        <motion.p variants={fadeUp} className="font-body text-[16px] text-text-muted mb-8 max-w-[440px] mx-auto leading-[1.7]">
                            Let's build something that performs — not just looks good.
                        </motion.p>
                        <motion.div variants={fadeUp} className="flex justify-center">
                            <Button onClick={onOpenModal} className="w-full sm:w-auto px-10 py-4 text-lg font-extrabold group relative overflow-hidden bg-accent text-black hover:scale-105 transition-all duration-300">
                                {settings?.floating_cta_text || siteContent?.floating_cta_text || "Let's Talk"}
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
