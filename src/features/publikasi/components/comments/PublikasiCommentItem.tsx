import { useState } from 'react'
import { ChevronDown, ChevronRight, Loader2, MessageSquare, Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { cn } from '@/lib/utils'
import { countCommentTree } from '../../lib/comment-tree'
import type { PublikasiCommentNode } from '../../api/comments'
import { CommentMarkdown } from './CommentMarkdown'
import { PublikasiCommentForm } from './PublikasiCommentForm'

type PublikasiCommentItemProps = {
    comment: PublikasiCommentNode
    canReply: boolean
    depth: number
    onCreateReply: (parentId: number, body: string) => Promise<void>
    onUpdate: (commentId: number, body: string) => Promise<void>
    onDelete: (commentId: number) => Promise<void>
}

const MAX_VISUAL_DEPTH = 6

export function PublikasiCommentItem({
    comment,
    canReply,
    depth,
    onCreateReply,
    onUpdate,
    onDelete,
}: PublikasiCommentItemProps) {
    const [replyOpen, setReplyOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const visualDepth = Math.min(depth, MAX_VISUAL_DEPTH)
    const replyCount = countCommentTree(comment.replies)

    const handleDelete = async () => {
        if (!comment.can_delete || comment.is_deleted) return

        try {
            setDeleting(true)
            await onDelete(comment.id)
            setDeleteOpen(false)
        } finally {
            setDeleting(false)
        }
    }

    const createdAt = new Date(comment.created_at).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <div
            id={`comment-${comment.id}`}
            className={cn(
                'publikasi-comment-item scroll-mt-24 rounded-lg transition-colors',
                visualDepth > 0 && 'border-l border-border/70 pl-4',
            )}
            style={{ marginLeft: visualDepth > 0 ? `${Math.min(visualDepth, 4) * 0.35}rem` : undefined }}
        >
            <div className="flex gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                    {comment.user?.avatar ? (
                        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                        {comment.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold">
                            {comment.is_deleted ? '[dihapus]' : comment.user?.name ?? 'Pengguna'}
                        </span>
                        <span className="text-xs text-muted-foreground">{createdAt}</span>
                        {comment.is_edited && !comment.is_deleted ? (
                            <span className="text-xs italic text-muted-foreground">(diedit)</span>
                        ) : null}
                    </div>

                    {editOpen ? (
                        <PublikasiCommentForm
                            initialBody={comment.body ?? ''}
                            submitLabel="Simpan"
                            placeholder="Edit komentar..."
                            autoFocus
                            onSubmit={async (body) => {
                                await onUpdate(comment.id, body)
                                setEditOpen(false)
                            }}
                            onCancel={() => setEditOpen(false)}
                        />
                    ) : comment.is_deleted ? (
                        <p className="text-sm italic text-muted-foreground">Komentar ini telah dihapus.</p>
                    ) : (
                        <CommentMarkdown content={comment.body ?? ''} />
                    )}

                    {!editOpen ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {canReply && !comment.is_deleted ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs"
                                    onClick={() => setReplyOpen((open) => !open)}
                                >
                                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                    Balas
                                </Button>
                            ) : null}
                            {comment.can_edit && !comment.is_deleted ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs"
                                    onClick={() => setEditOpen(true)}
                                >
                                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                    Edit
                                </Button>
                            ) : null}
                            {comment.can_delete && !comment.is_deleted ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                                    onClick={() => setDeleteOpen(true)}
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    Hapus
                                </Button>
                            ) : null}
                            {replyCount > 0 ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-muted-foreground"
                                    onClick={() => setCollapsed((value) => !value)}
                                >
                                    {collapsed ? (
                                        <ChevronRight className="mr-1.5 h-3.5 w-3.5" />
                                    ) : (
                                        <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {collapsed
                                        ? `Tampilkan ${replyCount} balasan`
                                        : `Sembunyikan ${replyCount} balasan`}
                                </Button>
                            ) : null}
                        </div>
                    ) : null}

                    {replyOpen ? (
                        <div className="mt-3">
                            <PublikasiCommentForm
                                placeholder="Tulis balasan..."
                                autoFocus
                                onSubmit={async (body) => {
                                    await onCreateReply(comment.id, body)
                                    setReplyOpen(false)
                                }}
                                onCancel={() => setReplyOpen(false)}
                            />
                        </div>
                    ) : null}

                    {!collapsed && comment.replies.length > 0 ? (
                        <div className="mt-4 space-y-4">
                            {comment.replies.map((reply) => (
                                <PublikasiCommentItem
                                    key={reply.id}
                                    comment={reply}
                                    canReply={canReply}
                                    depth={depth + 1}
                                    onCreateReply={onCreateReply}
                                    onUpdate={onUpdate}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Hapus komentar?"
                desc="Komentar ini akan ditandai sebagai dihapus dan tidak dapat dipulihkan."
                confirmText="Hapus"
                destructive
                isLoading={deleting}
                handleConfirm={handleDelete}
            />
        </div>
    )
}