export function formatSipdSyncTime(value: string | null | undefined): string {
    if (!value) return '-'
    try {
        return new Date(value).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return value
    }
}