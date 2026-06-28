import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCount, formatCoverage } from '../../lib/innovation-stats'
import {
    filterSpmDesaRows,
    getDefaultSortKey,
    paginateSpmDesaRows,
    sortSpmDesaRows,
    type SpmDesaRow,
    type SpmDesaSortDirection,
    type SpmDesaSortKey,
} from '../../lib/spm-desa-table'
import type { LandingSpmSector } from '../../api/spam-stats'
import type { PublicMessages } from '../../i18n/types'

type SpmDesaTableProps = {
    sector: LandingSpmSector
    rows: SpmDesaRow[]
    copy: PublicMessages['spmDetail']['table']
    isLoading?: boolean
}

export function SpmDesaTable({ sector, rows, copy, isLoading }: SpmDesaTableProps) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [sortKey, setSortKey] = useState<SpmDesaSortKey>(getDefaultSortKey(sector))
    const [sortDirection, setSortDirection] = useState<SpmDesaSortDirection>('desc')

    const processed = useMemo(() => {
        const filtered = filterSpmDesaRows(rows, search)
        const sorted = sortSpmDesaRows(filtered, sortKey, sortDirection)
        return paginateSpmDesaRows(sorted, page)
    }, [rows, search, sortKey, sortDirection, page])

    const handleSort = (key: SpmDesaSortKey) => {
        if (sortKey === key) {
            setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
            return
        }

        setSortKey(key)
        setSortDirection(key === 'desa' || key === 'kecamatan' ? 'asc' : 'desc')
        setPage(1)
    }

    const columns =
        sector === 'sanitasi'
            ? ([
                  { key: 'desa' as const, label: copy.columns.desa },
                  { key: 'kecamatan' as const, label: copy.columns.kecamatan },
                  { key: 'penduduk' as const, label: copy.columns.penduduk },
                  { key: 'target' as const, label: copy.columns.targetKk },
                  { key: 'kk' as const, label: copy.columns.kkPemanfaat },
                  { key: 'jiwa' as const, label: copy.columns.jiwa },
                  { key: 'unit_count' as const, label: copy.columns.infrastruktur },
                  { key: 'coverage' as const, label: copy.columns.coverage },
              ] as const)
            : ([
                  { key: 'desa' as const, label: copy.columns.desa },
                  { key: 'kecamatan' as const, label: copy.columns.kecamatan },
                  { key: 'sr' as const, label: copy.columns.sr },
                  { key: 'target' as const, label: copy.columns.targetKk },
                  { key: 'kk' as const, label: copy.columns.kk },
                  { key: 'jiwa' as const, label: copy.columns.jiwa },
                  { key: 'unit_count' as const, label: copy.columns.unitSpam },
                  { key: 'coverage' as const, label: copy.columns.coverage },
              ] as const)

    return (
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/20 shadow-2xl shadow-black/25 backdrop-blur-sm">
            <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <h3 className="text-lg font-medium text-white">{copy.title}</h3>
                    <p className="mt-1 text-sm text-white/65">
                        {copy.subtitle.replace('{count}', formatCount(processed.totalRows))}
                    </p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                    <Input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setPage(1)
                        }}
                        placeholder={copy.searchPlaceholder}
                        className="border-white/15 bg-slate-950/50 pl-9 text-white placeholder:text-white/40"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            {columns.map((column) => (
                                <th key={column.key} className="px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSort(column.key)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55 transition-colors hover:text-white"
                                    >
                                        {column.label}
                                        <SortIcon
                                            active={sortKey === column.key}
                                            direction={sortDirection}
                                        />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-white/55">
                                    {copy.loading}
                                </td>
                            </tr>
                        ) : processed.rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-white/55">
                                    {copy.empty}
                                </td>
                            </tr>
                        ) : (
                            processed.rows.map((row) => (
                                <tr
                                    key={`${row.sector}-${row.desa_id}`}
                                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-white">{row.desa}</td>
                                    <td className="px-4 py-3 text-sm text-white/75">{row.kecamatan}</td>
                                    {sector === 'sanitasi' ? (
                                        <td className="px-4 py-3 text-sm text-white/85">
                                            {formatCount(row.penduduk)}
                                        </td>
                                    ) : (
                                        <td className="px-4 py-3 text-sm text-white/85">
                                            {formatCount(row.sr)}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-sm text-white/85">{formatCount(row.target)}</td>
                                    <td className="px-4 py-3 text-sm text-white/85">{formatCount(row.kk)}</td>
                                    <td className="px-4 py-3 text-sm text-white/85">{formatCount(row.jiwa)}</td>
                                    <td className="px-4 py-3 text-sm text-white/85">{formatCount(row.unit_count)}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-white">
                                        {formatCoverage(row.coverage)}%
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-xs text-white/55">
                    {copy.pageInfo
                        .replace('{page}', String(processed.page))
                        .replace('{totalPages}', String(processed.totalPages))
                        .replace('{totalRows}', formatCount(processed.totalRows))}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={processed.page <= 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        className="border-white/15 bg-transparent text-white hover:bg-white/10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {copy.prev}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={processed.page >= processed.totalPages}
                        onClick={() => setPage((current) => current + 1)}
                        className="border-white/15 bg-transparent text-white hover:bg-white/10"
                    >
                        {copy.next}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function SortIcon({
    active,
    direction,
}: {
    active: boolean
    direction: SpmDesaSortDirection
}) {
    if (!active) {
        return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
    }

    return direction === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5" />
    ) : (
        <ArrowDown className="h-3.5 w-3.5" />
    )
}