import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getTags } from '@/features/pekerjaan/api/tags'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { cn } from '@/lib/utils'
import { Inbox, Tag as TagIcon } from 'lucide-react'
import { getDashboardStats } from '../api/dashboard'
import { useV2Stats } from '../hooks/use-v2-stats'
import { formatCurrency, formatNumber } from '../lib/format'
import type { SubKegiatanStat } from '../types'

const BAR_TONES = [
    '[&_[data-slot=progress-indicator]]:bg-chart-1',
    '[&_[data-slot=progress-indicator]]:bg-chart-2',
    '[&_[data-slot=progress-indicator]]:bg-chart-3',
    '[&_[data-slot=progress-indicator]]:bg-chart-4',
    '[&_[data-slot=progress-indicator]]:bg-chart-5',
]

interface Serapan {
    /** Persentase SP2D terhadap basis; null bila basis belum ada. */
    percent: number | null
    /** Basis pembanding: nilai kontrak bila ada, selain itu pagu. */
    basis: 'kontrak' | 'pagu' | null
    basisValue: number
}

function hitungSerapan(item: SubKegiatanStat): Serapan {
    const paguRupiah = item.paguM * 1_000_000
    const basis: Serapan['basis'] = item.kontrakTotal > 0 ? 'kontrak' : paguRupiah > 0 ? 'pagu' : null
    const basisValue = basis === 'kontrak' ? item.kontrakTotal : paguRupiah
    if (basis === null) return { percent: null, basis, basisValue: 0 }
    return { percent: (item.sp2dTotal / basisValue) * 100, basis, basisValue }
}

function formatPersen(value: number): string {
    return `${value.toFixed(1)}%`
}

function clampPersen(value: number): number {
    return Math.min(100, Math.max(0, value))
}

/**
 * Realisasi per sub kegiatan — label + nilai SP2D + bar serapan (SP2D vs basis)
 * + progres fisik estimasi bila tersedia.
 *
 * Tanpa filter: memakai `items` dari dashboard utama. Dengan filter tag: mengambil
 * ulang `/dashboard/stats?tag_id=…` sehingga angkanya memakai logika backend yang sama.
 */
