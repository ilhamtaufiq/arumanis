import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { motion, useInView } from 'motion/react'
import 'leaflet/dist/leaflet.css'
import { normalizeVillageKey } from '@/features/map/utils/map-utils'
import { getPublicSpamMapStats } from '../api/spam-stats'
// @ts-ignore
import geoJsonUrl from '@/assets/geojson/kecamatan/id3203_cianjur_simplified.geojson?url'

const REVEAL_DURATION_MS = 2200
const CIANJUR_MAP_PADDING: [number, number] = [8, 8]
const CIANJUR_FALLBACK_CENTER: [number, number] = [-6.82, 107.14]
const FLOW_SPEED = 0.00135

type VillageStats = {
    sr: number
    kk: number
    jiwa: number
    unit_count: number
    target: number
    desa: string
    kecamatan: string | null
}

type FlowMeta = {
    phase: number
    intensity: number
    hasSr: boolean
}

const DEFAULT_FLOW_META: FlowMeta = { phase: 0, intensity: 0, hasSr: false }

type WaterStyle = {
    fillColor: string
    fillOpacity: number
    color: string
    weight: number
    opacity: number
}

function formatDesaCoveragePercentage(kk: number, target: number) {
    if (target <= 0) return '0%'
    const percentage = Math.min(100, (kk / target) * 100)
    return `${percentage.toLocaleString('id-ID', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}%`
}

function buildCoveragePopupHtml(kk: number, target: number) {
    const percentage = formatDesaCoveragePercentage(kk, target)
    return `<div class="landing-spm-popup">${percentage}</div>`
}

function buildCianjurGeoJson(geoJsonData?: GeoJSON.FeatureCollection | null) {
    if (!geoJsonData?.features) return null

    const features = geoJsonData.features.filter((feature) => {
        const props = feature.properties as { regency?: string; regency_code?: string } | undefined
        return props?.regency === 'Cianjur' || props?.regency_code === 'id3203'
    })

    return {
        ...geoJsonData,
        features: features.length > 0 ? features : geoJsonData.features,
    } satisfies GeoJSON.FeatureCollection
}

function buildFeatureFlowMeta(
    data: GeoJSON.FeatureCollection,
    srByVillage: Record<string, VillageStats>,
    maxSr: number,
) {
    const meta = new Map<string, FlowMeta>()

    for (const feature of data.features) {
        const villageName = (feature.properties as { village?: string } | undefined)?.village ?? ''
        const key = normalizeVillageKey(villageName)
        if (!key || meta.has(key)) continue

        const stats = srByVillage[key]
        const sr = stats?.sr ?? 0
        const intensity = maxSr > 0 ? sr / maxSr : 0
        const center = L.geoJSON(feature).getBounds().getCenter()

        meta.set(key, {
            phase: center.lng * 4.8 + center.lat * 7.2,
            intensity,
            hasSr: sr > 0,
        })
    }

    return meta
}

function waterFlowStyle(meta: FlowMeta, timeMs: number, reveal: number): WaterStyle {
    const eased = Math.min(1, reveal * reveal)
    const t = timeMs * FLOW_SPEED

    const wavePrimary = Math.sin(t * 2.4 - meta.phase * 0.085)
    const waveSecondary = Math.sin(t * 3.8 - meta.phase * 0.11 + 1.4) * 0.58
    const waveTertiary = Math.sin(t * 1.6 + meta.phase * 0.04 - 0.8) * 0.35
    const ripple = (wavePrimary + waveSecondary + waveTertiary + 1.93) / 3.86

    if (!meta.hasSr) {
        const hue = 206 + ripple * 10
        return {
            fillColor: `hsl(${hue} ${24 + ripple * 8}% ${16 + ripple * 5}%)`,
            fillOpacity: (0.035 + ripple * 0.05) * eased,
            color: `rgba(56, 189, 248, ${0.14 + ripple * 0.18})`,
            weight: 0.55,
            opacity: (0.22 + ripple * 0.18) * eased,
        }
    }

    const flow = ripple * 0.55 + meta.intensity * 0.45
    const hue = 184 + flow * 28 + wavePrimary * 7
    const saturation = 54 + meta.intensity * 34 + ripple * 14
    const lightness = 28 + meta.intensity * 24 + ripple * 16

    return {
        fillColor: `hsl(${hue} ${saturation}% ${lightness}%)`,
        fillOpacity: (0.2 + meta.intensity * 0.4 + ripple * 0.14) * eased,
        color: `rgba(${100 + ripple * 50}, ${220 + ripple * 20}, ${252}, ${0.42 + ripple * 0.38})`,
        weight: 0.75 + meta.intensity * 0.65,
        opacity: (0.4 + ripple * 0.42) * eased,
    }
}

