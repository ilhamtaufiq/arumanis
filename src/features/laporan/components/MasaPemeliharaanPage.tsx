import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import { getMasaPemeliharaan } from '../api/masa-pemeliharaan'
import { exportMasaPemeliharaanExcel, exportMasaPemeliharaanPdf } from '../lib/laporan-export'
import {
    BATAS_PERINGATAN_HARI,
    filterMasa,
    parseTanggal,
    ringkasanMasa,
    sisaHari,
    type StatusFilter,
} from '../lib/masa-pemeliharaan'

const FILTER: { value: StatusFilter; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'berjalan', label: 'Berjalan' },
    { value: 'segera', label: `Berakhir ≤ ${BATAS_PERINGATAN_HARI} hari` },
    { value: 'berakhir', label: 'Berakhir' },
]

const tanggalFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

/** Pemantauan masa pemeliharaan per paket. Tahun mengikuti header (TA aktif), sama dengan kartu di Laporan. */
export function MasaPemeliharaanPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const { auth } = useAuthStore()
    const canDownload = auth.user?.roles?.some((role) => role === 'admin' || role === 'manager') ?? false
    const [status, setStatus] = useState<StatusFilter>('semua')
    const [cari, setCari] = useState('')
    const [busy, setBusy] = useState<'excel' | 'pdf' | null>(null)

    const query = useQuery({
        queryKey: ['masa-pemeliharaan', tahunAnggaran],
        queryFn: () => getMasaPemeliharaan(tahunAnggaran),
        enabled: canDownload,
        staleTime: 60_000,
    })

    const hariIni = useMemo(() => new Date(), [])
    const semua = query.data?.data ?? []
    const masaHari = query.data?.masa_pemeliharaan_hari ?? 0
    const ringkasan = useMemo(() => ringkasanMasa(semua, hariIni), [semua, hariIni])
    const tampil = useMemo(() => filterMasa(semua, { status, cari, hariIni }), [semua, status, cari, hariIni])

    const unduh = async (kind: 'excel' | 'pdf') => {
        setBusy(kind)
        try {
            if (kind === 'pdf') await exportMasaPemeliharaanPdf(tampil, masaHari)
            else await exportMasaPemeliharaanExcel(tampil, masaHari)
            toast.success('Laporan berhasil diunduh')
        } catch {
            toast.error('Gagal mengunduh laporan')
        } finally {
            setBusy(null)
        }
    }

    return (
        <>
            <Header fixed />
            <Main fluid className='w-full max-w-none px-3 pb-8 pt-4 sm:px-5'>
                <div className='flex w-full min-w-0 flex-col gap-4'>
                    <div>
                        <h1 className='text-xl font-bold tracking-tight'>Masa Pemeliharaan</h1>
                        <p className='text-sm text-muted-foreground'>
                            TA {tahunAnggaran}
                            {query.data && ` · ${masaHari} hari sejak tanggal BASTP`}
                        </p>
                    </div>

                    {!canDownload ? (
                        <div className='rounded-2xl border border-dashed bg-card p-8 text-center'>
                            <p className='text-sm font-medium'>Pemantauan masa pemeliharaan tersedia untuk admin & manager.</p>
                        </div>
                    ) : query.isPending ? (
                        <p className='text-sm text-muted-foreground'>Memuat data…</p>
                    ) : query.isError ? (
                        <p role='alert' className='text-sm text-destructive'>
                            Gagal memuat data masa pemeliharaan. Coba muat ulang halaman.
                        </p>
                    ) : (
                        <>
                            <dl className='grid grid-cols-2 gap-3 md:grid-cols-4'>
                                <Stat label='Paket dengan BASTP' nilai={ringkasan.total} />
                                <Stat label='Masih berjalan' nilai={ringkasan.berjalan} />
                                <Stat label={`Berakhir dalam ${BATAS_PERINGATAN_HARI} hari`} nilai={ringkasan.segera} tekanan />
                                <Stat label='Sudah berakhir' nilai={ringkasan.berakhir} />
                            </dl>

                            <div className='flex flex-wrap items-center justify-between gap-3'>
                                <div role='group' aria-label='Filter status' className='flex flex-wrap gap-2'>
                                    {FILTER.map((f) => (
                                        <Button
                                            key={f.value}
                                            size='sm'
                                            variant={status === f.value ? 'default' : 'outline'}
                                            aria-pressed={status === f.value}
                                            onClick={() => setStatus(f.value)}
                                        >
                                            {f.label}
                                        </Button>
                                    ))}
                                </div>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Input
                                        type='search'
                                        value={cari}
                                        onChange={(e) => setCari(e.target.value)}
                                        placeholder='Cari paket atau nomor BASTP'
                                        aria-label='Cari paket atau nomor BASTP'
                                        className='w-64'
                                    />
                                    <Button size='sm' variant='outline' disabled={busy !== null || tampil.length === 0} onClick={() => void unduh('excel')}>
                                        {busy === 'excel' ? <Loader2 className='animate-spin' /> : <Download />}
                                        Excel
                                    </Button>
                                    <Button size='sm' variant='outline' disabled={busy !== null || tampil.length === 0} onClick={() => void unduh('pdf')}>
                                        {busy === 'pdf' ? <Loader2 className='animate-spin' /> : <Download />}
                                        PDF
                                    </Button>
                                </div>
                            </div>

                            <Card>
                                <CardContent className='p-0'>
                                    {tampil.length === 0 ? (
                                        <p className='py-12 text-center text-sm text-muted-foreground'>
                                            {semua.length === 0
                                                ? `Belum ada paket dengan BASTP pada TA ${tahunAnggaran}.`
                                                : 'Tidak ada paket yang cocok dengan filter ini.'}
                                        </p>
                                    ) : (
                                        <div className='overflow-x-auto'>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className='w-12'>No</TableHead>
                                                        <TableHead className='min-w-56'>Nama paket</TableHead>
                                                        <TableHead>No. BASTP</TableHead>
                                                        <TableHead>Tgl BASTP</TableHead>
                                                        <TableHead>Akhir masa</TableHead>
                                                        <TableHead className='text-right'>Sisa</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {tampil.map((r, i) => {
                                                        const sisa = sisaHari(r.tanggal_akhir, hariIni)
                                                        const segera = r.status === 'berjalan' && sisa <= BATAS_PERINGATAN_HARI
                                                        return (
                                                            <TableRow key={`${r.pekerjaan_id}-${r.nomor_bastp}-${i}`}>
                                                                <TableCell className='tabular-nums text-muted-foreground'>{i + 1}</TableCell>
                                                                <TableCell className='whitespace-normal font-medium'>{r.nama_paket ?? '–'}</TableCell>
                                                                <TableCell className='font-mono text-xs'>{r.nomor_bastp ?? '–'}</TableCell>
                                                                <TableCell className='whitespace-nowrap'>{tanggalFormat.format(parseTanggal(r.tanggal_bastp))}</TableCell>
                                                                <TableCell className='whitespace-nowrap'>{tanggalFormat.format(parseTanggal(r.tanggal_akhir))}</TableCell>
                                                                <TableCell className={`text-right tabular-nums ${segera ? 'font-semibold text-amber-700' : ''}`}>
                                                                    {r.status === 'berjalan' ? `${sisa} hari` : `lewat ${-sisa} hari`}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className={r.status === 'berjalan' ? 'text-emerald-700' : 'text-muted-foreground'}>
                                                                        {r.status === 'berjalan' ? 'Berjalan' : 'Berakhir'}
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <p className='text-xs text-muted-foreground'>
                                Diurutkan dari akhir masa paling dekat. Unduhan berisi baris yang sedang tampil.
                            </p>
                        </>
                    )}
                </div>
            </Main>
        </>
    )
}

function Stat({ label, nilai, tekanan = false }: { label: string; nilai: number; tekanan?: boolean }) {
    return (
        <Card>
            <CardContent className='p-4'>
                <dt className='text-xs text-muted-foreground'>{label}</dt>
                <dd className={`mt-1 text-2xl font-semibold tabular-nums ${tekanan && nilai > 0 ? 'text-amber-700' : ''}`}>{nilai}</dd>
            </CardContent>
        </Card>
    )
}
