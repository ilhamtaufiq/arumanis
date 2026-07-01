import { describe, expect, it } from 'vitest'
import { buildCommentTree, countCommentTree, mergeFlatComments } from './comment-tree'
import type { PublikasiComment } from '../api/comments'

const sample: PublikasiComment[] = [
    {
        id: 1,
        blog_id: 10,
        parent_id: null,
        depth: 0,
        body: 'root',
        is_deleted: false,
        user: null,
        can_delete: false,
        can_edit: false,
        is_edited: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 2,
        blog_id: 10,
        parent_id: 1,
        depth: 1,
        body: 'reply',
        is_deleted: false,
        user: null,
        can_delete: false,
        can_edit: false,
        is_edited: false,
        created_at: '2026-01-01T00:01:00Z',
        updated_at: '2026-01-01T00:01:00Z',
    },
]

describe('comment-tree', () => {
    it('builds nested tree from flat comments', () => {
        const tree = buildCommentTree(sample)
        expect(tree).toHaveLength(1)
        expect(tree[0].id).toBe(1)
        expect(tree[0].replies).toHaveLength(1)
        expect(tree[0].replies[0].id).toBe(2)
    })

    it('counts all nodes in tree', () => {
        const tree = buildCommentTree(sample)
        expect(countCommentTree(tree)).toBe(2)
    })

    it('merges paginated flat lists without duplicates', () => {
        const pageOne: PublikasiComment[] = [
            sample[0],
            {
                ...sample[0],
                id: 3,
                parent_id: null,
                body: 'root 2',
            },
        ]
        const pageTwo: PublikasiComment[] = [
            sample[0],
            sample[1],
            {
                ...sample[0],
                id: 4,
                parent_id: 3,
                depth: 1,
                body: 'reply 2',
            },
        ]

        const merged = mergeFlatComments([pageOne, pageTwo])
        expect(merged.map((comment) => comment.id)).toEqual([1, 3, 2, 4])
    })
})