import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import type { KanbanCard } from '../types'
import { useCreateKanbanCard, useDeleteKanbanCard, useUpdateKanbanCard } from '../hooks/useKanban'

interface KanbanCardDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    columnId: number | null
    card: KanbanCard | null
    canManage: boolean
}

export function KanbanCardDialog({
    open,
    onOpenChange,
    columnId,
    card,
    canManage,
}: KanbanCardDialogProps) {
    const isEditing = Boolean(card)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [statusLabel, setStatusLabel] = useState('')
    const [pekerjaanId, setPekerjaanId] = useState<string>('none')

    const createMutation = useCreateKanbanCard()
    const updateMutation = useUpdateKanbanCard()
    const deleteMutation = useDeleteKanbanCard()

    const { data: pekerjaanRes, isLoading: loadingPekerjaan } = useQuery({
        queryKey: ['pekerjaan', 'kanban-picker'],
        queryFn: () => getPekerjaan({ per_page: 100 }),
        enabled: open && canManage,
    })

    const pekerjaanList = pekerjaanRes?.data ?? []
    const isSaving = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (!open) return

        if (card) {
            setTitle(card.title)
            setDescription(card.description ?? '')
            setStatusLabel(card.status_label ?? '')
            setPekerjaanId(card.pekerjaan_id ? String(card.pekerjaan_id) : 'none')
            return
        }

        setTitle('')
        setDescription('')
        setStatusLabel('')
        setPekerjaanId('none')
    }, [open, card])

    const handleSubmit = async () => {
        if (!canManage || !title.trim()) return

        const payload = {
            title: title.trim(),
            description: description.trim() || undefined,
            status_label: statusLabel.trim() || undefined,
            pekerjaan_id: pekerjaanId === 'none' ? null : Number(pekerjaanId),
        }

        if (isEditing && card) {
            await updateMutation.mutateAsync({ id: card.id, data: payload })
        } else if (columnId) {
            await createMutation.mutateAsync({
                column_id: columnId,
                ...payload,
            })
        }

        onOpenChange(false)
    }

    const handleDelete = async () => {
        if (!card || !canManage) return
        if (!confirm('Hapus kartu ini dari kanban?')) return
        await deleteMutation.mutateAsync(card.id)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[min(92dvh,720px)] gap-4 overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Detail Kartu' : 'Tambah Kartu'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? card?.source === 'tiket'
                                ? 'Perubahan pada kartu ini juga akan memperbarui tiket terkait.'
                                : 'Kelola detail kartu kanban.'
                            : 'Buat kartu kerja baru di board organisasi.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="kanban-title">Judul</Label>
                        <Input
                            id="kanban-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={!canManage}
                            placeholder="Contoh: Follow up material pipa"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="kanban-status-label">Keterangan Status</Label>
                        <Input
                            id="kanban-status-label"
                            value={statusLabel}
                            onChange={(e) => setStatusLabel(e.target.value)}
                            disabled={!canManage}
                            placeholder="Contoh: Menunggu verifikasi lapangan"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="kanban-description">Deskripsi</Label>
                        <Textarea
                            id="kanban-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={!canManage}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Pekerjaan Terkait</Label>
                        {loadingPekerjaan ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memuat pekerjaan...
                            </div>
                        ) : (
                            <Select value={pekerjaanId} onValueChange={setPekerjaanId} disabled={!canManage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih pekerjaan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Tanpa pekerjaan</SelectItem>
                                    {pekerjaanList.map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>
                                            {item.nama_paket}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    {isEditing && canManage ? (
                        <Button
                            variant="destructive"
                            className="w-full sm:w-auto"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            Hapus
                        </Button>
                    ) : (
                        <span className="hidden sm:inline" />
                    )}
                    <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
                            Tutup
                        </Button>
                        {canManage && (
                            <Button
                                className="w-full sm:w-auto"
                                onClick={handleSubmit}
                                disabled={isSaving || !title.trim()}
                            >
                                {isSaving ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Tambah'}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}