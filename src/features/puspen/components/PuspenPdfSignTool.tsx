import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal'
import { PDFDocument } from 'pdf-lib'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import * as pdfjsLib from 'pdfjs-dist'
import {
    Check,
    ChevronLeft,
    ChevronRight,
    GripVertical,
    Download,
    FileText,
    ImagePlus,
    Loader2,
    MousePointerClick,
    Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
    deleteSignatureLibrary,
    getSignatureLibraries,
    saveSignatureLibrary,
    type SignatureLibraryItem,
} from '../api/signature-library'
import {
    downloadToolPdfBlob,
    getToolPdfs,
    saveSignedToolPdf,
    type ToolPdfItem,
} from '../api/tool-pdfs'

type PdfPageInfo = {
    pageNumber: number
    width: number
    height: number
    rotation?: number
}

type SignaturePlacement = {
    id: string
    pageNumber: number
    signatureId: string
    signatureDataUrl: string | null
    xRatio: number
    yRatio: number
    scale: number
    signatureName: string
    signatureFileName: string
    signatureMimeType: string
    signatureWidth: number
    signatureHeight: number
    signatureSourceType: 'upload' | 'library' | null
    signatureSourceId: string | null
}

type SignatureMeta = {
    id: string
    name: string
    fileName: string
    dataUrl: string
    mimeType: string
    width: number
    height: number
    sourceType: 'upload' | 'library'
    sourceId: string | null
}

type HydratedSignaturePlacement = SignaturePlacement & {
    resolvedSignature: SignatureMeta
}

function toSignaturePlacement(placement: HydratedSignaturePlacement): SignaturePlacement {
    return {
        id: placement.id,
        pageNumber: placement.pageNumber,
        signatureId: placement.signatureId,
        signatureDataUrl: placement.signatureDataUrl,
        xRatio: placement.xRatio,
        yRatio: placement.yRatio,
        scale: placement.scale,
        signatureName: placement.signatureName,
        signatureFileName: placement.signatureFileName,
        signatureMimeType: placement.signatureMimeType,
        signatureWidth: placement.signatureWidth,
        signatureHeight: placement.signatureHeight,
        signatureSourceType: placement.signatureSourceType,
        signatureSourceId: placement.signatureSourceId,
    }
}

type PageThumbnail = {
    pageNumber: number
    dataUrl: string
}

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const DEFAULT_SIGNATURE_WIDTH_RATIO = 0.22
const BACKGROUND_REMOVAL_PUBLIC_PATH = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/'

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
        image.onerror = () => reject(new Error('Gagal membaca gambar tanda tangan'))
        image.src = dataUrl
    })
}

function clonePdfBytes(bytes: Uint8Array) {
    return bytes.slice()
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ''))
        reader.onerror = () => reject(new Error('Gagal mengonversi hasil background removal'))
        reader.readAsDataURL(blob)
    })
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ''))
        reader.onerror = () => reject(new Error('Gagal membaca gambar tanda tangan'))
        reader.readAsDataURL(file)
    })
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
    const base64 = dataUrl.split(',')[1] ?? ''
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index)
    }
    return bytes
}

function imageHasTransparency(dataUrl: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = image.naturalWidth
            canvas.height = image.naturalHeight
            const context = canvas.getContext('2d')

            if (!context) {
                resolve(false)
                return
            }

            context.drawImage(image, 0, 0)

            try {
                const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
                for (let index = 3; index < data.length; index += 16) {
                    if (data[index] < 255) {
                        resolve(true)
                        return
                    }
                }

                resolve(false)
            } catch (error) {
                reject(error)
            }
        }
        image.onerror = () => reject(new Error('Gagal membaca transparansi gambar'))
        image.src = dataUrl
    })
}

function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('Gagal memuat gambar'))
        image.src = dataUrl
    })
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Uint8Array {
    return dataUrlToBytes(canvas.toDataURL('image/png'))
}

function getPdfKindLabel(kind: string) {
    if (kind === 'signed') return 'Hasil TTD'
    if (kind === 'source') return 'Mentah'
    return kind
}

