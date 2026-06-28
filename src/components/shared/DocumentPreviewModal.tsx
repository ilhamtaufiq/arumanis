import { DocViewerModal } from '@/components/shared/DocViewerModal';
import { ImagePreviewModal } from '@/components/shared/ImagePreviewModal';
import { OnlyOfficePreviewModal } from '@/components/shared/OnlyOfficePreviewModal';
import { isOnlyOfficeSupported } from '@/features/documents/lib/onlyoffice-support';
import { getPreviewKind } from '@/lib/file-preview';

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

    if (mediaId && isOnlyOfficeSupported(resolvedFileName)) {
        return (
            <OnlyOfficePreviewModal
                isOpen={isOpen}
                onClose={onClose}
                mediaId={mediaId}
                title={title}
                fileName={resolvedFileName}
                fallbackUrl={url}
                onDocumentSaved={onDocumentSaved}
            />
        );
    }

    return (
        <DocViewerModal
            isOpen={isOpen}
            onClose={onClose}
            documents={[{
                uri: url,
                fileName: resolvedFileName,
            }]}
            title={title}
        />
    );
}