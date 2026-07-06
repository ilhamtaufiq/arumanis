import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { DEFAULT_MAP_CENTER, formatKoordinatDisplay } from '@/lib/koordinat-utils'
import type { PengawasLocationPoint } from '../lib/presence-location'

const pengawasMarkerIcon = L.divIcon({
    className: 'pengawas-location-marker',
    html: '<span class="pengawas-location-marker__dot"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
})

function MapFitBounds({ points }: { points: PengawasLocationPoint[] }) {
    const map = useMap()

    useEffect(() => {
        if (points.length === 0) {
            map.setView([DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng], 11)
            return
        }

        if (points.length === 1) {
            const only = points[0]
            map.setView([only.lat, only.lng], 14)
            return
        }

        const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng]))
        map.fitBounds(bounds.pad(0.2))
    }, [map, points])

    return null
}

type PengawasLocationMapProps = {
    points: PengawasLocationPoint[]
}

function formatDateTime(value?: string | null) {
    if (!value) return '-'
    try {
        return new Date(value).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return '-'
    }
}

export function PengawasLocationMap({ points }: PengawasLocationMapProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    const center = useMemo<[number, number]>(() => {
        if (points.length > 0) {
            return [points[0].lat, points[0].lng]
        }
        return [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng]
    }, [points])

    if (!mounted) {
        return <div className="pengawas-location-map-shell h-[min(62vh,520px)] min-h-[360px] animate-pulse rounded-2xl bg-muted/30" />
    }

    return (
        <div className="pengawas-location-map-shell overflow-hidden rounded-2xl border bg-card shadow-sm">
            <MapContainer
                center={center}
                zoom={11}
                scrollWheelZoom
                className="pengawas-location-map-canvas"
                style={{ height: 'min(62vh, 520px)', minHeight: 360, width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapFitBounds points={points} />
                {points.map((point) => (
                    <Marker
                        key={point.id}
                        position={[point.lat, point.lng]}
                        icon={pengawasMarkerIcon}
                    >
                        <Popup minWidth={220}>
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold">{point.name}</p>
                                <p className="text-muted-foreground">{point.email}</p>
                                <p>Koordinat: {formatKoordinatDisplay(point.koordinat)}</p>
                                <p>Terakhir lokasi: {formatDateTime(point.koordinat_at)}</p>
                                <p>Terakhir online: {formatDateTime(point.last_seen_at)}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}