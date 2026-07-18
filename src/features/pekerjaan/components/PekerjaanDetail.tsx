import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { getPekerjaanById } from '../api/pekerjaan';
import { getPekerjaanProgressEstimasi } from '../api/progress-estimasi';
import PekerjaanProgressEstimasiTab from './PekerjaanProgressEstimasiTab';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
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
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Loader2, ArrowLeft, MapPin, Banknote, Tag, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import KontrakTabContent from './KontrakTabContent';
import OutputTabContent from './OutputTabContent';

import PenerimaTabContent from './PenerimaTabContent';
import BerkasTabContent from './BerkasTabContent';
import SimulationTabContent from './SimulationTabContent';
import { useAuthStore } from '@/stores/auth-stores';
import { useMemo } from 'react';

// Lazy load FotoTabContent - contains many images
const FotoTabContent = lazy(() => lazyImport(() => import('./FotoTabContent'), 'foto-tab-content'));

import PageContainer from '@/components/layout/page-container';
import { lazyImport } from '@/lib/utils';

export default function PekerjaanDetail() {
    const params = useParams({ strict: false });
    const navigate = useNavigate();
    const search = useSearch({ from: '/_authenticated/pekerjaan/$id/' });
    const id = params.id;
    const { tahunAnggaran } = useAppSettingsValues();
    const tahun = Number(tahunAnggaran) || new Date().getFullYear();

    // 1. Fetch Pekerjaan Detail
    const { data: pekerjaan, isLoading: loading } = useQuery({
        queryKey: ['pekerjaan', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await getPekerjaanById(Number(id));
            return response.data;
        },
        enabled: !!id,
    });

    // 2. Fetch progress estimasi fisik for header summary
    const { data: progressEstimasi } = useQuery({
        queryKey: ['pekerjaan-progress-estimasi', id, tahun],
        queryFn: async () => {
            if (!id) return null;
            return getPekerjaanProgressEstimasi(Number(id), tahun);
        },
        enabled: !!id,
    });

    const totalProgress = useMemo(() => {
        return progressEstimasi?.data.fisik.latest_realisasi ?? 0;
    }, [progressEstimasi]);

    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles.includes('admin');
    const defaultTab = isAdmin ? "kontrak" : "penerima";
    const activeTab = search.tab && (isAdmin || !['kontrak', 'output'].includes(search.tab))
        ? search.tab
        : defaultTab;

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
                <Card className="overflow-hidden border-none shadow-lg bg-linear-to-br from-background to-muted/20">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                                <CardTitle className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-primary">
                                    {pekerjaan.nama_paket}
                                </CardTitle>
                                <CardDescription className="flex flex-wrap items-center gap-2">
                                    {pekerjaan.kode_rekening && (
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {pekerjaan.kode_rekening}
                                        </Badge>
                                    )}
                                    {pekerjaan.is_konsultan ? (
                                        <Badge variant="secondary" className="text-xs">
                                            Konsultan
                                        </Badge>
                                    ) : null}
                                    {pekerjaan.status === 'canceled' ? (
                                        <Badge variant="destructive" className="text-xs">
                                            Dibatalkan
                                        </Badge>
                                    ) : null}
                                    {!pekerjaan.has_kontrak && pekerjaan.status !== 'canceled' ? (
                                        <Badge
                                            variant="outline"
                                            className="border-amber-500/40 bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300"
                                        >
                                            Belum berkontrak
                                        </Badge>
                                    ) : null}
                                    <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                                        ID: {pekerjaan.id}
                                    </span>
                                </CardDescription>
                                {pekerjaan.catatan ? (
                                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">Catatan: </span>
                                        {pekerjaan.catatan}
                                    </p>
                                ) : null}
                            </div>

                            {/* Progress Summary Section */}
                            <div className="flex flex-col items-end gap-2 bg-background/60 backdrop-blur-sm p-4 rounded-2xl border border-primary/5 shadow-sm min-w-[200px]">
                                <div className="flex items-center justify-between w-full gap-4">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Total Progres</span>
                                    <Badge 
                                        variant="default" 
                                        className={`font-black text-lg px-3 py-0.5 rounded-full shadow-md animate-in fade-in zoom-in duration-500 ${
                                            totalProgress >= 100 ? 'bg-green-600 hover:bg-green-700' :
                                            totalProgress >= 75 ? 'bg-emerald-500 hover:bg-emerald-600' :
                                            totalProgress >= 50 ? 'bg-amber-500 hover:bg-amber-600' :
                                            totalProgress >= 25 ? 'bg-orange-500 hover:bg-orange-600' :
                                            'bg-rose-500 hover:bg-rose-700'
                                        }`}
                                    >
                                        {totalProgress.toFixed(2)}%
                                    </Badge>
                                </div>
                                <div className="w-full bg-muted/30 h-3 rounded-full overflow-hidden border border-muted-foreground/10 relative">
                                    <div 
                                        className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] ${
                                            totalProgress >= 100 ? 'bg-green-600' :
                                            totalProgress >= 75 ? 'bg-emerald-500' :
                                            totalProgress >= 50 ? 'bg-amber-500' :
                                            totalProgress >= 25 ? 'bg-orange-500' :
                                            'bg-rose-500'
                                        }`}
                                        style={{ width: `${Math.min(totalProgress, 100)}%` }}
                                    />
                                    {totalProgress > 100 && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-full h-full bg-blue-400/20 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground italic font-medium">
                                    Berdasarkan realisasi progress fisik estimasi
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Pagu</p>
                                <p className="text-base md:text-lg font-semibold flex items-center gap-2">
                                    <Banknote className="h-4 w-4" />
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
                                <p className="text-sm text-muted-foreground">Sub Kegiatan</p>
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
                <Tabs
                    value={activeTab}
                    onValueChange={(tab) => {
                        navigate({
                            to: '/pekerjaan/$id',
                            params: { id: id! },
                            search: { tab: tab as typeof activeTab },
                            replace: true,
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
                        <TabsList className="inline-flex w-auto min-w-full md:min-w-0 md:w-auto justify-start">
                            {isAdmin && <TabsTrigger value="kontrak">Kontrak</TabsTrigger>}
                            {isAdmin && <TabsTrigger value="output">Output</TabsTrigger>}
                            <TabsTrigger value="penerima">Penerima</TabsTrigger>
                            <TabsTrigger value="foto">Foto</TabsTrigger>
                            <TabsTrigger value="berkas">Berkas</TabsTrigger>
                            <TabsTrigger value="progress">Progress</TabsTrigger>
                            <TabsTrigger value="simulasi">Simulasi</TabsTrigger>

                        </TabsList>
                    </div>

                    {/* Mount only the active tab body — avoids 5–8 parallel API calls on open */}
                    <div className="space-y-4">
                        {isAdmin && activeTab === 'kontrak' ? (
                            <KontrakTabContent pekerjaanId={Number(id)} />
                        ) : null}
                        {isAdmin && activeTab === 'output' ? (
                            <OutputTabContent pekerjaanId={Number(id)} />
                        ) : null}
                        {activeTab === 'penerima' ? (
                            <PenerimaTabContent pekerjaanId={Number(id)} />
                        ) : null}
                        {activeTab === 'foto' ? (
                            <Suspense fallback={
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-muted-foreground">Memuat Foto...</span>
                                </div>
                            }>
                                <FotoTabContent pekerjaanId={Number(id)} pekerjaan={pekerjaan || undefined} />
                            </Suspense>
                        ) : null}
                        {activeTab === 'berkas' ? (
                            <BerkasTabContent pekerjaanId={Number(id)} namaPaket={pekerjaan.nama_paket} />
                        ) : null}
                        {activeTab === 'progress' ? (
                            <PekerjaanProgressEstimasiTab pekerjaanId={Number(id)} />
                        ) : null}
                        {activeTab === 'simulasi' ? (
                            <SimulationTabContent pekerjaanId={Number(id)} />
                        ) : null}
                    </div>


                </Tabs>
            </div>
        </PageContainer>
    );
}
