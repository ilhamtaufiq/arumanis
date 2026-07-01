import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, MessageSquarePlus, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/format'
import {
    createPuspenReviewNote,
    deletePuspenReviewNote,
    getPuspenReviewNotes,
    type PuspenReviewNote,
} from '../../api/review-notes'
import { PuspenButton, puspenInputClass } from '../PuspenUi'
import { puspenBorder, puspenLabel } from '../../lib/tokens'
import { cn } from '@/lib/utils'

type ReviewNotesModalProps = {
    pekerjaanId: number
    pekerjaanName: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ReviewNotesModal({
    pekerjaanId,
    pekerjaanName,
    open,
    onOpenChange,
}: ReviewNotesModalProps) {
    const queryClient = useQueryClient()
    const [content, setContent] = useState('')

    const notesQuery = useQuery({
        queryKey: ['puspen-review-notes', pekerjaanId],
        queryFn: () => getPuspenReviewNotes(pekerjaanId),
        enabled: open && pekerjaanId > 0,
    })

    const createMutation = useMutation({
        mutationFn: (noteContent: string) => createPuspenReviewNote(pekerjaanId, noteContent),
        onSuccess: async () => {
            setContent('')
            await queryClient.invalidateQueries({ queryKey: ['puspen-review-notes', pekerjaanId] })
            toast.success('Catatan berhasil ditambahkan')
        },
        onError: () => {
            toast.error('Gagal menambahkan catatan')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deletePuspenReviewNote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['puspen-review-notes', pekerjaanId] })
            toast.success('Catatan dihapus')
        },
        onError: () => {
            toast.error('Gagal menghapus catatan')
        },
    })

    const notes = notesQuery.data ?? []
    const isSaving = createMutation.isPending
    const deletingId = deleteMutation.isPending ? deleteMutation.variables : null

    const handleSubmit = () => {
        const trimmed = content.trim()
        if (!trimmed) return
        createMutation.mutate(trimmed)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto border-[3px] border-[#111111] bg-[#FFF7E8] p-0 shadow-[6px_6px_0_0_#111111] sm:max-w-2xl">
                <DialogHeader className="border-b-[3px] border-[#111111] bg-[#1A1A2E] px-5 py-4 text-[#FFB703]">
                    <DialogTitle className="text-lg font-black uppercase tracking-[0.12em] text-[#FFB703]">
                        Catatan Tindak Lanjut
                    </DialogTitle>
                    <DialogDescription className="text-sm font-bold text-[#FFB703]/75">
                        {pekerjaanName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 p-5">
                    <div className={`bg-white p-4 ${puspenBorder}`}>
                        <div className={`mb-2 ${puspenLabel} text-[#111111]/60`}>Tambah Catatan</div>
                        <textarea
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Tulis catatan tindak lanjut, temuan lapangan, atau instruksi lainnya..."
                            rows={4}
                            maxLength={5000}
                            className={cn(puspenInputClass, 'resize-y min-h-[120px]')}
                            aria-label="Isi catatan baru"
                        />
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#111111]/55">
                                {content.trim().length}/5000 karakter
                            </span>
                            <PuspenButton
                                variant="primary"
                                onClick={handleSubmit}
                                disabled={!content.trim() || isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <MessageSquarePlus className="h-4 w-4" />
                                )}
                                Simpan Catatan
                            </PuspenButton>
                        </div>
                    </div>

                    <div>
                        <div className={`mb-2 flex items-center justify-between ${puspenLabel} text-[#111111]/60`}>
                            <span>Daftar Catatan ({notes.length})</span>
                            {notesQuery.isFetching && !notesQuery.isLoading ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#111111]/40" />
                            ) : null}
                        </div>

                        {notesQuery.isLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="h-7 w-7 animate-spin text-[#111111]/40" />
                            </div>
                        ) : notesQuery.isError ? (
                            <div className="py-8 text-center text-sm font-black uppercase tracking-widest text-[#EF233C]">
                                Gagal memuat catatan.
                            </div>
                        ) : notes.length === 0 ? (
                            <div className={`bg-white py-8 text-center text-sm font-black uppercase tracking-widest text-[#111111]/55 ${puspenBorder}`}>
                                Belum ada catatan. Tambahkan catatan pertama di atas.
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {notes.map((note) => (
                                    <NoteItem
                                        key={note.id}
                                        note={note}
                                        onDelete={() => deleteMutation.mutate(note.id)}
                                        deleting={deletingId === note.id}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function NoteItem({
    note,
    onDelete,
    deleting,
}: {
    note: PuspenReviewNote
    onDelete: () => void
    deleting: boolean
}) {
    return (
        <li className={`bg-white p-3 ${puspenBorder}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#111111]/70">
                        <span>{note.user?.name ?? 'Pengguna'}</span>
                        <span className="text-[#111111]/40">·</span>
                        <time dateTime={note.createdAt}>{formatDate(note.createdAt)}</time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-bold leading-6 text-[#111111]/85">
                        {note.content}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting}
                    className="shrink-0 p-1.5 text-[#EF233C] hover:bg-[#FDE2E4] disabled:opacity-50"
                    aria-label="Hapus catatan"
                >
                    {deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4" />
                    )}
                </button>
            </div>
        </li>
    )
}