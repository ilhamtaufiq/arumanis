import { useMapEvents } from 'react-leaflet'
import type { MapNode } from '../../utils/map-utils'
import { findNearestNode } from '../../utils/map-utils'

interface EditorMapEventsProps {
    onMapClick: (lat: number, lng: number) => void
    onContextMenu?: (lat: number, lng: number, clientX: number, clientY: number) => void
    onSnapHover?: (nodeId: string | null) => void
    onMouseMove?: (lat: number, lng: number) => void
    snapNodes: MapNode[]
    snapEnabled?: boolean
}

export function EditorMapEvents({
    onMapClick,
    onContextMenu,
    onSnapHover,
    onMouseMove,
    snapNodes,
    snapEnabled = true,
}: EditorMapEventsProps) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng)
        },
        contextmenu: (e) => {
            e.originalEvent.preventDefault()
            onContextMenu?.(
                e.latlng.lat,
                e.latlng.lng,
                e.originalEvent.clientX,
                e.originalEvent.clientY,
            )
        },
        mousemove: (e) => {
            onMouseMove?.(e.latlng.lat, e.latlng.lng)
            if (!snapEnabled) return
            const nearest = findNearestNode(snapNodes, e.latlng.lat, e.latlng.lng)
            onSnapHover?.(nearest?.id ?? null)
        },
        mouseout: () => {
            onSnapHover?.(null)
        },
    })
    return null
}