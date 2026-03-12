import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX, ExternalLink } from 'lucide-react'
import { getYouTubeId } from '../../utils/videoUtils'

function getYouTubeThumbnail(id) {
    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
}

/**
 * Unified self-contained media player.
 * Accepts a `reel` object: { video_url, youtube_url, thumbnail_url, instagram_url, drive_url }
 *
 * YouTube  → thumbnail by default; iframe mounts on hover/active, unmounts on leave/deactivate
 * Direct   → native <video> with self-managed play/pause/mute/seek controls
 * Instagram only → thumbnail + tap-to-open
 * Fallback → thumbnail or solid bg
 */
export default function VideoPlayer({
    reel,
    isActive = false,
    showCaption = false,
    showLabel = false,
    forceMuted = false,
}) {
    const videoRef = useRef(null)
    const [hovered, setHovered] = useState(false)
    const [iframeReady, setIframeReady] = useState(false)
    const [localMuted, setLocalMuted] = useState(forceMuted)
    const [isIntersecting, setIsIntersecting] = useState(false)
    const [actionIcon, setActionIcon] = useState(null) // 'play', 'pause', 'mute', 'unmute'

    const triggerActionIcon = (iconStr) => {
        setActionIcon(iconStr)
        setTimeout(() => setActionIcon(null), 600)
    }

    const handleLeftTap = (e) => {
        e.stopPropagation()
        e.preventDefault()
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play().catch(()=>{})
                triggerActionIcon('play')
            } else {
                videoRef.current.pause()
                triggerActionIcon('pause')
            }
        }
    }

    const handleRightTap = (e) => {
        e.stopPropagation()
        e.preventDefault()
        setLocalMuted(m => {
            const newMute = !m;
            triggerActionIcon(newMute ? 'mute' : 'unmute');
            if (videoRef.current) videoRef.current.muted = newMute;
            return newMute;
        })
    }

    const ytId = reel?.youtube_url ? getYouTubeId(reel.youtube_url) : null
    const isYouTube = !!ytId

    let videoSrc = reel?.video_url
    if (!videoSrc && reel?.drive_url) {
        const match = reel.drive_url.match(/\/d\/([^/?]+)/)
        if (match) videoSrc = `https://drive.google.com/uc?export=download&id=${match[1]}`
    }

    const instagramUrl = reel?.instagram_url
    const thumbnail = reel?.thumbnail_url || (ytId ? getYouTubeThumbnail(ytId) : null)

    // YouTube: mount/unmount iframe when isActive changes
    useEffect(() => {
        if (!isYouTube) return
        if (isActive) setIframeReady(true)
        else setIframeReady(false)
    }, [isActive, isYouTube])

    // Direct video: play/pause when isActive changes
    useEffect(() => {
        if (isYouTube || !videoRef.current) return
        if (isActive) {
            videoRef.current.muted = false
            videoRef.current.play().catch(() => {
                // Browser blocked unmuted autoplay — fallback to muted
                videoRef.current.muted = true
                videoRef.current.play().catch(() => { })
            })
        } else {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
    }, [isActive, isYouTube])

    // Direct video: pause when scrolled out of view
    useEffect(() => {
        if (isYouTube || !videoRef.current) return
        const el = videoRef.current
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting)
                if (!entry.isIntersecting) el.pause()
            },
            { threshold: 0.5 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [isYouTube])

    const handleMouseEnter = () => {
        setHovered(true)
        if (isYouTube) {
            setIframeReady(true)
        } else if (videoRef.current) {
            // Pause all other videos on the page first
            document.querySelectorAll('video').forEach(v => {
                if (v !== videoRef.current) v.pause()
            })
            // Force unmute then play; fall back to muted if browser policy blocks it
            videoRef.current.muted = false
            videoRef.current.play().catch((err) => {
                if (err.name === 'NotAllowedError') {
                    videoRef.current.muted = true
                    videoRef.current.play().catch(() => { })
                }
            })
        }
    }

    const handleMouseLeave = () => {
        setHovered(false)
        if (isYouTube) {
            if (!isActive) setIframeReady(false)
        } else if (videoRef.current) {
            // Only pause if this video is not intersecting (not center of viewport)
            if (!isIntersecting) {
                videoRef.current.pause()
            }
        }
    }

    // ── YouTube ──────────────────────────────────────────────────────────────
    if (isYouTube) {
        const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${localMuted ? 1 : 0}&loop=1&playlist=${ytId}&controls=0&playsinline=1&rel=0&modestbranding=1`

        return (
            <div
                className="w-full h-full relative bg-black group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Thumbnail — shown when iframe not mounted */}
                {!iframeReady && (
                    thumbnail
                        ? <img
                            src={thumbnail}
                            alt={reel.title || 'YouTube video'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                                if (e.target.src.includes('maxresdefault')) {
                                    e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                                }
                            }}
                        />
                        : <div className="w-full h-full bg-bg-3" />
                )}

                {/* Centered play icon — only when not hovering and not playing */}
                {!hovered && !iframeReady && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </div>
                    </div>
                )}

                {/* YouTube iframe — mounted on hover or active; unmounted on leave/deactivate */}
                {iframeReady && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <iframe
                            key={`yt-${ytId}-${localMuted}`}
                            src={embedUrl}
                            className="absolute inset-0 w-full h-full"
                            style={{ transform: 'scale(1.35)', transformOrigin: 'center' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube video"
                        />
                    </div>
                )}

                {/* Tap-to-unmute badge — always visible when muted (for touch devices) */}
                {localMuted && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setLocalMuted(false) }}
                        className="absolute bottom-14 right-3 z-40 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white pointer-events-auto group-hover:hidden"
                        aria-label="Tap to unmute"
                    >
                        <VolumeX size={14} />
                    </button>
                )}

                {/* Custom controls bar — visible on hover via group classes */}
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-xl z-30 flex items-center gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIframeReady(v => !v) }}
                        className="w-7 h-7 rounded-full border border-white/30 flex flex-shrink-0 items-center justify-center text-white hover:bg-white/20 transition"
                        aria-label={iframeReady ? 'Pause video' : 'Play video'}
                    >
                        {iframeReady ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setLocalMuted(m => !m) }}
                        className="w-7 h-7 rounded-full border border-white/30 flex flex-shrink-0 items-center justify-center text-white hover:bg-white/20 transition"
                        aria-label={localMuted ? 'Unmute video' : 'Mute video'}
                    >
                        {localMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <div className="flex-1 h-1 bg-white/30 rounded-lg" />
                    <span className="text-white text-[9px] font-mono tracking-wider flex-shrink-0 pr-1">
                        Live
                    </span>
                </div>

                {/* Caption overlay */}
                {showCaption && (reel?.title || reel?.caption) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent pt-16 pb-3 px-4 z-10 pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                        {reel.title && <p className="font-heading font-bold text-[13px] text-white leading-tight">{reel.title}</p>}
                        {reel.caption && <p className="font-body text-[11px] text-white/80 mt-1 leading-snug line-clamp-2">{reel.caption}</p>}
                    </div>
                )}
            </div>
        )
    }

    // ── Direct video ─────────────────────────────────────────────────────────
    if (videoSrc) {
        return (
            <div
                className="w-full h-full relative bg-black group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <video
                    ref={videoRef}
                    src={videoSrc}
                    poster={thumbnail || undefined}
                    className="w-full h-full object-cover work-video"
                    loop
                    muted={localMuted}
                    playsInline
                    webkit-playsinline="true"
                    autoPlay={isActive}
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen"
                    preload="metadata"
                >
                    <track kind="captions" />
                </video>

                {/* Invisible Interaction Overlays */}
                <div 
                    className="absolute inset-y-0 left-0 w-1/2 z-20 cursor-pointer"
                    onClick={handleLeftTap}
                    aria-label="Toggle Play/Pause"
                />
                <div 
                    className="absolute inset-y-0 right-0 w-1/2 z-20 cursor-pointer"
                    onClick={handleRightTap}
                    aria-label="Toggle Mute/Unmute"
                />

                {/* Transient Action Icon */}
                <div 
                    className={`absolute inset-0 flex items-center justify-center z-30 pointer-events-none transition-opacity duration-300 ${actionIcon ? 'opacity-100' : 'opacity-0'}`}
                >
                    {actionIcon && (
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg">
                            {actionIcon === 'play' && <Play size={28} className="fill-white ml-1" />}
                            {actionIcon === 'pause' && <Pause size={28} className="fill-white" />}
                            {actionIcon === 'mute' && <VolumeX size={28} />}
                            {actionIcon === 'unmute' && <Volume2 size={28} />}
                        </div>
                    )}
                </div>

                {/* Instagram / external link — visible on hover */}
                {hovered && instagramUrl && (
                    <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute top-4 right-4 z-40 bg-black/60 backdrop-blur-md text-white/90 rounded-full font-medium flex items-center justify-center hover:bg-black/80 transition-all pointer-events-auto ${showLabel ? 'px-3 py-1.5 text-xs gap-1.5' : 'w-9 h-9'}`}
                        aria-label={showLabel ? 'Open Post' : 'View on Instagram'}
                    >
                        <ExternalLink size={16} />
                        {showLabel && 'Open Post'}
                    </a>
                )}

                {/* Caption overlay */}
                {showCaption && (reel?.title || reel?.caption) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent pt-16 pb-3 px-4 z-10 pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-200">
                        {reel.title && <p className="font-heading font-bold text-[13px] text-white leading-tight">{reel.title}</p>}
                        {reel.caption && <p className="font-body text-[11px] text-white/80 mt-1 leading-snug line-clamp-2">{reel.caption}</p>}
                    </div>
                )}
            </div>
        )
    }

    // ── Instagram tap-to-open (no video, no YouTube) ─────────────────────────
    if (instagramUrl) {
        return (
            <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full block relative bg-black"
                onClick={(e) => e.stopPropagation()}
            >
                {thumbnail
                    ? <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-bg-3" />
                }
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                </div>
            </a>
        )
    }

    // ── Thumbnail fallback ───────────────────────────────────────────────────
    return thumbnail
        ? <img src={thumbnail} alt="" className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-bg-3" />
}
