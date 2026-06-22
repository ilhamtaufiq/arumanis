export function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'baru saja'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export function isBannerNotification(value: unknown): boolean {
    return value === true || value === 1 || value === '1'
}

export function getTargetLabel(type: string): string {
    switch (type) {
        case 'all':
            return 'Semua User'
        case 'single':
            return 'Single User'
        case 'multiple':
            return 'Beberapa User'
        default:
            return type
    }
}