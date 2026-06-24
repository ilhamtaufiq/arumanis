import { Download, FileText, Image, Video, X } from 'lucide-react'
import type { PuspenSharedFile } from '../../api/media-sharing'
import { formatFileSize, getFileTypeLabel } from '../../lib/media-sharing-format'
import { MediaSharingPdfPreview } from './MediaSharingPdfPreview'
import { puspenBorder, puspenPressable, puspenShadowLg, puspenShadowMd } from '../../lib/tokens'

type MediaSharingPreviewPanelProps = {
    file: PuspenSharedFile | null
    onClose: () => void
}

function renderPreviewContent(file: PuspenSharedFile) {
    if (file.mimeType.startsWith('image/')) {
        return (
            <img
                src={file.previewUrl}
                alt={file.fileName}
                className="max-h-[70svh] w-full object-contain"
            />
        )
    }

    if (file.mimeType.startsWith('video/')) {
        return (
            <video
                src={file.previewUrl}
                className="max-h-[70svh] w-full bg-[#111111] object-contain"
                controls
                playsInline
                preload="metadata"
            />
        )
    }

    if (file.mimeType.includes('pdf')) {
        return <MediaSharingPdfPreview file={file} />
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
            <FileText className="h-12 w-12" />
            <p className="text-sm font-black uppercase">Preview tidak tersedia</p>
        </div>
    )
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
}

export function MediaSharingPreviewPanel({ file, onClose }: MediaSharingPreviewPanelProps) {
    if (!file) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#111111]/55 p-4 sm:items-center">
            <div
                className={`flex max-h-[92svh] w-full max-w-4xl flex-col overflow-hidden bg-[#FFFFFF] ${puspenBorder} ${puspenShadowLg}`}
                role="dialog"
                aria-modal="true"
                aria-label={`Preview ${file.fileName}`}
            >
                <div className={`flex shrink-0 items-start justify-between gap-3 border-b-[3px] border-[#111111] bg-[#8ECAE6] p-4`}>
                    <div className="min-w-0 space-y-2">
                        <h2 className="truncate text-base font-black uppercase tracking-[0.06em]">
                            {file.fileName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 bg-[#FFB703] px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${puspenBorder} ${puspenShadowMd}`}>
                                <FileTypeIcon mimeType={file.mimeType} />
                                {getFileTypeLabel(file.mimeType)}
                            </span>
                            <span className="text-xs font-bold text-[#111111]/70">
                                {formatFileSize(file.size)}
                            </span>
                            {file.folderPath ? (
                                <span className={`bg-[#FFF7E8] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${puspenBorder}`}>
                                    {file.folderPath}
                                </span>
                            ) : null}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`shrink-0 bg-[#FFFFFF] p-2 ${puspenBorder} ${puspenShadowMd} ${puspenPressable}`}
                        aria-label="Tutup preview"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-auto bg-[#FFF7E8]">
                    {renderPreviewContent(file)}
                </div>

                <div className={`flex shrink-0 items-center justify-end gap-2 border-t-[3px] border-[#111111] bg-[#FFFFFF] p-3`}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`inline-flex items-center gap-2 bg-[#FFF7E8] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable}`}
                    >
                        <X className="h-4 w-4" />
                        Tutup
                    </button>
                    <a
                        href={file.url}
                        download={file.fileName}
                        className={`inline-flex items-center gap-2 bg-[#2ECC71] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable}`}
                    >
                        <Download className="h-4 w-4" />
                        Unduh File
                    </a>
                </div>
            </div>
        </div>
    )
}