function getVillageKey(feature?: GeoJSON.Feature) {
    const villageName = (feature?.properties as { village?: string } | undefined)?.village ?? ''
    return normalizeVillageKey(villageName)
}

function useRevealProgress(active: boolean) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!active) return

        let start: number | null = null
        let frame = 0

        const tick = (timestamp: number) => {
            if (start === null) start = timestamp
            const next = Math.min(1, (timestamp - start) / REVEAL_DURATION_MS)
            setProgress(next)
            if (next < 1) {
                frame = requestAnimationFrame(tick)
            }
        }

        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [active])

    return progress
}

function CianjurMapController({
    bounds,
    active,
}: {
    bounds: L.LatLngBounds | null
    active: boolean
}) {
    const map = useMap()

    useEffect(() => {
        if (!active || !bounds) return

        map.setMaxBounds(bounds)
        map.fitBounds(bounds, {
            padding: CIANJUR_MAP_PADDING,
            animate: true,
            duration: 1.2,
        })

        const minZoom = map.getBoundsZoom(bounds, false, L.point(...CIANJUR_MAP_PADDING))
        map.setMinZoom(minZoom)
        map.setMaxZoom(13)
        map.options.maxBoundsViscosity = 1
    }, [active, bounds, map])

    return null
}

function FlowingWaterGeoJson({
    data,
    srByVillage,
    maxSr,
    reveal,
    animate,
}: {
    data: GeoJSON.FeatureCollection
    srByVillage: Record<string, VillageStats>
    maxSr: number
    reveal: number
    animate: boolean
}) {
    const map = useMap()
    const layerRef = useRef<L.GeoJSON | null>(null)
    const flowMeta = useMemo(
        () => buildFeatureFlowMeta(data, srByVillage, maxSr),
        [data, maxSr, srByVillage],
    )

    useEffect(() => {
        layerRef.current?.remove()

        const layer = L.geoJSON(data, {
            renderer: L.canvas({ padding: 0.5 }),
            style: (feature) =>
                waterFlowStyle(flowMeta.get(getVillageKey(feature as GeoJSON.Feature)) ?? DEFAULT_FLOW_META, 0, 0),
            onEachFeature: (feature, layerInstance) => {
                const stats = srByVillage[getVillageKey(feature as GeoJSON.Feature)]
                if (!stats) return

                layerInstance.bindPopup(buildCoveragePopupHtml(stats.kk, stats.target), {
                    className: 'landing-spm-map-popup',
                })
            },
        }).addTo(map)

        layerRef.current = layer

        return () => {
            layer.remove()
            layerRef.current = null
        }
    }, [data, flowMeta, map, srByVillage])

    useEffect(() => {
        if (!layerRef.current) return

        let frame = 0
        let running = true

        const paint = (time: number) => {
            if (!running || !layerRef.current) return

            layerRef.current.setStyle((feature) =>
                waterFlowStyle(flowMeta.get(getVillageKey(feature as GeoJSON.Feature)) ?? DEFAULT_FLOW_META, time, reveal),
            )

            if (animate && reveal > 0.08) {
                frame = requestAnimationFrame(paint)
            }
        }

        frame = requestAnimationFrame(paint)

        return () => {
            running = false
            cancelAnimationFrame(frame)
        }
    }, [animate, flowMeta, reveal])

    return null
}

