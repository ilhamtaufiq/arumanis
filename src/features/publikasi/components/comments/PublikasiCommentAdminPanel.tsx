import { ExternalLink, MessageSquare } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { PublikasiCommentSection } from './PublikasiCommentSection'

type PublikasiCommentAdminPanelProps = {
    blogSlug: string
    blogTitle: string
    isPublished: boolean
    blogId: number
}

export function PublikasiCommentAdminPanel({
    blogSlug,
    blogTitle,
    isPublished,
    blogId,
}: PublikasiCommentAdminPanelProps) {
    return (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold tracking-tight">Komentar Artikel</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Moderasi komentar untuk &ldquo;{blogTitle}&rdquo;
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        to="/manajemen-publikasi/komentar"
                        search={{ blog_id: blogId }}
                    >
                        <Button variant="outline" size="sm">
                            Lihat di daftar komentar
                        </Button>
                    </Link>
                    {isPublished ? (
                        <Link to="/publikasi/$slug" params={{ slug: blogSlug }} hash="comment-section">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Buka di artikel
                            </Button>
                        </Link>
                    ) : null}
                </div>
            </div>

            <PublikasiCommentSection
                blogSlug={blogSlug}
                isPublished={isPublished}
                moderationMode
            />
        </div>
    )
}