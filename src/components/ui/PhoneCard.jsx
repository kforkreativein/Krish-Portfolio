import { ExternalLink } from 'lucide-react'
import VideoPlayer from './VideoPlayer'

export default function PhoneCard({ project, isActive, onActivate, idx, onOpenModal, settings, siteContent }) {
    const handleCardClick = () => {
        if (onActivate && typeof idx === 'number') {
            onActivate(idx)
        }
    }

    const reel = {
        video_url: project?.video_url,
        youtube_url: project?.youtube_url,
        thumbnail_url: project?.thumbnail_url,
        instagram_url: project?.instagram_url,
        drive_url: project?.drive_url,
    }

    const hasMedia = reel.video_url || reel.youtube_url || reel.thumbnail_url || reel.drive_url

    return (
        <div
            onClick={handleCardClick}
            className={`relative shrink-0 rounded-[32px] overflow-hidden cursor-pointer transition-all duration-500 group aspect-[9/16] bg-bg-3
            ${isActive
                    ? 'w-[280px] md:w-[320px] lg:w-[350px] scale-100 shadow-[0_0_40px_rgba(204,255,0,0.15)] border-2 border-accent z-10'
                    : 'w-[280px] md:w-[320px] lg:w-[350px] scale-[0.9] border border-border opacity-40 hover:opacity-80 z-0'}`}
        >
            {/* iPhone Hardware Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[24px] bg-black rounded-b-[16px] z-30 flex items-center justify-center">
                <div className="w-[25%] h-[4px] bg-white/20 rounded-full" />
            </div>

            {/* Media Layer */}
            <div className="w-full h-full relative z-10 bg-black">
                {hasMedia ? (
                    <VideoPlayer reel={reel} isActive={isActive} />
                ) : (
                    <div
                        className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
                        style={{ background: project.gradient || 'var(--bg-3)' }}
                    >
                        <span className="text-7xl mb-6 block drop-shadow-lg">{project.emoji || '🎬'}</span>
                        <h4 className="font-heading font-extrabold text-white text-2xl mb-4 drop-shadow-md leading-tight">{project.title}</h4>
                        <p className="font-body text-white/70 text-sm mb-8 leading-relaxed">{project.description}</p>
                        {project.isCTA && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenModal();
                                }}
                                className="px-8 py-3 bg-white text-black font-heading font-extrabold text-sm rounded-full transform transition-transform hover:scale-105 active:scale-95 shadow-xl"
                            >
                                {settings?.floating_cta_text || siteContent?.floating_cta_text || "Let's Talk"}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Instagram external link overlay */}
            {project?.instagram_url && (
                <a
                    href={project.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-4 right-4 z-30 bg-black/60 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-accent hover:text-black transition-all shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                    aria-label="View on Instagram"
                >
                    <ExternalLink size={16} />
                </a>
            )}
        </div>
    )
}
