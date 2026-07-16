import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { ImagePreviewModal } from '@/components/shared/ImagePreviewModal'
import { OnlyOfficePreviewModal } from '@/components/shared/OnlyOfficePreviewModal'
import { isOnlyOfficeSupported } from '@/features/documents/lib/onlyoffice-support'
import { openOnlyOfficeViewerWithMode } from '@/features/documents/lib/onlyoffice-editor'
import { getPreviewKind, isImageFile } from '@/lib/file-preview'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type DocumentPreviewModalProps = {
    isOpen: boolean
    onClose: () => void
    url: string
    title?: string
    fileName?: string
    mediaId?: number | null
    imageBadge?: string
    imageCoordinate?: string | null
    onDocumentSaved?: () => void
    /** Prefer OnlyOffice for PDF when mediaId is available (default true). */
    preferOnlyOfficeForPdf?: boolean
}

export function DocumentPreviewModal({
    isOpen,
    onClose,
    url,
    title,
    fileName,
    mediaId,
    imageBadge,
    imageCoordinate,
    onDocumentSaved,
    preferOnlyOfficeForPdf = true,
}: DocumentPreviewModalProps) {
    const [pdfEngine, setPdfEngine] = useState<'onlyoffice' | 'iframe'>('onlyoffice')

    if (!isOpen || !url) {
        return null
    }

    const resolvedFileName = fileName || url.split('/').pop() || title || 'document'
    const previewKind = getPreviewKind(url, resolvedFileName)
    const isImage =
        previewKind === 'image' ||
        isImageFile(resolvedFileName) ||
        isImageFile(url) ||
        isImageFile(title)
    const isPdf = previewKind === 'pdf' || resolvedFileName.toLowerCase().endsWith('.pdf')
    const onlyOfficeReady = Boolean(mediaId && isOnlyOfficeSupported(resolvedFileName))

    if (isImage) {
        return (
            <ImagePreviewModal
                open={isOpen}
                onOpenChange={(open) => !open && onClose()}
                imageUrl={url}
                title={title}
                badge={imageBadge}
                coordinate={imageCoordinate}
            />
        )
    }

    // Office docs + PDF (optional) via OnlyOffice modal embed
    if (
        onlyOfficeReady &&
        mediaId &&
        (!isPdf || (preferOnlyOfficeForPdf && pdfEngine === 'onlyoffice'))
    ) {
        return (
            <OnlyOfficePreviewModal
                isOpen={isOpen}
                onClose={onClose}
                mediaId={mediaId}
                title={title || resolvedFileName}
                fileName={resolvedFileName}
                downloadUrl={url}
                preferredMode="view"
                onDocumentSaved={onDocumentSaved}
            />
        )
    }

    if (isPdf) {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent
                    showCloseButton={false}
                    className="flex h-[90vh] w-[95vw] max-w-screen-xl flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-2xl sm:max-w-screen-xl"
                >
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
                        <div className="min-w-0">
                            <DialogTitle className="truncate text-base font-bold">{title}</DialogTitle>
                            <DialogDescription className="sr-only">
                                Pratinjau PDF {resolvedFileName}
                            </DialogDescription>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">
                                    PDF · browser
                                </Badge>
                                {mediaId && preferOnlyOfficeForPdf && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs"
                                        onClick={() => setPdfEngine('onlyoffice')}
                                    >
                                        Gunakan ONLYOFFICE
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {mediaId && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        openOnlyOfficeViewerWithMode(mediaId, {
                                            title,
                                            mode: 'view',
                                        })
                                    }
                                >
                                    Tab penuh
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                Tutup
                            </Button>
                        </div>
                    </DialogHeader>
                    <iframe
                        src={url}
                        title={resolvedFileName}
                        className="min-h-0 flex-1 border-0 bg-white"
                    />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {title || 'Pratinjau tidak tersedia'}
                    </DialogTitle>
                    <DialogDescription>
                        {mediaId
                            ? 'Pratinjau membutuhkan ONLYOFFICE Document Server yang aktif.'
                            : 'Berkas ini tidak memiliki media ID, sehingga tidak bisa dibuka di editor.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Tutup
                    </Button>
                    {mediaId ? (
                        <Button
                            onClick={() =>
                                openOnlyOfficeViewerWithMode(mediaId, { title, mode: 'view' })
                            }
                        >
                            Buka Editor
                        </Button>
                    ) : (
                        <Button onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
                            <Download className="mr-2 h-4 w-4" />
                            Unduh
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
