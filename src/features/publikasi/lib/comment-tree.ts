import type { PublikasiComment, PublikasiCommentNode } from '../api/comments'

export function buildCommentTree(flat: PublikasiComment[]): PublikasiCommentNode[] {
    const nodes = new Map<number, PublikasiCommentNode>()

    for (const comment of flat) {
        nodes.set(comment.id, { ...comment, replies: [] })
    }

    const roots: PublikasiCommentNode[] = []

    for (const comment of flat) {
        const node = nodes.get(comment.id)
        if (!node) continue

        if (comment.parent_id && nodes.has(comment.parent_id)) {
            nodes.get(comment.parent_id)!.replies.push(node)
            continue
        }

        roots.push(node)
    }

    return roots
}

export function countCommentTree(nodes: PublikasiCommentNode[]): number {
    return nodes.reduce((total, node) => total + 1 + countCommentTree(node.replies), 0)
}

export function mergeFlatComments(pages: PublikasiComment[][]): PublikasiComment[] {
    const seen = new Set<number>()
    const merged: PublikasiComment[] = []

    for (const page of pages) {
        for (const comment of page) {
            if (seen.has(comment.id)) continue
            seen.add(comment.id)
            merged.push(comment)
        }
    }

    return merged
}