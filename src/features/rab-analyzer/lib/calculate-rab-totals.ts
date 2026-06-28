import type { RabAnalysisResult, RabAnalyzedItem, RabParsedItem } from '../types'
import { RAB_PPN_RATE } from '../types'

export function analyzeRabItems(parsedItems: RabParsedItem[]): RabAnalysisResult {
    const warnings: string[] = []

    if (parsedItems.length === 0) {
        warnings.push('Tidak ada item pekerjaan yang terdeteksi. Pastikan data disalin langsung dari Excel (bukan screenshot).')
    }

    const items: RabAnalyzedItem[] = parsedItems.map((item) => {
        const jumlah = item.volume * item.hargaSatuan
        const ppn = jumlah * RAB_PPN_RATE
        const total = jumlah + ppn

        return {
            ...item,
            jumlah,
            ppn,
            total,
        }
    })

    const subtotalDpp = items.reduce((sum, item) => sum + item.jumlah, 0)
    const totalPpn = items.reduce((sum, item) => sum + item.ppn, 0)
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0)

    return {
        items,
        summary: {
            subtotalDpp,
            totalPpn,
            grandTotal,
            itemCount: items.length,
        },
        warnings,
    }
}