export function LandingSpmMap() {
    const containerRef = useRef<HTMLDivElement>(null)
    const inView = useInView(containerRef, { once: true, amount: 0.25 })
    const [isMapMounted, setIsMapMounted] = useState(false)
    const revealProgress = useRevealProgress(inView && isMapMounted)

    useEffect(() => {
        if (!inView) return
        setIsMapMounted(true)
    }, [inView])

    const { data: mapStatsResponse } = useQuery({
        queryKey: ['public-spam-map-stats'],
        queryFn: () => getPublicSpamMapStats(),
        staleTime: 5 * 60 * 1000,
        enabled: inView,
        retry: 1,
        throwOnError: false,
    })

    const { data: geoJsonData, isLoading: isGeoJsonLoading } = useQuery({
        queryKey: ['landing-geojson-cianjur'],
        queryFn: async () => {
            const response = await fetch(geoJsonUrl)
            if (!response.ok) throw new Error('Gagal memuat GeoJSON')
            return response.json() as Promise<GeoJSON.FeatureCollection>
        },
        staleTime: Infinity,
        enabled: inView,
    })

    const srByVillage = useMemo(() => {
        const map: Record<string, VillageStats> = {}
        for (const row of mapStatsResponse?.data ?? []) {
            map[normalizeVillageKey(row.desa)] = {
                sr: row.sr,
                kk: row.kk,
                jiwa: row.jiwa,
                unit_count: row.unit_count,
                target: row.target,
                desa: row.desa,
                kecamatan: row.kecamatan,
            }
        }
        return map
    }, [mapStatsResponse?.data])

    const maxSr = useMemo(
        () => Math.max(...Object.values(srByVillage).map((entry) => entry.sr), 1),
        [srByVillage],
    )

    const cianjurGeoJson = useMemo(() => buildCianjurGeoJson(geoJsonData), [geoJsonData])

    const mapBounds = useMemo(() => {
        if (!cianjurGeoJson) return null
        return L.geoJSON(cianjurGeoJson).getBounds()
    }, [cianjurGeoJson])

    const mapCenter = useMemo((): [number, number] => {
        if (!mapBounds) return CIANJUR_FALLBACK_CENTER
        const center = mapBounds.getCenter()
        return [center.lat, center.lng]
    }, [mapBounds])

    const isLoading = isGeoJsonLoading

    return (
        <motion.div
            ref={containerRef}
            className="landing-spm-map-shell relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 shadow-2xl shadow-black/25"
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="landing-spm-map-canvas h-[min(72vh,680px)] min-h-[420px]">
                {isLoading || !isMapMounted ? (
                    <div className="flex h-full items-center justify-center bg-slate-950/40">
                        <div className="text-center">
                            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
                            <p className="text-xs uppercase tracking-[0.2em] text-white/55">Memuat peta capaian...</p>
                        </div>
                    </div>
                ) : cianjurGeoJson && mapBounds ? (
                    <MapContainer
                        center={mapCenter}
                        zoom={10}
                        minZoom={9}
                        maxZoom={13}
                        maxBounds={mapBounds}
                        maxBoundsViscosity={1}
                        scrollWheelZoom
                        preferCanvas
                        className="h-full w-full"
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        <CianjurMapController bounds={mapBounds} active={inView} />
                        <FlowingWaterGeoJson
                            data={cianjurGeoJson}
                            srByVillage={srByVillage}
                            maxSr={maxSr}
                            reveal={revealProgress}
                            animate={inView}
                        />
                    </MapContainer>
                ) : null}
            </div>
        </motion.div>
    )
}