import type { PDFDocumentProxy } from 'pdfjs-dist'

type PdfJs = typeof import('pdfjs-dist')

let pdfjsPromise: Promise<PdfJs> | null = null

/** Muat pdf.js sekali, dengan worker dari Vite seperti di parser RAB. */
function loadPdfJs(): Promise<PdfJs> {
    if (!pdfjsPromise) {
        pdfjsPromise = (async () => {
            const pdfjsLib = await import('pdfjs-dist')
            try {
                const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
                pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default
            } catch {
                // Worker opsional di sebagian lingkungan.
            }
            return pdfjsLib
        })()
    }
    return pdfjsPromise
}

/** Cache dokumen per sumber supaya setiap PDF hanya diurai sekali. */
const dokumenPerSumber = new Map<string, Promise<PDFDocumentProxy>>()

export function bukaDokumenPdf(sumberId: string, bytes: ArrayBuffer): Promise<PDFDocumentProxy> {
    let dokumen = dokumenPerSumber.get(sumberId)
    if (!dokumen) {
        // Salin buffer: pdf.js mengambil alih data yang diberikan.
        dokumen = loadPdfJs().then((pdfjsLib) =>
            pdfjsLib.getDocument({ data: new Uint8Array(bytes.slice(0)), useSystemFonts: true }).promise,
        )
        dokumenPerSumber.set(sumberId, dokumen)
    }
    return dokumen
}

/** Render satu halaman menjadi data URL JPEG kecil untuk pratinjau. */
export async function renderThumbnail(
    sumberId: string,
    bytes: ArrayBuffer,
    halamanNol: number,
    lebarPx = 160,
): Promise<string> {
    const dokumen = await bukaDokumenPdf(sumberId, bytes)
    const halaman = await dokumen.getPage(halamanNol + 1)
    const dasar = halaman.getViewport({ scale: 1 })
    const viewport = halaman.getViewport({ scale: lebarPx / dasar.width })

    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas tidak tersedia.')
    await halaman.render({ canvasContext: ctx, viewport }).promise
    return canvas.toDataURL('image/jpeg', 0.8)
}
