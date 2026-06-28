import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PuspenBadge } from '../PuspenUi'
import { createProgressMarkerIcon } from '@/features/map/utils/MapIcon'
import { PROGRESS_MARKER_COLORS } from '@/features/map/utils/map-utils'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { resolveFotoKomponenLabel, type FotoMapPoint } from '../../lib/pekerjaan-review-utils'
import { puspenBorder } from '../../lib/tokens'

function MapFitBounds({ points }: { points: FotoMapPoint[] }) {
    const map = useMap()

    useEffect(() => {
        if (points.length === 0) {
            return
        }

        if (points.length === 1) {
            map.setView([points[0].coords.lat, points[0].coords.lng], 16)
            return
        }

        const bounds = L.latLngBounds(points.map((point) => [point.coords.lat, point.coords.lng]))
        map.fitBounds(bounds, { padding: [32, 32], maxZoom: 17 })
    }, [map, points])

    return null
}

type ReviewFotoMapProps = {
    points: FotoMapPoint[]
    totalFotos: number
    pekerjaanName?: string
    outputs?: Pekerjaan['output']
}

export function ReviewFotoMap({ points, totalFotos, pekerjaanName, outputs = [] }: ReviewFotoMapProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    const center = useMemo<[number, number]>(() => {
        if (points.length > 0) {
            return [points[0].coords.lat, points[0].coords.lng]
        }
        return [-6.82, 107.14]
    }, [points])

    if (!mounted) {
        return (
            <div className={`flex h-[360px] items-center justify-center bg-[#FFF7E8] ${puspenBorder}`}>
                <p className="text-sm font-bold text-[#111111]/60">Memuat peta...</p>
            </div>
        )
    }

    if (points.length === 0) {
        return (
            <div className={`flex h-[220px] items-center justify-center bg-[#FFF7E8] ${puspenBorder}`}>
                <p className="text-sm font-bold text-[#111111]/60">
                    Tidak ada foto dengan koordinat valid untuk ditampilkan di peta.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#111111]/70">
                <span>
                    {points.length} dari {totalFotos} foto memiliki koordinat
                    {pekerjaanName ? ` · ${pekerjaanName}` : ''}
                </span>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(PROGRESS_MARKER_COLORS).map(([level, color]) => (
                        <span key={level} className="inline-flex items-center gap-1">
                            <span
                                className="inline-block h-2.5 w-2.5 rounded-full border border-[#111111]/20"
                                style={{ backgroundColor: color }}
                            />
                            {level}
                        </span>
                    ))}
                </div>
            </div>

            <div className={`h-[360px] overflow-hidden ${puspenBorder}`}>
                <MapContainer
                    center={center}
                    zoom={14}
                    scrollWheelZoom
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapFitBounds points={points} />
                    {points.map(({ foto, coords }) => (
                        <Marker
                            key={foto.id}
                            position={[coords.lat, coords.lng]}
                            icon={createProgressMarkerIcon(foto.keterangan)}
                        >
                            <Popup>
                                <div className="space-y-1 text-xs">
                                    <div className="font-bold">{resolveFotoKomponenLabel(foto, outputs)}</div>
                                    <PuspenBadge tone="crt">{foto.keterangan}</PuspenBadge>
                                    <div>{foto.penerima?.nama ?? (foto.unit_index ? `Unit ${foto.unit_index}` : '-')}</div>
                                    <div className="font-bold text-[#111111]/60">{foto.koordinat}</div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    )
}