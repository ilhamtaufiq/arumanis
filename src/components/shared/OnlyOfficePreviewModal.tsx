import { useEffect, useId, useState } from 'react';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { Download, ExternalLink, Eye, Loader2, Pencil, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocViewerModal } from '@/components/shared/DocViewerModal';
import {
    fetchOnlyOfficeConfig,
    isOnlyOfficeFallbackError,
    type OnlyOfficeEditorConfig,
} from '@/features/documents/api/onlyoffice';

type OnlyOfficePreviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    mediaId: number;
    title?: string;
    fileName?: string;
    fallbackUrl: string;
    onDocumentSaved?: () => void;
};

export function OnlyOfficePreviewModal({
    isOpen,
    onClose,
    mediaId,
    title = 'Pratinjau Dokumen',
    fileName,
    fallbackUrl,
    onDocumentSaved,
}: OnlyOfficePreviewModalProps) {
    const editorInstanceId = useId().replace(/:/g, '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [useFallback, setUseFallback] = useState(false);
    const [editorConfig, setEditorConfig] = useState<OnlyOfficeEditorConfig | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setLoading(true);
            setError(null);
            setUseFallback(false);
            setEditorConfig(null);
            return;
        }

        let cancelled = false;

        const loadConfig = async () => {
            setLoading(true);
            setError(null);
            setUseFallback(false);

            try {
                const config = await fetchOnlyOfficeConfig(mediaId);
                if (!cancelled) {
                    setEditorConfig(config);
                }
            } catch (err) {
                if (cancelled) return;

                if (isOnlyOfficeFallbackError(err)) {
                    setUseFallback(true);
                    return;
                }

                setError(err instanceof Error ? err.message : 'Gagal memuat editor ONLYOFFICE.');
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

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fallbackUrl;
        link.download = fileName || 'document';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenNewTab = () => {
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    };

    if (!isOpen) {
        return null;
    }

    if (useFallback) {
        return (
            <DocViewerModal
                isOpen={isOpen}
                onClose={onClose}
                documents={[{
                    uri: fallbackUrl,
                    fileName: fileName || title,
                }]}
                title={title}
            />
        );
    }

    const modeLabel = editorConfig?.mode === 'edit' ? 'Mode Edit' : 'Mode Lihat';
    const ModeIcon = editorConfig?.mode === 'edit' ? Pencil : Eye;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="flex h-[90vh] w-[95vw] max-w-screen-xl flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-2xl sm:max-w-screen-xl"
            >
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/30 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="min-w-0">
                            <DialogTitle className="truncate text-base font-bold md:max-w-md">
                                {title}
                            </DialogTitle>
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
                            onClick={onClose}
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
                            <Button variant="outline" onClick={() => setUseFallback(true)}>
                                Gunakan pratinjau alternatif
                            </Button>
                        </div>
                    )}

                    {!loading && !error && editorConfig && (
                        <DocumentEditor
                            id={`onlyoffice-editor-${editorInstanceId}`}
                            documentServerUrl={editorConfig.documentServerUrl}
                            config={editorConfig.config}
                            width="100%"
                            height="100%"
                            events_onRequestClose={onDocumentSaved}
                            onLoadComponentError={() => setUseFallback(true)}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}