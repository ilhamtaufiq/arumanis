import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Medal } from 'lucide-react'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Heading } from '@/components/ui/heading'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import ProgressRekap from '@/features/progress/components/ProgressRekap'
import { getPenilaianPengawas, type PenilaianOrang, type PenilaianParameter } from '../api/dashboard'
import { formatNumber } from '../lib/format'

const pct = (v: number | null | undefined) => (v == null ? '—' : `${Number(v).toFixed(1)}%`)

/** Halaman progres pekerjaan: peringkat pengawasan di atas, lalu rekap progres paket. */
export function DashboardProgresPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const { data: penilaianRes, isLoading: penilaianLoading, isError: penilaianError } = useQuery({
        queryKey: ['penilaian-pengawas', tahunAnggaran],
        queryFn: () => getPenilaianPengawas(tahunAnggaran),
        staleTime: 60_000,
    })
    // api.get sudah mengembalikan isi `data` dari respons, jadi tidak perlu `.data` lagi.
    const penilaian = penilaianRes

    return (
        <>
            <BannerNotification />
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <div className="flex w-full min-w-0 flex-col gap-6">
                    <Heading
                        title="Progres Pekerjaan"
                        description={`TA ${tahunAnggaran} · Rekap progres estimasi per paket dan penilaian pengawas.`}
                    />

                    <section aria-labelledby="rekap-paket" className="flex flex-col gap-3">
                        <h2 id="rekap-paket" className="text-sm font-semibold text-muted-foreground">
                            Rekap progres per paket
                        </h2>
                        <ProgressRekap />
                    </section>

                    <PenilaianSection
                        data={penilaian}
                        isLoading={penilaianLoading}
                        isError={penilaianError}
                    />
                </div>
            </Main>
        </>
    )
}

type PenilaianRow = Omit<PenilaianOrang, 'role'> & { roles: PenilaianOrang['role'][] }

/** Kategori dari skor total, sama dengan aturan di server. */
function kategoriDari(total: number | null): string {
    if (total == null) return 'Belum dinilai'
    if (total >= 85) return 'Sangat baik'
    if (total >= 70) return 'Baik'
    if (total >= 55) return 'Cukup'
    return 'Perlu perhatian'
}

/** Rata-rata berbobot jumlah paket, melewati nilai kosong. */
function rataBerbobot(items: { jumlah: number; nilai: number | null }[]): number | null {
    const ada = items.filter((i) => i.nilai != null)
    const bobot = ada.reduce((sum, i) => sum + i.jumlah, 0)
    if (bobot === 0) return null
    return ada.reduce((sum, i) => sum + (i.nilai as number) * i.jumlah, 0) / bobot
}

/** Gabungkan baris dengan nama yang sama menjadi satu baris. */
function gabungPerNama(list: PenilaianOrang[], kodes: PenilaianParameter['kode'][]): PenilaianRow[] {
    const groups = new Map<string, PenilaianOrang[]>()
    for (const o of list) {
        const key = (o.nama || '').trim().toLowerCase()
        groups.set(key, [...(groups.get(key) ?? []), o])
    }
    const rows: PenilaianRow[] = []
    for (const items of groups.values()) {
        const jumlah = items.reduce((sum, o) => sum + o.jumlah_paket, 0)
        const total = rataBerbobot(items.map((o) => ({ jumlah: o.jumlah_paket, nilai: o.total })))
        const breakdown = Object.fromEntries(
            kodes.map((k) => [k, rataBerbobot(items.map((o) => ({ jumlah: o.jumlah_paket, nilai: o.breakdown[k] })))]),
        ) as PenilaianOrang['breakdown']
        rows.push({
            user_id: items[0].user_id,
            nama: items[0].nama,
            roles: [...new Set(items.map((o) => o.role))],
            jumlah_paket: jumlah,
            total,
            kategori: kategoriDari(total),
            breakdown,
        })
    }
    return rows.sort((a, b) => (b.total ?? -1) - (a.total ?? -1) || b.jumlah_paket - a.jumlah_paket)
}

type RoleFilter = PenilaianOrang['role']

function PenilaianSection({
    data,
    isLoading,
    isError,
}: {
    data: { parameter: PenilaianParameter[]; pengawas: PenilaianOrang[] } | undefined
    isLoading: boolean
    isError: boolean
}) {
    const [role, setRole] = useState<RoleFilter>('pengawas')
    const params = data?.parameter ?? []
    const kodes = params.map((p) => p.kode)
    const rows = useMemo(
        () => gabungPerNama((data?.pengawas ?? []).filter((o) => o.role === role), kodes),
        // kodes berasal dari data.parameter; cukup bergantung pada data dan role
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data, role],
    )
    return (
        <section aria-labelledby="penilaian-pengawas" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="penilaian-pengawas" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Medal className="h-4 w-4" /> Penilaian pengawas
                </h2>
                <div className="flex gap-1" role="group" aria-label="Filter peran">
                    <Button size="sm" variant={role === 'pengawas' ? 'default' : 'outline'} onClick={() => setRole('pengawas')} aria-pressed={role === 'pengawas'}>
                        Pengawas
                    </Button>
                    <Button size="sm" variant={role === 'konsultan_pengawas' ? 'default' : 'outline'} onClick={() => setRole('konsultan_pengawas')} aria-pressed={role === 'konsultan_pengawas'}>
                        Konsultan pengawas
                    </Button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {params.map((p) => (
                    <span key={p.kode} className="rounded-full border px-2.5 py-1">
                        {p.nama} · bobot {p.bobot}
                    </span>
                ))}
            </div>
            {isError ? (
                <p className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-4 text-sm text-red-600">
                    Penilaian belum bisa dimuat.
                </p>
            ) : null}
            <div className="overflow-x-auto rounded-xl border bg-card">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                        <tr>
                            <th scope="col" className="px-3 py-2 font-medium">#</th>
                            <th scope="col" className="px-3 py-2 font-medium">Nama</th>
                            <th scope="col" className="px-3 py-2 text-right font-medium">Paket</th>
                            <th scope="col" className="px-3 py-2 text-right font-medium">Skor</th>
                            <th scope="col" className="px-3 py-2 font-medium">Kategori</th>
                            {params.map((p) => (
                                <th key={p.kode} scope="col" className="px-3 py-2 text-right font-medium">{p.nama}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5 + params.length} className="p-3">
                                    <Skeleton className="h-6 w-full" />
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={5 + params.length} className="p-6 text-center text-muted-foreground">
                                    Belum ada {role === 'pengawas' ? 'pengawas' : 'konsultan pengawas'} yang ditugaskan.
                                </td>
                            </tr>
                        ) : (
                            rows.map((o, i) => (
                                <tr key={o.user_id} className="border-t">
                                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{i + 1}</td>
                                    <td className="px-3 py-2">{o.nama || '—'}</td>
                                    <td className="px-3 py-2 text-right tabular-nums">{formatNumber(o.jumlah_paket)}</td>
                                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{pct(o.total)}</td>
                                    <td className="px-3 py-2">{o.kategori}</td>
                                    {params.map((p) => (
                                        <td key={p.kode} className="px-3 py-2 text-right tabular-nums">{pct(o.breakdown[p.kode])}</td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}
