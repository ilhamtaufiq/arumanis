import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock } from 'lucide-react'
import { getPublikasi } from '@/features/publikasi/api'
import { formatPublikasiDate, getCoverImage, getExcerpt } from '@/features/publikasi/lib/format'
import { usePublicLocale } from '../i18n/use-public-locale'

const LANDING_LOGO_FALLBACK = '/arumanis.svg'

export function LandingPublicationsPreview() {
    const { messages } = usePublicLocale()
    const copy = messages.landing.publications

    const { data, isLoading } = useQuery({
        queryKey: ['publikasi', 'landing-preview'],
        queryFn: () => getPublikasi({ published: true, page: 1 }),
        staleTime: 60_000,
    })

    const posts = useMemo(() => {
        return (data?.data ?? [])
            .filter((post) => post.is_published && !post.is_internal)
            .slice(0, 3)
    }, [data])

    if (isLoading) {
        return (
            <p className="mt-8 text-sm text-white/55" role="status">
                {copy.loading}
            </p>
        )
    }

    if (posts.length === 0) {
        return (
            <p className="mt-8 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
                {copy.empty}
            </p>
        )
    }

    return (
        <div className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">
                    {copy.recentLabel}
                </span>
                <Link
                    to="/publikasi"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 transition-colors hover:text-white"
                >
                    {copy.viewAll}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <article
                        key={post.id}
                        className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:border-white/20 hover:bg-white/[0.07]"
                    >
                        <Link
                            to="/publikasi/$slug"
                            params={{ slug: post.slug }}
                            className="relative block aspect-[16/10] shrink-0 overflow-hidden bg-slate-900/60"
                        >
                            <img
                                src={getCoverImage(post.cover_image, LANDING_LOGO_FALLBACK)}
                                alt=""
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                            {post.category ? (
                                <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-sm">
                                    {post.category}
                                </span>
                            ) : null}
                        </Link>
                        <div className="flex flex-1 flex-col gap-2 p-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                <Clock className="h-3 w-3" aria-hidden />
                                {formatPublikasiDate(post.published_at, 'short')}
                            </div>
                            <Link to="/publikasi/$slug" params={{ slug: post.slug }} className="block min-w-0">
                                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-white">
                                    {post.title}
                                </h3>
                                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/55">
                                    {getExcerpt(post.content, 90)}
                                </p>
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}