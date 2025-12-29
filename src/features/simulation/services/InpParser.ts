// INP File Parser - Parses EPANET INP format files
import type { NetworkState, NetworkJunction, NetworkReservoir, NetworkTank, NetworkPipe, NetworkPump, NetworkValve } from '../hooks/useNetworkEditor'

interface ParsedCoordinates {
    [nodeId: string]: { x: number; y: number }
}

export function parseInpFile(content: string): NetworkState {
    const lines = content.split('\n')
    let currentSection = ''

    const junctions: NetworkJunction[] = []
    const reservoirs: NetworkReservoir[] = []
    const tanks: NetworkTank[] = []
    const pipes: NetworkPipe[] = []
    const pumps: NetworkPump[] = []
    const valves: NetworkValve[] = []
    const coordinates: ParsedCoordinates = {}

    // First pass - get coordinates
    for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.startsWith('[')) {
            currentSection = trimmed.toUpperCase()
            continue
        }

        if (trimmed.startsWith(';') || trimmed === '') continue

        if (currentSection === '[COORDINATES]') {
            const parts = trimmed.split(/\s+/)
            if (parts.length >= 3) {
                const nodeId = parts[0]
                const x = parseFloat(parts[1])
                const y = parseFloat(parts[2])
                if (!isNaN(x) && !isNaN(y)) {
                    coordinates[nodeId] = { x, y }
                }
            }
        }
    }

    // Calculate coordinate bounds for scaling to lat/lng
    const coordValues = Object.values(coordinates)
    if (coordValues.length === 0) {
        console.warn('No coordinates found in INP file')
    }

    const minX = Math.min(...coordValues.map(c => c.x))
    const maxX = Math.max(...coordValues.map(c => c.x))
    const minY = Math.min(...coordValues.map(c => c.y))
    const maxY = Math.max(...coordValues.map(c => c.y))

    // Convert EPANET coords to lat/lng (centered around default location)
    const centerLat = -6.82
    const centerLng = 107.14

    const toLatLng = (x: number, y: number): { lat: number; lng: number } => {
        const rangeX = maxX - minX || 1
        const rangeY = maxY - minY || 1
        const normalizedX = (x - minX) / rangeX - 0.5
        const normalizedY = (y - minY) / rangeY - 0.5
        return {
            lat: centerLat + normalizedY * 0.05,
            lng: centerLng + normalizedX * 0.05
        }
    }

    // Second pass - parse elements
    currentSection = ''
    for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.startsWith('[')) {
            currentSection = trimmed.toUpperCase()
            continue
        }

        if (trimmed.startsWith(';') || trimmed === '') continue

        const parts = trimmed.split(/\s+/)

        switch (currentSection) {
            case '[JUNCTIONS]': {
                if (parts.length >= 2) {
                    const id = parts[0]
                    const elevation = parseFloat(parts[1]) || 0
                    const demand = parseFloat(parts[2]) || 0
                    const coord = coordinates[id]
                    const pos = coord ? toLatLng(coord.x, coord.y) : { lat: centerLat, lng: centerLng }
                    junctions.push({
                        id,
                        name: id,
                        lat: pos.lat,
                        lng: pos.lng,
                        elevation,
                        demand
                    })
                }
                break
            }

            case '[RESERVOIRS]': {
                if (parts.length >= 2) {
                    const id = parts[0]
                    const head = parseFloat(parts[1]) || 0
                    const coord = coordinates[id]
                    const pos = coord ? toLatLng(coord.x, coord.y) : { lat: centerLat, lng: centerLng }
                    reservoirs.push({
                        id,
                        name: id,
                        lat: pos.lat,
                        lng: pos.lng,
                        head
                    })
                }
                break
            }

            case '[TANKS]': {
                if (parts.length >= 6) {
                    const id = parts[0]
                    const elevation = parseFloat(parts[1]) || 0
                    const initLevel = parseFloat(parts[2]) || 0
                    const minLevel = parseFloat(parts[3]) || 0
                    const maxLevel = parseFloat(parts[4]) || 0
                    const diameter = parseFloat(parts[5]) || 0
                    const coord = coordinates[id]
                    const pos = coord ? toLatLng(coord.x, coord.y) : { lat: centerLat, lng: centerLng }
                    tanks.push({
                        id,
                        name: id,
                        lat: pos.lat,
                        lng: pos.lng,
                        elevation,
                        initLevel,
                        minLevel,
                        maxLevel,
                        diameter
                    })
                }
                break
            }

            case '[PIPES]': {
                if (parts.length >= 6) {
                    const id = parts[0]
                    const fromNode = parts[1]
                    const toNode = parts[2]
                    const length = parseFloat(parts[3]) || 1000
                    const diameter = parseFloat(parts[4]) || 200
                    const roughness = parseFloat(parts[5]) || 100
                    pipes.push({
                        id,
                        name: id,
                        fromNode,
                        toNode,
                        vertices: [],
                        length,
                        diameter,
                        roughness
                    })
                }
                break
            }

            case '[PUMPS]': {
                if (parts.length >= 3) {
                    const id = parts[0]
                    const fromNode = parts[1]
                    const toNode = parts[2]
                    // Parse power from parameters
                    let power = 50
                    let speed = 1
                    for (let i = 3; i < parts.length; i++) {
                        if (parts[i].toUpperCase() === 'POWER' && parts[i + 1]) {
                            power = parseFloat(parts[i + 1]) || 50
                        }
                        if (parts[i].toUpperCase() === 'SPEED' && parts[i + 1]) {
                            speed = parseFloat(parts[i + 1]) || 1
                        }
                    }
                    pumps.push({
                        id,
                        name: id,
                        fromNode,
                        toNode,
                        power,
                        speed
                    })
                }
                break
            }

            case '[VALVES]': {
                if (parts.length >= 5) {
                    const id = parts[0]
                    const fromNode = parts[1]
                    const toNode = parts[2]
                    const diameter = parseFloat(parts[3]) || 200
                    const type = (parts[4] || 'PRV') as NetworkValve['type']
                    const setting = parseFloat(parts[5]) || 0
                    valves.push({
                        id,
                        name: id,
                        fromNode,
                        toNode,
                        diameter,
                        type,
                        setting
                    })
                }
                break
            }
        }
    }

    return {
        junctions,
        reservoirs,
        tanks,
        pipes,
        pumps,
        valves
    }
}
