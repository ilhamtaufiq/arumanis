import { useQuery } from '@tanstack/react-query'
import { RefreshCw, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { getPuspenPengawasKpiDetail, type PengawasKpiItem } from '../../api/pengawas-kpi'
import { formatPengawasKpiRoles } from '../../lib/pengawas-kpi-peran'
import { puspenBorder, puspenLabel, puspenShadowSm } from '../../lib/tokens'

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n)
}

type PengawasKpiDetailDialogProps = {
    item: PengawasKpiItem | null
    tahun: number
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PengawasKpiDetailDialog({
    item,
    tahun,
    open,
    onOpenChange,
}: PengawasKpiDetailDialogProps) {
    const detailQuery = useQuery({
        queryKey: ['puspen-pengawas-kpi-detail', item?.id, tahun],
        queryFn: () => getPuspenPengawasKpiDetail(item!.id, { tahun }),
        enabled: open && item != null,
    })

    const pekerjaan = detailQuery.data?.pekerjaan ?? []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`max-h-[85vh] overflow-y-auto border-[3px] border-[#111111] bg-[#FFF7E8] p-0 shadow-[6px_6px_0_0_#111111] sm:max-w-3xl`}>
                <DialogHeader className="border-b-[3px] border-[#111111] bg-[#1A1A2E] px-5 py-4 text-[#FFB703]">
                    <DialogTitle className="text-lg font-black uppercase tracking-[0.12em] text-[#FFB703]">
                        Detail Input Data — {item?.nama}
                    </DialogTitle>
                    <DialogDescription className="text-sm font-bold text-[#FFB703]/75">
                        Tahun anggaran {tahun}
                        {item?.nip ? ` · NIP ${item.nip}` : ''}
                        {item?.roles?.length ? ` · ${formatPengawasKpiRoles(item.roles)}` : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 p-5">
                    {detailQuery.isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-[#111111]/40" />
                        </div>
                    ) : detailQuery.isError ? (
                        <div className="py-8 text-center text-sm font-black uppercase tracking-widest text-[#EF233C]">
                            Gagal memuat detail pekerjaan.
                        </div>
                    ) : pekerjaan.length === 0 ? (
                        <div className="py-8 text-center text-sm font-black uppercase tracking-widest text-[#111111]/60">
                            Tidak ada pekerjaan terdaftar.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-sm">
                                <thead>
                                    <tr className="bg-[#FFFFFF] text-left uppercase tracking-[0.14em] text-[#111111]/70">
                                        <th className="border-b-[3px] border-r-[3px] border-[#111111] p-3 font-black">Pekerjaan</th>
                                        <th className="w-16 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col" aria-label="Dokumentasi foto">Foto</th>
                                        <th className="w-20 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col" aria-label="Penerima manfaat">Penerima</th>
                                        <th className="w-16 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col" aria-label="Output">Output</th>
                                        <th className="w-24 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col" aria-label="Progress fisik">Fisik</th>
                                        <th className="w-24 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-right font-black" scope="col" title="Kelengkapan 0–100">
                                            Skor %
                                        </th>
                                        <th className="min-w-[180px] border-b-[3px] border-[#111111] p-3 text-left font-black" scope="col">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pekerjaan.map((row) => {
                                        // Tanpa output: baris merah (foto/penerima tidak bisa dinilai)
                                        const noOutput = row.output_count === 0
                                        const progressFull =
                                            row.progress_realisasi != null &&
                                            row.progress_realisasi >= 100
                                        const critical =
                                            noOutput &&
                                            (progressFull || row.pho_completed === true)
                                        const rowBg = critical
                                            ? 'bg-[#FEE2E2]'
                                            : noOutput
                                              ? 'bg-[#FEF2F2]'
                                              : 'bg-[#FFFFFF]'
                                        const textMuted = noOutput
                                            ? 'text-[#991B1B]'
                                            : 'text-[#111111]'
                                        const textCatatan = noOutput
                                            ? 'text-[#7F1D1D]'
                                            : 'text-[#111111]/80'

                                        return (
                                        <tr
                                            key={row.id}
                                            className={`border-b border-[#111111]/30 ${rowBg}`}
                                        >
                                            <td className={`border-r-[3px] border-[#111111] p-3 font-black ${textMuted}`}>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span>{row.nama_paket}</span>
                                                    {noOutput ? (
                                                        <span className="rounded border border-[#DC2626] bg-[#DC2626] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                                                            Tanpa output
                                                        </span>
                                                    ) : null}
                                                </div>
                                                {row.kode_rekening ? (
                                                    <div className={`text-[10px] font-bold tracking-[0.1em] ${noOutput ? 'text-[#B91C1C]/80' : 'text-[#111111]/50'}`}>
                                                        {row.kode_rekening}
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td className={`border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums ${textMuted}`}>
                                                {formatNumber(row.foto_count)}
                                            </td>
                                            <td className={`border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums ${textMuted}`}>
                                                {formatNumber(row.penerima_count)}
                                            </td>
                                            <td
                                                className={`border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums ${
                                                    noOutput ? 'bg-[#DC2626] text-white' : 'text-[#111111]'
                                                }`}
                                            >
                                                {formatNumber(row.output_count)}
                                            </td>
                                            <td className={`border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums ${
                                                noOutput ? 'text-[#B91C1C]' : 'text-[#2ECC71]'
                                            }`}>
                                                {formatNumber(row.fisik_count)}
                                            </td>
                                            <td className={`border-r-[3px] border-[#111111] p-3 text-right font-black tabular-nums ${textMuted}`}>
                                                <div>{row.score.toFixed(1)}</div>
                                                {row.score_breakdown ? (
                                                    <div className="mt-0.5 text-[9px] font-bold leading-tight text-[#111111]/45 normal-case tracking-normal">
                                                        {[
                                                            row.score_breakdown.foto != null
                                                                ? `F${row.score_breakdown.foto}`
                                                                : null,
                                                            row.score_breakdown.penerima != null
                                                                ? `P${row.score_breakdown.penerima}`
                                                                : null,
                                                            row.score_breakdown.progress != null
                                                                ? `R${row.score_breakdown.progress}`
                                                                : null,
                                                            row.score_breakdown.koordinat != null
                                                                ? `G${row.score_breakdown.koordinat}`
                                                                : null,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' · ')}
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td className={`p-3 text-xs font-bold leading-snug ${textCatatan}`}>
                                                {row.catatan || '—'}
                                            </td>
                                        </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className={`inline-flex items-center gap-2 bg-[#FFB703] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-[#111111] ${puspenBorder} ${puspenShadowSm}`}
                    >
                        <X className="h-4 w-4" />
                        Tutup
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}