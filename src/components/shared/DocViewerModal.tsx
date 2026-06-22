import React from 'react';
import DocViewer, { DocViewerRenderers } from '@iamjariwala/react-doc-viewer';
import '@iamjariwala/react-doc-viewer/dist/index.css';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { X, ExternalLink, Download, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPreviewKind, isLocalPreviewUrl } from '@/lib/file-preview';

interface DocViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    documents: { uri: string; fileName?: string; fileType?: string }[];
    title?: string;
}

export const DocViewerModal: React.FC<DocViewerModalProps> = ({
    isOpen,
    onClose,
    documents,
    title = 'Pratinjau Dokumen',
}) => {
    const validDocuments = (documents ?? []).filter((doc) => doc?.uri);

    if (!isOpen || validDocuments.length === 0) {
        return null;
    }

    const currentDoc = validDocuments[0];
    const previewKind = getPreviewKind(currentDoc.uri, currentDoc.fileName);
    const needsPublicAccess = previewKind === 'office'
        && isLocalPreviewUrl(currentDoc.uri);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = currentDoc.uri;
        link.download = currentDoc.fileName || 'document';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenNewTab = () => {
        window.open(currentDoc.uri, '_blank', 'noopener,noreferrer');
    };

    const toggleFullscreen = () => {
        const element = document.getElementById('doc-viewer-container');
        if (!element) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            element.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }
    };

    const renderPreviewBody = () => {
        if (needsPublicAccess) {
            return (
                <div className="flex h-full items-center justify-center p-6">
                    <div className="max-w-md space-y-4 rounded-2xl border bg-card p-8 text-center shadow-lg">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <ExternalLink size={32} />
                        </div>
                        <h3 className="text-lg font-bold">Butuh Akses Publik</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Dokumen <span className="font-mono text-primary">{currentDoc.uri.split('/').pop()}</span> tidak bisa dipratinjau di domain lokal (.test) karena membutuhkan layanan Office Online.
                        </p>
                        <Button onClick={handleDownload} className="w-full gap-2">
                            <Download size={16} />
                            Unduh File untuk Dilihat
                        </Button>
                    </div>
                </div>
            );
        }

        if (previewKind === 'image') {
            return (
                <div className="flex h-full min-h-0 items-center justify-center bg-muted/10 p-4">
                    <img
                        src={currentDoc.uri}
                        alt={currentDoc.fileName || title}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
            );
        }

        if (previewKind === 'pdf') {
            return (
                <iframe
                    src={currentDoc.uri}
                    title={currentDoc.fileName || title}
                    className="h-full w-full border-0 bg-white"
                />
            );
        }

        return (
            <DocViewer
                documents={validDocuments}
                pluginRenderers={DocViewerRenderers}
                theme={{
                    primary: '#0f172a',
                    secondary: '#ffffff',
                    tertiary: '#f1f5f9',
                    textPrimary: '#0f172a',
                    textSecondary: '#64748b',
                    textTertiary: '#94a3b8',
                    disableThemeScrollbar: false,
                }}
                config={{
                    header: {
                        disableHeader: true,
                        disableFileName: true,
                        retainURLParams: false,
                    },
                }}
                style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'transparent',
                }}
            />
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="flex h-[90vh] w-[95vw] max-w-screen-xl flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-2xl sm:max-w-screen-xl"
            >
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/30 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 rounded-lg bg-blue-100 hover:bg-blue-200"
                            onClick={toggleFullscreen}
                            title="Layar Penuh"
                        >
                            <Maximize2 size={20} className="text-blue-700" />
                        </Button>
                        <div className="min-w-0">
                            <DialogTitle className="truncate text-base font-bold md:max-w-md">
                                {title}
                            </DialogTitle>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {needsPublicAccess ? 'Pratinjau Terbatas (Lokal)' : 'Document Viewer'}
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden h-8 gap-1.5 border-blue-200 bg-blue-50 px-3 text-blue-700 sm:flex"
                            onClick={toggleFullscreen}
                        >
                            <Maximize2 size={14} />
                            Fullscreen
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2 md:px-3" onClick={handleOpenNewTab}>
                            <ExternalLink size={14} />
                            <span className="hidden sm:inline">Tab Baru</span>
                        </Button>
                        <Button variant="default" size="sm" className="h-8 gap-1.5 px-2 md:px-3" onClick={handleDownload}>
                            <Download size={14} />
                            <span className="hidden sm:inline">Unduh</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={onClose}
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </DialogHeader>

                <div id="doc-viewer-container" className="relative min-h-0 flex-1 overflow-hidden bg-muted/10">
                    {renderPreviewBody()}
                </div>
            </DialogContent>
        </Dialog>
    );
};