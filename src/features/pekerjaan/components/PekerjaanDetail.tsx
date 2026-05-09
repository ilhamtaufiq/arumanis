import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from '@tanstack/react-router';
import { getPekerjaanById } from '../api/pekerjaan';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Loader2, ArrowLeft, MapPin, DollarSign, Tag, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import KontrakTabContent from './KontrakTabContent';
import OutputTabContent from './OutputTabContent';
import PenerimaTabContent from './PenerimaTabContent';
import BerkasTabContent from './BerkasTabContent';
import { useAuthStore } from '@/stores/auth-stores';

// Lazy load FotoTabContent - contains many images
const FotoTabContent = lazy(() => import('./FotoTabContent'));

import PageContainer from '@/components/layout/page-container';

// Lazy load ProgressTabContent - contains Handsontable (~1.7MB)
const ProgressTabContent = lazy(() => import('./ProgressTabContent'));

export default function PekerjaanDetail() {
    const params = useParams({ strict: false });
    const id = params.id;
    const { data: pekerjaan, isLoading: loading } = useQuery({
        queryKey: ['pekerjaan', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await getPekerjaanById(Number(id));
            return response.data;
        },
        enabled: !!id,
    });

    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles.includes('admin');

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
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Button variant="ghost" asChild className="mb-2">
                            <Link to="/pekerjaan">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Detail Pekerjaan</h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            Informasi lengkap tentang pekerjaan dan data terkait
                        </p>
                    </div>
                    {isAdmin && (
                        <Button asChild className="w-full md:w-auto">
                            <Link to="/pekerjaan/$id/edit" params={{ id: id! }}>Edit Pekerjaan</Link>
                        </Button>
                    )}
                </div>

                {/* Pekerjaan Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl md:text-2xl">{pekerjaan.nama_paket}</CardTitle>
                        <CardDescription>
                            {pekerjaan.kode_rekening && (
                                <span className="inline-block mr-4">
                                    Kode Rekening: {pekerjaan.kode_rekening}
                                </span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Pagu</p>
                                <p className="text-base md:text-lg font-semibold flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    {formatCurrency(pekerjaan.pagu)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Kecamatan</p>
                                <p className="text-base md:text-lg font-semibold">{pekerjaan.kecamatan?.nama_kecamatan || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Desa</p>
                                <p className="text-base md:text-lg font-semibold flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {pekerjaan.desa?.nama_desa || '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Kegiatan</p>
                                <p className="text-base md:text-lg font-semibold">{pekerjaan.kegiatan?.nama_sub_kegiatan || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Pengawas</p>
                                <div className="text-base md:text-lg font-semibold flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    {pekerjaan.pengawas?.nama || '-'}
                                </div>
                                {pekerjaan.pengawas?.nip && <p className="text-xs text-muted-foreground ml-6">NIP: {pekerjaan.pengawas.nip}</p>}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Pendamping</p>
                                <div className="text-base md:text-lg font-semibold flex items-center gap-2">
                                    <UserCheck className="h-4 w-4" />
                                    {pekerjaan.pendamping?.nama || '-'}
                                </div>
                                {pekerjaan.pendamping?.nip && <p className="text-xs text-muted-foreground ml-6">NIP: {pekerjaan.pendamping.nip}</p>}
                            </div>
                        </div>

                        {/* Tags Section */}
                        {pekerjaan.tags && pekerjaan.tags.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                    <Tag className="h-4 w-4" />
                                    Tags
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {pekerjaan.tags.map(tag => (
                                        <Badge
                                            key={tag.id}
                                            variant="secondary"
                                            className="px-2 py-1 text-sm"
                                            style={{
                                                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                                                borderColor: tag.color || undefined,
                                                color: tag.color || undefined
                                            }}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue={isAdmin ? "kontrak" : "penerima"} className="space-y-4">
                    <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
                        <TabsList className="inline-flex w-auto min-w-full md:min-w-0 md:w-auto justify-start">
                            {isAdmin && <TabsTrigger value="kontrak">Kontrak</TabsTrigger>}
                            {isAdmin && <TabsTrigger value="output">Output</TabsTrigger>}
                            <TabsTrigger value="penerima">Penerima</TabsTrigger>
                            <TabsTrigger value="foto">Foto</TabsTrigger>
                            <TabsTrigger value="berkas">Berkas</TabsTrigger>
                            <TabsTrigger value="progress">Progress</TabsTrigger>

                        </TabsList>
                    </div>

                    {isAdmin && (
                        <TabsContent value="kontrak" className="space-y-4">
                            <KontrakTabContent pekerjaanId={Number(id)} />
                        </TabsContent>
                    )}

                    {isAdmin && (
                        <TabsContent value="output" className="space-y-4">
                            <OutputTabContent pekerjaanId={Number(id)} />
                        </TabsContent>
                    )}

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
                            <FotoTabContent pekerjaanId={Number(id)} pekerjaan={pekerjaan || undefined} />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="berkas" className="space-y-4">
                        <BerkasTabContent pekerjaanId={Number(id)} namaPaket={pekerjaan.nama_paket} />
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


                </Tabs>
            </div>
        </PageContainer>
    );
}
