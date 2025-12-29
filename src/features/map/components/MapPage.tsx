import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import HeatmapLayer from 'react-leaflet-heat-layer';
import 'leaflet/dist/leaflet.css';
import { getFotoList } from '@/features/foto/api';
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { DefaultIcon } from '../utils/MapIcon';
import { MapPin, Flame, Map as MapIcon, RotateCcw, Loader2, FileUp, Activity as ActivityIcon } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useAppSettingsStore } from '@/stores/app-settings-store';
import { SimulationService, type SimulationResult } from '@/features/simulation/services/SimulationService';
import { SimulationLayer } from '@/features/simulation/components/SimulationLayer';
import { toast } from 'sonner';
// @ts-ignore
import geoJsonUrl from '@/assets/geojson/kecamatan/id3203_cianjur_simplified.geojson?url';

type ViewMode = 'markers' | 'heatmap' | 'simulation';

/**
 * Helper component to handle map controller actions like fitBounds
 */
function MapController({ bounds }: { bounds: L.LatLngBounds | null }) {
    const map = useMap();
    useMemo(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [bounds, map]);
    return null;
}

export default function MapPage() {
    const { tahunAnggaran } = useAppSettingsStore();
    const [viewMode, setViewMode] = useState<ViewMode>('markers');
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
    const [fitBounds, setFitBounds] = useState<L.LatLngBounds | null>(null);

    // Simulation State
    const [simResults, setSimResults] = useState<SimulationResult | null>(null);
    const [simCoords, setSimCoords] = useState<Record<string, [number, number]>>({});
    const [simPipes, setSimPipes] = useState<{ id: string, from: string, to: string }[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    const simulationService = useMemo(() => new SimulationService(), []);

    const { data: response, isLoading: isPhotosLoading } = useQuery({
        queryKey: ['foto-all', { latest_only: true, tahun: tahunAnggaran }],
        queryFn: () => getFotoList({ per_page: -1, latest_only: true, tahun: tahunAnggaran })
    });

    const { data: jobsResponse, isLoading: isJobsLoading } = useQuery({
        queryKey: ['pekerjaan-all', { tahun: tahunAnggaran }],
        queryFn: () => getPekerjaan({ per_page: -1, tahun: tahunAnggaran })
    });

    // Load GeoJSON data with caching
    const { data: geoJsonData, isLoading: isGeoJsonLoading } = useQuery({
        queryKey: ['geojson-kecamatan-cianjur'],
        queryFn: async () => {
            const res = await fetch(geoJsonUrl);
            if (!res.ok) throw new Error('Failed to fetch GeoJSON');
            return res.json();
        },
        staleTime: Infinity, // Permanent cache for static asset
    });

    const photosWithCoords = useMemo(() => {
        if (!response?.data) return [];
        return response.data.filter(foto => {
            if (!foto.koordinat) return false;
            const parts = foto.koordinat.split(',');
            if (parts.length !== 2) return false;
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            return !isNaN(lat) && !isNaN(lng);
        });
    }, [response?.data]);

    // Prepare heatmap points: [lat, lng, intensity]
    const heatmapPoints = useMemo(() => {
        return photosWithCoords.map(foto => {
            const coords = foto.koordinat.split(',');
            const lat = parseFloat(coords[0]);
            const lng = parseFloat(coords[1]);
            return [lat, lng, 1] as [number, number, number];
        });
    }, [photosWithCoords]);

    // Aggregate jobs by village
    const jobsByVillage = useMemo(() => {
        if (!jobsResponse?.data) return {} as Record<string, number>;

        const counts: Record<string, number> = {};
        jobsResponse.data.forEach(job => {
            if (job.desa?.nama_desa) {
                // Normalize name: uppercase and remove spaces for resilient matching
                const villageKey = job.desa.nama_desa.toUpperCase().replace(/\s+/g, '');
                counts[villageKey] = (counts[villageKey] || 0) + 1;
            }
        });
        return counts;
    }, [jobsResponse?.data]);

    // District options for filter
    const districtOptions = useMemo(() => {
        if (!geoJsonData?.features) return [];
        const districts: string[] = geoJsonData.features.map((f: any) => f.properties.district);
        const unique = Array.from(new Set(districts)).sort();
        return unique.map(d => ({ label: d, value: d }));
    }, [geoJsonData]);

    // Center map on the first photo or a default location (e.g., Cianjur center)
    const initialCenter: [number, number] = useMemo(() => {
        if (photosWithCoords.length > 0) {
            const first = photosWithCoords[0].koordinat.split(',');
            return [parseFloat(first[0]), parseFloat(first[1])];
        }
        return [-6.82, 107.14]; // Cianjur area
    }, [photosWithCoords]);

    const handleDistrictChange = useCallback((districtName: string) => {
        setSelectedDistrict(districtName);
        setSelectedVillage(null);
        if (!geoJsonData) return;

        const districtFeature = geoJsonData.features.find(
            (f: any) => f.properties.district === districtName
        );

        if (districtFeature) {
            const layer = L.geoJSON(districtFeature);
            setFitBounds(layer.getBounds());
        }
    }, [geoJsonData]);

    const resetView = useCallback(() => {
        setSelectedDistrict(null);
        setSelectedVillage(null);
        setFitBounds(null);
        setSimResults(null);
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsSimulating(true);
        try {
            const content = await file.text();
            const results = await simulationService.runSimulation(content);
            const coords = simulationService.parseCoordinates(content);
            const pipes = simulationService.parsePipes(content);

            setSimResults(results);
            setSimCoords(coords);
            setSimPipes(pipes);
            setViewMode('simulation');

            // Auto fit bounds to simulation nodes
            const coordValues = Object.values(coords);
            if (coordValues.length > 0) {
                const bounds = L.latLngBounds(coordValues as L.LatLngTuple[]);
                setFitBounds(bounds);
            }

            toast.success('Simulasi berhasil dijalankan!');
        } catch (error) {
            console.error('Simulation error:', error);
            toast.error('Gagal menjalankan simulasi. Pastikan file .inp valid.');
        } finally {
            setIsSimulating(false);
        }
    };

    const districtStyle = useCallback((feature: any) => {
        const isSelected = selectedDistrict === feature.properties.district;
        const isVillageSelected = selectedVillage === feature.properties.village;

        return {
            fillColor: isVillageSelected ? '#10b981' : isSelected ? '#4f46e5' : '#6366f1',
            weight: isVillageSelected ? 4 : isSelected ? 3 : 1.5,
            opacity: 1,
            color: isVillageSelected ? '#064e3b' : isSelected ? '#312e81' : '#4338ca',
            fillOpacity: isVillageSelected ? 0.45 : isSelected ? 0.35 : 0.15
        };
    }, [selectedDistrict, selectedVillage]);

    const onEachDistrict = useCallback((feature: any, layer: L.Layer) => {
        layer.on({
            click: (e) => {
                const districtName = feature.properties.district;
                const villageName = feature.properties.village;
                setSelectedDistrict(districtName);
                setSelectedVillage(villageName);

                // Zoom to feature
                const bounds = (e.target as L.GeoJSON).getBounds();
                setFitBounds(bounds);
            }
        });
    }, []);

    // Memoize the GeoJSON component to prevent re-rendering the large layer when photos load or mode changes
    const geoJsonLayer = useMemo(() => {
        if (!geoJsonData) return null;
        return (
            <GeoJSON
                data={geoJsonData}
                style={districtStyle}
                onEachFeature={onEachDistrict}
            >
                <Popup>
                    <div className="flex flex-col gap-1 min-w-[150px]">
                        <div className="font-bold border-b pb-1.5 mb-1.5 text-sm uppercase">
                            Desa {selectedVillage || '---'}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Kecamatan:</span>
                            <span className="font-medium">{selectedDistrict}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-0.5">
                            <span className="text-muted-foreground">Jumlah Pekerjaan:</span>
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                                {jobsByVillage[(selectedVillage || '').toUpperCase().replace(/\s+/g, '')] || 0}
                            </Badge>
                        </div>
                    </div>
                </Popup>
            </GeoJSON>
        );
    }, [geoJsonData, districtStyle, onEachDistrict, selectedDistrict, selectedVillage, jobsByVillage]);

    return (
        <>
            <Header />
            <Main>
                <div className="w-full space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Peta Pekerjaan</h1>
                            <p className="text-muted-foreground">
                                Peta sebaran pekerjaan berdasarkan tahun dan kecamatan
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {/* District Filter */}
                            <div className="flex items-center gap-2 min-w-[200px]">
                                <SearchableSelect
                                    options={districtOptions}
                                    value={selectedDistrict || ''}
                                    onValueChange={handleDistrictChange}
                                    placeholder="Pilih Kecamatan..."
                                    className="w-[200px]"
                                    disabled={isGeoJsonLoading}
                                />
                                {(selectedDistrict || selectedVillage) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={resetView}
                                        title="Reset Zoom"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex border rounded-lg overflow-hidden shrink-0">
                                <Button
                                    variant={viewMode === 'markers' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('markers')}
                                    className="rounded-none gap-1.5"
                                >
                                    <MapPin className="h-4 w-4" />
                                    <span className="hidden sm:inline">Markers</span>
                                </Button>
                                <Button
                                    variant={viewMode === 'heatmap' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('heatmap')}
                                    className="rounded-none gap-1.5"
                                >
                                    <Flame className="h-4 w-4" />
                                    <span className="hidden sm:inline">Heatmap</span>
                                </Button>
                                <Button
                                    variant={viewMode === 'simulation' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('simulation')}
                                    className="rounded-none gap-1.5"
                                >
                                    <ActivityIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">Simulation</span>
                                </Button>
                            </div>

                            {/* Simulation Upload */}
                            <div className="flex items-center">
                                <input
                                    type="file"
                                    id="inp-upload"
                                    accept=".inp"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => document.getElementById('inp-upload')?.click()}
                                    disabled={isSimulating}
                                >
                                    {isSimulating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileUp className="h-4 w-4" />
                                    )}
                                    {isSimulating ? 'Processing...' : 'Upload .INP'}
                                </Button>
                            </div>
                            <Badge variant="outline" className="hidden lg:flex">
                                {isPhotosLoading || isJobsLoading ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                    `Total Lokasi: ${photosWithCoords.length}`
                                )}
                            </Badge>
                        </div>
                    </div>

                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3 px-6">
                            <CardTitle className="flex items-center gap-2">
                                <MapIcon className="h-5 w-5 text-muted-foreground" />
                                {viewMode === 'markers'
                                    ? 'Peta Sebaran Pekerjaan'
                                    : 'Heatmap Kepadatan Pekerjaan'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isPhotosLoading ? (
                                <Skeleton className="h-[600px] w-full" />
                            ) : (
                                <div className="h-[600px] w-full z-0 relative">
                                    {isGeoJsonLoading && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-background/80 backdrop-blur px-4 py-2 rounded-full border shadow-sm flex items-center gap-2 text-xs font-medium">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Memuat Batas Wilayah...
                                        </div>
                                    )}
                                    <MapContainer
                                        center={initialCenter}
                                        zoom={11}
                                        scrollWheelZoom={true}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />

                                        <MapController bounds={fitBounds} />

                                        {/* GeoJSON Kecamatan Layer */}
                                        {geoJsonLayer}

                                        {/* Simulation Result Layer */}
                                        {viewMode === 'simulation' && (
                                            <SimulationLayer
                                                results={simResults}
                                                coordinates={simCoords}
                                                pipes={simPipes}
                                            />
                                        )}

                                        {viewMode === 'heatmap' ? (
                                            <HeatmapLayer
                                                latlngs={heatmapPoints}
                                                radius={25}
                                                blur={15}
                                                maxZoom={17}
                                                max={1.0}
                                                minOpacity={0.4}
                                            />
                                        ) : (
                                            photosWithCoords.map((foto) => {
                                                const coords = foto.koordinat.split(',');
                                                const lat = parseFloat(coords[0]);
                                                const lng = parseFloat(coords[1]);

                                                return (
                                                    <Marker
                                                        key={foto.id}
                                                        position={[lat, lng]}
                                                        icon={DefaultIcon}
                                                    >
                                                        <Popup className="custom-popup">
                                                            <div className="flex flex-col gap-2 w-[200px]">
                                                                {foto.foto_url && (
                                                                    <img
                                                                        src={foto.foto_url}
                                                                        alt={foto.pekerjaan?.nama_paket}
                                                                        className="w-full h-32 object-cover rounded-md"
                                                                    />
                                                                )}
                                                                <div className="font-semibold text-sm">
                                                                    {foto.pekerjaan?.nama_paket || 'Tanpa Nama'}
                                                                </div>
                                                                <div className="flex justify-between items-center">
                                                                    <Badge variant="secondary" className="text-[10px]">
                                                                        Progress: {foto.keterangan}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground italic">
                                                                    Diambil pada: {new Date(foto.created_at).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                );
                                            })
                                        )}
                                    </MapContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Heatmap Legend */}
                    {viewMode === 'heatmap' && (
                        <Card className="p-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Legenda:</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                                    <span className="text-xs text-muted-foreground">Rendah</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-lime-500" />
                                    <span className="text-xs text-muted-foreground">Sedang</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                                    <span className="text-xs text-muted-foreground">Tinggi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-red-500" />
                                    <span className="text-xs text-muted-foreground">Sangat Tinggi</span>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </Main>
        </>
    );
}