export function SubKegiatanRealisasi({
    items,
    isLoading,
}: {
    items: SubKegiatanStat[]
    isLoading: boolean
}) {
    const { tahunAnggaran } = useAppSettingsValues()
    const { canViewStats } = useV2Stats()
    const [tagFilter, setTagFilter] = useState<string>('all')
    const tagId = tagFilter === 'all' ? null : Number(tagFilter)

    const { data: tagsResponse } = useQuery({
        queryKey: ['tags-options'],
        queryFn: () => getTags(),
        staleTime: 5 * 60_000,
    })
    const tags = tagsResponse?.data ?? []
    const selectedTagName = tags.find((t) => t.id === tagId)?.name

    const {
        data: taggedStats,
        isLoading: isTaggedLoading,
        isError: isTaggedError,
    } = useQuery({
        queryKey: ['dashboard-stats', tahunAnggaran, 'tag', tagId],
        queryFn: () => getDashboardStats(tahunAnggaran, tagId ?? undefined),
        enabled: tagId !== null && canViewStats,
        staleTime: 60_000,
    })

    const rows = tagId === null ? items : (taggedStats?.subKegiatanStats ?? [])
    const loadingState = tagId === null ? isLoading : isTaggedLoading

    const renderHeader = () => (
        <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='min-w-0'>
                <CardTitle className='font-normal'>Realisasi per Sub Kegiatan</CardTitle>
                <CardDescription>Realisasi SP2D dan serapan terhadap kontrak (atau pagu bila belum berkontrak).</CardDescription>
            </div>
            <div className='flex shrink-0 items-center gap-2'>
                <TagIcon className='h-4 w-4 text-muted-foreground' aria-hidden />
                <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className='h-8 w-[150px] text-xs' aria-label='Filter tag'>
                        <SelectValue placeholder='Filter Tag' />
                    </SelectTrigger>
                    <SelectContent align='end'>
                        <SelectItem value='all'>Semua</SelectItem>
                        {tags.map((tag) => (
                            <SelectItem key={tag.id} value={String(tag.id)}>
                                {tag.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
    )

    if (loadingState) {
        return (
            <Card>
                {renderHeader()}
                <CardContent className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className='flex flex-col gap-2'>
                            <Skeleton className='h-4 w-40' />
                            <Skeleton className='h-6 w-28' />
                            <Skeleton className='h-2 w-full' />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (tagId !== null && isTaggedError) {
        return (
            <Card>
                {renderHeader()}
                <CardContent className='pt-6'>
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant='icon'>
                                <Inbox />
                            </EmptyMedia>
                            <EmptyTitle>Gagal memuat data tag</EmptyTitle>
                            <EmptyDescription>Coba pilih ulang tag atau muat ulang halaman.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        )
    }

    if (rows.length === 0) {
        return (
            <Card>
                {renderHeader()}
                <CardContent className='pt-6'>
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant='icon'>
                                <Inbox />
                            </EmptyMedia>
                            <EmptyTitle>Belum ada data sub kegiatan</EmptyTitle>
                            <EmptyDescription>
                                {selectedTagName
                                    ? `Belum ada paket pekerjaan dengan tag "${selectedTagName}" pada tahun anggaran ini.`
                                    : 'Belum ada paket aktif pada tahun anggaran ini.'}
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            {renderHeader()}

            <CardContent className='grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 xl:grid-cols-3'>
                {rows.map((item, index) => {
                    const serapan = hitungSerapan(item)
                    const melebihi = serapan.percent !== null && serapan.percent > 100
                    const hasStatusNote = item.batal > 0 || item.belumBerkontrak > 0

                    return (
                        <section key={item.name} className='isolate flex min-w-0 gap-2'>
                            <Separator
                                orientation='vertical'
                                className='h-auto border-l border-dashed border-muted-foreground/50 bg-transparent'
                            />
                            <div className='flex min-w-0 flex-1 flex-col gap-3'>
                                <div className='flex min-w-0 items-start justify-between gap-2'>
                                    <h3
                                        className='line-clamp-2 min-w-0 text-xs leading-snug text-muted-foreground'
                                        title={item.name}
                                    >
                                        {item.name}
                                    </h3>
                                    <Badge variant='secondary' className='shrink-0 px-1.5 py-0 text-[10px] tabular-nums'>
                                        {formatNumber(item.count)} paket
                                    </Badge>
                                </div>

                                <div className='flex flex-col gap-0.5'>
                                    <div className='font-heading text-lg leading-none tracking-tight tabular-nums'>
                                        {formatCurrency(item.sp2dTotal)}
                                    </div>
                                    <p className='text-[11px] text-muted-foreground tabular-nums'>
                                        Realisasi SP2D
                                        {serapan.basis !== null && (
                                            <>
                                                {' · '}
                                                {serapan.basis === 'kontrak' ? 'Kontrak' : 'Pagu'}{' '}
                                                {formatCurrency(serapan.basisValue)}
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className='flex flex-col gap-3'>
                                    <div>
                                        <div className='mb-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground'>
                                            <span className='leading-none'>
                                                Serapan {serapan.basis === 'pagu' ? 'terhadap pagu' : 'SP2D'}
                                            </span>
                                            <span
                                                className={cn(
                                                    'leading-none tabular-nums',
                                                    melebihi && 'font-medium text-amber-600 dark:text-amber-400',
                                                )}
                                            >
                                                {serapan.percent === null ? 'Belum ada basis' : formatPersen(serapan.percent)}
                                            </span>
                                        </div>
                                        {serapan.percent !== null ? (
                                            <Progress
                                                value={clampPersen(serapan.percent)}
                                                className={cn('h-2', BAR_TONES[index % BAR_TONES.length])}
                                                aria-label={`Serapan ${item.name}`}
                                            />
                                        ) : null}
                                        {melebihi && (
                                            <p className='mt-1 text-[10px] text-amber-600 dark:text-amber-400'>
                                                Realisasi SP2D melampaui nilai kontrak.
                                            </p>
                                        )}
                                    </div>

                                    {item.hasProgress ? (
                                        <div>
                                            <div className='mb-1 flex items-center justify-between text-[11px] text-muted-foreground'>
                                                <span className='leading-none'>Progres fisik (estimasi)</span>
                                                <span className='leading-none tabular-nums'>{formatPersen(item.progress)}</span>
                                            </div>
                                            <Progress
                                                value={clampPersen(item.progress)}
                                                className='h-2 [&_[data-slot=progress-indicator]]:bg-emerald-500'
                                                aria-label={`Progres fisik ${item.name}`}
                                            />
                                        </div>
                                    ) : null}
                                </div>

                                {hasStatusNote && (
                                    <div className='flex flex-wrap gap-1.5'>
                                        {item.batal > 0 && (
                                            <Badge variant='outline' className='px-1.5 py-0 text-[10px] tabular-nums'>
                                                {formatNumber(item.batal)} batal
                                            </Badge>
                                        )}
                                        {item.belumBerkontrak > 0 && (
                                            <Badge variant='outline' className='px-1.5 py-0 text-[10px] tabular-nums'>
                                                {formatNumber(item.belumBerkontrak)} belum berkontrak
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    )
                })}
            </CardContent>
        </Card>
    )
}
