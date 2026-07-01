import { Link } from '@tanstack/react-router'
import { Copy, Download, ExternalLink, FileText, Loader2, Trash2 } from 'lucide-react'

import type { PuspenMediaShare } from '../../api/media-sharing'
import { formatFileSize } from '../../lib/media-sharing-format'
import { puspenBorder, puspenPressable, puspenShadowMd, puspenShadowSm } from '../../lib/tokens'

type MediaSharingShareTableProps = {
    shares: PuspenMediaShare[]
    isLoading: boolean
    isDeleting: boolean
    page: number
    perPage: number
    total: number
    totalPages: number
    onPageChange: (page: number) => void
    onCopyUrl: (url: string) => void
    onDelete: (id: string) => void
}

function formatShareDate(value: string | null) {
    if (!value) return '-'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'

    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function getShareMediaLabel(share: PuspenMediaShare) {
    if (share.files.length > 1) {
        return `${share.files.length} media`
    }

    return share.file?.fileName ?? 'File tidak ada'
}

function getShareTotalSize(share: PuspenMediaShare) {
    if (share.files.length === 0) return '-'
    return formatFileSize(share.files.reduce((total, file) => total + file.size, 0))
}

const actionButtonClass = `inline-flex items-center justify-center gap-1 bg-[#FFFFFF] px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${puspenBorder} ${puspenShadowSm} ${puspenPressable}`

export function MediaSharingShareTable({
    shares,
    isLoading,
    isDeleting,
    page,
    perPage,
    total,
    totalPages,
    onPageChange,
    onCopyUrl,
    onDelete,
}: MediaSharingShareTableProps) {
    if (isLoading) {
        return (
            <div className={`flex items-center justify-center border-dashed bg-[#FFFFFF] py-16 ${puspenBorder}`}>
                <Loader2 className="h-7 w-7 animate-spin" />
            </div>
        )
    }

    if (total === 0) {
        return (
            <div className={`bg-[#FFFFFF] p-4 text-sm font-bold text-[#111111]/70 ${puspenBorder}`}>
                Belum ada media sharing. Buat link pertama dari panel kiri.
            </div>
        )
    }

    const rowOffset = (page - 1) * perPage

    return (
        <div className="space-y-3">
            <div className={`overflow-hidden bg-[#FFFFFF] ${puspenBorder} ${puspenShadowMd}`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px] border-collapse text-sm">
                        <thead>
                            <tr className="bg-[#FB8500] text-left uppercase tracking-[0.16em] text-[#111111]">
                                <th className="w-12 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col">
                                    No
                                </th>
                                <th className="min-w-[200px] border-b-[3px] border-r-[3px] border-[#111111] p-3 font-black" scope="col">
                                    Judul
                                </th>
                                <th className="min-w-[160px] border-b-[3px] border-r-[3px] border-[#111111] p-3 font-black" scope="col">
                                    Media
                                </th>
                                <th className="w-24 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col">
                                    Ukuran
                                </th>
                                <th className="w-24 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col">
                                    Download
                                </th>
                                <th className="w-28 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col">
                                    Dibuat
                                </th>
                                <th className="w-28 border-b-[3px] border-r-[3px] border-[#111111] p-3 text-center font-black" scope="col">
                                    Status
                                </th>
                                <th className="min-w-[280px] border-b-[3px] border-[#111111] p-3 text-center font-black" scope="col">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {shares.map((share, index) => (
                                <tr
                                    key={share.id}
                                    className="border-b border-[#111111]/25 bg-[#FFFFFF] hover:bg-[#FFF7E8]/80"
                                >
                                    <td className="border-r-[3px] border-[#111111] p-3 text-center font-black tabular-nums text-[#1A1A2E]">
                                        {String(rowOffset + index + 1).padStart(2, '0')}
                                    </td>
                                    <td className="border-r-[3px] border-[#111111] p-3 align-top">
                                        <div className="flex items-start gap-2">
                                            <div className={`mt-0.5 shrink-0 bg-[#FFB703] p-1.5 ${puspenBorder} ${puspenShadowSm}`}>
                                                <FileText className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-black uppercase tracking-tight text-[#111111]">
                                                    {share.title}
                                                </div>
                                                <div className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#111111]/65">
                                                    {share.description || 'Tidak ada deskripsi publik.'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-r-[3px] border-[#111111] p-3 align-top">
                                        <div className="truncate font-bold text-[#111111]" title={getShareMediaLabel(share)}>
                                            {getShareMediaLabel(share)}
                                        </div>
                                    </td>
                                    <td className="border-r-[3px] border-[#111111] p-3 text-center align-top font-black tabular-nums">
                                        {getShareTotalSize(share)}
                                    </td>
                                    <td className="border-r-[3px] border-[#111111] p-3 text-center align-top font-black tabular-nums text-[#2ECC71]">
                                        {share.downloadCount}
                                    </td>
                                    <td className="border-r-[3px] border-[#111111] p-3 text-center align-top text-xs font-bold text-[#111111]/70">
                                        {formatShareDate(share.createdAt)}
                                    </td>
                                    <td className="border-r-[3px] border-[#111111] p-3 text-center align-top">
                                        <span className={`inline-block bg-[#2ECC71] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${puspenBorder}`}>
                                            Publik
                                        </span>
                                    </td>
                                    <td className="p-3 align-top">
                                        <div className="flex flex-wrap justify-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => onCopyUrl(share.publicUrl)}
                                                className={`${actionButtonClass} bg-[#8ECAE6]`}
                                                title="Salin URL publik"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                                Copy
                                            </button>
                                            <Link
                                                to="/puspen/media-sharing/$shareToken"
                                                params={{ shareToken: share.shareToken }}
                                                className={`${actionButtonClass} bg-[#FFB703]`}
                                                title="Buka halaman publik"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Publik
                                            </Link>
                                            <a
                                                href={share.downloadUrl}
                                                className={`${actionButtonClass} bg-[#2ECC71]`}
                                                title="Unduh file"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                Unduh
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(share.id)}
                                                disabled={isDeleting}
                                                className={`inline-flex items-center justify-center gap-1 bg-[#EF233C] px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#FFFFFF] ${puspenBorder} ${puspenShadowSm} ${puspenPressable} disabled:cursor-not-allowed disabled:opacity-50`}
                                                title="Hapus link sharing"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={`border-t-[3px] border-[#111111] bg-[#FFF7E8] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#111111]/70`}>
                    {total} link aktif
                </div>
            </div>

            {totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#111111]/60">
                        Halaman {page} dari {totalPages}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className={`bg-[#FFFFFF] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                            Prev
                        </button>
                        <div className={`bg-[#FFB703] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${puspenBorder} ${puspenShadowMd}`}>
                            Hal {page} / {totalPages}
                        </div>
                        <button
                            type="button"
                            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className={`bg-[#FFFFFF] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable} disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}