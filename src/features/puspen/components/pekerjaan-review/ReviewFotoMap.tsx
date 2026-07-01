import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AlertTriangle } from 'lucide-react'
import { PuspenBadge } from '../PuspenUi'
import { createProgressMarkerIcon } from '@/features/map/utils/MapIcon'
import { getProgressColor, PROGRESS_MARKER_COLORS } from '@/features/map/utils/map-utils'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import {
    isFotoKoordinatDiluarDesa,
    resolveFotoKomponenLabel,
    type FotoMapPoint,
    type KoordinatDesaSummary,
} from '../../lib/pekerjaan-review-utils'
import { puspenBorder } from '../../lib/tokens'

function createReviewMarkerIcon(progressLabel: string, outsideDesa: boolean) {
    if (!outsideDesa) {
        return createProgressMarkerIcon(progressLabel)
    }

    const color = getProgressColor(progressLabel)
    return L.divIcon({
        className: 'map-progress-marker',
        html: `<span class="map-progress-marker__dot" style="background:${color};box-shadow:0 0 0 3px #EF233C,0 0 0 5px #fff,0 4px 12px rgba(15,23,42,.35)"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -12],
    })
}

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
    desaName?: string
    kecamatanName?: string
    koordinatSummary?: KoordinatDesaSummary
    outputs?: Pekerjaan['output']
}

export function ReviewFotoMap({
    points,
    totalFotos,
    pekerjaanName,
    desaName,
    kecamatanName,
    koordinatSummary,
    outputs = [],
}: ReviewFotoMapProps) {
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

    const lokasiLabel = [desaName, kecamatanName ? `Kec. ${kecamatanName}` : null].filter(Boolean).join(', ')
    const diluarDesaCount = koordinatSummary?.diluarDesa ?? 0

    return (
        <div className="space-y-3">
            {diluarDesaCount > 0 ? (
                <div className={`flex gap-2 bg-[#FFE5D9] p-3 text-xs font-bold leading-5 text-[#111111] ${puspenBorder}`}>
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FB8500]" />
                    <div>
                        <span className="font-black">
                            {diluarDesaCount} foto di luar {lokasiLabel || 'desa pekerjaan'}
                        </span>
                        {' — '}
                        Koordinat tagging tidak sesuai batas desa proyek. Marker dengan ring merah menandai lokasi di luar desa.
                    </div>
                </div>
            ) : null}

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
                    {points.map(({ foto, coords }) => {
                        const outsideDesa = isFotoKoordinatDiluarDesa(foto)

                        return (
                            <Marker
                                key={foto.id}
                                position={[coords.lat, coords.lng]}
                                icon={createReviewMarkerIcon(foto.keterangan, outsideDesa)}
                            >
                                <Popup>
                                    <div className="space-y-1 text-xs">
                                        <div className="font-bold">{resolveFotoKomponenLabel(foto, outputs)}</div>
                                        <PuspenBadge tone="crt">{foto.keterangan}</PuspenBadge>
                                        {outsideDesa ? (
                                            <PuspenBadge tone="warning">Luar desa</PuspenBadge>
                                        ) : null}
                                        <div>{foto.penerima?.nama ?? (foto.unit_index ? `Unit ${foto.unit_index}` : '-')}</div>
                                        <div className="font-bold text-[#111111]/60">{foto.koordinat}</div>
                                        {outsideDesa && foto.validasi_koordinat_message ? (
                                            <div className="font-bold text-[#FB8500]">{foto.validasi_koordinat_message}</div>
                                        ) : null}
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}
                </MapContainer>
            </div>
        </div>
    )
}