export function PuspenPdfSignTool() {
    const [pdfFileName, setPdfFileName] = useState<string>('')
    const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
    const [pageInfos, setPageInfos] = useState<PdfPageInfo[]>([])
    const [isLoadingPdf, setIsLoadingPdf] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [signatures, setSignatures] = useState<SignatureMeta[]>([])
    const [activeSignatureId, setActiveSignatureId] = useState<string | null>(null)
    const [signatureScale, setSignatureScale] = useState(DEFAULT_SIGNATURE_WIDTH_RATIO)
    const [placements, setPlacements] = useState<SignaturePlacement[]>([])
    const [activePage, setActivePage] = useState<number | null>(null)
    const [zoom, setZoom] = useState(1)
    const [pageThumbnails, setPageThumbnails] = useState<PageThumbnail[]>([])
    const [renderSize, setRenderSize] = useState({ width: 0, height: 0 })
    const [signatureLibraryName, setSignatureLibraryName] = useState('')
    const [signatureLibrary, setSignatureLibrary] = useState<SignatureLibraryItem[]>([])
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false)
    const [signatureLibrarySearch, setSignatureLibrarySearch] = useState('')
    const [pdfLibrary, setPdfLibrary] = useState<ToolPdfItem[]>([])
    const [isLoadingPdfLibrary, setIsLoadingPdfLibrary] = useState(false)
    const [pdfLibrarySearch, setPdfLibrarySearch] = useState('')
    const [selectedPdfSourceId, setSelectedPdfSourceId] = useState<string | null>(null)
    const [isSavingSignedPdf, setIsSavingSignedPdf] = useState(false)
    const [isRemovingSignatureBg, setIsRemovingSignatureBg] = useState(false)
    const [processProgress, setProcessProgress] = useState<number | null>(null)
    const [processLabel, setProcessLabel] = useState('')
    const [removeSignatureBackground, setRemoveSignatureBackground] = useState(true)

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const previewScrollRef = useRef<HTMLDivElement | null>(null)
    const pdfRenderTaskRef = useRef<number>(0)
    const dragPlacementIdRef = useRef<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const loadLibrary = async () => {
            setIsLoadingLibrary(true)

            try {
                const items = await getSignatureLibraries()
                if (!isMounted) return
                setSignatureLibrary(items)
            } catch (error) {
                console.error('Failed to load signature library:', error)
                toast.error('Gagal memuat daftar TTD tersimpan')
            } finally {
                if (isMounted) {
                    setIsLoadingLibrary(false)
                }
            }
        }

        void loadLibrary()

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true

        const loadPdfLibrary = async () => {
            setIsLoadingPdfLibrary(true)

            try {
                const items = await getToolPdfs({ kind: 'all' })
                if (!isMounted) return
                setPdfLibrary(items)
            } catch (error) {
                console.error('Failed to load PDF library:', error)
                toast.error('Gagal memuat daftar PDF tersimpan')
            } finally {
                if (isMounted) {
                    setIsLoadingPdfLibrary(false)
                }
            }
        }

        void loadPdfLibrary()

        return () => {
            isMounted = false
        }
    }, [])

    const activePageInfo = useMemo(
        () => pageInfos.find((page) => page.pageNumber === activePage) ?? null,
        [pageInfos, activePage]
    )

    const totalPages = pageInfos.length
    const activePageOrientation = useMemo(() => {
        if (!activePageInfo) return null
        if (activePageInfo.width === activePageInfo.height) return 'Square'
        return activePageInfo.width > activePageInfo.height ? 'Landscape' : 'Portrait'
    }, [activePageInfo])
    const zoomPercent = Math.round(zoom * 100)

    const activePlacements = useMemo(
        () => placements.filter((item) => item.pageNumber === activePage),
        [placements, activePage]
    )

    const activeSignature = useMemo(
        () => signatures.find((item) => item.id === activeSignatureId) ?? null,
        [activeSignatureId, signatures]
    )

    const signatureById = useMemo(
        () => new Map(signatures.map((item) => [item.id, item])),
        [signatures]
    )

    const filteredSignatureLibrary = useMemo(() => {
        const search = signatureLibrarySearch.trim().toLowerCase()
        if (!search) {
            return signatureLibrary
        }

        return signatureLibrary.filter((item) => item.name.toLowerCase().includes(search))
    }, [signatureLibrary, signatureLibrarySearch])

    const filteredPdfLibrary = useMemo(() => {
        const search = pdfLibrarySearch.trim().toLowerCase()
        if (!search) {
            return pdfLibrary
        }

        return pdfLibrary.filter((item) => (
            item.name.toLowerCase().includes(search)
            || (item.originalFilename ?? '').toLowerCase().includes(search)
        ))
    }, [pdfLibrary, pdfLibrarySearch])

    const loadPdfFromBytes = useCallback(async (bytes: Uint8Array, fileName: string) => {
        setIsLoadingPdf(true)
        setPdfFileName(fileName)
        setPlacements([])
        setActivePage(null)
        setPageThumbnails([])

        try {
            const storedBytes = clonePdfBytes(bytes)
            const pdfjsBytes = clonePdfBytes(bytes)
            setPdfBytes(storedBytes)

            const pdf = await pdfjsLib.getDocument({ data: pdfjsBytes }).promise
            const pages: PdfPageInfo[] = []
            const thumbnails: PageThumbnail[] = []

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                const page = await pdf.getPage(pageNumber)
                const viewport = page.getViewport({ scale: 1 })
                const thumbViewport = page.getViewport({ scale: 0.18 })
                const thumbCanvas = document.createElement('canvas')
                const thumbContext = thumbCanvas.getContext('2d')

                pages.push({
                    pageNumber,
                    width: viewport.width,
                    height: viewport.height,
                    rotation: (page as { rotate?: number }).rotate ?? 0,
                })

                if (thumbContext) {
                    thumbCanvas.width = Math.floor(thumbViewport.width)
                    thumbCanvas.height = Math.floor(thumbViewport.height)
                    await page.render({
                        canvasContext: thumbContext,
                        viewport: thumbViewport,
                    }).promise
                    thumbnails.push({
                        pageNumber,
                        dataUrl: thumbCanvas.toDataURL('image/png'),
                    })
                }
            }

            setPageInfos(pages)
            setPageThumbnails(thumbnails)
            setActivePage(pages[0]?.pageNumber ?? null)
        } catch (error) {
            console.error('Failed to load PDF:', error)
            toast.error('Gagal memuat PDF')
            setPdfBytes(null)
            setPageInfos([])
            setPageThumbnails([])
        } finally {
            setIsLoadingPdf(false)
        }
    }, [])

    const hydrateSignaturePlacements = useCallback((
        signaturePlacements: NonNullable<ToolPdfItem['signaturePlacements']>
    ): HydratedSignaturePlacement[] => {
        if (signaturePlacements.length === 0) {
            return []
        }

        const hydratedPlacements: HydratedSignaturePlacement[] = []
        const nextSignaturesById = new Map<string, SignatureMeta>()
        const signatureLibraryMap = new Map(signatureLibrary.map((item) => [item.id, item]))

        for (const placement of signaturePlacements) {
            const resolvedDataUrl = placement.signatureDataUrl
                || (placement.signatureSourceType === 'library' && placement.signatureSourceId
                    ? signatureLibraryMap.get(placement.signatureSourceId)?.dataUrl ?? null
                    : null)
            if (!resolvedDataUrl) continue

            const existingSignature = nextSignaturesById.get(placement.signatureId)
            const signatureId = existingSignature && existingSignature.dataUrl !== resolvedDataUrl
                ? `${placement.signatureId}-${placement.id}`
                : placement.signatureId
            const nextSignature: SignatureMeta = {
                id: signatureId,
                name: placement.signatureName,
                fileName: placement.signatureFileName,
                dataUrl: resolvedDataUrl,
                mimeType: placement.signatureMimeType,
                width: placement.signatureWidth,
                height: placement.signatureHeight,
                sourceType: placement.signatureSourceType ?? 'upload',
                sourceId: placement.signatureSourceId,
            }

            nextSignaturesById.set(signatureId, nextSignature)
            hydratedPlacements.push({
                id: placement.id,
                pageNumber: placement.pageNumber,
                signatureId,
                signatureDataUrl: resolvedDataUrl,
                xRatio: placement.xRatio,
                yRatio: placement.yRatio,
                scale: placement.scale,
                signatureName: placement.signatureName,
                signatureFileName: placement.signatureFileName,
                signatureMimeType: placement.signatureMimeType,
                signatureWidth: placement.signatureWidth,
                signatureHeight: placement.signatureHeight,
                signatureSourceType: placement.signatureSourceType,
                signatureSourceId: placement.signatureSourceId,
                resolvedSignature: nextSignature,
            })
        }

        const nextSignatures = Array.from(nextSignaturesById.values())
        if (nextSignatures.length === 0) {
            return []
        }

        setSignatures((current) => {
            const merged = [...nextSignatures, ...current]
            const seen = new Set<string>()
            return merged.filter((item) => {
                if (seen.has(item.id)) return false
                seen.add(item.id)
                return true
            })
        })

        setActiveSignatureId(nextSignatures[0]?.id ?? null)
        setSignatureLibraryName(nextSignatures[0]?.name ?? '')
        return hydratedPlacements
    }, [signatureLibrary])

    const loadPdf = useCallback(async (file: File) => {
        const bytes = new Uint8Array(await file.arrayBuffer())
        await loadPdfFromBytes(bytes, file.name)
        setSelectedPdfSourceId(null)
    }, [loadPdfFromBytes])

    const loadPdfFromLibrary = useCallback(async (item: ToolPdfItem) => {
        try {
            const blob = await downloadToolPdfBlob(item.id)
            const bytes = new Uint8Array(await blob.arrayBuffer())
            await loadPdfFromBytes(bytes, item.name || item.originalFilename || 'document.pdf')
            setSelectedPdfSourceId(item.id)
            if (Array.isArray(item.signaturePlacements) && item.signaturePlacements.length > 0) {
                const hydratedPlacements = hydrateSignaturePlacements(
                    [...item.signaturePlacements].sort((a, b) => a.sortOrder - b.sortOrder)
                )
                setPlacements(hydratedPlacements.map(toSignaturePlacement))
            }
            toast.success(`PDF "${item.name}" dimuat dari server`)
        } catch (error) {
            console.error('Failed to load server PDF:', error)
            toast.error('Gagal memuat PDF dari server')
        }
    }, [hydrateSignaturePlacements, loadPdfFromBytes])

    const loadSignature = useCallback(async (file: File) => {
        try {
            setIsRemovingSignatureBg(true)
            setProcessProgress(10)
            setProcessLabel('Menyiapkan gambar TTD')

            const originalDataUrl = await fileToDataUrl(file)
            const originalHasTransparency = await imageHasTransparency(originalDataUrl)

            let dataUrl = originalDataUrl
            let mimeType = file.type || 'image/png'

            if (removeSignatureBackground && !originalHasTransparency) {
                setProcessProgress(35)
                setProcessLabel('Menghapus background TTD')

                const removedBackgroundBlob = await imglyRemoveBackground(file, {
                    publicPath: BACKGROUND_REMOVAL_PUBLIC_PATH,
                })

                dataUrl = await blobToDataUrl(removedBackgroundBlob)
                mimeType = removedBackgroundBlob.type || 'image/png'
                setProcessProgress(75)
            }

            const imageSize = await getImageDimensions(dataUrl)
            const signatureName = file.name.replace(/\.[^/.]+$/, '') || file.name
            const nextSignature: SignatureMeta = {
                id: crypto.randomUUID(),
                name: signatureName,
                fileName: file.name,
                dataUrl,
                mimeType,
                width: imageSize.width,
                height: imageSize.height,
                sourceType: 'upload',
                sourceId: null,
            }

            setSignatures((current) => [nextSignature, ...current])
            setActiveSignatureId(nextSignature.id)
            setSignatureLibraryName(signatureName)
            if (removeSignatureBackground && !originalHasTransparency) {
                toast.success('Background tanda tangan berhasil dihapus')
            } else if (originalHasTransparency) {
                toast.info('Gambar sudah transparan, background removal dilewati')
            } else {
                toast.info('Background removal dimatikan')
            }
            setProcessProgress(100)
            setProcessLabel('Selesai')
        } catch (error) {
            console.error('Failed to load signature:', error)
            try {
                setProcessProgress(35)
                const originalDataUrl = await fileToDataUrl(file)
                const imageSize = await getImageDimensions(originalDataUrl)
                const signatureName = file.name.replace(/\.[^/.]+$/, '') || file.name
                const nextSignature: SignatureMeta = {
                    id: crypto.randomUUID(),
                    name: signatureName,
                    fileName: file.name,
                    dataUrl: originalDataUrl,
                    mimeType: file.type || 'image/png',
                    width: imageSize.width,
                    height: imageSize.height,
                    sourceType: 'upload',
                    sourceId: null,
                }

                setSignatures((current) => [nextSignature, ...current])
                setActiveSignatureId(nextSignature.id)
                setSignatureLibraryName(signatureName)
                toast.warning('Background TTD gagal dihapus, pakai gambar asli dulu')
                setProcessProgress(100)
                setProcessLabel('Selesai')
            } catch (fallbackError) {
                console.error('Failed to load original signature fallback:', fallbackError)
                toast.error('Gagal memuat gambar tanda tangan')
            }
        } finally {
            setIsRemovingSignatureBg(false)
            window.setTimeout(() => {
                setProcessProgress(null)
                setProcessLabel('')
            }, 500)
        }
    }, [removeSignatureBackground])

    const saveCurrentSignatureToLibrary = async () => {
        if (!activeSignature) {
            toast.error('Belum ada TTD yang bisa disimpan')
            return
        }

        const name = signatureLibraryName.trim()
        if (!name) {
            toast.error('Nama TTD wajib diisi')
            return
        }

        try {
            const savedItem = await saveSignatureLibrary({
                name,
                mimeType: activeSignature.mimeType,
                dataUrl: activeSignature.dataUrl,
                width: activeSignature.width,
                height: activeSignature.height,
            })

            setSignatureLibrary((current) => [
                savedItem,
                ...current.filter((item) => item.id !== savedItem.id),
            ])
            toast.success('TTD sudah masuk library')
        } catch (error) {
            console.error('Failed to save signature library:', error)
            toast.error('Gagal menyimpan TTD ke library')
        }
    }

    const handleUseLibrarySignature = (item: SignatureLibraryItem) => {
        const signatureId = crypto.randomUUID()
        const nextSignature: SignatureMeta = {
            id: signatureId,
            name: item.name,
            fileName: `${item.name}.png`,
            dataUrl: item.dataUrl,
            mimeType: item.mimeType,
            width: item.width,
            height: item.height,
            sourceType: 'library',
            sourceId: item.id,
        }

        setSignatures((current) => [nextSignature, ...current])
        setActiveSignatureId(signatureId)
        setSignatureLibraryName(item.name)
        toast.success(`TTD "${item.name}" dipakai`)
    }

    const deleteLibrarySignature = async (id: string) => {
        try {
            await deleteSignatureLibrary(id)
            setSignatureLibrary((current) => current.filter((item) => item.id !== id))
            toast.success('TTD dihapus dari library')
        } catch (error) {
            console.error('Failed to delete signature library:', error)
            toast.error('Gagal menghapus TTD dari library')
        }
    }

    const renderActivePage = useCallback(async () => {
        if (!pdfBytes || !activePageInfo) return

        const renderToken = Date.now()
        pdfRenderTaskRef.current = renderToken

        try {
            const pdf = await pdfjsLib.getDocument({ data: clonePdfBytes(pdfBytes) }).promise
            const page = await pdf.getPage(activePageInfo.pageNumber)
            const canvas = canvasRef.current
            if (!canvas) return

            const viewport = page.getViewport({ scale: 1.6 * zoom })
            const context = canvas.getContext('2d')
            if (!context) return

            canvas.width = Math.floor(viewport.width)
            canvas.height = Math.floor(viewport.height)
            canvas.style.width = `${Math.floor(viewport.width)}px`
            canvas.style.height = `${Math.floor(viewport.height)}px`
            setRenderSize({ width: viewport.width, height: viewport.height })

            if (pdfRenderTaskRef.current !== renderToken) return

            await page.render({
                canvasContext: context,
                viewport,
            }).promise
        } catch (error) {
            console.error('Failed to render PDF pages:', error)
            toast.error('Gagal merender preview PDF')
        }
    }, [activePageInfo, pdfBytes, zoom])

    useEffect(() => {
        void renderActivePage()
    }, [renderActivePage])

    const clearAll = () => {
        setPdfFileName('')
        setPdfBytes(null)
        setPageInfos([])
        setSignatures([])
        setActiveSignatureId(null)
        setSignatureLibrarySearch('')
        setSignatureScale(DEFAULT_SIGNATURE_WIDTH_RATIO)
        setPlacements([])
        setActivePage(null)
        setPageThumbnails([])
        setZoom(1)
        setSelectedPdfSourceId(null)
    }

    const addPlacement = (pageNumber: number, xRatio: number, yRatio: number) => {
        if (!activeSignature) {
            toast.error('Upload gambar tanda tangan terlebih dahulu')
            return
        }

        setPlacements((current) => [
            ...current,
            {
                id: crypto.randomUUID(),
                pageNumber,
                signatureId: activeSignature.id,
                signatureDataUrl: activeSignature.dataUrl,
                xRatio,
                yRatio,
                scale: signatureScale,
                signatureName: activeSignature.name,
                signatureFileName: activeSignature.fileName,
                signatureMimeType: activeSignature.mimeType,
                signatureWidth: activeSignature.width,
                signatureHeight: activeSignature.height,
                signatureSourceType: activeSignature.sourceType,
                signatureSourceId: activeSignature.sourceId,
            },
        ])
        setActivePage(pageNumber)
    }

    const handleCanvasClick = (pageNumber: number, event: MouseEvent<HTMLCanvasElement>) => {
        if (!activeSignature) return

        const canvas = event.currentTarget
        const rect = canvas.getBoundingClientRect()
        const xRatio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
        const yRatio = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
        addPlacement(pageNumber, xRatio, yRatio)
    }

    const removePlacement = (id: string) => {
        setPlacements((current) => current.filter((item) => item.id !== id))
    }

    const updatePlacementPosition = useCallback((id: string, xRatio: number, yRatio: number) => {
        setPlacements((current) => current.map((item) => (
            item.id === id ? { ...item, xRatio, yRatio } : item
        )))
    }, [])

    const goToPage = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return
        setActivePage(pageNumber)
    }

    const handlePlacementPointerDown = useCallback((placement: SignaturePlacement) => (event: ReactPointerEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()

        if (!activePageInfo || !canvasRef.current) return

        dragPlacementIdRef.current = placement.id
        setActivePage(placement.pageNumber)

        const movePlacement = (pointerEvent: globalThis.PointerEvent) => {
            if (dragPlacementIdRef.current !== placement.id) return

            const canvas = canvasRef.current
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const xRatio = Math.min(1, Math.max(0, (pointerEvent.clientX - rect.left) / rect.width))
            const yRatio = Math.min(1, Math.max(0, (pointerEvent.clientY - rect.top) / rect.height))
            updatePlacementPosition(placement.id, xRatio, yRatio)
        }

        const stopDragging = () => {
            dragPlacementIdRef.current = null
            window.removeEventListener('pointermove', movePlacement)
            window.removeEventListener('pointerup', stopDragging)
        }

        window.addEventListener('pointermove', movePlacement)
        window.addEventListener('pointerup', stopDragging)
    }, [activePageInfo, updatePlacementPosition])

    const buildSignedPdfBlob = async (onProgress?: (progress: number, label: string) => void) => {
        if (!pdfBytes || pageInfos.length === 0) {
            toast.error('Upload PDF terlebih dahulu')
            return null
        }

        if (signatures.length === 0) {
            toast.error('Upload gambar tanda tangan terlebih dahulu')
            return null
        }

        try {
            onProgress?.(5, 'Menyiapkan PDF final')
            const sourcePdf = await pdfjsLib.getDocument({ data: clonePdfBytes(pdfBytes) }).promise
            const outputPdf = await PDFDocument.create()

            const exportScale = 2

            for (let index = 0; index < pageInfos.length; index += 1) {
                const pageInfo = pageInfos[index]
                const page = await sourcePdf.getPage(pageInfo.pageNumber)
                const viewport = page.getViewport({ scale: exportScale })
                const canvas = document.createElement('canvas')
                const context = canvas.getContext('2d')

                if (!context) {
                    throw new Error('Gagal menyiapkan canvas export PDF')
                }

                canvas.width = Math.floor(viewport.width)
                canvas.height = Math.floor(viewport.height)

                await page.render({
                    canvasContext: context,
                    viewport,
                }).promise

                const pagePlacements = placements.filter((item) => item.pageNumber === pageInfo.pageNumber)
                for (const placement of pagePlacements) {
                    const signatureDataUrl = placement.signatureDataUrl || signatureById.get(placement.signatureId)?.dataUrl
                    if (!signatureDataUrl) continue

                    const signatureImage = await loadImageElement(signatureDataUrl)
                    const signatureRatio = placement.signatureHeight / placement.signatureWidth

                    const displaySignatureWidth = viewport.width * placement.scale
                    const displaySignatureHeight = displaySignatureWidth * signatureRatio
                    const x = Math.min(
                        canvas.width - displaySignatureWidth,
                        Math.max(0, (placement.xRatio * canvas.width) - (displaySignatureWidth / 2))
                    )
                    const y = Math.min(
                        canvas.height - displaySignatureHeight,
                        Math.max(0, (placement.yRatio * canvas.height) - (displaySignatureHeight / 2))
                    )

                    context.drawImage(signatureImage, x, y, displaySignatureWidth, displaySignatureHeight)
                }

                const pageImage = await outputPdf.embedPng(canvasToPngBytes(canvas))
                const outputPage = outputPdf.addPage([pageInfo.width, pageInfo.height])
                outputPage.drawImage(pageImage, {
                    x: 0,
                    y: 0,
                    width: pageInfo.width,
                    height: pageInfo.height,
                })

                const progress = 20 + Math.round(((index + 1) / pageInfos.length) * 70)
                onProgress?.(progress, `Menyusun halaman ${index + 1} dari ${pageInfos.length}`)
            }

            onProgress?.(95, 'Membuat file PDF')
            const outputName = `${pdfFileName.replace(/\.pdf$/i, '')}_ttd.pdf`
            const blob = new Blob([await outputPdf.save()], { type: 'application/pdf' })

            return { blob, outputName }
        } catch (error) {
            console.error('Failed to export signed PDF:', error)
            toast.error('Gagal mengekspor PDF bertanda tangan')
            return null
        }
    }

    const exportSignedPdf = async () => {
        setIsExporting(true)
        setProcessProgress(0)
        setProcessLabel('Menyusun PDF bertanda tangan')

        try {
            const result = await buildSignedPdfBlob((progress, label) => {
                setProcessProgress(progress)
                setProcessLabel(label)
            })
            if (!result) return

            const { blob, outputName } = result
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = outputName
            link.click()
            window.setTimeout(() => URL.revokeObjectURL(url), 1000)
            toast.success('PDF bertanda tangan berhasil dibuat')
            setProcessProgress(100)
            setProcessLabel('Selesai')
        } finally {
            setIsExporting(false)
            window.setTimeout(() => {
                setProcessProgress(null)
                setProcessLabel('')
            }, 500)
        }
    }

    const saveSignedPdfToServer = async () => {
        setIsSavingSignedPdf(true)
        setProcessProgress(0)
        setProcessLabel('Menyimpan PDF ke server')

        try {
            const result = await buildSignedPdfBlob((progress, label) => {
                setProcessProgress(progress)
                setProcessLabel(label)
            })
            if (!result) return

            const file = new File([result.blob], result.outputName, {
                type: 'application/pdf',
            })

            await saveSignedToolPdf(file, {
                sourceId: selectedPdfSourceId,
                name: result.outputName.replace(/\.pdf$/i, ''),
                placements: placements.map((placement, index) => ({
                    signature_id: placement.signatureId,
                    page_number: placement.pageNumber,
                    x_ratio: placement.xRatio,
                    y_ratio: placement.yRatio,
                    scale: placement.scale,
                    sort_order: index,
                    signature_name: placement.signatureName,
                    signature_file_name: placement.signatureFileName,
                    signature_mime_type: placement.signatureMimeType,
                    signature_width: placement.signatureWidth,
                    signature_height: placement.signatureHeight,
                    signature_data_url: placement.signatureDataUrl,
                    signature_source_type: placement.signatureSourceType,
                    signature_source_id: placement.signatureSourceId,
                })),
            })

            const refreshed = await getToolPdfs({ kind: 'all' })
            setPdfLibrary(refreshed)
            toast.success('PDF bertanda tangan disimpan ke server')
            setProcessProgress(100)
            setProcessLabel('Selesai')
        } catch (error) {
            console.error('Failed to save signed PDF:', error)
            toast.error('Gagal menyimpan PDF bertanda tangan ke server')
        } finally {
            setIsSavingSignedPdf(false)
            window.setTimeout(() => {
                setProcessProgress(null)
                setProcessLabel('')
            }, 500)
        }
    }

    return (
        <div className="space-y-6">
            {processProgress !== null && (
                <div className="border-[3px] border-[#111111] bg-[#FFFFFF] p-3 shadow-[6px_6px_0_0_#111111]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-black uppercase tracking-[0.18em]">
                            {processLabel || 'Lagi proses'}
                        </div>
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#111111]/60">
                            {Math.min(100, Math.max(0, processProgress))}%
                        </div>
                    </div>
                    <div className="mt-3 h-4 border-[3px] border-[#111111] bg-[#FFF7E8]">
                        <div
                            className="h-full bg-[#2ECC71] transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, processProgress))}%` }}
                        />
                    </div>
                </div>
            )}

            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[6px_6px_0_0_#111111]">
                    <div className="space-y-3">
                        <label className="block text-sm font-black uppercase tracking-[0.2em]">
                            1. Muat PDF
                        </label>
                        <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(event) => {
                                const file = event.target.files?.[0]
                                if (file) void loadPdf(file)
                            }}
                            className="block w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-3 text-sm font-bold file:mr-4 file:border-0 file:bg-[#FFB703] file:px-4 file:py-2 file:font-black file:text-[#111111]"
                        />
                        <div className="border-[3px] border-[#111111] bg-[#FFFFFF] p-4 shadow-[3px_3px_0_0_#111111]">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="text-sm font-black uppercase tracking-[0.2em]">
                                        Pilih PDF tersimpan
                                    </div>
                                    <p className="mt-1 text-xs font-bold text-[#111111]/70">
                                        Ambil file dari server tanpa upload ulang.
                                    </p>
                                </div>
                                <div className="text-xs font-bold text-[#111111]/70">
                                    {isLoadingPdfLibrary ? 'Lagi muat...' : `${pdfLibrary.length} file`}
                                </div>
                            </div>

                            <input
                                type="text"
                                value={pdfLibrarySearch}
                                onChange={(event) => setPdfLibrarySearch(event.target.value)}
                                placeholder="Cari PDF tersimpan..."
                                className="mt-3 block w-full border-[3px] border-[#111111] bg-[#FFF7E8] px-4 py-3 text-sm font-bold outline-none focus:bg-[#8ECAE6]"
                            />

                            {isLoadingPdfLibrary ? (
                                <div className="mt-3 border-[3px] border-dashed border-[#111111] bg-[#FFF7E8] p-4 text-sm font-bold text-[#111111]/70">
                                    Lagi memuat PDF tersimpan...
                                </div>
                            ) : filteredPdfLibrary.length === 0 ? (
                                <div className="mt-3 border-[3px] border-dashed border-[#111111] bg-[#FFF7E8] p-4 text-sm font-bold text-[#111111]/70">
                                    Belum ada file tersimpan, atau pencariannya belum cocok.
                                </div>
                            ) : (
                                <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
                                    {filteredPdfLibrary.map((item) => {
                                        const isSelected = selectedPdfSourceId === item.id

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => void loadPdfFromLibrary(item)}
                                                className={`block w-full border-[3px] border-[#111111] p-3 text-left shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] ${
                                                    isSelected ? 'bg-[#FFB703]' : 'bg-[#FFFFFF]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <div className="text-sm font-black">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs font-bold text-[#111111]/60">
                                                            {item.originalFilename ?? 'PDF tersimpan'}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                                            {isSelected ? 'Aktif' : 'Pilih'}
                                                        </div>
                                                        <div className={`border-[3px] border-[#111111] px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${item.kind === 'signed' ? 'bg-[#2ECC71]' : 'bg-[#8ECAE6]'}`}>
                                                            {getPdfKindLabel(item.kind)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                        <label className="block text-sm font-black uppercase tracking-[0.2em]">
                                2. Muat TTD
                            </label>
                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={(event) => {
                                    const file = event.target.files?.[0]
                                    if (file) void loadSignature(file)
                                }}
                                disabled={isRemovingSignatureBg}
                                className="block w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-3 text-sm font-bold file:mr-4 file:border-0 file:bg-[#8ECAE6] file:px-4 file:py-2 file:font-black file:text-[#111111]"
                            />
                            <label className="flex items-center gap-3 border-[3px] border-[#111111] bg-[#FFF7E8] px-4 py-3 shadow-[3px_3px_0_0_#111111]">
                                <input
                                    type="checkbox"
                                    checked={removeSignatureBackground}
                                    onChange={(event) => setRemoveSignatureBackground(event.target.checked)}
                                    className="h-5 w-5 accent-[#111111]"
                                />
                                <span className="text-sm font-black uppercase tracking-[0.16em]">
                                    Remove BG
                                </span>
                            </label>
                            {isRemovingSignatureBg && (
                                <div className="border-[3px] border-[#111111] bg-[#FFB703] px-4 py-3 text-sm font-black shadow-[3px_3px_0_0_#111111]">
                                    Lagi hapus background TTD...
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="block text-sm font-black uppercase tracking-[0.2em]">
                                    Nama TTD
                                </label>
                                <input
                                    type="text"
                                    value={signatureLibraryName}
                                    onChange={(event) => setSignatureLibraryName(event.target.value)}
                                    placeholder="Contoh: TTD Direktur"
                                    className="block w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-3 text-sm font-bold outline-none focus:bg-[#8ECAE6]"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={saveCurrentSignatureToLibrary}
                                disabled={!activeSignature}
                                className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#2ECC71] px-4 py-3 text-sm font-black shadow-[6px_6px_0_0_#111111] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Simpan ke Library
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-black uppercase tracking-[0.2em]">
                                3. Pilih & Ukuran TTD
                            </label>
                            <input
                                type="range"
                                min="0.12"
                                max="0.35"
                                step="0.01"
                                value={signatureScale}
                                onChange={(event) => setSignatureScale(Number(event.target.value))}
                                className="w-full accent-[#111111]"
                            />
                            <div className="text-sm font-bold">
                                Lebar TTD: {(signatureScale * 100).toFixed(0)}% dari lebar halaman
                            </div>
                            {signatures.length === 0 ? (
                                <div className="border-[3px] border-dashed border-[#111111] bg-[#FFFFFF] p-3 text-sm font-bold text-[#111111]/70">
                                    Belum ada TTD yang dimuat.
                                </div>
                            ) : (
                                <div className="max-h-44 space-y-2 overflow-auto pr-1">
                                    {signatures.map((item) => {
                                        const isActive = item.id === activeSignatureId

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    setActiveSignatureId(item.id)
                                                    setSignatureLibraryName(item.name)
                                                }}
                                                className={`flex w-full items-center gap-3 border-[3px] border-[#111111] p-2 text-left shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px] ${
                                                    isActive ? 'bg-[#FFB703]' : 'bg-[#FFFFFF]'
                                                }`}
                                            >
                                                <img
                                                    src={item.dataUrl}
                                                    alt={item.name}
                                                    className="h-10 w-16 border-[3px] border-[#111111] bg-[#FFF7E8] object-contain"
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-black">{item.name}</span>
                                                    <span className="block truncate text-xs font-bold text-[#111111]/60">
                                                        {isActive ? 'Aktif untuk klik berikutnya' : item.fileName}
                                                    </span>
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={exportSignedPdf}
                            disabled={!pdfBytes || signatures.length === 0 || isExporting}
                            className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFB703] px-4 py-3 font-black shadow-[6px_6px_0_0_#111111] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Download PDF Bertanda Tangan
                        </button>

                        <button
                            type="button"
                            onClick={saveSignedPdfToServer}
                            disabled={!pdfBytes || signatures.length === 0 || isSavingSignedPdf}
                            className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#2ECC71] px-4 py-3 font-black shadow-[6px_6px_0_0_#111111] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSavingSignedPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            Simpan ke Server
                        </button>

                        <button
                            type="button"
                            onClick={clearAll}
                            className="inline-flex items-center gap-2 border-[3px] border-[#111111] bg-[#EF233C] px-4 py-3 font-black text-[#FFFFFF] shadow-[6px_6px_0_0_#111111] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                        >
                            <Trash2 className="h-4 w-4" />
                            Reset Grid
                        </button>
                    </div>
                </div>

                <div className="border-[3px] border-[#111111] bg-[#8ECAE6] p-4 shadow-[6px_6px_0_0_#111111]">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em]">
                        <MousePointerClick className="h-4 w-4" />
                        Panduan Singkat
                    </div>
                    <ol className="mt-3 space-y-2 text-sm font-bold leading-6">
                        <li>1. Muat PDF baru atau pilih satu dari server.</li>
                        <li>2. Upload gambar tanda tangan digital, paling enak kalau PNG transparan.</li>
                        <li>3. Klik halaman buat naro tanda tangan.</li>
                        <li>4. Download hasilnya atau simpan ke server.</li>
                    </ol>
                    <div className="mt-4 border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[3px_3px_0_0_#111111]">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em]">
                            <Check className="h-4 w-4" />
                            Status Sistem
                        </div>
                        <div className="mt-2 text-sm font-bold">
                            {pdfFileName ? `PDF: ${pdfFileName}` : 'Belum ada PDF yang dimuat'}
                        </div>
                        <div className="mt-1 text-sm font-bold">
                            {activeSignature ? `TTD aktif: ${activeSignature.name}` : 'Belum ada TTD yang dimuat'}
                        </div>
                        <div className="mt-1 text-sm font-bold">
                            {signatures.length} TTD dimuat
                        </div>
                        <div className="mt-1 text-sm font-bold">
                            {selectedPdfSourceId ? 'Sumber PDF: server' : 'Sumber PDF: upload lokal'}
                        </div>
                        <div className="mt-1 text-sm font-bold">
                            {placements.length} TTD terpasang
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                <div className="border-[3px] border-[#111111] bg-[#FFFFFF] p-4 shadow-[6px_6px_0_0_#111111]">
                    <div className="flex flex-col gap-2 border-b-[3px] border-[#111111] pb-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-[0.06em]">Pratinjau PDF</h2>
                            <p className="text-sm font-bold text-[#111111]/70">
                                Satu halaman per kartu. Pakai pagination atau thumbnail buat lompat halaman.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className={`border-[3px] border-[#111111] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0_0_#111111] ${
                                activePageOrientation === 'Landscape'
                                    ? 'bg-[#8ECAE6]'
                                    : activePageOrientation === 'Portrait'
                                        ? 'bg-[#2ECC71]'
                                        : 'bg-[#FFF7E8]'
                            }`}>
                                {activePageOrientation ?? 'No page'}
                            </div>

                            <div className="flex items-center gap-2 border-[3px] border-[#111111] bg-[#FFF7E8] px-2 py-2 shadow-[3px_3px_0_0_#111111]">
                                <button
                                    type="button"
                                    onClick={() => setZoom((current) => Math.max(0.2, Number((current - 0.05).toFixed(2))))}
                                    disabled={zoom <= 0.2}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 text-xs font-black transition active:translate-x-[2px] active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    -5%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoom(0.8)}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 text-xs font-black transition active:translate-x-[2px] active:translate-y-[2px]"
                                >
                                    80%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoom(1)}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#8ECAE6] px-3 py-2 text-xs font-black transition active:translate-x-[2px] active:translate-y-[2px]"
                                >
                                    100%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoom(1.25)}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 text-xs font-black transition active:translate-x-[2px] active:translate-y-[2px]"
                                >
                                    125%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setZoom((current) => Math.min(2, Number((current + 0.05).toFixed(2))))}
                                    disabled={zoom >= 2}
                                    className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 text-xs font-black transition active:translate-x-[2px] active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    +5%
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => goToPage((activePageInfo?.pageNumber ?? 1) - 1)}
                                disabled={!activePageInfo || activePageInfo.pageNumber <= 1}
                                className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 text-xs font-black transition active:translate-x-[2px] active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Sebelumnya
                            </button>

                            <div className="min-w-20 border-[3px] border-[#111111] bg-[#FFB703] px-3 py-2 text-center text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0_0_#111111]">
                                {activePageInfo ? `${activePageInfo.pageNumber}/${totalPages}` : '0/0'}
                            </div>

                            <button
                                type="button"
                                onClick={() => goToPage((activePageInfo?.pageNumber ?? 0) + 1)}
                                disabled={!activePageInfo || activePageInfo.pageNumber >= totalPages}
                                className="inline-flex items-center gap-1 border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 text-xs font-black transition active:translate-x-[2px] active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Berikutnya
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#111111]/70">
                        <span className="border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 shadow-[3px_3px_0_0_#111111]">
                            Zoom {zoomPercent}%
                        </span>
                            <span className="border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 shadow-[3px_3px_0_0_#111111]">
                                Klik canvas buat naro TTD
                            </span>
                            <span className="border-[3px] border-[#111111] bg-[#FFF7E8] px-3 py-2 shadow-[3px_3px_0_0_#111111]">
                                Scroll buat geser preview
                            </span>
                        </div>

                    <div className="mt-4">
                        {isLoadingPdf ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : !activePageInfo ? (
                            <div className="flex min-h-[320px] items-center justify-center border-[3px] border-dashed border-[#111111] bg-[#FFF7E8] p-6 text-center">
                                <div>
                                    <FileText className="mx-auto h-12 w-12" />
                                        <p className="mt-3 text-lg font-black">Belum ada PDF</p>
                                        <p className="mt-1 text-sm font-bold text-[#111111]/70">
                                            Muat PDF dulu buat mulai naro TTD.
                                        </p>
                                </div>
                            </div>
                        ) : (
                            <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[6px_6px_0_0_#111111]">
                                <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm font-black uppercase tracking-[0.2em]">
                                        Halaman {activePageInfo.pageNumber}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#111111]/70">
                                        <span className="border-[3px] border-[#111111] bg-[#FFFFFF] px-3 py-2 shadow-[3px_3px_0_0_#111111]">
                                            {activePageOrientation}
                                        </span>
                                        <span>
                                            Klik canvas buat naro TTD. Geser pakai scroll, trackpad, atau scrollbar.
                                        </span>
                                    </div>
                              </div>

                                <div
                                    ref={previewScrollRef}
                                    className="relative w-full overflow-auto border-[3px] border-[#111111] bg-[#FFFFFF] shadow-[3px_3px_0_0_#111111]"
                                    style={{ maxHeight: '75vh' }}
                                >
                                    <div className="relative w-max">
                                        <canvas
                                            ref={canvasRef}
                                            onClick={(event) => handleCanvasClick(activePageInfo.pageNumber, event)}
                                            className="block cursor-crosshair"
                                        />

                                        {activePlacements.map((placement) => {
                                            const placementSignature = signatureById.get(placement.signatureId)
                                            const placementDataUrl = placement.signatureDataUrl || placementSignature?.dataUrl
                                            if (!placementDataUrl) return null

                                            const previewWidth = renderSize.width || activePageInfo.width
                                            const previewHeight = renderSize.height || activePageInfo.height
                                            const ratio = placement.signatureHeight / placement.signatureWidth
                                            const width = Math.round(previewWidth * placement.scale)
                                            const height = Math.round(width * ratio)
                                            const left = Math.round(placement.xRatio * previewWidth - width / 2)
                                            const top = Math.round(placement.yRatio * previewHeight - height / 2)

                                            return (
                                                <div
                                                    key={placement.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onPointerDown={handlePlacementPointerDown(placement)}
                                                    onDoubleClick={() => removePlacement(placement.id)}
                                                    title="Drag buat geser. Klik dua kali buat hapus."
                                                    className="absolute cursor-grab select-none border-[3px] border-[#111111] bg-transparent shadow-[3px_3px_0_0_#111111] transition hover:bg-[#FFF7E8]/50 active:cursor-grabbing"
                                                    style={{
                                                        left: `${Math.max(0, left)}px`,
                                                        top: `${Math.max(0, top)}px`,
                                                        width: `${Math.max(60, width)}px`,
                                                        height: `${Math.max(24, height)}px`,
                                                        touchAction: 'none',
                                                    }}
                                                >
                                                    <img
                                                        src={placementDataUrl}
                                                        alt={`Pratinjau ${placement.signatureName}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                    <div className="absolute -left-3 -top-3 border-[3px] border-[#111111] bg-[#FFB703] p-1 shadow-[3px_3px_0_0_#111111]">
                                                        <GripVertical className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {pageThumbnails.length > 0 && (
                        <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-3 shadow-[6px_6px_0_0_#111111]">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="text-sm font-black uppercase tracking-[0.2em]">
                                      Thumbnail Halaman
                              </div>
                              <div className="text-xs font-bold text-[#111111]/70">
                                      Klik thumbnail buat pindah halaman
                              </div>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {pageThumbnails.map((thumb) => {
                                    const isActive = thumb.pageNumber === activePage
                                    return (
                                        <button
                                            key={thumb.pageNumber}
                                            type="button"
                                            onClick={() => setActivePage(thumb.pageNumber)}
                                            className={`shrink-0 border-[3px] border-[#111111] p-2 text-left shadow-[3px_3px_0_0_#111111] transition ${isActive ? 'bg-[#FFB703]' : 'bg-[#FFFFFF]'}`}
                                        >
                                            <img
                                                src={thumb.dataUrl}
                                                alt={`Thumbnail halaman ${thumb.pageNumber}`}
                                                className="h-24 w-16 object-contain"
                                            />
                                            <div className="mt-2 text-center text-xs font-black uppercase tracking-[0.18em]">
                                                {thumb.pageNumber}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="border-[3px] border-[#111111] bg-[#FFFFFF] p-4 shadow-[6px_6px_0_0_#111111]">
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em]">
                            <ImagePlus className="h-4 w-4" />
                            Pratinjau TTD
                        </div>

                        {activeSignature ? (
                            <div
                                className="mt-4 border-[3px] border-[#111111] p-4 shadow-[3px_3px_0_0_#111111]"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(45deg, #E5E5E5 25%, transparent 25%), linear-gradient(-45deg, #E5E5E5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E5E5E5 75%), linear-gradient(-45deg, transparent 75%, #E5E5E5 75%)',
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                                }}
                            >
                                <img
                                    src={activeSignature.dataUrl}
                                    alt={`Pratinjau ${activeSignature.name}`}
                                    className="max-h-48 w-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="mt-4 border-[3px] border-dashed border-[#111111] bg-[#FFF7E8] p-4 text-sm font-bold text-[#111111]/70">
                                Upload gambar tanda tangan buat lihat pratinjau.
                            </div>
                        )}
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#FFF7E8] p-4 shadow-[6px_6px_0_0_#111111]">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-black uppercase tracking-[0.2em]">
                                Library TTD
                            </div>
                            <div className="text-xs font-bold text-[#111111]/70">
                                {isLoadingLibrary ? 'Lagi muat...' : `${signatureLibrary.length} tersimpan`}
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-black uppercase tracking-[0.2em]">
                                Cari TTD
                            </label>
                            <input
                                type="text"
                                value={signatureLibrarySearch}
                                onChange={(event) => setSignatureLibrarySearch(event.target.value)}
                                placeholder="Cari nama TTD..."
                                className="block w-full border-[3px] border-[#111111] bg-[#FFFFFF] px-4 py-3 text-sm font-bold outline-none focus:bg-[#8ECAE6]"
                            />
                        </div>

                        {isLoadingLibrary ? (
                            <div className="mt-4 border-[3px] border-dashed border-[#111111] bg-[#FFFFFF] p-4 text-sm font-bold text-[#111111]/70">
                                Lagi memuat TTD dari server...
                            </div>
                        ) : signatureLibrary.length === 0 ? (
                            <div className="mt-4 border-[3px] border-dashed border-[#111111] bg-[#FFFFFF] p-4 text-sm font-bold text-[#111111]/70">
                                Belum ada TTD tersimpan. Upload satu, lalu simpan biar bisa dipakai lagi.
                            </div>
                        ) : filteredSignatureLibrary.length === 0 ? (
                            <div className="mt-4 border-[3px] border-dashed border-[#111111] bg-[#FFFFFF] p-4 text-sm font-bold text-[#111111]/70">
                                Gak ada TTD yang cocok sama pencarian ini.
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {filteredSignatureLibrary.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border-[3px] border-[#111111] bg-[#FFFFFF] p-3 shadow-[3px_3px_0_0_#111111]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleUseLibrarySignature(item)}
                                                className="flex-1 text-left"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <div className="text-sm font-black">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs font-bold text-[#111111]/60">
                                                            Klik buat pakai TTD ini
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]/60">
                                                        Pilih
                                                    </div>
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteLibrarySignature(item.id)}
                                                className="border-[3px] border-[#111111] bg-[#EF233C] px-3 py-2 text-xs font-black text-[#FFFFFF] shadow-[3px_3px_0_0_#111111] transition active:translate-x-[2px] active:translate-y-[2px]"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#FFB703] p-4 shadow-[6px_6px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em]">Jumlah Penempatan</div>
                        <div className="mt-2 text-3xl font-black">{placements.length}</div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            Klik halaman aktif buat naro TTD. Klik dua kali pada TTD buat hapus.
                        </p>
                    </div>

                    <div className="border-[3px] border-[#111111] bg-[#8ECAE6] p-4 shadow-[6px_6px_0_0_#111111]">
                        <div className="text-sm font-black uppercase tracking-[0.2em]">Panduan File</div>
                        <p className="mt-2 text-sm font-bold leading-6">
                            PNG transparan paling aman buat TTD digital. Kalau pakai JPG, pastikan latarnya bersih.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
