import { useQuery } from '@tanstack/react-query'
import { Medal } from 'lucide-react'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Heading } from '@/components/ui/heading'
import { Skeleton } from '@/components/ui/skeleton'
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
    const penilaian = penilaianRes?.data

    return (
        <>
            <BannerNotification />
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <div className="flex w-full min-w-0 flex-col gap-6">
                    <Heading
                        title="Progres Pekerjaan"
                        description={`TA ${tahunAnggaran} · Peringkat pengawasan dan rekap progres estimasi per paket. Gunakan filter Status untuk menyertakan paket dibatalkan.`}
                    />

                    <PenilaianSection
                        data={penilaian}
                        isLoading={penilaianLoading}
                        isError={penilaianError}
                    />

                    <section aria-labelledby="rekap-paket" className="flex flex-col gap-3">
                        <h2 id="rekap-paket" className="text-sm font-semibold text-muted-foreground">
                            Rekap progres per paket
                        </h2>
                        <ProgressRekap />
                    </section>
                </div>
            </Main>
        </>
    )
}

function PenilaianSection({
    data,
    isLoading,
    isError,
}: {
    data: { parameter: PenilaianParameter[]; pengawas: PenilaianOrang[] } | undefined
    isLoading: boolean
    isError: boolean
}) {
    const params = data?.parameter ?? []
    return (
        <section aria-labelledby="penilaian-pengawas" className="flex flex-col gap-3">
            <h2 id="penilaian-pengawas" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Medal className="h-4 w-4" /> Penilaian pengawas
            </h2>
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
                            <th scope="col" className="px-3 py-2 font-medium">Peran</th>
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
                                <td colSpan={7 + params.length} className="p-3">
                                    <Skeleton className="h-6 w-full" />
                                </td>
                            </tr>
                        ) : (data?.pengawas.length ?? 0) === 0 ? (
                            <tr>
                                <td colSpan={7 + params.length} className="p-6 text-center text-muted-foreground">
                                    Belum ada pengawas yang ditugaskan.
                                </td>
                            </tr>
                        ) : (
                            data?.pengawas.map((o, i) => (
                                <tr key={`${o.user_id}-${o.role}`} className="border-t">
                                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{i + 1}</td>
                                    <td className="px-3 py-2">{o.nama || '—'}</td>
                                    <td className="px-3 py-2">{o.role === 'pengawas' ? 'Pengawas' : 'Konsultan pengawas'}</td>
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
