import { lazy, Suspense, useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PageContainer from '@/components/layout/page-container'
import { lazyImport } from '@/lib/utils'
import { formatLokasiWilayah } from '@/lib/wilayah-fields'
import { useBuatLaporanPage } from '../hooks/useBuatLaporanPage'
import { BuatLaporanProgressBadge } from './BuatLaporanProgressBadge'

const ProgressReportEditor = lazy(() =>
    lazyImport(
        () => import('@/features/progress/components/ProgressReportEditor'),
        'buat-laporan-progress-editor',
    ),
)

export default function BuatLaporanPage() {
    const navigate = useNavigate()
    const params = useParams({ strict: false })
    const pekerjaanId = Number(params.id)
    const [progressLoaded, setProgressLoaded] = useState(false)

    const {
        pekerjaan,
        isLoading,
        weightedProgress,
        confirmLeave,
        handleEditorSnapshotChange,
    } = useBuatLaporanPage(pekerjaanId)

    const handleBack = () => {
        if (!confirmLeave()) return
        void navigate({ to: '/buat-laporan' })
    }

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </PageContainer>
        )
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
        )
    }

    return (
        <PageContainer>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            className="mb-2 -ml-2"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Button>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Buat Laporan Progress
                        </h1>
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
                                    {pekerjaan.kode_rekening ? (
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {pekerjaan.kode_rekening}
                                        </Badge>
                                    ) : null}
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {formatLokasiWilayah(pekerjaan.desa, pekerjaan.kecamatan, {
                                            separator: ' • ',
                                        }) || '-'}
                                    </span>
                                </CardDescription>
                            </div>
                            <BuatLaporanProgressBadge
                                value={progressLoaded ? weightedProgress : null}
                                loading={!progressLoaded}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Kegiatan</p>
                                <p className="font-semibold">
                                    {pekerjaan.kegiatan?.nama_sub_kegiatan || '-'}
                                </p>
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
                    <ProgressReportEditor
                        pekerjaanId={pekerjaanId}
                        onEditorSnapshotChange={handleEditorSnapshotChange}
                        onProgressReady={() => setProgressLoaded(true)}
                        clearImportRabSearchOnLoad
                    />
                </Suspense>
            </div>
        </PageContainer>
    )
}