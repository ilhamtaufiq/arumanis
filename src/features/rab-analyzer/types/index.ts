export type RabParsedItem = {
    grup: string
    uraian: string
    satuan: string
    volume: number
    hargaSatuan: number
}

export type RabAnalyzedItem = RabParsedItem & {
    jumlah: number
    ppn: number
    total: number
}

export type RabAnalysisResult = {
    items: RabAnalyzedItem[]
    summary: {
        subtotalDpp: number
        totalPpn: number
        grandTotal: number
        itemCount: number
    }
    warnings: string[]
    /** Total rekap di berkas dan selisihnya dengan rincian. Null bila berkas tidak punya rekap (teks tempel). */
    rekap?: { jumlah: number; selisih: number } | null
}

export const RAB_PPN_RATE = 0.11