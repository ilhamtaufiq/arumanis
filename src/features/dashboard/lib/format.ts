export function formatCurrency(value: number): string {
    if (value >= 1_000_000_000) {
        return `Rp ${(value / 1_000_000_000).toFixed(1)} M`
    }
    if (value >= 1_000_000) {
        return `Rp ${(value / 1_000_000).toFixed(1)} Jt`
    }
    return `Rp ${value.toLocaleString('id-ID')}`
}

export function formatNumber(value: number): string {
    return value.toLocaleString('id-ID')
}