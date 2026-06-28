import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Download, X } from 'lucide-react';
import { ImagePreviewModal } from '@/components/shared/ImagePreviewModal';
import { isOnlyOfficeSupported } from '@/features/documents/lib/onlyoffice-support';
import { buildOnlyOfficeViewerUrl } from '@/features/documents/lib/onlyoffice-editor';
import { getPreviewKind, isImageFile } from '@/lib/file-preview';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
}: DocumentPreviewModalProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen || !url || !mediaId) {
            return;
        }

        const resolvedFileName = fileName || url.split('/').pop() || title || 'document';
        const previewKind = getPreviewKind(url, resolvedFileName);
        const isImage = previewKind === 'image' || isImageFile(resolvedFileName) || isImageFile(url);

        if (isImage || previewKind === 'pdf' || !isOnlyOfficeSupported(resolvedFileName)) {
            return;
        }

        onClose();
        void navigate({
            to: '/documents/onlyoffice/$mediaId',
            params: { mediaId: String(mediaId) },
            search: title ? { title } : {},
        });
    }, [isOpen, url, mediaId, fileName, title, navigate, onClose]);

    if (!isOpen || !url) {
        return null;
    }

    const resolvedFileName = fileName || url.split('/').pop() || title || 'document';
    const previewKind = getPreviewKind(url, resolvedFileName);

    if (previewKind === 'pdf') {
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
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogHeader>
                    <iframe src={url} title={resolvedFileName} className="min-h-0 flex-1 border-0 bg-white" />
                </DialogContent>
            </Dialog>
        );
    }

    const isImage = previewKind === 'image' || isImageFile(resolvedFileName) || isImageFile(url);

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
        );
    }

    if (mediaId && isOnlyOfficeSupported(resolvedFileName)) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title || 'Pratinjau tidak tersedia'}</DialogTitle>
                    <DialogDescription>
                        Pratinjau dokumen membutuhkan ONLYOFFICE Document Server. Pastikan server aktif dan berkas memiliki media ID yang valid.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Tutup</Button>
                    {mediaId ? (
                        <Button onClick={() => window.open(buildOnlyOfficeViewerUrl(mediaId, title), '_blank', 'noopener,noreferrer')}>
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
    );
}