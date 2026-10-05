import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
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

function serapanPersen(item: SubKegiatanStat): number {
    const denom = item.kontrakTotal > 0 ? item.kontrakTotal : item.paguM * 1000000
    if (denom > 0 && item.sp2dTotal >= 0) {
        return Math.min(100, (item.sp2dTotal / denom) * 100)
    }
    return 0
}

function pekerjaanMatchesTag(p: Pekerjaan, tagFilter: string): boolean {
    if (tagFilter === 'all') return true

    const filterLower = tagFilter.toLowerCase()

    if (p.tags && Array.isArray(p.tags) && p.tags.length > 0) {
        return p.tags.some((tag) => {
            const name = (tag.name || '').toLowerCase()
            const slug = (tag.slug || '').toLowerCase()
            if (filterLower === 'pokir') return name.includes('pokir') || slug.includes('pokir')
            if (filterLower === 'perubahan') return name.includes('perubahan') || slug.includes('perubahan')
            if (filterLower === 'rembug_warga')
                return (
                    name.includes('rembug') ||
                    name.includes('warga') ||
                    slug.includes('rembug') ||
                    slug.includes('warga')
                )
            return name.includes(filterLower) || slug.includes(filterLower)
        })
    }

    const catText = (p.catatan || '').toLowerCase()
    const pkgText = (p.nama_paket || '').toLowerCase()
    if (filterLower === 'pokir') return catText.includes('pokir') || pkgText.includes('pokir')
    if (filterLower === 'perubahan') return catText.includes('perubahan') || pkgText.includes('perubahan')
    if (filterLower === 'rembug_warga')
        return (
            catText.includes('rembug') ||
            catText.includes('warga') ||
            pkgText.includes('rembug') ||
            pkgText.includes('warga')
        )

    return false
}

function computeSubKegiatanStatsFromPekerjaan(pekerjaanList: Pekerjaan[], tagFilter: string): SubKegiatanStat[] {
    const filtered = pekerjaanList.filter((p) => pekerjaanMatchesTag(p, tagFilter))
    const map = new Map<
        string,
        {
            count: number
            pagu: number
            sp2dTotal: number
            kontrakTotal: number
            progressSum: number
            progressCount: number
            batal: number
            belumBerkontrak: number
        }
    >()

    for (const p of filtered) {
        const subKegName = p.kegiatan?.nama_sub_kegiatan || 'Lainnya'
        const existing = map.get(subKegName) || {
            count: 0,
            pagu: 0,
            sp2dTotal: 0,
            kontrakTotal: 0,
            progressSum: 0,
            progressCount: 0,
            batal: 0,
            belumBerkontrak: 0,
        }

        const isCanceled = p.status === 'canceled'
        const hasKontrak = Boolean(p.has_kontrak || (p.kontrak && p.kontrak.length > 0))
        const nilKontrak = p.kontrak?.reduce((acc, k) => acc + (k.nilai_kontrak ?? 0), 0) ?? 0
        const sp2d = p.progress_estimasi_keuangan_nilai ?? 0
        const progFisik = p.progress_estimasi_fisik ?? p.progress_total ?? null

        existing.count += 1
        existing.pagu += p.pagu ?? 0
        existing.sp2dTotal += sp2d
        existing.kontrakTotal += nilKontrak

        if (isCanceled) {
            existing.batal += 1
        } else if (!hasKontrak) {
            existing.belumBerkontrak += 1
        }

        if (progFisik !== null && !isCanceled) {
            existing.progressSum += progFisik
            existing.progressCount += 1
        }

        map.set(subKegName, existing)
    }

    const result: SubKegiatanStat[] = []
    for (const [name, stat] of map.entries()) {
        result.push({
            name,
            count: stat.count,
            paguM: Number((stat.pagu / 1_000_000).toFixed(2)),
            sp2dTotal: stat.sp2dTotal,
            kontrakTotal: stat.kontrakTotal,
            progress: stat.progressCount > 0 ? Number((stat.progressSum / stat.progressCount).toFixed(1)) : 0,
            hasProgress: true,
            batal: stat.batal,
            belumBerkontrak: stat.belumBerkontrak,
        })
    }

    return result.sort((a, b) => b.sp2dTotal - a.sp2dTotal)
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
    const { tahunAnggaran } = useAppSettingsValues()
    const [tagFilter, setTagFilter] = useState<string>('all')

    const { data: pekerjaanResponse, isLoading: isPekerjaanLoading } = useQuery({
        queryKey: ['sub-kegiatan-pekerjaan-tags', tahunAnggaran],
        queryFn: () => getPekerjaan({ tahun: tahunAnggaran, status: 'all', per_page: 1000 }),
        enabled: tagFilter !== 'all',
        staleTime: 60_000,
    })

    const filteredItems =
        tagFilter === 'all'
            ? items
            : computeSubKegiatanStatsFromPekerjaan(pekerjaanResponse?.data ?? [], tagFilter)

    const loadingState = isLoading || (tagFilter !== 'all' && isPekerjaanLoading)

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

    if (loadingState) {
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
                                    ? `Belum ada paket pekerjaan dengan tag "${tagFilter === 'pokir' ? 'Pokir' : tagFilter === 'perubahan' ? 'Perubahan' : 'Rembug Warga'}".`
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
                                {serapan !== null && (
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
                                )}
                            </div>
                        </section>
                    )
                })}
            </CardContent>
        </Card>
    )
}
