import { lazy, Suspense } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { getPekerjaanById } from '@/features/pekerjaan/api/pekerjaan';
import { getProgressReport } from '@/features/progress/api/progress';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/page-container';
import { lazyImport } from '@/lib/utils';
import { useMemo } from 'react';

const ProgressTabContent = lazy(() =>
    lazyImport(() => import('@/features/pekerjaan/components/ProgressTabContent'), 'buat-laporan-progress'),
);

export default function BuatLaporanPage() {
    const params = useParams({ strict: false });
    const id = params.id;
    const pekerjaanId = Number(id);

    const { data: pekerjaan, isLoading: loadingPekerjaan } = useQuery({
        queryKey: ['pekerjaan', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await getPekerjaanById(pekerjaanId);
            return response.data;
        },
        enabled: !!id && pekerjaanId > 0,
    });

    const { data: report } = useQuery({
        queryKey: ['progress-report', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await getProgressReport(pekerjaanId);
            return response.data;
        },
        enabled: !!id && pekerjaanId > 0,
    });

    const totalProgress = useMemo(() => {
        return report?.totals?.total_weighted_progress || 0;
    }, [report]);

    if (loadingPekerjaan) {
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
                <div className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">Data pekerjaan tidak ditemukan</p>
                    <Button asChild>
                        <Link to="/buat-laporan">
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
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Button variant="ghost" asChild className="mb-2 -ml-2">
                            <Link to="/buat-laporan">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Buat Laporan Progress</h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            Isi dan simpan laporan progress fisik pekerjaan
                        </p>
                    </div>
                </div>

                <Card className="overflow-hidden border-none shadow-lg bg-linear-to-br from-background to-muted/20">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                                <CardTitle className="text-xl md:text-2xl font-extrabold tracking-tight text-primary">
                                    {pekerjaan.nama_paket}
                                </CardTitle>
                                <CardDescription className="flex flex-wrap items-center gap-2">
                                    {pekerjaan.kode_rekening && (
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {pekerjaan.kode_rekening}
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {pekerjaan.kecamatan?.nama_kecamatan || '-'} • {pekerjaan.desa?.nama_desa || '-'}
                                    </span>
                                </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2 bg-background/60 backdrop-blur-sm p-4 rounded-2xl border border-primary/5 shadow-sm min-w-[180px]">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                                    Total Progres
                                </span>
                                <Badge
                                    variant="default"
                                    className={`font-black text-lg px-3 py-0.5 rounded-full ${
                                        totalProgress >= 100
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : totalProgress >= 75
                                              ? 'bg-emerald-500 hover:bg-emerald-600'
                                              : totalProgress >= 50
                                                ? 'bg-amber-500 hover:bg-amber-600'
                                                : totalProgress >= 25
                                                  ? 'bg-orange-500 hover:bg-orange-600'
                                                  : 'bg-rose-500 hover:bg-rose-700'
                                    }`}
                                >
                                    {totalProgress.toFixed(2)}%
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Kegiatan</p>
                                <p className="font-semibold">{pekerjaan.kegiatan?.nama_sub_kegiatan || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Pengawas</p>
                                <p className="font-semibold">{pekerjaan.pengawas?.nama || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Suspense
                    fallback={
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Memuat form laporan...</span>
                        </div>
                    }
                >
                    <ProgressTabContent pekerjaanId={pekerjaanId} />
                </Suspense>
            </div>
        </PageContainer>
    );
}