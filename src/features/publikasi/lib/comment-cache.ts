import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import type {
    PublikasiComment,
    PublikasiCommentsResponse,
} from '../api/comments'

export type CommentSort = 'oldest' | 'newest'

export function publikasiCommentsQueryKey(blogSlug: string, sort: CommentSort = 'oldest') {
    return ['publikasi-comments', blogSlug, sort] as const
}

function mapPages(
    data: InfiniteData<PublikasiCommentsResponse>,
    mapper: (page: PublikasiCommentsResponse, index: number) => PublikasiCommentsResponse,
): InfiniteData<PublikasiCommentsResponse> {
    return {
        ...data,
        pages: data.pages.map(mapper),
    }
}

export function mergeThreadIntoCache(
    queryClient: QueryClient,
    blogSlug: string,
    sort: CommentSort,
    threadComments: PublikasiComment[],
) {
    queryClient.setQueryData<InfiniteData<PublikasiCommentsResponse>>(
        publikasiCommentsQueryKey(blogSlug, sort),
        (old) => {
            if (!old?.pages.length) {
                return {
                    pages: [
                        {
                            data: threadComments,
                            meta: {
                                total: threadComments.length,
                                root_total: 1,
                                current_page: 1,
                                last_page: 1,
                                per_page: 20,
                                sort,
                            },
                        },
                    ],
                    pageParams: [1],
                }
            }

            const existingIds = new Set(old.pages.flatMap((page) => page.data.map((comment) => comment.id)))
            const newComments = threadComments.filter((comment) => !existingIds.has(comment.id))
            if (newComments.length === 0) return old

            return mapPages(old, (page, index) => {
                if (index !== 0) return page
                return {
                    ...page,
                    data: [...page.data, ...newComments],
                    meta: {
                        ...page.meta,
                        total: page.meta.total + newComments.length,
                    },
                }
            })
        },
    )
}

export function upsertCommentInCache(
    queryClient: QueryClient,
    blogSlug: string,
    sort: CommentSort,
    comment: PublikasiComment,
) {
    queryClient.setQueryData<InfiniteData<PublikasiCommentsResponse>>(
        publikasiCommentsQueryKey(blogSlug, sort),
        (old) => {
            if (!old?.pages.length) return old

            return mapPages(old, (page, index) => {
                const withoutTemp = page.data.filter(
                    (item) => !(item.id < 0 && item.parent_id === comment.parent_id && item.body === comment.body),
                )
                const exists = withoutTemp.some((item) => item.id === comment.id)
                const data = exists
                    ? withoutTemp.map((item) => (item.id === comment.id ? comment : item))
                    : index === 0
                      ? [...withoutTemp, comment]
                      : withoutTemp

                return {
                    ...page,
                    data,
                    meta: exists
                        ? page.meta
                        : index === 0
                          ? { ...page.meta, total: page.meta.total + 1 }
                          : page.meta,
                }
            })
        },
    )
}

export function patchCommentInCache(
    queryClient: QueryClient,
    blogSlug: string,
    sort: CommentSort,
    commentId: number,
    patch: Partial<PublikasiComment>,
) {
    queryClient.setQueryData<InfiniteData<PublikasiCommentsResponse>>(
        publikasiCommentsQueryKey(blogSlug, sort),
        (old) => {
            if (!old) return old

            return mapPages(old, (page) => ({
                ...page,
                data: page.data.map((comment) =>
                    comment.id === commentId ? { ...comment, ...patch } : comment,
                ),
            }))
        },
    )
}

export function addOptimisticCommentToCache(
    queryClient: QueryClient,
    blogSlug: string,
    sort: CommentSort,
    comment: PublikasiComment,
) {
    queryClient.setQueryData<InfiniteData<PublikasiCommentsResponse>>(
        publikasiCommentsQueryKey(blogSlug, sort),
        (old) => {
            if (!old?.pages.length) return old

            return mapPages(old, (page, index) =>
                index === 0
                    ? {
                          ...page,
                          data: [...page.data, comment],
                          meta: { ...page.meta, total: page.meta.total + 1 },
                      }
                    : page,
            )
        },
    )
}