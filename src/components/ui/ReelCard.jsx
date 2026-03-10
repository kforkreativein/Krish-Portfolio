import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Play, Pause, ExternalLink } from 'lucide-react'

export default function ReelCard({
    reel,
    className = "rounded-[16px] border border-border",
    autoPlay = false,
    showCaption = true,
    showLabel = true
}) {
    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState("0:00")
    const [duration, setDuration] = useState("0:00")

    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(() => { })
            setIsPlaying(true)
        }
    }, [autoPlay])

    const formatTime = (timeInSeconds) => {
        if (isNaN(timeInSeconds)) return "0:00"
        const minutes = Math.floor(timeInSeconds / 60)
        const seconds = Math.floor(timeInSeconds % 60)
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    const togglePlay = (e) => {
        if (e) e.stopPropagation()
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
        if (e) { e.stopPropagation(); e.preventDefault(); }
        setIsMuted(!isMuted)
    }

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const currentProgress = videoRef.current?.duration ? (videoRef.current.currentTime / videoRef.current.duration) * 100 : 0;
        setCurrentTime(formatTime(videoRef.current.currentTime));
        setProgress(currentProgress);
    }

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current?.duration ? formatTime(videoRef.current.duration) : "0:00");
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

    const handleEnded = () => {
        setIsPlaying(false)
    }

    const handleMouseEnter = () => {
        if (videoRef.current && !autoPlay) {
            videoRef.current.play().catch(() => { })
            setIsPlaying(true)
        }
    }
    const handleMouseLeave = () => {
        if (videoRef.current && !autoPlay) {
            videoRef.current.pause()
            setIsPlaying(false)
        }
    }

    let videoSrc = reel.video_url
    if (!videoSrc && reel.drive_url) {
        const match = reel.drive_url.match(/\/d\/([^/?]+)/)
        if (match) videoSrc = `https://drive.google.com/uc?export=download&id=${match[1]}`
    }

    const hasVideo = !!videoSrc
    const isYouTube = !!reel.youtube_url
    const isInstagram = !!reel.instagram_url && !isYouTube

    return (
        <div
            className={`relative overflow-hidden bg-bg-3 group aspect-[9/16] ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {hasVideo ? (
                <>
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        className="w-full h-full object-cover"
                        muted={isMuted}
                        loop={autoPlay}
                        playsInline
                        disablePictureInPicture
                        controls={false}
                        controlsList="nodownload"
                        preload="metadata"
                        poster={reel.thumbnail_url || undefined}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleEnded}
                    />

                    <div className="absolute inset-0 z-20 group">
                        {reel.instagram_url && (
                            <a
                                href={reel.instagram_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute top-4 right-4 z-40 bg-black/60 backdrop-blur-md text-white/90 rounded-full font-medium flex items-center justify-center hover:bg-black/80 transition-all opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto ${showLabel ? 'px-3 py-1.5 text-xs gap-1.5' : 'w-9 h-9'}`}
                            >
                                <ExternalLink size={16} />
                                {showLabel && "Open Post"}
                            </a>
                        )}

                        {!isPlaying && (
                            <button
                                onClick={(e) => { e.preventDefault(); togglePlay(e); }}
                                className="absolute inset-0 m-auto w-16 h-16 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center z-10 transition hover:bg-black/50 pointer-events-auto"
                            >
                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                            </button>
                        )}

                        <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-xl z-30 flex items-center gap-2 transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
                            <button
                                onClick={(e) => { e.preventDefault(); togglePlay(e); }}
                                className="w-7 h-7 rounded-full border border-white/30 flex flex-shrink-0 items-center justify-center text-white hover:bg-white/20 transition"
                            >
                                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                            </button>

                            <button
                                onClick={(e) => { e.preventDefault(); toggleMute(e); }}
                                className="w-7 h-7 rounded-full border border-white/30 flex flex-shrink-0 items-center justify-center text-white hover:bg-white/20 transition"
                            >
                                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                            </button>

                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress || 0}
                                onChange={handleSeek}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                            />

                            <span className="text-white text-[9px] font-mono tracking-wider flex-shrink-0 pr-1">
                                {currentTime} / {duration}
                            </span>
                        </div>

                        {showCaption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent pt-16 pb-3 px-4 z-10 pointer-events-none">
                                {reel.title && <p className="font-heading font-bold text-[13px] text-white leading-tight">{reel.title}</p>}
                                {reel.caption && <p className="font-body text-[11px] text-white/80 mt-1 leading-snug line-clamp-2">{reel.caption}</p>}
                            </div>
                        )}
                    </div>
                </>
            ) : reel.thumbnail_url ? (
                <img src={reel.thumbnail_url} alt={reel.title || ''} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-bg-4" />
            )}
        </div>
    )
}
