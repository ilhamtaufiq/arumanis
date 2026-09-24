import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import { getDashboardStats } from '@/features/dashboard/api/dashboard'
import {
    exportPaketPekerjaanExcel,
    exportPaketPekerjaanPdf,
    exportProgramExcel,
    exportProgramPdf,
    exportRekapProgressExcel,
    exportRekapProgressPdf,
    exportSubKegiatanExcel,
    exportSubKegiatanPdf,
} from '../lib/laporan-export'

/** Pusat unduhan laporan: rekap progres, keuangan, program (Excel langsung + link halaman penuh). */
export function LaporanPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const { auth } = useAuthStore()
    const canDownload = auth.user?.roles?.some((role) => role === 'admin' || role === 'manager') ?? false
    const [busy, setBusy] = useState<string | null>(null)

    const statsQuery = useQuery({
        queryKey: ['dashboard-stats', tahunAnggaran],
        queryFn: () => getDashboardStats(tahunAnggaran),
        enabled: canDownload,
        staleTime: 60_000,
    })

    const runExport = async (key: string, fn: () => Promise<void>) => {
        setBusy(key)
        try {
            await fn()
            toast.success('Laporan berhasil diunduh')
        } catch (error) {
            console.error('Export laporan gagal:', error)
            toast.error('Gagal mengunduh laporan')
        } finally {
            setBusy(null)
        }
    }

    const exportRekap = (kind: 'excel' | 'pdf') =>
        runExport(`rekap-${kind}`, async () => {
            const res = await getPekerjaan({ tahun: tahunAnggaran, per_page: -1, status: 'active', summary: true })
            const list = (res?.data ?? []) as never[]
            if (kind === 'pdf') await exportRekapProgressPdf(list, tahunAnggaran)
            else await exportRekapProgressExcel(list, tahunAnggaran)
        })

    const stats = statsQuery.data
    const blocked = !canDownload

    return (
        <>
            <BannerNotification />
            <Header fixed />

            <Main fluid className='w-full max-w-none px-3 pb-8 pt-4 sm:px-5'>
                <div className='flex w-full min-w-0 flex-col gap-4'>
                    <div>
                        <h1 className='text-xl font-bold tracking-tight'>Laporan</h1>
                        <p className='text-sm text-muted-foreground'>
                            Pusat unduhan rekap progres, keuangan, dan program · TA {tahunAnggaran}
                        </p>
                    </div>

                    {blocked ? (
                        <div className='rounded-2xl border border-dashed bg-card p-8 text-center'>
                            <p className='text-sm font-medium'>Unduhan laporan tersedia untuk admin & manager.</p>
                        </div>
                    ) : (
                        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                            <Card>
                                <CardHeader>
                                    <FileSpreadsheet className='size-7 text-emerald-600' />
                                    <CardTitle className='mt-2'>Fisik dan Keuangan</CardTitle>
                                    <CardDescription>
                                        Realisasi SP2D vs kontrak per sub kegiatan + pagu dan progres fisik.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='flex flex-wrap gap-2'>
                                    <Button
                                        size='sm'
                                        disabled={!stats || busy !== null}
                                        onClick={() =>
                                            stats && void runExport('keuangan', () => exportSubKegiatanExcel(stats, tahunAnggaran))
                                        }
                                    >
                                        {busy === 'keuangan' ? <Loader2 className='animate-spin' /> : <Download />}
                                        Excel
                                    </Button>
                                    <Button
                                        size='sm'
                                        variant='secondary'
                                        disabled={!stats || busy !== null}
                                        onClick={() =>
                                            stats &&
                                            void runExport('keuangan-pdf', () => exportSubKegiatanPdf(stats, tahunAnggaran))
                                        }
                                    >
                                        {busy === 'keuangan-pdf' ? <Loader2 className='animate-spin' /> : <Download />}
                                        PDF
                                    </Button>
                                    <Button variant='outline' size='sm' asChild>
                                        <Link to='/keuangan'>
                                            Buka halaman
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                </CardContent>
                                <CardFooter className='text-xs text-muted-foreground'>
                                    Sumber: /dashboard/stats TA {tahunAnggaran}
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <FileSpreadsheet className='size-7 text-amber-600' />
                                    <CardTitle className='mt-2'>Paket Pekerjaan</CardTitle>
                                    <CardDescription>
                                        Per sub kegiatan: paket, batal, belum kontrak, pagu, kontrak, realisasi, sisa.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='flex flex-wrap gap-2'>
                                    <Button
                                        size='sm'
                                        disabled={!stats || busy !== null}
                                        onClick={() =>
                                            stats &&
                                            void runExport('paket', () => exportPaketPekerjaanExcel(stats, tahunAnggaran))
                                        }
                                    >
                                        {busy === 'paket' ? <Loader2 className='animate-spin' /> : <Download />}
                                        Excel
                                    </Button>
                                    <Button
                                        size='sm'
                                        variant='secondary'
                                        disabled={!stats || busy !== null}
                                        onClick={() =>
                                            stats && void runExport('paket-pdf', () => exportPaketPekerjaanPdf(stats, tahunAnggaran))
                                        }
                                    >
                                        {busy === 'paket-pdf' ? <Loader2 className='animate-spin' /> : <Download />}
                                        PDF
                                    </Button>
                                </CardContent>
                                <CardFooter className='text-xs text-muted-foreground'>
                                    Sisa kontrak = kontrak − SP2D · sisa pagu = pagu − kontrak
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <FileSpreadsheet className='size-7 text-blue-600' />
                                    <CardTitle className='mt-2'>Rekap Progress</CardTitle>
                                    <CardDescription>
                                        Semua paket aktif + progres fisik/keuangan estimasi.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='flex flex-wrap gap-2'>
                                    <Button size='sm' disabled={busy !== null} onClick={() => void exportRekap('excel')}>
                                        {busy === 'rekap-excel' ? <Loader2 className='animate-spin' /> : <Download />}
                                        Excel
                                    </Button>
                                    <Button
                                        size='sm'
                                        variant='secondary'
                                        disabled={busy !== null}
                                        onClick={() => void exportRekap('pdf')}
                                    >
                                        {busy === 'rekap-pdf' ? <Loader2 className='animate-spin' /> : <Download />}
                                        PDF
                                    </Button>
                                    <Button variant='outline' size='sm' asChild>
                                        <Link to='/progress_rekap'>
                                            Halaman penuh
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                </CardContent>
                                <CardFooter className='text-xs text-muted-foreground'>
                                    PDF berkop + Excel langsung
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <FileSpreadsheet className='size-7 text-violet-600' />
                                    <CardTitle className='mt-2'>Program</CardTitle>
                                    <CardDescription>
                                        Ringkasan kegiatan, output, dan penerima manfaat.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='flex flex-wrap gap-2'>
                                    <Button
                                        size='sm'
                                        disabled={!stats || busy !== null}
                                        onClick={() =>
                                            stats && void runExport('program', () => exportProgramExcel(stats, tahunAnggaran))
                                        }
                                    >
                                        {busy === 'program' ? <Loader2 className='animate-spin' /> : <Download />}
                                        Excel
                                    </Button>
                                    <Button
                                        size='sm'
                                        variant='secondary'
                                        disabled={!stats || busy !== null}
                                        onClick={() =>
                                            stats && void runExport('program-pdf', () => exportProgramPdf(stats, tahunAnggaran))
                                        }
                                    >
                                        {busy === 'program-pdf' ? <Loader2 className='animate-spin' /> : <Download />}
                                        PDF
                                    </Button>
                                    <Button variant='outline' size='sm' asChild>
                                        <Link to='/program'>
                                            Buka halaman
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                </CardContent>
                                <CardFooter className='text-xs text-muted-foreground'>
                                    3 sheet: ringkasan, output, kegiatan per tahun
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </div>
            </Main>
        </>
    )
}
