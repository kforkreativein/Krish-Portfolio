import { useRef, useEffect, useState } from 'react'
import { Volume2, VolumeX, ExternalLink, Play, Pause } from 'lucide-react'

export default function PhoneCard({ project, isActive, onActivate, idx }) {
    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [progress, setProgress] = useState(0)

    // Handle auto-play ONLY when this card becomes the center focus
    useEffect(() => {
        if (!videoRef.current) return
        if (isActive) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented:", e))
            setIsPlaying(true)
        } else {
            videoRef.current.pause()
            videoRef.current.currentTime = 0 // Reset video when swiped away
            setIsPlaying(false)
        }
    }, [isActive])

    const togglePlay = (e) => {
        e.stopPropagation()
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play().catch(() => { })
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = (e) => {
        e.stopPropagation()
        setIsMuted(!isMuted)
    }

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const currentProgress = videoRef.current?.duration ? (videoRef.current.currentTime / videoRef.current.duration) * 100 : 0;
        setProgress(currentProgress);
    }

    const handleSeek = (e) => {
        e.stopPropagation()
        e.preventDefault()
        const seekTime = (e.target.value / 100) * videoRef.current.duration
        if (!isNaN(seekTime)) {
            videoRef.current.currentTime = seekTime
            setProgress(e.target.value)
        }
    }

    const handleMouseEnter = () => {
        if (videoRef.current && !isActive) {
            videoRef.current.play().catch(() => { })
            setIsPlaying(true)
        }
    }

    const handleMouseLeave = () => {
        if (videoRef.current && !isActive) {
            videoRef.current.pause()
            setIsPlaying(false)
        }
    }

    const handleCardClick = () => {
        if (onActivate && typeof idx === 'number') {
            onActivate(idx)
        }
    }

    const hasVideo = !!project?.video_url
    const hasThumb = !!project?.thumbnail_url

    return (
        <div
            onClick={handleCardClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                {hasVideo ? (
                    <video
                        ref={videoRef}
                        src={project.video_url}
                        poster={project.thumbnail_url || undefined}
                        className="w-full h-full object-cover"
                        loop
                        muted={isMuted}
                        playsInline
                        onTimeUpdate={handleTimeUpdate}
                    />
                ) : hasThumb ? (
                    <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                        style={{ background: project.gradient || 'var(--bg-3)' }}
                    >
                        <span className="text-6xl mb-4 block drop-shadow-lg">{project.emoji || '🎬'}</span>
                        <span className="font-heading font-bold text-white/90 text-lg drop-shadow-md">{project.title}</span>
                    </div>
                )}
            </div>

            {/* Overlays & Controls */}
            <div className="absolute inset-0 z-20 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 opacity-0 group-hover:opacity-100">

                {/* Top Right External Link (Instagram Profile) */}
                {project?.instagram_url && (
                    <a
                        href={project.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-accent hover:text-black transition-all shadow-lg pointer-events-auto"
                    >
                        <ExternalLink size={16} />
                    </a>
                )}

                {/* Standardized Slim Dock Control Bar */}
                {hasVideo && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-10 px-3 bg-black/60 backdrop-blur-lg rounded-full z-30 flex items-center gap-3 pointer-events-auto">
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-accent transition-colors"
                        >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                        </button>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress || 0}
                            onChange={handleSeek}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-accent"
                        />

                        <button
                            onClick={toggleMute}
                            className="text-white hover:text-accent transition-colors"
                        >
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
