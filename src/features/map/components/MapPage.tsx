import { useMemo, useState, useCallback, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import HeatmapLayer from 'react-leaflet-heat-layer'
import 'leaflet/dist/leaflet.css'
import { getFotoList } from '@/features/foto/api'
import { getOutput } from '@/features/output/api/output'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { createProgressMarkerIcon } from '../utils/MapIcon'
import {
    buildJobsByVillage,
    buildPekerjaanPins,
    choroplethFillColor,
    filterFotoWithCoords,
    normalizeVillageKey,
    PROGRESS_MARKER_COLORS,
} from '../utils/map-utils'
import { MapPekerjaanPinDetail } from './MapPekerjaanPinDetail'
import {
    MapPin,
    Flame,
    RotateCcw,
    Loader2,
    Search,
    Layers,
    Building2,
    Camera,
    X,
    ChevronRight,
} from 'lucide-react'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useAppSettingsStore } from '@/stores/app-settings-store'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { cn } from '@/lib/utils'
// @ts-ignore
import geoJsonUrl from '@/assets/geojson/kecamatan/id3203_cianjur_simplified.geojson?url'

type ViewMode = 'markers' | 'heatmap'

function MapController({ bounds }: { bounds: L.LatLngBounds | null }) {
    const map = useMap()
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 })
        }
    }, [bounds, map])
    return null
}

function StatChip({
    label,
    value,
    hint,
    loading,
}: {
    label: string
    value: string
    hint?: string
    loading?: boolean
}) {
    return (
        <div className="rounded-xl border border-white/60 bg-white/85 px-3 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-950/80">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
            {loading ? (
                <Skeleton className="mt-1 h-6 w-16" />
            ) : (
                <div className="mt-0.5 text-lg font-bold leading-none">{value}</div>
            )}
            {hint ? <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div> : null}
        </div>
    )
}

