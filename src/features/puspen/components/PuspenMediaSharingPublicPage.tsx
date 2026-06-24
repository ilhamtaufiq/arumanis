import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Download,
    Eye,
    FileText,
    HardDrive,
    Loader2,
    Share2,
    X,
} from 'lucide-react'

import { getPublicPuspenMediaShare, type PuspenSharedFile } from '../api/media-sharing'
import { formatFileSize, getFileTypeLabel } from '../lib/media-sharing-format'
import { PuspenToolLayout } from './PuspenToolLayout'
import { PUSPEN_TOOLS } from '../lib/tool-meta'
import { MediaSharingFileTile } from './media-sharing/MediaSharingFileTile'
import { MediaSharingPreviewPanel } from './media-sharing/MediaSharingPreviewPanel'
import { MediaSharingPdfPreview } from './media-sharing/MediaSharingPdfPreview'
import { puspenBorder, puspenPressable, puspenShadowLg, puspenShadowMd } from '../lib/tokens'

function renderInlinePreview(file: PuspenSharedFile) {
    if (file.mimeType.startsWith('image/')) {
        return (
            <img
                src={file.previewUrl}
                alt={file.fileName}
                className="aspect-video w-full bg-[#FFF7E8] object-contain"
            />
        )
    }

    if (file.mimeType.startsWith('video/')) {
        return (
            <video
                src={file.previewUrl}
                className="aspect-video w-full bg-[#111111] object-contain"
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
        <div className="flex aspect-video items-center justify-center bg-[#FFF7E8]">
            <FileText className="h-8 w-8" />
        </div>
    )
}

export function PuspenMediaSharingPublicPage({ shareToken }: { shareToken: string }) {
    const [previewFile, setPreviewFile] = useState<PuspenSharedFile | null>(null)
    const [inlinePreviewFile, setInlinePreviewFile] = useState<PuspenSharedFile | null>(null)

    const shareQuery = useQuery({
        queryKey: ['public-puspen-media-share', shareToken],
        queryFn: () => getPublicPuspenMediaShare(shareToken),
    })

    const share = shareQuery.data
    const file = share?.file
    const files = share?.files ?? []
    const totalSize = files.reduce((total, item) => total + item.size, 0)
    const isMultiFile = files.length > 1
    const tool = PUSPEN_TOOLS.mediaSharing

    const openPreview = (item: PuspenSharedFile) => {
        setInlinePreviewFile(item)
        setPreviewFile(null)
    }

    return (
        <PuspenToolLayout
            slot={tool.slot}
            toolName="Link Publik"
            accent={tool.accent}
            showHubBack={false}
            showDashboardExit={false}
            eyebrow={(
                <span className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Public Download
                </span>
            )}
            title="Unduh Media"
            description="Buka media publik Puspen dan unduh file yang dibagikan melalui link ini tanpa login."
            aside={(
                <>
                    <div className={`bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]/60">
                            Status Link
                        </div>
                        <div className="mt-2 text-2xl font-black uppercase tracking-[0.04em]">
                            {shareQuery.isLoading ? 'Memuat' : share ? 'Siap Download' : 'Tidak Ada'}
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Link aktif selama file masih tersedia di server Puspen.
                        </p>
                    </div>

                    <div className={`bg-[#FFB703] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                        <div className="text-sm font-black uppercase tracking-[0.2em]">Puspen Arumanis</div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Pastikan file yang diunduh sesuai informasi dari kanal resmi pengirim link.
                        </p>
                    </div>

                    {share ? (
                        <div className={`bg-[#2ECC71] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]/70">
                                Total Download
                            </div>
                            <div className="mt-1 text-3xl font-black tabular-nums">
                                {share.downloadCount}
                            </div>
                        </div>
                    ) : null}
                </>
            )}
        >
            <div className={`mt-8 bg-[#FFFFFF] p-5 ${puspenBorder} ${puspenShadowLg}`}>
                {shareQuery.isLoading ? (
                    <div className={`flex items-center justify-center border-dashed bg-[#FFF7E8] py-20 ${puspenBorder}`}>
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : shareQuery.isError || !share ? (
                    <div className={`bg-[#FFF7E8] p-5 ${puspenBorder}`}>
                        <div className="text-2xl font-black uppercase">Link Tidak Tersedia</div>
                        <p className="mt-2 text-sm font-bold leading-6 text-[#111111]/70">
                            File mungkin sudah dikunci, kedaluwarsa, atau dihapus dari server.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className={`flex flex-col gap-4 bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd} lg:flex-row lg:items-start lg:justify-between`}>
                            <div className="min-w-0 flex-1">
                                <div className={`inline-flex items-center gap-2 bg-[#8ECAE6] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] ${puspenBorder} ${puspenShadowMd}`}>
                                    <FileText className="h-4 w-4" />
                                    {isMultiFile ? `${files.length} MEDIA` : getFileTypeLabel(file?.mimeType)}
                                </div>
                                <h2 className="mt-4 text-3xl font-black uppercase leading-none tracking-[0.04em] sm:text-4xl">
                                    {share.title}
                                </h2>
                                <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[#111111]/75">
                                    {share.description || 'File publik Puspen siap diunduh.'}
                                </p>
                            </div>

                            <a
                                href={share.downloadUrl}
                                className={`inline-flex shrink-0 items-center justify-center gap-2 bg-[#2ECC71] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] ${puspenBorder} ${puspenShadowLg} ${puspenPressable}`}
                            >
                                <Download className="h-4 w-4" />
                                {isMultiFile ? 'Download ZIP' : 'Download'}
                            </a>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <div className={`bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">File</div>
                                <div className="mt-1 break-words text-sm font-black">
                                    {isMultiFile ? `${files.length} media` : (file?.fileName ?? '-')}
                                </div>
                            </div>
                            <div className={`bg-[#FFB703] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">Ukuran</div>
                                <div className="mt-1 text-sm font-black">
                                    {files.length > 0 ? formatFileSize(totalSize) : '-'}
                                </div>
                            </div>
                            <div className={`bg-[#8ECAE6] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                                <div className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                    <HardDrive className="h-3.5 w-3.5" />
                                    Download
                                </div>
                                <div className="mt-1 text-sm font-black">{share.downloadCount} kali</div>
                            </div>
                        </div>

                        {inlinePreviewFile ? (
                            <div className={`overflow-hidden bg-[#FFFFFF] ${puspenBorder} ${puspenShadowLg}`}>
                                <div className={`flex items-center justify-between gap-3 border-b-[3px] border-[#111111] bg-[#FB8500] p-3`}>
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-black uppercase tracking-[0.08em]">
                                            {inlinePreviewFile.fileName}
                                        </div>
                                        <div className="mt-1 text-xs font-bold text-[#111111]/70">
                                            {getFileTypeLabel(inlinePreviewFile.mimeType)} / {formatFileSize(inlinePreviewFile.size)}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setInlinePreviewFile(null)}
                                        className={`shrink-0 bg-[#FFFFFF] p-2 ${puspenBorder} ${puspenShadowMd} ${puspenPressable}`}
                                        aria-label="Tutup preview"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                {renderInlinePreview(inlinePreviewFile)}
                            </div>
                        ) : null}

                        {files.length > 0 ? (
                            <div className={`space-y-4 bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                            Inventory Media
                                        </div>
                                        <div className="mt-1 text-sm font-bold text-[#111111]/70">
                                            Klik tile untuk preview inline, atau tombol Lihat untuk overlay.
                                        </div>
                                    </div>
                                    <div className={`bg-[#FFFFFF] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] ${puspenBorder}`}>
                                        {files.length} item
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {files.map((item, index) => (
                                        <MediaSharingFileTile
                                            key={item.id}
                                            file={item}
                                            index={index}
                                            onPreview={(selected) => {
                                                setPreviewFile(selected)
                                                setInlinePreviewFile(null)
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className={`divide-y-[3px] divide-[#111111] bg-[#FFFFFF] ${puspenBorder}`}>
                                    {files.map((item) => (
                                        <div
                                            key={`row-${item.id}`}
                                            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className={`shrink-0 bg-[#8ECAE6] p-2 ${puspenBorder}`}>
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-black">{item.fileName}</div>
                                                    <div className="mt-1 text-xs font-bold text-[#111111]/60">
                                                        {getFileTypeLabel(item.mimeType)} / {formatFileSize(item.size)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                                {item.folderPath ? (
                                                    <div className={`bg-[#FFF7E8] px-2 py-1 text-xs font-black uppercase tracking-[0.12em] ${puspenBorder}`}>
                                                        {item.folderPath}
                                                    </div>
                                                ) : null}
                                                <button
                                                    type="button"
                                                    onClick={() => openPreview(item)}
                                                    className={`inline-flex items-center gap-2 bg-[#FFB703] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Inline
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {isMultiFile ? (
                            <div className={`bg-[#FFF7E8] p-4 ${puspenBorder} ${puspenShadowMd}`}>
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                    Isi Share
                                </div>
                                <div className="mt-3 space-y-2">
                                    {files.map((item) => (
                                        <div
                                            key={`path-${item.id}`}
                                            className={`flex items-center justify-between gap-3 bg-[#FFFFFF] px-3 py-2 text-sm font-bold ${puspenBorder}`}
                                        >
                                            <span className="min-w-0 truncate">
                                                {item.folderPath ? `${item.folderPath}/${item.fileName}` : item.fileName}
                                            </span>
                                            <span className="shrink-0 text-xs text-[#111111]/60">
                                                {formatFileSize(item.size)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            <MediaSharingPreviewPanel
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />
        </PuspenToolLayout>
    )
}