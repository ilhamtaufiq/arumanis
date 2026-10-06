import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, ChevronRight, Download, Loader2, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
    SPM_COVERAGE_TIERS,
    buildCsv,
    countTiers,
    getCoverageTier,
    normalizeWilayahName,
    sortWilayahRows,
    summarizeRows,
    type SpmCoverageTier,
    type SpmRekapSortKey,
    type SpmRekapWilayahRow,
} from '@/lib/spm-rekap'
import {
    TIER_BAR,
    TIER_DOT,
    TIER_TEXT,
    downloadCsv,
    formatNumber,
    formatPercent,
} from './format'

const PAGE_SIZE = 20

type SpmRekapWilayahProps = {
    mode: 'kecamatan' | 'desa'
    rows: SpmRekapWilayahRow[]
    isLoading?: boolean
    capaianLabel: string
    showSr?: boolean
    /** Tampilkan kolom porsi BJP dari capaian */
    showBjp?: boolean
    /** Filter lokal kecamatan (mode desa) — hasil drill-down dari tabel kecamatan */
    kecamatanFilter?: string
    onClearKecamatanFilter?: () => void
    onKecamatanSelect?: (kecamatan: string) => void
    onDesaSelect?: (row: SpmRekapWilayahRow) => void
    exportFilename: string
}

function CoverageCell({ coverage }: { coverage: number | null }) {
    const tier = getCoverageTier(coverage)
    return (
        <div className="flex min-w-[120px] items-center justify-end gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                    className={cn('h-full rounded-full', TIER_BAR[tier])}
                    style={{ width: `${Math.min(100, Math.max(0, coverage ?? 0))}%` }}
                />
            </div>
            <span className={cn('w-14 text-right text-sm font-bold tabular-nums', TIER_TEXT[tier])}>
                {formatPercent(coverage)}
            </span>
        </div>
    )
}

