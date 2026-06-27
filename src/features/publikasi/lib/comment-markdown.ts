const ALLOWED_IMAGE_HOSTS = [
    'media.giphy.com',
    'media0.giphy.com',
    'media1.giphy.com',
    'media2.giphy.com',
    'media3.giphy.com',
    'media4.giphy.com',
    'i.giphy.com',
]

export function isAllowedCommentImageUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        if (parsed.protocol !== 'https:') return false
        return ALLOWED_IMAGE_HOSTS.some(
            (host) => parsed.hostname === host || parsed.hostname.endsWith('.giphy.com'),
        )
    } catch {
        return false
    }
}

export function isAllowedCommentLinkUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
        return false
    }
}