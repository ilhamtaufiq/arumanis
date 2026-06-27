import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    createPublikasiComment,
    deletePublikasiComment,
    type PublikasiComment,
    updatePublikasiComment,
} from '../api/comments'
import {
    addOptimisticCommentToCache,
    patchCommentInCache,
    type CommentSort,
    publikasiCommentsQueryKey,
    upsertCommentInCache,
} from '../lib/comment-cache'

type AuthUser = {
    id: number
    name: string
    avatar?: string | null
}

function buildOptimisticComment(
    body: string,
    parentId: number | undefined,
    user: AuthUser,
): PublikasiComment {
    const now = new Date().toISOString()

    return {
        id: -Date.now(),
        blog_id: 0,
        parent_id: parentId ?? null,
        depth: parentId ? 1 : 0,
        body,
        is_deleted: false,
        user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar ?? null,
            jabatan: null,
        },
        can_delete: true,
        can_edit: true,
        is_edited: false,
        created_at: now,
        updated_at: now,
    }
}

export function useCreatePublikasiComment(blogSlug: string, sort: CommentSort, user: AuthUser | null) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: { body: string; parent_id?: number }) =>
            createPublikasiComment(blogSlug, payload),
        onMutate: async (payload) => {
            if (!user) return {}

            const queryKey = publikasiCommentsQueryKey(blogSlug, sort)
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData(queryKey)
            const optimistic = buildOptimisticComment(payload.body, payload.parent_id, user)

            addOptimisticCommentToCache(queryClient, blogSlug, sort, optimistic)

            return { previous, optimisticId: optimistic.id }
        },
        onSuccess: (response) => {
            upsertCommentInCache(queryClient, blogSlug, sort, response.data)
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(publikasiCommentsQueryKey(blogSlug, sort), context.previous)
            }
            toast.error('Gagal mengirim komentar')
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: publikasiCommentsQueryKey(blogSlug, sort) })
        },
    })
}

export function useUpdatePublikasiComment(blogSlug: string, sort: CommentSort) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ commentId, body }: { commentId: number; body: string }) =>
            updatePublikasiComment(commentId, body),
        onMutate: async ({ commentId, body }) => {
            const queryKey = publikasiCommentsQueryKey(blogSlug, sort)
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData(queryKey)

            patchCommentInCache(queryClient, blogSlug, sort, commentId, {
                body,
                is_edited: true,
                updated_at: new Date().toISOString(),
            })

            return { previous }
        },
        onSuccess: (response) => {
            upsertCommentInCache(queryClient, blogSlug, sort, response.data)
            toast.success('Komentar diperbarui')
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(publikasiCommentsQueryKey(blogSlug, sort), context.previous)
            }
            toast.error('Gagal memperbarui komentar')
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: publikasiCommentsQueryKey(blogSlug, sort) })
        },
    })
}

export function useDeletePublikasiComment(blogSlug: string, sort: CommentSort) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (commentId: number) => deletePublikasiComment(commentId),
        onMutate: async (commentId) => {
            const queryKey = publikasiCommentsQueryKey(blogSlug, sort)
            await queryClient.cancelQueries({ queryKey })
            const previous = queryClient.getQueryData(queryKey)

            patchCommentInCache(queryClient, blogSlug, sort, commentId, {
                body: null,
                is_deleted: true,
                user: null,
                can_delete: false,
                can_edit: false,
                is_edited: false,
            })

            return { previous }
        },
        onSuccess: () => {
            toast.success('Komentar dihapus')
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(publikasiCommentsQueryKey(blogSlug, sort), context.previous)
            }
            toast.error('Gagal menghapus komentar')
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: publikasiCommentsQueryKey(blogSlug, sort) })
        },
    })
}