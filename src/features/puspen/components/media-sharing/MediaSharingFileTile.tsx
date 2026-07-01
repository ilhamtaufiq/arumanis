import { Eye, FileText, FolderOpen, Image, Video } from 'lucide-react'
import type { PuspenSharedFile } from '../../api/media-sharing'
import { formatFileSize, getFileTypeLabel } from '../../lib/media-sharing-format'
import { puspenBorder, puspenPressable, puspenShadowMd } from '../../lib/tokens'

type MediaSharingFileTileProps = {
    file: PuspenSharedFile
    index: number
    onPreview: (file: PuspenSharedFile) => void
}

function FileThumbnail({ file }: { file: PuspenSharedFile }) {
    if (file.mimeType.startsWith('image/')) {
        return (
            <img
                src={file.previewUrl}
                alt=""
                className="h-full w-full object-cover"
            />
        )
    }

    if (file.mimeType.startsWith('video/')) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-[#111111]">
                <Video className="h-8 w-8 text-[#FFB703]" />
            </div>
        )
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-[#FFFFFF]">
            <FileText className="h-8 w-8" />
        </div>
    )
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
    if (mimeType.startsWith('image/')) return <Image className="h-3.5 w-3.5" />
    if (mimeType.startsWith('video/')) return <Video className="h-3.5 w-3.5" />
    return <FileText className="h-3.5 w-3.5" />
}

export function MediaSharingFileTile({ file, index, onPreview }: MediaSharingFileTileProps) {
    return (
        <article className={`overflow-hidden bg-[#FFFFFF] ${puspenBorder} ${puspenShadowMd}`}>
            <div className={`flex items-center justify-between gap-2 border-b-[3px] border-[#111111] bg-[#1A1A2E] px-3 py-2`}>
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FFB703]">
                    Slot {String(index + 1).padStart(2, '0')}
                </span>
                <span className={`bg-[#8ECAE6] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] ${puspenBorder}`}>
                    {getFileTypeLabel(file.mimeType)}
                </span>
            </div>

            <button
                type="button"
                onClick={() => onPreview(file)}
                className="group relative block aspect-video w-full overflow-hidden bg-[#FFF7E8]"
            >
                <FileThumbnail file={file} />
                <div className="absolute inset-0 flex items-center justify-center bg-[#111111]/0 opacity-0 transition group-hover:bg-[#111111]/35 group-hover:opacity-100">
                    <span className={`inline-flex items-center gap-1.5 bg-[#FFB703] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowMd}`}>
                        <Eye className="h-3.5 w-3.5" />
                        Lihat
                    </span>
                </div>
            </button>

            <div className="space-y-2 p-3">
                <p className="line-clamp-2 text-sm font-black leading-snug" title={file.fileName}>
                    {file.fileName}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-[#111111]/65">
                    <FileTypeIcon mimeType={file.mimeType} />
                    {formatFileSize(file.size)}
                </div>
                {file.folderPath ? (
                    <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#111111]/55">
                        <FolderOpen className="h-3 w-3 shrink-0" />
                        <span className="truncate">{file.folderPath}</span>
                    </p>
                ) : null}
                <button
                    type="button"
                    onClick={() => onPreview(file)}
                    className={`inline-flex w-full items-center justify-center gap-2 bg-[#8ECAE6] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable}`}
                >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                </button>
            </div>
        </article>
    )
}