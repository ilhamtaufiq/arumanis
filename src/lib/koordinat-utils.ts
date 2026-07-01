export const DEFAULT_MAP_CENTER = { lat: -6.9175, lng: 107.6191 }

/** Longitude range for Java / Bali (southern hemisphere — latitude must be negative). */
const JAVA_LNG = { min: 104, max: 115 }

/**
 * OCR often drops the minus on latitude even when the watermark shows "Lat -6.xxx".
 * Java/Bali lie entirely south of the equator; positive lat with Java lng is almost always a missing sign.
 */
export function correctIndonesiaCoordSigns(lat: number, lng: number): { lat: number; lng: number } {
    let nextLat = lat
    let nextLng = lng

    if (
        nextLat > 0
        && nextLat <= 12
        && nextLng >= JAVA_LNG.min
        && nextLng <= JAVA_LNG.max
    ) {
        nextLat = -nextLat
    }

    if (nextLng < 0 && nextLng >= -JAVA_LNG.max && nextLng <= -JAVA_LNG.min) {
        nextLng = -nextLng
    }

    return { lat: nextLat, lng: nextLng }
}

function finalizeCoordPair(lat: number, lng: number): { lat: number; lng: number } | null {
    const { lat: correctedLat, lng: correctedLng } = correctIndonesiaCoordSigns(lat, lng)
    if (!Number.isFinite(correctedLat) || !Number.isFinite(correctedLng)) {
        return null
    }
    if (correctedLat < -90 || correctedLat > 90 || correctedLng < -180 || correctedLng > 180) {
        return null
    }
    return { lat: correctedLat, lng: correctedLng }
}

export function parseKoordinatString(value: string): { lat: number; lng: number } | null {
    const match = value.trim().match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
    if (!match) {
        return null
    }

    const lat = Number.parseFloat(match[1] ?? '')
    const lng = Number.parseFloat(match[2] ?? '')

    return finalizeCoordPair(lat, lng)
}

export function formatKoordinat(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

/**
 * Parse koordinat yang tersimpan tanpa koma, mis. "-7.1653984107.1545166".
 */
export function parseKoordinatLoose(value?: string | null): { lat: number; lng: number } | null {
    if (!value?.trim()) {
        return null
    }

    const withComma = parseKoordinatString(value)
    if (withComma) {
        return withComma
    }

    const cleaned = value.trim().replace(/\s/g, '')
    const lngMarker = cleaned.search(/10\d\.\d+/)
    if (lngMarker > 0) {
        const lat = Number.parseFloat(cleaned.slice(0, lngMarker))
        const lng = Number.parseFloat(cleaned.slice(lngMarker))
        const finalized = finalizeCoordPair(lat, lng)
        if (finalized) {
            return finalized
        }
    }

    return null
}

export function formatKoordinatDisplay(value?: string | null): string {
    if (!value?.trim()) {
        return '-'
    }

    const parsed = parseKoordinatLoose(value)
    if (!parsed) {
        return value
    }

    return formatKoordinat(parsed.lat, parsed.lng)
}

export function normalizeKoordinatInput(value: string): string {
    const parsed = parseKoordinatLoose(value)
    if (!parsed) {
        return value.trim()
    }

    return formatKoordinat(parsed.lat, parsed.lng)
}