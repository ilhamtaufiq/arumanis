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

type RabAnalysisTableProps = {
    result: RabAnalysisResult
    maxHeightClassName?: string
}

/** Persentase pajak default yang ditampilkan di setiap baris. */
const PAJAK_PERSEN = 11

const PECAHAN: Record<string, string> = {
    '¼': '1/4',
    '½': '1/2',
    '¾': '3/4',
    '⅐': '1/7',
    '⅑': '1/9',
    '⅒': '1/10',
    '⅓': '1/3',
    '⅔': '2/3',
    '⅕': '1/5',
    '⅖': '2/5',
    '⅗': '3/5',
    '⅘': '4/5',
    '⅙': '1/6',
    '⅚': '5/6',
    '⅛': '1/8',
    '⅜': '3/8',
    '⅝': '5/8',
    '⅞': '7/8',
}

const SUPERSCRIPT: Record<string, string> = {
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
}

/**
 * Ganti tanda `"` menjadi `inch`, pecahan unicode menjadi `1/2` dan sejenisnya,
 * serta angka pangkat (m³) menjadi angka biasa (m3).
 */
function rapikanTeks(teks: string): string {
    let hasil = teks.replace(/"/g, ' inch')
    for (const [pecahan, tulisan] of Object.entries(PECAHAN)) {
        hasil = hasil.split(pecahan).join(tulisan)
    }
    for (const [pangkat, angka] of Object.entries(SUPERSCRIPT)) {
        hasil = hasil.split(pangkat).join(angka)
    }
    return hasil.replace(/\s+/g, ' ').trim()
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
