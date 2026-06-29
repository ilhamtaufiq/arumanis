import { haversineDistanceM } from './geometry-utils'

export const SNAP_RADIUS_M = 25

export interface MapNode {
    id: string
    lat: number
    lng: number
}

export function findNearestNode(
    nodes: MapNode[],
    lat: number,
    lng: number,
    maxDistanceM = SNAP_RADIUS_M,
    excludeId?: string,
): MapNode | null {
    let nearest: MapNode | null = null
    let minDist = maxDistanceM

    for (const node of nodes) {
        if (excludeId && node.id === excludeId) continue
        const dist = haversineDistanceM(lat, lng, node.lat, node.lng)
        if (dist <= minDist) {
            minDist = dist
            nearest = node
        }
    }

    return nearest
}