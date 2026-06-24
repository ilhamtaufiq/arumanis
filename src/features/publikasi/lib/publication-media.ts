const YOUTUBE_ID_PATTERN =
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/

const DEFAULT_IFRAME_ALLOW = 'encrypted-media; picture-in-picture; web-share; clipboard-write'

export function extractYoutubeId(src: string): string | null {
    return src.match(YOUTUBE_ID_PATTERN)?.[1] ?? null
}

export function isYoutubeEmbed(src: string): boolean {
    return /youtube\.com\/embed|youtu\.be\//i.test(src)
}

export function normalizeYoutubeEmbedUrl(src: string): string {
    const videoId = extractYoutubeId(src)
    if (!videoId) return src

    return `https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=0&rel=0&modestbranding=1`
}

function stripAutoplayFromAllow(allow: string): string {
    const cleaned = allow
        .split(';')
        .map((part) => part.trim())
        .filter((part) => part && part.toLowerCase() !== 'autoplay')

    return cleaned.length > 0 ? cleaned.join('; ') : DEFAULT_IFRAME_ALLOW
}

export function sanitizePublicationHtml(html: string): string {
    if (!html || typeof document === 'undefined') return html

    const doc = new DOMParser().parseFromString(html, 'text/html')

    doc.querySelectorAll('video').forEach((video) => {
        video.removeAttribute('autoplay')
        video.removeAttribute('loop')
        video.removeAttribute('muted')
        video.setAttribute('controls', '')
        video.setAttribute('preload', 'metadata')
        video.setAttribute('playsinline', '')
    })

    doc.querySelectorAll('iframe').forEach((iframe) => {
        const allow = iframe.getAttribute('allow') || ''
        iframe.setAttribute('allow', stripAutoplayFromAllow(allow))

        const src = iframe.getAttribute('src')
        if (src && isYoutubeEmbed(src)) {
            iframe.setAttribute('src', normalizeYoutubeEmbedUrl(src))
        }

        iframe.removeAttribute('loading')
    })

    return doc.body.innerHTML
}

function createYoutubePlaceholder(iframe: HTMLIFrameElement): HTMLDivElement {
    const src = iframe.getAttribute('src') || iframe.src
    const videoId = src ? extractYoutubeId(src) : null

    const placeholder = document.createElement('div')
    placeholder.className = 'publication-video-placeholder'
    placeholder.dataset.manualVideo = 'true'

    let thumbnail: HTMLImageElement | null = null
    if (videoId) {
        thumbnail = document.createElement('img')
        thumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        thumbnail.alt = 'Thumbnail video YouTube'
        thumbnail.className = 'publication-video-placeholder__thumbnail'
        thumbnail.loading = 'lazy'
        placeholder.appendChild(thumbnail)
    }

    const overlay = document.createElement('button')
    overlay.type = 'button'
    overlay.className = 'publication-video-placeholder__play'
    overlay.setAttribute('aria-label', 'Putar video')
    overlay.innerHTML = `
      <span class="publication-video-placeholder__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </span>
      <span class="publication-video-placeholder__label">Putar video</span>
    `
    placeholder.appendChild(overlay)

    const embedUrl = src ? normalizeYoutubeEmbedUrl(src) : ''
    iframe.removeAttribute('src')
    iframe.setAttribute('data-embed-src', embedUrl)
    iframe.setAttribute('title', iframe.getAttribute('title') || 'Video YouTube')
    iframe.hidden = true
    iframe.classList.add('publication-video-placeholder__iframe')
    placeholder.appendChild(iframe)

    const activate = () => {
        if (placeholder.dataset.playing === 'true') return

        const embedSrc = iframe.getAttribute('data-embed-src')
        if (!embedSrc) return

        placeholder.dataset.playing = 'true'
        iframe.src = embedSrc
        iframe.hidden = false
        overlay.remove()
        thumbnail?.remove()
    }

    overlay.addEventListener('click', activate)
    placeholder.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            activate()
        }
    })

    return placeholder
}

function configureNativeVideo(video: HTMLVideoElement): IntersectionObserver {
    video.autoplay = false
    video.loop = false
    video.muted = false
    video.controls = true
    video.preload = 'metadata'
    video.removeAttribute('autoplay')
    video.removeAttribute('loop')
    video.removeAttribute('muted')

    return new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting && !video.paused) {
                video.pause()
            }
        },
        { threshold: 0.2 },
    )
}

export function setupPublicationMedia(container: HTMLElement): () => void {
    const observers: IntersectionObserver[] = []

    container.querySelectorAll('video').forEach((element) => {
        if (!(element instanceof HTMLVideoElement)) return
        const observer = configureNativeVideo(element)
        observer.observe(element)
        observers.push(observer)
    })

    container.querySelectorAll('iframe').forEach((element) => {
        if (!(element instanceof HTMLIFrameElement)) return

        const src = element.getAttribute('src') || element.src
        if (!src || !isYoutubeEmbed(src)) return

        const parent = element.parentElement
        if (!parent || parent.closest('[data-manual-video="true"]')) return

        const placeholder = createYoutubePlaceholder(element)
        parent.replaceWith(placeholder)
    })

    return () => {
        observers.forEach((observer) => observer.disconnect())
    }
}