import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch as useRouterSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Home, Loader2, MapPin, Mic, Search as SearchIcon, X } from 'lucide-react'
import api from '@/lib/api-client'
import { useDebounce } from '@/hooks/use-debounce'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

type SearchResult = {
    id: number
    type: string
    title: string
    subtitle?: string
    url: string
    penyedia?: string
    nilai?: number
    image_url?: string
    map_url?: string
    tahun?: number | string | null
}

type SearchTab = {
    id: string
    label: string
    match: (item: SearchResult) => boolean
}

const YEARS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020']
const LOGO_COL = 'md:w-[134px] md:shrink-0'
const MAIN_COL = 'w-full min-w-0 md:max-w-[692px]'

const SEARCH_TABS: SearchTab[] = [
    { id: 'Semua', label: 'Semua', match: () => true },
    { id: 'Kontrak', label: 'Kontrak', match: (item) => item.type === 'Kontrak' },
    { id: 'Dokumentasi', label: 'Gambar', match: (item) => item.type === 'Dokumentasi' },
    { id: 'Penerima Manfaat', label: 'Penerima Manfaat', match: (item) => item.type === 'Penerima Manfaat' },
    { id: 'Output', label: 'Output', match: (item) => item.type === 'Output' },
    { id: 'Progress', label: 'Progress', match: (item) => item.type === 'Progress' },
]

