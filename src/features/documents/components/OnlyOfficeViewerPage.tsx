import { useSearch, useParams, useNavigate } from '@tanstack/react-router'
import { DocumentEditor } from '@onlyoffice/document-editor-react'
import {
    ArrowLeft,
    Download,
    Eye,
    Loader2,
    Pencil,
    RefreshCw,
    Save,
} from 'lucide-react'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useOnlyOfficeEditor } from '@/features/documents/lib/onlyoffice-hooks'
import type { OnlyOfficeEditorMode } from '@/features/documents/api/onlyoffice'

type OnlyOfficeViewerSearch = {
    title?: string
    mode?: OnlyOfficeEditorMode
}

export default function OnlyOfficeViewerPage() {
    const navigate = useNavigate()
    const { mediaId } = useParams({ from: '/_authenticated/documents/onlyoffice/$mediaId' })
    const search = useSearch({
        from: '/_authenticated/documents/onlyoffice/$mediaId',
    }) as OnlyOfficeViewerSearch
    const numericMediaId = Number(mediaId)

    const editor = useOnlyOfficeEditor({
        mediaId: numericMediaId,
        enabled: Number.isFinite(numericMediaId) && numericMediaId > 0,
        preferredMode: search.mode,
        forceViewOnMobile: true,
    })

    const pageTitle = search.title || editor.editorConfig?.media.file_name || 'Pratinjau Dokumen'
    const modeLabel = editor.mode === 'edit' ? 'Mode Edit' : 'Mode Lihat'
    const ModeIcon = editor.mode === 'edit' ? Pencil : Eye

    const handleDownload = () => {
        const url = editor.editorConfig?.download_url
        if (!url) return
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const handleBack = () => {
        if (editor.dirty) {
            const ok = window.confirm('Ada perubahan belum tersimpan. Tinggalkan halaman?')
            if (!ok) return
        }
        if (window.history.length > 1) {
            window.history.back()
            return
        }
        void navigate({ to: '/berkas' })
    }

    return (
        <PageContainer>
            <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={handleBack}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-bold md:max-w-xl">{pageTitle}</h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    ONLYOFFICE
                                </p>
                                {editor.editorConfig && (
                                    <Badge
                                        variant={editor.mode === 'edit' ? 'default' : 'secondary'}
                                        className="h-5 gap-1 px-2 text-[10px]"
                                    >
                                        <ModeIcon className="h-3 w-3" />
                                        {modeLabel}
                                    </Badge>
                                )}
                                {editor.dirty && (
                                    <Badge
                                        variant="outline"
                                        className="h-5 border-amber-500 text-[10px] text-amber-700"
                                    >
                                        Belum disimpan
                                    </Badge>
                                )}
                                {editor.isMobile && (
                                    <Badge variant="outline" className="h-5 text-[10px]">
                                        Mobile · mode lihat
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {editor.canEdit && !editor.isMobile && (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={editor.loading}
                                onClick={() =>
                                    void editor.switchMode(editor.mode === 'edit' ? 'view' : 'edit')
                                }
                            >
                                {editor.mode === 'edit' ? (
                                    <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Mode Lihat
                                    </>
                                ) : (
                                    <>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Mode Edit
                                    </>
                                )}
                            </Button>
                        )}
                        {editor.mode === 'edit' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={editor.saving || !editor.dirty}
                                onClick={() => editor.requestForceSave()}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {editor.saving ? 'Menyimpan…' : 'Simpan'}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            disabled={!editor.editorConfig?.download_url}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Unduh
                        </Button>
                    </div>
                </div>

                {editor.dirty && editor.mode === 'edit' && (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
                        Dokumen diubah. Klik <strong>Simpan</strong> (forcesave) agar perubahan
                        tersimpan ke server. Media ID tidak berubah.
                    </div>
                )}

                <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border bg-muted/10 shadow-sm">
                    {editor.loading && (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!editor.loading && editor.error && (
                        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                            <p className="max-w-md text-sm text-muted-foreground">{editor.error}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Button variant="outline" onClick={editor.retry}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Coba lagi
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDownload}
                                    disabled={!editor.editorConfig?.download_url}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Unduh File
                                </Button>
                                <Button variant="ghost" onClick={handleBack}>
                                    Kembali
                                </Button>
                            </div>
                        </div>
                    )}

                    {!editor.loading &&
                        !editor.error &&
                        editor.editorConfig &&
                        editor.editorMounted && (
                            <DocumentEditor
                                key={`${numericMediaId}-${editor.editorDomId}-${editor.mode}`}
                                id={editor.editorDomId}
                                documentServerUrl={editor.documentServerUrl}
                                config={editor.editorConfig.config}
                                width="100%"
                                height="100%"
                                onLoadComponentError={editor.handleLoadComponentError}
                                events_onDocumentStateChange={editor.handleDocumentStateChange}
                                events_onError={editor.handleRuntimeError}
                            />
                        )}
                </div>
            </div>
        </PageContainer>
    )
}
