import React from 'react'
import { Link } from '@tanstack/react-router'
import {
    ClipboardCheck,
    ClipboardList,
    Eye,
    FileText,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import type { Kontrak, KontrakBapExportParams } from '../types'
import { formatKontrakDate, formatKontrakRupiah } from '../lib/kontrak-list-utils'

export type KontrakRowProps = {
    item: Kontrak
    isAdmin: boolean
    onDeleteRequest: (id: number) => void
    handleExportDoc: (kontrak: Kontrak) => void
    handleExportRingkasan: (kontrak: Kontrak) => void
    handleExportCover: (kontrak: Kontrak) => void
    handleExportBAP: (kontrak: Kontrak) => void | Promise<void>
    handlePreview: (
        kontrak: Kontrak,
        type: 'spk' | 'ringkasan' | 'bap',
        bapPayload?: KontrakBapExportParams,
    ) => void
}

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
    return (
        <TableRow key={item.id}>
            <TableCell>
                <div className="min-w-[250px] py-2 font-medium leading-normal">
                    {item.pekerjaans?.length > 1 ? (
                        <div className="space-y-1">
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
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
                </div>
            </TableCell>
            <TableCell className="whitespace-nowrap text-right">
                {formatKontrakRupiah(
                    item.pekerjaans?.reduce(
                        (sum: number, p: Pekerjaan) => sum + (p.pagu || 0),
                        0,
                    ) || 0,
                )}
            </TableCell>
            <TableCell className="whitespace-nowrap">
                <Badge variant="outline">
                    {item.pekerjaans?.[0]?.kegiatan?.sumber_dana || '-'}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="min-w-[150px] leading-normal">
                    {item.penyedia?.nama || '-'}
                </div>
            </TableCell>
            <TableCell className="whitespace-nowrap text-right font-medium">
                {formatKontrakRupiah(item.nilai_kontrak)}
            </TableCell>
            <TableCell className="whitespace-nowrap">
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
            <TableCell className="whitespace-nowrap">
                <div className="text-xs">
                    <div className="font-medium">{item.spmk || '-'}</div>
                    <div className="text-muted-foreground">{formatKontrakDate(item.tgl_spmk)}</div>
                </div>
            </TableCell>
            <TableCell className="whitespace-nowrap text-center">
                {(() => {
                    if (!item.tgl_spmk || !item.tgl_selesai) return '-'
                    const start = new Date(item.tgl_spmk)
                    const end = new Date(item.tgl_selesai)
                    const diff = Math.ceil(
                        Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                    )
                    return <Badge variant="secondary">{diff} Hari</Badge>
                })()}
            </TableCell>
            <TableCell className="whitespace-nowrap">
                {formatKontrakDate(item.tgl_selesai)}
            </TableCell>
            <TableCell className="sticky right-0 bg-background text-right shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.1)]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel className="py-1 text-[10px] font-bold uppercase text-muted-foreground">
                            Umum
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link to="/kontrak/$id" params={{ id: item.id.toString() }}>
                                <Eye className="mr-2 h-4 w-4 text-primary" />
                                <span>Detail Kontrak</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        <DropdownMenuLabel className="py-1 text-[10px] font-bold uppercase text-muted-foreground">
                            SPK
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handlePreview(item, 'spk')}>
                            <Eye className="mr-2 h-4 w-4 text-blue-600" />
                            <span>Pratinjau SPK</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportDoc(item)}>
                            <FileText className="mr-2 h-4 w-4 text-blue-600" />
                            <span>Ekspor SPK (Word)</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="py-1 text-[10px] font-bold uppercase text-muted-foreground">
                            Ringkasan
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handlePreview(item, 'ringkasan')}>
                            <Eye className="mr-2 h-4 w-4 text-green-600" />
                            <span>Pratinjau Ringkasan</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportRingkasan(item)}>
                            <ClipboardList className="mr-2 h-4 w-4 text-green-600" />
                            <span>Ekspor Ringkasan</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportCover(item)}>
                            <FileText className="mr-2 h-4 w-4 text-purple-600" />
                            <span>Download Cover Kontrak</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="py-1 text-[10px] font-bold uppercase text-muted-foreground">
                            BAP & Lainnya
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleExportBAP(item)}>
                            <ClipboardCheck className="mr-2 h-4 w-4 text-orange-600" />
                            <span>Buat BAP</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/kontrak/$id/edit" params={{ id: item.id.toString() }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Ubah Data</span>
                            </Link>
                        </DropdownMenuItem>

                        {isAdmin && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={() => onDeleteRequest(item.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Hapus Kontrak</span>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
})