function YearSelect({ value, onChange, className }: { value: string; onChange: (year: string) => void; className?: string }) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="hidden text-xs text-[#70757a] dark:text-muted-foreground sm:inline">Tahun</span>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="h-9 w-[100px] rounded-full border-border/60 bg-background">
                    <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                    {YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

export function GoogleSearchPage() {
    const navigate = useNavigate()
    const searchParams = useRouterSearch({ from: '/search' })
    const initialQuery = searchParams.q || ''

    const [searchQuery, setSearchQuery] = useState(initialQuery)
    const [selectedYear, setSelectedYear] = useState(searchParams.tahun || new Date().getFullYear().toString())
    const [activeTab, setActiveTab] = useState('Semua')
    const debouncedQuery = useDebounce(searchQuery, 300)
    const hasQuery = searchQuery.trim().length > 0

    useEffect(() => {
        if (searchParams.tahun && searchParams.tahun !== selectedYear) {
            setSelectedYear(searchParams.tahun)
        }
    }, [searchParams.tahun])

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            navigate({
                to: '/search',
                search: { tahun: selectedYear },
                replace: true,
            })
            return
        }

        navigate({
            to: '/search',
            search: { q: debouncedQuery, tahun: selectedYear },
            replace: true,
        })
    }, [debouncedQuery, selectedYear, navigate])

    const handleYearChange = useCallback(
        (year: string) => {
            setSelectedYear(year)
            navigate({
                to: '/search',
                search: debouncedQuery.trim()
                    ? { q: debouncedQuery, tahun: year }
                    : { tahun: year },
                replace: true,
            })
        },
        [debouncedQuery, navigate],
    )

    const { data: searchResults = [], isLoading, isFetching } = useQuery({
        queryKey: ['global-search', debouncedQuery, selectedYear],
        queryFn: async () => {
            if (!debouncedQuery.trim()) return [] as SearchResult[]
            const res = await api.get<{ success: boolean; data: SearchResult[] }>('/search', {
                params: { q: debouncedQuery, tahun: selectedYear },
            })
            return res.data || []
        },
        enabled: debouncedQuery.trim().length > 0,
    })

    const activeTabConfig = SEARCH_TABS.find((tab) => tab.id === activeTab) ?? SEARCH_TABS[0]
    const filteredResults = useMemo(
        () => searchResults.filter(activeTabConfig.match),
        [searchResults, activeTabConfig],
    )
    const isImageTab = activeTab === 'Dokumentasi'

    const openResult = useCallback(
        (url: string) => {
            navigate({ to: url })
        },
        [navigate],
    )

    if (!hasQuery) {
        return (
            <div className="relative flex min-h-screen flex-col items-center bg-background px-4 pb-24 pt-[12vh]">
                <div className="absolute right-4 top-4 md:right-8 md:top-6">
                    <YearSelect value={selectedYear} onChange={handleYearChange} />
                </div>

                <button type="button" onClick={() => setSearchQuery('')} className="mb-6">
                    <img src="/arumanis.svg" alt="Arumanis" className="h-[92px] w-auto md:h-[120px]" fetchPriority="high" />
                </button>

                <div className="relative w-full max-w-[584px]">
                    <div className="flex h-[46px] items-center rounded-full border border-border/60 bg-background px-4 shadow-sm hover:shadow-md focus-within:shadow-md">
                        <SearchIcon className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Telusuri Arumanis atau ketik URL"
                            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                            autoFocus
                        />
                        <Mic className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
                    </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        className="rounded border border-transparent bg-muted/80 px-4 py-2 text-sm text-foreground hover:border-border/60 hover:bg-muted"
                        onClick={() => navigate({ to: '/dashboard' })}
                    >
                        Kembali ke Aplikasi
                    </button>
                    <button
                        type="button"
                        className="rounded border border-transparent bg-muted/80 px-4 py-2 text-sm text-foreground hover:border-border/60 hover:bg-muted"
                        onClick={() => setSearchQuery('Desa')}
                    >
                        Saya Beruntung
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* ── Google SERP header: logo kiri | search + tabs kanan ── */}
            <header className="sticky top-0 z-20 border-b border-border/50 bg-background">
                <div className="flex items-start gap-0 px-4 pt-3 md:pl-8 md:pr-6">
                    <div className={cn(LOGO_COL, 'hidden md:flex items-start pt-2')}>
                        <button type="button" onClick={() => setSearchQuery('')} className="hover:opacity-80">
                            <img src="/arumanis.svg" alt="Arumanis" className="h-[30px] w-auto" />
                        </button>
                    </div>

                    <div className={cn(MAIN_COL, 'flex-1')}>
                        <div className="mb-2 flex items-center gap-3 md:hidden">
                            <button type="button" onClick={() => setSearchQuery('')}>
                                <img src="/arumanis.svg" alt="Arumanis" className="h-7 w-auto" />
                            </button>
                        </div>

                        <div className="relative min-w-0">
                            <div className="flex h-11 items-center rounded-full border border-border/60 bg-background px-4 shadow-sm hover:shadow-md focus-within:shadow-md">
                                <SearchIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent text-base outline-none"
                                />
                                {searchQuery ? (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-muted"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        <nav className="-mb-px mt-1 flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {SEARCH_TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'shrink-0 border-b-[3px] px-1 pb-3 pt-3 text-sm transition-colors',
                                        activeTab === tab.id
                                            ? 'border-[#1a73e8] font-medium text-[#1a73e8] dark:border-[#8ab4f8] dark:text-[#8ab4f8]'
                                            : 'border-transparent text-[#5f6368] hover:text-foreground dark:text-muted-foreground',
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="ml-auto flex shrink-0 items-center gap-2 self-start pl-4 pt-1">
                        <YearSelect value={selectedYear} onChange={handleYearChange} />
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate({ to: '/dashboard' })} title="Kembali ke Dashboard">
                            <Home className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* ── Hasil: kolom kiri kosong (sejajar logo) + konten ── */}
            <main className="flex px-4 pb-16 md:pl-8 md:pr-6">
                <div className={cn(LOGO_COL, 'hidden md:block')} aria-hidden />

                <div className={cn(MAIN_COL, isImageTab && 'md:max-w-none')}>
                    <div className="py-4 text-sm text-[#70757a] dark:text-muted-foreground">
                        {isLoading || isFetching ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Menelusuri...
                            </span>
                        ) : (
                            <span>
                                Sekitar {filteredResults.length} hasil{debouncedQuery ? ` untuk ${debouncedQuery}` : ''}
                                {selectedYear ? ` · ${selectedYear}` : ''}
                            </span>
                        )}
                    </div>

                    {!isLoading && filteredResults.length === 0 ? (
                        <div className="max-w-[600px] text-[15px] leading-relaxed">
                            <p className="text-foreground">
                                Hasil tidak ditemukan untuk <strong>{debouncedQuery}</strong>
                                {activeTab !== 'Semua' ? (
                                    <>
                                        {' '}
                                        di <strong>{activeTabConfig.label}</strong>
                                    </>
                                ) : null}
                                .
                            </p>
                            <p className="mt-4 text-sm text-[#70757a] dark:text-muted-foreground">Saran:</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#70757a] dark:text-muted-foreground">
                                <li>Pastikan semua kata dieja dengan benar.</li>
                                <li>Coba kata kunci yang berbeda.</li>
                                <li>Coba tab <strong>Semua</strong>.</li>
                            </ul>
                        </div>
                    ) : null}

                    <div
                        className={cn(
                            isImageTab
                                ? 'grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                : 'flex max-w-[600px] flex-col gap-7',
                        )}
                    >
                        {filteredResults.map((item, index) => (
                            <GoogleResultItem
                                key={`${item.type}-${item.id}-${index}`}
                                item={item}
                                variant={isImageTab ? 'image' : 'web'}
                                onOpen={openResult}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}

function GoogleResultItem({
    item,
    variant,
    onOpen,
}: {
    item: SearchResult
    variant: 'web' | 'image'
    onOpen: (url: string) => void
}) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const displayUrl = `${origin}${item.url}`
    const snippet = buildSnippet(item)

    if (variant === 'image') {
        return (
            <div className="group">
                <button
                    type="button"
                    className="mb-2 block w-full overflow-hidden rounded-lg bg-muted"
                    onClick={() => onOpen(item.url)}
                >
                    <div className="aspect-square w-full">
                        {item.image_url ? (
                            <img
                                src={item.image_url}
                                alt={item.title}
                                className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Tanpa gambar</div>
                        )}
                    </div>
                </button>
                <a
                    href={item.url}
                    onClick={(e) => {
                        e.preventDefault()
                        onOpen(item.url)
                    }}
                    className="line-clamp-2 text-left text-[13px] leading-snug text-[#bdc1c6] hover:underline"
                >
                    {item.title}
                </a>
                {item.subtitle ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-[#9aa0a6]">{item.subtitle}</p>
                ) : null}
            </div>
        )
    }

    return (
        <article className={cn('max-w-[600px]', item.image_url && 'flex gap-4')}>
            {item.image_url ? (
                <a
                    href={item.url}
                    onClick={(e) => {
                        e.preventDefault()
                        onOpen(item.url)
                    }}
                    className="block h-[92px] w-[92px] shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                    <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                </a>
            ) : null}

            <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                        <img src="/arumanis.svg" alt="" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 truncate text-sm leading-none">
                        <span className="text-foreground">Arumanis</span>
                        <span className="text-[#5f6368] dark:text-muted-foreground">
                            {' '}
                            › {item.type} › <span className="truncate">{item.url}</span>
                        </span>
                    </div>
                </div>

                <a
                    href={item.url}
                    onClick={(e) => {
                        e.preventDefault()
                        onOpen(item.url)
                    }}
                    className="block text-left text-xl leading-[1.3] text-[#1a0dab] visited:text-[#681da8] hover:underline dark:text-[#8ab4f8] dark:visited:text-[#c58af9]"
                >
                    {item.title}
                </a>

                <p className="mt-1 line-clamp-2 text-sm leading-[1.58] text-[#4d5156] dark:text-[#bdc1c6]">
                    {snippet || displayUrl}
                </p>

                {item.map_url ? (
                    <a
                        href={item.map_url}
                        onClick={(e) => {
                            e.preventDefault()
                            onOpen(item.map_url!)
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-sm text-[#1a0dab] hover:underline dark:text-[#8ab4f8]"
                    >
                        <MapPin className="h-3.5 w-3.5" />
                        Lihat di peta
                    </a>
                ) : null}
            </div>
        </article>
    )
}

function buildSnippet(item: SearchResult) {
    if (item.type === 'Kontrak') {
        const parts = [item.subtitle, item.penyedia, item.nilai != null ? formatCurrency(item.nilai) : null].filter(Boolean)
        return parts.join(' · ')
    }

    return item.subtitle ?? ''
}