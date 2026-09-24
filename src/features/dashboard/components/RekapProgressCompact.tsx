import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Inbox } from 'lucide-react'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { getKecamatanName } from '@/lib/wilayah-fields'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { formatCurrency } from '../lib/format'

/**
 * Rekap progress ringkas — adaptasi tabel `progress_rekap` untuk halaman Program:
 * 8 paket teratas berdasar progres fisik estimasi + tautan ke rekap penuh.
 */
export function RekapProgressCompact() {
    const { tahunAnggaran } = useAppSettingsValues()

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['rekap-progress-compact', tahunAnggaran],
        queryFn: () =>
            getPekerjaan({
                tahun: tahunAnggaran,
                per_page: 30,
                status: 'active',
            }),
        staleTime: 60_000,
        select: (res) => ({
            ...res,
            data: [...(res.data ?? [])]
                .sort((a, b) => (b.progress_estimasi_fisik ?? 0) - (a.progress_estimasi_fisik ?? 0))
                .slice(0, 8),
        }),
    })

    const rows = data?.data ?? []

    return (
        <Card>
            <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-2'>
                <div>
                    <CardTitle className='font-normal'>Rekap Progress</CardTitle>
                    <CardDescription>Paket teratas berdasar progres fisik estimasi · TA {tahunAnggaran}</CardDescription>
                </div>
                <Button variant='outline' size='sm' asChild>
                    <Link to='/progress_rekap'>
                        Rekap penuh
                        <ArrowRight />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TableSkeleton rows={5} columns={4} />
                ) : isError ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant='icon'>
                                <Inbox />
                            </EmptyMedia>
                            <EmptyTitle>Gagal memuat rekap</EmptyTitle>
                            <EmptyDescription>
                                Periksa koneksi lalu{' '}
                                <button type='button' className='underline' onClick={() => void refetch()}>
                                    coba lagi
                                </button>
                                .
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : rows.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant='icon'>
                                <Inbox />
                            </EmptyMedia>
                            <EmptyTitle>Belum ada paket aktif</EmptyTitle>
                            <EmptyDescription>Tidak ada pekerjaan aktif pada tahun anggaran ini.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className='overflow-x-auto'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Paket</TableHead>
                                    <TableHead className='text-right'>Pagu</TableHead>
                                    <TableHead className='w-40'>Fisik</TableHead>
                                    <TableHead className='w-40'>Keuangan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className='max-w-72'>
                                            <Link
                                                to='/pekerjaan/$id'
                                                params={{ id: String(item.id) }}
                                                className='block truncate font-medium hover:underline'
                                            >
                                                {item.nama_paket}
                                            </Link>
                                            <span className='block truncate text-xs text-muted-foreground'>
                                                {getKecamatanName(item.kecamatan) || '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell className='text-right text-sm whitespace-nowrap tabular-nums'>
                                            {formatCurrency(item.pagu ?? 0)}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <Progress value={item.progress_estimasi_fisik ?? 0} className='h-2' />
                                                <span className='w-12 shrink-0 text-right text-xs tabular-nums'>
                                                    {item.progress_estimasi_fisik ?? 0}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <Progress
                                                    value={item.progress_estimasi_keuangan ?? 0}
                                                    className='h-2 [&_[data-slot=progress-indicator]]:bg-chart-2'
                                                />
                                                <span className='w-12 shrink-0 text-right text-xs tabular-nums'>
                                                    {item.progress_estimasi_keuangan ?? 0}%
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
