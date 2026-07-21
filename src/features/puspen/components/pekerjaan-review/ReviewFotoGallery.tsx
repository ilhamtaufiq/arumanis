import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight, MapPin, RotateCcw, X, ZoomIn } from 'lucide-react'
import type { Foto } from '@/features/foto/types'
import { getFotoFullUrl, getFotoThumbUrl } from '@/features/foto/lib/foto-url'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { formatDate } from '@/lib/format'
import { PuspenBadge, PuspenButton, PuspenField, PuspenSelect } from '../PuspenUi'
import {
    buildFotoKomponenFilterOptions,
    buildFotoSlotFilterOptions,
    filterGalleryFotos,
    isFotoKoordinatDiluarDesa,
    paginateFotos,
    RECENT_FOTO_PAGE_SIZE,
    resolveFotoKomponenLabel,
    sortFotosByLatest,
} from '../../lib/pekerjaan-review-utils'
import { puspenBorder, puspenPressable, puspenShadowMd, puspenShadowSm } from '../../lib/tokens'

const ALL_VALUE = 'all'

type ReviewFotoGalleryProps = {
    fotos?: Foto[]
    outputs?: Pekerjaan['output']
    pageSize?: number
}

function fotoSubjectLabel(foto: Foto) {
    return foto.penerima?.nama ?? (foto.unit_index ? `Unit ${foto.unit_index}` : '-')
}

function GalleryPagination({
    page,
    totalPages,
    from,
    to,
    total,
    filtered,
    hasActiveFilters,
    onPageChange,
}: {
    page: number
    totalPages: number
    from: number
    to: number
    total: number
    filtered: number
    hasActiveFilters: boolean
    onPageChange: (page: number) => void
}) {
    const summary = hasActiveFilters
        ? `${filtered} dari ${total} foto · filter aktif`
        : `${total} foto · diurutkan terbaru`

    if (totalPages <= 1) {
        return (
            <span className="text-xs font-bold text-[#111111]/65">
                {summary}
            </span>
        )
    }

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="text-xs font-bold text-[#111111]/65">
                {from}–{to} · {summary}
            </span>
            <PuspenButton
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
            >
                Prev
            </PuspenButton>
            <div className={`bg-[#FFB703] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowSm}`}>
                Hal {page} / {totalPages}
            </div>
            <PuspenButton
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
            >
                Next
            </PuspenButton>
        </div>
    )
}

