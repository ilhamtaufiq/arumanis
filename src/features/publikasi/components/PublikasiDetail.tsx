import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
    ArrowLeft,
    Calendar,
    Clock,
    Lock,
    ShieldAlert,
    Tag,
} from 'lucide-react'
import { getPublikasiDetail, type PublikasiPost } from '../api'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-stores'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import {
    estimateReadingTime,
    formatPublikasiDate,
    getCoverImage,
} from '../lib/format'
import { PublikasiContent } from './PublikasiContent'

type PublikasiDetailProps = {
    slug: string
}

export function PublikasiDetail({ slug }: PublikasiDetailProps) {
    const { auth } = useAuthStore()
    const { logoUrl } = useAppSettingsValues()
    const progressRef = useRef<HTMLDivElement>(null)

    const { data, isLoading } = useQuery({
        queryKey: ['publikasi', slug],
        queryFn: () => getPublikasiDetail(slug),
    })

    const post = data as PublikasiPost | undefined

    useEffect(() => {
        let ticking = false

        const updateProgress = () => {
            ticking = false
            const bar = progressRef.current
            if (!bar) return

            const totalScrollable =
                document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent =
                totalScrollable > 0
                    ? Math.min(1, Math.max(0, window.scrollY / totalScrollable))
                    : 0

            bar.style.transform = `scaleX(${scrollPercent})`
        }

        const handleScroll = () => {
            if (ticking) return
            ticking = true
            requestAnimationFrame(updateProgress)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        updateProgress()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (isLoading) {
        return <DetailSkeleton />
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Publikasi tidak ditemukan</h2>
                <p className="max-w-md text-sm text-muted-foreground">
                    Artikel mungkin telah dihapus atau slug tidak valid.
                </p>
                <Link to="/publikasi">
                    <Button variant="outline" className="rounded-full">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Publikasi
                    </Button>
                </Link>
            </div>
        )
    }

    if (post.is_internal && !auth.user) {
        return <InternalGate />
    }

    const readingTime = estimateReadingTime(post.content)
    const publishedDate = formatPublikasiDate(post.published_at)

    return (
        <>
            <div
                className="pointer-events-none fixed inset-x-0 top-16 z-40 h-0.5 overflow-hidden bg-border/40"
                aria-hidden
            >
                <div
                    ref={progressRef}
                    className="h-full w-full origin-left bg-primary will-change-transform"
                    style={{ transform: 'scaleX(0)' }}
                />
            </div>

            <article className="animate-in fade-in duration-700">
                <div className="mb-8">
                    <Link
                        to="/publikasi"
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke daftar publikasi
                    </Link>
                </div>

                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
                    <div className="min-w-0 space-y-8">
                        <header className="space-y-5">
                            <div className="flex flex-wrap items-center gap-2">
                                {post.category ? (
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-primary/20 bg-primary/5 text-[10px] font-semibold uppercase tracking-wider text-primary"
                                    >
                                        <Tag className="mr-1.5 h-3 w-3" />
                                        {post.category}
                                    </Badge>
                                ) : null}
                                {post.is_internal ? (
                                    <Badge variant="secondary" className="rounded-full text-[10px] uppercase">
                                        <Lock className="mr-1 h-3 w-3" />
                                        Internal
                                    </Badge>
                                ) : null}
                            </div>

                            <h1 className="text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {publishedDate}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    {readingTime} menit baca
                                </span>
                            </div>
                        </header>

                        {post.cover_image ? (
                            <div className="overflow-hidden rounded-3xl border border-border/70 bg-muted shadow-sm">
                                <img
                                    src={getCoverImage(post.cover_image, logoUrl)}
                                    alt={post.title}
                                    className="aspect-[16/9] w-full object-cover"
                                />
                            </div>
                        ) : null}

                        <PublikasiContent html={post.content} />

                        <footer className="border-t border-border/70 pt-10">
                            <Link
                                to="/publikasi"
                                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-all hover:gap-3"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Lihat arsip publikasi
                            </Link>
                        </footer>
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                Penulis
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-bold">
                                    {post.user.avatar ? (
                                        <img
                                            src={post.user.avatar}
                                            alt={post.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        post.user.name.charAt(0)
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{post.user.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {post.user.jabatan || 'Tim Publikasi'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-muted/30 p-5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                Ringkasan
                            </p>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-muted-foreground">Kategori</dt>
                                    <dd className="text-right font-medium">{post.category || '—'}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-muted-foreground">Tanggal</dt>
                                    <dd className="text-right font-medium">{publishedDate}</dd>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="text-muted-foreground">Durasi baca</dt>
                                    <dd className="text-right font-medium">{readingTime} menit</dd>
                                </div>
                            </dl>
                        </div>
                    </aside>
                </div>
            </article>
        </>
    )
}

function InternalGate() {
    return (
        <div className="mx-auto max-w-lg py-20 text-center animate-in fade-in duration-500">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldAlert className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Konten Khusus Internal</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Artikel ini hanya dapat diakses oleh personil yang telah login ke sistem Arumanis.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/sign-in">
                    <Button className="rounded-full px-6">Login Sekarang</Button>
                </Link>
                <Link to="/publikasi">
                    <Button variant="outline" className="rounded-full px-6">
                        Kembali ke Publikasi
                    </Button>
                </Link>
            </div>
        </div>
    )
}

function DetailSkeleton() {
    return (
        <div className="mx-auto max-w-4xl space-y-8 py-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="aspect-[16/9] w-full rounded-3xl" />
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
    )
}