export function SpmRekapWilayah({
    mode,
    rows,
    isLoading,
    capaianLabel,
    showSr,
    showBjp,
    kecamatanFilter,
    onClearKecamatanFilter,
    onKecamatanSelect,
    onDesaSelect,
    exportFilename,
}: SpmRekapWilayahProps) {
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<SpmRekapSortKey>('coverage')
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc')
    const [tierFilter, setTierFilter] = useState<SpmCoverageTier | 'all'>('all')
    const [page, setPage] = useState(1)

    const scopedRows = useMemo(() => {
        if (mode !== 'desa' || !kecamatanFilter) return rows
        const target = normalizeWilayahName(kecamatanFilter)
        return rows.filter((row) => normalizeWilayahName(row.kecamatan) === target)
    }, [rows, mode, kecamatanFilter])

    const tierCounts = useMemo(() => countTiers(scopedRows), [scopedRows])

    const filteredRows = useMemo(() => {
        const q = normalizeWilayahName(search)
        const matched = scopedRows.filter((row) => {
            if (tierFilter !== 'all' && getCoverageTier(row.coverage) !== tierFilter) return false
            if (!q) return true
            return (
                normalizeWilayahName(row.nama).includes(q) ||
                normalizeWilayahName(row.kecamatan).includes(q)
            )
        })
        return sortWilayahRows(matched, sortKey, direction)
    }, [scopedRows, search, tierFilter, sortKey, direction])

    useEffect(() => {
        setPage(1)
    }, [search, tierFilter, sortKey, direction, kecamatanFilter, mode])

    const totals = useMemo(() => summarizeRows(filteredRows), [filteredRows])
    const lastPage = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
    const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const rankOffset = (page - 1) * PAGE_SIZE

    const handleExport = () => {
        const headers = [
            'No',
            ...(mode === 'desa' ? ['Kecamatan', 'Desa'] : ['Kecamatan', 'Jumlah Desa', 'Desa Tuntas', 'Desa Belum Ada Capaian']),
            'Target KK',
            capaianLabel,
            ...(showSr ? ['SR'] : []),
            ...(showBjp ? ['Dari BJP (KK)'] : []),
            'Jiwa',
            'Gap KK',
            'Cakupan (%)',
            'Unit',
        ]
        const body = filteredRows.map((row, index) => [
            index + 1,
            ...(mode === 'desa'
                ? [row.kecamatan, row.nama]
                : [row.nama, row.desaCount, row.desaTuntas, row.desaTanpaCapaian]),
            row.target,
            row.capaian,
            ...(showSr ? [row.sr] : []),
            ...(showBjp ? [row.bjp] : []),
            row.jiwa,
            row.gap,
            row.coverage != null ? row.coverage.toFixed(2).replace('.', ',') : '',
            row.unit,
        ])
        downloadCsv(`${exportFilename}-per-${mode}.csv`, buildCsv(headers, body))
    }

    const toggleDirection = () => setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))

    return (
        <div className="space-y-4">
            {/* Distribusi tingkat capaian */}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setTierFilter('all')}
                    className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        tierFilter === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
                    )}
                >
                    Semua · {scopedRows.length}
                </button>
                {SPM_COVERAGE_TIERS.map(({ tier, label, hint }) => (
                    <button
                        key={tier}
                        type="button"
                        onClick={() => setTierFilter(tierFilter === tier ? 'all' : tier)}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                            tierFilter === tier ? 'border-primary bg-primary/10' : 'hover:bg-muted',
                        )}
                        title={hint}
                    >
                        <span className={cn('h-2 w-2 rounded-full', TIER_DOT[tier])} />
                        {label}
                        <span className="text-muted-foreground">({hint})</span>
                        <span className="font-bold tabular-nums">{tierCounts[tier]}</span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-9 pl-9"
                        placeholder={mode === 'desa' ? 'Cari desa atau kecamatan...' : 'Cari kecamatan...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label={mode === 'desa' ? 'Cari desa' : 'Cari kecamatan'}
                    />
                </div>
                {mode === 'desa' && kecamatanFilter ? (
                    <Badge variant="secondary" className="h-9 gap-1 px-3 text-xs">
                        Kec. {kecamatanFilter}
                        <button
                            type="button"
                            onClick={onClearKecamatanFilter}
                            className="ml-1 rounded-full p-0.5 hover:bg-background"
                            aria-label="Hapus filter kecamatan"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ) : null}
                <div className="flex gap-2">
                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as SpmRekapSortKey)}>
                        <SelectTrigger className="h-9 w-full text-xs lg:w-[170px]">
                            <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="coverage">Urut: Cakupan %</SelectItem>
                            <SelectItem value="gap">Urut: Gap KK</SelectItem>
                            <SelectItem value="capaian">Urut: {capaianLabel}</SelectItem>
                            <SelectItem value="target">Urut: Target KK</SelectItem>
                            <SelectItem value="nama">Urut: Nama</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="h-9 shrink-0 text-xs" onClick={toggleDirection}>
                        <ArrowDownUp className="mr-1 h-3.5 w-3.5" />
                        {direction === 'asc' ? 'Terendah' : 'Tertinggi'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 shrink-0 text-xs"
                        onClick={handleExport}
                        disabled={filteredRows.length === 0}
                    >
                        <Download className="mr-1 h-3.5 w-3.5" />
                        CSV
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memuat data wilayah...
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="w-10 text-center">#</TableHead>
                                {mode === 'desa' ? (
                                    <>
                                        <TableHead className="min-w-[140px]">Desa</TableHead>
                                        <TableHead className="min-w-[120px]">Kecamatan</TableHead>
                                    </>
                                ) : (
                                    <>
                                        <TableHead className="min-w-[140px]">Kecamatan</TableHead>
                                        <TableHead className="text-center">Desa</TableHead>
                                    </>
                                )}
                                <TableHead className="text-right">Target KK</TableHead>
                                <TableHead className="text-right">{capaianLabel}</TableHead>
                                {showSr ? <TableHead className="text-right">SR</TableHead> : null}
                                {showBjp ? <TableHead className="text-right">Dari BJP</TableHead> : null}
                                <TableHead className="text-right">Jiwa</TableHead>
                                <TableHead className="text-right">Gap KK</TableHead>
                                <TableHead className="text-right">Cakupan</TableHead>
                                <TableHead className="text-right">Unit</TableHead>
                                <TableHead className="w-8" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pageRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="py-10 text-center text-muted-foreground">
                                        Tidak ada data untuk filter ini.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pageRows.map((row, index) => {
                                    const clickable =
                                        mode === 'kecamatan' ? !!onKecamatanSelect : !!onDesaSelect
                                    return (
                                        <TableRow
                                            key={row.key}
                                            className={cn(clickable && 'cursor-pointer')}
                                            onClick={() => {
                                                if (mode === 'kecamatan') onKecamatanSelect?.(row.nama)
                                                else onDesaSelect?.(row)
                                            }}
                                        >
                                            <TableCell className="text-center text-xs text-muted-foreground tabular-nums">
                                                {rankOffset + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">{row.nama}</TableCell>
                                            {mode === 'desa' ? (
                                                <TableCell className="text-muted-foreground">{row.kecamatan}</TableCell>
                                            ) : (
                                                <TableCell className="text-center">
                                                    <div className="text-sm font-semibold tabular-nums">{row.desaCount}</div>
                                                    <div className="text-[10px] text-muted-foreground">
                                                        {row.desaTuntas} tuntas · {row.desaTanpaCapaian} belum
                                                    </div>
                                                </TableCell>
                                            )}
                                            <TableCell className="text-right tabular-nums">{formatNumber(row.target)}</TableCell>
                                            <TableCell className="text-right font-semibold tabular-nums">
                                                {formatNumber(row.capaian)}
                                            </TableCell>
                                            {showSr ? (
                                                <TableCell className="text-right tabular-nums">{formatNumber(row.sr)}</TableCell>
                                            ) : null}
                                            {showBjp ? (
                                                <TableCell className="text-right tabular-nums text-violet-700 dark:text-violet-400">
                                                    {formatNumber(row.bjp)}
                                                </TableCell>
                                            ) : null}
                                            <TableCell className="text-right tabular-nums text-muted-foreground">
                                                {formatNumber(row.jiwa)}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums text-amber-700 dark:text-amber-400">
                                                {row.gap > 0 ? formatNumber(row.gap) : '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <CoverageCell coverage={row.coverage} />
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{formatNumber(row.unit)}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {clickable ? <ChevronRight className="h-4 w-4" /> : null}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                        {filteredRows.length > 0 ? (
                            <TableFooter>
                                <TableRow>
                                    <TableCell />
                                    <TableCell className="font-semibold">
                                        Total ({filteredRows.length} {mode === 'desa' ? 'desa' : 'kecamatan'})
                                    </TableCell>
                                    <TableCell className={cn(mode === 'kecamatan' && 'text-center tabular-nums')}>
                                        {mode === 'kecamatan' ? totals.desaCount : null}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold tabular-nums">
                                        {formatNumber(totals.target)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold tabular-nums">
                                        {formatNumber(totals.capaian)}
                                    </TableCell>
                                    {showSr ? (
                                        <TableCell className="text-right font-semibold tabular-nums">
                                            {formatNumber(totals.sr)}
                                        </TableCell>
                                    ) : null}
                                    {showBjp ? (
                                        <TableCell className="text-right font-semibold tabular-nums text-violet-700 dark:text-violet-400">
                                            {formatNumber(totals.bjp)}
                                        </TableCell>
                                    ) : null}
                                    <TableCell className="text-right tabular-nums">{formatNumber(totals.jiwa)}</TableCell>
                                    <TableCell className="text-right font-semibold tabular-nums text-amber-700 dark:text-amber-400">
                                        {formatNumber(totals.gap)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <CoverageCell coverage={totals.coverage} />
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">{formatNumber(totals.unit)}</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableFooter>
                        ) : null}
                    </Table>
                </div>
            )}

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                    {mode === 'kecamatan'
                        ? 'Klik baris kecamatan untuk melihat rincian desanya.'
                        : onDesaSelect
                          ? 'Klik baris desa untuk membuka detailnya.'
                          : `Menampilkan ${pageRows.length} dari ${filteredRows.length} desa.`}
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
