import { useEffect, useMemo, useState } from 'react'
import { Download, Eye, FileText, Files, Search, X } from 'lucide-react'
import { DocumentPreviewModal } from '@/components/shared/DocumentPreviewModal'
import { resolveBerkasFileName } from '@/features/documents/lib/resolve-berkas-file-name'
import { formatDate } from '@/lib/format'
import {
    filterReviewBerkas,
    paginateReviewItems,
    REVIEW_BERKAS_PAGE_SIZE,
    type PekerjaanReviewBerkas,
} from '../../lib/pekerjaan-review-utils'
import { PuspenBadge, PuspenButton, PuspenField, PuspenInput } from '../PuspenUi'
import { ReviewListPagination } from './ReviewListPagination'
import { puspenBorder, puspenPressable, puspenShadowSm } from '../../lib/tokens'

type ReviewBerkasPanelProps = {
    berkas?: PekerjaanReviewBerkas[] | null
    pageSize?: number
}

function formatFileSize(bytes: number | null | undefined) {
    if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return null
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function sortBerkasLatest(items: PekerjaanReviewBerkas[]) {
    return [...items].sort((a, b) => {
        const aTime = a.created_at ? Date.parse(a.created_at) : 0
        const bTime = b.created_at ? Date.parse(b.created_at) : 0
        return bTime - aTime
    })
}

export function ReviewBerkasPanel({
    berkas,
    pageSize = REVIEW_BERKAS_PAGE_SIZE,
}: ReviewBerkasPanelProps) {
    const [preview, setPreview] = useState<PekerjaanReviewBerkas | null>(null)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const allItems = useMemo(() => sortBerkasLatest(berkas ?? []), [berkas])

    const filtered = useMemo(
        () => filterReviewBerkas(allItems, search),
        [allItems, search],
    )

    const pagination = useMemo(
        () => paginateReviewItems(filtered, page, pageSize),
        [filtered, page, pageSize],
    )

    useEffect(() => {
        setPage(1)
    }, [search, berkas])

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
                <Files className="h-8 w-8 text-[#111111]/35" aria-hidden />
                <p className="text-sm font-black uppercase tracking-[0.12em] text-[#111111]/55">
                    Belum ada berkas
                </p>
                <p className="max-w-md text-xs font-bold text-[#111111]/55">
                    File dokumen pekerjaan (RAB, gambar, nego, kontrak, dll.) akan tampil di sini setelah diunggah.
                </p>
            </div>
        )
    }

    const hasActiveFilters = search.trim().length > 0

    return (
        <>
            <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <PuspenBadge>
                            {hasActiveFilters
                                ? `${filtered.length}/${allItems.length} file`
                                : `${allItems.length} file`}
                        </PuspenBadge>
                        <span className="text-xs font-bold text-[#111111]/60">
                            Urut terbaru · pratinjau / unduh
                        </span>
                    </div>

                    <PuspenField label="Cari berkas" className="w-full sm:max-w-sm">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]/45" />
                            <PuspenInput
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Judul, nama file, uploader…"
                                className="py-2.5 pl-10 pr-10 text-sm"
                                aria-label="Cari berkas pekerjaan"
                            />
                            {search ? (
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#111111]/50 hover:text-[#111111]"
                                    onClick={() => setSearch('')}
                                    aria-label="Hapus pencarian berkas"
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
                        unitLabel="file"
                        onPageChange={setPage}
                    />
                </div>

                {pagination.items.length === 0 ? (
                    <div
                        className={`flex flex-col items-center justify-center gap-2 bg-[#FFF7E8]/60 px-4 py-8 text-center ${puspenBorder}`}
                    >
                        <p className="text-sm font-black uppercase tracking-[0.12em] text-[#111111]/55">
                            Tidak ada hasil
                        </p>
                        <p className="text-xs font-bold text-[#111111]/55">
                            Tidak ada berkas yang cocok dengan “{search.trim()}”.
                        </p>
                        <PuspenButton
                            variant="ghost"
                            className="mt-1 px-3 py-1.5 text-xs"
                            onClick={() => setSearch('')}
                        >
                            <X className="h-3.5 w-3.5" />
                            Hapus filter
                        </PuspenButton>
                    </div>
                ) : (
                    <ul className="grid gap-2 sm:grid-cols-1 lg:grid-cols-2">
                        {pagination.items.map((item) => {
                            const title =
                                item.jenis_dokumen?.trim() || item.file_name || `Berkas #${item.id}`
                            const sizeLabel = formatFileSize(item.size)
                            const href = item.berkas_url || undefined
                            const canPreview = Boolean(href)

                            return (
                                <li
                                    key={item.id}
                                    className={`flex flex-col gap-3 bg-[#FFF7E8]/40 p-3 sm:flex-row sm:items-center sm:justify-between ${puspenBorder} ${puspenShadowSm}`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-2">
                                            <FileText
                                                className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]/70"
                                                aria-hidden
                                            />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black uppercase tracking-[0.06em] text-[#111111]">
                                                    {title}
                                                </p>
                                                <p className="mt-0.5 truncate text-xs font-bold text-[#111111]/60">
                                                    {item.file_name || '—'}
                                                    {sizeLabel ? ` · ${sizeLabel}` : ''}
                                                    {item.created_at
                                                        ? ` · ${formatDate(item.created_at)}`
                                                        : ''}
                                                </p>
                                                {item.uploader?.name ? (
                                                    <p className="mt-0.5 text-[11px] font-bold text-[#111111]/50">
                                                        Upload: {item.uploader.name}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                                        <PuspenButton
                                            type="button"
                                            variant="ghost"
                                            className={`px-3 py-1.5 text-xs ${puspenPressable}`}
                                            disabled={!canPreview}
                                            onClick={() => setPreview(item)}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            Pratinjau
                                        </PuspenButton>
                                        {href ? (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={item.file_name || title}
                                                className={`inline-flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#111111] ${puspenBorder} ${puspenShadowSm} ${puspenPressable} hover:bg-[#8ECAE6]`}
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                Unduh
                                            </a>
                                        ) : (
                                            <span className="text-xs font-bold text-[#111111]/45">
                                                URL tidak ada
                                            </span>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}

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
                            unitLabel="file"
                            onPageChange={setPage}
                        />
                    </div>
                ) : null}
            </div>

            <DocumentPreviewModal
                isOpen={!!preview}
                onClose={() => setPreview(null)}
                url={preview?.berkas_url ?? ''}
                title={preview?.jenis_dokumen ?? preview?.file_name ?? undefined}
                fileName={
                    preview
                        ? resolveBerkasFileName({
                              berkas_url: preview.berkas_url ?? '',
                              jenis_dokumen:
                                  preview.jenis_dokumen ||
                                  preview.file_name ||
                                  `berkas-${preview.id}`,
                          })
                        : undefined
                }
                mediaId={preview?.media_id ?? undefined}
            />
        </>
    )
}
