import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { getUnitTenderReferensi } from '../api/tender-referensi'

const rupiah = (v: number | null) =>
    v == null ? '–' : `Rp ${v.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`

/** Referensi tender SPSE yang cocok ke unit ini. Hanya dibaca; tidak mengubah paket atau unit. */
export function SpamTenderReferensiSection({ unitId }: { unitId: number }) {
    const { data, isLoading } = useQuery({
        queryKey: ['spam-unit-tender-referensi', unitId],
        queryFn: () => getUnitTenderReferensi(unitId),
    })
    const rows = data?.data ?? []

    return (
        <section aria-label="Referensi tender SPSE" className="space-y-2">
            <h3 className="text-sm font-semibold">Referensi tender SPSE</h3>
            {isLoading ? (
                <p className="text-sm text-muted-foreground">Memuat…</p>
            ) : rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada referensi tender yang cocok ke unit ini.</p>
            ) : (
                <ul className="divide-y rounded-lg border">
                    {rows.map((r) => (
                        <li key={r.kode_paket} className="space-y-1 p-3 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">{r.sumber === 'tender' ? 'Tender' : 'Non tender'}</Badge>
                                {r.tahun_anggaran && <span className="text-xs text-muted-foreground">{r.tahun_anggaran}</span>}
                                <span className="text-xs text-muted-foreground">kode {r.kode_paket}</span>
                            </div>
                            <p className="font-medium">{r.nama_paket}</p>
                            <p className="text-xs text-muted-foreground">
                                Pagu {rupiah(r.nilai_pagu)} · Nilai kontrak {rupiah(r.nilai_kontrak)}
                            </p>
                            {r.nama_pemenang && <p className="text-xs text-muted-foreground">Pemenang: {r.nama_pemenang}</p>}
                            {r.url_detail && (
                                <a href={r.url_detail} target="_blank" rel="noopener noreferrer" className="text-xs underline">
                                    Buka di SPSE
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
