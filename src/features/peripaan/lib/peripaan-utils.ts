// Utilitas geodesi untuk editor peta perpipaan

/** Jarak haversine dua koordinat (meter) */
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Panjang total polyline (meter) */
export function pathLength(coords: [number, number][]): number {
    let total = 0
    for (let i = 1; i < coords.length; i++) {
        total += haversine(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1])
    }
    return total
}

export function formatDistance(meters: number): string {
    if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`
    return `${Math.round(meters)} m`
}

export function min(values: number[]): number {
    return values.length ? Math.min(...values) : 0
}

export function max(values: number[]): number {
    return values.length ? Math.max(...values) : 0
}

export function median(values: number[]): number {
    if (!values.length) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/** Slope per segmen (derajat) dari titik elevasi berurutan */
export function slopeAngles(points: { lat: number; lng: number; elev: number }[]): number[] {
    const slopes: number[] = []
    for (let i = 1; i < points.length; i++) {
        const d = haversine(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng)
        const dElev = points[i].elev - points[i - 1].elev
        if (d > 0) slopes.push((Math.atan(Math.abs(dElev) / d) * 180) / Math.PI)
    }
    return slopes
}

/** Palet warna jalur sesuai kategori (kuning, hijau, cyan, dst) */
export const PATH_COLORS = ['#eab308', '#22c55e', '#06b6d4', '#ef4444', '#a855f7', '#f97316', '#3b82f6', '#ec4899']

export function colorFor(index: number): string {
    return PATH_COLORS[index % PATH_COLORS.length]
}
