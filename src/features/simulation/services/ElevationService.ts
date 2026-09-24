// Elevation Service using Open-Meteo API (free, 10k daily calls)
// https://open-meteo.com/en/docs/elevation-api

export interface ElevationResult {
    latitude: number
    longitude: number
    elevation: number
}

const OPEN_METEO_ELEVATION_API = 'https://api.open-meteo.com/v1/elevation'

export async function getElevation(lat: number, lng: number): Promise<number> {
    try {
        const response = await fetch(
            `${OPEN_METEO_ELEVATION_API}?latitude=${lat}&longitude=${lng}`
        )

        if (!response.ok) {
            console.warn('Elevation API error:', response.statusText)
            return 0
        }

        const data = await response.json()
        return data.elevation?.[0] ?? 0
    } catch (error) {
        console.warn('Failed to fetch elevation:', error)
        return 0
    }
}

export async function getElevations(coords: { lat: number; lng: number }[]): Promise<number[]> {
    if (coords.length === 0) return []

    // Open-Meteo elevation API: max 100 koordinat per request — pecah jadi chunk
    const CHUNK_SIZE = 100
    const chunks: { lat: number; lng: number }[][] = []
    for (let i = 0; i < coords.length; i += CHUNK_SIZE) {
        chunks.push(coords.slice(i, i + CHUNK_SIZE))
    }

    try {
        const results = await Promise.all(
            chunks.map(async (chunk) => {
                const lats = chunk.map(c => c.lat).join(',')
                const lngs = chunk.map(c => c.lng).join(',')

                const response = await fetch(
                    `${OPEN_METEO_ELEVATION_API}?latitude=${lats}&longitude=${lngs}`
                )

                if (!response.ok) {
                    console.warn('Elevation API error:', response.statusText)
                    return chunk.map(() => 0)
                }

                const data = await response.json()
                return data.elevation ?? chunk.map(() => 0)
            })
        )
        return results.flat()
    } catch (error) {
        console.warn('Failed to fetch elevations:', error)
        return coords.map(() => 0)
    }
}
