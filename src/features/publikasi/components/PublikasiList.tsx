import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowRight, Clock, Lock, Newspaper, Search, Sparkles, X } from 'lucide-react'
import { PublikasiCard } from './PublikasiCard'
import { getPublikasi, type PublikasiPost } from '../api'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-stores'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
    estimateReadingTime,
    formatPublikasiDate,
    getCoverImage,
    getExcerpt,
    PUBLIKASI_CATEGORIES,
} from '../lib/format'

export function PublikasiList() {
    const { auth } = useAuthStore()
    const { logoUrl } = useAppSettingsValues()
    const { category: selectedCategory } = useSearch({ from: '/publikasi' })
    const navigate = useNavigate({ from: '/publikasi' })
    const [query, setQuery] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['publikasi'],
        queryFn: () => getPublikasi(),
    })

    const allPosts = data?.data || []

    const publishedPosts = useMemo(() => {
        let posts = allPosts.filter((post) => post.is_published)
        if (!auth.user) {
            posts = posts.filter((post) => !post.is_internal)
        }
        return posts
    }, [allPosts, auth.user])

    const posts = useMemo(() => {
        let filtered = publishedPosts

        if (selectedCategory) {
            filtered = filtered.filter((post) => post.category === selectedCategory)
        }

        const normalizedQuery = query.trim().toLowerCase()
        if (normalizedQuery) {
            filtered = filtered.filter((post) => {
                const haystack = `${post.title} ${post.category || ''} ${getExcerpt(post.content, 500)}`.toLowerCase()
                return haystack.includes(normalizedQuery)
            })
        }

        return filtered
    }, [publishedPosts, query, selectedCategory])

    const featuredPost =
        posts.find((post) => post.is_featured) ?? (posts.length > 0 ? posts[0] : null)
    const regularPosts = featuredPost
        ? posts.filter((post) => post.id !== featuredPost.id)
        : posts

    const categoryCounts = useMemo(() => {
        const counts = new Map<string, number>()
        for (const category of PUBLIKASI_CATEGORIES) {
            counts.set(
                category,
                publishedPosts.filter((post) => post.category === category).length,
            )
        }
        return counts
    }, [publishedPosts])

    const clearFilters = () => {
        setQuery('')
        navigate({ search: {} })
    }

    return (
        <div className="space-y-14 animate-in fade-in duration-700">
            <section className="relative overflow-hidden rounded-sm border-2 border-[#1C1C1C] bg-[#FF9CBA]/20 p-8 brutal-shadow sm:p-10 lg:p-12">
                <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        backgroundImage: 'radial-gradient(#1C1C1C 1.5px, transparent 1.5px)',
                        backgroundSize: '28px 28px',
                    }}
                />
                <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                    <div className="space-y-5">
                        <Badge
                            className="rounded-sm border-2 border-[#1C1C1C] bg-[#FCE954] brutal-shadow px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#1C1C1C]"
                        >
                            Kanal Informasi Publik
                        </Badge>
                        <div className="space-y-3">
                            <h1 className="font-display text-3xl font-bold tracking-tight text-[#1C1C1C] sm:text-4xl lg:text-5xl">
                                Arumanis{' '}
                                <span className="bg-[#FCE954] px-1">Publikasi</span>
                            </h1>
                            <p className="max-w-2xl text-base leading-relaxed text-[#1C1C1C]/75 sm:text-lg">
                                Berita, dokumentasi, dan informasi publik seputar pembangunan infrastruktur
                                air minum dan sanitasi Kabupaten Cianjur.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:max-w-md lg:ml-auto">
                        <div className="rounded-sm border-2 border-[#1C1C1C] bg-white p-4 brutal-shadow">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1C1C1C]/60">
                                Artikel
                            </p>
                            <p className="mt-1 text-2xl font-bold text-[#1C1C1C]">{publishedPosts.length}</p>
                        </div>
                        <div className="rounded-sm border-2 border-[#1C1C1C] bg-white p-4 brutal-shadow">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1C1C1C]/60">
                                Kategori
                            </p>
                            <p className="mt-1 text-2xl font-bold text-[#1C1C1C]">{PUBLIKASI_CATEGORIES.length}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative max-w-xl flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1C1C1C]/50" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Cari judul atau topik publikasi..."
                            className="h-11 rounded-sm border-2 border-[#1C1C1C] bg-white pl-10 text-[#1C1C1C] focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>

                    {(selectedCategory || query) && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-sm border-2 border-[#1C1C1C] bg-white brutal-shadow text-[#1C1C1C]"
                            onClick={clearFilters}
                        >
                            <X className="mr-2 h-3.5 w-3.5" />
                            Reset filter
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/publikasi"
                        search={{}}
                        className={cn(
                            'rounded-sm border-2 border-[#1C1C1C] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-transform',
                            !selectedCategory
                                ? 'bg-[#FCE954] brutal-shadow'
                                : 'bg-white text-[#1C1C1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                        )}
                    >
                        Semua ({publishedPosts.length})
                    </Link>
                    {PUBLIKASI_CATEGORIES.map((category) => (
                        <Link
                            key={category}
                            to="/publikasi"
                            search={{ category }}
                            className={cn(
                                'rounded-sm border-2 border-[#1C1C1C] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-transform',
                                selectedCategory === category
                                    ? 'bg-[#FCE954] brutal-shadow'
                                    : 'bg-white text-[#1C1C1C] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
                            )}
                        >
                            {category} ({categoryCounts.get(category) || 0})
                        </Link>
                    ))}
                </div>
            </section>

            {isLoading ? (
                <LoadingState />
            ) : posts.length > 0 ? (
                <div className="space-y-14">
                    {featuredPost ? <FeaturedPost post={featuredPost} logoUrl={logoUrl} /> : null}

                    {regularPosts.length > 0 ? (
                        <section className="space-y-8">
                            <div className="flex items-end justify-between gap-4 border-b-2 border-[#1C1C1C]/15 pb-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#1C1C1C]/60">
                                        Arsip
                                    </p>
                                    <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#1C1C1C]">
                                        {selectedCategory ? `Kategori ${selectedCategory}` : 'Publikasi Terbaru'}
                                    </h2>
                                </div>
                                <p className="text-sm text-[#1C1C1C]/60">
                                    {regularPosts.length} artikel
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {regularPosts.map((post: PublikasiPost) => (
                                    <PublikasiCard key={post.id} {...post} />
                                ))}
                            </div>
                        </section>
                    ) : null}
                </div>
            ) : (
                <EmptyState hasFilters={Boolean(selectedCategory || query)} onReset={clearFilters} />
            )}
        </div>
    )
}

function FeaturedPost({ post, logoUrl }: { post: PublikasiPost; logoUrl?: string | null }) {
    const readingTime = estimateReadingTime(post.content)

    return (
        <section className="overflow-hidden rounded-sm border-2 border-[#1C1C1C] bg-white brutal-shadow">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <Link
                    to="/publikasi/$slug"
                    params={{ slug: post.slug }}
                    className="group relative block min-h-[280px] overflow-hidden border-b-2 border-[#1C1C1C] bg-[#FCE954]/30 lg:min-h-[420px] lg:border-b-0 lg:border-r-2"
                >
                    <img
                        src={getCoverImage(post.cover_image, logoUrl)}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
                    <div className="absolute left-5 top-5 flex items-center gap-2">
                        <Badge className="rounded-sm border-2 border-[#1C1C1C] bg-[#FCE954] text-[#1C1C1C]">
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            Artikel Utama
                        </Badge>
                        {post.is_internal ? (
                            <Badge className="rounded-sm border-2 border-[#1C1C1C] bg-[#9B72CF] text-white">
                                <Lock className="mr-1 h-3 w-3" />
                                Internal
                            </Badge>
                        ) : null}
                    </div>
                </Link>

                <div className="flex flex-col justify-center gap-5 p-7 sm:p-9 lg:p-10">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#1C1C1C]/60">
                        <span>{post.category || 'Publikasi'}</span>
                        <span className="h-1 w-1 rounded-full bg-[#1C1C1C]/30" />
                        <span>{formatPublikasiDate(post.published_at)}</span>
                        <span className="h-1 w-1 rounded-full bg-[#1C1C1C]/30" />
                        <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {readingTime} menit baca
                        </span>
                    </div>

                    <Link to="/publikasi/$slug" params={{ slug: post.slug }}>
                        <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-[#1C1C1C] transition-colors hover:text-[#9B72CF] sm:text-3xl lg:text-4xl">
                            {post.title}
                        </h2>
                    </Link>

                    <p className="line-clamp-4 text-base leading-relaxed text-[#1C1C1C]/70">
                        {getExcerpt(post.content, 220)}
                    </p>

                    {post.user?.jabatan ? (
                        <p className="text-xs font-bold uppercase tracking-wider text-[#9B72CF]">
                            {post.user.jabatan}
                        </p>
                    ) : null}

                    <Link
                        to="/publikasi/$slug"
                        params={{ slug: post.slug }}
                        className="brutal-btn inline-flex w-fit items-center gap-2 rounded-sm px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em]"
                    >
                        Baca selengkapnya
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

function LoadingState() {
    return (
        <div className="space-y-10">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <Skeleton className="min-h-[320px] rounded-3xl" />
                <div className="space-y-4 p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-40 rounded-full" />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-80 rounded-2xl" />
                ))}
            </div>
        </div>
    )
}

function EmptyState({
    hasFilters,
    onReset,
}: {
    hasFilters: boolean
    onReset: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#1C1C1C]/50 bg-white/50 px-6 py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-sm border-2 border-[#1C1C1C] bg-[#FF9CBA] text-[#1C1C1C]">
                <Newspaper className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight text-[#1C1C1C]">
                {hasFilters ? 'Tidak ada publikasi yang cocok' : 'Belum ada publikasi'}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#1C1C1C]/70">
                {hasFilters
                    ? 'Coba ubah kata kunci pencarian atau pilih kategori lain.'
                    : 'Konten publikasi akan ditampilkan di sini setelah diterbitkan oleh tim redaksi.'}
            </p>
            {hasFilters ? (
                <Button variant="outline" className="mt-6 rounded-sm border-2 border-[#1C1C1C] bg-white brutal-shadow text-[#1C1C1C]" onClick={onReset}>
                    Tampilkan semua publikasi
                </Button>
            ) : null}
        </div>
    )
}