export default function MapPage() {
    const { tahunAnggaran, setTahunAnggaran } = useAppSettingsStore()
    const { tahunAnggaran: settingsYear } = useAppSettingsValues()
    const routeSearch = useSearch({ from: '/_authenticated/map/' })
    const [viewMode, setViewMode] = useState<ViewMode>('markers')
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
    const [selectedVillage, setSelectedVillage] = useState<string | null>(null)
    const [selectedPekerjaanId, setSelectedPekerjaanId] = useState<number | null>(null)
    const [galleryIndex, setGalleryIndex] = useState(0)
    const [searchInput, setSearchInput] = useState(routeSearch.search || '')
    const [search, setSearch] = useState(routeSearch.search || '')
    const [isMapMounted, setIsMapMounted] = useState(false)
    const [fitBounds, setFitBounds] = useState<L.LatLngBounds | null>(null)
    const [panelOpen, setPanelOpen] = useState(true)

    const activeYear = tahunAnggaran || settingsYear

    useEffect(() => {
        setIsMapMounted(true)
        return () => setIsMapMounted(false)
    }, [])

    useEffect(() => {
        setSearchInput(routeSearch.search || '')
        setSearch(routeSearch.search || '')
    }, [routeSearch.search])

    useEffect(() => {
        const timer = window.setTimeout(() => setSearch(searchInput), 350)
        return () => window.clearTimeout(timer)
    }, [searchInput])

    useEffect(() => {
        if (routeSearch.tahun && routeSearch.tahun !== tahunAnggaran) {
            setTahunAnggaran(routeSearch.tahun)
        }
    }, [routeSearch.tahun, setTahunAnggaran, tahunAnggaran])

    const { data: response, isLoading: isPhotosLoading } = useQuery({
        queryKey: ['foto-all', { tahun: activeYear, search }],
        queryFn: () => getFotoList({ per_page: -1, tahun: activeYear, search }),
    })

    const { data: jobsResponse, isLoading: isJobsLoading } = useQuery({
        queryKey: ['pekerjaan-all', { tahun: activeYear, search, summary: true }],
        queryFn: () => getPekerjaan({ per_page: -1, tahun: activeYear, search, summary: true }),
    })

    const { data: outputResponse, isLoading: isOutputLoading } = useQuery({
        queryKey: ['output-all', { tahun: activeYear }],
        queryFn: () => getOutput({ per_page: -1, tahun: activeYear }),
    })

    const { data: geoJsonData, isLoading: isGeoJsonLoading } = useQuery({
        queryKey: ['geojson-kecamatan-cianjur'],
        queryFn: async () => {
            const res = await fetch(geoJsonUrl)
            if (!res.ok) throw new Error('Failed to fetch GeoJSON')
            return res.json()
        },
        staleTime: Infinity,
    })

    const mappedPhotos = useMemo(() => filterFotoWithCoords(response?.data ?? []), [response?.data])
    const photosWithCoords = useMemo(() => mappedPhotos.map((entry) => entry.foto), [mappedPhotos])
    const jobs = jobsResponse?.data ?? []
    const outputs = outputResponse?.data ?? []
    const pekerjaanPins = useMemo(
        () => buildPekerjaanPins(mappedPhotos, jobs, outputs),
        [mappedPhotos, jobs, outputs],
    )

    const heatmapPoints = useMemo(
        () => pekerjaanPins.map((pin) => [pin.coords.lat, pin.coords.lng, pin.fotos.length] as [number, number, number]),
        [pekerjaanPins],
    )
    const jobsByVillage = useMemo(() => buildJobsByVillage(jobs), [jobs])
    const maxVillageJobs = useMemo(() => Math.max(...Object.values(jobsByVillage), 1), [jobsByVillage])

    const districtOptions = useMemo(() => {
        if (!geoJsonData?.features) return []
        const districts: string[] = geoJsonData.features.map((feature: { properties: { district: string } }) => feature.properties.district)
        const unique = Array.from(new Set(districts)).sort()
        return unique.map((district) => ({ label: district, value: district }))
    }, [geoJsonData])

    const initialCenter: [number, number] = useMemo(() => {
        if (pekerjaanPins.length > 0) {
            return [pekerjaanPins[0].coords.lat, pekerjaanPins[0].coords.lng]
        }
        return [-6.82, 107.14]
    }, [pekerjaanPins])

    const selectedPin = useMemo(
        () => pekerjaanPins.find((pin) => pin.pekerjaanId === selectedPekerjaanId) ?? null,
        [pekerjaanPins, selectedPekerjaanId],
    )

    useEffect(() => {
        setGalleryIndex(0)
    }, [selectedPekerjaanId])

    const selectedVillageJobs = selectedVillage
        ? jobsByVillage[normalizeVillageKey(selectedVillage)] || 0
        : 0

    const coveragePercent = jobs.length ? Math.round((pekerjaanPins.length / jobs.length) * 100) : 0
    const totalOutputKomponen = useMemo(
        () => pekerjaanPins.reduce((sum, pin) => sum + pin.outputs.length, 0),
        [pekerjaanPins],
    )

    const isLoading = isPhotosLoading || isJobsLoading || isOutputLoading

    const handleDistrictChange = useCallback(
        (districtName: string) => {
            setSelectedDistrict(districtName)
            setSelectedVillage(null)
            setSelectedPekerjaanId(null)
            if (!geoJsonData) return

            const districtFeature = geoJsonData.features.find(
                (feature: { properties: { district: string } }) => feature.properties.district === districtName,
            )

            if (districtFeature) {
                const layer = L.geoJSON(districtFeature)
                setFitBounds(layer.getBounds())
            }
        },
        [geoJsonData],
    )

    const resetView = useCallback(() => {
        setSelectedDistrict(null)
        setSelectedVillage(null)
        setSelectedPekerjaanId(null)
        setGalleryIndex(0)
        setSearchInput('')
        setSearch('')
        setFitBounds(null)
    }, [])

    const districtStyle = useCallback(
        (feature: { properties: { district: string; village: string } }) => {
            const districtName = feature.properties.district
            const villageName = feature.properties.village
            const isSelected = selectedDistrict === districtName
            const isVillageSelected = selectedVillage === villageName
            const villageJobs = jobsByVillage[normalizeVillageKey(villageName)] || 0
            const intensity = villageJobs / maxVillageJobs

            return {
                fillColor: choroplethFillColor(intensity, isSelected, isVillageSelected),
                weight: isVillageSelected ? 3 : isSelected ? 2.5 : 1,
                opacity: 1,
                color: isVillageSelected ? '#047857' : isSelected ? '#312e81' : '#6366f1',
                fillOpacity: isVillageSelected ? 0.55 : isSelected ? 0.42 : 0.28,
            }
        },
        [jobsByVillage, maxVillageJobs, selectedDistrict, selectedVillage],
    )

    const onEachDistrict = useCallback((feature: { properties: { district: string; village: string } }, layer: L.Layer) => {
        layer.on({
            click: (event) => {
                const districtName = feature.properties.district
                const villageName = feature.properties.village
                setSelectedDistrict(districtName)
                setSelectedVillage(villageName)
                setSelectedPekerjaanId(null)
                const bounds = (event.target as L.GeoJSON).getBounds()
                setFitBounds(bounds)
            },
        })
    }, [])

    const geoJsonLayer = useMemo(() => {
        if (!geoJsonData) return null
        return <GeoJSON data={geoJsonData} style={districtStyle} onEachFeature={onEachDistrict} />
    }, [geoJsonData, districtStyle, onEachDistrict])

    return (
        <>
            <Header />
            <Main fixed className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:gap-4 md:p-4">
                <section className="shrink-0 rounded-2xl border bg-card p-3 shadow-sm md:p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold tracking-tight md:text-2xl">Peta Progress</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Monitor sebaran dokumentasi dan kepadatan pekerjaan per desa
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Cari paket atau penyedia..."
                                    className="h-10 rounded-xl pl-9"
                                />
                            </div>

                            <SearchableSelect
                                options={districtOptions}
                                value={selectedDistrict || ''}
                                onValueChange={handleDistrictChange}
                                placeholder="Filter kecamatan"
                                className="w-full sm:w-[200px]"
                                disabled={isGeoJsonLoading}
                            />

                            <div className="flex items-center gap-2">
                                <div className="flex overflow-hidden rounded-xl border">
                                    <Button
                                        type="button"
                                        variant={viewMode === 'markers' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="rounded-none gap-1.5"
                                        onClick={() => setViewMode('markers')}
                                    >
                                        <MapPin className="h-4 w-4" />
                                        Marker
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
                                        size="sm"
                                        className="rounded-none gap-1.5"
                                        onClick={() => setViewMode('heatmap')}
                                    >
                                        <Flame className="h-4 w-4" />
                                        Heatmap
                                    </Button>
                                </div>

                                {(selectedDistrict || selectedVillage || searchInput) && (
                                    <Button type="button" variant="outline" size="icon" onClick={resetView} title="Reset tampilan">
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
                        <StatChip label="Pekerjaan" value={String(jobs.length)} loading={isJobsLoading} />
                        <StatChip
                            label="Pin lokasi"
                            value={String(pekerjaanPins.length)}
                            hint="Satu pin per pekerjaan"
                            loading={isPhotosLoading}
                        />
                        <StatChip
                            label="Foto lokasi"
                            value={String(photosWithCoords.length)}
                            hint="Semua dokumentasi GPS"
                            loading={isPhotosLoading}
                        />
                        <StatChip
                            label="Output"
                            value={String(totalOutputKomponen)}
                            hint="Komponen di pin peta"
                            loading={isOutputLoading || isJobsLoading}
                        />
                        <StatChip
                            label="Cakupan"
                            value={`${coveragePercent}%`}
                            hint="Pekerjaan punya pin"
                            loading={isLoading}
                        />
                    </div>
                </section>

                <section className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="absolute inset-0 z-0">
                        {isLoading ? (
                            <Skeleton className="h-full w-full rounded-none" />
                        ) : isMapMounted ? (
                            <MapContainer
                                center={initialCenter}
                                zoom={11}
                                scrollWheelZoom
                                className="map-progress-canvas"
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <MapController bounds={fitBounds} />
                                {geoJsonLayer}

                                {viewMode === 'heatmap' && heatmapPoints.length > 0 ? (
                                    <HeatmapLayer latlngs={heatmapPoints} radius={28} blur={18} minOpacity={0.45} />
                                ) : null}

                                {viewMode === 'markers'
                                    ? pekerjaanPins.map((pin) => (
                                          <Marker
                                              key={pin.pekerjaanId}
                                              position={[pin.coords.lat, pin.coords.lng]}
                                              icon={createProgressMarkerIcon(pin.highestProgress)}
                                              eventHandlers={{
                                                  click: () => {
                                                      setSelectedPekerjaanId(pin.pekerjaanId)
                                                      setSelectedVillage(null)
                                                  },
                                              }}
                                          >
                                              <Popup className="map-popup-modern" minWidth={260}>
                                                  <MapPekerjaanPinDetail pin={pin} compact />
                                              </Popup>
                                          </Marker>
                                      ))
                                    : null}
                            </MapContainer>
                        ) : null}
                    </div>

                    {isGeoJsonLoading ? (
                        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border bg-background/90 px-4 py-2 text-xs font-medium shadow-lg backdrop-blur">
                            <Loader2 className="mr-2 inline h-3.5 w-3.5 animate-spin" />
                            Memuat batas wilayah...
                        </div>
                    ) : null}

                    {!isLoading && pekerjaanPins.length === 0 ? (
                        <div className="pointer-events-none absolute inset-x-4 top-1/2 z-10 mx-auto max-w-lg -translate-y-1/2 rounded-2xl border bg-background/92 p-4 text-center shadow-xl backdrop-blur">
                            <Camera className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                            <div className="font-semibold">Belum ada lokasi terpetakan</div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Unggah foto dokumentasi dengan koordinat GPS untuk menampilkan sebaran progress di peta.
                            </p>
                        </div>
                    ) : null}

                    <div
                        className={cn(
                            'pointer-events-none absolute bottom-3 left-3 right-3 z-10 md:bottom-4 md:left-auto md:right-4 md:w-[320px]',
                            !panelOpen && 'md:w-auto',
                        )}
                    >
                    <div className="pointer-events-auto rounded-2xl border border-white/50 bg-white/90 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/88">
                        <button
                            type="button"
                            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left md:hidden"
                            onClick={() => setPanelOpen((open) => !open)}
                        >
                            <span className="flex items-center gap-2 text-sm font-semibold">
                                <Layers className="h-4 w-4" />
                                Detail wilayah
                            </span>
                            <ChevronRight className={cn('h-4 w-4 transition-transform', panelOpen && 'rotate-90')} />
                        </button>

                        <div className={cn('px-4 pb-4', !panelOpen && 'hidden md:block')}>
                            <div className="mb-3 hidden items-center justify-between md:flex">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Layers className="h-4 w-4 text-primary" />
                                    Detail wilayah
                                </div>
                                {(selectedPin || selectedVillage) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => {
                                            setSelectedPekerjaanId(null)
                                            setGalleryIndex(0)
                                            setSelectedVillage(null)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {selectedPin ? (
                                <MapPekerjaanPinDetail
                                    pin={selectedPin}
                                    galleryIndex={galleryIndex}
                                    onGalleryIndexChange={setGalleryIndex}
                                />
                            ) : selectedVillage ? (
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                            Desa terpilih
                                        </div>
                                        <div className="mt-1 text-lg font-bold">{selectedVillage}</div>
                                        <div className="text-sm text-muted-foreground">{selectedDistrict}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-xl border bg-background/70 p-3">
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                <Building2 className="h-3.5 w-3.5" />
                                                Pekerjaan
                                            </div>
                                            <div className="mt-1 text-xl font-bold">{selectedVillageJobs}</div>
                                        </div>
                                        <div className="rounded-xl border bg-background/70 p-3">
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                <Camera className="h-3.5 w-3.5" />
                                                Foto lokasi
                                            </div>
                                            <div className="mt-1 text-xl font-bold">
                                                {
                                                    pekerjaanPins.filter(
                                                        (pin) =>
                                                            normalizeVillageKey(pin.job?.desa?.nama_desa) ===
                                                            normalizeVillageKey(selectedVillage),
                                                    ).length
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed bg-background/50 p-4 text-sm text-muted-foreground">
                                    Klik pin pekerjaan atau wilayah desa di peta untuk melihat output dan galeri foto.
                                </div>
                            )}

                            <div className="mt-4 space-y-2 border-t pt-4">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    {viewMode === 'heatmap' ? 'Legenda heatmap' : 'Legenda tahap progress'}
                                </div>
                                {viewMode === 'heatmap' ? (
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { color: '#3b82f6', label: 'Rendah' },
                                            { color: '#84cc16', label: 'Sedang' },
                                            { color: '#eab308', label: 'Tinggi' },
                                            { color: '#ef4444', label: 'Sangat tinggi' },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(PROGRESS_MARKER_COLORS).map(([label, color]) => (
                                            <div key={label} className="flex items-center gap-2 text-xs">
                                                <span
                                                    className="h-3 w-3 rounded-full ring-2 ring-white"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span>{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    </div>
                </section>
            </Main>
        </>
    )
}