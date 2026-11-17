import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getSpamUnits } from '../api'
import { SpamTenderImportCard } from './SpamTenderImportCard'
import {
    applyTerbangunStaging,
    getTerbangunStaging,
    mapTerbangunStaging,
    type TerbangunMatchStatus,
    type TerbangunStagingRow,
} from '../api/terbangun-staging'

const LABEL: Record<TerbangunMatchStatus, string> = {
    matched: 'Cocok',
    unmatched: 'Belum cocok',
    invalid: 'Invalid (#REF!)',
}

const KEY = ['spam-terbangun-staging'] as const

/** Staging SPAM terbangun: baris dari sumber terpisah, perbaiki baris belum cocok atau invalid, lalu terapkan ke unit SPAM. */
export function SpamTerbangunStagingPage() {
    const qc = useQueryClient()
    const [status, setStatus] = useState<TerbangunMatchStatus | ''>('')
    const [pilihId, setPilihId] = useState<number | null>(null)

    const daftar = useQuery({
        queryKey: [...KEY, status],
        queryFn: () => getTerbangunStaging(status ? { status } : undefined),
    })

    const segarkan = () => qc.invalidateQueries({ queryKey: KEY })

    const terapkan = useMutation({
        mutationFn: (batch: string) => applyTerbangunStaging(batch),
        onSuccess: (r) => {
            toast.success(`${r.unit_diubah} unit diperbarui, ${r.baris_diterapkan} baris diterapkan`)
            segarkan()
        },
        onError: (e: Error) => toast.error(e.message),
    })

    const ringkasan = daftar.data?.ringkasan
    const batch = daftar.data?.batch_id ?? null

    return (
        <div className="flex flex-col gap-4">
            <SpamTenderImportCard />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">Staging SPAM terbangun</h2>
                    <p className="text-sm text-muted-foreground">
                        Perbaiki baris belum cocok atau invalid, lalu terapkan ke unit SPAM.
                        Capaian diisi manual.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => {
                            if (!batch) return
                            if (window.confirm('Terapkan batch ini ke unit SPAM? Hanya field yang masih kosong yang diisi.')) {
                                terapkan.mutate(batch)
                            }
                        }}
                        disabled={!batch || terapkan.isPending}
                    >
                        Terapkan batch
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(['matched', 'unmatched', 'invalid'] as const).map((s) => (
                    <Card key={s}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{LABEL[s]}</p>
                            <p className="text-xl font-semibold tabular-nums">{ringkasan?.[s] ?? 0}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-base">
                            Baris {batch ? <span className="text-xs font-normal text-muted-foreground">batch {batch.slice(0, 8)}</span> : null}
                        </CardTitle>
                        <select
                            aria-label="Filter status"
                            className="h-9 rounded-md border bg-background px-2 text-sm"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as TerbangunMatchStatus | '')}
                        >
                            <option value="">Semua status</option>
                            {(Object.keys(LABEL) as TerbangunMatchStatus[]).map((s) => (
                                <option key={s} value={s}>
                                    {LABEL[s]}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {daftar.isPending && <p className="py-6 text-center text-sm text-muted-foreground">Memuat…</p>}
                    {daftar.data && daftar.data.data.length === 0 && (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Belum ada batch staging.
                        </p>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="py-2 pr-3">Kecamatan</th>
                                    <th className="py-2 pr-3">Desa</th>
                                    <th className="py-2 pr-3">Sistem</th>
                                    <th className="py-2 pr-3">Tahun</th>
                                    <th className="py-2 pr-3">Status</th>
                                    <th className="py-2 pr-3">Unit</th>
                                    <th className="py-2" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {daftar.data?.data.map((r) => (
                                    <BarisRow
                                        key={r.id}
                                        row={r}
                                        terbuka={pilihId === r.id}
                                        onBuka={() => setPilihId(pilihId === r.id ? null : r.id)}
                                        onPilih={async (unitId) => {
                                            try {
                                                await mapTerbangunStaging(r.id, unitId)
                                                setPilihId(null)
                                                toast.success('Baris dipetakan')
                                                segarkan()
                                            } catch (e) {
                                                toast.error((e as Error).message)
                                            }
                                        }}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {daftar.data && daftar.data.data.length >= 500 && (
                        <p className="mt-2 text-xs text-muted-foreground">Menampilkan 500 baris pertama. Filter status untuk mempersempit.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function BarisRow({
    row,
    terbuka,
    onBuka,
    onPilih,
}: {
    row: TerbangunStagingRow
    terbuka: boolean
    onBuka: () => void
    onPilih: (unitId: number) => void
}) {
    const bisaUbah = !row.sudah_diterapkan
    return (
        <>
            <tr className="align-top">
                <td className="py-2 pr-3">{row.kecamatan ?? '-'}</td>
                <td className="py-2 pr-3">{row.desa_kelurahan ?? '-'}</td>
                <td className="py-2 pr-3">{row.sistem_aliran ?? '-'}</td>
                <td className="py-2 pr-3 tabular-nums">{row.tahun_pembangunan_awal ?? '-'}</td>
                <td className="py-2 pr-3">
                    <span className={row.match_status === 'matched' ? 'text-emerald-700' : row.match_status === 'invalid' ? 'text-red-700' : 'text-amber-700'}>
                        {LABEL[row.match_status]}
                    </span>
                    {row.sudah_diterapkan && <span className="ml-2 text-xs text-muted-foreground">· diterapkan</span>}
                </td>
                <td className="py-2 pr-3 tabular-nums">{row.unit_spam_id ?? '-'}</td>
                <td className="py-2 text-right">
                    {bisaUbah && (
                        <Button variant="ghost" size="sm" onClick={onBuka}>
                            {terbuka ? 'Tutup' : 'Pilih unit'}
                        </Button>
                    )}
                </td>
            </tr>
            {terbuka && (
                <tr>
                    <td colSpan={7} className="pb-3">
                        <PilihUnit onPilih={onPilih} />
                    </td>
                </tr>
            )}
        </>
    )
}

function PilihUnit({ onPilih }: { onPilih: (unitId: number) => void }) {
    const [cari, setCari] = useState('')
    const [kata, setKata] = useState('')
    const hasil = useQuery({
        queryKey: ['spam-terbangun-unit-search', kata],
        queryFn: () => getSpamUnits({ search: kata, per_page: 20 }),
        enabled: kata.length >= 3,
    })

    return (
        <div className="rounded-md border p-3">
            <div className="flex gap-2">
                <Input placeholder="Cari nama desa atau unit (min. 3 huruf)" value={cari} onChange={(e) => setCari(e.target.value)} />
                <Button variant="outline" onClick={() => setKata(cari.trim())}>
                    Cari
                </Button>
            </div>
            <ul className="mt-2 max-h-60 divide-y overflow-y-auto">
                {hasil.data?.data.map((u) => (
                    <li key={u.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                        <span className="min-w-0 truncate">
                            {u.name ?? `Unit #${u.id}`}
                            {u.desa?.n_desa ? <span className="text-muted-foreground"> · {u.desa.n_desa}</span> : null}
                        </span>
                        <Button size="sm" onClick={() => onPilih(u.id)}>
                            Pilih
                        </Button>
                    </li>
                ))}
                {kata.length >= 3 && hasil.data && hasil.data.data.length === 0 && (
                    <li className="py-2 text-sm text-muted-foreground">Tidak ada unit yang cocok.</li>
                )}
            </ul>
        </div>
    )
}
