export function parseIndonesianNumber(value: unknown): number {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0

    let normalized = String(value)
        .replace(/rp\.?/gi, '')
        .replace(/\s+/g, '')
        .trim()

    if (!normalized || normalized === '-' || normalized === '0-') return 0

    const hasComma = normalized.includes(',')
    const hasDot = normalized.includes('.')

    if (hasComma && hasDot) {
        const lastComma = normalized.lastIndexOf(',')
        const lastDot = normalized.lastIndexOf('.')
        if (lastComma > lastDot) {
            normalized = normalized.replace(/\./g, '').replace(',', '.')
        } else {
            normalized = normalized.replace(/,/g, '')
        }
    } else if (hasDot) {
        const parts = normalized.split('.')
        if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
            normalized = normalized.replace(/\./g, '')
        }
    } else if (hasComma) {
        const parts = normalized.split(',')
        if (parts.length === 2 && parts[1].length <= 2) {
            normalized = normalized.replace(',', '.')
        } else {
            normalized = normalized.replace(/,/g, '')
        }
    }

    const parsed = Number.parseFloat(normalized)
    return Number.isFinite(parsed) ? parsed : 0
}