import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownUp, Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-stores'
import { getPublikasiCommentThread, getPublikasiComments } from '../../api/comments'
import {
    useCreatePublikasiComment,
    useDeletePublikasiComment,
    useUpdatePublikasiComment,
} from '../../hooks/use-publikasi-comments'
import {
    type CommentSort,
    mergeThreadIntoCache,
    publikasiCommentsQueryKey,
} from '../../lib/comment-cache'
import { buildCommentTree, mergeFlatComments } from '../../lib/comment-tree'
import { PublikasiCommentForm } from './PublikasiCommentForm'
import { PublikasiCommentItem } from './PublikasiCommentItem'
import './publikasi-comments.scss'

type PublikasiCommentSectionProps = {
    blogSlug: string
    isPublished: boolean
    moderationMode?: boolean
}

function parseCommentHash(): number | null {
    const hash = window.location.hash
    if (!hash.startsWith('#comment-')) return null
    const commentId = Number(hash.replace('#comment-', ''))
    return Number.isFinite(commentId) ? commentId : null
}

function scrollToCommentHash() {
    const hash = window.location.hash
    if (!hash.startsWith('#comment-')) return false

    const target = document.querySelector(hash)
    if (!target) return false

    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.classList.add('publikasi-comment-highlight')
    window.setTimeout(() => target.classList.remove('publikasi-comment-highlight'), 2400)
    return true
}

export function PublikasiCommentSection({
    blogSlug,
    isPublished,
    moderationMode = false,
}: PublikasiCommentSectionProps) {
    const { auth } = useAuthStore()
    const queryClient = useQueryClient()
    const isLoggedIn = Boolean(auth.user)
    const [sort, setSort] = useState<CommentSort>('oldest')
    const resolvingHashRef = useRef(false)

    const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteQuery({
            queryKey: publikasiCommentsQueryKey(blogSlug, sort),
            queryFn: ({ pageParam }) => getPublikasiComments(blogSlug, pageParam, sort),
            initialPageParam: 1,
            getNextPageParam: (lastPage) => {
                const { current_page, last_page } = lastPage.meta
                return current_page < last_page ? current_page + 1 : undefined
            },
            enabled: isPublished || moderationMode,
        })

    const createMutation = useCreatePublikasiComment(blogSlug, sort, auth.user)
    const updateMutation = useUpdatePublikasiComment(blogSlug, sort)
    const deleteMutation = useDeletePublikasiComment(blogSlug, sort)

    const flatComments = useMemo(
        () => mergeFlatComments(data?.pages.map((page) => page.data) ?? []),
        [data?.pages],
    )

    const tree = useMemo(() => buildCommentTree(flatComments), [flatComments])
    const totalCount = data?.pages[0]?.meta.total

    useEffect(() => {
        if (!isPublished || isLoading) return

        const targetId = parseCommentHash()
        if (!targetId) return

        if (flatComments.some((comment) => comment.id === targetId)) {
            const frame = window.requestAnimationFrame(() => scrollToCommentHash())
            return () => window.cancelAnimationFrame(frame)
        }

        if (resolvingHashRef.current) return

        resolvingHashRef.current = true
        void getPublikasiCommentThread(blogSlug, targetId)
            .then((response) => {
                mergeThreadIntoCache(queryClient, blogSlug, sort, response.data)
                window.requestAnimationFrame(() => scrollToCommentHash())
            })
            .catch(() => {
                toast.error('Komentar dari tautan tidak ditemukan.')
            })
            .finally(() => {
                resolvingHashRef.current = false
            })
    }, [isPublished, isLoading, flatComments, blogSlug, sort, queryClient])

    useEffect(() => {
        const onHashChange = () => scrollToCommentHash()
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    if (!isPublished && !moderationMode) {
        return null
    }

    return (
        <section
            id="comment-section"
            className={
                moderationMode
                    ? 'publikasi-comments'
                    : 'publikasi-comments mt-12 border-t border-border/70 pt-10'
            }
        >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold tracking-tight">
                        Komentar
                        {totalCount != null ? (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                ({totalCount})
                            </span>
                        ) : null}
                    </h2>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowDownUp className="h-3.5 w-3.5" />
                    <Select value={sort} onValueChange={(value) => setSort(value as CommentSort)}>
                        <SelectTrigger className="h-8 w-[148px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="oldest">Terlama dulu</SelectItem>
                            <SelectItem value="newest">Terbaru dulu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoggedIn ? (
                <div className="mb-8 rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                    <PublikasiCommentForm
                        onSubmit={async (body) => {
                            await createMutation.mutateAsync({ body })
                            toast.success('Komentar terkirim')
                        }}
                    />
                </div>
            ) : (
                <div className="mb-8 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-center">
                    <p className="text-sm text-muted-foreground">
                        Login untuk menulis komentar, membalas, dan menyisipkan GIF.
                    </p>
                    <Link
                        to="/sign-in"
                        search={{ redirect: `/publikasi/${blogSlug}` }}
                        className="mt-3 inline-block"
                    >
                        <Button size="sm">Login</Button>
                    </Link>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            ) : isError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    Gagal memuat komentar.
                    <Button variant="link" className="ml-2 h-auto p-0" onClick={() => refetch()}>
                        Coba lagi
                    </Button>
                </div>
            ) : tree.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada komentar. Jadilah yang pertama!</p>
            ) : (
                <div className="space-y-5">
                    {tree.map((comment) => (
                        <PublikasiCommentItem
                            key={comment.id}
                            comment={comment}
                            canReply={isLoggedIn}
                            depth={0}
                            onCreateReply={async (parentId, body) => {
                                await createMutation.mutateAsync({ body, parent_id: parentId })
                                toast.success('Balasan terkirim')
                            }}
                            onUpdate={async (commentId, body) => {
                                await updateMutation.mutateAsync({ commentId, body })
                            }}
                            onDelete={async (commentId) => {
                                await deleteMutation.mutateAsync(commentId)
                            }}
                        />
                    ))}
                </div>
            )}

            {hasNextPage ? (
                <div className="mt-6 flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memuat...
                            </>
                        ) : (
                            'Muat komentar lainnya'
                        )}
                    </Button>
                </div>
            ) : null}
        </section>
    )
}