import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { JurnalFoto } from '../types'

export interface FotoPreviewState {
    photos: JurnalFoto[]
    index: number
}

interface FotoPreviewDialogProps {
    preview: FotoPreviewState | null
    onChange: (preview: FotoPreviewState) => void
    onClose: () => void
    /** Judul tambahan, mis. "RHK 3 · Pelayanan". */
    caption?: string
}

export default function FotoPreviewDialog({ preview, onChange, onClose, caption }: FotoPreviewDialogProps) {
    const total = preview?.photos.length ?? 0
    const move = (delta: number) => {
        if (!preview || total === 0) return
        onChange({ ...preview, index: (preview.index + delta + total) % total })
    }

    return (
        <Dialog open={preview !== null} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="sm:max-w-3xl">
                {preview && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                Foto {preview.index + 1} dari {total}
                                {caption ? ` · ${caption}` : ''}
                            </DialogTitle>
                            <DialogDescription>Pratinjau foto</DialogDescription>
                        </DialogHeader>
                        <img
                            src={preview.photos[preview.index].url}
                            alt={`Foto ${preview.index + 1}`}
                            className="max-h-[70vh] w-full rounded-md object-contain"
                        />
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => move(-1)} disabled={total < 2}>
                                    Sebelumnya
                                </Button>
                                <Button variant="outline" onClick={() => move(1)} disabled={total < 2}>
                                    Berikutnya
                                </Button>
                            </div>
                            <Button variant="ghost" asChild>
                                <a href={preview.photos[preview.index].url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                    Buka di tab baru
                                </a>
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
