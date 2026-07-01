const EARTH_RADIUS_M = 6_371_000

export function haversineDistanceM(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a))
}

export function calculatePipeLength(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    vertices: [number, number][] = [],
): number {
    const points: [number, number][] = [
        [from.lat, from.lng],
        ...vertices,
        [to.lat, to.lng],
    ]
    let total = 0
    for (let i = 1; i < points.length; i++) {
        total += haversineDistanceM(
            points[i - 1][0],
            points[i - 1][1],
            points[i][0],
            points[i][1],
        )
    }
    return Math.max(1, Math.round(total))
}