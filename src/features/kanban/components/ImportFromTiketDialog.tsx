import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, MessageSquare, Search } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { getTiketList } from '@/features/tiket/api/tiket'
import type { KanbanBoard } from '../types'
import { useImportKanbanFromTiket } from '../hooks/useKanban'

interface ImportFromTiketDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    board: KanbanBoard | null
}

const statusTone: Record<string, string> = {
    open: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    pending: 'bg-amber-500/10 text-amber-800 dark:text-amber-200',
    closed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
}

export function ImportFromTiketDialog({ open, onOpenChange, board }: ImportFromTiketDialogProps) {
    const [search, setSearch] = useState('')
    const importMutation = useImportKanbanFromTiket()

    const { data, isLoading } = useQuery({
        queryKey: ['tiket', 'kanban-import'],
        queryFn: () => getTiketList({ per_page: 100 }),
        enabled: open,
    })

    const importedTiketIds = useMemo(() => {
        const ids = new Set<number>()
        for (const column of board?.columns ?? []) {
            for (const card of column.cards ?? []) {
                if (card.tiket_id) ids.add(card.tiket_id)
            }
        }
        return ids
    }, [board])

    const tikets = (data?.data ?? []).filter((tiket) => {
        if (importedTiketIds.has(tiket.id)) return false
        if (!search.trim()) return true
        const term = search.toLowerCase()
        return tiket.subjek.toLowerCase().includes(term) || tiket.deskripsi.toLowerCase().includes(term)
    })

    const handleImport = async (tiketId: number) => {
        await importMutation.mutateAsync({ tiket_id: tiketId })
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader className="space-y-1 border-b px-6 py-5">
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Impor dari Tiket
                    </DialogTitle>
                    <DialogDescription>
                        Tambahkan tiket ke board organisasi. Perubahan kartu akan disinkronkan ke tiket terkait.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 px-6 py-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari subjek atau deskripsi tiket..."
                            className="pl-9"
                        />
                    </div>

                    <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12 text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memuat tiket...
                            </div>
                        ) : tikets.length === 0 ? (
                            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                                Tidak ada tiket yang bisa diimpor.
                            </div>
                        ) : (
                            tikets.map((tiket) => (
                                <div
                                    key={tiket.id}
                                    className="flex items-start justify-between gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/20"
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium leading-snug">{tiket.subjek}</p>
                                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tiket.deskripsi}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <Badge className={statusTone[tiket.status] ?? ''} variant="secondary">
                                                {tiket.status}
                                            </Badge>
                                            <Badge variant="outline">{tiket.kategori}</Badge>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() => handleImport(tiket.id)}
                                        disabled={importMutation.isPending}
                                    >
                                        Impor
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t px-6 py-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}