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
            <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm backdrop-blur-sm sm:p-10 lg:p-12">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                    <div className="space-y-5">
                        <Badge
                            variant="outline"
                            className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary"
                        >
                            Kanal Informasi Publik
                        </Badge>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                Arumanis{' '}
                                <span className="bg-linear-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                                    Publikasi
                                </span>
                            </h1>
                            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                Berita, dokumentasi, dan informasi publik seputar pembangunan infrastruktur
                                air minum dan sanitasi Kabupaten Cianjur.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:max-w-md lg:ml-auto">
                        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Artikel
                            </p>
                            <p className="mt-1 text-2xl font-bold">{publishedPosts.length}</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Kategori
                            </p>
                            <p className="mt-1 text-2xl font-bold">{PUBLIKASI_CATEGORIES.length}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative max-w-xl flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Cari judul atau topik publikasi..."
                            className="h-11 rounded-full border-border/70 bg-card pl-10"
                        />
                    </div>

                    {(selectedCategory || query) && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
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
                            'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
                            !selectedCategory
                                ? 'border-primary/30 bg-primary/10 text-primary'
                                : 'border-border/70 bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground',
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
                                'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
                                selectedCategory === category
                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                    : 'border-border/70 bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground',
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
                            <div className="flex items-end justify-between gap-4 border-b border-border/70 pb-4">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                        Arsip
                                    </p>
                                    <h2 className="mt-1 text-2xl font-bold tracking-tight">
                                        {selectedCategory ? `Kategori ${selectedCategory}` : 'Publikasi Terbaru'}
                                    </h2>
                                </div>
                                <p className="text-sm text-muted-foreground">
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
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <Link
                    to="/publikasi/$slug"
                    params={{ slug: post.slug }}
                    className="group relative block min-h-[280px] overflow-hidden bg-muted lg:min-h-[420px]"
                >
                    <img
                        src={getCoverImage(post.cover_image, logoUrl)}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent" />
                    <div className="absolute left-5 top-5 flex items-center gap-2">
                        <Badge className="rounded-full border-0 bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                            Artikel Utama
                        </Badge>
                        {post.is_internal ? (
                            <Badge variant="secondary" className="rounded-full bg-background/90 backdrop-blur-sm">
                                <Lock className="mr-1 h-3 w-3" />
                                Internal
                            </Badge>
                        ) : null}
                    </div>
                </Link>

                <div className="flex flex-col justify-center gap-5 p-7 sm:p-9 lg:p-10">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>{post.category || 'Publikasi'}</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>{formatPublikasiDate(post.published_at)}</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {readingTime} menit baca
                        </span>
                    </div>

                    <Link to="/publikasi/$slug" params={{ slug: post.slug }}>
                        <h2 className="text-2xl font-bold leading-tight tracking-tight transition-colors hover:text-primary sm:text-3xl lg:text-4xl">
                            {post.title}
                        </h2>
                    </Link>

                    <p className="line-clamp-4 text-base leading-relaxed text-muted-foreground">
                        {getExcerpt(post.content, 220)}
                    </p>

                    {post.user?.jabatan ? (
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                            {post.user.jabatan}
                        </p>
                    ) : null}

                    <Link
                        to="/publikasi/$slug"
                        params={{ slug: post.slug }}
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-all hover:gap-3"
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
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/50 px-6 py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Newspaper className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
                {hasFilters ? 'Tidak ada publikasi yang cocok' : 'Belum ada publikasi'}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {hasFilters
                    ? 'Coba ubah kata kunci pencarian atau pilih kategori lain.'
                    : 'Konten publikasi akan ditampilkan di sini setelah diterbitkan oleh tim redaksi.'}
            </p>
            {hasFilters ? (
                <Button variant="outline" className="mt-6 rounded-full" onClick={onReset}>
                    Tampilkan semua publikasi
                </Button>
            ) : null}
        </div>
    )
}