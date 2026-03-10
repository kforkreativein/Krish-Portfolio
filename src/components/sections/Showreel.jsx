import { motion } from 'framer-motion'
import { stagger, fadeUp } from '../../constants/animations'
import SectionTitle from '../ui/SectionTitle'
import SectionLabel from '../ui/SectionLabel'
import { useSettings } from '../../hooks/useContent'

export default function Showreel({ siteContent }) {
    const { data: settings, loading: settingsLoading } = useSettings()
    const loading = settingsLoading

    const headingLines = siteContent?.showreel_heading ? siteContent?.showreel_heading?.split('\n') : ["My Best", "Work in Motion"]
    const reelTitle = siteContent?.showreel_title || "2026 Creative Showreel"
    const reelSubtext = siteContent?.showreel_subtext || "A dynamic collection of my best video work"

    const extractYoutubeId = (url) => {
        if (!url) return null
        const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/)
        return m ? m[1] : null
    }

    const extractDriveId = (url) => {
        if (!url) return null
        const m = url.match(/\/file\/d\/([^/]+)/)
        return m ? m[1] : null
    }

    const videoUrl = siteContent?.showreel_video_url || settings?.showreel_youtube_url || settings?.showreel_drive_url
    const youtubeId = extractYoutubeId(videoUrl)
    const driveId = extractDriveId(videoUrl)

    const renderMedia = () => {
        if (youtubeId) {
            return (
                <div className="absolute inset-0 w-full h-full bg-black">
                    <iframe
                        className="w-full h-full border-none"
                        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                        title="Showreel"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )
        }

        if (driveId) {
            return (
                <div className="absolute inset-0 w-full h-full bg-black">
                    <iframe
                        className="w-full h-full border-none"
                        src={`https://drive.google.com/file/d/${driveId}/preview`}
                        title="Showreel"
                        allow="autoplay"
                        allowFullScreen
                    />
                </div>
            )
        }

        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-bg-3 to-bg group cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
                    <div className="w-[300px] h-[300px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(200,241,59,0.15), transparent 70%)', animation: 'glowPulse 3s ease-in-out infinite' }} />
                </div>
                <button className="relative z-10 w-[76px] h-[76px] rounded-full bg-accent flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-300 ease-out shadow-[0_0_40px_rgba(200,241,59,0.3)] mb-6 cursor-pointer">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            </div>
        )
    }

    return (
        <section id="showreel" className="bg-bg-2 px-[var(--pad-side)]" style={{ paddingTop: 'var(--pad-showreel-t)', paddingBottom: 'var(--pad-showreel-b)' }}>
            <div className="max-w-[1440px] mx-auto">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={stagger}
                    className="mb-12"
                >
                    <motion.div variants={fadeUp} className="mb-6">
                        <SectionLabel>Showreel</SectionLabel>
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
                >
                    <motion.div variants={fadeUp} className="w-full max-w-4xl mx-auto rounded-[12px] md:rounded-[24px] overflow-hidden border border-strong bg-black aspect-video relative shadow-2xl">
                        {!loading && renderMedia()}
                    </motion.div>
                    <motion.div variants={fadeUp} className="mt-6 text-center">
                        <h3 className="font-heading text-[22px] md:text-[28px] font-bold text-text tracking-tight">{reelTitle}</h3>
                        <p className="font-body text-[14px] md:text-[15px] text-text-muted mt-2">{reelSubtext}</p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
