import { TableProperties } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { RabAnalysisResult } from '../types'
import { PAJAK_PERSEN, rapikanTeks } from '../lib/rapikan-teks'

type RabAnalysisTableProps = {
    result: RabAnalysisResult
    maxHeightClassName?: string
}

/** Angka dengan dua digit di belakang koma, tanpa lambang Rp. */
function formatAngka(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '-'
    return value.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export function RabAnalysisTable({
    result,
    maxHeightClassName = 'max-h-[520px]',
}: RabAnalysisTableProps) {
    if (result.items.length === 0) return null

    return (
        <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <div className="flex items-center gap-2 font-semibold">
                    <TableProperties className="h-4 w-4 text-primary" />
                    Hasil Analisa
                </div>
                <Badge variant="secondary">{result.summary.itemCount} item</Badge>
            </div>
            <div className={`overflow-auto ${maxHeightClassName}`}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[48px] select-none">No</TableHead>
                            <TableHead className="min-w-[220px]">Uraian</TableHead>
                            <TableHead>Satuan</TableHead>
                            <TableHead className="text-right">Volume</TableHead>
                            <TableHead className="text-right">Harga</TableHead>
                            <TableHead className="text-right">Pajak (%)</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="min-w-[140px]">Group</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {result.items.map((item, index) => (
                            <TableRow key={`${item.grup}-${item.uraian}-${index}`}>
                                <TableCell className="select-none">{index + 1}</TableCell>
                                <TableCell className="font-medium">{rapikanTeks(item.uraian)}</TableCell>
                                <TableCell>{rapikanTeks(item.satuan)}</TableCell>
                                <TableCell className="text-right tabular-nums">{formatAngka(item.volume)}</TableCell>
                                <TableCell className="text-right tabular-nums">{formatAngka(item.hargaSatuan)}</TableCell>
                                <TableCell className="text-right tabular-nums text-muted-foreground">{PAJAK_PERSEN}</TableCell>
                                <TableCell className="text-right tabular-nums font-medium">{formatAngka(item.total)}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{rapikanTeks(item.grup)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
