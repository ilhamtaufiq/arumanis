import { useEffect, useState } from 'react'
import { ExternalLink, Copy, Loader2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    createPuspenMediaShareFromPekerjaanBerkas,
    type PuspenMediaShare,
} from '@/features/puspen/api/media-sharing'

type BerkasQuickShareDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    pekerjaanId: number
    namaPaket?: string
    berkasIds?: number[]
    fileCount: number
    fileLabel: string
}

export function BerkasQuickShareDialog({
    open,
    onOpenChange,
    pekerjaanId,
    namaPaket,
    berkasIds,
    fileCount,
    fileLabel,
}: BerkasQuickShareDialogProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [createdShare, setCreatedShare] = useState<PuspenMediaShare | null>(null)

    useEffect(() => {
        if (!open) {
            setCreatedShare(null)
            setIsSubmitting(false)
            return
        }

        setTitle(namaPaket ? `Berkas: ${namaPaket}` : 'Berkas Pekerjaan')
        setDescription('Dokumen pekerjaan dibagikan melalui Puspen Media Sharing.')
    }, [open, namaPaket])

    const handleCreate = async () => {
        if (fileCount === 0) {
            toast.error('Tidak ada berkas yang dapat dibagikan')
            return
        }

        try {
            setIsSubmitting(true)
            const share = await createPuspenMediaShareFromPekerjaanBerkas(pekerjaanId, {
                berkasIds,
                title: title.trim(),
                description: description.trim() || undefined,
            })
            setCreatedShare(share)
            toast.success('Link berbagi publik berhasil dibuat')
        } catch (error) {
            console.error('Failed to create quick share:', error)
            toast.error('Gagal membuat link berbagi. Pastikan berkas memiliki file yang valid.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const copyPublicUrl = async () => {
        if (!createdShare?.publicUrl) return

        try {
            await navigator.clipboard.writeText(createdShare.publicUrl)
            toast.success('Link publik disalin')
        } catch {
            toast.error('Gagal menyalin link')
        }
    }

    const openPublicPage = () => {
        if (!createdShare?.publicUrl) return
        window.open(createdShare.publicUrl, '_blank', 'noopener,noreferrer')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        Quick Share Berkas
                    </DialogTitle>
                    <DialogDescription>
                        Buat halaman publik Puspen untuk {fileLabel}. Penerima link dapat melihat pratinjau
                        dan mengunduh dokumen tanpa login.
                    </DialogDescription>
                </DialogHeader>

                {createdShare ? (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                            <p className="text-sm font-medium">Link publik siap digunakan</p>
                            <p className="mt-2 break-all text-xs text-muted-foreground">
                                {createdShare.publicUrl}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {createdShare.files.length} file · {createdShare.downloadCount} unduhan
                            </p>
                        </div>

                        <DialogFooter className="gap-2 sm:justify-between">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Tutup
                            </Button>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" onClick={() => void copyPublicUrl()}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Salin Link
                                </Button>
                                <Button onClick={openPublicPage}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Buka Halaman Publik
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                            {fileCount} berkas akan dibagikan melalui Puspen Media Sharing.
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quick-share-title">Judul halaman publik</Label>
                            <Input
                                id="quick-share-title"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Judul berbagi dokumen"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quick-share-description">Deskripsi</Label>
                            <Textarea
                                id="quick-share-description"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                rows={3}
                                placeholder="Deskripsi singkat untuk penerima link"
                            />
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Batal
                            </Button>
                            <Button onClick={() => void handleCreate()} disabled={isSubmitting || fileCount === 0}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Membuat link...
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Buat Link Publik
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}