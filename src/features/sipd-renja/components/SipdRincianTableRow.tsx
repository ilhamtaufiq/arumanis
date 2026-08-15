import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { getArumanisStatus, type SipdPekerjaanLookup } from '@/features/sipd-renja/lib/pekerjaan-status'
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
    pekerjaanList,
    linkedPekerjaan,
    occupiedPekerjaanIds,
    onSetLink,
}: {
    row: SipdRincianRow
    pekerjaanList: SipdPekerjaanLookup[]
    linkedPekerjaan: SipdPekerjaanLookup | null
    /** Id pekerjaan yang sudah ditautkan ke baris lain — tidak bisa dipilih lagi (cegah double). */
    occupiedPekerjaanIds: Set<number>
    onSetLink: (idRinciSubBl: number, pekerjaanId: number | null) => void
}) {
    const koefClass = sipdRincianCellClass(row.koefisien_murni, row.koefisien)
    const hargaClass = sipdRincianCellClass(row.harga_satuan_murni, row.harga_satuan)
    const totalClass = sipdRincianCellClass(row.total_harga_murni, row.total_harga)
    const arumanisStatus = linkedPekerjaan ? getArumanisStatus(linkedPekerjaan) : null
    const idRinci = Number(row.id_rinci_sub_bl)

    const pickerOptions = pekerjaanList.map((p) => {
        // Tautan baris ini sendiri boleh tetap dipilih; yang ditautkan baris lain di-disable.
        const occupiedElsewhere = linkedPekerjaan
            ? p.id !== linkedPekerjaan.id && occupiedPekerjaanIds.has(p.id)
            : occupiedPekerjaanIds.has(p.id)
        return {
            value: String(p.id),
            label: p.nama_paket,
            sub: p.kegiatan?.nama_sub_kegiatan || p.kode_rekening || undefined,
            disabled: occupiedElsewhere,
            keywords: [p.kode_rekening, p.desa?.nama_desa, p.kecamatan?.nama_kecamatan]
                .filter(Boolean)
                .join(' '),
        }
    })

    return (
        <TableRow>
            <TableCell className="max-w-[220px] whitespace-normal align-top">
                {row.subs_bl_teks || '-'}
            </TableCell>
            <TableCell className="max-w-[180px] whitespace-normal align-top text-muted-foreground">
                {row.ket_bl_teks || '-'}
            </TableCell>
            <TableCell className="max-w-[200px] whitespace-normal align-top">
                {linkedPekerjaan && arumanisStatus ? (
                    <div className="space-y-1">
                        <Link
                            to="/pekerjaan/$id"
                            params={{ id: linkedPekerjaan.id.toString() }}
                            className="text-xs font-medium text-primary hover:underline"
                            title={linkedPekerjaan.nama_paket}
                        >
                            {linkedPekerjaan.nama_paket}
                        </Link>
                        <Badge variant={arumanisBadgeVariant(arumanisStatus.tone)} className="text-[10px]">
                            {arumanisStatus.label}
                        </Badge>
                        {arumanisStatus.detail ? (
                            <p className="text-[10px] text-muted-foreground">{arumanisStatus.detail}</p>
                        ) : null}
                        <div className="flex items-center gap-1 pt-1">
                            <SearchableSelect
                                options={pickerOptions}
                                value={String(linkedPekerjaan.id)}
                                onValueChange={(value) => onSetLink(idRinci, Number(value))}
                                placeholder="Ganti pekerjaan"
                                searchPlaceholder="Cari pekerjaan..."
                                defaultVisibleCount={10}
                                className="h-7 text-xs"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-1 text-xs text-destructive hover:text-destructive"
                                title="Lepas tautan"
                                onClick={() => onSetLink(idRinci, null)}
                            >
                                Lepas
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <SearchableSelect
                            options={pickerOptions}
                            value={undefined}
                            onValueChange={(value) => onSetLink(idRinci, Number(value))}
                            placeholder="Pilih pekerjaan"
                            searchPlaceholder="Cari pekerjaan..."
                            emptyMessage="Tidak ada pekerjaan untuk sub kegiatan ini"
                            defaultVisibleCount={10}
                            className="h-7 text-xs"
                        />
                    </div>
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