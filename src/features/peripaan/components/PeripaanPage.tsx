import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapContainer, TileLayer, Polyline, Polygon, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { toast } from 'sonner'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
} from 'recharts'
import {
    Eye,
    EyeOff,
    Layers,
    Loader2,
    Satellite,
    Map as MapIcon,
    Trash2,
    Route as RouteIcon,
    MapPin,
    X,
    ChevronDown,
    ChevronRight,
    Pencil,
    Square,
    Upload,
    ChevronUp,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getElevations } from '@/features/simulation/services/ElevationService'
import { parseKmzFile, parseKmlFile } from '@/features/simulation/services/KmzParser'
import { createPeripaan, getPeripaanList, deletePeripaan, type PeripaanItem } from '../api/peripaan'
import {
    formatDistance,
    min,
    max,
    median,
    slopeAngles,
    colorFor,
    pathLength,
} from '../lib/peripaan-utils'

type Basemap = 'esri' | 'osm'
type DrawMode = null | 'path' | 'polygon' | 'marker'

// ---------- helper: ekstrak koordinat per fitur dari GeoJSON ----------
// GeoJSON = [lng, lat, (elev)] — Leaflet butuh [lat, lng]
function toLatLng(c: unknown): [number, number] | null {
    if (Array.isArray(c) && typeof c[0] === 'number' && typeof c[1] === 'number') {
        return [c[1], c[0]]
    }
    return null
}

function extractFeatures(fc: NonNullable<PeripaanItem['geojson']>): {
    id: string
    name: string
    kind: 'path' | 'polygon' | 'marker'
    coords: [number, number][]
    ring: [number, number][]
    color: string
    props: Record<string, unknown>
}[] {
    const out: {
        id: string
        name: string
        kind: 'path' | 'polygon' | 'marker'
        coords: [number, number][]
        ring: [number, number][]
        color: string
        props: Record<string, unknown>
    }[] = []
    fc.features.forEach((f, i) => {
        const g = f.geometry
        if (!g) return
        const name = (f.properties?.name as string) || `Fitur ${i + 1}`
        const props = (f.properties ?? {}) as Record<string, unknown>
        const color = colorFor(i)
        if (g.type === 'LineString') {
            const coords = g.coordinates.map(toLatLng).filter((c): c is [number, number] => c !== null)
            out.push({ id: `${i}`, name, kind: 'path', coords, ring: [], color, props })
        } else if (g.type === 'MultiLineString') {
            g.coordinates.forEach((line, j) => {
                const coords = line.map(toLatLng).filter((c): c is [number, number] => c !== null)
                out.push({ id: `${i}-${j}`, name: `${name} (${j + 1})`, kind: 'path', coords, ring: [], color: colorFor(i + j), props })
            })
        } else if (g.type === 'Polygon') {
            const ring = (g.coordinates[0] ?? []).map(toLatLng).filter((c): c is [number, number] => c !== null)
            out.push({ id: `${i}`, name, kind: 'polygon', coords: [], ring, color, props })
        } else if (g.type === 'Point') {
            const c = toLatLng(g.coordinates)
            if (c) out.push({ id: `${i}`, name, kind: 'marker', coords: [c], ring: [], color, props })
        } else if (g.type === 'MultiPolygon') {
            g.coordinates.forEach((poly, j) => {
                const ring = (poly[0] ?? []).map(toLatLng).filter((c): c is [number, number] => c !== null)
                out.push({ id: `${i}-${j}`, name: `${name} (${j + 1})`, kind: 'polygon', coords: [], ring, color: colorFor(i + j), props })
            })
        } else if (g.type === 'MultiPoint') {
            g.coordinates.forEach((pt, j) => {
                const c = toLatLng(pt)
                if (c) out.push({ id: `${i}-${j}`, name: `${name} (${j + 1})`, kind: 'marker', coords: [c], ring: [], color, props })
            })
        }
    })
    return out
}

// ---------- kontrol peta: fitBounds ----------
function MapController({ bounds }: { bounds: L.LatLngBounds | null }) {
    const map = useMap()
    useEffect(() => {
        if (bounds) map.fitBounds(bounds, { padding: [48, 48], maxZoom: 17 })
    }, [bounds, map])
    return null
}

