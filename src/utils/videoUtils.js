export function getYouTubeId(url) {
    if (!url) return null
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    )
    return match ? match[1] : null
}

export function getYouTubeThumbnail(url, { frame = false } = {}) {
    const id = getYouTubeId(url)
    if (!id) return null
    // /0.jpg is the default still (first-frame) thumbnail from YouTube
    if (frame) return `https://i.ytimg.com/vi/${id}/0.jpg`
    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
}

const firstFrameCache = new Map()

/** Extract first frame from an uploaded video URL (same-origin /uploads works best). */
export function captureVideoFirstFrame(src) {
    if (!src) return Promise.reject(new Error('No video source'))

    if (firstFrameCache.has(src)) {
        return Promise.resolve(firstFrameCache.get(src))
    }

    return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'

        if (typeof window !== 'undefined') {
            try {
                const resolved = new URL(src, window.location.origin)
                if (resolved.origin === window.location.origin) {
                    video.crossOrigin = 'anonymous'
                }
            } catch {
                // ignore invalid URLs
            }
        }

        const finish = (dataUrl) => {
            firstFrameCache.set(src, dataUrl)
            video.removeAttribute('src')
            video.load()
            resolve(dataUrl)
        }

        const fail = (err) => {
            video.removeAttribute('src')
            video.load()
            reject(err)
        }

        video.addEventListener('loadeddata', () => {
            video.currentTime = 0.01
        }, { once: true })

        video.addEventListener('seeked', () => {
            try {
                const w = video.videoWidth || 720
                const h = video.videoHeight || 1280
                const canvas = document.createElement('canvas')
                canvas.width = w
                canvas.height = h
                canvas.getContext('2d').drawImage(video, 0, 0, w, h)
                finish(canvas.toDataURL('image/jpeg', 0.85))
            } catch (err) {
                fail(err)
            }
        }, { once: true })

        video.addEventListener('error', () => fail(new Error('Could not load video for thumbnail')), { once: true })

        video.src = src
    })
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
