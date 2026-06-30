import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { ChevronDown, ChevronUp, Home, Minus, Plus } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import 'leaflet/dist/leaflet.css'
import { normalizeWilayahKey } from '@/features/map/utils/map-utils'
import type { UnitSpamStats } from '@/features/spam-unit/types'
import {
    getPublicSanitasiMapStats,
    getPublicSanitasiStats,
    getPublicSpamMapStats,
    getPublicSpamUnitStats,
    type LandingSpmSector,
    type PublicSanitasiStats,
} from '../api/spam-stats'
import { formatCount, formatCoverage } from '../lib/innovation-stats'
import {
    formatCoveragePercent,
    getCoveragePercent,
    getCoverageTier,
    getTierModifier,
} from '../lib/spm-map-coverage'
import { buildPublicAirMinumMetrics, buildPublicSanitasiMetrics } from '../lib/spm-public-stats'
import { filterPublicSpmMapStats } from '../lib/spm-reserved-wilayah'
import type { PublicMessages } from '../i18n/types'
import { buildSpmTahunQueryParam } from '../lib/spm-year'
import { addCianjurMaskLayer, getBoundaryGeometry } from '../lib/spm-map-mask'
import { SpmYearSelector } from './spm-year-selector'
import { usePublicLocale } from '../i18n/use-public-locale'
// @ts-ignore
import geoJsonUrl from '@/assets/geojson/kecamatan/id3203_cianjur_simplified.geojson?url'
import boundaryGeoJsonUrl from '@/assets/geojson/kecamatan/id3203_cianjur_boundary.geojson?url'

const REVEAL_DURATION_MS = 2200
const CIANJUR_MAP_PADDING: [number, number] = [8, 8]
const CIANJUR_FALLBACK_CENTER: [number, number] = [-6.82, 107.14]
const FLOW_SPEED = 0.00135

type MapTheme = 'water' | 'sanitation'

type VillageStats = {
    desa_id: number
    intensity: number
    kk: number
    jiwa: number
    unit_count: number
    target: number
    desa: string
    kecamatan: string | null
    sr?: number
    penduduk?: number
}

type FlowMeta = {
    phase: number
    intensity: number
    hasCapaian: boolean
}

const DEFAULT_FLOW_META: FlowMeta = { phase: 0, intensity: 0, hasCapaian: false }

type FlowStyle = {
    fillColor: string
    fillOpacity: number
    color: string
    weight: number
    opacity: number
}

