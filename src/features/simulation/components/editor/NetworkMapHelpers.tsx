import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export function ZoomToFit({
    nodes,
    trigger,
}: {
    nodes: { lat: number; lng: number }[]
    trigger: number
}) {
    const map = useMap()

    useEffect(() => {
        if (trigger > 0 && nodes.length > 0) {
            const bounds = L.latLngBounds(nodes.map((n) => [n.lat, n.lng] as [number, number]))
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 })
        }
    }, [trigger, nodes, map])

    return null
}

export function MapKeyboardPan({
    trigger,
}: {
    trigger: { direction: string; timestamp: number } | null
}) {
    const map = useMap()

    useEffect(() => {
        if (!trigger) return
        const PAN_OFFSET = 100
        switch (trigger.direction) {
            case 'up':
                map.panBy([0, -PAN_OFFSET])
                break
            case 'down':
                map.panBy([0, PAN_OFFSET])
                break
            case 'left':
                map.panBy([-PAN_OFFSET, 0])
                break
            case 'right':
                map.panBy([PAN_OFFSET, 0])
                break
        }
    }, [trigger, map])

    return null
}

export function PanToCoordinate({
    target,
    trigger,
}: {
    target: { lat: number; lng: number } | null
    trigger: number
}) {
    const map = useMap()

    useEffect(() => {
        if (!target || trigger <= 0) return
        map.setView([target.lat, target.lng], Math.max(map.getZoom(), 17), { animate: true })
    }, [target, trigger, map])

    return null
}

export function MapInvalidator({ activeTab }: { activeTab: string }) {
    const map = useMap()
    useEffect(() => {
        if (activeTab === '2d') {
            const timer = setTimeout(() => {
                map.invalidateSize()
            }, 200)
            return () => clearTimeout(timer)
        }
    }, [activeTab, map])
    return null
}
