export const PUBLIKASI_CATEGORIES = [
    'Berita',
    'Galeri',
    'Informasi Publik',
    'Dokumentasi',
] as const

export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim()
}

export function getExcerpt(content: string, maxLength = 160): string {
    const text = stripHtml(content)
    if (text.length <= maxLength) return text
    return `${text.substring(0, maxLength).trim()}…`
}

export function formatPublikasiDate(value: string | null, style: 'long' | 'short' = 'long'): string {
    if (!value) return 'Draft'

    const date = new Date(value)
    if (style === 'short') {
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function estimateReadingTime(content: string): number {
    const words = stripHtml(content).split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
}

export function getCoverImage(
    coverImage: string | null | undefined,
    fallback?: string | null,
): string {
    return (
        coverImage ||
        fallback ||
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop'
    )
}