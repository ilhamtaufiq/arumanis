import { useEffect, useState } from 'react'

/**
 * Load file info (size + PDF page count) from a URL.
 * - size: fetched via HEAD/GET content-length when not provided
 * - page_count: parsed from PDF via pdfjs-dist
 */
export function useFileInfo(url: string, ext: string, providedSize?: number | null) {
    const [size, setSize] = useState<number | null>(providedSize ?? null)
    const [pageCount, setPageCount] = useState<number | null>(null)

    useEffect(() => {
        let cancelled = false
        setPageCount(null)
        if (providedSize != null) setSize(providedSize)

        // Page count only for PDF
        if (ext !== 'pdf') return

        let task: { destroy: () => void } | null = null
        ;(async () => {
            try {
                const pdfjs = await import('pdfjs-dist')
                try {
                    task = await pdfjs.getDocument({ url, disableWorker: true }).promise
                } catch {
                    task = await pdfjs.getDocument(url).promise
                }
                if (!cancelled) setPageCount(task.numPages)
            } catch {
                // ignore — page count unavailable
            }
        })()

        return () => {
            cancelled = true
            task?.destroy?.()
        }
    }, [url, ext, providedSize])

    return { size, pageCount }
}