function formatDesaCoveragePercentage(kk: number, target: number) {
    return formatCoveragePercent(getCoveragePercent(kk, target))
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

function buildVillagePopupHtml(
    stats: VillageStats,
    sector: LandingSpmSector,
    copy: PublicMessages['landing']['spm']['map'],
) {
    const percentValue = getCoveragePercent(stats.kk, stats.target)
    const percentage = formatCoveragePercent(percentValue)
    const tier = getCoverageTier(percentValue)
    const kecamatan = stats.kecamatan ?? '—'
    const coverageLabel =
        sector === 'sanitasi' ? copy.popupCoverageSanitasi : copy.popupCoverageAir
    const gapKk = Math.max(0, stats.target - stats.kk)

    const extraRows =
        sector === 'sanitasi'
            ? `
    <div><dt>${copy.popupPenduduk}</dt><dd>${formatCount(stats.penduduk ?? 0)}</dd></div>
    <div><dt>${copy.popupKkPemanfaat}</dt><dd>${formatCount(stats.kk)}</dd></div>`
            : `
    <div><dt>${copy.popupSr}</dt><dd>${formatCount(stats.sr ?? 0)}</dd></div>
    <div><dt>${copy.popupKkTerlayani}</dt><dd>${formatCount(stats.kk)}</dd></div>`

    const unitLabel = sector === 'sanitasi' ? copy.infrastruktur : copy.unitSpam

    return `
<div class="landing-spm-popup landing-spm-popup--detail ${getTierModifier(tier)}">
  <div class="landing-spm-popup__header">
    <div class="landing-spm-popup__title-row">
      <p class="landing-spm-popup__desa">${escapeHtml(stats.desa)}</p>
      <span class="landing-spm-popup__badge">${escapeHtml(copy.tiers[tier])}</span>
    </div>
    <p class="landing-spm-popup__kec">Kec. ${escapeHtml(kecamatan)}</p>
  </div>
  <div class="landing-spm-popup__coverage-block">
    <p class="landing-spm-popup__coverage">${percentage}</p>
    <p class="landing-spm-popup__coverage-label">${coverageLabel}</p>
    <div class="landing-spm-popup__progress" aria-hidden="true">
      <div class="landing-spm-popup__progress-fill" style="width:${percentValue}%"></div>
    </div>
  </div>
  <dl class="landing-spm-popup__grid">
    ${extraRows}
    <div><dt>${copy.popupJiwa}</dt><dd>${formatCount(stats.jiwa)}</dd></div>
    <div><dt>${copy.popupTargetKk}</dt><dd>${formatCount(stats.target)}</dd></div>
    <div><dt>${copy.popupGapKk}</dt><dd>${formatCount(gapKk)}</dd></div>
    <div><dt>${unitLabel}</dt><dd>${formatCount(stats.unit_count)}</dd></div>
  </dl>
</div>`
}

function buildVillageTooltip(stats: VillageStats) {
    const percentage = formatDesaCoveragePercentage(stats.kk, stats.target)
    const kecamatan = stats.kecamatan?.trim()
    return kecamatan ? `${stats.desa} · Kec. ${kecamatan} · ${percentage}` : `${stats.desa} · ${percentage}`
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

function buildFeatureFlowMeta(data: GeoJSON.FeatureCollection, statsByWilayah: Record<string, VillageStats>) {
    const meta = new Map<string, FlowMeta>()
    const maxIntensity = Math.max(...Object.values(statsByWilayah).map((entry) => entry.intensity), 1)

    for (const feature of data.features) {
        const key = getWilayahKey(feature)
        if (!key || meta.has(key)) continue

        const stats = statsByWilayah[key]
        const intensityValue = stats?.intensity ?? 0
        const intensity = maxIntensity > 0 ? intensityValue / maxIntensity : 0
        const center = L.geoJSON(feature).getBounds().getCenter()

        meta.set(key, {
            phase: center.lng * 4.8 + center.lat * 7.2,
            intensity,
            hasCapaian: intensityValue > 0,
        })
    }

    return meta
}

function flowStyle(meta: FlowMeta, timeMs: number, reveal: number, theme: MapTheme): FlowStyle {
    const eased = Math.min(1, reveal * reveal)
    const t = timeMs * FLOW_SPEED

    const wavePrimary = Math.sin(t * 2.4 - meta.phase * 0.085)
    const waveSecondary = Math.sin(t * 3.8 - meta.phase * 0.11 + 1.4) * 0.58
    const waveTertiary = Math.sin(t * 1.6 + meta.phase * 0.04 - 0.8) * 0.35
    const ripple = (wavePrimary + waveSecondary + waveTertiary + 1.93) / 3.86

    if (theme === 'sanitation') {
        if (!meta.hasCapaian) {
            const hue = 38 + ripple * 8
            return {
                fillColor: `hsl(${hue} ${20 + ripple * 6}% ${18 + ripple * 4}%)`,
                fillOpacity: (0.035 + ripple * 0.05) * eased,
                color: `rgba(251, 191, 36, ${0.14 + ripple * 0.16})`,
                weight: 0.55,
                opacity: (0.22 + ripple * 0.18) * eased,
            }
        }

        const flow = ripple * 0.55 + meta.intensity * 0.45
        const hue = 142 + flow * 24 + wavePrimary * 6
        const saturation = 48 + meta.intensity * 30 + ripple * 12
        const lightness = 26 + meta.intensity * 22 + ripple * 14

        return {
            fillColor: `hsl(${hue} ${saturation}% ${lightness}%)`,
            fillOpacity: (0.2 + meta.intensity * 0.38 + ripple * 0.12) * eased,
            color: `rgba(${74 + ripple * 30}, ${222 + ripple * 18}, ${128 + ripple * 20}, ${0.4 + ripple * 0.36})`,
            weight: 0.75 + meta.intensity * 0.65,
            opacity: (0.4 + ripple * 0.42) * eased,
        }
    }

    if (!meta.hasCapaian) {
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

type GeoWilayahProps = {
    village?: string
    district?: string
}

function getWilayahKey(feature?: GeoJSON.Feature) {
    const props = (feature?.properties as GeoWilayahProps | undefined) ?? {}
    return normalizeWilayahKey(props.village, props.district)
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

function MapInstanceBridge({ onReady }: { onReady: (map: L.Map) => void }) {
    const map = useMap()

    useEffect(() => {
        onReady(map)
    }, [map, onReady])

    return null
}

function CianjurMapMask({
    boundary,
    active,
}: {
    boundary: GeoJSON.Polygon | GeoJSON.MultiPolygon | null
    active: boolean
}) {
    const map = useMap()

    useEffect(() => {
        if (!active || !boundary) return
        return addCianjurMaskLayer(map, boundary)
    }, [active, boundary, map])

    return null
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

        const fitMapToBounds = () => {
            map.invalidateSize({ animate: false, pan: false })
            map.setMaxBounds(bounds)
            map.fitBounds(bounds, {
                padding: CIANJUR_MAP_PADDING,
                animate: false,
            })

            const minZoom = map.getBoundsZoom(bounds, false, L.point(...CIANJUR_MAP_PADDING))
            map.setMinZoom(minZoom)
            map.setMaxZoom(13)
            map.options.maxBoundsViscosity = 1
        }

        fitMapToBounds()
        const timer = window.setTimeout(fitMapToBounds, 200)

        return () => window.clearTimeout(timer)
    }, [active, bounds, map])

    return null
}

function MapSizeInvalidator({
    containerRef,
    active,
}: {
    containerRef: RefObject<HTMLDivElement | null>
    active: boolean
}) {
    const map = useMap()

    useEffect(() => {
        if (!active) return

        const invalidate = () => {
            map.invalidateSize({ animate: false, pan: false })
        }

        invalidate()
        const timer = window.setTimeout(invalidate, 200)

        const container = containerRef.current
        let resizeObserver: ResizeObserver | null = null

        if (container && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => invalidate())
            resizeObserver.observe(container)
        }

        window.addEventListener('resize', invalidate)
        window.addEventListener('orientationchange', invalidate)

        return () => {
            window.clearTimeout(timer)
            resizeObserver?.disconnect()
            window.removeEventListener('resize', invalidate)
            window.removeEventListener('orientationchange', invalidate)
        }
    }, [active, containerRef, map])

    return null
}

function FlowingCapaianGeoJson({
    data,
    statsByWilayah,
    reveal,
    animate,
    sector,
    mapCopy,
    selectedDesaId,
    onDesaSelect,
}: {
    data: GeoJSON.FeatureCollection
    statsByWilayah: Record<string, VillageStats>
    reveal: number
    animate: boolean
    sector: LandingSpmSector
    mapCopy: PublicMessages['landing']['spm']['map']
    selectedDesaId?: number | null
    onDesaSelect?: (desaId: number | null) => void
}) {
    const map = useMap()
    const layerRef = useRef<L.GeoJSON | null>(null)
    const theme: MapTheme = sector === 'sanitasi' ? 'sanitation' : 'water'
    const flowMeta = useMemo(
        () => buildFeatureFlowMeta(data, statsByWilayah),
        [data, statsByWilayah],
    )

    useEffect(() => {
        layerRef.current?.remove()

        const layer = L.geoJSON(data, {
            renderer: L.canvas({ padding: 0.5 }),
            style: (feature) => {
                const stats = statsByWilayah[getWilayahKey(feature as GeoJSON.Feature)]
                const base = flowStyle(
                    flowMeta.get(getWilayahKey(feature as GeoJSON.Feature)) ?? DEFAULT_FLOW_META,
                    0,
                    0,
                    theme,
                )
                if (stats && selectedDesaId === stats.desa_id) {
                    return {
                        ...base,
                        weight: Math.max(base.weight, 2.2),
                        opacity: 1,
                        color: sector === 'sanitasi' ? 'rgba(167, 243, 208, 0.95)' : 'rgba(186, 230, 253, 0.95)',
                    }
                }
                return base
            },
            onEachFeature: (feature, layerInstance) => {
                const stats = statsByWilayah[getWilayahKey(feature as GeoJSON.Feature)]
                if (!stats) return

                layerInstance.bindPopup(buildVillagePopupHtml(stats, sector, mapCopy), {
                    className: 'landing-spm-map-popup',
                    maxWidth: 300,
                })
                layerInstance.bindTooltip(buildVillageTooltip(stats), {
                    className: 'landing-spm-map-tooltip',
                    sticky: true,
                    direction: 'top',
                    opacity: 0.95,
                })

                if (onDesaSelect) {
                    layerInstance.on('click', (event) => {
                        L.DomEvent.stopPropagation(event)
                        onDesaSelect(
                            selectedDesaId === stats.desa_id ? null : stats.desa_id,
                        )
                    })
                }
            },
        }).addTo(map)

        layerRef.current = layer

        return () => {
            layer.remove()
            layerRef.current = null
        }
    }, [data, flowMeta, map, mapCopy, onDesaSelect, sector, selectedDesaId, statsByWilayah, theme])

    useEffect(() => {
        if (!layerRef.current) return

        let frame = 0
        let running = true

        const paint = (time: number) => {
            if (!running || !layerRef.current) return

            layerRef.current.setStyle((feature) => {
                const key = getWilayahKey(feature as GeoJSON.Feature)
                const stats = statsByWilayah[key]
                const base = flowStyle(
                    flowMeta.get(key) ?? DEFAULT_FLOW_META,
                    time,
                    reveal,
                    theme,
                )
                if (stats && selectedDesaId === stats.desa_id) {
                    return {
                        ...base,
                        weight: Math.max(base.weight, 2.2),
                        opacity: 1,
                        color:
                            theme === 'sanitation'
                                ? 'rgba(167, 243, 208, 0.95)'
                                : 'rgba(186, 230, 253, 0.95)',
                    }
                }
                return base
            })

            if (animate && reveal > 0.08) {
                frame = requestAnimationFrame(paint)
            }
        }

        frame = requestAnimationFrame(paint)

        return () => {
            running = false
            cancelAnimationFrame(frame)
        }
    }, [animate, flowMeta, reveal, selectedDesaId, statsByWilayah, theme])

    return null
}

type LandingSpmMapProps = {
    sector: LandingSpmSector
    tahun?: string
    onTahunChange?: (tahun: string) => void
    selectedDesaId?: number | null
    onDesaSelect?: (desaId: number | null) => void
}

export function LandingSpmMap({
    sector,
    tahun,
    onTahunChange,
    selectedDesaId,
    onDesaSelect,
}: LandingSpmMapProps) {
    const { messages } = usePublicLocale()
    const mapCopy = messages.landing.spm.map
    const containerRef = useRef<HTMLDivElement>(null)
    const [leafletMap, setLeafletMap] = useState<L.Map | null>(null)
    const inView = useInView(containerRef, { once: true, amount: 0.25 })
    const [isMapMounted, setIsMapMounted] = useState(false)
    const revealProgress = useRevealProgress(inView && isMapMounted)

    useEffect(() => {
        if (!inView) return
        setIsMapMounted(true)
    }, [inView])

    const tahunParams = buildSpmTahunQueryParam(tahun)

    const { data: airMapStatsResponse, isFetching: isAirMapFetching } = useQuery({
        queryKey: ['public-spam-map-stats', tahun ?? 'all'],
        queryFn: () => getPublicSpamMapStats(tahunParams),
        staleTime: 30_000,
        enabled: inView && sector === 'air_minum',
        retry: 1,
        throwOnError: false,
    })

    const { data: airUnitStatsResponse, isFetching: isAirUnitFetching } = useQuery({
        queryKey: ['public-spam-unit-stats', tahun ?? 'all'],
        queryFn: () => getPublicSpamUnitStats(tahunParams),
        staleTime: 30_000,
        enabled: inView && sector === 'air_minum',
        retry: 1,
        throwOnError: false,
    })

    const { data: sanitasiMapStatsResponse, isFetching: isSanitasiMapFetching } = useQuery({
        queryKey: ['public-sanitasi-map-stats', tahun ?? 'all'],
        queryFn: () => getPublicSanitasiMapStats(tahunParams),
        staleTime: 30_000,
        enabled: inView && sector === 'sanitasi',
        retry: 1,
        throwOnError: false,
    })

    const { data: sanitasiStatsResponse, isFetching: isSanitasiStatsFetching } = useQuery({
        queryKey: ['public-sanitasi-stats', tahun ?? 'all'],
        queryFn: () => getPublicSanitasiStats(tahunParams),
        staleTime: 30_000,
        enabled: inView && sector === 'sanitasi',
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

    const { data: boundaryGeoJsonData } = useQuery({
        queryKey: ['landing-geojson-cianjur-boundary'],
        queryFn: async () => {
            const response = await fetch(boundaryGeoJsonUrl)
            if (!response.ok) throw new Error('Gagal memuat batas kabupaten')
            return response.json() as Promise<GeoJSON.FeatureCollection>
        },
        staleTime: Infinity,
        enabled: inView,
    })

    const statsByWilayah = useMemo(() => {
        const map: Record<string, VillageStats> = {}

        if (sector === 'air_minum') {
            for (const row of filterPublicSpmMapStats(airMapStatsResponse?.data ?? [])) {
                map[normalizeWilayahKey(row.desa, row.kecamatan)] = {
                    desa_id: row.desa_id,
                    intensity: row.sr,
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
        }

        for (const row of filterPublicSpmMapStats(sanitasiMapStatsResponse?.data ?? [])) {
            map[normalizeWilayahKey(row.desa, row.kecamatan)] = {
                desa_id: row.desa_id,
                intensity: row.pemanfaat_kk,
                kk: row.pemanfaat_kk,
                jiwa: row.pemanfaat_jiwa,
                unit_count: row.unit_count,
                target: row.target_kk,
                desa: row.desa,
                kecamatan: row.kecamatan,
                penduduk: row.jumlah_penduduk,
            }
        }

        return map
    }, [airMapStatsResponse?.data, sanitasiMapStatsResponse?.data, sector])

    const aggregateStats = useMemo(() => {
        if (sector === 'air_minum') {
            const rows = filterPublicSpmMapStats(airMapStatsResponse?.data ?? [])
            const unitStats = airUnitStatsResponse?.data
            const metrics = buildPublicAirMinumMetrics(unitStats)
            const desaWithCapaian = rows.filter((row) => row.kk > 0).length

            return {
                sector,
                unitStats,
                airMetrics: metrics,
                sanitasiStats: undefined as PublicSanitasiStats | undefined,
                desaTotal: unitStats?.wilayah_total_desa ?? rows.length,
                desaWithCapaian,
                kecamatan: unitStats?.wilayah_total_kecamatan ?? 0,
                scopeLabel: metrics?.scopeLabel ?? 'Terakumulasi',
            }
        }

        const rows = filterPublicSpmMapStats(sanitasiMapStatsResponse?.data ?? [])
        const sanitasiStats = sanitasiStatsResponse?.data
        const sanitasiMetrics = buildPublicSanitasiMetrics(
            sanitasiStats,
            messages.landing.spm.sanitasiYearFilter.all,
        )

        return {
            sector,
            unitStats: undefined as UnitSpamStats | undefined,
            airMetrics: undefined,
            sanitasiStats,
            sanitasiMetrics,
            desaTotal: sanitasiStats?.total_desa ?? rows.length,
            desaWithCapaian: sanitasiStats?.desa_with_infrastruktur ?? rows.filter((r) => r.pemanfaat_kk > 0).length,
            kecamatan: sanitasiStats?.wilayah_total_kecamatan ?? 0,
            scopeLabel: sanitasiMetrics?.scopeLabel ?? messages.landing.spm.sanitasiYearFilter.all,
        }
    }, [airMapStatsResponse?.data, airUnitStatsResponse?.data, sanitasiMapStatsResponse?.data, sanitasiStatsResponse?.data, sector, messages.landing.spm.sanitasiYearFilter.all])

    const cianjurGeoJson = useMemo(() => buildCianjurGeoJson(geoJsonData), [geoJsonData])
    const cianjurBoundary = useMemo(
        () => getBoundaryGeometry(boundaryGeoJsonData),
        [boundaryGeoJsonData],
    )

    const mapBounds = useMemo(() => {
        if (cianjurBoundary) {
            return L.geoJSON(cianjurBoundary).getBounds()
        }
        if (!cianjurGeoJson) return null
        return L.geoJSON(cianjurGeoJson).getBounds()
    }, [cianjurBoundary, cianjurGeoJson])

    const mapCenter = useMemo((): [number, number] => {
        if (!mapBounds) return CIANJUR_FALLBACK_CENTER
        const center = mapBounds.getCenter()
        return [center.lat, center.lng]
    }, [mapBounds])

    const desaIdToWilayahKey = useMemo(() => {
        const lookup: Record<number, string> = {}
        for (const [key, stats] of Object.entries(statsByWilayah)) {
            lookup[stats.desa_id] = key
        }
        return lookup
    }, [statsByWilayah])

    useEffect(() => {
        if (!leafletMap || !selectedDesaId || !cianjurGeoJson) return

        const wilayahKey = desaIdToWilayahKey[selectedDesaId]
        if (!wilayahKey) return

        const feature = cianjurGeoJson.features.find(
            (item) => getWilayahKey(item) === wilayahKey,
        )
        if (!feature) return

        const bounds = L.geoJSON(feature).getBounds()
        leafletMap.flyToBounds(bounds, {
            padding: CIANJUR_MAP_PADDING,
            maxZoom: 12,
            duration: 0.8,
        })
    }, [selectedDesaId, desaIdToWilayahKey, cianjurGeoJson, leafletMap])

    const isLoading = isGeoJsonLoading
    const isStatsRefreshing =
        sector === 'air_minum'
            ? isAirMapFetching || isAirUnitFetching
            : isSanitasiMapFetching || isSanitasiStatsFetching

    return (
        <motion.div
            ref={containerRef}
            className={sector === 'sanitasi' ? 'landing-spm-map-shell landing-spm-map-shell--sanitasi relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 shadow-2xl shadow-black/25' : 'landing-spm-map-shell relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 shadow-2xl shadow-black/25'}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="landing-spm-map-canvas relative h-[min(58vh,520px)] min-h-[280px] sm:h-[min(72vh,680px)] sm:min-h-[420px] w-full">
                {isLoading || !isMapMounted ? (
                    <div className="flex h-full items-center justify-center bg-slate-950/40">
                        <div className="text-center">
                            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
                            <p className="text-xs uppercase tracking-[0.2em] text-white/55">{mapCopy.loading}</p>
                        </div>
                    </div>
                ) : cianjurGeoJson && mapBounds ? (
                    <MapContainer
                        key={sector}
                        center={mapCenter}
                        zoom={10}
                        minZoom={9}
                        maxZoom={13}
                        maxBounds={mapBounds}
                        maxBoundsViscosity={1}
                        scrollWheelZoom
                        preferCanvas
                        zoomControl={false}
                        className="h-full w-full landing-spm-map-leaflet"
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        <MapInstanceBridge onReady={setLeafletMap} />
                        <MapSizeInvalidator containerRef={containerRef} active={inView && isMapMounted} />
                        <CianjurMapController bounds={mapBounds} active={inView} />
                        <CianjurMapMask boundary={cianjurBoundary} active={inView && isMapMounted} />
                        <FlowingCapaianGeoJson
                            data={cianjurGeoJson}
                            statsByWilayah={statsByWilayah}
                            reveal={revealProgress}
                            animate={inView}
                            sector={sector}
                            mapCopy={mapCopy}
                            selectedDesaId={selectedDesaId}
                            onDesaSelect={onDesaSelect}
                        />
                    </MapContainer>
                ) : null}
            </div>

            {!isLoading && (
                <>
                    <MapSummaryPanel
                        sector={sector}
                        mapCopy={mapCopy}
                        unitStats={aggregateStats.unitStats}
                        airMetrics={aggregateStats.airMetrics}
                        sanitasiMetrics={aggregateStats.sanitasiMetrics}
                        sanitasiStats={aggregateStats.sanitasiStats}
                        desaTotal={aggregateStats.desaTotal}
                        desaWithCapaian={aggregateStats.desaWithCapaian}
                        kecamatan={aggregateStats.kecamatan}
                        scopeLabel={aggregateStats.scopeLabel}
                        isRefreshing={isStatsRefreshing}
                        tahun={tahun}
                        onTahunChange={onTahunChange}
                    />
                    <MapZoomControls map={leafletMap} bounds={mapBounds} copy={mapCopy} />
                    <MapLegend sector={sector} copy={mapCopy} />
                    <MapInteractionHint text={mapCopy.hint} />
                </>
            )}
        </motion.div>
    )
}

function SummaryStat({
    label,
    value,
    hint,
}: {
    label: string
    value: string
    hint?: string
}) {
    return (
        <div className="landing-spm-summary-stat">
            <p className="landing-spm-summary-stat__label">{label}</p>
            <p className="landing-spm-summary-stat__value">{value}</p>
            {hint ? <p className="landing-spm-summary-stat__hint">{hint}</p> : null}
        </div>
    )
}

function DesaCoverageProgress({
    label,
    valueLine,
    percent,
    hint,
    textClass,
    fillClass,
}: {
    label: string
    valueLine: string
    percent: number
    hint: string
    textClass: string
    fillClass: string
}) {
    return (
        <div className="landing-spm-summary-progress col-span-2">
            <div className="landing-spm-summary-progress__header">
                <p className="landing-spm-summary-stat__label">{label}</p>
                <p className={`landing-spm-summary-progress__value ${textClass}`}>{valueLine}</p>
            </div>
            <div className="landing-spm-summary-progress__track" aria-hidden="true">
                <div
                    className={`landing-spm-summary-progress__fill ${fillClass}`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                />
            </div>
            <p className="landing-spm-summary-stat__hint">{hint}</p>
        </div>
    )
}

function MapSummaryShell({
    expanded,
    onToggle,
    title,
    scopeLabel,
    updatedAtLabel,
    accentClass,
    isRefreshing,
    refreshAccentClass,
    mapCopy,
    tahun,
    onTahunChange,
    sector,
    children,
}: {
    expanded: boolean
    onToggle: () => void
    title: string
    scopeLabel: string
    updatedAtLabel: string | null
    accentClass: string
    isRefreshing: boolean
    refreshAccentClass: string
    mapCopy: PublicMessages['landing']['spm']['map']
    tahun?: string
    onTahunChange?: (tahun: string) => void
    sector: LandingSpmSector
    children: ReactNode
}) {
    return (
        <div
            className={
                expanded
                    ? 'landing-spm-summary pointer-events-none absolute left-4 top-4 z-[500] max-w-[min(100%-2rem,380px)]'
                    : 'landing-spm-summary landing-spm-summary--collapsed pointer-events-none absolute left-4 top-4 z-[500] max-w-[min(100%-2rem,380px)]'
            }
        >
            <div className="landing-spm-summary__panel pointer-events-auto rounded-xl border border-white/15 bg-slate-950/78 p-4 shadow-xl shadow-black/30 backdrop-blur-md">
                <div className={expanded ? 'mb-3 flex items-start justify-between gap-3' : 'flex items-center justify-between gap-3'}>
                    <div className="min-w-0 flex-1">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${accentClass}`}>
                            {title}
                        </p>
                        {expanded ? (
                            <>
                                <p className="mt-1 text-[11px] text-white/55">{scopeLabel}</p>
                                {updatedAtLabel ? (
                                    <p className="mt-1 text-[10px] text-white/40">{updatedAtLabel}</p>
                                ) : null}
                            </>
                        ) : (
                            <p className="mt-0.5 truncate text-[11px] text-white/45">{scopeLabel}</p>
                        )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {expanded && onTahunChange ? (
                            <SpmYearSelector sector={sector} value={tahun} onChange={onTahunChange} />
                        ) : null}
                        {isRefreshing ? (
                            <span className={`inline-flex h-2 w-2 animate-pulse rounded-full ${refreshAccentClass}`} />
                        ) : null}
                        <button
                            type="button"
                            className="landing-spm-summary__toggle"
                            aria-expanded={expanded}
                            aria-label={expanded ? mapCopy.summaryHide : mapCopy.summaryShow}
                            onClick={onToggle}
                        >
                            {expanded ? (
                                <ChevronUp className="h-4 w-4" aria-hidden />
                            ) : (
                                <ChevronDown className="h-4 w-4" aria-hidden />
                            )}
                        </button>
                    </div>
                </div>

                {expanded ? children : null}
            </div>
        </div>
    )
}

function MapSummaryPanel({
    sector,
    mapCopy,
    unitStats,
    airMetrics,
    sanitasiMetrics,
    sanitasiStats,
    desaTotal,
    desaWithCapaian,
    kecamatan,
    scopeLabel,
    isRefreshing,
    tahun,
    onTahunChange,
}: {
    sector: LandingSpmSector
    mapCopy: PublicMessages['landing']['spm']['map']
    unitStats?: UnitSpamStats
    airMetrics?: ReturnType<typeof buildPublicAirMinumMetrics>
    sanitasiMetrics?: ReturnType<typeof buildPublicSanitasiMetrics>
    sanitasiStats?: PublicSanitasiStats
    desaTotal: number
    desaWithCapaian: number
    kecamatan: number
    scopeLabel: string
    isRefreshing: boolean
    tahun?: string
    onTahunChange?: (tahun: string) => void
}) {
    const [expanded, setExpanded] = useState(true)
    const { messages } = usePublicLocale()
    const yearCopy = messages.landing.spm.yearFilter
    const accentClass = sector === 'sanitasi' ? 'text-emerald-200/70' : 'text-cyan-200/70'
    const accentFillClass = sector === 'sanitasi' ? 'landing-spm-summary-progress__fill--sanitasi' : 'landing-spm-summary-progress__fill--air'
    const refreshAccentClass = sector === 'sanitasi' ? 'bg-emerald-300/80' : 'bg-cyan-300/80'
    const desaLine = `${formatCount(desaWithCapaian)} / ${formatCount(desaTotal)} desa`
    const desaPercent = desaTotal > 0 ? (desaWithCapaian / desaTotal) * 100 : 0
    const title =
        sector === 'sanitasi' ? mapCopy.summarySanitasiTitle : mapCopy.summaryAirTitle

    if (sector === 'sanitasi' && sanitasiStats) {
        const coverage = `${formatCoverage(sanitasiStats.coverage_percentage)}%`
        const kkLine = `${formatCount(sanitasiStats.total_pemanfaat_kk)} / ${formatCount(sanitasiStats.target_kk)} KK`
        const jiwa = formatCount(sanitasiStats.total_pemanfaat_jiwa)
        const units = formatCount(sanitasiStats.total_count)
        const sanitasiUpdatedAtLabel =
            sanitasiMetrics?.generatedAtLabel != null
                ? yearCopy.updatedAt.replace('{time}', sanitasiMetrics.generatedAtLabel)
                : null

        return (
            <MapSummaryShell
                expanded={expanded}
                onToggle={() => setExpanded((value) => !value)}
                title={title}
                scopeLabel={scopeLabel}
                updatedAtLabel={sanitasiUpdatedAtLabel}
                accentClass={accentClass}
                isRefreshing={isRefreshing}
                refreshAccentClass={refreshAccentClass}
                mapCopy={mapCopy}
                tahun={tahun}
                onTahunChange={onTahunChange}
                sector={sector}
            >
                <div className="grid grid-cols-2 gap-3">
                    <SummaryStat label={mapCopy.coverageJiwa} value={coverage} hint={kkLine} />
                    <SummaryStat label={mapCopy.jiwaPemanfaat} value={jiwa} hint={`${formatCount(sanitasiStats.total_penduduk)} penduduk`} />
                    <SummaryStat
                        label={mapCopy.infrastruktur}
                        value={units}
                        hint={kecamatan > 0 ? `${formatCount(kecamatan)} kecamatan` : undefined}
                    />
                    <DesaCoverageProgress
                        label={mapCopy.desaCapaian}
                        valueLine={`${formatCoveragePercent(desaPercent)} · ${desaLine}`}
                        percent={desaPercent}
                        hint={mapCopy.desaCapaianHint}
                        textClass={accentClass}
                        fillClass={accentFillClass}
                    />
                </div>
            </MapSummaryShell>
        )
    }

    const coverage = airMetrics ? `${formatCoverage(airMetrics.coverage)}%` : '—'
    const kkLine = airMetrics
        ? `${formatCount(airMetrics.totalKk)} / ${formatCount(airMetrics.totalTarget)} KK`
        : '—'
    const jiwa = airMetrics ? formatCount(airMetrics.totalJiwa) : '—'
    const units = unitStats ? formatCount(unitStats.total_units) : '—'
    const sr = airMetrics ? formatCount(airMetrics.totalSr) : '—'
    const updatedAtLabel =
        airMetrics?.generatedAtLabel != null
            ? yearCopy.updatedAt.replace('{time}', airMetrics.generatedAtLabel)
            : null

    return (
        <MapSummaryShell
            expanded={expanded}
            onToggle={() => setExpanded((value) => !value)}
            title={title}
            scopeLabel={scopeLabel}
            updatedAtLabel={updatedAtLabel}
            accentClass={accentClass}
            isRefreshing={isRefreshing}
            refreshAccentClass={refreshAccentClass}
            mapCopy={mapCopy}
            tahun={tahun}
            onTahunChange={onTahunChange}
            sector={sector}
        >
            <div className="grid grid-cols-2 gap-3">
                <SummaryStat label={mapCopy.coverageSpm} value={coverage} hint={kkLine} />
                <SummaryStat label={mapCopy.jiwaTerlayani} value={jiwa} hint={`${sr} SR`} />
                <SummaryStat label={mapCopy.unitSpam} value={units} hint={kecamatan > 0 ? `${formatCount(kecamatan)} kecamatan` : undefined} />
                <DesaCoverageProgress
                    label={mapCopy.desaCapaian}
                    valueLine={`${formatCoveragePercent(desaPercent)} · ${desaLine}`}
                    percent={desaPercent}
                    hint={mapCopy.desaCapaianHint}
                    textClass={accentClass}
                    fillClass={accentFillClass}
                />
            </div>
        </MapSummaryShell>
    )
}

function MapLegend({
    sector,
    copy,
}: {
    sector: LandingSpmSector
    copy: PublicMessages['landing']['spm']['map']
}) {
    const isSanitasi = sector === 'sanitasi'
    const tierClass = isSanitasi ? 'landing-spm-legend__swatch--sanitasi' : 'landing-spm-legend__swatch--air'

    const tiers = [
        { key: 'none', label: copy.legendNone, modifier: '--none' },
        { key: 'low', label: copy.legendLow, modifier: '--low' },
        { key: 'mid', label: copy.legendMid, modifier: '--mid' },
        { key: 'high', label: copy.legendHigh, modifier: '--high' },
    ] as const

    return (
        <div className="landing-spm-legend pointer-events-none absolute bottom-4 right-4 z-[500] max-w-[min(100%-2rem,240px)]">
            <div className="pointer-events-auto rounded-xl border border-white/15 bg-slate-950/78 px-4 py-3 shadow-lg shadow-black/25 backdrop-blur-md">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                    {copy.legendTitle}
                </p>
                <ul className="landing-spm-legend__tiers">
                    {tiers.map((tier) => (
                        <li key={tier.key} className="landing-spm-legend__tier">
                            <span
                                className={`landing-spm-legend__swatch ${tierClass} landing-spm-legend__swatch${tier.modifier}`}
                                aria-hidden
                            />
                            <span>{tier.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

function MapZoomControls({
    map,
    bounds,
    copy,
}: {
    map: L.Map | null
    bounds: L.LatLngBounds | null
    copy: PublicMessages['landing']['spm']['map']
}) {
    if (!map) return null

    return (
        <div className="landing-spm-map-controls pointer-events-none absolute bottom-4 left-4 z-[500]">
            <div className="pointer-events-auto flex flex-col overflow-hidden rounded-xl border border-white/15 bg-slate-950/78 shadow-lg shadow-black/25 backdrop-blur-md">
                <button
                    type="button"
                    className="landing-spm-map-controls__btn"
                    aria-label={copy.zoomIn}
                    onClick={() => map.zoomIn()}
                >
                    <Plus className="h-4 w-4" aria-hidden />
                </button>
                <button
                    type="button"
                    className="landing-spm-map-controls__btn landing-spm-map-controls__btn--divider"
                    aria-label={copy.zoomOut}
                    onClick={() => map.zoomOut()}
                >
                    <Minus className="h-4 w-4" aria-hidden />
                </button>
                <button
                    type="button"
                    className="landing-spm-map-controls__btn"
                    aria-label={copy.resetView}
                    onClick={() => {
                        if (!bounds) return
                        map.fitBounds(bounds, {
                            padding: CIANJUR_MAP_PADDING,
                            animate: true,
                            duration: 0.8,
                        })
                    }}
                >
                    <Home className="h-4 w-4" aria-hidden />
                </button>
            </div>
        </div>
    )
}

function MapInteractionHint({ text }: { text: string }) {
    return (
        <div className="landing-spm-map-hint pointer-events-none absolute inset-x-0 top-14 z-[400] flex justify-center px-4 sm:top-auto sm:bottom-[4.5rem]">
            <p className="landing-spm-map-hint__pill">{text}</p>
        </div>
    )
}