// ---------- kontrol peta: draw klik + koordinat kamera + scale ----------
function MapEvents({
    drawMode,
    draft,
    setDraft,
    onCamera,
    onCreateMarker,
}: {
    drawMode: DrawMode
    draft: [number, number][]
    setDraft: (c: [number, number][]) => void
    onCamera: (lat: number, lng: number, zoom: number) => void
    onCreateMarker: (lat: number, lng: number) => void
}) {
    useMapEvents({
        move(e) {
            const c = e.target.getCenter()
            onCamera(c.lat, c.lng, e.target.getZoom())
        },
        click(e) {
            if (drawMode === 'marker') {
                onCreateMarker(e.latlng.lat, e.latlng.lng)
                return
            }
            if (drawMode === 'path' || drawMode === 'polygon') {
                setDraft([...draft, [e.latlng.lat, e.latlng.lng]])
            }
        },
    })
    return null
}

// ---------- panel: profil elevasi ----------
function ElevationProfile({ points }: { points: { lat: number; lng: number; elev: number }[] }) {
    const data = useMemo(() => {
        let dist = 0
        return points.map((p, i) => {
            if (i > 0) {
                const R = 6371000
                const dLat = ((points[i].lat - points[i - 1].lat) * Math.PI) / 180
                const dLng = ((points[i].lng - points[i - 1].lng) * Math.PI) / 180
                const a = Math.sin(dLat / 2) ** 2 + Math.cos((points[i - 1].lat * Math.PI) / 180) * Math.cos((points[i].lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
                dist += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            }
            return { jarak: Math.round(dist), elevasi: Math.round(p.elev * 10) / 10 }
        })
    }, [points])

    if (!points.length) return null
    return (
        <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                    <defs>
                        <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="jarak" tick={{ fontSize: 10 }} unit=" m" />
                    <YAxis tick={{ fontSize: 10 }} unit=" m" domain={['auto', 'auto']} />
                    <ChartTooltip formatter={(v: number) => [`${v} m`]} labelFormatter={(l) => `Jarak ${l} m`} />
                    <Area type="monotone" dataKey="elevasi" stroke="#3b82f6" fill="url(#elevGrad)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

// ---------- collapsible section ----------
function Section({
    title,
    open,
    onToggle,
    children,
}: {
    title: string
    open: boolean
    onToggle: () => void
    children: React.ReactNode
}) {
    return (
        <div className="border-t">
            <button type="button" className="flex w-full items-center gap-1 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground" onClick={onToggle}>
                {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {title}
            </button>
            {open ? <div className="px-3 pb-3">{children}</div> : null}
        </div>
    )
}

// ---------- panel detail jalur (kanan atas) ----------
type AnyFeature = {
    id: string
    name: string
    kind: 'path' | 'polygon' | 'marker'
    coords: [number, number][]
    ring: [number, number][]
    color: string
    props: Record<string, unknown>
}

function DetailPanel({
    feature,
    elevation,
    loadingElev,
    onClose,
    onEdit,
}: {
    feature: AnyFeature
    elevation: { lat: number; lng: number; elev: number }[] | null
    loadingElev: boolean
    onClose: () => void
    onEdit: () => void
}) {
    const [openLength, setOpenLength] = useState(true)
    const [openElev, setOpenElev] = useState(true)
    const [openAdv, setOpenAdv] = useState(false)

    const length = useMemo(() => pathLength(feature.coords), [feature.coords])

    const elevStats = useMemo(() => {
        if (!elevation?.length) return null
        const es = elevation.map((p) => p.elev)
        const sl = slopeAngles(elevation)
        return {
            elevMin: min(es),
            elevMed: median(es),
            elevMax: max(es),
            slopeMin: min(sl),
            slopeMed: median(sl),
            slopeMax: max(sl),
        }
    }, [elevation])

    return (
        <div className="pointer-events-auto w-[340px] rounded-2xl border border-white/50 bg-white/92 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/88">
            <div className="flex items-center gap-2 border-b px-3 py-2.5">
                <RouteIcon className="h-4 w-4" style={{ color: feature.color }} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{feature.name}</span>
                <button type="button" title="Edit jalur" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={onEdit}>
                    <Pencil className="h-4 w-4" />
                </button>
                <button type="button" title="Tutup" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={onClose}>
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
                {feature.kind === 'marker' ? (
                    <Section title="Ground elevation" open={openElev} onToggle={() => setOpenElev((v) => !v)}>
                        {loadingElev ? (
                            <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" /> Mengambil elevasi…
                            </div>
                        ) : elevation && elevation.length ? (
                            <div className="space-y-1">
                                <div className="text-2xl font-bold">{elevation[0].elev.toFixed(1)} m</div>
                                <div className="font-mono text-xs text-muted-foreground">
                                    {elevation[0].lat.toFixed(6)}, {elevation[0].lng.toFixed(6)}
                                </div>
                            </div>
                        ) : (
                            <div className="py-2 text-sm text-muted-foreground">Tidak ada data elevasi</div>
                        )}
                    </Section>
                ) : (
                    <>
                        <Section title="Length" open={openLength} onToggle={() => setOpenLength((v) => !v)}>
                            <div className="text-2xl font-bold">{formatDistance(length)}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{feature.coords.length} titik koordinat</div>
                        </Section>
                        <Section title="Elevation profile" open={openElev} onToggle={() => setOpenElev((v) => !v)}>
                            {loadingElev ? (
                                <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Mengambil elevasi…
                                </div>
                            ) : elevation && elevation.length ? (
                                <>
                                    <ElevationProfile points={elevation} />
                                    <button type="button" className="mt-1 text-xs font-medium text-primary" onClick={() => setOpenAdv(true)}>
                                        Advanced measurements ▾
                                    </button>
                                </>
                            ) : (
                                <div className="py-2 text-sm text-muted-foreground">Tidak ada data elevasi</div>
                            )}
                        </Section>
                        <Section title="Advanced measurements" open={openAdv} onToggle={() => setOpenAdv((v) => !v)}>
                            {elevStats ? (
                                <div className="space-y-2 text-xs">
                                    <div className="font-semibold text-muted-foreground">Elevation estimate</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {([
                                            ['Min', elevStats.elevMin],
                                            ['Median', elevStats.elevMed],
                                            ['Max', elevStats.elevMax],
                                        ] as [string, number][]).map(([label, value]) => (
                                            <div key={label} className="rounded-lg border bg-background/60 p-2 text-center">
                                                <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
                                                <div className="text-sm font-bold">{value.toFixed(1)} m</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="font-semibold text-muted-foreground">Slope estimate</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {([
                                            ['Min', elevStats.slopeMin],
                                            ['Median', elevStats.slopeMed],
                                            ['Max', elevStats.slopeMax],
                                        ] as [string, number][]).map(([label, value]) => (
                                            <div key={label} className="rounded-lg border bg-background/60 p-2 text-center">
                                                <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
                                                <div className="text-sm font-bold">{value.toFixed(2)}°</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">Ambil profil elevasi terlebih dahulu</div>
                            )}
                        </Section>
                    </>
                )}
            </div>
        </div>
    )
}

// ---------- halaman utama ----------
export default function PeripaanPage() {
    const queryClient = useQueryClient()
    const [basemap, setBasemap] = useState<Basemap>('esri')
    const [hidden, setHidden] = useState<Set<string>>(new Set())
    const [fitBounds, setFitBounds] = useState<L.LatLngBounds | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set())
    const [drawMode, setDrawMode] = useState<DrawMode>(null)
    const [draft, setDraft] = useState<[number, number][]>([])
    const [camera, setCamera] = useState({ lat: -6.82, lng: 107.14, zoom: 11 })
    const [elevation, setElevation] = useState<{ lat: number; lng: number; elev: number }[] | null>(null)
    const [loadingElev, setLoadingElev] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data: routesData, isLoading: isRoutesLoading } = useQuery({
        queryKey: ['peripaan-list'],
        queryFn: () => getPeripaanList(),
    })

    const routes = useMemo(() => routesData ?? [], [routesData])

    // semua fitur dari semua route, dengan routeId
    const allFeatures = useMemo(
        () =>
            routes.flatMap((route) => {
                if (!route.geojson) return []
                return extractFeatures(route.geojson).map((f) => ({ ...f, id: `${route.id}-${f.id}`, routeId: route.id, routeNama: route.nama }))
            }),
        [routes],
    )

    const selectedFeature = useMemo(
        () => allFeatures.find((f) => f.id === selectedId) ?? null,
        [allFeatures, selectedId],
    )

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['peripaan-list'] })

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const geojson =
                file.name.toLowerCase().endsWith('.kmz') ? await parseKmzFile(file) : await parseKmlFile(file)
            return createPeripaan({
                file,
                nama: file.name.replace(/\.(kmz|kml)$/i, ''),
                geojson,
            })
        },
        onSuccess: (created) => {
            toast.success(`File "${created.nama}" berhasil diunggah`)
            invalidate()
            if (created.geojson) setFitBounds(L.geoJSON(created.geojson).getBounds())
        },
        onError: (error: Error) => toast.error(error.message || 'Gagal mengunggah file'),
    })

    const onPickFile = useCallback(
        (file: File) => {
            uploadMutation.mutate(file)
        },
        [uploadMutation],
    )

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePeripaan(id),
        onSuccess: () => {
            toast.success('File jalur dihapus')
            invalidate()
        },
        onError: (error: Error) => toast.error(error.message || 'Gagal menghapus'),
    })

    const handleToggleFile = useCallback((id: number) => {
        setHidden((prev) => {
            const next = new Set(prev)
            const key = String(id)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }, [])

    const handleFocusFile = useCallback((route: PeripaanItem) => {
        if (!route.geojson) return
        setFitBounds(L.geoJSON(route.geojson).getBounds())
    }, [])

    const handleFocusFeature = useCallback((f: (typeof allFeatures)[number]) => {
        const latlngs = f.kind === 'polygon' ? f.ring : f.coords
        if (!latlngs.length) return
        setFitBounds(L.latLngBounds(latlngs.map(([lat, lng]) => L.latLng(lat, lng))))
        setSelectedId(f.id)
    }, [allFeatures])

    const handleDeleteFile = useCallback(
        (route: PeripaanItem) => {
            if (window.confirm(`Hapus file "${route.nama}"? Data jalur di dalamnya ikut terhapus.`)) {
                deleteMutation.mutate(route.id)
            }
        },
        [deleteMutation],
    )

    // ambil elevasi saat fitur apa pun dipilih (path, polygon ring, atau marker point)
    useEffect(() => {
        if (!selectedFeature) {
            setElevation(null)
            return
        }
        const pts =
            selectedFeature.kind === 'polygon'
                ? selectedFeature.ring
                : selectedFeature.coords
        if (!pts.length) {
            setElevation(null)
            return
        }
        let cancelled = false
        setLoadingElev(true)
        setElevation(null)
        getElevations(pts.map(([lat, lng]) => ({ lat, lng })))
            .then((elevs) => {
                if (cancelled) return
                setElevation(pts.map(([lat, lng], i) => ({ lat, lng, elev: elevs[i] ?? 0 })))
            })
            .catch(() => !cancelled && toast.error('Gagal mengambil elevasi'))
            .finally(() => !cancelled && setLoadingElev(false))
        return () => {
            cancelled = true
        }
    }, [selectedFeature])

    // ponytail: hasil gambar jalur/marker/polygon belum tersimpan ke server — perlu endpoint draw; sekarang preview saja
    const finishDraft = () => {
        if (draft.length < (drawMode === 'marker' ? 1 : drawMode === 'polygon' ? 3 : 2)) {
            toast.error('Titik tidak cukup')
            return
        }
        if (drawMode === 'path') {
            toast.info(`Jalur selesai: ${formatDistance(pathLength(draft))} — simpan server menyusul`)
        }
        setDraft([])
        setDrawMode(null)
    }

    const handleCamera = useCallback((lat: number, lng: number, zoom: number) => {
        setCamera({ lat, lng, zoom })
    }, [])

    const handleCreateMarker = useCallback((lat: number, lng: number) => {
        toast.info(`Marker di (${lat.toFixed(5)}, ${lng.toFixed(5)}) — penyimpanan server belum tersedia`)
        setDrawMode(null)
    }, [])

    const visibleFeatures = allFeatures.filter((f) => !hidden.has(String(f.routeId)) && f.routeId != null)

    return (
        <>
            <Header />
            <Main fixed className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:gap-4 md:p-4">
                <section className="shrink-0 rounded-2xl border bg-card p-3 shadow-sm md:p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold tracking-tight md:text-2xl">Peta Perpipaan</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Unggah KMZ/KML Google Earth, gambar jalur, tambah marker &amp; ukur jarak
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                            {/* toolbar draw */}
                            <div className="flex overflow-hidden rounded-xl border">
                                <Button
                                    type="button"
                                    variant={drawMode === 'path' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="rounded-none gap-1.5"
                                    onClick={() => {
                                        setDrawMode(drawMode === 'path' ? null : 'path')
                                        setDraft([])
                                    }}
                                >
                                    <RouteIcon className="h-4 w-4" /> Jalur
                                </Button>
                                <Button
                                    type="button"
                                    variant={drawMode === 'polygon' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="rounded-none gap-1.5"
                                    onClick={() => {
                                        setDrawMode(drawMode === 'polygon' ? null : 'polygon')
                                        setDraft([])
                                    }}
                                >
                                    <Square className="h-4 w-4" /> Area
                                </Button>
                                <Button
                                    type="button"
                                    variant={drawMode === 'marker' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="rounded-none gap-1.5"
                                    onClick={() => setDrawMode(drawMode === 'marker' ? null : 'marker')}
                                >
                                    <MapPin className="h-4 w-4" /> Marker
                                </Button>
                            </div>
                            {draft.length > 0 && drawMode ? (
                                <>
                                    <Button type="button" size="sm" className="gap-1.5" onClick={finishDraft}>
                                        Selesai ({draft.length})
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDraft(draft.slice(0, -1))}
                                    >
                                        Undo
                                    </Button>
                                </>
                            ) : null}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".kmz,.kml"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && onPickFile(e.target.files[0])}
                            />
                            <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4" /> Upload KMZ/KML
                            </Button>

                            <div className="flex overflow-hidden rounded-xl border">
                                <Button
                                    type="button"
                                    variant={basemap === 'esri' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="rounded-none gap-1.5"
                                    onClick={() => setBasemap('esri')}
                                >
                                    <Satellite className="h-4 w-4" /> Satelit
                                </Button>
                                <Button
                                    type="button"
                                    variant={basemap === 'osm' ? 'default' : 'ghost'}
                                    size="sm"
                                    className="rounded-none gap-1.5"
                                    onClick={() => setBasemap('osm')}
                                >
                                    <MapIcon className="h-4 w-4" /> Jalan
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="absolute inset-0 z-0">
                        <MapContainer center={[camera.lat, camera.lng]} zoom={camera.zoom} scrollWheelZoom className="map-progress-canvas" style={{ height: '100%', width: '100%' }}>
                            {basemap === 'esri' ? (
                                <TileLayer
                                    key="esri"
                                    maxZoom={19}
                                    attribution="Esri, Maxar, Earthstar Geographics"
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                />
                            ) : (
                                <TileLayer
                                    key="osm"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                            )}

                            <MapController bounds={fitBounds} />
                            <MapEvents
                                drawMode={drawMode}
                                draft={draft}
                                setDraft={setDraft}
                                onCamera={handleCamera}
                                onCreateMarker={handleCreateMarker}
                            />

                            {/* render fitur KMZ/KML */}
                            {visibleFeatures.map((f) => {
                                if (f.kind === 'path') {
                                    return (
                                        <Polyline
                                            key={`${f.routeId}-${f.id}`}
                                            positions={f.coords}
                                            pathOptions={{ color: f.color, weight: 3 }}
                                            eventHandlers={{
                                                click: () => setSelectedId(f.id),
                                            }}
                                        >
                                            <Tooltip>{f.name}</Tooltip>
                                        </Polyline>
                                    )
                                }
                                if (f.kind === 'polygon') {
                                    return (
                                        <Polygon
                                            key={`${f.routeId}-${f.id}`}
                                            positions={f.ring}
                                            pathOptions={{ color: f.color, weight: 2, fillOpacity: 0.25 }}
                                            eventHandlers={{ click: () => setSelectedId(f.id) }}
                                        >
                                            <Tooltip>{f.name}</Tooltip>
                                        </Polygon>
                                    )
                                }
                                return (
                                    <CircleMarker
                                        key={`${f.routeId}-${f.id}`}
                                        center={[f.coords[0][0], f.coords[0][1]]}
                                        radius={6}
                                        pathOptions={{ color: '#fff', weight: 2, fillColor: f.color, fillOpacity: 1 }}
                                        eventHandlers={{ click: () => setSelectedId(f.id) }}
                                    >
                                        <Tooltip>{f.name}</Tooltip>
                                    </CircleMarker>
                                )
                            })}

                            {/* draft yang sedang digambar */}
                            {drawMode === 'path' && draft.length > 1 ? (
                                <Polyline positions={draft} pathOptions={{ color: '#facc15', dashArray: '6 6', weight: 3 }} />
                            ) : null}
                            {drawMode === 'polygon' && draft.length > 2 ? (
                                <Polygon positions={draft} pathOptions={{ color: '#facc15', dashArray: '6 6', weight: 2, fillOpacity: 0.2 }} />
                            ) : null}
                            {draft.map(([lat, lng], i) => (
                                <CircleMarker key={`d${i}`} center={[lat, lng]} radius={4} pathOptions={{ color: '#facc15', fillColor: '#facc15', fillOpacity: 1 }} />
                            ))}
                        </MapContainer>
                    </div>

                    {isRoutesLoading ? (
                        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border bg-background/90 px-4 py-2 text-xs font-medium shadow-lg backdrop-blur">
                            <Loader2 className="mr-2 inline h-3.5 w-3.5 animate-spin" /> Memuat jalur…
                        </div>
                    ) : null}

                    {/* koordinat kamera + skala kiri bawah */}
                    <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg border bg-background/90 px-3 py-1.5 font-mono text-[11px] text-muted-foreground shadow backdrop-blur">
                        lat {camera.lat.toFixed(5)} · lng {camera.lng.toFixed(5)} · zoom {camera.zoom}
                    </div>

                    {/* sidebar kiri: daftar file + fitur */}
                    <div className="absolute bottom-3 left-3 top-3 z-10 hidden w-[300px] md:block">
                        <div className="flex h-full flex-col rounded-2xl border border-white/50 bg-white/92 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/88">
                            <div className="flex items-center gap-2 border-b px-3 py-2.5 text-sm font-semibold">
                                <Layers className="h-4 w-4 text-primary" /> File Jalur ({routes.length})
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                {routes.length === 0 ? (
                                    <div className="rounded-xl border border-dashed bg-background/50 p-4 text-center text-sm text-muted-foreground">
                                        Belum ada file. Upload KMZ/KML dari Google Earth.
                                    </div>
                                ) : null}
                                {routes.map((route) => {
                                    const key = String(route.id)
                                    const isHidden = hidden.has(key)
                                    const isOpen = expandedFiles.has(route.id)
                                    const feats = allFeatures.filter((f) => f.routeId === route.id)
                                    return (
                                        <div key={route.id} className="mb-1">
                                            <div className={cn('flex items-center gap-1.5 rounded-xl px-2 py-1.5 hover:bg-muted/70', isHidden && 'opacity-55')}>
                                                <button
                                                    type="button"
                                                    className="rounded p-0.5 text-muted-foreground"
                                                    onClick={() =>
                                                        setExpandedFiles((prev) => {
                                                            const next = new Set(prev)
                                                            if (next.has(route.id)) next.delete(route.id)
                                                            else next.add(route.id)
                                                            return next
                                                        })
                                                    }
                                                >
                                                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </button>
                                                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => handleFocusFile(route)}>
                                                    <span className="block truncate text-sm font-medium">{route.nama}</span>
                                                    {route.pekerjaan ? (
                                                        <span className="block truncate text-xs text-muted-foreground">{route.pekerjaan.nama_paket}</span>
                                                    ) : null}
                                                </button>
                                                <button type="button" title={isHidden ? 'Tampilkan' : 'Sembunyikan'} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" onClick={() => handleToggleFile(route.id)}>
                                                    {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                                <button type="button" title="Hapus" className="rounded-md p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-600" onClick={() => handleDeleteFile(route)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            {isOpen ? (
                                                <div className="ml-6 space-y-0.5 border-l pl-2">
                                                    {feats.map((f) => (
                                                        <button
                                                            key={f.id}
                                                            type="button"
                                                            className={cn(
                                                                'flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-xs hover:bg-muted/70',
                                                                selectedId === f.id && 'bg-muted font-medium',
                                                            )}
                                                            onClick={() => handleFocusFeature(f)}
                                                        >
                                                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: f.color }} />
                                                            <span className="truncate">{f.name}</span>
                                                            <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                                                                {f.kind === 'path' ? 'jalur' : f.kind === 'polygon' ? 'area' : 'titik'}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* panel detail kanan atas */}
                    {selectedFeature ? (
                        <div className="absolute right-3 top-3 z-10">
                            <DetailPanel
                                feature={selectedFeature}
                                elevation={elevation}
                                loadingElev={loadingElev}
                                onClose={() => setSelectedId(null)}
                                onEdit={() => toast.info('Mode edit jalur — segera hadir')}
                            />
                        </div>
                    ) : null}
                </section>
            </Main>
        </>
    )
}
