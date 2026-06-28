import React from 'react'
import { Link } from '@tanstack/react-router'
import { FileSpreadsheet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { PekerjaanLocationMeta } from '@/components/shared/PekerjaanLocationMeta'
import { PekerjaanProgressCell } from '@/components/shared/PekerjaanProgressCell'
import {
    getLaporanStatus,
    LAPORAN_STATUS_LABELS,
    LAPORAN_STATUS_VARIANTS,
} from '../lib/laporan-status'
import type { BuatLaporanListItem } from '../types'

type BuatLaporanRowProps = {
    item: BuatLaporanListItem
    index: number
}

export const BuatLaporanRow = React.memo(function BuatLaporanRow({
    item,
    index,
}: BuatLaporanRowProps) {
    const progress = item.progress_total ?? 0
    const status = getLaporanStatus(item)
    const deviasi = item.deviasi ?? 0

    return (
        <TableRow>
            <TableCell className="text-center font-bold text-muted-foreground">{index}</TableCell>
            <TableCell>
                <div className="font-semibold text-sm leading-tight">{item.nama_paket}</div>
                {item.kode_rekening ? (
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        {item.kode_rekening}
                    </div>
                ) : null}
                <PekerjaanLocationMeta
                    kecamatan={item.kecamatan?.nama_kecamatan}
                    desa={item.desa?.nama_desa}
                />
            </TableCell>
            <TableCell>
                <div className="text-sm">{item.kegiatan?.nama_sub_kegiatan || '-'}</div>
            </TableCell>
            <TableCell>
                <Badge variant={LAPORAN_STATUS_VARIANTS[status]} className="text-xs">
                    {LAPORAN_STATUS_LABELS[status]}
                </Badge>
            </TableCell>
            <TableCell>
                <PekerjaanProgressCell value={progress} subtitle="Laporan" />
                {deviasi !== 0 ? (
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                        Deviasi {deviasi > 0 ? '+' : ''}
                        {deviasi.toFixed(2)}%
                    </span>
                ) : null}
            </TableCell>
            <TableCell>
                {item.pengawas?.nama ? (
                    <span className="text-sm">{item.pengawas.nama}</span>
                ) : (
                    <Badge variant="outline" className="text-xs">
                        Belum ada
                    </Badge>
                )}
            </TableCell>
            <TableCell className="text-right">
                <Button size="sm" asChild className="rounded-full font-semibold">
                    <Link to="/buat-laporan/$id" params={{ id: item.id.toString() }}>
                        <FileSpreadsheet className="mr-2 h-3.5 w-3.5" />
                        Buat Laporan
                    </Link>
                </Button>
            </TableCell>
        </TableRow>
    )
})