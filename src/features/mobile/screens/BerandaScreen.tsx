import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Search, AlertTriangle } from 'lucide-react'
import { getDashboardStats } from '@/features/dashboard/api/dashboard'
import { formatCurrency, formatNumber } from '@/features/dashboard/lib/format'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { useSpamRekap } from '@/features/spam-unit/hooks/useSpamRekap'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'

const CONTOH_PAKET = 50

function persen(n: number) {
    return `${n.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

function Kartu({ label, nilai, catatan, persenNilai }: { label: string; nilai: string; catatan?: string; persenNilai?: number }) {
    return (
        <div className="flex flex-col gap-2 rounded-xl border bg-background p-4">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xl font-bold tabular-nums">{nilai}</span>
            {persenNilai !== undefined ? (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, persenNilai))}%` }} />
                </div>
            ) : null}
            {catatan ? <span className="text-xs text-muted-foreground">{catatan}</span> : null}
        </div>
    )
}

/** Beranda: ringkasan wilayah, paket yang perlu tindak lanjut, dan pintasan. Hanya memakai endpoint yang sudah ada. */
export function BerandaScreen() {
    const user = useAuthStore((s) => s.auth.user)
    const { tahunAnggaran } = useAppSettingsValues()
    const namaPeran = (user?.roles ?? []).map((r: unknown) => (typeof r === 'string' ? r : ((r as { name?: string }).name ?? '')))
    const bisaStatistik = namaPeran.some((n) => n === 'admin' || n === 'manager')
    const namaDepan = (user?.name ?? '').split(' ')[0]

    const statistik = useQuery({
        queryKey: ['mobile-beranda-stats', tahunAnggaran],
        queryFn: () => getDashboardStats(tahunAnggaran),
        enabled: bisaStatistik,
        staleTime: 60_000,
    })

    const paket = useQuery({
        queryKey: ['mobile-beranda-paket', tahunAnggaran],
        queryFn: () => getPekerjaan({ per_page: CONTOH_PAKET, tahun: tahunAnggaran, status: 'active', summary: true }),
        staleTime: 60_000,
    })

    const spm = useSpamRekap({ includeDesa: false })

    const baris = paket.data?.data ?? []
    const totalPaket = statistik.data?.totalPekerjaan ?? paket.data?.meta?.total ?? baris.length
    const pagu = statistik.data?.totalPaguPekerjaan ?? baris.reduce((a, p) => a + (p.pagu ?? 0), 0)
    const rataFisik = baris.length
        ? baris.reduce((a, p) => a + Number(p.progress_estimasi_fisik ?? 0), 0) / baris.length
        : 0
    const spmPersen = spm.targetKk > 0 ? (spm.totalKk / spm.targetKk) * 100 : 0

    const tertinggal = baris
        .filter((p) => (p.deviasi_estimasi_fisik ?? 0) < 0)
        .sort((a, b) => (a.deviasi_estimasi_fisik ?? 0) - (b.deviasi_estimasi_fisik ?? 0))
        .slice(0, 3)

    return (
        <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-6 pt-4">
            <section className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Halo{namaDepan ? `, ${namaDepan}` : ''}</h1>
                <p className="text-sm text-muted-foreground">Ringkasan TA {tahunAnggaran || '-'} · Kabupaten Cianjur</p>
            </section>

            <Link to={'/m/cari' as never} className="flex h-12 items-center gap-3 rounded-full border bg-background px-4 text-muted-foreground">
                <Search className="h-5 w-5" aria-hidden />
                <span className="text-base">Cari paket, desa, unit…</span>
            </Link>

            <section aria-label="Ringkasan" className="grid grid-cols-2 gap-3">
                <Kartu label="Paket aktif" nilai={formatNumber(totalPaket)} catatan={baris.length ? `fisik rata-rata ${persen(rataFisik)}` : undefined} />
                <Kartu label="Pagu" nilai={formatCurrency(pagu)} catatan={statistik.data ? 'seluruh paket aktif' : 'dari paket yang dimuat'} />
                <div className="col-span-2">
                <Kartu
                    label="Capaian SPM air minum"
                    nilai={spm.targetKk > 0 ? persen(spmPersen) : '–'}
                    catatan={spm.targetKk > 0 ? `${formatNumber(spm.totalKk)} dari ${formatNumber(spm.targetKk)} KK` : 'target belum tersedia'}
                    persenNilai={spmPersen}
                />
                </div>
            </section>

            <section aria-label="Perlu tindak lanjut" className="flex flex-col gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden />
                    Perlu tindak lanjut
                </h2>
                {paket.isLoading ? (
                    <p className="text-sm text-muted-foreground">Memuat…</p>
                ) : tertinggal.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Tidak ada paket yang tertinggal dari target.</p>
                ) : (
                    <ul className="divide-y rounded-xl border bg-background">
                        {tertinggal.map((p) => (
                            <li key={p.id}>
                                <Link to={'/pekerjaan/$id' as never} params={{ id: String(p.id) } as never} className="flex flex-col gap-1 px-4 py-3">
                                    <span className="font-medium">{p.nama_paket}</span>
                                    <span className="text-xs text-red-600">Deviasi {persen(p.deviasi_estimasi_fisik ?? 0)} · fisik {persen(Number(p.progress_estimasi_fisik ?? 0))}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

        </main>
    )
}
