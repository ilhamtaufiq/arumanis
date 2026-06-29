import DOMPurify from 'dompurify'

const YOUTUBE_ID_PATTERN =
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/

const DEFAULT_IFRAME_ALLOW = 'encrypted-media; picture-in-picture; web-share; clipboard-write'

const PLAY_BUTTON_HTML = `
  <span class="publication-video-placeholder__icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
  </span>
  <span class="publication-video-placeholder__label">Putar video</span>
`

export function extractYoutubeId(src: string): string | null {
    return src.match(YOUTUBE_ID_PATTERN)?.[1] ?? null
}

export function isYoutubeEmbed(src: string): boolean {
    return /youtube\.com\/embed|youtu\.be\//i.test(src)
}

export function normalizeYoutubeEmbedUrl(src: string): string {
    const videoId = extractYoutubeId(src)
    if (!videoId) return src

    return `https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=1&rel=0&modestbranding=1`
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

function buildYoutubePlaceholderHtml(embedSrc: string, videoId: string): string {
    const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

    return `<div class="publication-video-placeholder" data-manual-video="true" data-embed-src="${escapeHtml(embedSrc)}" data-embed-type="youtube">
<img class="publication-video-placeholder__thumbnail" src="${thumbnail}" alt="Thumbnail video YouTube" decoding="async" />
<button type="button" class="publication-video-placeholder__play" aria-label="Putar video">${PLAY_BUTTON_HTML}</button>
</div>`
}

function buildEmbedPlaceholderHtml(src: string, label: string): string {
    const isInstagram = /instagram\.com/i.test(src)

    return `<div class="publication-embed-placeholder${isInstagram ? ' publication-embed-placeholder--instagram' : ''}" data-manual-video="true" data-embed-src="${escapeHtml(src)}" data-embed-type="iframe">
<button type="button" class="publication-embed-placeholder__load" aria-label="${escapeHtml(label)}">${escapeHtml(label)}</button>
</div>`
}

export function sanitizePublicationHtml(html: string): string {
    if (!html || typeof document === 'undefined') return html

    const doc = new DOMParser().parseFromString(html, 'text/html')

    doc.querySelectorAll('video').forEach((video) => {
        video.removeAttribute('autoplay')
        video.removeAttribute('loop')
        video.removeAttribute('muted')
        video.setAttribute('controls', '')
        video.setAttribute('preload', 'none')
        video.setAttribute('playsinline', '')
    })

    doc.querySelectorAll('img').forEach((image) => {
        image.setAttribute('decoding', 'async')
        image.setAttribute('loading', 'lazy')
    })

    doc.querySelectorAll('ul[data-type="taskList"] li').forEach((item) => {
        const checkbox = item.querySelector('input[type="checkbox"]')
        if (!(checkbox instanceof HTMLInputElement)) return

        checkbox.disabled = true
        checkbox.checked = item.getAttribute('data-checked') === 'true'
    })

    doc.querySelectorAll('iframe').forEach((iframe) => {
        const src = iframe.getAttribute('src') || ''
        if (!src) {
            iframe.remove()
            return
        }

        const wrapper = iframe.closest('.iframe-wrapper') ?? iframe.parentElement
        const videoId = extractYoutubeId(src)

        if (videoId) {
            const placeholder = buildYoutubePlaceholderHtml(normalizeYoutubeEmbedUrl(src), videoId)
            const template = document.createElement('template')
            template.innerHTML = placeholder.trim()
            wrapper?.replaceWith(template.content.firstChild!)
            return
        }

        const label = /instagram\.com/i.test(src) ? 'Muat konten Instagram' : 'Muat konten tertanam'
        const placeholder = buildEmbedPlaceholderHtml(src, label)
        const template = document.createElement('template')
        template.innerHTML = placeholder.trim()
        wrapper?.replaceWith(template.content.firstChild!)
    })

    return DOMPurify.sanitize(doc.body.innerHTML, {
        USE_PROFILES: { html: true },
        ADD_ATTR: [
            'target',
            'rel',
            'data-manual-video',
            'data-embed-src',
            'data-embed-type',
            'data-type',
            'data-checked',
            'data-color',
            'aria-label',
            'decoding',
            'loading',
            'playsinline',
            'controls',
            'preload',
            'disabled',
            'checked',
            'style',
            'class',
            'allow',
            'allowfullscreen',
            'frameborder',
            'height',
            'width',
            'src',
            'poster',
        ],
        ADD_TAGS: ['button', 'iframe', 'mark', 'sub', 'sup', 'label', 'input', 'u', 's', 'del'],
        ALLOWED_STYLES: {
            '*': {
                'text-align': [/^(?:left|right|center|justify)$/],
                color: [/^inherit$/],
                'background-color': [
                    /^#[0-9a-fA-F]{3,8}$/,
                    /^rgb\(/,
                    /^rgba\(/,
                    /^hsl\(/,
                    /^hsla\(/,
                    /^var\(--[\w-]+\)$/,
                ],
            },
        },
    })
}

function activatePlaceholder(placeholder: HTMLElement) {
    if (placeholder.dataset.playing === 'true') return

    const embedSrc = placeholder.dataset.embedSrc
    if (!embedSrc) return

    placeholder.dataset.playing = 'true'

    const iframe = document.createElement('iframe')
    iframe.src = embedSrc
    iframe.className =
        placeholder.dataset.embedType === 'youtube'
            ? 'publication-video-placeholder__iframe'
            : 'publication-embed-placeholder__iframe'
    iframe.setAttribute('allowfullscreen', 'true')
    iframe.setAttribute('allow', DEFAULT_IFRAME_ALLOW)
    iframe.setAttribute('title', placeholder.dataset.embedType === 'youtube' ? 'Video YouTube' : 'Konten tertanam')
    iframe.setAttribute('loading', 'lazy')

    placeholder.replaceChildren(iframe)
}

function bindPlaceholder(placeholder: HTMLElement) {
    if (placeholder.dataset.bound === 'true') return

    placeholder.dataset.bound = 'true'

    const trigger = placeholder.querySelector<HTMLElement>(
        '.publication-video-placeholder__play, .publication-embed-placeholder__load',
    )

    if (!trigger) return

    trigger.addEventListener('click', (event) => {
        event.preventDefault()
        activatePlaceholder(placeholder)
    })
}

const PUBLICATION_DOWNLOAD_PATTERN = /\.(pdf|doc|docx|xlsx|xls|zip|rar|ppt|pptx|csv)(\?|#|$)/i

export function isPublicationDownloadLink(anchor: HTMLAnchorElement): boolean {
    if (anchor.hasAttribute('download')) {
        return true
    }

    const href = anchor.getAttribute('href')?.trim()
    if (!href || href.startsWith('#')) {
        return false
    }

    return PUBLICATION_DOWNLOAD_PATTERN.test(href)
}

export function setupPublicationDownloadTracking(
    container: HTMLElement,
    onDownload: (payload: { href: string; label: string }) => void,
): () => void {
    const handleClick = (event: MouseEvent) => {
        const target = event.target
        if (!(target instanceof Element)) {
            return
        }

        const anchor = target.closest('a')
        if (!(anchor instanceof HTMLAnchorElement) || !container.contains(anchor)) {
            return
        }

        if (!isPublicationDownloadLink(anchor)) {
            return
        }

        const href = anchor.href || anchor.getAttribute('href') || ''
        const label = anchor.textContent?.trim() || anchor.getAttribute('aria-label') || 'download'

        onDownload({ href, label })
    }

    container.addEventListener('click', handleClick)

    return () => {
        container.removeEventListener('click', handleClick)
    }
}

export function setupPublicationMedia(container: HTMLElement): () => void {
    container.querySelectorAll<HTMLElement>('[data-manual-video="true"]').forEach(bindPlaceholder)

    container.querySelectorAll('video').forEach((element) => {
        if (!(element instanceof HTMLVideoElement)) return

        element.autoplay = false
        element.loop = false
        element.muted = false
        element.controls = true
        element.preload = 'none'
        element.removeAttribute('autoplay')
        element.removeAttribute('loop')
        element.removeAttribute('muted')
    })

    return () => {
        container.querySelectorAll<HTMLElement>('[data-manual-video="true"]').forEach((placeholder) => {
            delete placeholder.dataset.bound
        })
    }
}