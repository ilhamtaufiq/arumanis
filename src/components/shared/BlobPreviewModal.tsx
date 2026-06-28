import { Download, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getPreviewKind } from '@/lib/file-preview';

type BlobPreviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    uri: string;
    fileName: string;
    title?: string;
    onDownload?: () => void;
};

export function BlobPreviewModal({
    isOpen,
    onClose,
    uri,
    fileName,
    title = 'Pratinjau Dokumen',
    onDownload,
}: BlobPreviewModalProps) {
    if (!isOpen) {
        return null;
    }

    const previewKind = getPreviewKind(uri, fileName);

    const handleDownload = () => {
        if (onDownload) {
            onDownload();
            return;
        }

        const link = document.createElement('a');
        link.href = uri;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    <iframe src={uri} title={fileName} className="min-h-0 flex-1 border-0 bg-white" />
                </DialogContent>
            </Dialog>
        );
    }

    if (previewKind === 'image') {
        return (
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent
                    showCloseButton={false}
                    className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0"
                >
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
                        <DialogTitle className="truncate text-base">{title}</DialogTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogHeader>
                    <div className="flex min-h-[280px] items-center justify-center bg-muted/10 p-4">
                        <img src={uri} alt={fileName} className="max-h-[70vh] max-w-full object-contain" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    Pratinjau dokumen hasil generate hanya tersedia setelah diunduh. Gunakan tombol unduh untuk membuka file di aplikasi Office Anda.
                </p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>Tutup</Button>
                    <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Unduh
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}