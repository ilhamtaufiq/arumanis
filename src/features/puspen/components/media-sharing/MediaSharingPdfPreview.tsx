import { useEffect, useRef, useState } from 'react'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import * as pdfjsLib from 'pdfjs-dist'
import { ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react'
import type { PuspenSharedFile } from '../../api/media-sharing'
import { puspenBorder, puspenPressable, puspenShadowMd } from '../../lib/tokens'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

type MediaSharingPdfPreviewProps = {
    file: PuspenSharedFile
}

export function MediaSharingPdfPreview({ file }: MediaSharingPdfPreviewProps) {
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
            <div className="flex h-80 flex-col items-center justify-center gap-3 bg-[#FFF7E8] p-6 text-center">
                <FileText className="h-10 w-10" />
                <div className="text-lg font-black uppercase">{errorMessage}</div>
            </div>
        )
    }

    return (
        <div className="bg-[#FFF7E8]">
            <div className={`flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#111111] bg-[#FFFFFF] p-3`}>
                <button
                    type="button"
                    onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
                    disabled={pageNumber <= 1}
                    className={`inline-flex items-center gap-2 bg-[#FFF7E8] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                </button>
                <div className={`bg-[#FFB703] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] ${puspenBorder} ${puspenShadowMd}`}>
                    Halaman {pageNumber}/{totalPages || 1}
                </div>
                <button
                    type="button"
                    onClick={() => setPageNumber((current) => Math.min(totalPages, current + 1))}
                    disabled={pageNumber >= totalPages}
                    className={`inline-flex items-center gap-2 bg-[#FFF7E8] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ${puspenBorder} ${puspenShadowMd} ${puspenPressable} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    Berikutnya
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <div className="max-h-[70svh] overflow-auto p-3">
                <canvas ref={canvasRef} className={`mx-auto block bg-[#FFFFFF] ${puspenShadowMd}`} />
            </div>
        </div>
    )
}