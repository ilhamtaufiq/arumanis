import JSZip from 'jszip'
import * as toGeoJSON from '@tmcw/togeojson'
import type { FeatureCollection, Feature, Geometry, Position } from 'geojson'
import type { NetworkState, NetworkJunction, NetworkPipe } from '../hooks/useNetworkEditor'
import { getElevation } from './ElevationService'

export interface KmzParseResult {
    network: NetworkState
    bounds: {
        minLat: number
        maxLat: number
        minLng: number
        maxLng: number
    } | null
}

/**
 * Parse KMZ file (ZIP containing KML)
 */
export async function parseKmzFile(file: File): Promise<FeatureCollection> {
    const zip = new JSZip()
    const contents = await zip.loadAsync(file)

    // Find the KML file inside the KMZ
    let kmlContent: string | null = null
    for (const filename of Object.keys(contents.files)) {
        if (filename.toLowerCase().endsWith('.kml')) {
            kmlContent = await contents.files[filename].async('string')
            break
        }
    }

    if (!kmlContent) {
        throw new Error('No KML file found inside KMZ')
    }

    return parseKmlString(kmlContent)
}

/**
 * Parse KML file
 */
export async function parseKmlFile(file: File): Promise<FeatureCollection> {
    const content = await file.text()
    return parseKmlString(content)
}

/**
 * Parse KML string to GeoJSON
 */
function parseKmlString(kmlString: string): FeatureCollection {
    const parser = new DOMParser()
    const kml = parser.parseFromString(kmlString, 'application/xml')

    // Check for parsing errors
    const parseError = kml.querySelector('parsererror')
    if (parseError) {
        throw new Error('Invalid KML format')
    }

    return toGeoJSON.kml(kml) as FeatureCollection
}

/**
 * Convert GeoJSON to network elements (junctions and pipes)
 */
export async function convertToNetworkElements(geojson: FeatureCollection): Promise<KmzParseResult> {
    const junctions: NetworkJunction[] = []
    const pipes: NetworkPipe[] = []
    const nodeMap = new Map<string, string>() // coordinate string -> junction id

    let junctionCounter = 1
    let pipeCounter = 1

    let minLat = Infinity, maxLat = -Infinity
    let minLng = Infinity, maxLng = -Infinity

    // Helper to create or get junction at a coordinate
    const getOrCreateJunction = async (lat: number, lng: number): Promise<string> => {
        const key = `${lat.toFixed(6)},${lng.toFixed(6)}`

        // Update bounds
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)

        if (nodeMap.has(key)) {
            return nodeMap.get(key)!
        }

        const id = `J${junctionCounter++}`
        let elevation = 0

        // Try to get elevation (async)
        try {
            elevation = await getElevation(lat, lng)
        } catch {
            // Use default elevation if API fails
        }

        junctions.push({
            id,
            name: id,
            lat,
            lng,
            elevation,
            demand: 0
        })
        nodeMap.set(key, id)
        return id
    }

    // Helper to calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371000 // Earth radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLng = (lng2 - lng1) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    // Process each feature
    for (const feature of geojson.features) {
        await processFeature(feature)
    }

    async function processFeature(feature: Feature) {
        const geometry = feature.geometry
        if (!geometry) return

        switch (geometry.type) {
            case 'Point':
                await processPoint(geometry.coordinates as Position)
                break
            case 'LineString':
                await processLineString(geometry.coordinates as Position[])
                break
            case 'MultiLineString':
                for (const line of geometry.coordinates as Position[][]) {
                    await processLineString(line)
                }
                break
            case 'Polygon':
                // Process polygon exterior ring as a closed linestring
                const coords = (geometry.coordinates as Position[][])[0]
                await processLineString(coords)
                break
            case 'GeometryCollection':
                for (const geom of (geometry as unknown as { geometries: Geometry[] }).geometries) {
                    await processFeature({ type: 'Feature', geometry: geom, properties: {} })
                }
                break
        }
    }

    async function processPoint(coords: Position) {
        const [lng, lat] = coords
        await getOrCreateJunction(lat, lng)
    }

    async function processLineString(coords: Position[]) {
        if (coords.length < 2) return

        // Create junction at start point
        const [startLng, startLat] = coords[0]
        const fromNode = await getOrCreateJunction(startLat, startLng)

        // Create junction at end point
        const [endLng, endLat] = coords[coords.length - 1]
        const toNode = await getOrCreateJunction(endLat, endLng)

        // Extract intermediate vertices (excluding start and end)
        const vertices: [number, number][] = []
        let totalLength = 0

        for (let i = 1; i < coords.length; i++) {
            const [prevLng, prevLat] = coords[i - 1]
            const [currLng, currLat] = coords[i]

            totalLength += calculateDistance(prevLat, prevLng, currLat, currLng)

            // Add intermediate points as vertices (skip first and last)
            if (i < coords.length - 1) {
                vertices.push([currLat, currLng])
            }
        }

        const id = `P${pipeCounter++}`
        pipes.push({
            id,
            name: id,
            fromNode,
            toNode,
            vertices,
            length: Math.round(totalLength), // Length in meters
            diameter: 200, // Default diameter in mm
            roughness: 100 // Default roughness (Hazen-Williams C)
        })
    }

    const bounds = junctions.length > 0 ? { minLat, maxLat, minLng, maxLng } : null

    return {
        network: {
            junctions,
            reservoirs: [],
            tanks: [],
            pipes,
            pumps: [],
            valves: [],
            patterns: [{ id: '1', multipliers: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0] }]
        },
        bounds
    }
}

/**
 * Main function to parse KMZ or KML file and convert to network elements
 */
export async function parseKmzOrKml(file: File): Promise<KmzParseResult> {
    const filename = file.name.toLowerCase()

    let geojson: FeatureCollection
    if (filename.endsWith('.kmz')) {
        geojson = await parseKmzFile(file)
    } else if (filename.endsWith('.kml')) {
        geojson = await parseKmlFile(file)
    } else {
        throw new Error('Unsupported file format. Please upload a .kmz or .kml file.')
    }

    return convertToNetworkElements(geojson)
}
