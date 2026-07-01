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
import { formatCurrency } from '@/lib/format'
import type { RabAnalysisResult } from '../types'

type RabAnalysisTableProps = {
    result: RabAnalysisResult
    maxHeightClassName?: string
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
                            <TableHead className="min-w-[48px]">No</TableHead>
                            <TableHead className="min-w-[140px]">Grup</TableHead>
                            <TableHead className="min-w-[220px]">Uraian</TableHead>
                            <TableHead>Sat</TableHead>
                            <TableHead className="text-right">Vol</TableHead>
                            <TableHead className="text-right">Harga</TableHead>
                            <TableHead className="text-right">DPP</TableHead>
                            <TableHead className="text-right">PPN</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {result.items.map((item, index) => (
                            <TableRow key={`${item.grup}-${item.uraian}-${index}`}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{item.grup}</TableCell>
                                <TableCell className="font-medium">{item.uraian}</TableCell>
                                <TableCell>{item.satuan}</TableCell>
                                <TableCell className="text-right tabular-nums">{item.volume.toLocaleString('id-ID')}</TableCell>
                                <TableCell className="text-right tabular-nums">{formatCurrency(item.hargaSatuan)}</TableCell>
                                <TableCell className="text-right tabular-nums">{formatCurrency(item.jumlah)}</TableCell>
                                <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(item.ppn)}</TableCell>
                                <TableCell className="text-right tabular-nums font-medium">{formatCurrency(item.total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}