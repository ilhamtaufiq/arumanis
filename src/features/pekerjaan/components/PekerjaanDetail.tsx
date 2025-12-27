import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { getPekerjaanById } from '../api/pekerjaan';
import type { Pekerjaan } from '../types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, MapPin, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import KontrakTabContent from './KontrakTabContent';
import OutputTabContent from './OutputTabContent';
import PenerimaTabContent from './PenerimaTabContent';
import BerkasTabContent from './BerkasTabContent';

// Lazy load FotoTabContent - contains many images
const FotoTabContent = lazy(() => import('./FotoTabContent'));
// Lazy load BeritaAcaraTabContent - less frequently used
const BeritaAcaraTabContent = lazy(() => import('./BeritaAcaraTabContent'));
import PageContainer from '@/components/layout/page-container';

// Lazy load ProgressTabContent - contains Handsontable (~1.7MB)
const ProgressTabContent = lazy(() => import('./ProgressTabContent'));

export default function PekerjaanDetail() {
    const params = useParams({ strict: false });
    const id = params.id;
    const [pekerjaan, setPekerjaan] = useState<Pekerjaan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPekerjaan = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response = await getPekerjaanById(Number(id));
                setPekerjaan(response.data);
            } catch (error) {
                console.error('Failed to fetch pekerjaan:', error);
                toast.error('Gagal memuat data pekerjaan');
            } finally {
                setLoading(false);
            }
        };

        fetchPekerjaan();
    }, [id]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </PageContainer>
        );
    }

    if (!pekerjaan) {
        return (
            <PageContainer>
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Data pekerjaan tidak ditemukan</p>
                    <Button asChild>
                        <Link to="/pekerjaan">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke Daftar Pekerjaan
                        </Link>
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button variant="ghost" asChild className="mb-2">
                            <Link to="/pekerjaan">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Detail Pekerjaan</h1>
                        <p className="text-muted-foreground">
                            Informasi lengkap tentang pekerjaan dan data terkait
                        </p>
                    </div>
                    <Button asChild>
                        <Link to="/pekerjaan/$id/edit" params={{ id: id! }}>Edit Pekerjaan</Link>
                    </Button>
                </div>

                {/* Pekerjaan Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>{pekerjaan.nama_paket}</CardTitle>
                        <CardDescription>
                            {pekerjaan.kode_rekening && (
                                <span className="inline-block mr-4">
                                    Kode Rekening: {pekerjaan.kode_rekening}
                                </span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Pagu</p>
                                <p className="text-lg font-semibold flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    {formatCurrency(pekerjaan.pagu)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Kecamatan</p>
                                <p className="text-lg font-semibold">{pekerjaan.kecamatan?.nama_kecamatan || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Desa</p>
                                <p className="text-lg font-semibold flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {pekerjaan.desa?.nama_desa || '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Kegiatan</p>
                                <p className="text-lg font-semibold">{pekerjaan.kegiatan?.nama_kegiatan || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="kontrak" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="kontrak">Kontrak</TabsTrigger>
                        <TabsTrigger value="output">Output</TabsTrigger>
                        <TabsTrigger value="penerima">Penerima</TabsTrigger>
                        <TabsTrigger value="foto">Foto</TabsTrigger>
                        <TabsTrigger value="berkas">Berkas</TabsTrigger>
                        <TabsTrigger value="progress">Progress</TabsTrigger>
                        <TabsTrigger value="berita-acara">Berita Acara</TabsTrigger>
                    </TabsList>

                    <TabsContent value="kontrak" className="space-y-4">
                        <KontrakTabContent pekerjaanId={Number(id)} />
                    </TabsContent>

                    <TabsContent value="output" className="space-y-4">
                        <OutputTabContent pekerjaanId={Number(id)} />
                    </TabsContent>

                    <TabsContent value="penerima" className="space-y-4">
                        <PenerimaTabContent pekerjaanId={Number(id)} />
                    </TabsContent>

                    <TabsContent value="foto" className="space-y-4">
                        <Suspense fallback={
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Memuat Foto...</span>
                            </div>
                        }>
                            <FotoTabContent pekerjaanId={Number(id)} />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="berkas" className="space-y-4">
                        <BerkasTabContent pekerjaanId={Number(id)} />
                    </TabsContent>

                    <TabsContent value="progress" className="space-y-4">
                        <Suspense fallback={
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Memuat Progress...</span>
                            </div>
                        }>
                            <ProgressTabContent pekerjaanId={Number(id)} />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="berita-acara" className="space-y-4">
                        <Suspense fallback={
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Memuat Berita Acara...</span>
                            </div>
                        }>
                            <BeritaAcaraTabContent pekerjaanId={Number(id)} />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </div>
        </PageContainer>
    );
}
