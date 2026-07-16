import { DocumentEditor } from '@onlyoffice/document-editor-react'
import {
    Download,
    ExternalLink,
    Eye,
    Loader2,
    Pencil,
    RefreshCw,
    Save,
    X,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    openOnlyOfficeViewerWithMode,
} from '@/features/documents/lib/onlyoffice-editor'
import { useOnlyOfficeEditor } from '@/features/documents/lib/onlyoffice-hooks'
import type { OnlyOfficeEditorMode } from '@/features/documents/api/onlyoffice'

type OnlyOfficePreviewModalProps = {
    isOpen: boolean
    onClose: () => void
    mediaId: number
    title?: string
    fileName?: string
    downloadUrl: string
    preferredMode?: OnlyOfficeEditorMode
    onDocumentSaved?: () => void
}

export function OnlyOfficePreviewModal({
    isOpen,
    onClose,
    mediaId,
    title = 'Pratinjau Dokumen',
    fileName,
    downloadUrl,
    preferredMode,
    onDocumentSaved,
}: OnlyOfficePreviewModalProps) {
    const editor = useOnlyOfficeEditor({
        mediaId,
        enabled: isOpen,
        preferredMode,
        forceViewOnMobile: true,
    })

    const handleClose = () => {
        if (editor.dirty) {
            const ok = window.confirm('Ada perubahan belum tersimpan. Tutup tetap?')
            if (!ok) return
        }
        editor.destroy()
        if (editor.dirtyRef.current) {
            onDocumentSaved?.()
        }
        onClose()
    }

    const handleDownload = () => {
        const url = downloadUrl || editor.editorConfig?.download_url
        if (!url) return
        const link = document.createElement('a')
        link.href = url
        link.download = fileName || editor.editorConfig?.media.file_name || 'document'
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleOpenNewTab = () => {
        openOnlyOfficeViewerWithMode(mediaId, {
            title,
            mode: editor.mode,
        })
    }

    if (!isOpen) {
        return null
    }

    const modeLabel = editor.mode === 'edit' ? 'Mode Edit' : 'Mode Lihat'
    const ModeIcon = editor.mode === 'edit' ? Pencil : Eye

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
                                    <Badge variant="outline" className="h-5 border-amber-500 text-[10px] text-amber-700">
                                        Belum disimpan
                                    </Badge>
                                )}
                                {editor.isMobile && (
                                    <Badge variant="outline" className="h-5 text-[10px]">
                                        Mobile · view
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                        {editor.canEdit && !editor.isMobile && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 px-2 md:px-3"
                                disabled={editor.loading}
                                onClick={() =>
                                    void editor.switchMode(editor.mode === 'edit' ? 'view' : 'edit')
                                }
                            >
                                {editor.mode === 'edit' ? (
                                    <Eye size={14} />
                                ) : (
                                    <Pencil size={14} />
                                )}
                                <span className="hidden sm:inline">
                                    {editor.mode === 'edit' ? 'Lihat' : 'Edit'}
                                </span>
                            </Button>
                        )}
                        {editor.mode === 'edit' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 gap-1.5 px-2 md:px-3"
                                disabled={editor.saving || !editor.dirty}
                                onClick={() => editor.requestForceSave()}
                            >
                                <Save size={14} />
                                <span className="hidden sm:inline">
                                    {editor.saving ? 'Menyimpan…' : 'Simpan'}
                                </span>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 px-2 md:px-3"
                            onClick={handleOpenNewTab}
                        >
                            <ExternalLink size={14} />
                            <span className="hidden sm:inline">Tab penuh</span>
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 gap-1.5 px-2 md:px-3"
                            onClick={handleDownload}
                        >
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
                    {editor.loading && (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {!editor.loading && editor.error && (
                        <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                            <p className="max-w-md text-sm text-muted-foreground">{editor.error}</p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <Button variant="outline" onClick={editor.retry}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Coba lagi
                                </Button>
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

                    {!editor.loading &&
                        !editor.error &&
                        editor.editorConfig &&
                        editor.editorMounted && (
                            <DocumentEditor
                                key={`${mediaId}-${editor.editorDomId}-${editor.mode}`}
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
            </DialogContent>
        </Dialog>
    )
}
