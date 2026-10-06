import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
    buildCsv,
    buildYearMatrix,
    normalizeWilayahName,
    type SpmRekapDesaInput,
} from '@/lib/spm-rekap'
import { downloadCsv, formatNumber } from './format'

const PAGE_SIZE = 25

type SpmRekapMatrixProps = {
    years: readonly string[]
    byYear: readonly (SpmRekapDesaInput[] | undefined)[]
    isLoading?: boolean
    capaianLabel: string
    exportFilename: string
}

/** Intensitas warna sel relatif terhadap nilai maksimum di tabel */
function cellStyle(value: number, max: number) {
    if (value <= 0 || max <= 0) return undefined
    const alpha = 0.12 + 0.68 * Math.sqrt(value / max)
    return { backgroundColor: `rgba(14, 165, 233, ${alpha.toFixed(2)})` }
}

export function SpmRekapMatrix({
    years,
    byYear,
    isLoading,
    capaianLabel,
    exportFilename,
}: SpmRekapMatrixProps) {
    const [mode, setMode] = useState<'kecamatan' | 'desa'>('kecamatan')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const rows = useMemo(() => {
        const q = normalizeWilayahName(search)
        return buildYearMatrix(years, byYear, mode)
            .filter(
                (row) =>
                    !q ||
                    normalizeWilayahName(row.nama).includes(q) ||
                    normalizeWilayahName(row.kecamatan).includes(q),
            )
            .sort((a, b) => b.total - a.total || a.nama.localeCompare(b.nama, 'id'))
    }, [years, byYear, mode, search])

    useEffect(() => {
        setPage(1)
    }, [mode, search])

    const yearTotals = useMemo(
        () => years.map((year) => rows.reduce((sum, row) => sum + (row.values[year] ?? 0), 0)),
        [years, rows],
    )
    const grandTotal = yearTotals.reduce((sum, value) => sum + value, 0)
    const max = useMemo(
        () => rows.reduce((m, row) => Math.max(m, ...years.map((year) => row.values[year] ?? 0)), 0),
        [rows, years],
    )

    const lastPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
    const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const handleExport = () => {
        const headers = [
            ...(mode === 'desa' ? ['Kecamatan', 'Desa'] : ['Kecamatan']),
            ...years.map((year) => `${capaianLabel} ${year}`),
            'Total',
        ]
        const body = rows.map((row) => [
            ...(mode === 'desa' ? [row.kecamatan, row.nama] : [row.nama]),
            ...years.map((year) => row.values[year] ?? 0),
            row.total,
        ])
        downloadCsv(`${exportFilename}-matriks-${mode}.csv`, buildCsv(headers, body))
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <div className="inline-flex rounded-md border p-0.5">
                    {(['kecamatan', 'desa'] as const).map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setMode(value)}
                            className={cn(
                                'rounded px-3 py-1.5 text-xs font-medium transition-colors',
                                mode === value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                            )}
                        >
                            Per {value === 'kecamatan' ? 'Kecamatan' : 'Desa'}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-9 pl-9"
                        placeholder={mode === 'desa' ? 'Cari desa atau kecamatan...' : 'Cari kecamatan...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Cari wilayah pada matriks"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={handleExport}
                    disabled={rows.length === 0}
                >
                    <Download className="mr-1 h-3.5 w-3.5" />
                    CSV
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memuat capaian per tahun tiap wilayah...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="sticky left-0 z-10 min-w-[160px] bg-muted">
                                    {mode === 'desa' ? 'Desa' : 'Kecamatan'}
                                </TableHead>
                                {years.map((year) => (
                                    <TableHead key={year} className="min-w-[72px] text-right">
                                        {year}
                                    </TableHead>
                                ))}
                                <TableHead className="min-w-[88px] text-right">Total</TableHead>
                                <TableHead className="text-center">Tahun aktif</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={years.length + 3} className="py-10 text-center text-muted-foreground">
                                        Belum ada tambahan capaian per tahun untuk filter ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pageRows.map((row) => (
                                    <TableRow key={row.key}>
                                        <TableCell className="sticky left-0 z-10 bg-background">
                                            <div className="font-medium">{row.nama}</div>
                                            {mode === 'desa' ? (
                                                <div className="text-[10px] text-muted-foreground">{row.kecamatan}</div>
                                            ) : null}
                                        </TableCell>
                                        {years.map((year) => {
                                            const value = row.values[year] ?? 0
                                            return (
                                                <TableCell
                                                    key={year}
                                                    className={cn(
                                                        'text-right text-xs tabular-nums',
                                                        value <= 0 && 'text-muted-foreground/50',
                                                    )}
                                                    style={cellStyle(value, max)}
                                                    title={`${row.nama} · ${year}: +${formatNumber(value)} ${capaianLabel}`}
                                                >
                                                    {value > 0 ? `+${formatNumber(value)}` : '·'}
                                                </TableCell>
                                            )
                                        })}
                                        <TableCell className="text-right font-semibold tabular-nums">
                                            {formatNumber(row.total)}
                                        </TableCell>
                                        <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                                            {row.activeYears}/{years.length}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        {rows.length > 0 ? (
                            <TableFooter>
                                <TableRow>
                                    <TableCell className="sticky left-0 z-10 bg-muted font-semibold">
                                        Total ({rows.length})
                                    </TableCell>
                                    {yearTotals.map((value, index) => (
                                        <TableCell key={years[index]} className="text-right text-xs font-semibold tabular-nums">
                                            {formatNumber(value)}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right font-bold tabular-nums">
                                        {formatNumber(grandTotal)}
                                    </TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableFooter>
                        ) : null}
                    </Table>
                </div>
            )}

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                    Angka = tambahan {capaianLabel} pada tahun tersebut; warna makin pekat = tambahan makin besar.
                    Diurutkan dari total tambahan terbesar.
                </span>
                {lastPage > 1 ? (
                    <div className="flex items-center gap-2">
                        <span className="tabular-nums">
                            Halaman {page}/{lastPage}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={page >= lastPage}
                            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                        >
                            Selanjutnya
                        </Button>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
