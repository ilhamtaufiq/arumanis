import React from 'react'
import { Link } from '@tanstack/react-router'
import { Eye, Link2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/format'
import {
    isCanceledRekapItem,
    summarizeGroupMoney,
    summarizeGroupProgress,
    type RekapPekerjaanItem,
} from '../lib/rekap-progress'

type ProgressRekapRowProps = {
    items: RekapPekerjaanItem[]
    index: number
    onPickKonsolidasi: (items: RekapPekerjaanItem[]) => void
}

function progressTone(value: number): string {
    if (value >= 100) return 'text-green-600'
    if (value >= 75) return 'text-emerald-500'
    if (value >= 50) return 'text-amber-500'
    if (value >= 25) return 'text-orange-500'
    return 'text-rose-500'
}

export const ProgressRekapRow = React.memo(({ items, index, onPickKonsolidasi }: ProgressRekapRowProps) => {
    const primaryItem = items[0]
    const { isKonsolidasi, fisik, keuangan, fisikMin, fisikMax } = summarizeGroupProgress(items)
    const { totalPagu, totalKontrak, kontrakCount } = summarizeGroupMoney(items)

    return (
        <TableRow>
            <TableCell className="text-center font-bold text-muted-foreground">{index}</TableCell>
            <TableCell>
                <div className="space-y-1">
                    {isKonsolidasi && (
                        <Badge variant="secondary" className="gap-1 mb-1">
                            <Link2 className="h-3 w-3" />
                            Konsolidasi ({items.length} paket)
                        </Badge>
                    )}
                    {isKonsolidasi ? (
                        items.map((item, i) => (
                            <PackageLink key={item.id} item={item} prefix={`${i + 1}. `} />
                        ))
                    ) : (
                        <PackageLink item={primaryItem} />
                    )}
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                        {primaryItem.kecamatan?.nama_kecamatan || '-'} • {primaryItem.desa?.nama_desa || '-'}
                    </div>
                    {primaryItem.kegiatan?.nama_sub_kegiatan ? (
                        <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1" title={primaryItem.kegiatan.nama_sub_kegiatan}>
                            {primaryItem.kegiatan.nama_sub_kegiatan}
                        </div>
                    ) : null}
                    {primaryItem.tags && primaryItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {primaryItem.tags.map((tag) => (
                                <Badge key={tag.id} variant="outline" className="text-[10px] h-5 px-1.5" style={{ borderColor: tag.color ?? undefined, color: tag.color ?? undefined }}>
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
                {formatCurrency(totalPagu)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
                {kontrakCount > 0 ? formatCurrency(totalKontrak) : '-'}
            </TableCell>
            <TableCell className="text-center">
                {isKonsolidasi ? (
                    <Badge variant="secondary" className="gap-1">
                        <Link2 className="h-3 w-3" />
                        {items.length} paket
                    </Badge>
                ) : '-'}
            </TableCell>
            <TableCell className="text-center">
                <span
                    className={`font-bold tabular-nums ${progressTone(fisik)}`}
                    title={isKonsolidasi ? `Rata-rata ${items.length} paket (rentang ${fisikMin.toFixed(0)}–${fisikMax.toFixed(0)}%)` : undefined}
                >
                    {isKonsolidasi ? '~' : ''}{fisik.toFixed(2)}%
                </span>
            </TableCell>
            <TableCell className="text-center">
                <span className={`font-bold tabular-nums ${progressTone(keuangan)}`}>
                    {isKonsolidasi ? '~' : ''}{keuangan.toFixed(2)}%
                </span>
            </TableCell>
            <TableCell className="text-right">
                {isKonsolidasi ? (
                    <Button variant="outline" size="sm" className="h-8 rounded-full font-bold" onClick={() => onPickKonsolidasi(items)}>
                        <Eye className="mr-2 h-3.5 w-3.5" /> Pilih Paket
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" asChild className="h-8 rounded-full font-bold">
                        <Link to="/pekerjaan/$id" params={{ id: primaryItem.id.toString() }} search={{ tab: 'progress', from: 'rekap' }}>
                            <Eye className="mr-2 h-3.5 w-3.5" /> Detail
                        </Link>
                    </Button>
                )}
            </TableCell>
        </TableRow>
    )
})

ProgressRekapRow.displayName = 'ProgressRekapRow'

function PackageLink({ item, prefix = '' }: { item: RekapPekerjaanItem; prefix?: string }) {
    return (
        <Link
            to="/pekerjaan/$id"
            params={{ id: item.id.toString() }}
            search={{ tab: 'progress', from: 'rekap' }}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-bold text-sm leading-tight hover:text-primary cursor-pointer transition-colors"
        >
            {prefix}{item.nama_paket}
            {isCanceledRekapItem(item) && (
                <Badge variant="destructive" className="ml-1 text-[10px] h-5 px-1.5 align-middle">Dibatalkan</Badge>
            )}
            {(item.sipd_links_count ?? 0) > 0 && (
                <Badge variant="outline" className="ml-1 border-sky-500/40 bg-sky-500/10 text-[10px] h-5 px-1.5 align-middle text-sky-700 dark:text-sky-300" title={`Ditautkan ke ${item.sipd_links_count} baris rincian SIPD`}>Arumanis</Badge>
            )}
        </Link>
    )
}
