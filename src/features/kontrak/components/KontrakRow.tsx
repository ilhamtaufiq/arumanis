import React from 'react'
import { Link } from '@tanstack/react-router'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import type { Kontrak } from '../types'
import {
    formatKontrakDate,
    formatKontrakRupiah,
    getKontrakMasaHari,
    getKontrakTotalPagu,
} from '../lib/kontrak-list-utils'
import {
    KontrakActionsMenu,
    type KontrakActionsProps,
} from './KontrakActionsMenu'

export type KontrakRowProps = KontrakActionsProps

export const KontrakRow = React.memo(function KontrakRow({
    item,
    isAdmin,
    onDeleteRequest,
    handleExportDoc,
    handleExportRingkasan,
    handleExportCover,
    handleExportBAP,
    handlePreview,
}: KontrakRowProps) {
    const totalPagu = getKontrakTotalPagu(item)
    const masaHari = getKontrakMasaHari(item.tgl_spmk, item.tgl_selesai)
    const sumberDana = item.pekerjaans?.[0]?.kegiatan?.sumber_dana

    return (
        <TableRow>
            {/* Pekerjaan — selalu tampil; baris meta berisi info kolom yang sedang tersembunyi */}
            <TableCell className="align-top whitespace-normal break-words">
                <div className="min-w-[200px] py-2 font-medium leading-normal">
                    {item.pekerjaans?.length > 1 ? (
                        <div className="space-y-1">
                            <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                Konsolidasi ({item.pekerjaans.length} Paket)
                            </span>
                            {item.pekerjaans.map((p: Pekerjaan) => (
                                <div key={p.id} className="text-sm">
                                    • {p.nama_paket}
                                </div>
                            ))}
                        </div>
                    ) : (
                        item.pekerjaans?.[0]?.nama_paket || '-'
                    )}
                    {/* Fallback info kolom yang tersembunyi pada breakpoint saat ini */}
                    {(totalPagu > 0 || item.spk || item.spmk || sumberDana || masaHari !== null) && (
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-normal text-muted-foreground">
                            {totalPagu > 0 ? (
                                <span className="xl:hidden">
                                    Pagu {formatKontrakRupiah(totalPagu)}
                                </span>
                            ) : null}
                            {item.spk ? (
                                <span className="2xl:hidden">SPK {item.spk}</span>
                            ) : null}
                            {item.spmk ? (
                                <span className="2xl:hidden">SPMK {item.spmk}</span>
                            ) : null}
                            {sumberDana ? (
                                <span className="min-[1800px]:hidden">{sumberDana}</span>
                            ) : null}
                            {masaHari !== null ? (
                                <span className="min-[1800px]:hidden">{masaHari} Hari</span>
                            ) : null}
                        </div>
                    )}
                </div>
            </TableCell>

            {/* Pagu — mulai tampil di xl (fallback di baris meta) */}
            <TableCell className="hidden whitespace-nowrap text-right align-top tabular-nums xl:table-cell">
                {formatKontrakRupiah(totalPagu)}
            </TableCell>

            {/* Sumber Dana — hanya di layar sangat lebar (fallback di baris meta) */}
            <TableCell className="hidden whitespace-nowrap align-top min-[1800px]:table-cell">
                <Badge variant="outline">{sumberDana || '-'}</Badge>
            </TableCell>

            <TableCell className="align-top whitespace-normal break-words">
                <div className="min-w-[110px] leading-normal">
                    {item.penyedia?.nama || '-'}
                </div>
            </TableCell>

            <TableCell className="whitespace-nowrap text-right align-top font-medium tabular-nums">
                {formatKontrakRupiah(item.nilai_kontrak || 0)}
            </TableCell>

            {/* SPK — mulai tampil di 2xl; kode diizinkan wrap agar tidak memaksa scroll */}
            <TableCell className="hidden whitespace-normal break-all align-top 2xl:table-cell">
                <div className="text-xs">
                    <Link
                        to="/kontrak/$id"
                        params={{ id: item.id.toString() }}
                        className="font-medium text-primary hover:underline"
                    >
                        {item.spk || '-'}
                    </Link>
                    <div className="text-muted-foreground">{formatKontrakDate(item.tgl_spk)}</div>
                </div>
            </TableCell>

            {/* SPMK — mulai tampil di 2xl (fallback di baris meta) */}
            <TableCell className="hidden whitespace-normal break-all align-top 2xl:table-cell">
                <div className="text-xs">
                    <div className="font-medium">{item.spmk || '-'}</div>
                    <div className="text-muted-foreground">{formatKontrakDate(item.tgl_spmk)}</div>
                </div>
            </TableCell>

            {/* Masa — hanya di layar sangat lebar (fallback di baris meta) */}
            <TableCell className="hidden whitespace-nowrap text-center align-top min-[1800px]:table-cell">
                {masaHari !== null ? (
                    <Badge variant="secondary">{masaHari} Hari</Badge>
                ) : (
                    '-'
                )}
            </TableCell>

            <TableCell className="whitespace-nowrap align-top tabular-nums">
                {formatKontrakDate(item.tgl_selesai)}
            </TableCell>

            <TableCell className="sticky right-0 z-10 bg-background text-right align-top shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
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
            </TableCell>
        </TableRow>
    )
})
