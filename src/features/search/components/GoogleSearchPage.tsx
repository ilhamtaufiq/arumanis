import { useState, useEffect } from 'react'
import { useNavigate, useSearch as useRouterSearch } from '@tanstack/react-router'
import { SearchIcon, X, User, Loader2, Home, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api-client'
import { useDebounce } from '@/hooks/use-debounce'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { streamAISummary } from '../api/minimax'

export function GoogleSearchPage() {
    const navigate = useNavigate()
    const searchParams = useRouterSearch({ strict: false }) as { q?: string }
    const initialQuery = searchParams.q || ''

    const [searchQuery, setSearchQuery] = useState(initialQuery)
    const debouncedQuery = useDebounce(searchQuery, 300)

    // Sync query parameter when searching
    useEffect(() => {
        navigate({
            to: '/search',
            search: debouncedQuery ? { q: debouncedQuery } : undefined,
            replace: true
        })
    }, [debouncedQuery, navigate])

    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['global-search', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return []
            const res = await api.get<{ success: boolean; data: any[] }>(`/search?q=${encodeURIComponent(debouncedQuery)}`)
            return res.data || []
        },
        enabled: debouncedQuery.length > 0,
    })

    // Tab state
    const tabs = ['Semua', 'Kontrak', 'Dokumentasi', 'Penerima Manfaat', 'Output', 'Progress']
    const [activeTab, setActiveTab] = useState('Semua')
    const hasQuery = searchQuery.length > 0

    // AI Overview state
    const [aiSummary, setAiSummary] = useState('')
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [aiError, setAiError] = useState('')
    const [isAiExpanded, setIsAiExpanded] = useState(false)

    // Generate AI Summary only when results change for a valid debounced query
    useEffect(() => {
        let isPristine = true;
        if (searchResults && searchResults.length > 0 && debouncedQuery && hasQuery) {
            const generateSummary = async () => {
                setIsAiLoading(true)
                setAiSummary('')
                setAiError('')
                try {
                    for await (const chunk of streamAISummary(debouncedQuery, searchResults)) {
                        if (isPristine) {
                            setAiSummary(prev => prev + chunk)
                        }
                    }
                } catch (err: any) {
                    if (isPristine) setAiError(err.message)
                } finally {
                    if (isPristine) setIsAiLoading(false)
                }
            }
            generateSummary()
        } else if (searchResults && searchResults.length === 0) {
            setAiSummary('')
            setAiError('')
        }

        return () => {
            isPristine = false;
        }
    }, [searchResults, debouncedQuery, hasQuery])

    const filteredResults = searchResults?.filter((item: any) => {
        if (activeTab === 'Semua') return true;
        if (activeTab === 'Kontrak' && item.type === 'Kontrak') return true;
        if (activeTab === item.type) return true;
        return false;
    }) || [];

    return (
        <div className={`min-h-screen bg-background text-foreground transition-all duration-300 ${!hasQuery ? 'flex flex-col items-center justify-center' : 'flex flex-col'}`}>
            {/* Header / Search Bar Section */}
            <div className={`w-full ${!hasQuery ? 'flex flex-col items-center max-w-2xl px-4' : 'flex items-center gap-6 p-4 md:px-8 border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur z-10'}`}>

                {/* Logo */}
                <div
                    className={`${!hasQuery ? 'mb-8 mt-12' : 'hidden md:flex'} cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0 items-center justify-center`}
                    onClick={() => {
                        setSearchQuery('')
                    }}
                >
                    <img
                        src='/arumanis.svg'
                        alt='Arumanis Logo'
                        className={`${!hasQuery ? 'h-24 md:h-32' : 'h-8 md:h-10'} w-auto transition-all`}
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                    />
                </div>

                <div className={`relative flex items-center w-full ${!hasQuery ? 'max-w-2xl hover:shadow-md transition-shadow rounded-full' : 'max-w-3xl'}`}>
                    <div className="absolute left-4 text-muted-foreground flex items-center h-full">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for Pekerjaan, Kontrak, Penyedia, Kegiatan, Desa..."
                        className="pl-12 pr-12 py-6 rounded-full w-full border-border/50 bg-background shadow-sm hover:border-border focus-visible:ring-1 focus-visible:border-primary/50 text-base"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 text-muted-foreground hover:text-foreground flex items-center h-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {hasQuery && (
                    <div className="ml-auto flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/' })} title="Back to Dashboard">
                            <Home className="w-5 h-5" />
                        </Button>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium hidden md:flex">
                            <User className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            {hasQuery && (
                <div className="w-full flex items-center justify-start px-4 md:px-32 border-b border-border/40 gap-6 mt-2 bg-background sticky top-[72px] md:top-[88px] z-10 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap px-1 border-b-2 ${activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            {/* Empty State / Initial Options */}
            {!hasQuery && (
                <div className="mt-8 flex gap-4">
                    <Button variant="secondary" className="px-6 relative group" onClick={() => navigate({ to: '/' })}>
                        <Home className="w-4 h-4 mr-2" />
                        Back to App
                    </Button>
                    <Button variant="outline" className="px-6" onClick={() => setSearchQuery('Desa')}>
                        I'm Feeling Lucky
                    </Button>
                </div>
            )}

            {/* Search Results */}
            {hasQuery && (
                <div className="w-full max-w-3xl px-4 md:px-32 py-6 flex flex-col gap-8">
                    {/* Stats */}
                    {debouncedQuery && (
                        <div className="text-sm text-muted-foreground">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>tunggu sebentar...</span>
                                </div>
                            ) : filteredResults ? (
                                <span>Menampilkan {filteredResults.length} hasil untuk tab {activeTab}</span>
                            ) : null}
                        </div>
                    )}

                    {/* Results List */}
                    <div className="flex flex-col gap-6">
                        {/* AI Overview Box */}
                        {searchResults && searchResults.length > 0 && (
                            <div className="rounded-2xl border border-primary/20 p-6 bg-gradient-to-br from-primary/5 to-transparent shadow-sm relative overflow-hidden group/ai">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                                    <h3 className="text-lg font-medium text-primary tracking-tight">AI Overview</h3>
                                </div>

                                {aiSummary ? (
                                    <div className="relative flex flex-col items-start">
                                        <div className={`text-foreground/90 leading-relaxed text-[15px] transition-all ${!isAiExpanded ? 'line-clamp-4' : ''}`}>
                                            {aiSummary.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim()}
                                        </div>

                                        {aiSummary.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim().length > 200 && (
                                            <button
                                                onClick={() => setIsAiExpanded(!isAiExpanded)}
                                                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary/80 hover:text-primary transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full"
                                            >
                                                {isAiExpanded ? 'Lihat lebih sedikit' : 'Tampilkan lebih banyak'}
                                            </button>
                                        )}
                                    </div>
                                ) : isAiLoading ? (
                                    <div className="flex flex-col gap-3 mt-4">
                                        <div className="h-3 bg-primary/10 rounded w-full animate-pulse" />
                                        <div className="h-3 bg-primary/10 rounded w-[90%] animate-pulse" />
                                        <div className="h-3 bg-primary/10 rounded w-[60%] animate-pulse" />
                                    </div>
                                ) : aiError ? (
                                    <div className="text-destructive text-sm bg-destructive/10 p-4 rounded-xl flex flex-col gap-1">
                                        <span className="font-semibold">Failed to generate AI Summary</span>
                                        <span className="opacity-80 break-words">{aiError}</span>
                                        <span className="opacity-80 mt-2">Pastikan VITE_MINIMAX_API_KEY sudah diatur di file .env Anda.</span>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {!isLoading && filteredResults?.length === 0 && (
                            <div className="text-foreground">
                                <p>Penelusuran Anda - <strong>{debouncedQuery}</strong> - di tab <strong>{activeTab}</strong> tidak cocok dengan dokumen apa pun.</p>
                                <p className="mt-4 text-muted-foreground text-sm">Saran:</p>
                                <ul className="list-disc pl-6 mt-2 text-muted-foreground text-sm space-y-1">
                                    <li>Pastikan semua kata dieja dengan benar.</li>
                                    <li>Mungkin data untuk kategori ini belum tersedia atau diimplementasikan.</li>
                                    <li>Coba mencari di tab "Semua".</li>
                                </ul>
                            </div>
                        )}

                        {filteredResults?.map((item: any, i: number) => (
                                <div key={`${item.type}-${item.id}-${i}`} className="flex flex-col gap-1 max-w-[600px] group">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                        <div className="flex items-center gap-1.5 break-words">
                                            <span className="font-medium">{item.type}</span>
                                            <span className="text-xs opacity-50">•</span>
                                            <span className="text-xs">{window.location.origin}{item.url}</span>
                                        </div>
                                    </div>
                                    <a
                                        href={item.url}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate({ to: item.url });
                                        }}
                                        className="text-xl text-[#8ab4f8] hover:text-[#c58af9] dark:text-[#8ab4f8] dark:hover:text-[#c58af9] hover:underline cursor-pointer leading-tight font-medium"
                                    >
                                        {item.title}
                                    </a>
                                    {item.subtitle && (
                                        <p className="text-sm text-muted-foreground/80 leading-snug mt-1">
                                            {item.subtitle}
                                        </p>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}
