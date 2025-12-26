import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heat-layer';
import 'leaflet/dist/leaflet.css';
import { getFotoList } from '@/features/foto/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';
import { DefaultIcon } from '../utils/MapIcon';
import { MapPin, Flame } from 'lucide-react';

type ViewMode = 'markers' | 'heatmap';

export default function MapPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('markers');

    const { data: response, isLoading } = useQuery({
        queryKey: ['foto-all'],
        queryFn: () => getFotoList({ per_page: -1 })
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

    // Center map on the first photo or a default location (e.g., Jakarta area)
    const center: [number, number] = useMemo(() => {
        if (photosWithCoords.length > 0) {
            const first = photosWithCoords[0].koordinat.split(',');
            return [parseFloat(first[0]), parseFloat(first[1])];
        }
        return [-6.1754, 106.8272]; // Monas, Jakarta
    }, [photosWithCoords]);

    return (
        <PageContainer>
            <div className="w-full space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight">Peta Progress Fisik</h1>
                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex border rounded-lg overflow-hidden">
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
                        </div>
                        <Badge variant="outline">Total Lokasi: {photosWithCoords.length}</Badge>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <CardHeader className="pb-3 px-6">
                        <CardTitle>
                            {viewMode === 'markers'
                                ? 'Peta Sebaran Dokumentasi'
                                : 'Heatmap Kepadatan Dokumentasi'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <Skeleton className="h-[600px] w-full" />
                        ) : (
                            <div className="h-[600px] w-full z-0">
                                <MapContainer
                                    center={center}
                                    zoom={12}
                                    scrollWheelZoom={true}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

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
        </PageContainer>
    );
}
