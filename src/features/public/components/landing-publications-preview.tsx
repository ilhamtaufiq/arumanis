import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock } from 'lucide-react'
import { getPublikasi } from '@/features/publikasi/api'
import { formatPublikasiDate, getExcerpt } from '@/features/publikasi/lib/format'
import { usePublicLocale } from '../i18n/use-public-locale'

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
            <p className="mt-6 text-sm text-white/55" role="status">
                {copy.loading}
            </p>
        )
    }

    if (posts.length === 0) {
        return (
            <p className="mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
                {copy.empty}
            </p>
        )
    }

    return (
        <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">
                    {copy.recentLabel}
                </span>
                <Link
                    to="/publikasi"
                    className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 transition-colors hover:text-white"
                >
                    {copy.viewAll} →
                </Link>
            </div>
            <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                {posts.map((post) => (
                    <li key={post.id}>
                        <Link
                            to="/publikasi/$slug"
                            params={{ slug: post.slug }}
                            className="group flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white group-hover:text-white">
                                    {post.title}
                                </p>
                                <p className="mt-0.5 line-clamp-1 text-xs text-white/55">
                                    {getExcerpt(post.content, 100)}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-wider text-white/45">
                                {post.category ? (
                                    <span className="rounded-full border border-white/15 px-2 py-0.5">
                                        {post.category}
                                    </span>
                                ) : null}
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3 w-3" aria-hidden />
                                    {formatPublikasiDate(post.published_at, 'short')}
                                </span>
                                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}