function FotoPreviewOverlay({
    fotos,
    outputs,
    index,
    onClose,
    onIndexChange,
}: {
    fotos: Foto[]
    outputs?: Pekerjaan['output']
    index: number
    onClose: () => void
    onIndexChange: (index: number) => void
}) {
    const foto = fotos[index]
    const fullUrl = getFotoFullUrl(foto)
    const hasMultiple = fotos.length > 1

    const goPrev = useCallback(() => {
        onIndexChange((index - 1 + fotos.length) % fotos.length)
    }, [fotos.length, index, onIndexChange])

    const goNext = useCallback(() => {
        onIndexChange((index + 1) % fotos.length)
    }, [fotos.length, index, onIndexChange])

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            } else if (event.key === 'ArrowLeft') {
                goPrev()
            } else if (event.key === 'ArrowRight') {
                goNext()
            }
        }

        window.addEventListener('keydown', onKeyDown)
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            window.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = previousOverflow
        }
    }, [goNext, goPrev, onClose])

    if (!foto) {
        return null
    }

    const komponenLabel = resolveFotoKomponenLabel(foto, outputs)

    return (
        <div
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-[#111111]/80 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Preview foto dokumentasi"
            onClick={onClose}
        >
            <div
                className={`relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden bg-[#FFF7E8] ${puspenBorder} ${puspenShadowMd}`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 border-b-[3px] border-[#111111] bg-[#E63946] px-4 py-3">
                    <div className="min-w-0">
                        <div className="truncate text-sm font-black uppercase tracking-[0.08em] text-white">
                            {komponenLabel}
                        </div>
                        <div className="text-xs font-bold text-white/85">
                            {index + 1} / {fotos.length} · {formatDate(foto.created_at)}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center bg-white text-[#111111] ${puspenBorder} ${puspenShadowSm} ${puspenPressable}`}
                        aria-label="Tutup preview"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="relative flex min-h-[280px] flex-1 items-center justify-center bg-[#111111]">
                    {fullUrl ? (
                        <img
                            src={fullUrl}
                            alt={`${komponenLabel} ${foto.keterangan}`}
                            className="max-h-[60vh] max-w-full object-contain"
                        />
                    ) : (
                        <p className="text-sm font-bold text-white/70">Foto tidak tersedia</p>
                    )}

                    {hasMultiple ? (
                        <>
                            <button
                                type="button"
                                onClick={goPrev}
                                className={`absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-[#FFF7E8] ${puspenBorder} ${puspenShadowSm} ${puspenPressable}`}
                                aria-label="Foto sebelumnya"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={goNext}
                                className={`absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-[#FFF7E8] ${puspenBorder} ${puspenShadowSm} ${puspenPressable}`}
                                aria-label="Foto berikutnya"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    ) : null}
                </div>

                <div className="space-y-2 border-t-[3px] border-[#111111] bg-white p-4 text-sm font-bold text-[#111111]">
                    <div className="flex flex-wrap items-center gap-2">
                        <PuspenBadge tone="crt">{foto.keterangan}</PuspenBadge>
                        <span>{fotoSubjectLabel(foto)}</span>
                    </div>
                    {foto.koordinat ? (
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 text-xs text-[#111111]/70">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="font-mono">{foto.koordinat}</span>
                            </div>
                            {isFotoKoordinatDiluarDesa(foto) ? (
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FB8500]">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    <span>
                                        {foto.validasi_koordinat_message ?? 'Koordinat di luar desa pekerjaan'}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export function ReviewFotoGallery({
    fotos = [],
    outputs = [],
    pageSize = RECENT_FOTO_PAGE_SIZE,
}: ReviewFotoGalleryProps) {
    const [page, setPage] = useState(1)
    const [previewIndex, setPreviewIndex] = useState<number | null>(null)
    const [komponenFilter, setKomponenFilter] = useState(ALL_VALUE)
    const [slotFilter, setSlotFilter] = useState(ALL_VALUE)

    const sortedFotos = useMemo(() => sortFotosByLatest(fotos), [fotos])
    const komponenOptions = useMemo(
        () => buildFotoKomponenFilterOptions(fotos, outputs),
        [fotos, outputs],
    )
    const slotOptions = useMemo(() => buildFotoSlotFilterOptions(fotos), [fotos])
    const hasActiveFilters = komponenFilter !== ALL_VALUE || slotFilter !== ALL_VALUE

    const filteredFotos = useMemo(
        () => filterGalleryFotos(sortedFotos, {
            komponenId: komponenFilter === ALL_VALUE ? null : Number(komponenFilter),
            slot: slotFilter === ALL_VALUE ? null : slotFilter,
        }),
        [sortedFotos, komponenFilter, slotFilter],
    )

    const pagination = useMemo(
        () => paginateFotos(filteredFotos, page, pageSize),
        [filteredFotos, page, pageSize],
    )

    useEffect(() => {
        setPage(1)
        setPreviewIndex(null)
    }, [fotos, komponenFilter, slotFilter])

    useEffect(() => {
        if (page > pagination.totalPages) {
            setPage(pagination.totalPages)
        }
    }, [page, pagination.totalPages])

    const resetFilters = () => {
        setKomponenFilter(ALL_VALUE)
        setSlotFilter(ALL_VALUE)
    }

    const openPreview = (localIndex: number) => {
        setPreviewIndex((pagination.page - 1) * pageSize + localIndex)
    }

    if (sortedFotos.length === 0) {
        return (
            <p className="text-sm font-bold text-[#111111]/65">Belum ada foto dokumentasi.</p>
        )
    }

    return (
        <>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <PuspenField label="Komponen">
                        <PuspenSelect
                            value={komponenFilter}
                            onChange={(event) => setKomponenFilter(event.target.value)}
                            aria-label="Filter komponen foto"
                        >
                            <option value={ALL_VALUE}>Semua komponen ({sortedFotos.length})</option>
                            {komponenOptions.map((option) => (
                                <option key={option.id} value={String(option.id)}>
                                    {option.label} ({option.count})
                                </option>
                            ))}
                        </PuspenSelect>
                    </PuspenField>

                    <PuspenField label="Slot Progress">
                        <PuspenSelect
                            value={slotFilter}
                            onChange={(event) => setSlotFilter(event.target.value)}
                            aria-label="Filter slot progress foto"
                        >
                            <option value={ALL_VALUE}>Semua slot ({sortedFotos.length})</option>
                            {slotOptions.map((option) => (
                                <option key={option.slot} value={option.slot}>
                                    {option.slot} ({option.count})
                                </option>
                            ))}
                        </PuspenSelect>
                    </PuspenField>
                </div>

                {hasActiveFilters ? (
                    <PuspenButton variant="secondary" className="shrink-0" onClick={resetFilters}>
                        <RotateCcw className="h-4 w-4" />
                        Reset Filter
                    </PuspenButton>
                ) : null}
            </div>

            {filteredFotos.length === 0 ? (
                <div className={`bg-[#FFF7E8] p-6 text-center ${puspenBorder} ${puspenShadowSm}`}>
                    <p className="text-sm font-bold text-[#111111]/70">
                        Tidak ada foto untuk kombinasi filter ini.
                    </p>
                    <PuspenButton variant="ghost" className="mt-3" onClick={resetFilters}>
                        Reset Filter
                    </PuspenButton>
                </div>
            ) : (
                <>
                    <div className="mb-3">
                        <GalleryPagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            from={pagination.from}
                            to={pagination.to}
                            total={sortedFotos.length}
                            filtered={filteredFotos.length}
                            hasActiveFilters={hasActiveFilters}
                            onPageChange={setPage}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {pagination.items.map((foto, localIndex) => {
                            const komponenLabel = resolveFotoKomponenLabel(foto, outputs)
                            const outsideDesa = isFotoKoordinatDiluarDesa(foto)

                            return (
                                <button
                                    key={foto.id}
                                    type="button"
                                    onClick={() => openPreview(localIndex)}
                                    className={`group overflow-hidden text-left ${puspenBorder} ${puspenShadowSm} ${puspenPressable} hover:bg-[#8ECAE6]/25`}
                                    aria-label={`Preview foto ${komponenLabel} ${foto.keterangan}`}
                                >
                                    <div className="relative">
                                        <img
                                            src={getFotoThumbUrl(foto)}
                                            alt={foto.keterangan}
                                            className="h-36 w-full object-cover"
                                            loading="lazy"
                                        />
                                        {outsideDesa ? (
                                            <div className="absolute left-2 top-2">
                                                <PuspenBadge tone="warning">
                                                    <span className="inline-flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Luar desa
                                                    </span>
                                                </PuspenBadge>
                                            </div>
                                        ) : null}
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#111111]/0 transition group-hover:bg-[#111111]/35">
                                            <span className="inline-flex h-10 w-10 items-center justify-center bg-[#FFB703] opacity-0 transition group-hover:opacity-100">
                                                <ZoomIn className="h-5 w-5 text-[#111111]" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 bg-[#FFF7E8] p-2 text-xs font-bold text-[#111111]">
                                        <div className="uppercase tracking-[0.06em]">
                                            {komponenLabel}
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <PuspenBadge tone="crt">{foto.keterangan}</PuspenBadge>
                                            <span className="truncate text-[10px] text-[#111111]/65">
                                                {fotoSubjectLabel(foto)}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#111111]/55">
                                            {formatDate(foto.created_at)}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {pagination.totalPages > 1 ? (
                        <div className="mt-4">
                            <GalleryPagination
                                page={pagination.page}
                                totalPages={pagination.totalPages}
                                from={pagination.from}
                                to={pagination.to}
                                total={sortedFotos.length}
                                filtered={filteredFotos.length}
                                hasActiveFilters={hasActiveFilters}
                                onPageChange={setPage}
                            />
                        </div>
                    ) : null}

                    {previewIndex !== null ? (
                        <FotoPreviewOverlay
                            fotos={filteredFotos}
                            outputs={outputs}
                            index={previewIndex}
                            onClose={() => setPreviewIndex(null)}
                            onIndexChange={setPreviewIndex}
                        />
                    ) : null}
                </>
            )}
        </>
    )
}