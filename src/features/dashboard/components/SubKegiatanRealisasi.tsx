import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Inbox, Tag as TagIcon } from 'lucide-react'
import { formatCurrency, formatNumber } from '../lib/format'
import type { SubKegiatanStat } from '../types'

const BAR_TONES = [
    '[&_[data-slot=progress-indicator]]:bg-chart-1',
    '[&_[data-slot=progress-indicator]]:bg-chart-2',
    '[&_[data-slot=progress-indicator]]:bg-chart-3',
    '[&_[data-slot=progress-indicator]]:bg-chart-4',
    '[&_[data-slot=progress-indicator]]:bg-chart-5',
]

function serapanPersen(item: SubKegiatanStat): number | null {
    if (item.kontrakTotal > 0 && item.sp2dTotal >= 0) {
        return Math.min(100, (item.sp2dTotal / item.kontrakTotal) * 100)
    }
    return null
}

function matchesTagFilter(item: SubKegiatanStat, tagFilter: string): boolean {
    if (tagFilter === 'all') return true

    const filterLower = tagFilter.toLowerCase()

    if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
        return item.tags.some((t) => {
            const tagName = String(t).toLowerCase()
            if (filterLower === 'pokir') return tagName.includes('pokir')
            if (filterLower === 'perubahan') return tagName.includes('perubahan')
            if (filterLower === 'rembug_warga') return tagName.includes('rembug') || tagName.includes('warga')
            return tagName.includes(filterLower)
        })
    }

    const nameLower = item.name.toLowerCase()
    if (filterLower === 'pokir') return nameLower.includes('pokir')
    if (filterLower === 'perubahan') return nameLower.includes('perubahan')
    if (filterLower === 'rembug_warga') return nameLower.includes('rembug') || nameLower.includes('warga')

    return true
}

/**
 * Realisasi per sub kegiatan — adaptasi pola `income-breakdown` temp-apps:
 * label + nilai SP2D + bar serapan (SP2D vs nilai kontrak) per sub kegiatan.
 * Seluruh angka dari `/dashboard/stats` (SP2D realisasi + kontrakTotal backend).
 */
export function SubKegiatanRealisasi({
    items,
    isLoading,
}: {
    items: SubKegiatanStat[]
    isLoading: boolean
}) {
    const [tagFilter, setTagFilter] = useState<string>('all')

    const filteredItems = items.filter((item) => matchesTagFilter(item, tagFilter))

    const renderHeader = () => (
        <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
                <CardTitle className='font-normal'>Realisasi per Sub Kegiatan</CardTitle>
                <CardDescription>Serapan SP2D terhadap nilai kontrak + progres fisik.</CardDescription>
            </div>
            <div className='flex items-center gap-2'>
                <TagIcon className='h-4 w-4 text-muted-foreground' />
                <Select value={tagFilter} onValueChange={setTagFilter}>
                    <SelectTrigger className='h-8 w-[150px] text-xs'>
                        <SelectValue placeholder='Filter Tags' />
                    </SelectTrigger>
                    <SelectContent align='end'>
                        <SelectItem value='all'>Semua</SelectItem>
                        <SelectItem value='pokir'>Pokir</SelectItem>
                        <SelectItem value='perubahan'>Perubahan</SelectItem>
                        <SelectItem value='rembug_warga'>Rembug Warga</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
    )

    if (isLoading) {
        return (
            <Card>
                {renderHeader()}
                <CardContent className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
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

    if (filteredItems.length === 0) {
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
                                {tagFilter !== 'all'
                                    ? `Belum ada data sub kegiatan dengan filter tag "${tagFilter === 'pokir' ? 'Pokir' : tagFilter === 'perubahan' ? 'Perubahan' : 'Rembug Warga'}".`
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

            <CardContent className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3'>
                {filteredItems.map((item, index) => {
                    const serapan = serapanPersen(item)
                    return (
                        <section key={item.name} className='isolate flex gap-[0.5px]'>
                            <Separator
                                orientation='vertical'
                                className='mb-1 h-auto border-l border-dashed border-muted-foreground/50 bg-transparent'
                            />
                            <div className='flex min-h-24 flex-1 flex-col justify-between gap-2'>
                                <div className='flex min-w-0 flex-col gap-1 px-1'>
                                    <div className='flex flex-wrap items-center gap-1.5'>
                                        <p className='wrap-break-word text-xs leading-none text-muted-foreground'>
                                            {item.name}
                                            {serapan !== null ? ` · ${serapan.toFixed(1)}%` : ''}
                                        </p>
                                        <Badge variant='secondary' className='px-1.5 py-0 text-[10px] tabular-nums'>
                                            {formatNumber(item.count)} pkt
                                        </Badge>
                                    </div>
                                    <div className='font-heading text-lg leading-none tracking-tight tabular-nums'>
                                        {formatCurrency(item.sp2dTotal)}
                                    </div>
                                    <p className='text-[11px] text-muted-foreground tabular-nums'>
                                        Pagu {formatCurrency(item.paguM * 1000000)} · Kontrak{' '}
                                        {formatCurrency(item.kontrakTotal)}
                                        {item.hasProgress ? ` · Fisik ${item.progress}%` : ''}
                                    </p>
                                    {(item.batal > 0 || item.belumBerkontrak > 0) && (
                                        <p className='text-[11px] text-muted-foreground tabular-nums'>
                                            {formatNumber(item.count)} paket
                                            {item.batal > 0 ? ` · ${formatNumber(item.batal)} batal` : ''}
                                            {item.belumBerkontrak > 0
                                                ? ` · ${formatNumber(item.belumBerkontrak)} blm kontrak`
                                                : ''}
                                        </p>
                                    )}
                                </div>
                                {serapan !== null ? (
                                    <div className='-ml-0.5 flex flex-col gap-2 px-1'>
                                        <div>
                                            <div className='mb-1 flex items-center justify-between text-[11px] text-muted-foreground'>
                                                <span className='leading-none'>Serapan SP2D</span>
                                                <span className='leading-none tabular-nums'>
                                                    {serapan.toFixed(1)}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={serapan}
                                                className={cn('h-2', BAR_TONES[index % BAR_TONES.length])}
                                            />
                                        </div>
                                        {item.hasProgress ? (
                                            <div>
                                                <div className='mb-1 flex items-center justify-between text-[11px] text-muted-foreground'>
                                                    <span className='leading-none'>Realisasi fisik (estimasi)</span>
                                                    <span className='leading-none tabular-nums'>
                                                        {item.progress}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={item.progress}
                                                    className='h-2 [&_[data-slot=progress-indicator]]:bg-emerald-500'
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                ) : (
                                    <p className='px-1 text-[11px] text-muted-foreground'>
                                        Belum ada kontrak — serapan menyusul.
                                    </p>
                                )}
                            </div>
                        </section>
                    )
                })}
            </CardContent>
        </Card>
    )
}
