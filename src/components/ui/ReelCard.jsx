import VideoPlayer from './VideoPlayer'

export default function ReelCard({
    reel,
    className = "rounded-[16px] border border-border",
    autoPlay = false,
    showCaption = true,
    showLabel = true,
    forceMuted = false,
}) {
    return (
        <div className={`relative overflow-hidden bg-bg-3 group aspect-[9/16] ${className}`}>
            <VideoPlayer
                reel={reel}
                isActive={autoPlay}
                showCaption={showCaption}
                showLabel={showLabel}
                forceMuted={forceMuted}
            />
        </div>
    )
}
