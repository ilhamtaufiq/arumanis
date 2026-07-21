import { useEffect, useMemo, useState } from 'react'
import { Search, Users, X } from 'lucide-react'
import type { Penerima } from '@/features/penerima/types'
import {
    filterReviewPenerima,
    paginateReviewItems,
    REVIEW_PENERIMA_PAGE_SIZE,
} from '../../lib/pekerjaan-review-utils'
import { PuspenBadge, PuspenButton, PuspenDataTable, PuspenField, PuspenInput } from '../PuspenUi'
import { ReviewListPagination } from './ReviewListPagination'
import { puspenBorder } from '../../lib/tokens'

type ReviewPenerimaPanelProps = {
    penerima?: Penerima[] | null
    pageSize?: number
}

export function ReviewPenerimaPanel({
    penerima,
    pageSize = REVIEW_PENERIMA_PAGE_SIZE,
}: ReviewPenerimaPanelProps) {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const allItems = useMemo(() => penerima ?? [], [penerima])

    const filtered = useMemo(
        () => filterReviewPenerima(allItems, search),
        [allItems, search],
    )

    const pagination = useMemo(
        () => paginateReviewItems(filtered, page, pageSize),
        [filtered, page, pageSize],
    )

    useEffect(() => {
        setPage(1)
    }, [search, penerima])

    useEffect(() => {
        if (page !== pagination.page) {
            setPage(pagination.page)
        }
    }, [page, pagination.page])

    if (allItems.length === 0) {
        return (
            <div
                className={`flex flex-col items-center justify-center gap-2 bg-[#FFF7E8]/60 px-4 py-10 text-center ${puspenBorder}`}
            >
                <Users className="h-8 w-8 text-[#111111]/35" aria-hidden />
                <p className="text-sm font-black uppercase tracking-[0.12em] text-[#111111]/55">
                    Belum ada penerima
                </p>
                <p className="max-w-md text-xs font-bold text-[#111111]/55">
                    Daftar penerima manfaat akan tampil di sini setelah diinput.
                </p>
            </div>
        )
    }

    const hasActiveFilters = search.trim().length > 0
    const totalJiwa = filtered.reduce((sum, row) => sum + (Number(row.jumlah_jiwa) || 0), 0)

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <PuspenBadge>
                        {hasActiveFilters
                            ? `${filtered.length}/${allItems.length} penerima`
                            : `${allItems.length} penerima`}
                    </PuspenBadge>
                    <span className="text-xs font-bold text-[#111111]/60">
                        {totalJiwa} jiwa{hasActiveFilters ? ' (hasil filter)' : ''}
                    </span>
                </div>

                <PuspenField label="Cari penerima" className="w-full sm:max-w-sm">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]/45" />
                        <PuspenInput
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Nama, NIK, alamat…"
                            className="py-2.5 pl-10 pr-10 text-sm"
                            aria-label="Cari penerima manfaat"
                        />
                        {search ? (
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#111111]/50 hover:text-[#111111]"
                                onClick={() => setSearch('')}
                                aria-label="Hapus pencarian penerima"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        ) : null}
                    </div>
                </PuspenField>
            </div>

            <div className="flex justify-end">
                <ReviewListPagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    from={pagination.from}
                    to={pagination.to}
                    total={allItems.length}
                    filtered={filtered.length}
                    hasActiveFilters={hasActiveFilters}
                    unitLabel="penerima"
                    onPageChange={setPage}
                />
            </div>

            <PuspenDataTable
                columns={[
                    {
                        key: 'nama',
                        header: 'Nama',
                        cell: (row) => <span className="font-black">{row.nama}</span>,
                    },
                    {
                        key: 'nik',
                        header: 'NIK',
                        cell: (row) => <span className="font-mono text-xs">{row.nik || '-'}</span>,
                    },
                    {
                        key: 'alamat',
                        header: 'Alamat',
                        cell: (row) => row.alamat || '-',
                    },
                    {
                        key: 'jiwa',
                        header: 'Jiwa',
                        cell: (row) => row.jumlah_jiwa,
                        className: 'text-center',
                    },
                ]}
                rows={pagination.items}
                getRowKey={(row) => row.id}
                emptyMessage={
                    hasActiveFilters
                        ? `Tidak ada penerima yang cocok dengan “${search.trim()}”.`
                        : 'Belum ada penerima.'
                }
            />

            {pagination.totalPages > 1 ? (
                <div className="flex justify-end">
                    <ReviewListPagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        from={pagination.from}
                        to={pagination.to}
                        total={allItems.length}
                        filtered={filtered.length}
                        hasActiveFilters={hasActiveFilters}
                        unitLabel="penerima"
                        onPageChange={setPage}
                    />
                </div>
            ) : null}

            {hasActiveFilters && filtered.length === 0 ? (
                <div className="flex justify-center">
                    <PuspenButton
                        variant="ghost"
                        className="px-3 py-1.5 text-xs"
                        onClick={() => setSearch('')}
                    >
                        <X className="h-3.5 w-3.5" />
                        Hapus filter
                    </PuspenButton>
                </div>
            ) : null}
        </div>
    )
}
