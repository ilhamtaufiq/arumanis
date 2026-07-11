import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, ExternalLink, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { MapPekerjaanPin } from '../utils/map-utils'
import { formatProgressLabel, getProgressColor } from '../utils/map-utils'

type MapPekerjaanPinDetailProps = {
    pin: MapPekerjaanPin
    galleryIndex?: number
    onGalleryIndexChange?: (index: number) => void
    compact?: boolean
}

function formatVolume(volume: number | string | undefined, satuan?: string) {
    if (volume === undefined || volume === null || volume === '') return '-'
    const numeric = typeof volume === 'string' ? parseFloat(volume) : volume
    if (Number.isNaN(numeric)) return '-'
    const formatted = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(numeric)
    return satuan ? `${formatted} ${satuan}` : formatted
}

export function MapPekerjaanPinDetail({
    pin,
    galleryIndex,
    onGalleryIndexChange,
    compact = false,
}: MapPekerjaanPinDetailProps) {
    const isControlled = galleryIndex !== undefined && onGalleryIndexChange !== undefined
    const [internalGalleryIndex, setInternalGalleryIndex] = useState(0)
    const activeGalleryIndex = isControlled ? galleryIndex : internalGalleryIndex
    const setActiveGalleryIndex = isControlled ? onGalleryIndexChange : setInternalGalleryIndex

    useEffect(() => {
        if (!isControlled) {
            setInternalGalleryIndex(0)
        }
    }, [pin.pekerjaanId, isControlled])

    const activeFoto = pin.fotos[activeGalleryIndex] ?? pin.fotos[0]
    const hasMultipleFotos = pin.fotos.length > 1

    const goPrev = () => {
        if (!pin.fotos.length) return
        setActiveGalleryIndex((activeGalleryIndex - 1 + pin.fotos.length) % pin.fotos.length)
    }

    const goNext = () => {
        if (!pin.fotos.length) return
        setActiveGalleryIndex((activeGalleryIndex + 1) % pin.fotos.length)
    }

    return (
        <div className={cn('flex flex-col gap-3', compact && 'gap-2')}>
            <div>
                <div className={cn('font-semibold leading-snug', compact ? 'text-sm' : 'text-base')}>{pin.namaPaket}</div>
                {pin.lokasi ? <div className="mt-1 text-xs text-muted-foreground">{pin.lokasi}</div> : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge style={{ backgroundColor: getProgressColor(pin.highestProgress), color: '#fff' }}>
                        Tahap {formatProgressLabel(pin.highestProgress)}
                    </Badge>
                    {pin.progressTotal != null ? (
                        <Badge variant="secondary">Progress {pin.progressTotal.toFixed(1)}%</Badge>
                    ) : null}
                    <Badge variant="outline">{pin.fotos.length} foto</Badge>
                </div>
            </div>

            {activeFoto ? (
                <div className="overflow-hidden rounded-xl border bg-muted/20">
                    <div className="relative">
                        {activeFoto.foto_url || activeFoto.foto_thumb_url ? (
                            <img
                                src={activeFoto.foto_thumb_url || activeFoto.foto_url}
                                alt={pin.namaPaket}
                                loading="lazy"
                                className={cn('w-full object-cover', compact ? 'h-28' : 'h-36')}
                            />
                        ) : (
                            <div className={cn('flex items-center justify-center bg-muted text-xs text-muted-foreground', compact ? 'h-28' : 'h-36')}>
                                Foto tidak tersedia
                            </div>
                        )}

                        {hasMultipleFotos ? (
                            <>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="absolute left-2 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-background/90 shadow"
                                    onClick={goPrev}
                                    aria-label="Foto sebelumnya"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-background/90 shadow"
                                    onClick={goNext}
                                    aria-label="Foto berikutnya"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium shadow">
                                    {activeGalleryIndex + 1} / {pin.fotos.length}
                                </div>
                            </>
                        ) : null}
                    </div>

                    <div className="space-y-1 border-t px-3 py-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                                style={{ backgroundColor: getProgressColor(activeFoto.keterangan) }}
                            >
                                {formatProgressLabel(activeFoto.keterangan)}
                            </span>
                            {activeFoto.komponen?.komponen ? (
                                <Badge variant="outline" className="h-5 text-[10px]">
                                    {activeFoto.komponen.komponen}
                                </Badge>
                            ) : null}
                        </div>
                        <div className="text-muted-foreground">{formatDate(activeFoto.created_at)}</div>
                    </div>
                </div>
            ) : null}

            {pin.outputs.length > 0 ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        Output komponen
                    </div>
                    <div className="space-y-1.5">
                        {pin.outputs.map((output) => (
                            <div
                                key={output.id}
                                className="flex items-center justify-between gap-2 rounded-lg border bg-background/70 px-2.5 py-2 text-xs"
                            >
                                <span className="font-medium">{output.komponen}</span>
                                <span className="shrink-0 text-muted-foreground">
                                    {formatVolume(output.volume, output.satuan)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                    Belum ada data output komponen.
                </div>
            )}

            <Button asChild size="sm" className={cn('w-full', compact && 'h-7 text-xs')}>
                <Link to="/pekerjaan/$id" params={{ id: pin.pekerjaanId.toString() }}>
                    Buka detail pekerjaan
                    <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
            </Button>
        </div>
    )
}