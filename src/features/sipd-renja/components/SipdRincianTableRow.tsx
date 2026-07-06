import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import {
    buildPekerjaanMatchIndex,
    lookupPekerjaanByKet,
} from '@/features/sipd-renja/lib/pekerjaan-match'
import { getArumanisStatus } from '@/features/sipd-renja/lib/pekerjaan-status'
import {
    formatSipdKoefisien,
    sipdRincianCellClass,
} from '@/features/sipd-renja/lib/values-changed'
import type { SipdRincianRow } from '@/features/sipd-renja/types'

const BEFORE_CELL = 'bg-slate-50/80 text-foreground dark:bg-slate-900/40'
const AFTER_CELL = 'bg-sky-50/50 text-foreground dark:bg-sky-950/30'

function arumanisBadgeVariant(tone: ReturnType<typeof getArumanisStatus>['tone']) {
    switch (tone) {
        case 'kontrak':
            return 'default' as const
        case 'progress':
            return 'secondary' as const
        case 'registered':
            return 'outline' as const
        default:
            return 'outline' as const
    }
}

export function SipdRincianTableRow({
    row,
    pekerjaanIndex,
}: {
    row: SipdRincianRow
    pekerjaanIndex: ReturnType<typeof buildPekerjaanMatchIndex>
}) {
    const koefClass = sipdRincianCellClass(row.koefisien_murni, row.koefisien)
    const hargaClass = sipdRincianCellClass(row.harga_satuan_murni, row.harga_satuan)
    const totalClass = sipdRincianCellClass(row.total_harga_murni, row.total_harga)
    const matchedPekerjaan = lookupPekerjaanByKet(row.ket_bl_teks, pekerjaanIndex)
    const arumanisStatus = matchedPekerjaan ? getArumanisStatus(matchedPekerjaan) : null

    return (
        <TableRow>
            <TableCell className="max-w-[220px] whitespace-normal align-top">
                {row.subs_bl_teks || '-'}
            </TableCell>
            <TableCell className="max-w-[180px] whitespace-normal align-top text-muted-foreground">
                {row.ket_bl_teks || '-'}
            </TableCell>
            <TableCell className="max-w-[150px] whitespace-normal align-top">
                {matchedPekerjaan && arumanisStatus ? (
                    <div className="space-y-1">
                        <Link
                            to="/pekerjaan/$id"
                            params={{ id: matchedPekerjaan.id.toString() }}
                            className="text-xs font-medium text-primary hover:underline"
                            title={matchedPekerjaan.nama_paket}
                        >
                            {matchedPekerjaan.nama_paket}
                        </Link>
                        <Badge variant={arumanisBadgeVariant(arumanisStatus.tone)} className="text-[10px]">
                            {arumanisStatus.label}
                        </Badge>
                        {arumanisStatus.detail ? (
                            <p className="text-[10px] text-muted-foreground">{arumanisStatus.detail}</p>
                        ) : null}
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
            </TableCell>
            <TableCell className="align-top text-xs">
                <div>{row.kode_akun || '-'}</div>
                <div className="text-muted-foreground">{row.nama_akun || ''}</div>
            </TableCell>
            <TableCell className="max-w-[180px] whitespace-normal align-top text-xs">
                <div>{row.nama_standar_harga || '-'}</div>
                {row.spek ? <div className="text-muted-foreground">{row.spek}</div> : null}
            </TableCell>
            <TableCell className={cn(BEFORE_CELL, 'align-top', koefClass || undefined)}>
                {formatSipdKoefisien(row.koefisien_murni)}
            </TableCell>
            <TableCell className={cn(BEFORE_CELL, 'text-right align-top tabular-nums', hargaClass || undefined)}>
                {formatCurrency(row.harga_satuan_murni)}
            </TableCell>
            <TableCell className={cn(BEFORE_CELL, 'text-right align-top font-medium tabular-nums', totalClass || undefined)}>
                {formatCurrency(row.total_harga_murni)}
            </TableCell>
            <TableCell className={cn(AFTER_CELL, 'align-top', koefClass || undefined)}>
                {formatSipdKoefisien(row.koefisien)}
            </TableCell>
            <TableCell className={cn(AFTER_CELL, 'text-right align-top tabular-nums', hargaClass || undefined)}>
                {formatCurrency(row.harga_satuan)}
            </TableCell>
            <TableCell className={cn(AFTER_CELL, 'text-right align-top font-medium tabular-nums', totalClass || undefined)}>
                {formatCurrency(row.total_harga)}
            </TableCell>
        </TableRow>
    )
}