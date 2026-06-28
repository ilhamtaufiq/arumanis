import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useParams, useSearch } from '@tanstack/react-router';
import { DocumentEditor } from '@onlyoffice/document-editor-react';
import { ArrowLeft, Eye, Loader2, Pencil } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
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
    normalizeDocumentServerUrl,
} from '@/features/documents/lib/onlyoffice-editor';

type OnlyOfficeViewerSearch = {
    title?: string;
};

export default function OnlyOfficeViewerPage() {
    const { mediaId } = useParams({ from: '/_authenticated/documents/onlyoffice/$mediaId' });
    const search = useSearch({ from: '/_authenticated/documents/onlyoffice/$mediaId' }) as OnlyOfficeViewerSearch;
    const numericMediaId = Number(mediaId);

    const editorInstanceId = useId().replace(/:/g, '');
    const editorDomId = `onlyoffice-viewer-${editorInstanceId}`;
    const documentDirtyRef = useRef(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editorConfig, setEditorConfig] = useState<OnlyOfficeEditorConfig | null>(null);
    const [editorMounted, setEditorMounted] = useState(false);

    const pageTitle = search.title || editorConfig?.media.file_name || 'Pratinjau Dokumen';

    useEffect(() => {
        if (!Number.isFinite(numericMediaId) || numericMediaId <= 0) {
            setError('Media ID tidak valid.');
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadConfig = async () => {
            setLoading(true);
            setError(null);
            setEditorConfig(null);
            setEditorMounted(false);

            try {
                const config = await fetchOnlyOfficeConfig(numericMediaId);
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
    }, [numericMediaId]);

    useEffect(() => {
        if (loading || error || !editorConfig) {
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
    }, [loading, error, editorConfig, editorDomId]);

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

    const modeLabel = editorConfig?.mode === 'edit' ? 'Mode Edit' : 'Mode Lihat';
    const ModeIcon = editorConfig?.mode === 'edit' ? Pencil : Eye;
    const documentServerUrl = editorConfig
        ? normalizeDocumentServerUrl(editorConfig.documentServerUrl)
        : '';

    return (
        <PageContainer>
            <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (window.history.length > 1) {
                                    window.history.back();
                                    return;
                                }
                                window.close();
                            }}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold md:max-w-xl">{pageTitle}</h1>
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
                </div>

                <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border bg-muted/10 shadow-sm">
                    {loading && (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                            <p className="max-w-md text-sm text-muted-foreground">{error}</p>
                            <Button variant="outline" onClick={() => window.close()}>
                                Tutup Tab
                            </Button>
                        </div>
                    )}

                    {!loading && !error && editorConfig && editorMounted && (
                        <DocumentEditor
                            key={`${numericMediaId}-${editorDomId}`}
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
            </div>
        </PageContainer>
    );
}