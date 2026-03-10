export function getYouTubeId(url) {
    if (!url) return null
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    )
    return match ? match[1] : null
}

export function getYouTubeThumbnail(url) {
    const id = getYouTubeId(url)
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

export function getYouTubeEmbedUrl(url, { autoplay = true, muted = true, loop = true } = {}) {
    const id = getYouTubeId(url)
    if (!id) return null
    const params = new URLSearchParams({
        autoplay: autoplay ? '1' : '0',
        mute: muted ? '1' : '0',
        loop: loop ? '1' : '0',
        controls: '1',
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
    })
    if (loop) params.set('playlist', id)
    return `https://www.youtube.com/embed/${id}?${params.toString()}`
}
