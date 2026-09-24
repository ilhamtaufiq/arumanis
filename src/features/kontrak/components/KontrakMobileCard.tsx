import { Link } from '@tanstack/react-router'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { Badge } from '@/components/ui/badge'
import { KontrakActionsMenu, type KontrakActionsProps } from './KontrakActionsMenu'
import {
    formatKontrakDate,
    formatKontrakRupiah,
    getKontrakMasaHari,
    getKontrakTotalPagu,
} from '../lib/kontrak-list-utils'

/**
 * Tampilan kartu untuk layar kecil (di bawah breakpoint lg),
 * menggantikan tabel 10 kolom yang terlalu lebar untuk mobile.
 */
export function KontrakMobileCard({
    item,
    isAdmin,
    onDeleteRequest,
    handleExportDoc,
    handleExportRingkasan,
    handleExportCover,
    handleExportBAP,
    handlePreview,
}: KontrakActionsProps) {
    const totalPagu = getKontrakTotalPagu(item)
    const masaHari = getKontrakMasaHari(item.tgl_spmk, item.tgl_selesai)
    const sumberDana = item.pekerjaans?.[0]?.kegiatan?.sumber_dana

    return (
        <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                    {item.pekerjaans?.length > 1 ? (
                        <div className="space-y-1">
                            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                Konsolidasi ({item.pekerjaans.length} Paket)
                            </span>
                            {item.pekerjaans.map((p: Pekerjaan) => (
                                <div key={p.id} className="text-sm leading-snug">
                                    • {p.nama_paket}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Link
                            to="/kontrak/$id"
                            params={{ id: item.id.toString() }}
                            className="break-words font-medium leading-snug hover:underline"
                        >
                            {item.pekerjaans?.[0]?.nama_paket || '-'}
                        </Link>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        {sumberDana ? <Badge variant="outline">{sumberDana}</Badge> : null}
                        <span className="min-w-0 break-words">{item.penyedia?.nama || '-'}</span>
                    </div>
                </div>

                <div className="shrink-0">
                    <KontrakActionsMenu
                        item={item}
                        isAdmin={isAdmin}
                        onDeleteRequest={onDeleteRequest}
                        handleExportDoc={handleExportDoc}
                        handleExportRingkasan={handleExportRingkasan}
                        handleExportCover={handleExportCover}
                        handleExportBAP={handleExportBAP}
                        handlePreview={handlePreview}
                    />
                </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border bg-muted/40 p-3 text-xs">
                <div className="col-span-2 min-w-0">
                    <dt className="text-muted-foreground">Nomor SPK</dt>
                    <dd className="break-words font-medium">{item.spk || '-'}</dd>
                    <dd className="text-muted-foreground">{formatKontrakDate(item.tgl_spk)}</dd>
                </div>
                <div className="min-w-0">
                    <dt className="text-muted-foreground">Nomor SPMK</dt>
                    <dd className="break-words font-medium">{item.spmk || '-'}</dd>
                    <dd className="text-muted-foreground">{formatKontrakDate(item.tgl_spmk)}</dd>
                </div>
                <div className="min-w-0">
                    <dt className="text-muted-foreground">Masa Pelaksanaan</dt>
                    <dd className="font-medium">
                        {masaHari !== null ? (
                            <Badge variant="secondary">{masaHari} Hari</Badge>
                        ) : (
                            '-'
                        )}
                    </dd>
                </div>
                <div className="min-w-0">
                    <dt className="text-muted-foreground">Tgl. Selesai</dt>
                    <dd className="font-medium tabular-nums">{formatKontrakDate(item.tgl_selesai)}</dd>
                </div>
                <div className="min-w-0">
                    <dt className="text-muted-foreground">Pagu</dt>
                    <dd className="break-words font-medium tabular-nums">
                        {formatKontrakRupiah(totalPagu)}
                    </dd>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-2 border-t pt-2">
                    <dt className="text-muted-foreground">Nilai Kontrak</dt>
                    <dd className="text-sm font-semibold tabular-nums">
                        {formatKontrakRupiah(item.nilai_kontrak || 0)}
                    </dd>
                </div>
            </dl>
        </div>
    )
}
