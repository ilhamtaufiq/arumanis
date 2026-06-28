import { Download, X } from 'lucide-react';
import { ImagePreviewModal } from '@/components/shared/ImagePreviewModal';
import { OnlyOfficePreviewModal } from '@/components/shared/OnlyOfficePreviewModal';
import { isOnlyOfficeSupported } from '@/features/documents/lib/onlyoffice-support';
import { getPreviewKind } from '@/lib/file-preview';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type DocumentPreviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
    fileName?: string;
    mediaId?: number | null;
    imageBadge?: string;
    imageCoordinate?: string | null;
    onDocumentSaved?: () => void;
};

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
}: DocumentPreviewModalProps) {
    if (!isOpen || !url) {
        return null;
    }

    const resolvedFileName = fileName || url.split('/').pop() || title || 'document';
    const previewKind = getPreviewKind(url, resolvedFileName);

    if (previewKind === 'image') {
        return (
            <ImagePreviewModal
                open={isOpen}
                onOpenChange={(open) => !open && onClose()}
                imageUrl={url}
                title={title}
                badge={imageBadge}
                coordinate={imageCoordinate}
            />
        );
    }

    if (previewKind === 'pdf') {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent
                    showCloseButton={false}
                    className="flex h-[90vh] w-[95vw] max-w-screen-xl flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-2xl sm:max-w-screen-xl"
                >
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
                        <DialogTitle className="truncate text-base font-bold">{title}</DialogTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogHeader>
                    <iframe src={url} title={resolvedFileName} className="min-h-0 flex-1 border-0 bg-white" />
                </DialogContent>
            </Dialog>
        );
    }

    if (mediaId && isOnlyOfficeSupported(resolvedFileName)) {
        return (
            <OnlyOfficePreviewModal
                isOpen={isOpen}
                onClose={onClose}
                mediaId={mediaId}
                title={title}
                fileName={resolvedFileName}
                downloadUrl={url}
                onDocumentSaved={onDocumentSaved}
            />
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title || 'Pratinjau tidak tersedia'}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Pratinjau dokumen membutuhkan ONLYOFFICE Document Server. Pastikan server aktif dan berkas memiliki media ID yang valid.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Tutup</Button>
                    <Button onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}>
                        <Download className="mr-2 h-4 w-4" />
                        Unduh
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}