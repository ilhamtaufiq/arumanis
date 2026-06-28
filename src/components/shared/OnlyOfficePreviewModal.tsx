import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { Download, ExternalLink, Eye, Loader2, Pencil, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    fetchOnlyOfficeConfig,
    type OnlyOfficeEditorConfig,
} from '@/features/documents/api/onlyoffice';
import {
    destroyOnlyOfficeEditor,
    mapOnlyOfficeLoadError,
    mapOnlyOfficeRuntimeError,
    openOnlyOfficeViewer,
    resolveDocumentServerUrl,
} from '@/features/documents/lib/onlyoffice-editor';

type OnlyOfficePreviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    mediaId: number;
    title?: string;
    fileName?: string;
    downloadUrl: string;
    onDocumentSaved?: () => void;
};

export function OnlyOfficePreviewModal({
    isOpen,
    onClose,
    mediaId,
    title = 'Pratinjau Dokumen',
    fileName,
    downloadUrl,
    onDocumentSaved,
}: OnlyOfficePreviewModalProps) {
    const editorInstanceId = useId().replace(/:/g, '');
    const editorDomId = `onlyoffice-editor-${editorInstanceId}`;
    const documentDirtyRef = useRef(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editorConfig, setEditorConfig] = useState<OnlyOfficeEditorConfig | null>(null);
    const [editorMounted, setEditorMounted] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setLoading(true);
            setError(null);
            setEditorConfig(null);
            setEditorMounted(false);
            documentDirtyRef.current = false;
            return;
        }

        let cancelled = false;

        const loadConfig = async () => {
            setLoading(true);
            setError(null);
            setEditorConfig(null);
            setEditorMounted(false);

            try {
                const config = await fetchOnlyOfficeConfig(mediaId);
                if (!cancelled) {
                    setEditorConfig(config);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Gagal memuat editor ONLYOFFICE.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadConfig();

        return () => {
            cancelled = true;
        };
    }, [isOpen, mediaId]);

    useEffect(() => {
        if (!isOpen || loading || error || !editorConfig) {
            setEditorMounted(false);
            return;
        }

        const mountTimer = window.setTimeout(() => {
            setEditorMounted(true);
        }, 0);

        return () => {
            window.clearTimeout(mountTimer);
            setEditorMounted(false);
            destroyOnlyOfficeEditor(editorDomId);
        };
    }, [isOpen, loading, error, editorConfig, editorDomId]);

    const handleClose = useCallback(() => {
        destroyOnlyOfficeEditor(editorDomId);
        if (documentDirtyRef.current) {
            onDocumentSaved?.();
        }
        onClose();
    }, [editorDomId, onClose, onDocumentSaved]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || 'document';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenNewTab = () => {
        openOnlyOfficeViewer(mediaId, title);
    };

    const handleLoadComponentError = useCallback((errorCode: number, errorDescription: string) => {
        setError(mapOnlyOfficeLoadError(errorCode, errorDescription));
        setEditorMounted(false);
    }, []);

    const handleDocumentStateChange = useCallback((event: { data?: boolean }) => {
        if (event.data) {
            documentDirtyRef.current = true;
        }
    }, []);

    const handleRuntimeError = useCallback((event: { data?: string }) => {
        setError(mapOnlyOfficeRuntimeError(event));
        setEditorMounted(false);
    }, []);

    if (!isOpen) {
        return null;
    }

    const modeLabel = editorConfig?.mode === 'edit' ? 'Mode Edit' : 'Mode Lihat';
    const ModeIcon = editorConfig?.mode === 'edit' ? Pencil : Eye;
    const documentServerUrl = editorConfig
        ? resolveDocumentServerUrl(editorConfig.documentServerUrl)
        : '';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()} modal={false}>
            <DialogContent
                showCloseButton={false}
                onOpenAutoFocus={(event) => event.preventDefault()}
                onInteractOutside={(event) => event.preventDefault()}
                onPointerDownOutside={(event) => event.preventDefault()}
                className="flex h-[90vh] w-[95vw] max-w-screen-xl flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-2xl sm:max-w-screen-xl"
            >
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/30 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="min-w-0">
                            <DialogTitle className="truncate text-base font-bold md:max-w-md">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Pratinjau dokumen ONLYOFFICE untuk {title}
                            </DialogDescription>
                            <div className="mt-1 flex items-center gap-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    ONLYOFFICE
                                </p>
                                {editorConfig && (
                                    <Badge variant={editorConfig.mode === 'edit' ? 'default' : 'secondary'} className="h-5 gap-1 px-2 text-[10px]">
                                        <ModeIcon className="h-3 w-3" />
                                        {modeLabel}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
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
                            onClick={handleClose}
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/10">
                    {loading && (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                            <p className="max-w-md text-sm text-muted-foreground">{error}</p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <Button variant="outline" onClick={handleDownload}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Unduh File
                                </Button>
                                <Button variant="outline" onClick={handleOpenNewTab}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Buka di Tab Baru
                                </Button>
                                <Button variant="ghost" onClick={handleClose}>
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && editorConfig && editorMounted && (
                        <DocumentEditor
                            key={`${mediaId}-${editorDomId}`}
                            id={editorDomId}
                            documentServerUrl={documentServerUrl}
                            config={editorConfig.config}
                            width="100%"
                            height="100%"
                            onLoadComponentError={handleLoadComponentError}
                            events_onDocumentStateChange={handleDocumentStateChange}
                            events_onError={handleRuntimeError}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}