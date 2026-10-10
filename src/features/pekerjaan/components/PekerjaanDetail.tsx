import { lazy, Suspense, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate, useSearch } from '@tanstack/react-router';
import { getPekerjaanById } from '../api/pekerjaan';
import { getPekerjaanProgressEstimasi } from '../api/progress-estimasi';
import PekerjaanProgressEstimasiTab from './PekerjaanProgressEstimasiTab';
import { PekerjaanBadges } from './PekerjaanBadges';
import { useAppSettingsValues } from '@/hooks/use-app-settings';
import { formatCurrency } from '@/lib/format';
import { cn, lazyImport } from '@/lib/utils';
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
import { AlertTriangle, ArrowLeft, Banknote, Building2, FileText, Loader2, MapPin, Pencil, Tag, UserCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import KontrakTabContent from './KontrakTabContent';
import OutputTabContent from './OutputTabContent';

import PenerimaTabContent from './PenerimaTabContent';
import BerkasTabContent from './BerkasTabContent';
import { useAuthStore } from '@/stores/auth-stores';

// Lazy load FotoTabContent - contains many images
const FotoTabContent = lazy(() => lazyImport(() => import('./FotoTabContent'), 'foto-tab-content'));

import PageContainer from '@/components/layout/page-container';

const progressColor = (pct: number) =>
    pct >= 100 ? 'bg-green-600' :
    pct >= 75  ? 'bg-emerald-500' :
    pct >= 50  ? 'bg-amber-500' :
    pct >= 25  ? 'bg-orange-500' : 'bg-rose-500';

/** Loading placeholder shared by all lazily-mounted tab bodies. */
function TabFallback({ label = 'Memuat...' }: { label?: string }) {
    return (
        <div className="flex items-center justify-center py-12" role="status" aria-label={label}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">{label}</span>
        </div>
    );
}

/** Label + value row for the info grid. Keeps typography and icon alignment consistent. */
function InfoItem({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
    return (
        <div className="min-w-0 space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2 text-base md:text-lg font-semibold break-words">
                {icon}
                <span className="min-w-0">{children}</span>
            </div>
        </div>
    );
}

/** Small count pill shown inside a tab trigger when the count is known. */
function TabCount({ value }: { value: number | undefined }) {
    if (typeof value !== 'number') return null;
    return (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
            {value}
        </span>
    );
}

export default function PekerjaanDetail() {
    const params = useParams({ strict: false });
    const navigate = useNavigate();
    const search = useSearch({ from: '/_authenticated/pekerjaan/$id/' });
    const id = params.id;
    const { tahunAnggaran } = useAppSettingsValues();
    const tahun = Number(tahunAnggaran) || new Date().getFullYear();

    // 1. Fetch Pekerjaan Detail
    const { data: pekerjaan, isLoading: loading, isError, refetch } = useQuery({
        queryKey: ['pekerjaan', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await getPekerjaanById(Number(id));
            return response.data;
        },
        enabled: !!id,
    });

    // 2. Fetch progress estimasi fisik for header summary.
    // Key uses Number(id) so the cache is shared with PekerjaanProgressEstimasiTab —
    // saving progress in the tab updates this header summary too.
    const { data: progressEstimasi, isLoading: progressLoading } = useQuery({
        queryKey: ['pekerjaan-progress-estimasi', Number(id), tahun],
        queryFn: async () => {
            if (!id) return null;
            return getPekerjaanProgressEstimasi(Number(id), tahun);
        },
        enabled: !!id,
    });

    // null = belum ada data realisasi (beda dengan 0% yang berarti realisasi tercatat 0)
    const latestProgress = useMemo(() => {
        return progressEstimasi?.data.fisik.latest_realisasi ?? null;
    }, [progressEstimasi]);

    const { auth } = useAuthStore();
    const isAdmin = auth.user?.roles?.includes('admin') ?? false;
    const defaultTab = isAdmin ? "kontrak" : "penerima";
    const activeTab = search.tab && (isAdmin || !['kontrak', 'output'].includes(search.tab))
        ? search.tab
        : defaultTab;

    // Asal navigasi: back ke halaman yang sama tempat "Detail" diklik.
    const backTo = search.from === 'rekap' ? '/dashboard/progres' : '/pekerjaan';

    if (loading) {
        return <PageContainer isloading />;
    }

    if (isError) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                    <div className="space-y-1">
                        <p className="font-semibold">Gagal memuat data pekerjaan</p>
                        <p className="text-sm text-muted-foreground">
                            Periksa koneksi Anda lalu coba lagi.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button variant="outline" asChild>
                            <Link to={backTo}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <Button onClick={() => refetch()}>
                            Coba Lagi
                        </Button>
                    </div>
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
                        <Link to={backTo}>
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
                            <Link to={backTo}>
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
                            <Link to="/pekerjaan/$id/edit" params={{ id: id! }}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Pekerjaan
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Pekerjaan Info Card */}
                <Card className="overflow-hidden border-none shadow-lg bg-linear-to-br from-background to-muted/20">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-1 flex-1 min-w-0">
                                <CardTitle className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-primary break-words">
                                    {pekerjaan.nama_paket}
                                </CardTitle>
                                <CardDescription className="flex flex-wrap items-center gap-2">
                                    {pekerjaan.kode_rekening && (
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {pekerjaan.kode_rekening}
                                        </Badge>
                                    )}
                                    <PekerjaanBadges item={pekerjaan} />
                                    {pekerjaan.status === 'active' ? (
                                        <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                                            Aktif
                                        </Badge>
                                    ) : null}
                                    <span className="text-xs text-muted-foreground font-mono">
                                        ID: {pekerjaan.id}
                                    </span>
                                </CardDescription>
                                {pekerjaan.catatan ? (
                                    <div className="mt-3 flex max-w-2xl items-start gap-2 rounded-lg border border-muted bg-muted/40 p-3 text-sm">
                                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                        <p className="text-muted-foreground whitespace-pre-line break-words">
                                            <span className="font-semibold text-foreground">Catatan: </span>
                                            {pekerjaan.catatan}
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            {/* Progress Summary Section */}
                            <div className="flex w-full flex-col gap-2 rounded-2xl border border-primary/5 bg-background/60 p-4 shadow-sm backdrop-blur-sm md:w-auto md:min-w-[240px]">
                                <div className="flex items-center justify-between w-full gap-4">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Total Progres</span>
                                    {progressLoading ? (
                                        <div className="h-7 w-20 animate-pulse rounded-full bg-muted" aria-label="Memuat progres" />
                                    ) : latestProgress === null ? (
                                        <Badge variant="outline" className="px-3 py-0.5 text-sm font-bold">
                                            Belum ada data
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="default"
                                            className={cn('rounded-full px-3 py-0.5 text-lg font-black tabular-nums shadow-md', progressColor(latestProgress))}
                                        >
                                            {latestProgress.toFixed(2)}%
                                        </Badge>
                                    )}
                                </div>
                                <div
                                    className="w-full bg-muted/30 h-3 rounded-full overflow-hidden border border-muted-foreground/10"
                                    role="progressbar"
                                    aria-label="Total progres fisik"
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={latestProgress === null ? undefined : Math.round(Math.min(Math.max(latestProgress, 0), 100))}
                                    aria-valuetext={latestProgress === null ? 'Belum ada data' : `${latestProgress.toFixed(2)} persen`}
                                >
                                    {latestProgress !== null && (
                                        <div
                                            className={cn('h-full transition-all duration-1000 ease-out rounded-full', progressColor(latestProgress))}
                                            style={{ width: `${Math.min(Math.max(latestProgress, 0), 100)}%` }}
                                        />
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground italic font-medium md:text-right">
                                    Berdasarkan realisasi progress fisik estimasi
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoItem
                                label="Pagu"
                                icon={<Banknote className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            >
                                {formatCurrency(pekerjaan.pagu)}
                            </InfoItem>
                            <InfoItem
                                label="Kecamatan"
                                icon={<Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            >
                                {pekerjaan.kecamatan?.nama_kecamatan || '-'}
                            </InfoItem>
                            <InfoItem
                                label="Desa"
                                icon={<MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            >
                                {pekerjaan.desa?.nama_desa || '-'}
                            </InfoItem>
                            <InfoItem label="Sub Kegiatan">
                                {pekerjaan.kegiatan?.nama_sub_kegiatan || '-'}
                            </InfoItem>
                            <InfoItem
                                label="Pengawas"
                                icon={<UserCheck className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            >
                                <span>
                                    {pekerjaan.pengawas?.nama || '-'}
                                    {pekerjaan.pengawas?.nip && (
                                        <span className="block text-xs font-normal text-muted-foreground">
                                            NIP: {pekerjaan.pengawas.nip}
                                        </span>
                                    )}
                                </span>
                            </InfoItem>
                            <InfoItem
                                label="Pendamping"
                                icon={<Users className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            >
                                <span>
                                    {pekerjaan.pendamping?.nama || '-'}
                                    {pekerjaan.pendamping?.nip && (
                                        <span className="block text-xs font-normal text-muted-foreground">
                                            NIP: {pekerjaan.pendamping.nip}
                                        </span>
                                    )}
                                </span>
                            </InfoItem>
                        </div>

                        {/* Tags Section */}
                        {pekerjaan.tags && pekerjaan.tags.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <Tag className="h-4 w-4 shrink-0" />
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
                    <div className="w-full overflow-x-auto pb-1 no-scrollbar">
                        <TabsList className="inline-flex w-auto min-w-full md:min-w-0 md:w-auto justify-start">
                            {isAdmin && (
                                <TabsTrigger value="kontrak" className="gap-1.5">
                                    Kontrak
                                    <TabCount value={pekerjaan.kontrak_count} />
                                </TabsTrigger>
                            )}
                            {isAdmin && <TabsTrigger value="output">Output</TabsTrigger>}
                            <TabsTrigger value="penerima" className="gap-1.5">
                                Penerima
                                <TabCount value={pekerjaan.penerima_count} />
                            </TabsTrigger>
                            <TabsTrigger value="foto" className="gap-1.5">
                                Foto
                                <TabCount value={pekerjaan.foto_count} />
                            </TabsTrigger>
                            <TabsTrigger value="berkas">Berkas</TabsTrigger>
                            <TabsTrigger value="progress">Progress</TabsTrigger>

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
                            <PenerimaTabContent
                                pekerjaanId={Number(id)}
                                pekerjaanName={pekerjaan?.nama_paket}
                            />
                        ) : null}
                        {activeTab === 'foto' ? (
                            <Suspense fallback={<TabFallback label="Memuat Foto..." />}>
                                <FotoTabContent pekerjaanId={Number(id)} pekerjaan={pekerjaan || undefined} />
                            </Suspense>
                        ) : null}
                        {activeTab === 'berkas' ? (
                            <BerkasTabContent pekerjaanId={Number(id)} namaPaket={pekerjaan.nama_paket} />
                        ) : null}
                        {activeTab === 'progress' ? (
                            <PekerjaanProgressEstimasiTab pekerjaanId={Number(id)} />
                        ) : null}
                    </div>


                </Tabs>
            </div>
        </PageContainer>
    );
}
