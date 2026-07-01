import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import type { PublikasiComment, PublikasiCommentsResponse } from '../api/comments'
import { mergeThreadIntoCache, patchCommentInCache, publikasiCommentsQueryKey } from './comment-cache'

const baseComment = (id: number, parentId: number | null = null): PublikasiComment => ({
    id,
    blog_id: 1,
    parent_id: parentId,
    depth: parentId ? 1 : 0,
    body: `comment-${id}`,
    is_deleted: false,
    user: null,
    can_delete: false,
    can_edit: false,
    is_edited: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
})

const seedResponse = (comments: PublikasiComment[]): PublikasiCommentsResponse => ({
    data: comments,
    meta: {
        total: comments.length,
        root_total: 1,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        sort: 'oldest',
    },
})

describe('comment-cache', () => {
    it('merges thread comments into the first page without duplicates', () => {
        const queryClient = new QueryClient()
        const blogSlug = 'artikel-a'
        const sort = 'oldest' as const

        queryClient.setQueryData(publikasiCommentsQueryKey(blogSlug, sort), {
            pages: [seedResponse([baseComment(1)])],
            pageParams: [1],
        })

        mergeThreadIntoCache(queryClient, blogSlug, sort, [baseComment(1), baseComment(2, 1)])

        const cached = queryClient.getQueryData<{
            pages: PublikasiCommentsResponse[]
        }>(publikasiCommentsQueryKey(blogSlug, sort))

        expect(cached?.pages[0].data.map((comment) => comment.id)).toEqual([1, 2])
        expect(cached?.pages[0].meta.total).toBe(2)
    })

    it('patches a comment in cache', () => {
        const queryClient = new QueryClient()
        const blogSlug = 'artikel-b'
        const sort = 'newest' as const

        queryClient.setQueryData(publikasiCommentsQueryKey(blogSlug, sort), {
            pages: [seedResponse([baseComment(10)])],
            pageParams: [1],
        })

        patchCommentInCache(queryClient, blogSlug, sort, 10, {
            body: 'updated body',
            is_edited: true,
        })

        const cached = queryClient.getQueryData<{
            pages: PublikasiCommentsResponse[]
        }>(publikasiCommentsQueryKey(blogSlug, sort))

        expect(cached?.pages[0].data[0].body).toBe('updated body')
        expect(cached?.pages[0].data[0].is_edited).toBe(true)
    })
})