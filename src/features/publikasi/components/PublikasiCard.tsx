import { type PublikasiPost } from '../api'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Clock, Lock } from 'lucide-react'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    estimateReadingTime,
    formatPublikasiDate,
    getCoverImage,
    getExcerpt,
} from '../lib/format'

type PublikasiCardProps = PublikasiPost & {
    variant?: 'default' | 'compact'
}

export function PublikasiCard({
    title,
    slug,
    content,
    category,
    published_at,
    cover_image,
    is_internal,
    is_published,
    user,
    variant = 'default',
}: PublikasiCardProps) {
    const { logoUrl } = useAppSettingsValues()
    const excerpt = getExcerpt(content, variant === 'compact' ? 100 : 140)
    const readingTime = estimateReadingTime(content)

    return (
        <article
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5',
                variant === 'compact' && 'flex-row',
            )}
        >
            <Link
                to="/publikasi/$slug"
                params={{ slug }}
                className={cn(
                    'relative block shrink-0 overflow-hidden bg-muted',
                    variant === 'compact' ? 'aspect-square w-36 sm:w-44' : 'aspect-[16/10] w-full',
                )}
            >
                <img
                    src={getCoverImage(cover_image, logoUrl)}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent opacity-80" />
                {category ? (
                    <Badge
                        variant="secondary"
                        className="absolute left-3 top-3 border-0 bg-background/90 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm"
                    >
                        {category}
                    </Badge>
                ) : null}
            </Link>

            <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>{formatPublikasiDate(published_at, 'short')}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {readingTime} menit
                    </span>
                    {user?.jabatan ? (
                        <>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className="text-primary/80">{user.jabatan}</span>
                        </>
                    ) : null}
                    {!is_published ? (
                        <Badge variant="outline" className="h-5 px-1.5 text-[9px]">
                            Draft
                        </Badge>
                    ) : null}
                    {is_internal ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                            <Lock className="h-3 w-3" />
                            Internal
                        </span>
                    ) : null}
                </div>

                <Link to="/publikasi/$slug" params={{ slug }} className="block space-y-2">
                    <h3
                        className={cn(
                            'font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary',
                            variant === 'compact' ? 'text-base' : 'text-xl',
                        )}
                    >
                        {title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {excerpt}
                    </p>
                </Link>

                <div className="mt-auto flex items-center justify-between pt-1">
                    <Link
                        to="/publikasi/$slug"
                        params={{ slug }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition-all group-hover:gap-2.5"
                    >
                        Baca artikel
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </article>
    )
}