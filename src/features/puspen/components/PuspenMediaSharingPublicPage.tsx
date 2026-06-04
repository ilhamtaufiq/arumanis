import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import * as pdfjsLib from 'pdfjs-dist'
import { ChevronLeft, ChevronRight, Download, Eye, FileText, Image, Loader2, Share2, Video, X } from 'lucide-react'

import { getPublicPuspenMediaShare, type PuspenSharedFile } from '../api/media-sharing'
import { PuspenMasterLayout } from './PuspenMasterLayout'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

function formatFileSize(size: number) {
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
    return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function getFileTypeLabel(mimeType?: string) {
    if (!mimeType) return 'FILE'
    if (mimeType.startsWith('image/')) return 'GAMBAR'
    if (mimeType.startsWith('video/')) return 'VIDEO'
    if (mimeType.includes('pdf')) return 'PDF'
    return 'DOKUMEN'
}

function PdfPreview({ file }: { file: PuspenSharedFile }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        let isMounted = true

        const loadPdf = async () => {
            setIsLoading(true)
            setErrorMessage('')

            try {
                const response = await fetch(file.previewUrl, {
                    headers: { Accept: 'application/pdf' },
                })

                if (!response.ok) {
                    throw new Error('Gagal mengambil PDF')
                }

                const bytes = new Uint8Array(await response.arrayBuffer())
                const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise

                if (!isMounted) return

                setPdfBytes(bytes)
                setTotalPages(pdf.numPages)
                setPageNumber(1)
            } catch (error) {
                console.error('Failed to load PDF preview:', error)
                if (isMounted) {
                    setErrorMessage('Preview PDF gagal dimuat.')
                    setPdfBytes(null)
                    setTotalPages(0)
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        void loadPdf()

        return () => {
            isMounted = false
        }
    }, [file.previewUrl])

    useEffect(() => {
        let isMounted = true

        const renderPage = async () => {
            if (!pdfBytes || !canvasRef.current) return

            try {
                const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise
                const page = await pdf.getPage(pageNumber)
                const canvas = canvasRef.current
                if (!canvas || !isMounted) return

                const containerWidth = canvas.parentElement?.clientWidth ?? 900
                const baseViewport = page.getViewport({ scale: 1 })
                const scale = Math.min(1.8, Math.max(0.8, (containerWidth - 24) / baseViewport.width))
                const viewport = page.getViewport({ scale })
                const context = canvas.getContext('2d')
                if (!context) return

                canvas.width = Math.floor(viewport.width)
                canvas.height = Math.floor(viewport.height)
                canvas.style.width = `${Math.floor(viewport.width)}px`
                canvas.style.height = `${Math.floor(viewport.height)}px`

                await page.render({
                    canvasContext: context,
                    viewport,
                }).promise
            } catch (error) {
                console.error('Failed to render PDF preview:', error)
                if (isMounted) {
                    setErrorMessage('Preview PDF gagal dirender.')
                }
            }
        }

        void renderPage()

        return () => {
            isMounted = false
        }
    }, [pageNumber, pdfBytes])

    if (isLoading) {
        return (
            <div className="flex h-[70svh] items-center justify-center bg-[#FFF7E8]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (errorMessage) {
        return (
            <div className="flex h-80 items-center justify-center bg-[#FFF7E8] p-6 text-center">
                <div>
                    <FileText className="mx-auto h-10 w-10" />
                    <div className="mt-3 text-lg font-black uppercase">{errorMessage}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-[#FFF7E8]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#111111] bg-[#FFFFFF] p-3">
                <button
                    type="button"
                    onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
                    disabled={pageNumber <= 1}
                    className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_0_#111111] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                </button>
                <div className="border-[3px] border-[#111111] bg-[#FFB703] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-[3px_3px_0_0_#111111]">
                    Halaman {pageNumber}/{totalPages || 1}
                </div>
                <button
                    type="button"
                    onClick={() => setPageNumber((current) => Math.min(totalPages, current + 1))}
                    disabled={pageNumber >= totalPages}
                    className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_0_#111111] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Berikutnya
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <div className="max-h-[70svh] overflow-auto p-3">
                <canvas ref={canvasRef} className="mx-auto block bg-[#FFFFFF] shadow-[3px_3px_0_0_#111111]" />
            </div>
        </div>
    )
}

function renderPublicPreview(file: PuspenSharedFile) {
    if (file.mimeType.startsWith('image/')) {
        return <img src={file.previewUrl} alt={file.fileName} className="aspect-video w-full bg-[#FFF7E8] object-contain" />
    }

    if (file.mimeType.startsWith('video/')) {
        return <video src={file.previewUrl} className="aspect-video w-full bg-[#111111] object-contain" controls />
    }

    if (file.mimeType.includes('pdf')) {
        return <PdfPreview file={file} />
    }

    return (
        <div className="flex aspect-video items-center justify-center bg-[#FFF7E8]">
            <FileText className="h-8 w-8" />
        </div>
    )
}

export function PuspenMediaSharingPublicPage({ shareToken }: { shareToken: string }) {
    const [previewFile, setPreviewFile] = useState<PuspenSharedFile | null>(null)
    const shareQuery = useQuery({
        queryKey: ['public-puspen-media-share', shareToken],
        queryFn: () => getPublicPuspenMediaShare(shareToken),
    })

    const share = shareQuery.data
    const file = share?.file
    const files = share?.files ?? []
    const totalSize = files.reduce((total, item) => total + item.size, 0)

    return (
        <PuspenMasterLayout
            eyebrow={(
                <span className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Link Publik
                </span>
            )}
            title="UNDUH MEDIA"
            description="Buka media publik Puspen dan unduh file yang dibagikan melalui link ini."
            aside={(
                <>
                    <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]/60">
                            Status Link
                        </div>
                        <div className="mt-2 text-2xl font-black uppercase tracking-[0.04em]">
                            {shareQuery.isLoading ? 'Memuat' : share ? 'Siap Download' : 'Tidak Tersedia'}
                        </div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Link ini dapat dibuka tanpa login selama masih aktif dan file tersedia di server.
                        </p>
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#FFB703] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em]">Puspen Arumanis</div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Pastikan file yang diunduh sesuai dengan informasi yang dikirim melalui kanal resmi.
                        </p>
                    </div>
                </>
            )}
        >
            <div className="mt-8 border-[3px] border-[#111111] bg-[#FFFFFF] p-5 shadow-[6px_6px_0_0_#111111]">
                {shareQuery.isLoading ? (
                    <div className="flex items-center justify-center border-[3px] border-dashed border-[#111111] bg-[#FFF7E8] py-20">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : shareQuery.isError || !share ? (
                    <div className="border-[3px] border-dashed border-[#111111] bg-[#FFF7E8] p-5">
                        <div className="text-2xl font-black uppercase">Link tidak tersedia</div>
                        <p className="mt-2 text-sm font-bold leading-6 text-[#111111]/70">
                            File mungkin sudah dikunci, kedaluwarsa, atau dihapus dari server.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="flex flex-col gap-4 border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111] lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#8ECAE6] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0_0_#111111]">
                                    <FileText className="h-4 w-4" />
                                    {files.length > 1 ? `${files.length} MEDIA` : getFileTypeLabel(file?.mimeType)}
                                </div>
                                <h2 className="mt-4 text-4xl font-black uppercase leading-none tracking-[0.04em]">
                                    {share.title}
                                </h2>
                                <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[#111111]/75">
                                    {share.description || 'File publik Puspen siap diunduh.'}
                                </p>
                            </div>

                            <a
                                href={share.downloadUrl}
                                className="inline-flex items-center justify-center gap-2 border-[3px] border-[#111111] bg-[#2ECC71] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] shadow-[6px_6px_0_0_#111111] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                            >
                                <Download className="h-4 w-4" />
                                {files.length > 1 ? 'Download ZIP' : 'Download'}
                            </a>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">File</div>
                                <div className="mt-1 break-words text-sm font-black">
                                    {files.length > 1 ? `${files.length} media` : (file?.fileName ?? '-')}
                                </div>
                            </div>
                            <div className="border-[3px] border-[#111111] bg-[#FFB703] p-4 shadow-[3px_3px_0_0_#111111]">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">Ukuran</div>
                                <div className="mt-1 text-sm font-black">{files.length > 0 ? formatFileSize(totalSize) : '-'}</div>
                            </div>
                            <div className="border-[3px] border-[#111111] bg-[#8ECAE6] p-4 shadow-[3px_3px_0_0_#111111]">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">Download</div>
                                <div className="mt-1 text-sm font-black">{share.downloadCount} kali</div>
                            </div>
                        </div>

                        {previewFile ? (
                            <div className="overflow-hidden border-[3px] border-[#111111] bg-[#FFFFFF] shadow-[6px_6px_0_0_#111111]">
                                <div className="flex items-center justify-between gap-3 border-b-[3px] border-[#111111] bg-[#8ECAE6] p-3">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-black uppercase tracking-[0.08em]">
                                            {previewFile.fileName}
                                        </div>
                                        <div className="mt-1 text-xs font-bold text-[#111111]/70">
                                            {getFileTypeLabel(previewFile.mimeType)} / {formatFileSize(previewFile.size)}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewFile(null)}
                                        className="shrink-0 border-[3px] border-[#111111] bg-[#FFFFFF] p-2 shadow-[3px_3px_0_0_#111111]"
                                        aria-label="Tutup preview"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                {renderPublicPreview(previewFile)}
                            </div>
                        ) : null}

                        {files.length > 0 ? (
                            <div className="space-y-3 border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">Media Dibagikan</div>
                                        <div className="mt-1 text-sm font-bold text-[#111111]/70">
                                            Klik lihat untuk membuka preview media.
                                        </div>
                                    </div>
                                    <div className="border-[3px] border-[#111111] bg-[#FFFFFF] px-3 py-2 text-xs font-black uppercase tracking-[0.16em]">
                                        {files.length} item
                                    </div>
                                </div>
                                <div className="divide-y-[3px] divide-[#111111] border-[3px] border-[#111111] bg-[#FFFFFF]">
                                {files.map((item) => (
                                    <div key={item.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="shrink-0 border-[3px] border-[#111111] bg-[#8ECAE6] p-2">
                                                {item.mimeType.startsWith('image/') ? <Image className="h-4 w-4" /> : item.mimeType.startsWith('video/') ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
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
                                                <div className="border-[3px] border-[#111111] bg-[#FFF7E8] px-2 py-1 text-xs font-black uppercase tracking-[0.12em]">
                                                    {item.folderPath}
                                                </div>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => setPreviewFile(item)}
                                                className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFB703] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_0_#111111]"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Lihat
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </div>
                        ) : null}

                        {files.length > 1 ? (
                            <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">Isi Share</div>
                                <div className="mt-3 space-y-2">
                                    {files.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between gap-3 border-[3px] border-[#111111] bg-[#FFFFFF] px-3 py-2 text-sm font-bold">
                                            <span className="min-w-0 truncate">{item.folderPath ? `${item.folderPath}/${item.fileName}` : item.fileName}</span>
                                            <span className="shrink-0 text-xs text-[#111111]/60">{formatFileSize(item.size)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </PuspenMasterLayout>
    )
}
